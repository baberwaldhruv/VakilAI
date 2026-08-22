# VakilAI — RTI AI Service API Documentation

## Overview

The VakilAI RTI AI Service is a FastAPI-based backend service that provides AI functionality for the RTI (Right to Information) module of VakilAI.

The service is responsible for:

* Conversational RTI intake
* Extracting structured information from conversations
* Identifying missing information
* Asking relevant follow-up questions
* Maintaining RTI case information across a conversation
* Generating RTI application drafts
* Returning structured RTI case information

The main VakilAI application can communicate with this service through HTTP APIs.

> **Integration Note:** The service is currently under development.  The endpoint paths and response structures below can be used for integration planning.

# Base URL

The deployed API is available at:

https://oosc-neuralnexus.onrender.com

All API endpoints should be accessed relative to this base URL.
---

# API Endpoints

| Method | Endpoint         | Purpose                                                               |
| ------ | ---------------- | --------------------------------------------------------------------- |
| `GET`  | `/health`        | Check whether the RTI AI service is running                           |
| `POST` | `/api/chat/`     | Continue an RTI conversation and collect structured case information  |
| `POST` | `/api/rti/draft` | Generate an RTI application draft from the collected case information |

---

# 1. Health Check

## Endpoint

```http
GET /health
```

## Purpose

Checks whether the RTI AI service is running and available.

## Response

**Status: `200 OK`**

```json
{
  "status": "healthy"
}
```

---

# 2. RTI Chat

## Endpoint

```http
POST /api/chat/
```

## Purpose

The RTI Chat endpoint provides the conversational interface for collecting information required to prepare an RTI application.

The endpoint accepts a user's message along with a `session_id`. The service extracts relevant information, updates the RTI case, identifies missing information, and generates an appropriate response or follow-up question.

The same `session_id` should be used throughout a single RTI conversation.

## Request Parameters

| Parameter    | Type   | Location | Required | Description                                |
| ------------ | ------ | -------- | -------- | ------------------------------------------ |
| `session_id` | string | Query    | Yes      | Unique identifier for the RTI conversation |
| `message`    | string | Query    | Yes      | User's latest RTI-related message          |

## Example Request

```http
POST /api/chat/?session_id=rti_documentation_1&message=I%20want%20to%20file%20an%20RTI%20about%20road%20construction%20in%20my%20village.
```

## Response Structure

The endpoint returns the following information:

| Field            | Type   | Description                                                |
| ---------------- | ------ | ---------------------------------------------------------- |
| `status`         | string | Indicates whether the request was processed successfully   |
| `session_id`     | string | Identifier of the current RTI conversation                 |
| `response`       | string | AI-generated response or follow-up question                |
| `case`           | object | Structured RTI information extracted from the conversation |
| `missing_fields` | array  | Fields that are still required                             |

### `case` Object

| Field                   | Type          | Description                                                            |
| ----------------------- | ------------- | ---------------------------------------------------------------------- |
| `issue`                 | string / null | Main issue or subject of the RTI                                       |
| `village`               | string / null | Village related to the RTI                                             |
| `city`                  | string / null | City related to the RTI, if applicable                                 |
| `district`              | string / null | District related to the RTI                                            |
| `state`                 | string / null | State related to the RTI                                               |
| `department`            | string / null | Government department responsible for the issue                        |
| `information_requested` | string / null | Information requested by the applicant                                 |
| `project_details`       | string / null | Details about the relevant project or issue                            |
| `applicant_name`        | string / null | Name of the RTI applicant                                              |
| `applicant_address`     | string / null | Address of the RTI applicant                                           |
| `ready_to_draft`        | boolean       | Indicates whether the case has enough information for draft generation |

## Example Response

```json
{
  "status": "success",
  "session_id": "rti_documentation_1",
  "response": "To help you file this RTI, could you please tell me the name of your village, district, and state?",
  "case": {
    "issue": "road construction",
    "village": null,
    "city": null,
    "district": null,
    "state": null,
    "department": null,
    "information_requested": null,
    "project_details": null,
    "applicant_name": null,
    "applicant_address": null,
    "ready_to_draft": false
  },
  "missing_fields": [
    "village",
    "district",
    "state",
    "department",
    "information_requested",
    "project_details"
  ]
}
```

## Conversation Flow

The endpoint progressively builds the RTI case as the user provides more information.

```text
User Message
     ↓
/api/chat/
     ↓
Extract Information
     ↓
Update RTI Case
     ↓
Check Missing Fields
     ↓
 ┌───────────────────────┐
 │ Information Complete? │
 └───────────┬───────────┘
             │
       ┌─────┴─────┐
       │           │
      No          Yes
       │           │
       ▼           ▼
Ask Follow-up   Ready for
Question        Draft Generation
       │           │
       └─────┬─────┘
             ↓
        API Response
```

## Example Conversation

### Request 1

```text
I want to file an RTI about road construction in my village.
```

The service identifies:

```json
{
  "issue": "road construction"
}
```

It then asks for additional information.

### Request 2

```text
The village is Hingona in Rajasthan.
```

The service updates the case:

```json
{
  "issue": "road construction",
  "village": "Hingona",
  "state": "Rajasthan"
}
```

It then asks for the district and additional project information.

### Request 3

```text
I want to know the sanctioned budget for the road and how much money has been spent so far.
```

The service updates:

```json
{
  "information_requested": "sanctioned budget for the road and how much money has been spent so far"
}
```

The service continues asking for missing information such as the department.

## Session Management

A unique `session_id` should be used for each RTI case.

Example:

```text
rti_documentation_1
```

The same `session_id` should be used for subsequent messages:

```text
POST /api/chat/?session_id=rti_documentation_1&message=...
POST /api/chat/?session_id=rti_documentation_1&message=...
POST /api/chat/?session_id=rti_documentation_1&message=...
```

This allows information from previous messages to be retained and incorporated into the current RTI case.

## Validation Error

If required query parameters are missing or invalid, FastAPI returns:

**`422 Unprocessable Entity`**

Example:

```json
{
  "detail": [
    {
      "loc": [
        "query",
        "session_id"
      ],
      "msg": "Field required",
      "type": "missing"
    }
  ]
}
```

---

# 3. RTI Draft Generation

## Endpoint

```http
POST /api/rti/draft
```

## Purpose

Generates a formal RTI application using the structured information collected during the RTI conversation.

This endpoint is intended to be called once the RTI case contains sufficient information for drafting.

The `ready_to_draft` field in the `/api/chat/` response indicates whether the case is ready for this stage.

## Workflow

```text
/api/chat/
     ↓
Collect RTI Information
     ↓
Validate Required Information
     ↓
ready_to_draft = true
     ↓
/api/rti/draft
     ↓
Generated RTI Application
```

## Request

**To be completed after endpoint testing.**

## Request Example

**To be completed after endpoint testing.**

## Response

**To be completed after endpoint testing.**

## Response Example

**To be completed after endpoint testing.**

---

# 4. Error Handling

The API uses standard HTTP status codes.

| Status Code | Meaning                        |
| ----------- | ------------------------------ |
| `200`       | Request processed successfully |
| `422`       | Request validation error       |
| `500`       | Internal server error          |

---

# 5. Integration Workflow

A typical integration with the RTI AI Service follows these steps:

### Step 1 — Check Service Health

```http
GET /health
```

### Step 2 — Start an RTI Conversation

```http
POST /api/chat/
```

The client sends the user's initial RTI requirement.

### Step 3 — Continue the Conversation

The client continues sending messages using the same `session_id`.

The service progressively:

1. Extracts information
2. Updates the RTI case
3. Identifies missing fields
4. Asks follow-up questions

### Step 4 — Check Draft Readiness

The client checks:

```text
case.ready_to_draft
```

When this becomes:

```json
true
```

the case can proceed to draft generation.

### Step 5 — Generate the RTI Draft

```http
POST /api/rti/draft
```

The collected case information is used to generate the formal RTI application.

---

# 6. API Summary

| Method | Endpoint         | Purpose                                       | Current Status  |
| ------ | ---------------- | --------------------------------------------- | --------------- |
| `GET`  | `/health`        | Service health check                          | Tested          |
| `POST` | `/api/chat/`     | RTI conversational intake and case extraction | Tested          |
| `POST` | `/api/rti/draft` | Generate RTI application draft                | Pending testing |

---

# 7. Development Documentation

During development, the FastAPI service provides interactive documentation through:

```text
/docs
```

and:

```text
/redoc
```

Once the service is deployed, these paths will be available under the deployed service URL.

---

## Documentation Status

### Completed

* API endpoint list
* Endpoint purposes
* `/health` response
* `/api/chat/` request parameters
* `/api/chat/` response structure
* RTI case fields
* Missing-field handling
* Session-based conversation flow
* Validation error structure
* Integration workflow

### Pending

* `/api/rti/draft` request schema
* `/api/rti/draft` request example
* `/api/rti/draft` response schema
* `/api/rti/draft` response example
* Final deployment URL
Conversation Flow

The endpoint progressively builds the RTI case as the user provides more information.
User Message
↓
/api/chat/
↓
Extract Information
↓
Update RTI Case
↓
Check Missing Fields
↓
┌───────────────────────┐
│ Information Complete? │
└───────────┬───────────┘
│
┌─────┴─────┐
│           │
No          Yes
│           │
▼           ▼
Ask Follow-up   Ready for
Question        Draft Generation
│           │
└─────┬─────┘
↓
API Response

Example Conversation

Request 1

I want to file an RTI about road construction in my village.

The service identifies:
{
"issue": "road construction"
}

It then asks for additional information.
Request 2

The village is Hingona in Rajasthan.

The service updates the case:
{
"issue": "road construction",
"village": "Hingona",
"state": "Rajasthan"
}

It then asks for the district and additional project information.
Request 3

I want to know the sanctioned budget for the road and how much money has been spent so far.

The service updates:
{
"information_requested": "sanctioned budget for the road and how much money has been spent so far"
}
