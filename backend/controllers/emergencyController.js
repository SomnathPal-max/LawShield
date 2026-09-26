const { randomUUID: uuidv4 } = require('crypto');
const { store } = require('../services/dataStore');

// Helper to compute distance in km
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Trigger SOS Incident
exports.triggerSOS = (req, res) => {
  try {
    const { lat, lng, address = 'Current Coordinates', notes = 'Urgent SOS Signal Triggered' } = req.body;
    const user = store.users.find(u => u._id === req.user._id) || req.user;

    const contactsAlerted = (user.emergencyContacts || []).map(c => ({
      name: c.name,
      phone: c.phone,
      status: 'SMS/Call Dispatch Triggered (Simulated)',
    }));

    const incident = {
      _id: 'sos_' + uuidv4().slice(0, 8),
      userId: user._id,
      userName: user.name,
      userPhone: user.phone || 'Not Provided',
      location: {
        lat: Number(lat) || 28.6139,
        lng: Number(lng) || 77.2090,
        address,
      },
      contactsAlerted,
      status: 'active',
      notes,
      createdAt: new Date(),
    };

    store.emergencyIncidents.unshift(incident);

    // Create a high-priority system notification
    store.notifications.unshift({
      _id: 'notif_' + uuidv4().slice(0, 8),
      userId: user._id,
      title: '🚨 Emergency SOS Dispatched',
      message: `Emergency SOS record created with coordinates [${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}]. Trusted contacts have been prioritized.`,
      type: 'emergency',
      read: false,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency SOS Broadcast Generated',
      incident,
      emergencyHotlines: [
        { label: 'Police Emergency', number: '112' },
        { label: 'National Women Helpline', number: '1091' },
        { label: 'National Commission for Women (NCW)', number: '7827170170' },
        { label: 'Cyber Crime Reporting', number: '1930' },
        { label: 'Childline', number: '1098' },
      ]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record SOS incident', error: error.message });
  }
};

// Get Crime Zones
exports.getCrimeZones = (req, res) => {
  try {
    return res.json({
      success: true,
      zones: store.crimeZones || []
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch crime zones' });
  }
};

// Get nearby emergency help resources
exports.getNearbyResources = (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat) || 28.6139;
    const userLng = parseFloat(req.query.lng) || 77.2090;
    const type = req.query.type;

    let resources = store.emergencyResources.map(r => ({
      ...r,
      distanceKm: calculateDistanceKm(userLat, userLng, r.lat, r.lng),
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`
    }));

    if (type && type !== 'All') {
      resources = resources.filter(r => r.type.toLowerCase().includes(type.toLowerCase()));
    }

    // Sort by nearest
    resources.sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json({
      success: true,
      userLocation: { lat: userLat, lng: userLng },
      count: resources.length,
      resources,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get nearby resources', error: error.message });
  }
};

// Manage emergency contacts
exports.getEmergencyContacts = (req, res) => {
  const user = store.users.find(u => u._id === req.user._id);
  return res.json({
    success: true,
    contacts: (user && user.emergencyContacts) || [],
  });
};

exports.addEmergencyContact = (req, res) => {
  const { name, phone, relationship = 'Family' } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone number are required' });
  }

  const user = store.users.find(u => u._id === req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (!user.emergencyContacts) user.emergencyContacts = [];
  const contact = { name: name.trim(), phone: phone.trim(), relationship: relationship.trim() };
  user.emergencyContacts.push(contact);

  return res.status(201).json({
    success: true,
    message: 'Emergency contact added',
    contacts: user.emergencyContacts,
  });
};

exports.deleteEmergencyContact = (req, res) => {
  const { phone } = req.params;
  const user = store.users.find(u => u._id === req.user._id);
  if (!user || !user.emergencyContacts) {
    return res.status(404).json({ success: false, message: 'No contacts found' });
  }

  user.emergencyContacts = user.emergencyContacts.filter(c => c.phone !== phone);
  return res.json({
    success: true,
    message: 'Emergency contact removed',
    contacts: user.emergencyContacts,
  });
};
