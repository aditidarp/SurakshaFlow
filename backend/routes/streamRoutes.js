const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const axios = require("axios");

// Helper to send SSE
function sendSSE(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// Stream alerts from DB every 30s
router.get("/alerts", async (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders?.();

  let closed = false;

  const sendLatest = async () => {
    try {
      const alerts = await Alert.find().sort({ date: -1 }).limit(50).lean();
      sendSSE(res, "alerts", alerts);
    } catch (err) {
      sendSSE(res, "error", { message: "Failed to load alerts" });
    }
  };

  // send immediately
  await sendLatest();

  const id = setInterval(() => {
    if (closed) return;
    sendLatest();
  }, 30 * 1000);

  req.on("close", () => {
    closed = true;
    clearInterval(id);
    res.end();
  });
});

// Stream weather for provided coords or default every 60s
router.get("/weather", async (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders?.();

  const apiKey = process.env.OPENWEATHER_API_KEY;
  let closed = false;

  const fetchAndSend = async () => {
    try {
      const { lat, lon } = req.query;
      let url;
      if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      } else {
        // default coords (Mumbai)
        url = `https://api.openweathermap.org/data/2.5/weather?lat=19.0760&lon=72.8777&units=metric&appid=${apiKey}`;
      }
      const r = await axios.get(url);
      const data = r.data;
      // map to minimal payload
      const payload = {
        city: data.name,
        temp: data.main?.temp,
        humidity: data.main?.humidity,
        wind: data.wind?.speed,
        weather: data.weather?.[0]?.main,
        coord: data.coord,
      };
      sendSSE(res, "weather", payload);
    } catch (err) {
      sendSSE(res, "error", { message: "Weather fetch failed" });
    }
  };

  await fetchAndSend();

  const id = setInterval(() => {
    if (closed) return;
    fetchAndSend();
  }, 60 * 1000);

  req.on("close", () => {
    closed = true;
    clearInterval(id);
    res.end();
  });
});

module.exports = router;
