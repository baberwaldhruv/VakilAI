from app.ai.llm import (
    generate_response, 
    extract_case, 
    generate_scheme_response, 
    generate_rights_response
)
from app.services.case_service import create_case, update_case
from app.services.case_validator import validate_case

sessions = {}
session_modes = {}
cases = {}

SCHEME_KEYWORDS = [
    "scheme", "yojana", "eligibility", "eligible", "apply for", 
    "subsidy", "welfare", "pension", "ration", "pm-kisan", "awas",
    "category", "caste", "income", "bpl", "annual income", "farmer",
    "general", "obc", "sc", "st", "ews"
]

RIGHTS_KEYWORDS = [
    "right", "rights", "law", "legal", "consumer", "police", 
    "arrest", "tenant", "landlord", "salary", "labor", "labour", 
    "cybercrime", "harassment", "fir", "advocate", "property", 
    "land", "neighbour", "neighbor", "encroachment", "dispute", 
    "possession", "builder", "cheating", "fraud", "court"
]

def detect_initial_mode(message: str) -> str:
    msg = message.lower()
    if any(keyword in msg for keyword in RIGHTS_KEYWORDS) and "rti" not in msg:
        return "rights"
    if any(keyword in msg for keyword in SCHEME_KEYWORDS) and "rti" not in msg:
        return "scheme"
    return "rti"

def chat(session_id: str, message: str, language: str = "en"):
    # Initialize new session
    if session_id not in sessions:
        sessions[session_id] = []
        cases[session_id] = create_case()
        session_modes[session_id] = detect_initial_mode(message)

    sessions[session_id].append({
        "role": "user",
        "content": message
    })

    current_mode = session_modes.get(session_id, "rti")
    msg_lower = message.lower()

    # Dynamic mode upgrade if user started in default 'rti' but explicitly asks about schemes/rights
    if current_mode == "rti":
        new_mode = detect_initial_mode(message)
        if new_mode != "rti":
            current_mode = new_mode
            session_modes[session_id] = new_mode

    # -------------------------------------------------------------
    # 1. LEGAL RIGHTS NAVIGATOR FLOW
    # -------------------------------------------------------------
    if current_mode == "rights":
        conversation_context = "\n".join(
            f"{m['role']}: {m['content']}" for m in sessions[session_id]
        )
        response = generate_rights_response(
            user_query=conversation_context, 
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

    # -------------------------------------------------------------
    # 2. GOVERNMENT SCHEME ELIGIBILITY FLOW
    # -------------------------------------------------------------
    if current_mode == "scheme":
        conversation_context = "\n".join(
            f"{m['role']}: {m['content']}" for m in sessions[session_id]
        )
        response = generate_scheme_response(
            user_query=conversation_context,
            scheme_context="Government welfare, subsidy, and citizen assistance schemes in India",
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

    # -------------------------------------------------------------
    # 3. RTI APPLICATION DRAFTING FLOW
    # -------------------------------------------------------------
    extracted_data = extract_case(
        sessions[session_id]
    )

    cases[session_id] = update_case(
        cases[session_id],
        extracted_data
    )

    validation = validate_case(
        cases[session_id]
    )

    cases[session_id]["ready_to_draft"] = (
        validation["ready_to_draft"]
    )

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