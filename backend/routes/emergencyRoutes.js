const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticate } = require('../middleware/auth');

router.post('/sos', authenticate, emergencyController.triggerSOS);
router.get('/nearby', emergencyController.getNearbyResources);
router.get('/zones', emergencyController.getCrimeZones);
router.get('/contacts', authenticate, emergencyController.getEmergencyContacts);
router.post('/contacts', authenticate, emergencyController.addEmergencyContact);
router.delete('/contacts/:phone', authenticate, emergencyController.deleteEmergencyContact);

module.exports = router;
