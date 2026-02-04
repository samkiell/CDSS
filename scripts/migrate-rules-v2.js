/**
 * RULE MIGRATION SCRIPT - V1 to V2 Branching
 * ============================================
 *
 * This script enhances existing JSON rule files to support the V2 branching engine.
 *
 * KEY TRANSFORMATIONS:
 * 1. Maps 'rule_out' to 'excludedConditions' (fixes the inverted logic)
 * 2. Identifies gating questions based on patterns
 * 3. Adds conditional logic for stiffness → osteoarthritis rule-out
 * 4. Normalizes field names to camelCase
 *
 * USAGE: node scripts/migrate-rules-v2.js
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(process.cwd(), 'public', 'rules');

// Known condition name mappings for fuzzy matching
const CONDITION_MAPPINGS = {
  osteoarthritis: ['Osteoarthritis', 'OA', 'Degenerative Joint Disease'],
  'achilles tendon rupture': ['Achilles Tendon Rupture', 'Achilles Rupture'],
  'tarsal tunnel syndrome': ['Tarsal Tunnel Syndrome', 'TTS'],
  'plantar fasciitis': ['Plantar Fasciitis', 'Plantar Fasciopathy'],
  'rheumatoid arthritis': ['Rheumatoid Arthritis', 'RA'],
  'cauda equina': ['Cauda Equina Syndrome', 'CES'],
};

// Questions that should gate (rule out parent condition on negative answer)
const GATING_PATTERNS = [
  /^do you experience.*stiffness/i,
  /^is.*pain.*locali[sz]ed/i,
  /^do you feel.*pain about \d+\s*cm/i,
  /^have you had.*injury/i,
  /^did you hear.*pop/i,
];

/**
 * Check if a question should be marked as gating
 */
function isGatingQuestion(questionText) {
  return GATING_PATTERNS.some((pattern) => pattern.test(questionText));
}

/**
 * Find the actual condition name from partial match
 */
function normalizeConditionName(partialName, availableConditions) {
  if (!partialName) return null;

  const lower = partialName.toLowerCase().trim();

  // Direct match first
  const directMatch = availableConditions.find((c) => c.toLowerCase() === lower);
  if (directMatch) return directMatch;

  // Partial match
  const partialMatch = availableConditions.find(
    (c) => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  // Fuzzy match using mappings
  for (const [key, aliases] of Object.entries(CONDITION_MAPPINGS)) {
    if (lower.includes(key) || key.includes(lower)) {
      const found = availableConditions.find((c) =>
        aliases.some((alias) => c.toLowerCase().includes(alias.toLowerCase()))
      );
      if (found) return found;
    }
  }

  return partialName; // Return original if no match found
}

/**
 * Migrate a single answer's effects to V2 format
 */
function migrateAnswerEffects(effects, conditionName, availableConditions) {
  const migrated = {
    nextQuestionId: effects.next_question_id || effects.nextQuestionId || null,
    skipToQuestionId: effects.skip_to_question_id || effects.skipToQuestionId || null,
    triggeredConditions:
      effects.triggered_conditions || effects.triggeredConditions || [],
    // KEY FIX: Map rule_out to excludedConditions (this SKIPS the condition, not investigates it)
    excludedConditions: [],
    increaseLikelihood: effects.increase_likelihood || effects.increaseLikelihood || [],
    decreaseLikelihood: effects.decrease_likelihood || effects.decreaseLikelihood || [],
    redFlag: effects.red_flag || effects.redFlag || false,
    redFlagText: effects.red_flag_text || effects.redFlagText || null,
    terminateAssessment:
      effects.terminate_assessment || effects.terminateAssessment || false,
    notes: effects.notes || null,
  };

  // Process rule_out - these should EXCLUDE conditions (skip all their questions)
  const ruleOuts = effects.rule_out || effects.excludedConditions || [];
  for (const ruleOut of ruleOuts) {
    const normalized = normalizeConditionName(ruleOut, availableConditions);
    if (normalized && !migrated.excludedConditions.includes(normalized)) {
      migrated.excludedConditions.push(normalized);
    }
  }

  // Normalize condition names in other arrays
  migrated.triggeredConditions = migrated.triggeredConditions.map(
    (c) => normalizeConditionName(c, availableConditions) || c
  );
  migrated.increaseLikelihood = migrated.increaseLikelihood.map(
    (c) => normalizeConditionName(c, availableConditions) || c
  );
  migrated.decreaseLikelihood = migrated.decreaseLikelihood.map(
    (c) => normalizeConditionName(c, availableConditions) || c
  );

  return migrated;
}

/**
 * Special branching rules based on clinical knowledge
 * These enhance the extracted rules with known clinical pathways
 */
function applyClinicialEnhancements(
  question,
  conditionName,
  answer,
  availableConditions
) {
  const enhancements = {};
  const qLower = (question.question || question.questionText || '').toLowerCase();
  const aLower = (answer.value || '').toLowerCase();

  // STIFFNESS QUESTIONS
  // "Do you experience ankle joint stiffness?"
  // → No → Rule out Osteoarthritis (no stiffness = unlikely OA)
  // → Yes → Trigger investigation of Osteoarthritis (stiffness = possible OA)
  if (qLower.includes('stiffness') && !qLower.includes('if yes')) {
    const oaCondition = availableConditions.find((c) =>
      c.toLowerCase().includes('osteoarthritis')
    );
    if (oaCondition) {
      if (aLower === 'no') {
        // No stiffness = rule out OA
        enhancements.excludedConditions = enhancements.excludedConditions || [];
        if (!enhancements.excludedConditions.includes(oaCondition)) {
          enhancements.excludedConditions.push(oaCondition);
        }
        // IMPORTANT: Clear any incorrect rule_out inherited from source
        enhancements._clearExcluded = false; // Signal to not inherit
      } else if (aLower === 'yes') {
        // Has stiffness = trigger OA investigation (increase likelihood)
        enhancements.triggeredConditions = enhancements.triggeredConditions || [];
        if (!enhancements.triggeredConditions.includes(oaCondition)) {
          enhancements.triggeredConditions.push(oaCondition);
        }
        enhancements.increaseLikelihood = enhancements.increaseLikelihood || [];
        if (!enhancements.increaseLikelihood.includes(oaCondition)) {
          enhancements.increaseLikelihood.push(oaCondition);
        }
        // IMPORTANT: Clear any incorrect rule_out from source that says Yes rules out OA
        enhancements._clearExcludedForYes = true;
      }
    }
  }

  // "If yes, when?" for stiffness - if morning, increase likelihood of OA
  if (qLower.includes('if yes') && qLower.includes('when')) {
    if (aLower === 'morning') {
      const oaCondition = availableConditions.find((c) =>
        c.toLowerCase().includes('osteoarthritis')
      );
      if (oaCondition) {
        enhancements.increaseLikelihood = enhancements.increaseLikelihood || [];
        if (!enhancements.increaseLikelihood.includes(oaCondition)) {
          enhancements.increaseLikelihood.push(oaCondition);
        }
      }
    }
  }

  // PAIN ONSET QUESTIONS
  // Sudden onset → Investigate rupture/acute injury
  if (qLower.includes('how did') && qLower.includes('begin') && aLower === 'sudden') {
    const ruptureCondition = availableConditions.find((c) =>
      c.toLowerCase().includes('rupture')
    );
    if (ruptureCondition) {
      enhancements.triggeredConditions = enhancements.triggeredConditions || [];
      if (!enhancements.triggeredConditions.includes(ruptureCondition)) {
        enhancements.triggeredConditions.push(ruptureCondition);
      }
    }
  }

  // BOWEL/BLADDER - Always red flag
  if (qLower.includes('bowel') || qLower.includes('bladder')) {
    if (aLower === 'yes' || aLower.includes('difficulty')) {
      enhancements.redFlag = true;
      enhancements.redFlagText =
        'Possible Cauda Equina Syndrome - Urgent referral required';
    }
  }

  return enhancements;
}

/**
 * Migrate a single question to V2 format
 */
function migrateQuestion(question, conditionName, availableConditions) {
  const questionText = question.question || question.questionText || '';
  const isGating = isGatingQuestion(questionText);

  const migrated = {
    id: question.id,
    questionText: questionText,
    question: questionText, // Backward compatibility
    condition: conditionName,
    category: question.category || 'general',
    inputType: question.inputType || 'select',
    source_line: question.source_line,

    // V2 fields
    isGating: isGating,
    requiredConditions: question.requiredConditions || question.required_conditions || [],
    excludedIfConditions:
      question.excludedIfConditions || question.excluded_if_conditions || [],

    // Migrate answers
    options: (question.answers || question.options || []).map((answer) => {
      const migratedEffects = migrateAnswerEffects(
        answer.effects || {},
        conditionName,
        availableConditions
      );

      // Apply clinical enhancements
      const enhancements = applyClinicialEnhancements(
        question,
        conditionName,
        answer,
        availableConditions
      );

      // Merge enhancements
      Object.keys(enhancements).forEach((key) => {
        // Skip internal flags
        if (key.startsWith('_')) return;

        if (Array.isArray(enhancements[key])) {
          migratedEffects[key] = migratedEffects[key] || [];
          enhancements[key].forEach((item) => {
            if (!migratedEffects[key].includes(item)) {
              migratedEffects[key].push(item);
            }
          });
        } else {
          migratedEffects[key] = enhancements[key];
        }
      });

      // Handle clinical corrections: Clear incorrect excludedConditions for "Yes" stiffness answers
      if (enhancements._clearExcludedForYes) {
        // Remove OA from excludedConditions since "Yes" to stiffness should NOT rule out OA
        migratedEffects.excludedConditions = (
          migratedEffects.excludedConditions || []
        ).filter((c) => !c.toLowerCase().includes('osteoarthritis'));
      }

      return {
        value: answer.value,
        effects: migratedEffects,
      };
    }),

    // Keep legacy field for backward compatibility
    answers: undefined, // Will be removed
  };

  // Copy options to answers for backward compat
  migrated.answers = migrated.options;

  return migrated;
}

/**
 * Migrate a single condition to V2 format
 */
function migrateCondition(condition, availableConditions) {
  return {
    name: condition.name,
    entry_criteria: condition.entry_criteria || [],
    is_general: condition.is_general || condition.name === 'General Assessment',
    source_line: condition.source_line,

    // Migrate questions
    questions: (condition.questions || []).map((q) =>
      migrateQuestion(q, condition.name, availableConditions)
    ),

    // Keep test/observation data
    tests: (condition.recommended_tests || []).map((test, i) => ({
      name: typeof test === 'string' ? `Clinical Test ${i + 1}` : test.name,
      procedure: typeof test === 'string' ? test : test.procedure,
    })),
  };
}

/**
 * Process a single JSON rules file
 */
function migrateRulesFile(filePath) {
  console.log(`\nMigrating: ${path.basename(filePath)}`);

  const content = fs.readFileSync(filePath, 'utf8');
  const rules = JSON.parse(content);

  // Get all condition names for normalization
  const availableConditions = (rules.conditions || []).map((c) => c.name);

  // Migrate each condition
  const migratedConditions = (rules.conditions || []).map((condition) =>
    migrateCondition(condition, availableConditions)
  );

  // Calculate stats
  let totalQuestions = 0;
  let gatingQuestions = 0;
  let questionsWithRuleOuts = 0;

  migratedConditions.forEach((cond) => {
    cond.questions.forEach((q) => {
      totalQuestions++;
      if (q.isGating) gatingQuestions++;
      q.options.forEach((opt) => {
        if (opt.effects.excludedConditions?.length > 0) {
          questionsWithRuleOuts++;
        }
      });
    });
  });

  const migrated = {
    region: rules.region,
    title: rules.title,
    source_file: rules.source_file,
    extracted_at: rules.extracted_at,
    migrated_at: new Date().toISOString(),
    engine_version: 'v2-branching',
    conditions: migratedConditions,
    // Don't include raw_text in migrated version to reduce size
  };

  // Write migrated file
  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));

  console.log(`  ✓ Migrated ${migratedConditions.length} conditions`);
  console.log(`  ✓ Total questions: ${totalQuestions}`);
  console.log(`  ✓ Gating questions: ${gatingQuestions}`);
  console.log(`  ✓ Questions with rule-outs: ${questionsWithRuleOuts}`);

  return {
    region: rules.region,
    conditions: migratedConditions.length,
    questions: totalQuestions,
    gating: gatingQuestions,
    ruleOuts: questionsWithRuleOuts,
  };
}

/**
 * Main migration process
 */
function migrateAllRules() {
  console.log('═'.repeat(60));
  console.log('RULE MIGRATION: V1 → V2 BRANCHING ENGINE');
  console.log('═'.repeat(60));
  console.log(`\nSource directory: ${RULES_DIR}`);

  // Find all JSON rule files (excluding index)
  const files = fs.readdirSync(RULES_DIR);
  const jsonFiles = files.filter(
    (f) =>
      f.endsWith('.json') &&
      f !== 'index.json' &&
      !f.includes('clinical-tests') &&
      f.includes('Region')
  );

  console.log(`\nFound ${jsonFiles.length} rule files to migrate`);

  const results = [];

  for (const jsonFile of jsonFiles) {
    const fullPath = path.join(RULES_DIR, jsonFile);
    try {
      const result = migrateRulesFile(fullPath);
      results.push(result);
    } catch (error) {
      console.error(`  ✗ Error migrating ${jsonFile}:`, error.message);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('MIGRATION COMPLETE');
  console.log('═'.repeat(60));
  console.log('\nResults:');

  results.forEach((r) => {
    console.log(
      `  ${r.region}: ${r.questions} questions, ${r.gating} gating, ${r.ruleOuts} rule-outs`
    );
  });

  const totalQuestions = results.reduce((sum, r) => sum + r.questions, 0);
  const totalGating = results.reduce((sum, r) => sum + r.gating, 0);
  const totalRuleOuts = results.reduce((sum, r) => sum + r.ruleOuts, 0);

  console.log('\n  TOTALS:');
  console.log(`    Questions: ${totalQuestions}`);
  console.log(`    Gating questions: ${totalGating}`);
  console.log(`    Rule-out triggers: ${totalRuleOuts}`);
  console.log('═'.repeat(60));
}

// Run if executed directly
if (require.main === module) {
  migrateAllRules();
}

module.exports = { migrateAllRules, migrateRulesFile };
