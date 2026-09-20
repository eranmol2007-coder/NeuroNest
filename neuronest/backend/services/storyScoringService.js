/**
 * Story Quiz Semantic Scoring Service
 * -----------------------------------------------------------------------
 * Uses HuggingFace sentence embeddings to grade subjective quiz answers.
 * Instead of exact keyword matching, it understands semantic meaning so
 * paraphrased answers are rewarded correctly.
 *
 * Model   : sentence-transformers/all-MiniLM-L6-v2 (free, fast)
 * Fallback: keyword-based scoring when HF is unavailable/rate-limited.
 */

const { hf, isAvailable } = require('./hfClient');

const SIMILARITY_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

/**
 * Score a patient's answer against the correct answer.
 * @param {string}   patientAnswer - What the patient wrote/spoke
 * @param {string}   correctAnswer - The expected answer
 * @param {string[]} keywords      - Important keywords from the story
 * @returns {{ score, similarity, keywordMatch, source }}
 *   score       : 0-100 percentage
 *   similarity  : 0-1  semantic cosine similarity (0 if HF unavailable)
 *   keywordMatch: 0-1  keyword coverage ratio
 *   source      : 'ai' | 'keyword'
 */
async function scoreAnswer(patientAnswer, correctAnswer, keywords = []) {
  if (!patientAnswer || patientAnswer.trim().length === 0) {
    return { score: 0, similarity: 0, keywordMatch: 0, source: 'keyword' };
  }

  // Always compute keyword match (used as fallback and blending factor)
  const keywordMatch = _computeKeywordMatch(patientAnswer, keywords);

  if (isAvailable()) {
    try {
      const similarity = await _computeSemanticSimilarity(patientAnswer, correctAnswer);

      // Blend: 60% semantic + 40% keyword
      const blendedScore = Math.round((similarity * 0.6 + keywordMatch * 0.4) * 100);

      return {
        score: Math.min(100, Math.max(0, blendedScore)),
        similarity,
        keywordMatch,
        source: 'ai',
      };
    } catch (err) {
      console.warn('HF scoring failed, falling back to keyword scoring:', err.message);
    }
  }

  return {
    score: Math.round(keywordMatch * 100),
    similarity: 0,
    keywordMatch,
    source: 'keyword',
  };
}

/**
 * Score multiple answers in batch.
 * @param {Array<{patientAnswer, correctAnswer, keywords}>} answers
 * @returns {Array<{score, similarity, keywordMatch, source}>}
 */
async function scoreAnswersBatch(answers) {
  return Promise.all(
    answers.map(a => scoreAnswer(a.patientAnswer, a.correctAnswer, a.keywords))
  );
}

// ── HuggingFace semantic similarity path ─────────────────────────────────────

async function _computeSemanticSimilarity(text1, text2) {
  const [output1, output2] = await Promise.all([
    hf.featureExtraction({ model: SIMILARITY_MODEL, inputs: text1.substring(0, 512) }),
    hf.featureExtraction({ model: SIMILARITY_MODEL, inputs: text2.substring(0, 512) }),
  ]);

  // Normalise to flat array (output can be nested or Float32Array)
  const vec1 = Array.isArray(output1[0]) ? output1[0] : Array.from(output1);
  const vec2 = Array.isArray(output2[0]) ? output2[0] : Array.from(output2);

  return _cosineSimilarity(vec1, vec2);
}

function _cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;

  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ── Keyword fallback ─────────────────────────────────────────────────────────

function _computeKeywordMatch(patientAnswer, keywords) {
  if (!keywords || keywords.length === 0) return 0.5; // neutral when no keywords

  const lower = patientAnswer.toLowerCase();
  const matched = keywords.filter(kw => lower.includes(kw.toLowerCase()));
  return matched.length / keywords.length;
}

module.exports = { scoreAnswer, scoreAnswersBatch };
