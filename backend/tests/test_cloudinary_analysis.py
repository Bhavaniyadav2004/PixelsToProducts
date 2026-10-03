import json
import unittest
from unittest.mock import patch
from types import SimpleNamespace

import httpx

from app.services import ai_service
from app.services import verification_service
from app.routers import verification
from fastapi import HTTPException
from unittest.mock import MagicMock


class CloudinaryAnalysisTests(unittest.TestCase):
    def setUp(self):
        self.config = patch.multiple(ai_service.settings, CLOUDINARY_CLOUD_NAME="test-cloud",
                                     CLOUDINARY_API_KEY="test-key", CLOUDINARY_API_SECRET="test-secret")
        self.config.start()
        self.addCleanup(self.config.stop)
        self.url = "https://res.cloudinary.com/test-cloud/image/upload/road.jpg"
        self.valid = dict(issue_type="POTHOLE", severity="HIGH", confidence=0.8, description="Visible road damage")

    def response(self, status=200, body=None):
        return httpx.Response(status, json=body, request=httpx.Request("POST", "https://api.cloudinary.com/test"))

    def analyze_response(self, value):
        return self.response(body={"data": {"analysis": {"responses": [{"value": value}]}}})

    def test_success(self):
        with patch.object(ai_service.httpx, "post", return_value=self.analyze_response(json.dumps(self.valid))) as post:
            result, meta = ai_service.analyze_image(self.url)
        self.assertEqual(result.issue_type, "POTHOLE")
        self.assertEqual(meta["source"], "cloudinary_ai_vision")
        self.assertEqual(post.call_args.kwargs["auth"], ("test-key", "test-secret"))
        self.assertEqual(post.call_args.kwargs["json"]["source"], {"uri": self.url})
        self.assertIn("ai_vision_general", post.call_args.args[0])

    def test_invalid_output(self):
        variants = ["not json", "[]", json.dumps({}), json.dumps({**self.valid, "issue_type": "ALIEN"}),
                    json.dumps({**self.valid, "severity": "EXTREME"}), json.dumps({**self.valid, "confidence": 2}),
                    json.dumps({**self.valid, "confidence": True})]
        for value in variants:
            with self.subTest(value=value), patch.object(ai_service.httpx, "post", return_value=self.analyze_response(value)):
                with self.assertRaises(ai_service.AnalysisUnavailable):
                    ai_service.analyze_image(self.url)

    def test_missing_response(self):
        with patch.object(ai_service.httpx, "post", return_value=self.response(body={})), self.assertRaises(ai_service.AnalysisUnavailable):
            ai_service.analyze_image(self.url)

    def test_http_failures_are_sanitized(self):
        for status in (401, 403, 420, 429, 500):
            with self.subTest(status=status), patch.object(ai_service.httpx, "post", return_value=self.response(status, {"error": "secret"})):
                with self.assertRaises(ai_service.AnalysisUnavailable) as caught:
                    ai_service.analyze_image(self.url)
                self.assertNotIn("secret", str(caught.exception))

    def test_timeout(self):
        with patch.object(ai_service.httpx, "post", side_effect=httpx.ReadTimeout("secret")), self.assertRaises(ai_service.AnalysisUnavailable):
            ai_service.analyze_image(self.url)

    def test_route_failure_does_not_save_analysis(self):
        database = MagicMock()
        database.get.return_value = SimpleNamespace(uploaded_by=1, media_type="image", cloudinary_url=self.url, cloudinary_public_id="road")
        with patch.object(ai_service, "analyze_image", side_effect=ai_service.AnalysisUnavailable("Classify manually")):
            with self.assertRaises(HTTPException) as caught:
                verification.analyze(1, database, SimpleNamespace(id=1, role="CITIZEN"))
        self.assertEqual(caught.exception.status_code, 503)
        database.add.assert_not_called()
        database.commit.assert_not_called()

    def test_video_without_thumbnail(self):
        database = MagicMock()
        database.get.return_value = SimpleNamespace(uploaded_by=1, media_type="video", thumbnail_url=None)
        with self.assertRaises(HTTPException) as caught:
            verification.analyze(1, database, SimpleNamespace(id=1, role="CITIZEN"))
        self.assertEqual(caught.exception.status_code, 400)

    def test_verification_unavailable_requires_review_even_if_citizen_agrees(self):
        with patch.object(ai_service.settings, "CLOUDINARY_API_KEY", ""):
            result, meta = ai_service.verify_repair(self.url, self.url)
        self.assertEqual(meta["source"], "unavailable")
        self.assertEqual(result.confidence, 0)
        media = SimpleNamespace(media_type="image", cloudinary_url=self.url)
        incident = SimpleNamespace(id=1, verifications=[])
        with patch.object(verification_service, "pick_before_after", return_value=(media, media)), \
             patch.object(ai_service, "verify_repair", return_value=(result, meta)), \
             patch.object(verification_service, "add_event"), \
             patch.object(verification_service, "set_status") as status, \
             patch.object(verification_service.priority_service, "refresh"):
            outcome = verification_service.run_ai_verification(MagicMock(), incident)
            self.assertEqual(outcome.ai_result, "REQUIRES_REVIEW")
            outcome.citizen_result = "YES"
            verification_service.finalize(MagicMock(), incident, outcome)
            self.assertEqual(outcome.final_status, "REQUIRES_REVIEW")
            status.assert_called_with(unittest.mock.ANY, incident, "REQUIRES_REVIEW")

    def test_failed_repair_escalates_to_admin_even_if_citizen_agrees(self):
        incident = SimpleNamespace(id=1)
        outcome = SimpleNamespace(ai_result="FAILED", citizen_result="YES", final_status=None)
        with patch.object(verification_service, "set_status") as status, \
             patch.object(verification_service, "add_event") as event, \
             patch.object(verification_service.priority_service, "refresh"):
            verification_service.finalize(MagicMock(), incident, outcome)
            status.assert_called_with(unittest.mock.ANY, incident, "REQUIRES_REVIEW")
            self.assertEqual(outcome.final_status, "REQUIRES_REVIEW")
            self.assertEqual(event.call_args.args[2], "REVIEW")

    def test_successful_repair_requires_citizen_confirmation(self):
        incident = SimpleNamespace(id=1)
        outcome = SimpleNamespace(ai_result="VERIFIED", citizen_result=None, final_status=None)
        with patch.object(verification_service, "set_status") as status, \
             patch.object(verification_service, "add_event"), \
             patch.object(verification_service.priority_service, "refresh"):
            verification_service.finalize(MagicMock(), incident, outcome)
            status.assert_called_with(unittest.mock.ANY, incident, "AWAITING_VERIFICATION")
            outcome.citizen_result = "YES"
            verification_service.finalize(MagicMock(), incident, outcome)
            status.assert_called_with(unittest.mock.ANY, incident, "RESOLVED")

    def test_repair_uses_cloudinary_without_external_key(self):
        raw = dict(comparable=True, improvement_detected=True, remaining_damage=False, confidence=0.9, summary="Damage repaired")
        after_url = self.url.replace("road.jpg", "repaired.jpg")
        with patch.object(ai_service.settings, "AI_API_KEY", ""), \
             patch.object(ai_service.httpx, "post", return_value=self.analyze_response(json.dumps(raw))) as post:
            result, meta = ai_service.verify_repair(self.url, after_url)
        self.assertTrue(result.improvement_detected)
        self.assertEqual(meta["source"], "cloudinary_ai_vision")
        self.assertTrue(meta["comparable"])
        payload = post.call_args.kwargs["json"]
        self.assertIn("/image/fetch/", payload["source"]["uri"])
        self.assertIn("l_fetch:", payload["source"]["uri"])
        self.assertIn("g_east", payload["source"]["uri"])
        self.assertIn("LEFT", payload["prompts"][0])
        self.assertEqual(post.call_args.kwargs["auth"], ("test-key", "test-secret"))

    def test_repair_invalid_response_requires_review(self):
        raw = dict(comparable=True, improvement_detected=True, remaining_damage=False, confidence=0.9, summary="Repaired")
        for value in ["invalid", json.dumps({**raw, "comparable": "true"}),
                      json.dumps({**raw, "confidence": 2}), json.dumps({**raw, "confidence": True}),
                      json.dumps({**raw, "improvement_detected": "false"}), json.dumps({**raw, "summary": ""})]:
            with self.subTest(value=value), patch.object(ai_service.httpx, "post", return_value=self.analyze_response(value)):
                result, meta = ai_service.verify_repair(self.url, self.url)
            self.assertEqual(meta["source"], "unavailable")
            self.assertEqual(result.confidence, 0)

    def test_repair_provider_failure_and_private_sources(self):
        for status in (403, 429, 500):
            with self.subTest(status=status), patch.object(ai_service.httpx, "post", return_value=self.response(status, {"error": "secret"})):
                result, meta = ai_service.verify_repair(self.url, self.url)
            self.assertEqual(meta["source"], "unavailable")
            self.assertNotIn("secret", result.summary)
        with patch.object(ai_service.httpx, "post", side_effect=httpx.ReadTimeout("secret")):
            self.assertEqual(ai_service.verify_repair(self.url, self.url)[1]["source"], "unavailable")
        with patch.object(ai_service.httpx, "post") as post:
            self.assertEqual(ai_service.verify_repair(self.url, "http://localhost/a")[1]["source"], "unavailable")
            post.assert_not_called()

    def test_incomparable_and_low_confidence_evidence_requires_review(self):
        raw = dict(comparable=False, improvement_detected=False, remaining_damage=False, confidence=0.9, summary="Different locations")
        with patch.object(ai_service.httpx, "post", return_value=self.analyze_response(json.dumps(raw))):
            result, meta = ai_service.verify_repair(self.url, self.url)
        self.assertEqual(result.confidence, 0)
        media = SimpleNamespace(media_type="video", thumbnail_url=self.url, cloudinary_url="https://example.com/video.mp4")
        for confidence, comparable in [(0, False), (0.4, True)]:
            result.confidence = confidence
            meta["comparable"] = comparable
            incident = SimpleNamespace(id=1, verifications=[])
            with patch.object(verification_service, "pick_before_after", return_value=(media, media)), \
                 patch.object(ai_service, "verify_repair", return_value=(result, meta)) as compare, \
                 patch.object(verification_service, "add_event"), patch.object(verification_service, "set_status"), \
                 patch.object(verification_service.priority_service, "refresh"):
                outcome = verification_service.run_ai_verification(MagicMock(), incident)
            self.assertEqual(outcome.ai_result, "REQUIRES_REVIEW")
            compare.assert_called_once_with(self.url, self.url)

    def test_missing_credentials_and_local_sources_never_call_provider(self):
        with patch.object(ai_service.httpx, "post") as post:
            for url in ("http://localhost/image.jpg", "https://127.0.0.1/a", "https://localhost/a", "https://192.168.1.2/a"):
                with self.subTest(url=url), self.assertRaises(ai_service.AnalysisUnavailable):
                    ai_service.analyze_image(url)
            with patch.object(ai_service.settings, "CLOUDINARY_API_KEY", ""), self.assertRaises(ai_service.AnalysisUnavailable):
                ai_service.analyze_image(self.url)
            post.assert_not_called()


if __name__ == "__main__":
    unittest.main()