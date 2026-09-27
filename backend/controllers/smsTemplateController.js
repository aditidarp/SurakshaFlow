const SMSTemplate = require("../models/SMSTemplate");

/**
 * Create SMS Template
 * POST /api/sms-templates
 */
exports.createTemplate = async (req, res) => {
  try {
    const { name, disasterType, message, description, variables } = req.body;
    const adminId = req.user.id;

    // Check if admin
    const User = require("../models/User");
    const user = await User.findById(adminId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create templates",
      });
    }

    // Check if template name already exists
    const existingTemplate = await SMSTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: "Template with this name already exists",
      });
    }

    // Validate message length
    if (message.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Message exceeds 160 character limit",
      });
    }

    const template = new SMSTemplate({
      name,
      disasterType,
      message,
      description,
      variables: variables || [],
      createdBy: adminId,
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      template,
    });
  } catch (error) {
    console.error("Create Template Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get All Templates
 * GET /api/sms-templates
 */
exports.getTemplates = async (req, res) => {
  try {
    const { disasterType, isActive } = req.query;

    let filter = {};
    if (disasterType) filter.disasterType = disasterType;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const templates = await SMSTemplate.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error("Get Templates Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get Single Template
 * GET /api/sms-templates/:templateId
 */
exports.getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await SMSTemplate.findById(templateId).populate(
      "createdBy",
      "name email"
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Get Template Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update Template
 * PUT /api/sms-templates/:templateId
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { name, message, description, variables, isActive } = req.body;
    const adminId = req.user.id;

    // Check if admin
    const User = require("../models/User");
    const user = await User.findById(adminId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update templates",
      });
    }

    const template = await SMSTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Check message length if being updated
    if (message && message.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Message exceeds 160 character limit",
      });
    }

    // Update fields
    if (name) template.name = name;
    if (message) template.message = message;
    if (description) template.description = description;
    if (variables) template.variables = variables;
    if (isActive !== undefined) template.isActive = isActive;

    template.updatedAt = new Date();

    await template.save();

    res.status(200).json({
      success: true,
      message: "Template updated successfully",
      template,
    });
  } catch (error) {
    console.error("Update Template Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Delete Template
 * DELETE /api/sms-templates/:templateId
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const adminId = req.user.id;

    // Check if admin
    const User = require("../models/User");
    const user = await User.findById(adminId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete templates",
      });
    }

    const template = await SMSTemplate.findByIdAndDelete(templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Delete Template Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Use Template (increment usage count)
 * POST /api/sms-templates/:templateId/use
 */
exports.useTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await SMSTemplate.findByIdAndUpdate(
      templateId,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Template usage recorded",
      template,
    });
  } catch (error) {
    console.error("Use Template Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get templates by disaster type
 * GET /api/sms-templates/type/:disasterType
 */
exports.getTemplatesByType = async (req, res) => {
  try {
    const { disasterType } = req.params;

    const templates = await SMSTemplate.find({
      disasterType,
      isActive: true,
    })
      .populate("createdBy", "name email")
      .sort({ usageCount: -1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error("Get Templates by Type Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
