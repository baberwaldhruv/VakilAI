# Essential fields strictly needed to draft any RTI
CORE_REQUIRED_FIELDS = [
    "issue",
    "department",
    "information_requested"
]

# Optional contextual fields that will be used if provided, but won't block generation
OPTIONAL_FIELDS = [
    "village",
    "district",
    "state",
    "project_details"
]


def validate_case(case: dict) -> dict:
    missing_fields = []

    # Check only essential core fields
    for field in CORE_REQUIRED_FIELDS:
        val = case.get(field)
        if not val or (isinstance(val, str) and not val.strip()):
            missing_fields.append(field)

    # Fill defaults for optional fields if missing so prompt templates don't break
    for field in OPTIONAL_FIELDS:
        if not case.get(field):
            case[field] = "N/A"

    return {
        "ready_to_draft": len(missing_fields) == 0,
        "missing_fields": missing_fields
    }