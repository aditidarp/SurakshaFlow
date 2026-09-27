const axios = require("axios");

// Get earthquake data (simulated)
exports.getEarthquakes = async (req, res) => {
  try {
    // In production, fetch from USGS Earthquake Hazards Program API
    // For now, return simulated data
    const earthquakes = [
      {
        id: 1,
        magnitude: 4.2,
        location: "Himachal Pradesh",
        latitude: 32.5,
        longitude: 77.1,
        depth: 12,
        timestamp: new Date(Date.now() - 3600000),
        region: "NW India"
      },
      {
        id: 2,
        magnitude: 3.8,
        location: "Tamil Nadu",
        latitude: 12.9,
        longitude: 80.1,
        depth: 20,
        timestamp: new Date(Date.now() - 7200000),
        region: "South India"
      },
      {
        id: 3,
        magnitude: 4.5,
        location: "Uttarakhand",
        latitude: 29.5,
        longitude: 79.5,
        depth: 15,
        timestamp: new Date(Date.now() - 10800000),
        region: "North India"
      }
    ];

    res.status(200).json(earthquakes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get earthquake details
exports.getEarthquakeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const earthquakes = [
      {
        id: 1,
        magnitude: 4.2,
        location: "Himachal Pradesh",
        latitude: 32.5,
        longitude: 77.1,
        depth: 12,
        timestamp: new Date(),
        region: "NW India",
        description: "Moderate earthquake detected in northern regions"
      }
    ];

    const earthquake = earthquakes.find(eq => eq.id === parseInt(id));
    if (!earthquake) return res.status(404).json({ message: "Earthquake not found" });

    res.status(200).json(earthquake);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get recent earthquakes
exports.getRecentEarthquakes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const earthquakes = [
      {
        id: 1,
        magnitude: 4.2,
        location: "Himachal Pradesh",
        latitude: 32.5,
        longitude: 77.1,
        depth: 12,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        magnitude: 3.8,
        location: "Tamil Nadu",
        latitude: 12.9,
        longitude: 80.1,
        depth: 20,
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: 3,
        magnitude: 4.5,
        location: "Uttarakhand",
        latitude: 29.5,
        longitude: 79.5,
        depth: 15,
        timestamp: new Date(Date.now() - 10800000)
      }
    ];

    res.status(200).json(earthquakes.slice(0, limit));
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
