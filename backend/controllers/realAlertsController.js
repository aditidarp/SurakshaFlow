// Real Alerts Controller - combines external API alerts with admin alerts
const Alert = require("../models/Alert");
const { fetchOfficialAlerts, getActiveOfficialAlerts } = require("../services/capAlertService");

const refreshOfficialAlerts = async () => {
  await fetchOfficialAlerts();
  return getActiveOfficialAlerts();
};

// Get combined alerts (external + admin)
exports.getCombinedAlerts = async (req, res) => {
  try {
    // Fetch admin-created alerts
    const adminAlerts = await Alert.find({ source: { $nin: ['IMD_CAP', 'SACHET_CAP'] } })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Add source metadata
    const adminAlertsWithSource = adminAlerts.map(alert => ({
      ...alert,
      source: 'ADMIN',
      external: false,
      badge: 'Custom Alert'
    }));

    // Fetch real-world alerts
    const realAlerts = (await refreshOfficialAlerts()).map(alert => ({ ...alert, badge: 'Official Alert', external: true }));

    // Combine and sort by date
    const combined = [...adminAlertsWithSource, ...realAlerts];
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      total: combined.length,
      admin: adminAlertsWithSource.length,
      external: realAlerts.length,
      source: 'IMD_CAP/SACHET_CAP',
      sourceAvailable: true,
      alerts: combined
    });
  } catch (error) {
    console.error('Error fetching combined alerts:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get only external alerts
exports.getExternalAlerts = async (req, res) => {
  try {
    const realAlerts = await refreshOfficialAlerts();
    
    res.status(200).json({
      total: realAlerts.length,
      alerts: realAlerts
    });
  } catch (error) {
    console.error('Error fetching external alerts:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get weather alerts only
exports.getWeatherAlerts = async (req, res) => {
  try {
    const { fetchWeatherAlerts } = require("../services/realAlertsService");
    const alerts = await fetchWeatherAlerts();
    
    res.status(200).json({
      source: 'IMD_CAP/SACHET_CAP',
      total: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get disaster alerts from NASA EONET
exports.getDisasterAlerts = async (req, res) => {
  try {
    const alerts = await refreshOfficialAlerts();
    
    res.status(200).json({
      source: 'IMD_CAP/SACHET_CAP',
      total: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error fetching disaster alerts:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get earthquake alerts from USGS
exports.getEarthquakeAlerts = async (req, res) => {
  try {
    const alerts = (await refreshOfficialAlerts()).filter(alert => alert.type === 'Earthquake');
    
    res.status(200).json({
      source: 'IMD_CAP/SACHET_CAP',
      total: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error fetching earthquake alerts:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search alerts by location, severity, or type
exports.searchAlerts = async (req, res) => {
  try {
    const { keyword, severity, type, source } = req.query;

    // Fetch combined alerts
    const adminAlerts = await Alert.find({ source: { $nin: ['IMD_CAP', 'SACHET_CAP'] } })
      .populate('createdBy', 'name email')
      .lean();

    const realAlerts = await refreshOfficialAlerts();
    const combined = [
      ...adminAlerts.map(a => ({ ...a, source: 'ADMIN', external: false })),
      ...realAlerts.map(a => ({ ...a, external: true }))
    ];

    // Apply filters
    let filtered = combined;

    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(lower) ||
        a.description?.toLowerCase().includes(lower) ||
        a.location?.toLowerCase().includes(lower)
      );
    }

    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }

    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }

    if (source) {
      filtered = filtered.filter(a => a.source === source);
    }

    res.status(200).json({
      query: { keyword, severity, type, source },
      total: filtered.length,
      alerts: filtered
    });
  } catch (error) {
    console.error('Error searching alerts:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get alerts by type with stats
exports.getAlertStats = async (req, res) => {
  try {
    const adminAlerts = await Alert.find({ source: { $nin: ['IMD_CAP', 'SACHET_CAP'] } }).lean();
    const realAlerts = await refreshOfficialAlerts();
    const combined = [...adminAlerts, ...realAlerts];

    // Build statistics
    const stats = {
      total: combined.length,
      bySource: {
        admin: adminAlerts.length,
        external: realAlerts.length
      },
      bySeverity: {
        Critical: combined.filter(a => a.severity === 'Critical').length,
        High: combined.filter(a => a.severity === 'High').length,
        Medium: combined.filter(a => a.severity === 'Medium').length,
        Low: combined.filter(a => a.severity === 'Low').length
      },
      byType: {},
      bySource_: {}
    };

    // Count by type
    combined.forEach(alert => {
      const type = alert.type || 'Unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    // Count by source
    combined.forEach(alert => {
      const src = alert.source || 'Unknown';
      stats.bySource_[src] = (stats.bySource_[src] || 0) + 1;
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
