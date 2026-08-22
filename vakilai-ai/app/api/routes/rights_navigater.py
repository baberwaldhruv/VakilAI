from fastapi import APIRouter  # pyright: ignore[reportMissingImports]
from app.services.rights_navigator_service import analyze_dispute

router = APIRouter(
    prefix="/api/rights-navigator",
    tags=["Rights Navigator"]
)


@router.post("/analyze")
def analyze(
    dispute_type: str,
    description: str,
    location: str
):
    return analyze_dispute(
        dispute_type=dispute_type,
        description=description,
        location=location
    )