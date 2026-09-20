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
    User: require('../models/User'),
    Otp: require('../models/Otp'),
    PersonalStory: require('../models/PersonalStory'),
    StoryQuiz: require('../models/StoryQuiz'),
  };
}

module.exports = { setMemoryMode, getModels };
