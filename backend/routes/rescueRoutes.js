const express = require('express');
const router = express.Router();
const rescueController = require('../controllers/rescueController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const rescueOnly = require('../middleware/rescueOnlyMiddleware');

// Admin: assign team
router.post('/assign', auth, role('admin'), rescueController.assignTeam);

// Team or Admin: update status
router.put('/status/:sosId', rescueOnly, rescueController.updateStatus);

// Public for rescue teams: list nearby teams (protected)
router.get('/teams/nearby', auth, rescueController.listTeamsNearby);
router.get('/teams', auth, rescueController.listAllTeams);
router.get('/dashboard', rescueOnly, rescueController.getDashboard);
router.post('/missions/accept', rescueOnly, rescueController.acceptMission);
router.put('/missions/:id', rescueOnly, rescueController.updateMission);
router.put('/profile', rescueOnly, rescueController.updateTeamProfile);

module.exports = router;
