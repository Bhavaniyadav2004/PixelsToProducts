"""Demo data (Bengaluru): 10 incidents, 30 reports, 40 media, 5 repair workflows (3 verified, 2 disputed), 2 recurring clusters."""
from datetime import datetime, timedelta
from urllib.parse import quote

from sqlalchemy.orm import Session

from .constants import SEV_RANK
from .models import AIAnalysis, Department, Incident, Media, RepairUpdate, Report, TimelineEvent, User, Verification
from .services import priority_service
from .services.incident_service import slugify
from .utils.security import hash_password

# Photos are Wikimedia Commons files; see each file page for author and licence.
_POTHOLE = ["Potholes in Bengaluru road.jpg", "Roads deformed T munnekollala Bengaluru.jpg", "Roads deformed T munnekollala Bengaluru 2.jpg"]
PHOTOS = {
    "POTHOLE": _POTHOLE,
    "ROAD_CRACK": _POTHOLE[1:],
    "WATERLOGGING": ["India - Chennai - Monsoon - 06 (3059058000).jpg"],
    "BROKEN_FOOTPATH": ["Cracked pavement near National Park (35520277).jpg"],
}


def _img(issue_type: str, idx: int, w: int = 800) -> str:
    files = PHOTOS.get(issue_type) or _POTHOLE
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(files[idx % len(files)])}?width={w}"


def refresh_demo_images(db: Session) -> None:
    """Replace legacy random picsum placeholders on existing seeded media with issue-related photos."""
    items = db.query(Media).filter(Media.cloudinary_url.like("%picsum.photos%")).order_by(Media.id).all()
    for n, m in enumerate(items):
        inc = db.get(Incident, m.incident_id)
        if not inc:
            continue
        full, thumb = _img(inc.issue_type, n), _img(inc.issue_type, n, 400)
        for ev in db.query(TimelineEvent).filter(TimelineEvent.media_url == m.cloudinary_url).all():
            ev.media_url, ev.thumbnail_url = full, thumb
        m.cloudinary_url, m.thumbnail_url = full, thumb
    db.commit()


# type, street, lat, lon, report offsets (days ago) + severities, workflow
SPECS = [
    dict(n=1, type="POTHOLE", street="Hosur Road, Silk Board", lat=12.9177, lon=77.6238,
         reports=[(60, "LOW"), (52, "LOW"), (45, "MEDIUM"), (40, "MEDIUM"), (36, "HIGH"), (33, "HIGH"), (30, "HIGH")],
         flow=dict(assign=28, start=24, evidence=[("BEFORE", 24), ("DURING", 22), ("AFTER", 20)], done=20, ai=("VERIFIED", 0.91), citizen="YES", end="RESOLVED")),
    dict(n=2, type="WATERLOGGING", street="Bannerghatta Road", lat=12.8930, lon=77.5970,
         reports=[(40, "MEDIUM"), (37, "MEDIUM"), (35, "HIGH"), (34, "HIGH")],
         flow=dict(assign=32, start=30, evidence=[("BEFORE", 30), ("AFTER", 27)], done=27, ai=("VERIFIED", 0.88), citizen="YES", end="RESOLVED")),
    dict(n=3, type="ROAD_CRACK", street="100 Feet Road, Indiranagar", lat=12.9719, lon=77.6412,
         reports=[(25, "MEDIUM"), (24, "MEDIUM")],
         flow=dict(assign=22, start=21, evidence=[("BEFORE", 21), ("AFTER", 19)], done=19, ai=("VERIFIED", 0.93), citizen="YES", end="RESOLVED")),
    dict(n=4, type="POTHOLE", street="Outer Ring Road, Marathahalli", lat=12.9591, lon=77.6974,
         reports=[(20, "HIGH"), (18, "HIGH"), (17, "HIGH"), (16, "HIGH")],
         flow=dict(assign=14, start=12, evidence=[("BEFORE", 12), ("AFTER", 9)], done=9, ai=("VERIFIED", 0.82), citizen="NO", end="REQUIRES_REVIEW")),
    dict(n=5, type="ROAD_CRACK", street="Sarjapur Road", lat=12.9100, lon=77.6850,
         reports=[(15, "MEDIUM"), (13, "MEDIUM")],
         flow=dict(assign=11, start=9, evidence=[("AFTER", 6)], done=6, ai=("VERIFIED", 0.78), citizen="NO", end="REQUIRES_REVIEW")),
    dict(n=6, type="POTHOLE", street="Hosur Road, Silk Board", lat=12.9179, lon=77.6239,
         reports=[(8, "MEDIUM"), (5, "HIGH"), (2, "HIGH")], flow=dict(assign=1, due=3, end="ASSIGNED")),
    dict(n=7, type="BROKEN_FOOTPATH", street="Jayanagar 4th Block", lat=12.9250, lon=77.5938,
         reports=[(10, "MEDIUM"), (7, "MEDIUM")], flow=dict(assign=4, due=0, end="ASSIGNED")),
    dict(n=8, type="WATERLOGGING", street="Bannerghatta Road", lat=12.8931, lon=77.5971,
         reports=[(6, "MEDIUM"), (3, "MEDIUM")], flow=None),
    dict(n=9, type="POTHOLE", street="Outer Ring Road, Marathahalli", lat=12.9594, lon=77.6980,
         reports=[(4, "CRITICAL"), (2, "CRITICAL"), (1, "CRITICAL")], flow=None),
    dict(n=10, type="BROKEN_FOOTPATH", street="Residency Road", lat=12.9709, lon=77.6070,
         reports=[(3, "LOW")], flow=None),
]
DEPT_FOR = {"WATERLOGGING": "Drainage"}


def seed(db: Session) -> None:
    now = datetime.utcnow()
    ago = lambda d, h=0: now - timedelta(days=d, hours=h)

    depts = {n: Department(name=n, description=d) for n, d in [
        ("Road Maintenance", "Potholes, cracks, footpaths, signage"), ("Drainage", "Waterlogging and drains"),
        ("Electrical", "Streetlights"), ("Public Works", "General infrastructure")]}
    db.add_all(depts.values())
    db.flush()

    def user(name, email, role, pw, dept=None):
        u = User(name=name, email=email, role=role, password_hash=hash_password(pw),
                 department_id=depts[dept].id if dept else None)
        db.add(u)
        return u

    admin = user("Suresh Murthy", "admin@streetpulse.test", "ADMIN", "admin123")
    members = {
        "Road Maintenance": user("Ravi Gowda", "ravi@streetpulse.test", "MUNICIPAL_MEMBER", "municipal123", "Road Maintenance"),
        "Drainage": user("Meera Nair", "meera@streetpulse.test", "MUNICIPAL_MEMBER", "municipal123", "Drainage"),
        "Electrical": user("Arun Shetty", "arun@streetpulse.test", "MUNICIPAL_MEMBER", "municipal123", "Electrical"),
    }
    citizens = [
        user("Ananya Rao", "citizen@streetpulse.test", "CITIZEN", "citizen123"),
        user("Karthik Gowda", "bala@streetpulse.test", "CITIZEN", "citizen123"),
        user("Divya Hegde", "chitra@streetpulse.test", "CITIZEN", "citizen123"),
        user("Mohammed Irfan", "dev@streetpulse.test", "CITIZEN", "citizen123"),
    ]
    db.flush()

    def ev(inc, typ, title, when, detail=None, media=None, actor=None):
        db.add(TimelineEvent(
            incident_id=inc.id, event_type=typ, title=title, detail=detail, created_at=when,
            media_url=media.cloudinary_url if media else None,
            thumbnail_url=media.thumbnail_url if media else None,
            media_type=media.media_type if media else None, actor_name=actor))

    n_media = 0

    def media(inc, uid, role, key, when, report=None):
        nonlocal n_media
        m = Media(incident_id=inc.id, report_id=report.id if report else None, uploaded_by=uid, media_type="image",
                  media_role=role, cloudinary_public_id=f"demo/{inc.incident_code}/{key}",
                  cloudinary_url=_img(inc.issue_type, n_media), thumbnail_url=_img(inc.issue_type, n_media, 400),
                  created_at=when)
        n_media += 1
        db.add(m)
        db.flush()
        return m

    cit_i = 0
    for spec in SPECS:
        sevs = [s for _, s in spec["reports"]]
        first = ago(spec["reports"][0][0])
        inc = Incident(
            issue_type=spec["type"], severity=max(sevs, key=SEV_RANK.get), initial_severity=sevs[0],
            latitude=spec["lat"], longitude=spec["lon"], street_name=spec["street"], street_slug=slugify(spec["street"]),
            description=f"{spec['type'].replace('_', ' ').title()} reported on {spec['street']}", status="NEW",
            first_reported_at=first, last_reported_at=ago(spec["reports"][-1][0]), created_at=first)
        db.add(inc)
        db.flush()
        inc.incident_code = f"SP-{1000 + inc.id}"

        cur = None
        for idx, (d, sev) in enumerate(spec["reports"]):
            u = citizens[0] if (idx == 0 and spec["n"] in (1, 4, 6)) else citizens[cit_i % 4]
            cit_i += 1
            when = ago(d)
            r = Report(incident_id=inc.id, user_id=u.id, latitude=spec["lat"], longitude=spec["lon"], created_at=when,
                       description=["Unsafe for two-wheelers and pedestrians", "Wider than last week", "Gets worse after every rain",
                                    "Reported earlier, still not repaired", "Photo from this morning", "Damaged my scooter's tyre", "Needs urgent attention before the monsoon"][idx % 7])
            db.add(r)
            db.flush()
            m = media(inc, u.id, "CITIZEN_REPORT", f"citizen-{idx}", when, r)
            db.add(AIAnalysis(media_id=m.id, issue_type=spec["type"], severity=sev, confidence=round(0.82 + 0.02 * (idx % 5), 2),
                              description=f"Visible {spec['type'].replace('_', ' ').lower()}", raw_response="seed", created_at=when))
            ev(inc, "REPORT", "First report" if idx == 0 else "Citizen report", when, r.description, m, u.name)
            if cur and SEV_RANK[sev] > SEV_RANK[cur]:
                ev(inc, "PROGRESSION", "Damage appears worse", when, f"Severity raised from {cur} to {sev}", None, "System")
            cur = sev if cur is None or SEV_RANK[sev] > SEV_RANK[cur] else cur

        flow = spec["flow"]
        if flow:
            member = members[DEPT_FOR.get(spec["type"], "Road Maintenance")]
            inc.assigned_user_id, inc.assigned_department_id = member.id, member.department_id
            t = ago(flow["assign"])
            ev(inc, "VERIFIED", "Reviewed by admin", t - timedelta(hours=2), None, None, admin.name)
            ev(inc, "ASSIGNED", "Assigned", t, f"{member.name} ({depts[DEPT_FOR.get(spec['type'], 'Road Maintenance')].name})", None, admin.name)
            inc.status = "ASSIGNED"
            if "due" in flow:
                inc.due_date = now + timedelta(days=flow["due"])
            else:
                inc.due_date = ago(flow["done"] - 2)
            if flow["end"] != "ASSIGNED":
                inc.accepted_at = t + timedelta(hours=3)
                ev(inc, "ACCEPTED", "Assignment accepted", inc.accepted_at, None, None, member.name)
                ev(inc, "REPAIR_STARTED", "Repair started", ago(flow["start"]), "Inspection completed. Damage confirmed.", None, member.name)
                db.add(RepairUpdate(incident_id=inc.id, updated_by=member.id, status="IN_PROGRESS", notes="Inspection completed. Damage confirmed.", created_at=ago(flow["start"])))
                for stage, d in flow["evidence"]:
                    m = media(inc, member.id, f"REPAIR_{stage}", stage.lower(), ago(d))
                    m.cloudinary_public_id = f"streetpulse/incidents/{inc.incident_code}/repair/{stage.lower()}"
                    ev(inc, f"REPAIR_{stage}", f"Repair evidence: {stage.title()}", ago(d), None, m, member.name)
                ev(inc, "REPAIR_COMPLETED", "Repair completed", ago(flow["done"]), None, None, member.name)
                db.add(RepairUpdate(incident_id=inc.id, updated_by=member.id, status="COMPLETED", notes="Repair finished", created_at=ago(flow["done"])))
                result, conf = flow["ai"]
                v = Verification(incident_id=inc.id, ai_result=result, ai_confidence=conf, citizen_result=flow["citizen"],
                                 ai_summary="The visible damage appears repaired and the surface is substantially improved.",
                                 final_status=flow["end"], notes="seed", created_at=ago(flow["done"], -1))
                db.add(v)
                ev(inc, "AI_VERIFICATION", "AI verification: Verified", ago(flow["done"], -1),
                   f"The visible damage appears repaired (confidence {conf:.0%}; decision support only)", None, "StreetPulse AI")
                cdays = flow["done"] - 1
                if flow["citizen"] == "YES":
                    ev(inc, "CITIZEN_CONFIRMATION", "Citizen confirmed the repair", ago(cdays), None, None, citizens[0].name)
                    ev(inc, "RESOLVED", "Resolved", ago(cdays), "Repair verified by AI and confirmed by citizen", None, "System")
                    inc.resolved_at = ago(cdays)
                else:
                    ev(inc, "CITIZEN_CONFIRMATION", "Citizen disputes the repair", ago(cdays), "Still looks damaged", None, citizens[1].name)
                    ev(inc, "REVIEW", "Sent for admin review", ago(cdays), "AI and citizen outcomes disagree", None, "System")
                inc.status = flow["end"]
        db.flush()
        db.refresh(inc)
        priority_service.refresh(db, inc)
    db.commit()
