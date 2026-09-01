/**
 * Constants Index
 * Central export point for all backend constants
 * @module constants
 */

const { GAME_TYPES, DIFFICULTY_LEVELS } = require('./gameTypes');
const { ALERT_TYPES, ALERT_SEVERITY } = require('./alertTypes');
const HTTP_STATUS = require('./httpStatus');

module.exports = {
  GAME_TYPES,
  DIFFICULTY_LEVELS,
  ALERT_TYPES,
  ALERT_SEVERITY,
  HTTP_STATUS,
};
