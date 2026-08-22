import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai.errors import APIError, ServerError
from fastapi import HTTPException, status

from app.ai.prompts.rti_prompt import RTI_SYSTEM_PROMPT
from app.ai.prompts.extraction_prompt import CASE_EXTRACTION_PROMPT
from app.ai.prompts.rti_draft_prompt import RTI_DRAFT_PROMPT
from app.ai.prompts.scheme_prompt import SCHEME_ELIGIBILITY_PROMPT

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)


def generate_response(messages: list, missing_fields: list) -> str:
    contents = [RTI_SYSTEM_PROMPT]

    contents.append(
        f"""
The structured case validator has determined that these fields
are still missing:

{missing_fields}

Ask the citizen only for the most important missing information.
Do not ask for information that is not in this list.
"""
    )

    for message in messages:
        contents.append(
            f"{message['role']}: {message['content']}"
        )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents
        )
        return response.text
    except ServerError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Temporary AI service disruption. Please try again shortly."
        ) from e
    except APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider communication error: {e.message}"
        ) from e


def generate_scheme_response(user_query: str, scheme_context: str = "", language: str = "en") -> str:
    prompt = SCHEME_ELIGIBILITY_PROMPT.format(
        user_query=user_query,
        scheme_context=scheme_context or "Government Welfare, Subsidy, and Citizen Assistance Schemes in India",
        language=language
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="AI returned an empty response for scheme eligibility."
            )
        return response.text
    except ServerError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Temporary AI service disruption during scheme evaluation."
        ) from e
    except APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider communication error: {e.message}"
        ) from e


def extract_case(messages: list) -> dict:
    conversation = "\n".join(
        f"{message['role']}: {message['content']}"
        for message in messages
    )

    prompt = f"""
{CASE_EXTRACTION_PROMPT}

Conversation:

{conversation}
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )
        return json.loads(response.text)

    except ServerError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Temporary AI service disruption. Please try again shortly."
        ) from e

    except APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider communication error: {e.message}"
        ) from e

    except (json.JSONDecodeError, KeyError, TypeError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract a valid or complete case from the conversation."
        ) from e


def generate_rti_draft(case: dict) -> str:
    prompt = f"""
{RTI_DRAFT_PROMPT}

Citizen case information:

{case}
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incomplete case data; draft could not be generated."
            )
        return response.text

    except ServerError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Temporary AI service disruption during draft generation."
        ) from e

    except APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider communication error: {e.message}"
        ) from e


def generate_text_response(prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="AI returned an empty response."
            )

        return response.text

    except ServerError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Temporary AI service disruption. Please try again shortly."
        ) from e

    except APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider communication error: {e.message}"
        ) from e