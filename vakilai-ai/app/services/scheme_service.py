from app.ai.prompts.scheme_prompt import SCHEME_ELIGIBILITY_PROMPT
from app.ai.llm import get_ai_response # or your actual LLM client call

class SchemeService:
    async def evaluate_eligibility(self, data: dict):
        # Format the prompt using all provided payload fields
        prompt = SCHEME_ELIGIBILITY_PROMPT.format(
            age=data.get("age", "Not specified"),
            occupation=data.get("occupation", "Not specified"),
            annual_income=data.get("annual_income", "Not specified"),
            state=data.get("state", "Rajasthan"),
            land_owned=data.get("land_owned", "Not specified"),
            category=data.get("category", "Not specified"),
            user_query=data.get("user_query", "Check eligibility for available schemes")
        )
        
        # Call the LLM
        response = await get_ai_response(prompt)
        return response

scheme_service = SchemeService()