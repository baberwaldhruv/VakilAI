import os
import json
import time
from dotenv import load_dotenv
from google import genai
from google.genai.errors import APIError, ServerError
from fastapi import HTTPException, status

from app.ai.prompts.rti_prompt import RTI_SYSTEM_PROMPT
from app.ai.prompts.extraction_prompt import CASE_EXTRACTION_PROMPT
from app.ai.prompts.rti_draft_prompt import RTI_DRAFT_PROMPT
from app.ai.prompts.scheme_prompt import SCHEME_ELIGIBILITY_PROMPT
from app.ai.prompts.rights_navigater_promt import RIGHTS_NAVIGATOR_SYSTEM_PROMPT

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in the environment")

client = genai.Client(api_key=api_key)

# Recommended standard model identifiers
DEFAULT_REASONING_MODEL = "gemini-3.5-flash-lite"
DEFAULT_FAST_MODEL = "gemini-3.5-flash-lite"


def _call_gemini_with_retry(model: str, contents: any, config: dict = None, max_retries: int = 3):
    """
    Executes Gemini API requests with automatic exponential backoff 
    on temporary rate limits and quota spikes.
    """
    for attempt in range(max_retries):
        try:
            if config:
                return client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                )
            return client.models.generate_content(
                model=model,
                contents=contents
            )
        except (APIError, ServerError) as e:
            err_msg = str(e).lower()
            if ("429" in err_msg or "quota" in err_msg or "resource_exhausted" in err_msg) and attempt < max_retries - 1:
                sleep_duration = 1.5 * (2 ** attempt)
                time.sleep(sleep_duration)
                continue
            raise e


def generate_response(messages: list, missing_fields: list) -> str:
    contents = [RTI_SYSTEM_PROMPT]

    contents.append(
        f"""
The structured case validator has determined that these fields are still missing:

{missing_fields}

Ask the citizen only for the most important missing information.
Do not ask for information that is not in this list.
"""
    )

    for message in messages:
        contents.append(f"{message['role']}: {message['content']}")

    try:
        response = _call_gemini_with_retry(
            model=DEFAULT_FAST_MODEL,
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


def generate_scheme_response(
    user_query: str = "",
    age=None,
    occupation=None,
    annual_income=None,
    state: str = "Rajasthan",
    land_owned=None,
    category=None,
    language: str = "en",
    scheme_context: str = "",
    **kwargs
) -> str:
    # Safely format all placeholders required by SCHEME_ELIGIBILITY_PROMPT
    format_kwargs = {
        "user_query": str(user_query or "Check eligibility for available welfare schemes"),
        "age": str(age if age is not None else "Not specified"),
        "occupation": str(occupation or "Not specified"),
        "annual_income": str(annual_income if annual_income is not None else "Not specified"),
        "state": str(state or "Rajasthan"),
        "land_owned": str(land_owned or "Not specified"),
        "category": str(category or "Not specified"),
        "language": str(language or "en"),
        "scheme_context": str(scheme_context or "Central & State Welfare Schemes of India"),
        **kwargs
    }

    try:
        formatted_prompt = SCHEME_ELIGIBILITY_PROMPT.format(**format_kwargs)
    except KeyError:
        # Fallback in case template contains unescaped curly braces
        formatted_prompt = (
            f"{SCHEME_ELIGIBILITY_PROMPT}\n\n"
            f"Citizen Profile:\n"
            f"- Query: {format_kwargs['user_query']}\n"
            f"- Age: {format_kwargs['age']}\n"
            f"- Occupation: {format_kwargs['occupation']}\n"
            f"- Income: {format_kwargs['annual_income']}\n"
            f"- State: {format_kwargs['state']}\n"
            f"- Land Owned: {format_kwargs['land_owned']}\n"
            f"- Category: {format_kwargs['category']}\n"
            f"- Language: {format_kwargs['language']}"
        )

    try:
        response = _call_gemini_with_retry(
            model=DEFAULT_REASONING_MODEL,
            contents=formatted_prompt
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
        response = _call_gemini_with_retry(
            model=DEFAULT_FAST_MODEL,
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
        response = _call_gemini_with_retry(
            model=DEFAULT_REASONING_MODEL,
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
        response = _call_gemini_with_retry(
            model=DEFAULT_FAST_MODEL,
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


def generate_rights_response(user_query: str, language: str = "en") -> str:
    prompt = f"""
{RIGHTS_NAVIGATOR_SYSTEM_PROMPT.format(language=language)}

Citizen Query:
{user_query}
"""
    try:
        response = _call_gemini_with_retry(
            model=DEFAULT_REASONING_MODEL,
            contents=prompt,
        )
        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="AI returned an empty response for legal rights.",
            )
        return response.text

    except ServerError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Temporary AI service disruption during legal rights evaluation.",
        ) from e

    except APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider communication error: {e.message}",
        ) from e