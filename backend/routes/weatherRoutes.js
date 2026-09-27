const express = require("express");
const router = express.Router();

const { checkWeather } = require("../services/weatherService");
const { getWeatherByCity, getWeatherByCoords, getWeatherForecast, getMultipleCityForecasts } = require("../controllers/weatherController");

router.get("/check", checkWeather);
router.get("/", getWeatherByCity);
router.get("/coords", getWeatherByCoords);
router.get("/forecast", getWeatherForecast);
router.get("/forecasts", getMultipleCityForecasts);

module.exports = router;
