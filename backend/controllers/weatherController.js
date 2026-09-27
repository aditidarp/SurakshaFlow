const axios = require("axios");

// Get current weather by city
exports.getWeatherByCity = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "City name required" });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;

    const weather = {
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      cloudiness: data.clouds.all,
      latitude: data.coord.lat,
      longitude: data.coord.lon,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000)
    };

    res.status(200).json(weather);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch weather data", error: error.message });
  }
};

// Get weather by coordinates
exports.getWeatherByCoords = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: "Latitude and longitude required" });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;

    const weather = {
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      cloudiness: data.clouds.all,
      latitude: data.coord.lat,
      longitude: data.coord.lon,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000)
    };

    res.status(200).json(weather);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch weather data", error: error.message });
  }
};

// Get major cities weather
exports.getMajorCitiesWeather = async (req, res) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const majorCities = [
      { name: "Delhi", lat: 28.7041, lon: 77.1025 },
      { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
      { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
      { name: "Chennai", lat: 13.0827, lon: 80.2707 },
      { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
      { name: "Hyderabad", lat: 17.3850, lon: 78.4867 }
    ];

    const weatherData = [];

    for (const city of majorCities) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${apiKey}`;
        const response = await axios.get(url);
        const data = response.data;

        weatherData.push({
          city: city.name,
          temperature: data.main.temp,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed
        });
      } catch (err) {
        // Continue if one fails
        console.error(`Failed to fetch weather for ${city.name}`);
      }
    }

    res.status(200).json(weatherData);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch weather data", error: error.message });
  }
};

// Get 5-day weather forecast by city
exports.getWeatherForecast = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "City name required" });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;

    // Group forecast by day (take one reading per day, preferably midday)
    const dailyForecast = [];
    const processedDates = new Set();

    for (const item of data.list) {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();

      if (!processedDates.has(dateKey) && dailyForecast.length < 5) {
        // Prefer midday readings (around 12:00)
        const hour = date.getHours();
        if (hour >= 9 && hour <= 15) {
          dailyForecast.push({
            date: date.toLocaleDateString(),
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            temperature: Math.round(item.main.temp),
            minTemp: Math.round(item.main.temp_min),
            maxTemp: Math.round(item.main.temp_max),
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            windSpeed: item.wind.speed,
            precipitation: item.pop * 100 // Probability of precipitation
          });
          processedDates.add(dateKey);
        }
      }
    }

    // If we don't have enough midday readings, take the first available for each day
    if (dailyForecast.length < 5) {
      const additionalForecast = [];
      for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        if (!processedDates.has(dateKey) && additionalForecast.length < (5 - dailyForecast.length)) {
          additionalForecast.push({
            date: date.toLocaleDateString(),
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            temperature: Math.round(item.main.temp),
            minTemp: Math.round(item.main.temp_min),
            maxTemp: Math.round(item.main.temp_max),
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            windSpeed: item.wind.speed,
            precipitation: item.pop * 100
          });
          processedDates.add(dateKey);
        }
      }
      dailyForecast.push(...additionalForecast);
    }

    res.status(200).json({
      city: data.city.name,
      country: data.city.country,
      forecast: dailyForecast
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch forecast data", error: error.message });
  }
};

// Get weather forecasts for multiple major Indian cities
exports.getMultipleCityForecasts = async (req, res) => {
  try {
    const majorCities = [
      { name: "Delhi", lat: 28.7041, lon: 77.1025 },
      { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
      { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
      { name: "Chennai", lat: 13.0827, lon: 80.2707 },
      { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
      { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
      { name: "Pune", lat: 18.5204, lon: 73.8567 },
      { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
      { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
      { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
      { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
      { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
      { name: "Indore", lat: 22.7196, lon: 75.8577 },
      { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
      { name: "Patna", lat: 25.5941, lon: 85.1376 }
    ];

    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    const fetchCityForecast = async (city) => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city.name}&units=metric&appid=${apiKey}`;
        const response = await axios.get(url, { timeout: 5000 });
        const data = response.data;

        // Get today's forecast (first available)
        const todayForecast = data.list[0];
        const tomorrowForecast = data.list.find(item => {
          const itemDate = new Date(item.dt * 1000);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return itemDate.toDateString() === tomorrow.toDateString();
        });

        return {
          city: city.name,
          current: {
            temperature: Math.round(todayForecast.main.temp),
            description: todayForecast.weather[0].description,
            icon: todayForecast.weather[0].icon,
            humidity: todayForecast.main.humidity,
            windSpeed: todayForecast.wind.speed
          },
          tomorrow: tomorrowForecast ? {
            temperature: Math.round(tomorrowForecast.main.temp),
            description: tomorrowForecast.weather[0].description,
            icon: tomorrowForecast.weather[0].icon
          } : null
        };
      } catch (err) {
        console.error(`Failed to fetch forecast for ${city.name}:`, err.message);
        return null; // Return null so we can filter it out later
      }
    };

    // Use Promise.all to fetch all forecasts in parallel
    const results = await Promise.all(majorCities.map(city => fetchCityForecast(city)));
    
    // Filter out any failed requests
    const cityForecasts = results.filter(forecast => forecast !== null);

    res.status(200).json({
      forecasts: cityForecasts,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch multiple city forecasts", error: error.message });
  }
};

// Simulate weather alerts
exports.getWeatherAlerts = async (req, res) => {
  try {
    const alerts = [
      {
        id: 1,
        city: "Delhi",
        type: "Heat Wave",
        severity: 4,
        description: "Extreme temperature alert: 42°C expected",
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 86400000)
      },
      {
        id: 2,
        city: "Mumbai",
        type: "Heavy Rain",
        severity: 3,
        description: "Monsoon rainfall expected: 50-100mm",
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() + 172800000)
      },
      {
        id: 3,
        city: "Bangalore",
        type: "Thunderstorm",
        severity: 2,
        description: "Afternoon thunderstorms expected",
        startTime: new Date(Date.now()),
        endTime: new Date(Date.now() + 36000000)
      }
    ];

    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
