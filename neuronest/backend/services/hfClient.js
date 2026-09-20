/**
 * Shared Hugging Face Inference Client
 * -----------------------------------------------------------------------
 * Single point of access for all HF API calls. Uses the free-tier
 * InferenceClient from @huggingface/inference. Each service imports
 * this instead of creating its own client.
 *
 * If HF_TOKEN is not set, hf is null and all services automatically
 * fall back to their rule-based / template logic.
 */

const { InferenceClient } = require('@huggingface/inference');

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.warn('⚠  HF_TOKEN not set — AI features will fall back to rule-based logic.');
} else {
  console.log('✅ Hugging Face client initialised (free tier).');
}

const hf = HF_TOKEN ? new InferenceClient(HF_TOKEN) : null;

/**
 * Returns true if the HF client is available and ready to make calls.
 */
function isAvailable() {
  return hf !== null;
}

/**
 * Returns the raw InferenceClient instance (or null).
 */
function getClient() {
  return hf;
}

module.exports = { hf, isAvailable, getClient };
