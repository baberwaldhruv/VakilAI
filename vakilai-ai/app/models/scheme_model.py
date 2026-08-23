from typing import Optional, Any, Dict
from pydantic import BaseModel, Field

class SchemeEligibilityRequest(BaseModel):
    user_query: Optional[str] = Field(default=None, description="Free-text query or message")
    age: Optional[int] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    state: Optional[str] = None
    land_owned: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = "en"
    profile_data: Optional[Dict[str, Any]] = None