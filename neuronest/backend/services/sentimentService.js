/**
 * Sentiment Analysis Service
 * -----------------------------------------------------------------------
 * Analyzes mood check-in notes using HuggingFace's text-classification
 * pipeline. Detects emotion (positive/negative/neutral) and maps it to
 * a severity score for caregiver alerts.
 *
 * Model   : distilbert/distilbert-base-uncased-finetuned-sst-2-english (free)
 * Fallback: rule-based keyword matching when HF is unavailable/rate-limited.
 */

const { hf, isAvailable } = require('./hfClient');

const SENTIMENT_MODEL = 'distilbert/distilbert-base-uncased-finetuned-sst-2-english';

// ── Keywords for rule-based fallback ────────────────────────────────────────
const NEGATIVE_KEYWORDS = [
  'sad', 'angry', 'scared', 'confused', 'pain', 'hurt', 'lonely', 'lost',
  'forget', 'forgot', 'worry', 'anxious', 'depressed', 'tired', 'sick',
  'help', 'cant', "can't", 'difficult', 'bad', 'terrible', 'awful',
  'miss', 'alone', 'afraid', 'worried', 'upset', 'frustrated',
];

const POSITIVE_KEYWORDS = [
  'happy', 'good', 'great', 'wonderful', 'fine', 'better', 'enjoy',
  'love', 'fun', 'nice', 'well', 'calm', 'peaceful', 'relaxed',
  'thankful', 'grateful', 'smile', 'laugh', 'play', 'beautiful',
];

/**
 * Analyze sentiment of a mood note.
 * @param {string} note - The patient's mood note text
 * @returns {{ sentiment, score, confidence, severity, source }}
 *   sentiment  : 'positive' | 'negative' | 'neutral'
 *   score      : 0-1  (0 = very negative, 1 = very positive)
 *   confidence : 0-1
 *   severity   : 'none' | 'mild' | 'moderate' | 'critical'
 *   source     : 'ai' | 'keyword'
 */
async function analyzeSentiment(note) {
  if (!note || note.trim().length === 0) {
    return { sentiment: 'neutral', score: 0.5, confidence: 0, severity: 'none', source: 'keyword' };
  }

  if (isAvailable()) {
    try {
      return await _analyzeWithHF(note);
    } catch (err) {
      console.warn('HF sentiment analysis failed, falling back to rule-based:', err.message);
    }
  }

  return _analyzeWithRules(note);
}

// ── HuggingFace API path ─────────────────────────────────────────────────────

async function _analyzeWithHF(note) {
  const result = await hf.textClassification({
    model: SENTIMENT_MODEL,
    inputs: note.substring(0, 512), // model max length
  });

  // result shape: [{label, score}, ...] or [[{label, score}, ...]]
  const labels = Array.isArray(result[0]) ? result[0] : result;

  const positive = labels.find(l => l.label === 'POSITIVE');
  const negative = labels.find(l => l.label === 'NEGATIVE');

  const posScore = positive?.score || 0;
  const negScore = negative?.score || 0;

  let sentiment = 'neutral';
  let score = 0.5;

  if (posScore > negScore && posScore > 0.6) {
    sentiment = 'positive';
    score = posScore;
  } else if (negScore > posScore && negScore > 0.6) {
    sentiment = 'negative';
    score = 1 - negScore;
  }

  const confidence = Math.max(posScore, negScore);
  const severity = _getSeverity(sentiment, confidence, note);

  return { sentiment, score, confidence, severity, source: 'ai' };
}

// ── Rule-based fallback ──────────────────────────────────────────────────────

function _analyzeWithRules(note) {
  const lower = note.toLowerCase();
  const words = lower.split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (POSITIVE_KEYWORDS.some(kw => word.includes(kw))) positiveCount++;
    if (NEGATIVE_KEYWORDS.some(kw => word.includes(kw))) negativeCount++;
  });

  const total = positiveCount + negativeCount || 1;
  const positiveRatio = positiveCount / total;
  const negativeRatio = negativeCount / total;

  let sentiment = 'neutral';
  let score = 0.5;
  let confidence = Math.abs(positiveRatio - negativeRatio);

  if (positiveRatio > 0.6) {
    sentiment = 'positive';
    score = 0.5 + positiveRatio * 0.5;
  } else if (negativeRatio > 0.6) {
    sentiment = 'negative';
    score = 0.5 - negativeRatio * 0.5;
  }

  confidence = Math.min(confidence + 0.3, 1);
  const severity = _getSeverity(sentiment, confidence, note);

  return { sentiment, score, confidence, severity, source: 'keyword' };
}

// ── Severity mapping ─────────────────────────────────────────────────────────

function _getSeverity(sentiment, confidence, note) {
  if (sentiment !== 'negative' || confidence < 0.6) return 'none';

  const lower = note.toLowerCase();

  if (/\b(suicid|harm|hurt myself|kill|pain|emergency|cant breathe)\b/i.test(lower)) {
    return 'critical';
  }
  if (/\b(terrible|awful|very sad|deeply|so scared|cant stop crying|help me)\b/i.test(lower)) {
    return 'moderate';
  }

  return 'mild';
}

module.exports = { analyzeSentiment };
