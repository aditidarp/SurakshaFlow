const SOSRequest = require('../models/SOSRequest');
const RescueTeam = require('../models/RescueTeam');
const notification = require('../services/notificationService');
const Alert = require('../models/Alert');
const RescueMission = require('../models/RescueMission');

// Assign a rescue team to a SOS (admin only)
exports.assignTeam = async (req, res) => {
  try {
    const { sosId, teamId } = req.body;
    if (!sosId || !teamId) return res.status(400).json({ message: 'sosId & teamId required' });

    const sos = await SOSRequest.findById(sosId);
    if (!sos) return res.status(404).json({ message: 'SOS not found' });

    sos.assignedTeam = teamId;
    sos.status = 'Assigned';
    await sos.save();

    // notify team (mock)
    notification.notify({ type: 'assignment', sos, teamId });

    res.json({ message: 'Team assigned', sos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update status of a SOS (team or admin)
exports.updateStatus = async (req, res) => {
  try {
    const { sosId } = req.params;
    const { status } = req.body;
    const allowed = ['Pending','Assigned','In Progress','Rescued','Closed'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const sos = await SOSRequest.findById(sosId);
    if (!sos) return res.status(404).json({ message: 'SOS not found' });

    sos.status = status;
    await sos.save();

    res.json({ message: 'Status updated', sos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeam = async (req) => {
  const user = await require('../models/User').findById(req.user.id).select('rescueProfile name email');
  if (!user?.rescueProfile?.teamId) return null;
  return RescueTeam.findById(user.rescueProfile.teamId);
};

exports.getDashboard = async (req, res) => {
  try {
    const team = await getTeam(req);
    if (!team) return res.status(404).json({ message: 'Rescue team profile is not linked' });
    const [incidents, requests, missions] = await Promise.all([
      Alert.find({ status: { $nin: ['Resolved', 'Cancelled', 'Expired'] } }).sort({ sentAt: -1, createdAt: -1 }).limit(100).lean(),
      SOSRequest.find({ status: { $nin: ['Closed', 'Rescued'] } }).sort({ urgency: 1, createdAt: -1 }).limit(100).lean(),
      RescueMission.find({ team: team._id }).populate('incident rescueRequest').sort({ updatedAt: -1 }).limit(100).lean(),
    ]);
    res.json({ team, incidents, requests, missions, lastAlertUpdate: incidents[0]?.sentAt || incidents[0]?.createdAt || null });
  } catch (err) {
    console.error('[RescueDashboard]', err);
    res.status(500).json({ message: 'Unable to load rescue dashboard' });
  }
};

exports.acceptMission = async (req, res) => {
  try {
    const team = await getTeam(req);
    if (!team) return res.status(404).json({ message: 'Rescue team profile is not linked' });
    const { incidentId, requestId } = req.body;
    if (!incidentId && !requestId) return res.status(400).json({ message: 'incidentId or requestId is required' });
    const mission = await RescueMission.findOneAndUpdate(
      { team: team._id, ...(incidentId ? { incident: incidentId } : { rescueRequest: requestId }) },
      { $setOnInsert: { team: team._id, incident: incidentId, rescueRequest: requestId, status: 'ACCEPTED', startedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('incident rescueRequest');
    if (requestId) await SOSRequest.findByIdAndUpdate(requestId, { assignedTeam: team._id, status: 'Assigned' });
    req.app.get('io')?.emit('rescueMissionUpdated', mission);
    res.status(201).json(mission);
  } catch (err) {
    console.error('[AcceptMission]', err);
    res.status(500).json({ message: 'Unable to accept mission' });
  }
};

exports.updateMission = async (req, res) => {
  try {
    const team = await getTeam(req);
    const allowed = ['AVAILABLE', 'ASSIGNED', 'ACCEPTED', 'ON THE WAY', 'AT LOCATION', 'RESCUE IN PROGRESS', 'EVACUATION IN PROGRESS', 'RESOURCES NEEDED', 'COMPLETED'];
    const { status, message, resources } = req.body;
    if (!allowed.includes(status) && !message && !resources) return res.status(400).json({ message: 'Valid status, update, or resources required' });
    const update = {};
    if (status) update.status = status;
    if (status === 'COMPLETED') update.completedAt = new Date();
    if (message) update.$push = { updates: { message, author: req.user.id } };
    if (resources) update.resources = resources;
    const mission = await RescueMission.findOneAndUpdate({ _id: req.params.id, team: team?._id }, update, { new: true }).populate('incident rescueRequest');
    if (!mission) return res.status(404).json({ message: 'Mission not found for this team' });
    req.app.get('io')?.emit('rescueMissionUpdated', mission);
    res.json(mission);
  } catch (err) {
    console.error('[UpdateMission]', err);
    res.status(500).json({ message: 'Unable to update mission' });
  }
};

exports.updateTeamProfile = async (req, res) => {
  try {
    const User = require('../models/User');
    const allowed = ['AVAILABLE', 'BUSY', 'OFFLINE'];
    const updates = {};
    if (allowed.includes(req.body.status)) updates['rescueProfile.status'] = req.body.status;
    if (typeof req.body.locationSharingEnabled === 'boolean') updates['rescueProfile.locationSharingEnabled'] = req.body.locationSharingEnabled;
    if (req.body.locationSharingEnabled && Array.isArray(req.body.coordinates)) updates['rescueProfile.currentLocation'] = { type: 'Point', coordinates: req.body.coordinates.map(Number) };
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');
    res.json(user?.rescueProfile || {});
  } catch (err) { res.status(500).json({ message: 'Unable to update team profile' }); }
};

// Rescue teams listing (nearby)
exports.listTeamsNearby = async (req, res) => {
  try {
    const { lat, lon, radius = 50000 } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat & lon required' });

    const teams = await RescueTeam.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(radius, 10),
        }
      }
    }).limit(100);

    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List all rescue teams (Admin or Rescue)
exports.listAllTeams = async (req, res) => {
  try {
    const teams = await RescueTeam.find().sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
