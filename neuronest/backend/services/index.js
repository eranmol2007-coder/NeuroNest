/**
 * Services Index
 * Business logic and service layer exports
 * @module services
 */

const adaptiveDifficultyService = require('./adaptiveDifficultyService');
const alertService = require('./alertService');
const sentimentService = require('./sentimentService');
const intentService = require('./intentService');
const reportService = require('./reportService');
const storyScoringService = require('./storyScoringService');
const translationService = require('./translationService');

module.exports = {
  adaptiveDifficultyService,
  alertService,
  sentimentService,
  intentService,
  reportService,
  storyScoringService,
  translationService,
};
