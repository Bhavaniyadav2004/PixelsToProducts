"""Media storage. Uses Cloudinary when configured; otherwise falls back to local disk for development."""
import uuid
from pathlib import Path

from ..config import settings

if settings.cloudinary_enabled:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.utils

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def _thumb(public_id: str, media_type: str) -> str:
    kwargs = dict(
        width=400, height=300, crop="fill", quality="auto", fetch_format="jpg", secure=True,
    )
    if media_type == "video":
        url, _ = cloudinary.utils.cloudinary_url(public_id, resource_type="video", format="jpg", **{k: v for k, v in kwargs.items() if k != "fetch_format"})
    else:
        url, _ = cloudinary.utils.cloudinary_url(public_id, **kwargs)
    return url


def upload_media(data: bytes, filename: str, media_type: str, folder: str, name_prefix: str, tags: list[str] | None = None) -> dict:
    """Returns dict(public_id, url, thumbnail_url)."""
    short = uuid.uuid4().hex[:8]
    if settings.cloudinary_enabled:
        res = cloudinary.uploader.upload(
            data,
            resource_type=media_type,
            folder=folder,
            public_id=f"{name_prefix}_{short}",
            tags=["streetpulse", *(tags or [])],
        )
        pid = res["public_id"]
        return {
            "public_id": pid,
            "url": res["secure_url"],
            "thumbnail_url": _thumb(pid, media_type),
        }

    ext = Path(filename).suffix.lower() or (".mp4" if media_type == "video" else ".jpg")
    rel = Path(folder) / f"{name_prefix}_{short}{ext}"
    dest = settings.UPLOAD_DIR / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    url = f"{settings.PUBLIC_BASE_URL}/uploads/{rel.as_posix()}"
    return {"public_id": rel.with_suffix("").as_posix(), "url": url, "thumbnail_url": url if media_type == "image" else None}


def move_to_incident(public_id: str, media_type: str, incident_code: str, role_folder: str) -> dict | None:
    """Re-home a pending Cloudinary asset under its incident folder. Returns new refs or None."""
    if not settings.cloudinary_enabled:
        return None
    leaf = public_id.rsplit("/", 1)[-1]
    new_id = f"streetpulse/incidents/{incident_code}/{role_folder}/{leaf}"
    try:
        res = cloudinary.uploader.rename(public_id, new_id, resource_type=media_type, overwrite=True)
    except Exception:
        return None
    return {"public_id": res["public_id"], "url": res["secure_url"], "thumbnail_url": _thumb(res["public_id"], media_type)}


def delete_media(public_id: str, media_type: str, url: str) -> None:
    if settings.cloudinary_enabled:
        try:
            cloudinary.uploader.destroy(public_id, resource_type=media_type)
        except Exception:
            pass
        return
    prefix = f"{settings.PUBLIC_BASE_URL}/uploads/"
    if url.startswith(prefix):
        target = (settings.UPLOAD_DIR / url[len(prefix):]).resolve()
        if settings.UPLOAD_DIR.resolve() in target.parents and target.exists():
            target.unlink()
