const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');

const createAlert = asyncHandler(async (req, res) => {
  const { Alert } = getModels();
  const { patientId, type, severity, message } = req.body;
  if (!patientId || !type || !message) {
    res.status(400);
    throw new Error('patientId, type, and message are required');
  }
  const alert = await Alert.create({ patientId, type, severity, message });
  res.status(201).json({ success: true, data: alert });
});

const getAlertsForPatient = asyncHandler(async (req, res) => {
  const { Alert } = getModels();
  const { resolved } = req.query;
  const query = { patientId: req.params.patientId };
  if (resolved !== undefined) query.resolved = resolved === 'true';

  const alerts = await Alert.find(query).sort({ timestamp: -1 });
  res.json({ success: true, count: alerts.length, data: alerts });
});

const resolveAlert = asyncHandler(async (req, res) => {
  const { Alert } = getModels();
  const alert = await Alert.findById(req.params.id);
  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }
  alert.resolved = true;
  alert.resolvedAt = new Date();
  await alert.save();
  res.json({ success: true, data: alert });
});

module.exports = { createAlert, getAlertsForPatient, resolveAlert };
