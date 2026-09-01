/**
 * Game Type Constants
 * Defines all available cognitive game types in the application
 */

export const GAME_TYPES = {
  MEMORY_MATCH: 'memory_match',
  PATTERN_RECOGNITION: 'pattern_recognition',
  DAILY_ROUTINE: 'daily_routine',
};

export const GAME_LABELS = {
  [GAME_TYPES.MEMORY_MATCH]: 'Memory Match',
  [GAME_TYPES.PATTERN_RECOGNITION]: 'Pattern Recognition',
  [GAME_TYPES.DAILY_ROUTINE]: 'Daily Routine Recall',
};

export const GAME_DESCRIPTIONS = {
  [GAME_TYPES.MEMORY_MATCH]: 'Match pairs of cards to strengthen memory',
  [GAME_TYPES.PATTERN_RECOGNITION]: 'Identify and remember patterns',
  [GAME_TYPES.DAILY_ROUTINE]: 'Recall daily activities in sequence',
};

export const GAME_ICONS = {
  [GAME_TYPES.MEMORY_MATCH]: '🎴',
  [GAME_TYPES.PATTERN_RECOGNITION]: '🔍',
  [GAME_TYPES.DAILY_ROUTINE]: '📅',
};

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.EASY]: '#10b981',
  [DIFFICULTY_LEVELS.MEDIUM]: '#f59e0b',
  [DIFFICULTY_LEVELS.HARD]: '#ef4444',
};

