const axios = require("axios");

const checkWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "lat & lon required" });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    let alert = "Normal weather";

    if (data.weather[0].main === "Rain" && data.main.humidity > 80) {
      alert = "⚠ Flood alert due to heavy rain";
    }

    if (data.wind.speed > 20) {
      alert = "⚠ Cyclone / Storm alert";
    }

    res.json({
      city: data.name,
      temp: data.main.temp,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      weather: data.weather[0].main,
      alert
    });

  } catch (err) {
    res.status(500).json({
      error: "OpenWeather API error",
      details: err.response?.data || err.message
    });
  }
};

module.exports = { checkWeather };
