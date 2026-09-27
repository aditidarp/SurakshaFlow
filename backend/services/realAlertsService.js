// Real-world alerts service - fetches from external disaster APIs
const axios = require('axios');
const { normalizeAlert } = require('../utils/alertNormalizer');

const CACHE = {
  weather: { data: [], timestamp: 0 },
  disasters: { data: [], timestamp: 0 },
  earthquakes: { data: [], timestamp: 0 }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// =====================================================
// OPENWEATHER ALERTS API
// =====================================================
const fetchWeatherAlerts = async () => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ OpenWeather API key not configured');
      return [];
    }

    const locations = [
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
      { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
      { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
      { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
      { name: 'Pune', lat: 18.5204, lon: 73.8567 },
      { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 }
    ];

    const alerts = [];

    for (const location of locations) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.lon}&exclude=minutely,hourly,daily,current&appid=${apiKey}&units=metric`,
          { timeout: 7000 }
        );

        const data = response.data;
        const baseGeometry = {
          type: 'Point',
          coordinates: [location.lon, location.lat]
        };

        if (Array.isArray(data.alerts) && data.alerts.length > 0) {
          for (const alert of data.alerts) {
            alerts.push(
              normalizeAlert(
                {
                  title: alert.event,
                  description: alert.description || `Weather alert from OpenWeatherMap for ${location.name}`,
                  severity: alert.tags?.includes('EXTREME') ? 'Critical' : 'High',
                  location: location.name,
                  date: alert.start ? new Date(alert.start * 1000).toISOString() : new Date().toISOString(),
                  url: 'https://openweathermap.org',
                  geometry: baseGeometry
                },
                'OPENWEATHER'
              )
            );
          }
        }

        if (data.current) {
          const current = data.current;
          if (current.wind_speed >= 15 || current.weather?.[0]?.main === 'Tornado') {
            alerts.push(
              normalizeAlert(
                {
                  title: `Severe ${current.weather?.[0]?.main || 'Wind'} in ${location.name}`,
                  description: current.weather?.[0]?.description || 'Severe weather conditions detected.',
                  severity: 'High',
                  location: location.name,
                  date: new Date().toISOString(),
                  url: 'https://openweathermap.org',
                  geometry: baseGeometry
                },
                'OPENWEATHER'
              )
            );
          }
        }
      } catch (err) {
        console.error(`Error fetching OpenWeather alerts for ${location.name}:`, err.message);
      }
    }

    return alerts;
  } catch (error) {
    console.error('❌ Error fetching OpenWeather alerts:', error.message);
    return [];
  }
};

// =====================================================
// NASA EONET API (Natural Disasters)
// =====================================================
const fetchNASADisasters = async () => {
  try {
    // Free NASA EONET API - no key required
    const response = await axios.get(
      'https://eonet.gsfc.nasa.gov/api/v3/events?limit=100',
      { timeout: 10000 }
    );

    const events = response.data.events || [];
    
    return events
      .filter(event => {
        // Filter to active events only
        const lastUpdate = new Date(event.closed ? event.closed : event.geometry?.[0]?.date);
        const daysSince = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince < 30; // Events from last 30 days
      })
      .slice(0, 20) // Limit to 20 events
      .map(event => {
        const location = event.geometry?.[0];
        return normalizeAlert(
          {
            title: event.title,
            description: `NASA EONET Alert: ${event.description || event.title}`,
            location: location ? `${location.coordinates[1].toFixed(2)}°, ${location.coordinates[0].toFixed(2)}°` : 'Global',
            date: location?.date || event.geometry?.[0]?.date || new Date().toISOString(),
            category: event.categories?.[0],
            geometry: {
              type: 'Point',
              coordinates: location?.coordinates || [0, 0]
            },
            url: `https://eonet.gsfc.nasa.gov/events/${event.id}`
          },
          'NASA_EONET'
        );
      });
  } catch (error) {
    console.error('❌ Error fetching NASA EONET disasters:', error.message);
    return [];
  }
};

// =====================================================
// USGS EARTHQUAKE API
// =====================================================
const fetchEarthquakes = async () => {
  try {
    // Free USGS earthquake API - no key required
    const response = await axios.get(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson',
      { timeout: 10000 }
    );

    const features = response.data.features || [];

    return features
      .slice(0, 20) // Limit to 20 earthquakes
      .map(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;

        return normalizeAlert(
          {
            title: `Earthquake - Magnitude ${props.mag}`,
            description: props.title || `Earthquake of magnitude ${props.mag}`,
            severity: props.mag >= 7 ? 'Critical' : props.mag >= 6 ? 'High' : 'Medium',
            location: props.place || `${coords[1].toFixed(2)}°, ${coords[0].toFixed(2)}°`,
            time: props.time,
            properties: props,
            geometry: feature.geometry,
            url: props.url
          },
          'USGS'
        );
      });
  } catch (error) {
    console.error('❌ Error fetching USGS earthquakes:', error.message);
    return [];
  }
};

// =====================================================
// COMBINED ALERTS FETCH
// =====================================================
const fetchAllRealAlerts = async () => {
  try {
    // Check cache
    const now = Date.now();
    let allAlerts = [];

    // Fetch in parallel
    const [weatherAlerts, disasters, earthquakes] = await Promise.allSettled([
      fetchWeatherAlerts(),
      fetchNASADisasters(),
      fetchEarthquakes()
    ]).then(results =>
      results.map(r => r.status === 'fulfilled' ? r.value : [])
    );

    allAlerts = [
      ...weatherAlerts,
      ...disasters,
      ...earthquakes
    ];

    console.log(`✅ Fetched ${allAlerts.length} real-world alerts`);

    // Update cache
    CACHE.lastFetch = now;

    return allAlerts;
  } catch (error) {
    console.error('❌ Error fetching all real alerts:', error.message);
    return [];
  }
};

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  fetchAllRealAlerts,
  fetchWeatherAlerts,
  fetchNASADisasters,
  fetchEarthquakes
};
