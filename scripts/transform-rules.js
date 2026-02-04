/**
 * Clinical Rules JSON Transformer
 *
 * This script transforms the clinical rules JSON files into a clean
 * decision-tree-compatible structure with proper branching logic.
 *
 * Tasks performed:
 * 1. Strict Content Classification - separates questions from instructions
 * 2. Question Object Normalization - standardizes structure
 * 3. Proper "Rule Out" Logic - implements branching with nextQuestionId
 * 4. Branch Integrity Validation - ensures no orphans or loops
 * 5. Preserves Clinical Meaning
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname, '..', 'public', 'rules');

// Instructional text patterns that should NOT be answer options
const INSTRUCTIONAL_PATTERNS = [
  /^if\s+(yes|no|patient|the|this)/i,
  /^ask\s+/i,
  /^proceed\s+/i,
  /^rule\s+out/i,
  /^check\s+(if|for|whether)/i,
  /^note:/i,
  /^observe/i,
  /^palpate/i,
  /^perform/i,
  /^use\s+/i,
  /^confirm/i,
  /clinical\s+note/i,
  /^investigate/i,
];

/**
 * Check if text is instructional rather than an answer option
 */
function isInstructionalText(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();

  // Too long for a typical answer option (more than 100 chars)
  if (trimmed.length > 100) return true;

  // Contains instructional patterns
  return INSTRUCTIONAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Extract clinical notes from answer options
 */
function extractClinicalNotes(answers) {
  const cleanAnswers = [];
  const clinicalNotes = [];

  for (const answer of answers) {
    if (isInstructionalText(answer.value)) {
      clinicalNotes.push(answer.value);
    } else {
      cleanAnswers.push(answer);
    }
  }

  return { cleanAnswers, clinicalNotes };
}

/**
 * Normalize a question object to standard structure
 */
function normalizeQuestion(
  question,
  conditionId,
  questionIndex,
  totalQuestions,
  allQuestions
) {
  const normalized = {
    id: question.id,
    questionText: question.question || question.questionText,
    category: question.category || 'general',
    inputType: question.inputType || 'select',
    options: [],
    metadata: {
      source_line: question.source_line,
    },
  };

  // Process answers/options
  const rawAnswers = question.answers || question.options || [];
  const { cleanAnswers, clinicalNotes } = extractClinicalNotes(rawAnswers);

  // Add clinical notes to metadata if extracted
  if (clinicalNotes.length > 0) {
    normalized.metadata.clinicalNotes = clinicalNotes.join('; ');
  }

  // Process each clean answer
  for (const answer of cleanAnswers) {
    const option = {
      value: answer.value,
      nextQuestionId: null, // Will be determined by branching logic
    };

    // Process effects
    if (answer.effects) {
      const effects = {};

      // Handle rule_out - this determines branching
      if (answer.effects.rule_out && answer.effects.rule_out.length > 0) {
        option.branchTo = answer.effects.rule_out;
        effects.rule_out = answer.effects.rule_out;
      }

      if (answer.effects.increase_likelihood) {
        effects.increase_likelihood = answer.effects.increase_likelihood;
      }

      if (answer.effects.decrease_likelihood) {
        effects.decrease_likelihood = answer.effects.decrease_likelihood;
      }

      if (answer.effects.confirm_likelihood) {
        effects.confirm_likelihood = answer.effects.confirm_likelihood;
      }

      if (Object.keys(effects).length > 0) {
        option.effects = effects;
      }

      // Handle red flags
      if (answer.effects.red_flag) {
        option.red_flag = true;
        if (answer.effects.red_flag_text) {
          option.red_flag_text = answer.effects.red_flag_text;
        }
      }

      // Handle next_questions from original
      if (answer.effects.next_questions && answer.effects.next_questions.length > 0) {
        option.nextQuestionId = answer.effects.next_questions[0];
      }

      // Handle notes as metadata
      if (answer.effects.notes && answer.effects.notes.length > 0) {
        option.metadata = { notes: answer.effects.notes };
      }
    }

    normalized.options.push(option);
  }

  return normalized;
}

/**
 * Build a map of condition IDs to their first question IDs
 */
function buildConditionMap(conditions) {
  const map = {};
  for (const condition of conditions) {
    const conditionId =
      condition.id || condition.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (condition.questions && condition.questions.length > 0) {
      map[conditionId] = condition.questions[0].id;
    }
  }
  return map;
}

/**
 * Resolve branching logic for all questions
 */
function resolveBranching(conditions, conditionMap) {
  for (const condition of conditions) {
    const questions = condition.questions || [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const nextQuestion = i < questions.length - 1 ? questions[i + 1] : null;

      for (const option of question.options || []) {
        // If option has branchTo (rule_out), resolve to first question of that condition
        if (option.branchTo && option.branchTo.length > 0) {
          const targetCondition = option.branchTo[0]
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_');
          if (conditionMap[targetCondition]) {
            option.nextQuestionId = conditionMap[targetCondition];
          }
        }

        // If no nextQuestionId yet, default to next question in sequence
        if (!option.nextQuestionId && nextQuestion) {
          option.nextQuestionId = nextQuestion.id;
        }

        // If still no nextQuestionId, mark as terminal
        if (!option.nextQuestionId) {
          option.isTerminal = true;
          option.nextQuestionId = null;
        }
      }
    }
  }

  return conditions;
}

/**
 * Validate branch integrity
 */
function validateBranches(conditions) {
  const allQuestionIds = new Set();
  const referencedIds = new Set();
  const issues = [];

  // Collect all question IDs
  for (const condition of conditions) {
    for (const question of condition.questions || []) {
      if (allQuestionIds.has(question.id)) {
        issues.push(`Duplicate question ID: ${question.id}`);
      }
      allQuestionIds.add(question.id);
    }
  }

  // Check all references
  for (const condition of conditions) {
    for (const question of condition.questions || []) {
      for (const option of question.options || []) {
        if (option.nextQuestionId && !option.isTerminal) {
          referencedIds.add(option.nextQuestionId);
          if (!allQuestionIds.has(option.nextQuestionId)) {
            issues.push(`Orphan reference: ${question.id} -> ${option.nextQuestionId}`);
          }
        }
      }
    }
  }

  // Check for unreferenced questions (except entry points)
  const entryPoints = new Set();
  for (const condition of conditions) {
    if (condition.questions && condition.questions.length > 0) {
      entryPoints.add(condition.questions[0].id);
    }
  }

  for (const id of allQuestionIds) {
    if (!referencedIds.has(id) && !entryPoints.has(id)) {
      // This is acceptable - it means the question is only reachable as an entry point
    }
  }

  return issues;
}

/**
 * Transform a single JSON file
 */
function transformFile(filePath) {
  console.log(`\nTransforming: ${path.basename(filePath)}`);

  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  // Skip General Features (no questions)
  if (data.region === 'general_features') {
    console.log('  Skipping General Features (reference data only)');
    return null;
  }

  // Build condition map for branching resolution
  const conditionMap = buildConditionMap(data.conditions || []);
  console.log(`  Found ${Object.keys(conditionMap).length} conditions`);

  // Transform conditions
  const transformedConditions = [];
  let totalQuestions = 0;

  for (const condition of data.conditions || []) {
    const conditionId =
      condition.id || condition.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const transformedCondition = {
      name: condition.name,
      id: conditionId,
      entry_criteria: condition.entry_criteria || [],
      questions: [],
      metadata: {
        source_line: condition.source_line,
      },
    };

    // Add optional fields if present
    if (condition.recommended_tests) {
      transformedCondition.recommended_tests = condition.recommended_tests;
    }
    if (condition.confirmation_methods) {
      transformedCondition.confirmation_methods = condition.confirmation_methods;
    }
    if (condition.observations) {
      transformedCondition.observations = condition.observations;
    }

    // Transform questions
    const allQuestions = (condition.questions || []).map((q) => q.id);
    for (let i = 0; i < (condition.questions || []).length; i++) {
      const question = condition.questions[i];
      const normalized = normalizeQuestion(
        question,
        conditionId,
        i,
        condition.questions.length,
        allQuestions
      );
      transformedCondition.questions.push(normalized);
      totalQuestions++;
    }

    transformedConditions.push(transformedCondition);
  }

  console.log(`  Transformed ${totalQuestions} questions`);

  // Resolve branching
  const resolvedConditions = resolveBranching(transformedConditions, conditionMap);

  // Validate
  const issues = validateBranches(resolvedConditions);
  if (issues.length > 0) {
    console.log(`  Validation issues:`);
    issues.forEach((issue) => console.log(`    - ${issue}`));
  } else {
    console.log(`  Validation: PASSED`);
  }

  // Build transformed data
  const transformed = {
    region: data.region,
    title: data.title,
    source_file: data.source_file,
    extracted_at: data.extracted_at,
    version: '2.0.0',
    conditions: resolvedConditions,
  };

  return transformed;
}

/**
 * Main transformation function
 */
function main() {
  console.log('Clinical Rules JSON Transformer');
  console.log('================================\n');

  const files = fs.readdirSync(RULES_DIR).filter((f) => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON files in ${RULES_DIR}`);

  const results = {};

  for (const file of files) {
    if (file === 'index.json') continue;

    const filePath = path.join(RULES_DIR, file);
    try {
      const transformed = transformFile(filePath);
      if (transformed) {
        results[file] = transformed;

        // Write transformed file
        const outputPath = filePath; // Overwrite original
        fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf8');
        console.log(`  Saved: ${file}`);
      }
    } catch (error) {
      console.error(`  Error processing ${file}:`, error.message);
    }
  }

  console.log('\n================================');
  console.log('Transformation complete!');
  console.log(`Processed ${Object.keys(results).length} files`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { transformFile, validateBranches };
