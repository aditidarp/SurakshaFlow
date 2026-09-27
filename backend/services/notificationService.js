const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM;
let twilioClient = null;

if (twilioSid && twilioToken && twilioFrom) {
  try {
    const Twilio = require('twilio');
    twilioClient = Twilio(twilioSid, twilioToken);
    console.log('Twilio client initialized for SMS sending');
  } catch (err) {
    console.warn('Twilio module not installed or failed to initialize:', err.message);
    twilioClient = null;
  }
}

const sendSMS = async (phone, message) => {
  if (!phone || !message) {
    throw new Error('phone and message are required');
  }

  // Prefer Twilio when configured
  if (twilioClient) {
    try {
      const res = await twilioClient.messages.create({
        body: message,
        from: twilioFrom,
        to: phone,
      });
      console.log(`[Twilio SMS] sid=${res.sid} to=${phone}`);
      return true;
    } catch (err) {
      console.error('Twilio send error:', err);
      throw err;
    }
  }

  // Fallback mock for development
  console.log(`[Mock SMS] To: ${phone}, Message: ${message}`);
  return Promise.resolve(true);
};

const sendEmail = (email, subject, body) => {
  console.log(`[Mock Email] To: ${email}, Subject: ${subject}, Body: ${body}`);
  return Promise.resolve(true);
};

const sendPush = (userId, message) => {
  console.log(`[Mock Push] User: ${userId}, Message: ${message}`);
  return Promise.resolve(true);
};

// Generic notify function used by controllers
const notify = (data) => {
  console.log(`[Notification Service] Type: ${data.type}, Data:`, JSON.stringify(data, null, 2));
  return Promise.resolve(true);
};

module.exports = { sendSMS, sendEmail, sendPush, notify };


