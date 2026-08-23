from fastapi import APIRouter, HTTPException, status
from app.models.scheme_model import SchemeEligibilityRequest
from app.ai.llm import generate_scheme_response

router = APIRouter(
    prefix="/api/scheme",
    tags=["Scheme Eligibility"]
)

@router.post("/check-eligibility")
def check_scheme_eligibility(payload: SchemeEligibilityRequest):
    query_text = payload.user_query or ""
    
    demographic_details = []
    if payload.age:
        demographic_details.append(f"Age: {payload.age}")
    if payload.occupation:
        demographic_details.append(f"Occupation: {payload.occupation}")
    if payload.annual_income:
        demographic_details.append(f"Annual Income: ₹{payload.annual_income}")
    if payload.state:
        demographic_details.append(f"State: {payload.state}")
    if payload.land_owned:
        demographic_details.append(f"Land Owned: {payload.land_owned}")
    if payload.category:
        demographic_details.append(f"Category: {payload.category}")

    if demographic_details:
        combined_profile = ", ".join(demographic_details)
        query_text = f"{query_text}\nCitizen Profile: {combined_profile}".strip()

    if not query_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required field: Please provide 'user_query' or demographic parameters."
        )

    response = generate_scheme_response(
        user_query=query_text,
        scheme_context="Central and State Government Welfare Schemes of India",
        language=payload.language or "en"
    )

    return {
        "status": "success",
        "evaluation": response
    }