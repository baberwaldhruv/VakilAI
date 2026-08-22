CASE_EXTRACTION_PROMPT = """
You extract structured information from a conversation between a citizen
and an AI assistant helping them prepare an RTI application.

Extract only information that is explicitly stated or clearly provided
by the citizen.

Return ONLY valid JSON.

Use exactly these fields:

{
    "issue": null,
    "village": null,
    "city": null,
    "district": null,
    "state": null,
    "department": null,
    "information_requested": null,
    "project_details": null,
    "applicant_name": null,
    "applicant_address": null
}

Rules:

- Do not guess missing information.
- Use null when information is not available.
- Do not infer a district from a village.
- Do not infer a department from the type of issue.
- Do not invent applicant details.
- Extract applicant name only if explicitly provided by the citizen.
- Extract applicant address only if explicitly provided by the citizen.
- Preserve the information as provided by the citizen.
- Do not add additional fields.
- Do not provide explanations.
LANGUAGE INSTRUCTION:
- Respond in the exact language used by the citizen in their query ({language}). If the query is in English, reply in plain English.
"""