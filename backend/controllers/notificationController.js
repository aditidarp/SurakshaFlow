const notificationService = require('../services/notificationService');

// POST /api/notify/sms (Admin only)
exports.sendSMS = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ message: 'phone and message are required' });
    }

    // Use notificationService to send SMS (mock or real provider)
    await notificationService.sendSMS(phone, message);

    res.status(200).json({ message: 'SMS sent (mock)', success: true });
  } catch (err) {
    console.error('Failed to send SMS:', err);
    res.status(500).json({ message: 'Failed to send SMS' });
  }
};