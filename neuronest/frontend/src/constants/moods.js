/**
 * Mood Constants
 * Defines mood types and related metadata for mood tracking
 */

export const MOOD_TYPES = {
  HAPPY: 'happy',
  CALM: 'calm',
  NEUTRAL: 'neutral',
  ANXIOUS: 'anxious',
  SAD: 'sad',
};

export const MOOD_LABELS = {
  [MOOD_TYPES.HAPPY]: 'Happy',
  [MOOD_TYPES.CALM]: 'Calm',
  [MOOD_TYPES.NEUTRAL]: 'Neutral',
  [MOOD_TYPES.ANXIOUS]: 'Anxious',
  [MOOD_TYPES.SAD]: 'Sad',
};

export const MOOD_EMOJIS = {
  [MOOD_TYPES.HAPPY]: '😊',
  [MOOD_TYPES.CALM]: '😌',
  [MOOD_TYPES.NEUTRAL]: '😐',
  [MOOD_TYPES.ANXIOUS]: '😰',
  [MOOD_TYPES.SAD]: '😢',
};

export const MOOD_COLORS = {
  [MOOD_TYPES.HAPPY]: '#10b981',
  [MOOD_TYPES.CALM]: '#3b82f6',
  [MOOD_TYPES.NEUTRAL]: '#6b7280',
  [MOOD_TYPES.ANXIOUS]: '#f59e0b',
  [MOOD_TYPES.SAD]: '#ef4444',
};

export const MOOD_SCORES = {
  [MOOD_TYPES.HAPPY]: 5,
  [MOOD_TYPES.CALM]: 4,
  [MOOD_TYPES.NEUTRAL]: 3,
  [MOOD_TYPES.ANXIOUS]: 2,
  [MOOD_TYPES.SAD]: 1,
};

