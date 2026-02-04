/**
 * RULE INGESTION SCRIPT
 * ======================
 * Extracts medical assessment rules from DOCX files and converts them to structured JSON.
 *
 * SOURCE OF TRUTH: DOCX files in public/rules/
 * OUTPUT: JSON files alongside DOCX files in public/rules/
 *
 * IMPORTANT CONSTRAINTS:
 * - Do NOT invent medical rules not explicitly present in the documents
 * - Do NOT simplify or paraphrase clinical meaning
 * - Preserve original wording as much as possible
 * - Add TODO markers where content is ambiguous
 *
 * USAGE: node scripts/ingest-rules.js
 */

const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(process.cwd(), 'public', 'rules');

/**
 * RULE SCHEMA
 * ============
 * Each JSON rule file follows this structure:
 * {
 *   "region": "cervical | lumbar | ankle | etc",
 *   "title": "Human-readable title",
 *   "source_file": "Original DOCX filename",
 *   "extracted_at": "ISO timestamp",
 *   "conditions": [
 *     {
 *       "name": "Condition Name",
 *       "entry_criteria": [],
 *       "questions": [
 *         {
 *           "id": "unique_question_id",
 *           "question": "Question text from document",
 *           "category": "location | temporal | onset | red_flag | etc",
 *           "answers": [
 *             {
 *               "value": "Yes | No | Option text",
 *               "effects": {
 *                 "rule_out": ["conditions to investigate further"],
 *                 "increase_likelihood": ["conditions more likely"],
 *                 "decrease_likelihood": ["conditions less likely"],
 *                 "next_questions": ["question_ids to ask next"]
 *               }
 *             }
 *           ]
 *         }
 *       ],
 *       "recommended_tests": [],
 *       "confirmation_methods": []
 *     }
 *   ],
 *   "raw_text": "Original extracted text for reference"
 * }
 */

/**
 * Extract text content from a DOCX file
 */
async function extractDocxText(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      text: result.value,
      messages: result.messages,
    };
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    return { text: '', messages: [{ type: 'error', message: error.message }] };
  }
}

/**
 * Parse region name from filename
 */
function getRegionFromFilename(filename) {
  const name = path.basename(filename, '.docx').toLowerCase();
  if (name.includes('cervical')) return 'cervical';
  if (name.includes('lumbar')) return 'lumbar';
  if (name.includes('ankle')) return 'ankle';
  if (name.includes('shoulder')) return 'shoulder';
  if (name.includes('elbow')) return 'elbow';
  if (name.includes('general')) return 'general';
  return name.replace(/\s+/g, '_');
}

/**
 * Parse structured rules from raw text
 *
 * TODO: This parser requires enhancement for each specific document format.
 * Currently extracts basic structure; may need manual review for complex branching.
 */
function parseRulesFromText(rawText, region) {
  const lines = rawText.split('\n').filter((line) => line.trim());

  const conditions = [];
  let currentCondition = null;
  let currentQuestion = null;
  let questionCounter = 1;

  /**
   * PARSING STRATEGY:
   * 1. Look for condition headers (e.g., "CONDITION:", numbered conditions)
   * 2. Look for question patterns (e.g., "Q:", numbered questions, "?")
   * 3. Look for answer patterns (e.g., "Yes/No", bullet points)
   * 4. Look for clinical markers (e.g., "RED FLAG", "Rule out", "Confirm")
   */

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const upperLine = line.toUpperCase();

    // Detect condition headers
    if (
      upperLine.startsWith('CONDITION') ||
      upperLine.includes('PATHOLOGY') ||
      /^[0-9]+\.\s*[A-Z]/.test(line)
    ) {
      if (currentCondition) {
        conditions.push(currentCondition);
      }
      currentCondition = {
        name: line.replace(/^[0-9]+\.\s*/, '').replace(/^CONDITION[:\s]*/i, ''),
        entry_criteria: [],
        questions: [],
        recommended_tests: [],
        confirmation_methods: [],
        raw_section: line,
      };
      continue;
    }

    // Detect questions (lines ending with ?)
    if (line.includes('?')) {
      currentQuestion = {
        id: `${region}_q${questionCounter++}`,
        question: line,
        category: categorizeQuestion(line),
        answers: [],
        source_line: i + 1,
      };

      if (currentCondition) {
        currentCondition.questions.push(currentQuestion);
      }
      continue;
    }

    // Detect Yes/No answers
    if (
      currentQuestion &&
      (upperLine.startsWith('YES') ||
        upperLine.startsWith('NO') ||
        upperLine.match(/^[A-D]\)/))
    ) {
      const effects = parseEffectsFromLine(line, lines.slice(i + 1, i + 3).join(' '));
      currentQuestion.answers.push({
        value: line.split(/[-–:]/)[0].trim(),
        effects,
      });
      continue;
    }

    // Detect red flags
    if (upperLine.includes('RED FLAG') || upperLine.includes('CRITICAL')) {
      if (currentQuestion && currentQuestion.answers.length > 0) {
        const lastAnswer = currentQuestion.answers[currentQuestion.answers.length - 1];
        lastAnswer.effects.red_flag = true;
        lastAnswer.effects.red_flag_text = line;
      }
    }

    // Detect recommended tests
    if (
      upperLine.includes('TEST') ||
      upperLine.includes('EXAMINATION') ||
      upperLine.includes('PHYSICAL EXAM')
    ) {
      if (currentCondition) {
        currentCondition.recommended_tests.push(line);
      }
    }

    // Detect confirmation methods
    if (upperLine.includes('CONFIRM') || upperLine.includes('DIAGNOSIS')) {
      if (currentCondition) {
        currentCondition.confirmation_methods.push(line);
      }
    }
  }

  // Push last condition
  if (currentCondition) {
    conditions.push(currentCondition);
  }

  return conditions;
}

/**
 * Categorize question based on content
 */
function categorizeQuestion(text) {
  const upper = text.toUpperCase();

  if (upper.includes('LOCATION') || upper.includes('WHERE')) return 'location';
  if (upper.includes('WHEN') || upper.includes('MORNING') || upper.includes('NIGHT'))
    return 'temporal';
  if (upper.includes('HOW') && upper.includes('BEGIN')) return 'onset';
  if (upper.includes('STIFF')) return 'stiffness';
  if (upper.includes('NUMB') || upper.includes('TINGL')) return 'neurological';
  if (upper.includes('WEAK')) return 'neurological';
  if (upper.includes('BOWEL') || upper.includes('BLADDER')) return 'red_flag';
  if (upper.includes('SCALE') || upper.includes('0-10')) return 'pain_intensity';
  if (upper.includes('RADIAT')) return 'radiation';
  if (upper.includes('SWELL')) return 'inflammation';
  if (upper.includes('POP') || upper.includes('CRACK')) return 'mechanical';
  if (upper.includes('WALK') || upper.includes('BEAR WEIGHT')) return 'function';

  return 'general';
}

/**
 * Parse effects from answer line and context
 */
function parseEffectsFromLine(line, context) {
  const effects = {
    rule_out: [],
    increase_likelihood: [],
    decrease_likelihood: [],
    next_questions: [],
  };

  const combined = (line + ' ' + context).toUpperCase();

  // Parse "Rule out" - in this context means "investigate further"
  if (combined.includes('RULE OUT')) {
    const match = combined.match(/RULE OUT[:\s]*([A-Z\s]+)/);
    if (match) {
      effects.rule_out.push(match[1].trim());
    }
  }

  // Parse "Confirm"
  if (combined.includes('CONFIRM')) {
    const match = combined.match(/CONFIRM[:\s]*([A-Z\s]+)/);
    if (match) {
      effects.increase_likelihood.push(match[1].trim());
    }
  }

  // Parse "Indicator"
  if (combined.includes('INDICATOR')) {
    const match = combined.match(/([A-Z\s]+)\s*INDICATOR/);
    if (match) {
      effects.increase_likelihood.push(match[1].trim());
    }
  }

  return effects;
}

/**
 * Convert a single DOCX file to JSON
 */
async function convertDocxToJson(docxPath) {
  const filename = path.basename(docxPath);
  const region = getRegionFromFilename(filename);

  console.log(`Processing: ${filename} -> ${region}`);

  const { text, messages } = await extractDocxText(docxPath);

  if (!text) {
    console.warn(`  Warning: No text extracted from ${filename}`);
    return null;
  }

  const conditions = parseRulesFromText(text, region);

  const ruleJson = {
    region,
    title: path.basename(filename, '.docx'),
    source_file: filename,
    extracted_at: new Date().toISOString(),
    /**
     * PARSER NOTE:
     * The conditions below are automatically extracted from the DOCX file.
     * Manual review is recommended to verify clinical accuracy.
     * TODO markers indicate areas needing human verification.
     */
    conditions,
    /**
     * RAW TEXT:
     * Preserved for reference and manual verification.
     * This is the exact text extracted from the source DOCX.
     */
    raw_text: text,
    extraction_messages: messages,
  };

  // Write JSON file alongside DOCX
  const jsonPath = docxPath.replace('.docx', '.json');
  fs.writeFileSync(jsonPath, JSON.stringify(ruleJson, null, 2));

  console.log(`  Created: ${path.basename(jsonPath)}`);
  console.log(`  Conditions found: ${conditions.length}`);

  return ruleJson;
}

/**
 * Main ingestion process
 */
async function ingestAllRules() {
  console.log('='.repeat(60));
  console.log('MEDICAL RULE INGESTION');
  console.log('='.repeat(60));
  console.log(`Source directory: ${RULES_DIR}`);
  console.log('');

  // Find all DOCX files
  const files = fs.readdirSync(RULES_DIR);
  const docxFiles = files.filter((f) => f.endsWith('.docx'));

  console.log(`Found ${docxFiles.length} DOCX files\n`);

  const results = [];

  for (const docxFile of docxFiles) {
    const fullPath = path.join(RULES_DIR, docxFile);
    const result = await convertDocxToJson(fullPath);
    if (result) {
      results.push(result);
    }
    console.log('');
  }

  // Create index file
  const indexPath = path.join(RULES_DIR, 'index.json');
  const index = {
    generated_at: new Date().toISOString(),
    regions: results.map((r) => ({
      region: r.region,
      title: r.title,
      source_file: r.source_file,
      json_file: r.source_file.replace('.docx', '.json'),
      condition_count: r.conditions.length,
    })),
  };

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  console.log('='.repeat(60));
  console.log('INGESTION COMPLETE');
  console.log(`Created ${results.length} JSON rule files`);
  console.log(`Index file: ${indexPath}`);
  console.log('='.repeat(60));
}

// Run if executed directly
if (require.main === module) {
  ingestAllRules().catch(console.error);
}

module.exports = { ingestAllRules, convertDocxToJson, extractDocxText };
