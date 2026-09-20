/**
 * Reminder Constants
 * Defines reminder types and metadata for reminder system
 */

export const REMINDER_TYPES = {
  MEDICATION: 'medication',
  APPOINTMENT: 'appointment',
  MEAL: 'meal',
  ACTIVITY: 'activity',
  CUSTOM: 'custom',
};

export const REMINDER_LABELS = {
  [REMINDER_TYPES.MEDICATION]: 'Medication',
  [REMINDER_TYPES.APPOINTMENT]: 'Appointment',
  [REMINDER_TYPES.MEAL]: 'Meal',
  [REMINDER_TYPES.ACTIVITY]: 'Activity',
  [REMINDER_TYPES.CUSTOM]: 'Custom',
};

export const REMINDER_ICONS = {
  [REMINDER_TYPES.MEDICATION]: '💊',
  [REMINDER_TYPES.APPOINTMENT]: '👨‍⚕️',
  [REMINDER_TYPES.MEAL]: '🍽️',
  [REMINDER_TYPES.ACTIVITY]: '🎯',
  [REMINDER_TYPES.CUSTOM]: '⏰',
};

export const REMINDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  MISSED: 'missed',
};

