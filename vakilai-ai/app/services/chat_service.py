from app.ai.llm import generate_response, extract_case, generate_scheme_response
from app.services.case_service import create_case, update_case
from app.services.case_validator import validate_case

sessions = {}
cases = {}

SCHEME_KEYWORDS = [
    "scheme", "yojana", "eligibility", "eligible", "apply for", 
    "subsidy", "welfare", "pension", "ration", "pm-kisan", "awas"
]

def is_scheme_query(message: str) -> bool:
    msg = message.lower()
    return any(keyword in msg for keyword in SCHEME_KEYWORDS)

def chat(session_id: str, message: str, language: str = "en"):
    if session_id not in sessions:
        sessions[session_id] = []
        cases[session_id] = create_case()

    sessions[session_id].append({
        "role": "user",
        "content": message
    })

    # Route 1: Government Scheme Eligibility
    if is_scheme_query(message) and not cases[session_id].get("issue"):
        response = generate_scheme_response(
            user_query=message,
            scheme_context="General central and state welfare programs",
            language=language
        )
        
        sessions[session_id].append({
            "role": "assistant",
            "content": response
        })

        return {
            "response": response,
            "case": cases[session_id],
            "missing_fields": []
        }

    # Route 2: RTI Flow
    extracted_data = extract_case(sessions[session_id])
    cases[session_id] = update_case(cases[session_id], extracted_data)
    validation = validate_case(cases[session_id])
    cases[session_id]["ready_to_draft"] = validation["ready_to_draft"]

    response = generate_response(
        sessions[session_id],
        validation["missing_fields"]
    )

    sessions[session_id].append({
        "role": "assistant",
        "content": response
    })

    return {
        "response": response,
        "case": cases[session_id],
        "missing_fields": validation["missing_fields"]
    }