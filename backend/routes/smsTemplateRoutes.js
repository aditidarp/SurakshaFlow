const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const smsTemplateController = require("../controllers/smsTemplateController");

/**
 * SMS Template Routes
 * Most routes require admin authentication
 */

// Create new SMS template
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  smsTemplateController.createTemplate
);

// Get all templates with filters
router.get(
  "/",
  authMiddleware,
  smsTemplateController.getTemplates
);

// Get templates by disaster type
router.get(
  "/type/:disasterType",
  authMiddleware,
  smsTemplateController.getTemplatesByType
);

// Get single template
router.get(
  "/:id",
  authMiddleware,
  smsTemplateController.getTemplate
);

// Update template
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  smsTemplateController.updateTemplate
);

// Delete template
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  smsTemplateController.deleteTemplate
);

// Track template usage
router.post(
  "/:id/use",
  authMiddleware,
  smsTemplateController.useTemplate
);

module.exports = router;
