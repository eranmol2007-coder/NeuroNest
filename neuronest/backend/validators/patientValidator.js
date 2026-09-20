/**
 * Patient Input Validators
 * @module validators/patientValidator
 */

/**
 * Validate patient creation data
 * @param {Object} data - Patient data
 * @returns {Object} - Validation result with isValid and errors
 */
const validateCreatePatient = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (data.age !== undefined) {
    if (typeof data.age !== 'number' || data.age < 0 || data.age > 150) {
      errors.push('Age must be a number between 0 and 150');
    }
  }

  const validLanguages = ['en', 'hi', 'bn', 'as', 'kha', 'mni', 'mzo'];
  if (data.language && !validLanguages.includes(data.language)) {
    errors.push(`Language must be one of: ${validLanguages.join(', ')}`);
  }

  const validFontSizes = ['normal', 'large', 'extra-large'];
  if (data.fontSize && !validFontSizes.includes(data.fontSize)) {
    errors.push(`Font size must be one of: ${validFontSizes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate patient update data
 * @param {Object} data - Patient update data
 * @returns {Object} - Validation result
 */
const validateUpdatePatient = (data) => {
  const errors = [];

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    }
  }

  if (data.age !== undefined) {
    if (typeof data.age !== 'number' || data.age < 0 || data.age > 150) {
      errors.push('Age must be a number between 0 and 150');
    }
  }

  const validDifficulties = ['easy', 'medium', 'hard'];
  if (data.currentDifficulty && !validDifficulties.includes(data.currentDifficulty)) {
    errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateCreatePatient,
  validateUpdatePatient,
};
