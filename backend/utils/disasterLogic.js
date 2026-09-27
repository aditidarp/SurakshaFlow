exports.detectDisaster = (weather) => {
  if (weather.rainfall > 100) return "Flood";
  if (weather.windSpeed > 120) return "Cyclone";
  if (weather.temperature > 45) return "Heatwave";
  return null;
};
