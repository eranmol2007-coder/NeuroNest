/**
 * AI Voice Intent Classification Service
 * -----------------------------------------------------------------------
 * Uses HuggingFace zero-shot classification to understand natural language
 * voice commands across all 9 supported languages.
 *
 * Model   : facebook/bart-large-mnli (free, zero-shot capable)
 * Fallback: regex pattern matching when HF is unavailable/rate-limited.
 */

const { hf, isAvailable } = require('./hfClient');

const INTENT_MODEL = 'facebook/bart-large-mnli';

// ── Candidate labels for zero-shot classification ────────────────────────────
const INTENT_LABELS = [
  'play memory game',
  'play pattern game',
  'play routine game',
  'play any game',
  'check medicine reminders',
  'check water reminders',
  'check appointment reminders',
  'check all reminders',
  'check progress or score',
  'navigate to home',
  'navigate to reminders page',
  'navigate to settings page',
  'navigate to games page',
  'navigate to caregiver page',
  'navigate to report page',
  'mood check-in',
  'ask for help',
  'greeting',
  'unknown command',
];

// ── Map labels → intent objects ──────────────────────────────────────────────
const LABEL_TO_INTENT = {
  'play memory game':            { intent: 'play_game',       gameType: 'memoryMatch' },
  'play pattern game':           { intent: 'play_game',       gameType: 'patternRecognition' },
  'play routine game':           { intent: 'play_game',       gameType: 'dailyRoutineRecall' },
  'play any game':               { intent: 'play_game',       gameType: null },
  'check medicine reminders':    { intent: 'check_reminders', filter: 'medicine' },
  'check water reminders':       { intent: 'check_reminders', filter: 'water' },
  'check appointment reminders': { intent: 'check_reminders', filter: 'appointment' },
  'check all reminders':         { intent: 'check_reminders', filter: null },
  'check progress or score':     { intent: 'check_progress' },
  'navigate to home':            { intent: 'navigate_home' },
  'navigate to reminders page':  { intent: 'navigate_page',   target: '/reminders' },
  'navigate to settings page':   { intent: 'navigate_page',   target: '/settings' },
  'navigate to games page':      { intent: 'navigate_page',   target: '/games' },
  'navigate to caregiver page':  { intent: 'navigate_page',   target: '/caregiver' },
  'navigate to report page':     { intent: 'navigate_page',   target: '/patient-report' },
  'mood check-in':               { intent: 'mood_checkin' },
  'ask for help':                { intent: 'help' },
  'greeting':                    { intent: 'greeting' },
  'unknown command':             { intent: 'unknown' },
};

/**
 * Classify a voice transcript into an app intent.
 * @param {string} transcript - What the patient said
 * @param {string} language   - Patient's language (for regex fallback)
 * @returns {{ intent, gameType?, filter?, target?, confidence, source }}
 */
async function classifyIntent(transcript, language = 'English') {
  if (!transcript || transcript.trim().length === 0) {
    return { intent: 'unknown', confidence: 0, source: 'regex' };
  }

  if (isAvailable()) {
    try {
      return await _classifyWithHF(transcript);
    } catch (err) {
      console.warn('HF intent classification failed, falling back to regex:', err.message);
    }
  }

  return _classifyWithRegex(transcript, language);
}

// ── HuggingFace zero-shot path ───────────────────────────────────────────────

async function _classifyWithHF(transcript) {
  const timeoutMs = 12000; // 12 seconds max wait time for AI cold starts
  const hfCall = hf.zeroShotClassification({
    model: INTENT_MODEL,
    inputs: transcript.substring(0, 512),
    parameters: {
      candidate_labels: INTENT_LABELS,
      multi_label: false,
    },
  });

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('HF API timed out')), timeoutMs)
  );

  const result = await Promise.race([hfCall, timeoutPromise]);

  // @huggingface/inference zeroShotClassification returns an array of { label, score } objects
  // sorted by score in descending order.
  const topLabel = Array.isArray(result) && result.length > 0 ? result[0].label : null;
  const topScore = Array.isArray(result) && result.length > 0 ? result[0].score : 0;
  
  const intentData = topLabel ? (LABEL_TO_INTENT[topLabel] || { intent: 'unknown' }) : { intent: 'unknown' };

  return { ...intentData, confidence: topScore, source: 'ai' };
}

// ── Regex fallback ───────────────────────────────────────────────────────────

function _classifyWithRegex(transcript, language) {
  const text = transcript.toLowerCase().trim();

  if (/(memory|yaad|match|card)/i.test(text))
    return { intent: 'play_game', gameType: 'memoryMatch', confidence: 0.7, source: 'regex' };
  if (/(pattern|sequence|nishan|shape|tap)/i.test(text))
    return { intent: 'play_game', gameType: 'patternRecognition', confidence: 0.7, source: 'regex' };
  if (/(routine|daily|chores|kaam|roz|habit|order)/i.test(text))
    return { intent: 'play_game', gameType: 'dailyRoutineRecall', confidence: 0.7, source: 'regex' };
  if (/(play|game|khel|start|open.*game)/i.test(text))
    return { intent: 'play_game', gameType: null, confidence: 0.6, source: 'regex' };
  if (/(remind|medicine|meds|pill|dawa|yad|schedule)/i.test(text))
    return { intent: 'check_reminders', filter: 'medicine', confidence: 0.7, source: 'regex' };
  if (/(water|drink|pani|pina)/i.test(text))
    return { intent: 'check_reminders', filter: 'water', confidence: 0.7, source: 'regex' };
  if (/(doctor|appointment|visit|meet|bhet)/i.test(text))
    return { intent: 'check_reminders', filter: 'appointment', confidence: 0.7, source: 'regex' };
  if (/(reminder|reminders|notification)/i.test(text))
    return { intent: 'check_reminders', filter: null, confidence: 0.6, source: 'regex' };
  if (/(open|go to|show|take me to|navigate).*(reminder)/i.test(text))
    return { intent: 'navigate_page', target: '/reminders', confidence: 0.8, source: 'regex' };
  if (/(open|go to|show|take me to|navigate).*(setting)/i.test(text))
    return { intent: 'navigate_page', target: '/settings', confidence: 0.8, source: 'regex' };
  if (/(open|go to|show|take me to|navigate).*(game)/i.test(text))
    return { intent: 'navigate_page', target: '/games', confidence: 0.8, source: 'regex' };
  if (/(open|go to|show|take me to|navigate).*(home|dashboard)/i.test(text))
    return { intent: 'navigate_page', target: '/home', confidence: 0.8, source: 'regex' };
  if (/(open|go to|show|take me to|navigate).*(caregiver)/i.test(text))
    return { intent: 'navigate_page', target: '/caregiver', confidence: 0.8, source: 'regex' };
  if (/(progress|score|doing)/i.test(text))
    return { intent: 'check_progress', confidence: 0.6, source: 'regex' };
  if (/(home|main|wapas|back)/i.test(text))
    return { intent: 'navigate_home', confidence: 0.6, source: 'regex' };
  if (/(mood|feel|feeling|kaisa|lag)/i.test(text))
    return { intent: 'mood_checkin', confidence: 0.6, source: 'regex' };
  if (/(help|assist|what|sahay|madad)/i.test(text))
    return { intent: 'help', confidence: 0.6, source: 'regex' };

  return { intent: 'unknown', confidence: 0, source: 'regex' };
}

module.exports = { classifyIntent };
