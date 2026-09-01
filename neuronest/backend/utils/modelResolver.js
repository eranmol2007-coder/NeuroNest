let useMemory = false;

function setMemoryMode(val) {
  useMemory = val;
}

function getModels() {
  if (useMemory) {
    return require('./memoryDb');
  }
  return {
    Patient: require('../models/Patient'),
    Caregiver: require('../models/Caregiver'),
    GameScore: require('../models/GameScore'),
    Reminder: require('../models/Reminder'),
    Alert: require('../models/Alert'),
    MoodCheckin: require('../models/MoodCheckin'),
  };
}

module.exports = { setMemoryMode, getModels };
