/**
 * SMS Service - Handles SMS alerts using Twilio
 * For India-specific: Can be replaced with Fast2SMS API
 */

const twilio = require("twilio");

// Initialize Twilio client (only if credentials are properly set)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";

// Lazy initialize Twilio client - only if valid account SID is provided
let client = null;
const initializeTwilio = () => {
  if (accountSid && accountSid.startsWith('AC') && authToken) {
    try {
      client = twilio(accountSid, authToken);
      console.log('[SMS Service] Twilio client initialized successfully');
    } catch (err) {
      console.error('[SMS Service] Failed to initialize Twilio:', err.message);
    }
  } else {
    console.warn('[SMS Service] Twilio credentials not properly configured. SMS via Twilio will be disabled.');
  }
};

// Initialize on module load
initializeTwilio();

/**
 * Send SMS to a single user
 * @param {string} phoneNumber - Recipient phone number with country code
 * @param {string} message - SMS message content
 * @returns {Promise} - Twilio response
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    // Check if Twilio is initialized
    if (!client) {
      console.warn(`[SMS Service] Twilio not initialized. SMS to ${phoneNumber} would be sent if credentials were configured.`);
      return {
        success: false,
        error: 'Twilio not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env',
        messageId: 'MOCK_' + Date.now(),
        status: 'mock',
        timestamp: new Date(),
      };
    }

    const result = await client.messages.create({
      body: message.substring(0, 160), // SMS max 160 chars
      from: fromNumber,
      to: phoneNumber,
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`SMS Error for ${phoneNumber}:`, error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
};

/**
 * Send bulk SMS to multiple users
 * @param {Array} users - Array of user objects with phone numbers
 * @param {string} message - SMS message content
 * @returns {Promise} - Array of results
 */
const sendBulkSMS = async (users, message) => {
  const results = [];
  const batchSize = 10; // Process in batches to avoid rate limits

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    const batchPromises = batch.map((user) =>
      sendSMS(user.phone, message).then((result) => ({
        userId: user._id,
        phone: user.phone,
        name: user.name,
        ...result,
      }))
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches to respect rate limits
    if (i + batchSize < users.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
};

/**
 * Format disaster alert message
 * @param {Object} alert - Alert object
 * @returns {string} - Formatted message
 */
const formatAlertMessage = (alert) => {
  const emoji = {
    flood: "🌊",
    earthquake: "📍",
    cyclone: "🌪️",
    fire: "🔥",
    landslide: "⛰️",
  };

  const icon = emoji[alert.type?.toLowerCase()] || "🚨";
  const severity = alert.severity ? `[${alert.severity.toUpperCase()}]` : "";

  return `${icon} ALERT ${severity}: ${alert.type} in ${alert.location}. ${alert.message}`;
};

/**
 * Make a voice call using Twilio
 * @param {string} toNumber - Recipient phone number with country code
 * @param {string} message - Message to be spoken in the call
 * @returns {Promise} - Twilio response
 */
const makeVoiceCall = async (toNumber, message) => {
  try {
    // Check if Twilio is initialized
    if (!client) {
      console.warn(`[Voice Service] Twilio not initialized. Voice call to ${toNumber} would be made if credentials were configured.`);
      return {
        success: false,
        error: 'Twilio not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env',
        callSid: 'MOCK_' + Date.now(),
        status: 'mock',
        timestamp: new Date(),
      };
    }

    // Create TwiML for the call
    const twiml = `<Response><Say voice="alice" language="en-IN">${message}</Say></Response>`;

    const call = await client.calls.create({
      twiml: twiml,
      to: toNumber,
      from: fromNumber,
    });

    console.log(`[Voice Service] Call initiated to ${toNumber}, SID: ${call.sid}`);

    return {
      success: true,
      callSid: call.sid,
      status: call.status,
      timestamp: new Date(),
      to: toNumber,
      from: fromNumber,
    };
  } catch (error) {
    console.error('[Voice Service] Error making voice call:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
};

/**
 * Send SMS using Fast2SMS API
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Message to send
 * @returns {Promise} - Fast2SMS response
 */
const sendSMSFast2SMS = async (phoneNumber, message) => {
  try {
    const axios = require("axios");
    const apiKey = process.env.FAST2SMS_API_KEY;

    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {},
      {
        headers: {
          authorization: apiKey,
        },
        params: {
          message: message,
          numbers: phoneNumber.replace("+", ""), // Remove + for Fast2SMS
          language: "english",
        },
      }
    );

    return {
      success: response.data.return === true,
      messageId: response.data.request_id,
      status: "sent",
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Fast2SMS Error:", error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  formatAlertMessage,
  sendSMSFast2SMS,
  makeVoiceCall,
};
