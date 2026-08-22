const express = require("express");

const controller = require("../controllers/rti.controller");

const { authenticate } = require("../middleware/auth.middleware");

const validate = require("../middleware/validation.middleware");

const {
  chatValidator
} = require("../validators/rti.validator");

const router = express.Router();

router.use(authenticate);

router.post(
  "/cases",
  controller.createCase
);

router.get(
  "/cases",
  controller.listCases
);

router.delete(
  "/cases",
  controller.clearAllCases
);

router.get(
  "/cases/:sessionId",
  controller.getCase
);

router.delete(
  "/cases/:sessionId",
  controller.deleteCase
);

router.get(
  "/cases/:sessionId/messages",
  controller.getMessages
);

router.post(
  "/cases/:sessionId/chat",
  chatValidator,
  validate,
  controller.chat
);

router.post(
  "/cases/:sessionId/draft",
  controller.generateDraft
);

module.exports = router;