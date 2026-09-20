/**
 * Cognitive Decline Report Service
 * -----------------------------------------------------------------------
 * Generates plain-language caregiver reports from patient data using
 * HuggingFace's text-generation pipeline.
 *
 * Model   : google/gemma-2-2b-it (free, small but capable instruction LLM)
 * Fallback: deterministic template-based report when HF is unavailable.
 *
 * NOTE: Gemma requires a one-time "Agree and access" on HuggingFace.co.
 *       Visit https://huggingface.co/google/gemma-2-2b-it to accept terms.
 */

const { hf, isAvailable } = require('./hfClient');

const REPORT_MODEL = 'google/gemma-2-2b-it';

/**
 * Generate a cognitive decline report from patient data.
 * @param {object} patientData
 * @param {Array}  patientData.recentScores  - Recent game scores
 * @param {Array}  patientData.recentMoods   - Recent mood check-ins
 * @param {Array}  patientData.reminders     - Reminder completion data
 * @param {object} patientData.patient       - Patient profile (name, age, etc.)
 * @param {string} patientData.period        - 'week' | 'month'
 * @returns {{ report, generatedBy, keyFindings }}
 */
async function generateReport(patientData) {
  if (isAvailable()) {
    try {
      return await _generateWithHF(patientData);
    } catch (err) {
      console.warn('HF report generation failed, using template:', err.message);
    }
  }

  return { ..._generateWithTemplate(patientData), generatedBy: 'template' };
}

// ── HuggingFace text-generation path ─────────────────────────────────────────

async function _generateWithHF(patientData) {
  const summary = _buildDataSummary(patientData);
  const name    = patientData.patient?.name || 'the patient';
  const period  = patientData.period || 'week';

  const prompt = `<bos><start_of_turn>user
You are a caring health assistant writing a weekly report for a caregiver about a dementia patient named ${name}.

Here is the patient's data for the past ${period}:
${summary}

Write a brief, compassionate report (3-5 sentences) covering:
1. Cognitive performance trend
2. Emotional wellbeing
3. Medication adherence
4. Any concerns or recommendations

Keep the language simple and empathetic. Do not use medical jargon.<end_of_turn>
<start_of_turn>model
`;

  const result = await hf.textGeneration({
    model: REPORT_MODEL,
    inputs: prompt,
    parameters: {
      max_new_tokens: 300,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.2,
    },
  });

  // Strip the echoed prompt from the response
  const report      = result.generated_text.replace(prompt, '').trim();
  const keyFindings = _extractKeyFindings(patientData);

  return { report, generatedBy: 'ai', keyFindings };
}

// ── Template-based fallback ──────────────────────────────────────────────────

function _generateWithTemplate(patientData) {
  const {
    recentScores = [],
    recentMoods  = [],
    reminders    = [],
    patient      = {},
    period       = 'week',
  } = patientData;

  const name      = patient.name || 'The patient';
  const findings  = [];
  const sentences = [];

  // Accuracy analysis
  if (recentScores.length > 0) {
    const avgAccuracy = Math.round(
      recentScores.reduce((s, r) => s + r.accuracy, 0) / recentScores.length
    );
    const half      = Math.floor(recentScores.length / 2);
    const firstHalf = recentScores.slice(0, half);
    const secHalf   = recentScores.slice(half);

    const avgFirst = firstHalf.length > 0
      ? Math.round(firstHalf.reduce((s, r) => s + r.accuracy, 0) / firstHalf.length)
      : avgAccuracy;
    const avgSec   = secHalf.length > 0
      ? Math.round(secHalf.reduce((s, r) => s + r.accuracy, 0) / secHalf.length)
      : avgAccuracy;

    if (avgFirst < avgSec - 10) {
      sentences.push(`${name}'s cognitive performance has improved over the ${period}, with accuracy rising from ${avgSec}% to ${avgFirst}%.`);
      findings.push('Improving cognitive performance');
    } else if (avgFirst > avgSec + 10) {
      sentences.push(`${name}'s cognitive performance has declined over the ${period}, with accuracy dropping from ${avgSec}% to ${avgFirst}%.`);
      findings.push('Declining cognitive performance');
    } else {
      sentences.push(`${name}'s cognitive performance has been stable this ${period}, averaging ${avgAccuracy}% accuracy across games.`);
      findings.push('Stable cognitive performance');
    }
  }

  // Mood analysis
  if (recentMoods.length > 0) {
    const avgMood   = (recentMoods.reduce((s, m) => s + (m.moodScore || 3), 0) / recentMoods.length).toFixed(1);
    const recent3   = recentMoods.slice(0, 3);
    const avgRecent = (recent3.reduce((s, m) => s + (m.moodScore || 3), 0) / recent3.length).toFixed(1);

    if (parseFloat(avgRecent) <= 2) {
      sentences.push(`Emotional wellbeing is a concern — recent mood check-ins have been consistently low (avg ${avgRecent}/5).`);
      findings.push('Low mood detected');
    } else if (parseFloat(avgRecent) >= 4) {
      sentences.push(`Emotional wellbeing appears good, with positive mood reports (avg ${avgRecent}/5).`);
      findings.push('Positive emotional state');
    } else {
      sentences.push(`Mood has been moderate this ${period} (avg ${avgMood}/5).`);
    }
  }

  // Reminder adherence
  if (reminders.length > 0) {
    const completed = reminders.filter(r => r.status === 'completed').length;
    const adherence = Math.round((completed / reminders.length) * 100);

    if (adherence < 70) {
      sentences.push(`Medication adherence is concerning at ${adherence}% — several reminders were missed.`);
      findings.push('Poor medication adherence');
    } else if (adherence >= 90) {
      sentences.push(`Medication adherence is excellent at ${adherence}%.`);
      findings.push('Good medication adherence');
    } else {
      sentences.push(`Medication adherence is at ${adherence}%, which is acceptable but could be improved.`);
    }
  }

  if (sentences.length === 0) {
    sentences.push(
      `Insufficient data to generate a detailed ${period} report for ${name}. More activity is needed for meaningful analysis.`
    );
  }
  if (findings.length === 0) findings.push('Overall stable condition');

  return { report: sentences.join(' '), generatedBy: 'template', keyFindings: findings };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function _buildDataSummary(patientData) {
  const { recentScores = [], recentMoods = [], reminders = [] } = patientData;
  const lines = [];

  if (recentScores.length > 0) {
    const avg = Math.round(recentScores.reduce((s, r) => s + r.accuracy, 0) / recentScores.length);
    lines.push(`- Game accuracy: avg ${avg}% across ${recentScores.length} games`);
    lines.push(`- Difficulty levels: ${[...new Set(recentScores.map(r => r.difficulty))].join(', ')}`);
  }

  if (recentMoods.length > 0) {
    const avg   = (recentMoods.reduce((s, m) => s + (m.moodScore || 3), 0) / recentMoods.length).toFixed(1);
    const moods = recentMoods.map(m => m.mood || 'unknown').join(', ');
    lines.push(`- Mood scores: avg ${avg}/5 (recent: ${moods})`);
  }

  if (reminders.length > 0) {
    const completed = reminders.filter(r => r.status === 'completed').length;
    lines.push(
      `- Reminders: ${completed}/${reminders.length} completed (${Math.round((completed / reminders.length) * 100)}% adherence)`
    );
  }

  return lines.length > 0 ? lines.join('\n') : 'No recent activity data available.';
}

function _extractKeyFindings(patientData) {
  const findings = [];
  const { recentScores = [], recentMoods = [], reminders = [] } = patientData;

  if (recentScores.length > 0) {
    const avg = Math.round(recentScores.reduce((s, r) => s + r.accuracy, 0) / recentScores.length);
    if (avg < 50) findings.push('Low cognitive accuracy');
    else if (avg > 80) findings.push('Strong cognitive performance');
  }

  if (recentMoods.length > 0) {
    const avg = recentMoods.reduce((s, m) => s + (m.moodScore || 3), 0) / recentMoods.length;
    if (avg <= 2) findings.push('Concerning mood patterns');
    else if (avg >= 4) findings.push('Positive emotional state');
  }

  if (reminders.length > 0) {
    const adherence = reminders.filter(r => r.status === 'completed').length / reminders.length;
    if (adherence < 0.7) findings.push('Medication adherence needs attention');
  }

  return findings.length > 0 ? findings : ['Stable overall condition'];
}

module.exports = { generateReport };
