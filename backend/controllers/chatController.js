const axios = require("axios");

// Simple AI responses based on keywords
const disasterResponses = {
  flood: "For floods: Move to higher ground immediately. Avoid walking or driving through flood waters. Stay tuned to local news for evacuation orders.",
  earthquake: "During an earthquake: Drop, Cover, and Hold On. Stay indoors until shaking stops. Avoid elevators and windows.",
  fire: "In case of fire: Get out quickly. Stay low to avoid smoke. Call emergency services. Don't go back for belongings.",
  landslide: "For landslides: Move away from the path of the slide. If indoors, stay inside and take cover. Watch for tilted trees or other signs.",
  cyclone: "During cyclones: Stay indoors in a sturdy building. Avoid windows. Have emergency supplies ready. Follow evacuation orders.",
  tsunami: "For tsunamis: Move to higher ground immediately if you feel an earthquake near the coast. Follow tsunami warnings.",
  drought: "During droughts: Conserve water. Follow water rationing guidelines. Be prepared for water shortages.",
  heatwave: "In heatwaves: Stay hydrated. Avoid outdoor activities during peak heat. Use fans or air conditioning. Check on elderly neighbors.",
  coldwave: "During cold waves: Dress warmly in layers. Limit time outdoors. Watch for frostbite and hypothermia signs.",
  emergency: "In emergencies: Call 112 (India's emergency number). Stay calm. Follow instructions from authorities.",
  sos: "For SOS: Use the app's SOS feature to send your location. Stay in a safe place. Help will be dispatched.",
  default: "I'm here to help with disaster preparedness. Ask me about floods, earthquakes, fires, or other emergencies. For immediate help, call 112."
};

const getAIResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  for (const [key, response] of Object.entries(disasterResponses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }

  return disasterResponses.default;
};

// Chat endpoint
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const response = getAIResponse(message);

    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ message: "Chat error", error: error.message });
  }
};