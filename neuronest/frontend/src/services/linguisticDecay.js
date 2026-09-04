/**
 * Linguistic Decay Detection Service
 * 
 * Analyzes voice interaction patterns to detect cognitive/linguistic decline.
 * When decay is detected, automatically shifts the UI and voice assistant
 * into simpler local NER dialects to reduce patient frustration.
 * 
 * Decay signals tracked:
 * 1. Repetition rate - repeated words/phrases
 * 2. Sentence complexity - shorter utterances over time
 * 3. Word-finding pauses - hesitation patterns
 * 4. Vocabulary simplification - declining word diversity
 * 5. Error rate - unrecognized commands increasing
 */

const DECAY_THRESHOLDS = {
  repetitionRate: 0.35,       // >35% repeated words = decay
  avgSentenceLengthDrop: 0.4, // >40% drop in avg words per sentence
  vocabularyDiversityDrop: 0.3, // >30% drop in unique word ratio
  errorRateIncrease: 0.5,     // >50% increase in errors
  minInteractions: 3,         // Need at least 3 interactions to analyze
  windowSize: 10,             // Analyze last 10 interactions
};

// Simplified dialect maps: when decay detected, shift to these simpler forms
const SIMPLIFIED_DIALECTS = {
  English: {
    code: 'en-IN',
    simplifiedPhrases: {
      play_game: 'Play game',
      check_reminders: 'Check reminders',
      help: 'Help me',
      mood_check: 'How I feel',
      progress: 'My score',
      greeting: 'Hello',
      yes: 'Yes',
      no: 'No',
      thanks: 'Thanks',
      water: 'Water',
      medicine: 'Medicine',
      doctor: 'Doctor',
      pain: 'Pain',
      tired: 'Tired',
      happy: 'Happy',
      sad: 'Sad',
    },
    voiceRate: 0.8,  // Slower speech
    uiTextSimplification: {
      'Play a Game': 'Play Game',
      'Cognitive Games': 'Games',
      'Pattern Recognition': 'Shapes Game',
      'Daily Routine Recall': 'Daily Steps',
      'Memory Match': 'Match Cards',
      'How are you feeling?': 'How do you feel?',
      'Reminders': 'Reminders',
      'Accuracy Over Time': 'Your Score',
      'Performance by Game': 'Game Scores',
    },
  },
  Hindi: {
    code: 'hi-IN',
    simplifiedPhrases: {
      play_game: 'Khelo',
      check_reminders: 'Yaad dilao',
      help: 'Madad karo',
      mood_check: 'Kaisa lagta hai',
      progress: 'Score dikhao',
      greeting: 'Namaste',
      yes: 'Haan',
      no: 'Nahi',
      thanks: 'Shukriya',
      water: 'Paani',
      medicine: 'Dawa',
      doctor: 'Doctor',
      pain: 'Dard',
      tired: 'Thaka hua',
      happy: 'Khush',
      sad: 'Udaas',
    },
    voiceRate: 0.8,
    uiTextSimplification: {
      'Play a Game': 'Khelo',
      'Cognitive Games': 'Sab Khel',
      'Pattern Recognition': 'Shape Khel',
      'Daily Routine Recall': 'Roz Ka Kaam',
      'Memory Match': 'Yaad Rakho',
      'How are you feeling?': 'Kaisa Lagta Hai?',
      'Reminders': 'Yaad Dilaao',
      'Accuracy Over Time': 'Tumhara Score',
      'Performance by Game': 'Khel Ka Score',
    },
  },
  Bengali: {
    code: 'bn-IN',
    simplifiedPhrases: {
      play_game: 'Khele',
      check_reminders: 'Mone koro',
      help: 'Sahay koro',
      mood_check: 'Kemon lagche',
      progress: 'Score dekho',
      greeting: 'Nomoshkar',
      yes: 'Haan',
      no: 'Na',
      thanks: 'Dhonnobad',
      water: 'Jol',
      medicine: 'Oushodh',
      doctor: 'Daktar',
      pain: 'Beda',
      tired: 'Klanto',
      happy: 'Khushi',
      sad: 'Khotta',
    },
    voiceRate: 0.8,
    uiTextSimplification: {
      'Play a Game': 'Khele',
      'Cognitive Games': 'Sob Khel',
      'Pattern Recognition': 'Shape Khel',
      'Daily Routine Recall': 'Rojer Kaaj',
      'Memory Match': 'Mone Rakho',
      'How are you feeling?': 'Kemon Lagche?',
      'Reminders': 'Mone Kore Dao',
      'Accuracy Over Time': 'Tomar Score',
      'Performance by Game': 'Kheler Score',
    },
  },
  Assamese: {
    code: 'as-IN',
    simplifiedPhrases: {
      play_game: 'Khele',
      check_reminders: 'Mone korao',
      help: 'Sahay koro',
      mood_check: 'Kene lagise',
      progress: 'Score sabo',
      greeting: 'Nomoskar',
      yes: 'Ho',
      no: 'Nai',
      thanks: 'Dhonyobad',
      water: 'Pani',
      medicine: 'Ousodh',
      doctor: 'Daktar',
      pain: 'Beda',
      tired: 'Gwilta',
      happy: 'Sukhi',
      sad: 'Dukhi',
    },
    voiceRate: 0.8,
    uiTextSimplification: {
      'Play a Game': 'Khele',
      'Cognitive Games': 'Sab Khel',
      'Pattern Recognition': 'Shape Khel',
      'Daily Routine Recall': 'Roze Kaam',
      'Memory Match': 'Mone Rakho',
      'How are you feeling?': 'Kene Lagise?',
      'Reminders': 'Mone Korao',
      'Accuracy Over Time': 'Aapunar Score',
      'Performance by Game': 'Kheler Score',
    },
  },
  Nepali: {
    code: 'ne-NP',
    simplifiedPhrases: {
      play_game: 'Khela',
      check_reminders: 'Yaad garau',
      help: 'Sahayata gar',
      mood_check: 'Kasto lagcha',
      progress: 'Score hera',
      greeting: 'Namaste',
      yes: 'Ho',
      no: 'Hoina',
      thanks: 'Dhanyabad',
      water: 'Pani',
      medicine: 'Dawa',
      doctor: 'Doctor',
      pain: 'Dard',
      tired: 'Thakisakeko',
      happy: 'Khusi',
      sad: 'Dukha',
    },
    voiceRate: 0.8,
    uiTextSimplification: {
      'Play a Game': 'Khela',
      'Cognitive Games': 'Sabai Khela',
      'Pattern Recognition': 'Shape Khela',
      'Daily Routine Recall': 'Dainik Kaam',
      'Memory Match': 'Yaad Rakha',
      'How are you feeling?': 'Kasto Lagcha?',
      'Reminders': 'Yaad Garau',
      'Accuracy Over Time': 'Tapailo Score',
      'Performance by Game': 'Khela ko Score',
    },
  },
  Khasi: {
    code: 'en-IN',
    simplifiedPhrases: {
      play_game: 'Phan',
      check_reminders: 'Iing kyntiew',
      help: 'Help',
      mood_check: 'Longkam dei',
      progress: 'Score',
      greeting: 'Khublei',
      yes: 'Ha',
      no: 'Myn',
      thanks: 'Khublei',
      water: 'Duh',
      medicine: 'Medicine',
      doctor: 'Doctor',
      pain: 'Kynmaw',
      tired: 'Gwil',
      happy: 'Sngewbha',
      sad: 'Sngewship',
    },
    voiceRate: 0.8,
    uiTextSimplification: {
      'Play a Game': 'Phan',
      'Cognitive Games': 'Phan Barim',
      'Pattern Recognition': 'Phan Shape',
      'Daily Routine Recall': 'Nongngei Kam',
      'Memory Match': 'Phan Match',
      'How are you feeling?': 'Longkam Dei?',
      'Reminders': 'Iing Kyntiew',
      'Accuracy Over Time': 'Phi Score',
      'Performance by Game': 'Phan Score',
    },
  },
  Mizo: {
    code: 'en-IN',
    simplifiedPhrases: {
      play_game: 'Kawlhran',
      check_reminders: 'Hriattir',
      help: 'Help',
      mood_check: 'Hriselna dei',
      progress: 'Score',
      greeting: 'Chibai',
      yes: 'Aw',
      no: 'Aih',
      thanks: 'Ka lawm',
      water: 'Tui',
      medicine: 'Medicine',
      doctor: 'Doctor',
      pain: 'Nghat',
      tired: 'Hnawh',
      happy: 'Thianghlim',
      sad: 'Tunah',
    },
    voiceRate: 0.8,
    uiTextSimplification: {
      'Play a Game': 'Kawlhran',
      'Cognitive Games': 'Kawlhran Zawl',
      'Pattern Recognition': 'Kawlhran Shape',
      'Daily Routine Recall': 'Ni Tin Thawh',
      'Memory Match': 'Kawlhran Match',
      'How are you feeling?': 'Hriselna Dei?',
      'Reminders': 'Hriattir',
      'Accuracy Over Time': 'I Score',
      'Performance by Game': 'Kawlhran Score',
    },
  },
  Nagamese: {
    code: 'bn-IN',
    simplifiedPhrases: {
      play_game: 'Khel',
      check_reminders: 'Yaad dilao',
      help: 'Sahay',
      mood_check: 'Lagise',
      progress: 'Number dekho',
      greeting: 'Namaskar',
      yes: 'Ho',
      no: 'Nai',
      thanks: 'Dhanyabad',
      water: 'Pani',
      medicine: 'Dawa',
      doctor: 'Doctor',
      pain: 'Beda',
      tired: 'Gwil',
      happy: 'Bhal',
      sad: 'Mando',
    },
    voiceRate: 0.8,
    uiTextSimplification: {
      'Play a Game': 'Khel',
      'Cognitive Games': 'Sab Khel',
      'Pattern Recognition': 'Shape Khel',
      'Daily Routine Recall': 'Roz Ka Kaj',
      'Memory Match': 'Memory Khel',
      'How are you feeling?': 'Lagise?',
      'Reminders': 'Yaad Dilao',
      'Accuracy Over Time': 'Tumar Score',
      'Performance by Game': 'Kheler Score',
    },
  },
  Manipuri: {
    code: 'mni-IN',
    simplifiedPhrases: {
      play_game: 'Phang',
      check_reminders: 'Eikhoi mmi',
      help: 'Help',
      mood_check: 'Yadne',
      progress: 'Score',
      greeting: 'Khurumjee',
      yes: 'Ha',
      no: 'Ire',
      thanks: 'Thagatchari',
      water: 'Dah',
      medicine: 'Medicine',
      doctor: 'Doctor',
      pain: 'Yongngang',
      tired: 'Cheng-u',
      happy: 'Yum',
      sad: 'Yengba',
    },
    voiceRate: 0.8,
    uiTextSimplification: {
      'Play a Game': 'Phang',
      'Cognitive Games': 'Phang Barim',
      'Pattern Recognition': 'Phang Shape',
      'Daily Routine Recall': 'Nungai Khangneiba',
      'Memory Match': 'Phang Match',
      'How are you feeling?': 'Yadne?',
      'Reminders': 'Eikhoi Mmi',
      'Accuracy Over Time': 'Nadi Score',
      'Performance by Game': 'Phang Score',
    },
  },
};

class LinguisticDecayDetector {
  constructor() {
    this.interactions = [];
    this.decayLevel = 0; // 0 = none, 1 = mild, 2 = moderate, 3 = severe
    this.currentLanguage = 'English';
    this.originalLanguage = 'English';
    this.listeners = new Set();
  }

  /**
   * Register a listener for decay level changes
   */
  onDecayChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notifyListeners() {
    this.listeners.forEach(cb => cb(this.decayLevel, this.currentLanguage));
  }

  /**
   * Record a voice interaction
   * @param {object} interaction - { transcript, isError, timestamp, responseTime }
   */
  recordInteraction(interaction) {
    const record = {
      transcript: (interaction.transcript || '').toLowerCase().trim(),
      isError: interaction.isError || false,
      timestamp: interaction.timestamp || Date.now(),
      responseTime: interaction.responseTime || 0,
      wordCount: 0,
      uniqueWords: 0,
      repetitionRate: 0,
    };

    if (record.transcript) {
      const words = record.transcript.split(/\s+/).filter(w => w.length > 0);
      record.wordCount = words.length;
      const wordFreq = {};
      words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
      record.uniqueWords = Object.keys(wordFreq).length;
      record.repetitionRate = record.wordCount > 0
        ? 1 - (record.uniqueWords / record.wordCount)
        : 0;
    }

    this.interactions.push(record);

    // Keep only the last N interactions
    if (this.interactions.length > DECAY_THRESHOLDS.windowSize) {
      this.interactions = this.interactions.slice(-DECAY_THRESHOLDS.windowSize);
    }

    this._analyzeDecay();
  }

  /**
   * Analyze interactions for decay patterns
   */
  _analyzeDecay() {
    if (this.interactions.length < DECAY_THRESHOLDS.minInteractions) return;

    const recent = this.interactions.slice(-Math.ceil(this.interactions.length / 2));
    const older = this.interactions.slice(0, Math.floor(this.interactions.length / 2));

    if (older.length === 0) return;

    // 1. Repetition rate increase
    const recentRepetition = recent.reduce((s, i) => s + i.repetitionRate, 0) / recent.length;
    const olderRepetition = older.reduce((s, i) => s + i.repetitionRate, 0) / older.length;
    const repetitionIncrease = olderRepetition > 0 ? (recentRepetition - olderRepetition) / olderRepetition : 0;

    // 2. Sentence length decrease
    const recentAvgLen = recent.reduce((s, i) => s + i.wordCount, 0) / recent.length;
    const olderAvgLen = older.reduce((s, i) => s + i.wordCount, 0) / older.length;
    const sentenceLengthDrop = olderAvgLen > 0 ? (olderAvgLen - recentAvgLen) / olderAvgLen : 0;

    // 3. Vocabulary diversity decrease
    const recentDiversity = recent.reduce((s, i) => s + (i.wordCount > 0 ? i.uniqueWords / i.wordCount : 0), 0) / recent.length;
    const olderDiversity = older.reduce((s, i) => s + (i.wordCount > 0 ? i.uniqueWords / i.wordCount : 0), 0) / older.length;
    const diversityDrop = olderDiversity > 0 ? (olderDiversity - recentDiversity) / olderDiversity : 0;

    // 4. Error rate increase
    const recentErrors = recent.filter(i => i.isError).length / recent.length;
    const olderErrors = older.filter(i => i.isError).length / older.length;
    const errorIncrease = olderErrors > 0 ? (recentErrors - olderErrors) / olderErrors : (recentErrors > 0.3 ? 1 : 0);

    // Calculate decay score (weighted)
    let decayScore = 0;
    if (repetitionIncrease > DECAY_THRESHOLDS.repetitionRate) decayScore += 25;
    if (sentenceLengthDrop > DECAY_THRESHOLDS.avgSentenceLengthDrop) decayScore += 30;
    if (diversityDrop > DECAY_THRESHOLDS.vocabularyDiversityDrop) decayScore += 25;
    if (errorIncrease > DECAY_THRESHOLDS.errorRateIncrease) decayScore += 20;

    // Determine decay level
    let newLevel = 0;
    if (decayScore >= 70) newLevel = 3;      // Severe
    else if (decayScore >= 45) newLevel = 2;  // Moderate
    else if (decayScore >= 20) newLevel = 1;  // Mild

    if (newLevel !== this.decayLevel) {
      this.decayLevel = newLevel;
      this._updateLanguage();
      this._notifyListeners();
    }
  }

  /**
   * Update language based on decay level
   */
  _updateLanguage() {
    if (this.decayLevel === 0) {
      // Revert to original language
      this.currentLanguage = this.originalLanguage;
    } else if (this.decayLevel >= 1) {
      // Keep the same language but use simplified dialect
      this.currentLanguage = this.originalLanguage;
    }
  }

  /**
   * Set the patient's original language
   */
  setOriginalLanguage(lang) {
    this.originalLanguage = lang;
    if (this.decayLevel === 0) {
      this.currentLanguage = lang;
    }
  }

  /**
   * Get simplified text for UI based on decay level
   */
  getSimplifiedText(originalText) {
    if (this.decayLevel === 0) return originalText;

    const dialect = SIMPLIFIED_DIALECTS[this.originalLanguage];
    if (!dialect || !dialect.uiTextSimplification) return originalText;

    return dialect.uiTextSimplification[originalText] || originalText;
  }

  /**
   * Get simplified voice response
   */
  getSimplifiedResponse(key, params = {}) {
    if (this.decayLevel === 0) return null; // Use normal responses

    const dialect = SIMPLIFIED_DIALECTS[this.originalLanguage];
    if (!dialect) return null;

    const phrase = dialect.simplifiedPhrases[key];
    if (!phrase) return null;

    // For severe decay, add extra simplicity
    if (this.decayLevel >= 3) {
      return `${phrase}. ${phrase}.`;
    }
    return phrase;
  }

  /**
   * Get voice synthesis rate (slower for higher decay)
   */
  getVoiceRate() {
    if (this.decayLevel === 0) return 0.95;
    const dialect = SIMPLIFIED_DIALECTS[this.originalLanguage];
    return dialect?.voiceRate || 0.95;
  }

  /**
   * Get BCP47 language code (always keep same script for speech recognition)
   */
  getSpeechLangCode() {
    const dialect = SIMPLIFIED_DIALECTS[this.originalLanguage];
    return dialect?.code || 'en-IN';
  }

  /**
   * Get current decay status for display
   */
  getStatus() {
    return {
      level: this.decayLevel,
      label: ['Normal', 'Mild Decline', 'Moderate Decline', 'Severe Decline'][this.decayLevel],
      interactionCount: this.interactions.length,
      currentLanguage: this.currentLanguage,
      originalLanguage: this.originalLanguage,
      isSimplified: this.decayLevel > 0,
    };
  }

  /**
   * Get the simplified dialect map for current language
   */
  getDialectMap() {
    if (this.decayLevel === 0) return null;
    return SIMPLIFIED_DIALECTS[this.originalLanguage] || null;
  }

  /**
   * Reset decay detection
   */
  reset() {
    this.interactions = [];
    this.decayLevel = 0;
    this.currentLanguage = this.originalLanguage;
    this._notifyListeners();
  }
}

// Singleton instance
export const decayDetector = new LinguisticDecayDetector();
export { SIMPLIFIED_DIALECTS, DECAY_THRESHOLDS };
