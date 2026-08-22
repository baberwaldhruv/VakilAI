const rtiService = require("../services/rti.service");

async function createCase(req, res, next) {
  try {
    const caseData = await rtiService.createCase(
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    next(error);
  }
}

async function chat(req, res, next) {
  try {
    const result = await rtiService.chat(
      req.user.id,
      req.params.sessionId,
      req.body.message
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getCase(req, res, next) {
  try {
    const result = await rtiService.getCaseBySession(
      req.user.id,
      req.params.sessionId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getMessages(req, res, next) {
  try {
    const result = await rtiService.getMessages(
      req.user.id,
      req.params.sessionId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function generateDraft(req, res, next) {
  try {
    const result = await rtiService.generateDraft(
      req.user.id,
      req.params.sessionId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function listCases(req, res, next) {
  try {
    const result = await rtiService.listCases(
      req.user.id
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
async function deleteCase(req, res, next) {
  try {
    const result = await rtiService.deleteCaseBySession(
      req.user.id,
      req.params.sessionId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function clearAllCases(req, res, next) {
  try {
    const result = await rtiService.clearAllCases(
      req.user.id
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCase,
  chat,
  getCase,
  getMessages,
  generateDraft,
  listCases,
  deleteCase,
  clearAllCases
};