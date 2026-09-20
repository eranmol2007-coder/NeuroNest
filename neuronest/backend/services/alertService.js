/**
 * Alert Trigger Engine
 * -----------------------------------------------------------------------
 * Central place where "should we notify the caregiver?" decisions are made.
 * Each check function returns null (no alert) or an alert payload object
 * ready to be saved via Alert.create(). Kept separate from route handlers
 * so game/reminder controllers can share this logic without duplicating it.
 */

const { detectAccuracyTrend } = require('./adaptiveDifficultyService');

/**
 * Checks whether a just-submitted game score should raise a "low accuracy"
 * or "struggling at difficulty" alert, based on trend across recent scores.
 * @param {string} patientId
 * @param {Array} recentScoresDesc - recent GameScore docs, most recent first
 * @returns {object|null}
 */
function checkAccuracyAlert(patientId, recentScoresDesc) {
  const trend = detectAccuracyTrend(recentScoresDesc);
  if (trend.isDeclining) {
    return {
      patientId,
      type: 'low_accuracy',
      severity: 'warning',
      message: `Accuracy has dropped from an average of ${Math.round(
        trend.averageOlder
      )}% to ${Math.round(
        trend.averageRecent
      )}% over recent games. Consider checking in with the patient.`,
    };
  }

  const latest = recentScoresDesc[0];
  if (latest && latest.accuracy < 40) {
    return {
      patientId,
      type: 'low_accuracy',
      severity: 'info',
      message: `Latest game accuracy was low (${latest.accuracy}%). This can happen occasionally — worth monitoring if it continues.`,
    };
  }

  return null;
}

/**
 * Checks whether a reminder that was never marked complete should raise
 * a "missed reminder" alert. Call this when a reminder's scheduled time
 * has passed by more than the grace period and status is still 'pending'.
 * @param {object} reminder - Reminder document
 * @param {number} gracePeriodMinutes
 * @returns {object|null}
 */
function checkMissedReminderAlert(reminder, gracePeriodMinutes = 30) {
  if (!reminder || reminder.status !== 'pending') return null;

  const scheduled = reminder.lastTriggeredAt || reminder.createdAt;
  if (!scheduled) return null;

  const minutesElapsed = (Date.now() - new Date(scheduled).getTime()) / 60000;
  if (minutesElapsed < gracePeriodMinutes) return null;

  const typeLabel =
    { medicine: 'Medicine', water: 'Water', appointment: 'Appointment', meal: 'Meal', exercise: 'Exercise' }[
      reminder.type
    ] || 'Reminder';

  return {
    patientId: reminder.patientId,
    type: 'missed_reminder',
    severity: reminder.type === 'medicine' ? 'critical' : 'warning',
    message: `${typeLabel} reminder "${reminder.title}" was not marked complete within ${gracePeriodMinutes} minutes of the scheduled time.`,
  };
}

/**
 * Checks whether a series of recent mood check-ins indicates a decline.
 * @param {Array<{moodScore:number, date:Date}>} recentMoodsDesc - most recent first
 * @returns {object|null}
 */
function checkMoodDeclineAlert(patientId, recentMoodsDesc) {
  if (!recentMoodsDesc || recentMoodsDesc.length < 3) return null;

  const avgRecentThree =
    recentMoodsDesc.slice(0, 3).reduce((s, m) => s + m.moodScore, 0) / 3;

  if (avgRecentThree <= 2) {
    return {
      patientId,
      type: 'mood_decline',
      severity: avgRecentThree <= 1.5 ? 'critical' : 'warning',
      message: `Mood check-ins have been low over the last few entries (avg ${avgRecentThree.toFixed(
        1
      )}/5). A visit or call may help.`,
    };
  }

  return null;
}

/**
 * Checks inactivity — patient hasn't played any game in N days.
 * @param {string} patientId
 * @param {Date|null} lastGameDate
 * @param {number} thresholdDays
 * @returns {object|null}
 */
function checkInactivityAlert(patientId, lastGameDate, thresholdDays = 3) {
  if (!lastGameDate) return null;
  const daysSince = (Date.now() - new Date(lastGameDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince >= thresholdDays) {
    return {
      patientId,
      type: 'inactivity',
      severity: 'info',
      message: `No games played in ${Math.floor(daysSince)} day(s). A gentle nudge or visit might help re-engage them.`,
    };
  }
  return null;
}

module.exports = {
  checkAccuracyAlert,
  checkMissedReminderAlert,
  checkMoodDeclineAlert,
  checkInactivityAlert,
};
