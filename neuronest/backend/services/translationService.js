/**
 * Multilingual Translation Service
 * -----------------------------------------------------------------------
 * Passthrough service for the 9 languages supported by NeuroNest.
 * Returns the original text unchanged (no external translation API).
 */

/**
 * Translate text from one language to another
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language name (e.g., 'English')
 * @param {string} toLang - Target language name (e.g., 'Hindi')
 * @returns {{ translated: string, source: 'passthrough' }}
 */
async function translate(text, fromLang, toLang) {
  if (!text || text.trim().length === 0) {
    return { translated: text, source: 'passthrough' };
  }

  return { translated: text, source: 'passthrough' };
}

/**
 * Translate a story's chapters to a target language
 * @param {Array<{title: string, text: string}>} chapters
 * @param {string} fromLang
 * @param {string} toLang
 * @returns {Array<{title: string, text: string}>}
 */
async function translateChapters(chapters, fromLang, toLang) {
  // No translation available; return chapters as-is
  return chapters;
}

/**
 * Translate a quiz question and its options
 * @param {{ question: string, options?: string[], correctAnswer: string }} quizItem
 * @param {string} fromLang
 * @param {string} toLang
 */
async function translateQuizItem(quizItem, fromLang, toLang) {
  // No translation available; return item as-is
  return quizItem;
}

/**
 * Get list of supported languages
 */
function getSupportedLanguages() {
  return [
    'English', 'Hindi', 'Bengali', 'Assamese',
    'Khasi', 'Mizo', 'Nagamese', 'Manipuri', 'Nepali',
  ];
}

module.exports = { translate, translateChapters, translateQuizItem, getSupportedLanguages };
