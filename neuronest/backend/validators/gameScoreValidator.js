/**
 * Game Score Input Validators
 * @module validators/gameScoreValidator
 */

const { GAME_TYPES, DIFFICULTY_LEVELS } = require('../constants');

/**
 * Validate game score submission data
 * @param {Object} data - Game score data
 * @returns {Object} - Validation result
 */
const validateGameScore = (data) => {
  const errors = [];

  // Required fields
  if (!data.patientId) {
    errors.push('Patient ID is required');
  }

  if (!data.gameType) {
    errors.push('Game type is required');
  } else if (!Object.values(GAME_TYPES).includes(data.gameType)) {
    errors.push(`Game type must be one of: ${Object.values(GAME_TYPES).join(', ')}`);
  }

  if (!data.difficulty) {
    errors.push('Difficulty is required');
  } else if (!Object.values(DIFFICULTY_LEVELS).includes(data.difficulty)) {
    errors.push(`Difficulty must be one of: ${Object.values(DIFFICULTY_LEVELS).join(', ')}`);
  }

  // Score validation
  if (data.score !== undefined) {
    if (typeof data.score !== 'number' || data.score < 0) {
      errors.push('Score must be a non-negative number');
    }
  }

  // Accuracy validation (0-100)
  if (data.accuracy !== undefined) {
    if (typeof data.accuracy !== 'number' || data.accuracy < 0 || data.accuracy > 100) {
      errors.push('Accuracy must be a number between 0 and 100');
    }
  }

  // Time validation
  if (data.timeSpent !== undefined) {
    if (typeof data.timeSpent !== 'number' || data.timeSpent < 0) {
      errors.push('Time spent must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateGameScore,
};
