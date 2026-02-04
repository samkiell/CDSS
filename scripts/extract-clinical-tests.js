/**
 * Clinical Tests Extraction Script
 * 
 * Extracts all suggested clinical tests for every patient response from the rules JSON files
 * and structures them for direct use in case files.
 * 
 * Output format:
 * {
 *   region: string,
 *   conditionId: string,
 *   conditionName: string,
 *   questions: [{
 *     questionId: string,
 *     questionText: string,
 *     category: string,
 *     responses: [{
 *       value: string,
 *       effects: object
 *     }]
 *   }],
 *   tests: {
 *     recommended: [{name, procedure, confirmation}],
 *     confirmationMethods: string[],
 *     observations: string[]
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname, '..', 'public', 'rules');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'rules', 'clinical-tests-mapping.json');

// Parse test strings into structured objects
function parseTest(testString) {
  const test = {
    name: '',
    procedure: '',
    confirmation: ''
  };

  // Handle tests with clear procedure descriptions
  const colonIndex = testString.indexOf(':');
  if (colonIndex > 0 && colonIndex < 50) {
    test.name = testString.substring(0, colonIndex).trim();
    const remaining = testString.substring(colonIndex + 1).trim();
    
    // Check if remaining text includes confirmation markers
    const confirmMarkers = ['positive if', 'positive when', 'positive sign', 'indicates', 'confirms'];
    let confirmStart = -1;
    
    for (const marker of confirmMarkers) {
      const idx = remaining.toLowerCase().indexOf(marker);
      if (idx > 0 && (confirmStart === -1 || idx < confirmStart)) {
        confirmStart = idx;
      }
    }
    
    if (confirmStart > 0) {
      test.procedure = remaining.substring(0, confirmStart).trim();
      test.confirmation = remaining.substring(confirmStart).trim();
    } else {
      test.procedure = remaining;
    }
  } else {
    test.name = testString.trim();
  }

  return test;
}

// Parse observations and confirmation methods
function parseConfirmation(str) {
  return str.trim();
}

// Process a single condition to extract test mapping
function processCondition(condition, region) {
  const entry = {
    region: region,
    conditionId: condition.id,
    conditionName: condition.name,
    entryCriteria: condition.entry_criteria || [],
    questions: [],
    tests: {
      recommended: [],
      confirmationMethods: [],
      observations: []
    }
  };

  // Process questions
  if (condition.questions && Array.isArray(condition.questions)) {
    entry.questions = condition.questions.map(q => ({
      questionId: q.id,
      questionText: q.questionText,
      category: q.category || 'general',
      responses: (q.options || []).map(opt => ({
        value: opt.value,
        nextQuestionId: opt.nextQuestionId,
        isTerminal: opt.isTerminal || false,
        branchTo: opt.branchTo || [],
        effects: opt.effects || {}
      }))
    }));
  }

  // Process recommended tests
  if (condition.recommended_tests && Array.isArray(condition.recommended_tests)) {
    entry.tests.recommended = condition.recommended_tests
      .filter(t => t && t.trim())
      .map(parseTest);
  }

  // Process confirmation methods
  if (condition.confirmation_methods && Array.isArray(condition.confirmation_methods)) {
    entry.tests.confirmationMethods = condition.confirmation_methods
      .filter(c => c && c.trim())
      .map(parseConfirmation);
  }

  // Process observations
  if (condition.observations && Array.isArray(condition.observations)) {
    entry.tests.observations = condition.observations
      .filter(o => o && o.trim())
      .map(parseConfirmation);
  }

  return entry;
}

// Create a flat mapping: question → response → condition → tests
function createFlatMapping(conditionMappings) {
  const flatMappings = [];

  for (const cm of conditionMappings) {
    // Only include conditions that have tests
    const hasTests = (
      cm.tests.recommended.length > 0 ||
      cm.tests.confirmationMethods.length > 0 ||
      cm.tests.observations.length > 0
    );

    if (!hasTests) continue;

    for (const question of cm.questions) {
      for (const response of question.responses) {
        flatMappings.push({
          region: cm.region,
          questionId: question.questionId,
          question: question.questionText,
          category: question.category,
          response: response.value,
          isTerminal: response.isTerminal,
          effects: response.effects,
          condition: {
            id: cm.conditionId,
            name: cm.conditionName,
            entryCriteria: cm.entryCriteria
          },
          tests: cm.tests
        });
      }
    }
  }

  return flatMappings;
}

// Create a summary by condition with all associated tests
function createConditionSummary(conditionMappings) {
  return conditionMappings
    .filter(cm => 
      cm.tests.recommended.length > 0 ||
      cm.tests.confirmationMethods.length > 0 ||
      cm.tests.observations.length > 0
    )
    .map(cm => ({
      region: cm.region,
      conditionId: cm.conditionId,
      conditionName: cm.conditionName,
      entryCriteria: cm.entryCriteria,
      questionCount: cm.questions.length,
      firstQuestion: cm.questions[0]?.questionText || '',
      tests: cm.tests
    }));
}

// Create a lookup map for quick test retrieval by condition ID
function createTestLookup(conditionMappings) {
  const lookup = {};
  
  for (const cm of conditionMappings) {
    lookup[cm.conditionId] = {
      conditionName: cm.conditionName,
      region: cm.region,
      tests: cm.tests
    };
  }
  
  return lookup;
}

async function main() {
  console.log('Clinical Tests Extraction Script');
  console.log('================================\n');

  const ruleFiles = [
    'Ankle Region.json',
    'Cervical Region.json',
    'Elbow Region.json',
    'Lumbar Region.json',
    'Shoulder Region.json'
  ];

  const allConditionMappings = [];
  const stats = {
    totalConditions: 0,
    conditionsWithTests: 0,
    totalTests: 0,
    byRegion: {}
  };

  for (const filename of ruleFiles) {
    const filepath = path.join(RULES_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  Skipping ${filename} (file not found)`);
      continue;
    }

    console.log(`📖 Processing: ${filename}`);
    
    const content = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(content);
    const region = data.region || filename.replace('.json', '').toLowerCase();
    
    stats.byRegion[region] = {
      conditions: 0,
      conditionsWithTests: 0,
      tests: 0
    };

    if (data.conditions && Array.isArray(data.conditions)) {
      for (const condition of data.conditions) {
        stats.totalConditions++;
        stats.byRegion[region].conditions++;
        
        const mapping = processCondition(condition, region);
        allConditionMappings.push(mapping);
        
        const testCount = 
          mapping.tests.recommended.length +
          mapping.tests.confirmationMethods.length +
          mapping.tests.observations.length;
        
        if (testCount > 0) {
          stats.conditionsWithTests++;
          stats.byRegion[region].conditionsWithTests++;
          stats.totalTests += testCount;
          stats.byRegion[region].tests += testCount;
        }
      }
    }
    
    console.log(`   ✓ ${stats.byRegion[region].conditions} conditions, ${stats.byRegion[region].tests} tests\n`);
  }

  // Generate output formats
  const output = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    stats: stats,
    
    // Full condition mappings with all questions
    conditionMappings: allConditionMappings,
    
    // Flat mapping: question → response → tests
    questionResponseTests: createFlatMapping(allConditionMappings),
    
    // Summary by condition
    conditionSummary: createConditionSummary(allConditionMappings),
    
    // Lookup map for quick access
    testLookup: createTestLookup(allConditionMappings)
  };

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log('================================');
  console.log('Extraction Complete!');
  console.log(`\nStatistics:`);
  console.log(`  Total Conditions: ${stats.totalConditions}`);
  console.log(`  Conditions with Tests: ${stats.conditionsWithTests}`);
  console.log(`  Total Tests Extracted: ${stats.totalTests}`);
  console.log(`\nBy Region:`);
  
  for (const [region, regionStats] of Object.entries(stats.byRegion)) {
    console.log(`  ${region}: ${regionStats.conditionsWithTests}/${regionStats.conditions} conditions with tests`);
  }
  
  console.log(`\n✅ Output written to: ${OUTPUT_FILE}`);
  
  // Also create a simplified version for case files
  const simplifiedOutput = {
    generatedAt: output.generatedAt,
    version: output.version,
    conditionTests: output.conditionSummary.map(cs => ({
      region: cs.region,
      condition: cs.conditionName,
      conditionId: cs.conditionId,
      recommendedTests: cs.tests.recommended.map(t => t.name).filter(n => n),
      procedures: cs.tests.recommended.map(t => ({
        testName: t.name,
        procedure: t.procedure,
        positiveSign: t.confirmation
      })).filter(t => t.testName),
      confirmationMethods: cs.tests.confirmationMethods,
      clinicalObservations: cs.tests.observations
    }))
  };
  
  const simplifiedOutputFile = path.join(RULES_DIR, 'clinical-tests-for-casefile.json');
  fs.writeFileSync(simplifiedOutputFile, JSON.stringify(simplifiedOutput, null, 2));
  console.log(`✅ Simplified output for case files: ${simplifiedOutputFile}`);
}

main().catch(console.error);
