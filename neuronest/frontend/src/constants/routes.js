/**
 * Route Constants
 * Centralized route definitions for the application
 */

export const ROUTES = {
  // Public routes
  WELCOME: '/',
  
  // Authentication routes
  PROFILES: '/profiles',
  
  // Patient routes
  HOME: '/home',
  GAMES: '/games',
  GAMES_MEMORY: '/games/memory',
  GAMES_PATTERN: '/games/pattern',
  GAMES_ROUTINE: '/games/routine',
  MOOD: '/mood',
  REMINDERS: '/reminders',
  SETTINGS: '/settings',
  
  // Caregiver routes
  CAREGIVER: '/caregiver',
};

export const ROUTE_LABELS = {
  [ROUTES.WELCOME]: 'Welcome',
  [ROUTES.PROFILES]: 'Profiles',
  [ROUTES.HOME]: 'Home',
  [ROUTES.GAMES]: 'Games',
  [ROUTES.MOOD]: 'Mood',
  [ROUTES.REMINDERS]: 'Reminders',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.CAREGIVER]: 'Caregiver Dashboard',
};

