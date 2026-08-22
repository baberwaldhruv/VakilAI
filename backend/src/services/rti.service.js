const { get, run, all } = require("../config/database");
const { v4: uuidv4 } = require("uuid");

const aiService = require("./ai.service");
const ApiError = require("../utils/api-error");

async function createCase(userId) {
  const sessionId = uuidv4();

  const result = await run(
    `
      INSERT INTO rti_cases
      (user_id, session_id)
      VALUES (?, ?)
    `,
    [userId, sessionId]
  );

  return getCaseById(userId, result.id);
}

async function getCaseById(userId, caseId) {
  const caseData = await get(
    `
      SELECT *
      FROM rti_cases
      WHERE id = ?
      AND user_id = ?
    `,
    [caseId, userId]
  );

  if (!caseData) {
    throw new ApiError(404, "RTI case not found");
  }

  return caseData;
}

async function getCaseBySession(userId, sessionId) {
  const caseData = await get(
    `
      SELECT *
      FROM rti_cases
      WHERE session_id = ?
      AND user_id = ?
    `,
    [sessionId, userId]
  );

  if (!caseData) {
    throw new ApiError(404, "RTI case not found");
  }

  return caseData;
}
async function deleteCaseBySession(userId, sessionId) {
  const caseData = await get(
    `
      SELECT id
      FROM rti_cases
      WHERE session_id = ?
      AND user_id = ?
    `,
    [sessionId, userId]
  );

  if (!caseData) {
    throw new ApiError(404, "RTI case not found");
  }

  // 1. Delete associated messages and drafts
  await run(`DELETE FROM rti_messages WHERE case_id = ?`, [caseData.id]);
  await run(`DELETE FROM rti_drafts WHERE case_id = ?`, [caseData.id]);

  // 2. Delete the case itself
  await run(
    `
      DELETE FROM rti_cases
      WHERE id = ? AND user_id = ?
    `,
    [caseData.id, userId]
  );

  return { message: "Case deleted successfully" };
}

async function clearAllCases(userId) {
  // Get all case IDs for this user
  const userCases = await all(
    `SELECT id FROM rti_cases WHERE user_id = ?`,
    [userId]
  );

  const caseIds = userCases.map((c) => c.id);

  if (caseIds.length > 0) {
    for (const id of caseIds) {
      await run(`DELETE FROM rti_messages WHERE case_id = ?`, [id]);
      await run(`DELETE FROM rti_drafts WHERE case_id = ?`, [id]);
    }

    await run(`DELETE FROM rti_cases WHERE user_id = ?`, [userId]);
  }

  return { message: "All cases cleared successfully" };
}

async function chat(userId, sessionId, message) {
  const caseData = await getCaseBySession(
    userId,
    sessionId
  );

  await run(
    `
      INSERT INTO rti_messages
      (case_id, role, message)
      VALUES (?, ?, ?)
    `,
    [caseData.id, "user", message]
  );

  const aiResponse = await aiService.rtiChat(
    sessionId,
    message
  );

  const aiCase = aiResponse.case || {};

  await run(
    `
      UPDATE rti_cases
      SET
        issue = ?,
        village = ?,
        city = ?,
        district = ?,
        state = ?,
        department = ?,
        information_requested = ?,
        project_details = ?,
        applicant_name = ?,
        applicant_address = ?,
        ready_to_draft = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      aiCase.issue ?? caseData.issue,
      aiCase.village ?? caseData.village,
      aiCase.city ?? caseData.city,
      aiCase.district ?? caseData.district,
      aiCase.state ?? caseData.state,
      aiCase.department ?? caseData.department,
      aiCase.information_requested ??
        caseData.information_requested,
      aiCase.project_details ??
        caseData.project_details,
      aiCase.applicant_name ??
        caseData.applicant_name,
      aiCase.applicant_address ??
        caseData.applicant_address,
      aiCase.ready_to_draft ? 1 : 0,
      caseData.id
    ]
  );

  await run(
    `
      INSERT INTO rti_messages
      (case_id, role, message)
      VALUES (?, ?, ?)
    `,
    [
      caseData.id,
      "assistant",
      aiResponse.response || ""
    ]
  );

  const updatedCase = await getCaseBySession(
    userId,
    sessionId
  );

  return {
    ...aiResponse,
    case_id: updatedCase.id,
    case: updatedCase
  };
}

async function getMessages(userId, sessionId) {
  const caseData = await getCaseBySession(
    userId,
    sessionId
  );

  return all(
    `
      SELECT id, role, message, created_at
      FROM rti_messages
      WHERE case_id = ?
      ORDER BY created_at ASC, id ASC
    `,
    [caseData.id]
  );
}

async function generateDraft(userId, sessionId) {
  const caseData = await getCaseBySession(
    userId,
    sessionId
  );

  if (!caseData.ready_to_draft) {
    throw new ApiError(
      400,
      "RTI case is not ready for draft generation"
    );
  }

  const aiResponse =
    await aiService.generateRtiDraft({
      issue: caseData.issue,
      village: caseData.village,
      city: caseData.city,
      district: caseData.district,
      state: caseData.state,
      department: caseData.department,
      information_requested:
        caseData.information_requested,
      project_details:
        caseData.project_details,
      applicant_name:
        caseData.applicant_name,
      applicant_address:
        caseData.applicant_address
    });

  /*
   * Because the friend's draft response schema is currently
   * unspecified, support the likely text fields without
   * pretending the contract is finalized.
   */
  const draft =
    aiResponse.draft ||
    aiResponse.application ||
    aiResponse.content ||
    JSON.stringify(aiResponse);

  await run(
    `
      INSERT INTO rti_drafts
      (case_id, draft)
      VALUES (?, ?)
    `,
    [caseData.id, draft]
  );

  return {
    case_id: caseData.id,
    draft
  };
}

async function listCases(userId) {
  return all(
    `
      SELECT
        id,
        session_id,
        issue,
        state,
        district,
        ready_to_draft,
        status,
        created_at,
        updated_at
      FROM rti_cases
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `,
    [userId]
  );
}

module.exports = {
  createCase,
  getCaseById,
  getCaseBySession,
  chat,
  getMessages,
  generateDraft,
  listCases,
  deleteCaseBySession,
  clearAllCases
};