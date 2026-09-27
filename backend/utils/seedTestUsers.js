const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RescueTeam = require('../models/RescueTeam');
const Alert = require('../models/Alert');

/**
 * Seeds test users and rescue teams for development/testing
 * Creates user, admin, rescue team accounts and rescue teams if they don't exist
 */
const seedTestUsers = async () => {
  try {
    const testUsers = [
      {
        name: "Test User",
        email: "user@gmail.com",
        password: "123456",
        role: "user"
      },
      {
        name: "Test Admin",
        email: "admin@gmail.com",
        password: "123456",
        role: "admin"
      },
      {
        name: "Rescue Team Alpha",
        email: "rescue@gmail.com",
        password: "123456",
        role: "rescue_team"
      },
      {
        name: "Emergency SMS User",
        email: "smsuser@gmail.com",
        password: "123456",
        role: "user",
        phone: "+919325431535",
        location: "Mumbai",
        state: "Maharashtra",
        optInSMS: true,
        coordinates: { lat: 19.0760, lng: 72.8777 },
        smsPreferences: {
          floodAlerts: true,
          earthquakeAlerts: true,
          cycloneAlerts: true,
          fireAlerts: true,
          landslideAlerts: true,
          minimumSeverity: 'Low',
          alertsPerDay: 100,
          quietHours: { enabled: false }
        }
      }
    ];

    for (const userData of testUsers) {
      const userExists = await User.findOne({ email: userData.email });

      if (!userExists) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const newUser = new User({
          ...userData,
          password: hashedPassword
        });

        await newUser.save();
        console.log(`✅ Created test user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`⏭️  Test user already exists: ${userData.email}`);
      }
    }

    // Seed rescue teams
    const testRescueTeams = [
      {
        name: "Rescue Team Alpha",
        contact: "+91-9876543210",
        members: [
          { name: "John Doe", phone: "+91-9876543211" },
          { name: "Jane Smith", phone: "+91-9876543212" }
        ],
        location: {
          type: "Point",
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        },
        active: true
      },
      {
        name: "Rescue Team Beta",
        contact: "+91-9876543213",
        members: [
          { name: "Mike Johnson", phone: "+91-9876543214" },
          { name: "Sarah Wilson", phone: "+91-9876543215" }
        ],
        location: {
          type: "Point",
          coordinates: [72.8777, 19.0760] // Mumbai coordinates
        },
        active: true
      },
      {
        name: "Rescue Team Gamma",
        contact: "+91-9876543216",
        members: [
          { name: "David Brown", phone: "+91-9876543217" }
        ],
        location: {
          type: "Point",
          coordinates: [88.3639, 22.5726] // Kolkata coordinates
        },
        active: false
      }
    ];

    for (const teamData of testRescueTeams) {
      const teamExists = await RescueTeam.findOne({ name: teamData.name });
      
      if (!teamExists) {
        const newTeam = new RescueTeam(teamData);
        await newTeam.save();
        console.log(`✅ Created rescue team: ${teamData.name}`);
      } else {
        console.log(`⏭️  Rescue team already exists: ${teamData.name}`);
      }
    }

    const rescueUser = await User.findOne({ email: 'rescue@gmail.com' });
    const rescueTeam = await RescueTeam.findOne({ name: 'Rescue Team Alpha' });
    if (rescueUser && rescueTeam && rescueUser.rescueProfile?.teamId?.toString() !== rescueTeam._id.toString()) {
      rescueUser.set('rescueProfile.teamId', rescueTeam._id);
      rescueUser.set('rescueProfile.teamName', rescueTeam.name);
      rescueUser.set('rescueProfile.organization', 'SurakshaFlow demonstration rescue network');
      rescueUser.set('rescueProfile.teamType', 'Multi-hazard response');
      rescueUser.set('rescueProfile.status', 'AVAILABLE');
      await rescueUser.save();
    }

    if (process.env.NODE_ENV === 'production' || process.env.SEED_SAMPLE_ALERTS === 'false') {
      return;
    }

    // Seed sample alerts only for local development.
    const sampleAlerts = [
      {
        title: "Flood Alert - Brahmaputra River",
        description: "Heavy rainfall has caused Brahmaputra river levels to rise dangerously. Low-lying areas in Guwahati are at risk of flooding.",
        type: "flood",
        location: "Guwahati, Assam",
        coordinates: {
          type: "Point",
          coordinates: [91.7362, 26.1445]
        },
        severity: "High",
        status: "Pending",
        affectedArea: "5 districts",
        casualties: 0
      },
      {
        title: "Earthquake Warning - Uttarakhand",
        description: "Seismic activity detected in Uttarkashi region. Magnitude 4.8 earthquake recorded. Aftershocks expected.",
        type: "earthquake",
        location: "Uttarkashi, Uttarakhand",
        coordinates: {
          type: "Point",
          coordinates: [78.9355, 30.7278]
        },
        severity: "Medium",
        status: "Assigned",
        affectedArea: "Mountainous regions",
        casualties: 2
      },
      {
        title: "Forest Fire - Shimla Hills",
        description: "Wildfire spreading rapidly in Shimla forest areas. Aerial support requested for containment.",
        type: "fire",
        location: "Shimla, Himachal Pradesh",
        coordinates: {
          type: "Point",
          coordinates: [77.1734, 31.1048]
        },
        severity: "Critical",
        status: "Resolved",
        affectedArea: "200 hectares",
        casualties: 0
      }
    ];

    for (const alertData of sampleAlerts) {
      const alertExists = await Alert.findOne({ title: alertData.title });
      
      if (!alertExists) {
        const newAlert = new Alert(alertData);
        await newAlert.save();
        console.log(`✅ Created sample alert: ${alertData.title}`);
      } else {
        console.log(`⏭️  Sample alert already exists: ${alertData.title}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
    // Don't throw - allow app to continue even if seeding fails
  }
};

module.exports = seedTestUsers;
