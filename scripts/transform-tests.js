/**
 * TEST TRANSFORMATION SCRIPT
 * ==========================
 * Transforms extracted rule data to properly structure clinical tests for each condition.
 * 
 * SOURCE: JSON files in public/rules/ (extracted from DOCX)
 * OUTPUT: Updated JSON files with normalized tests arrays
 * 
 * This script reads the raw_text from each JSON file and re-parses it specifically
 * for tests, ensuring each condition has a proper tests array.
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(process.cwd(), 'public', 'rules');

/**
 * Parse a test string into structured format
 */
function parseTestString(testStr) {
  const test = {
    name: '',
    procedure: ''
  };

  // Clean up the string
  let cleanStr = testStr.trim();
  
  // Skip observation-type strings (these are not actual tests)
  if (/^check\s+(if|for|whether)/i.test(cleanStr) && !cleanStr.includes('Test')) {
    return {
      name: 'Clinical Observation',
      procedure: cleanStr
    };
  }
  
  // Handle "Test Name: Description" format
  const colonIndex = cleanStr.indexOf(':');
  if (colonIndex > 0 && colonIndex < 80) {
    const beforeColon = cleanStr.substring(0, colonIndex).trim();
    const afterColon = cleanStr.substring(colonIndex + 1).trim();
    
    // Check if before colon looks like a test name
    if (beforeColon.length < 100 && (
      beforeColon.toLowerCase().includes('test') ||
      beforeColon.toLowerCase().includes('sign') ||
      beforeColon.includes("'s") ||
      /^[A-Z]/.test(beforeColon)
    )) {
      test.name = beforeColon;
      test.procedure = afterColon;
      return test;
    }
  }
  
  // Handle test names with description in parentheses
  const parenMatch = cleanStr.match(/^([^(]+)\s*\(([^)]+)\)\s*:?\s*(.*)$/);
  if (parenMatch) {
    test.name = parenMatch[1].trim() + ' (' + parenMatch[2].trim() + ')';
    test.procedure = parenMatch[3].trim() || '';
    return test;
  }
  
  // Default: entire string is the test name/procedure
  test.name = cleanStr;
  return test;
}

/**
 * Extract tests from raw text for a specific condition
 */
function extractTestsForCondition(rawText, conditionName) {
  const tests = [];
  const lines = rawText.split('\n');
  
  // Find the section for this condition
  let inCondition = false;
  let inTestSection = false;
  let conditionPattern = new RegExp(`for\\s+${escapeRegex(conditionName)}`, 'i');
  
  // Also try exact match
  let exactPattern = new RegExp(`^for\\s+${escapeRegex(conditionName)}\\s*$`, 'i');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const upperLine = line.toUpperCase();
    
    // Check if we're entering this condition's section
    if (conditionPattern.test(line) || exactPattern.test(line)) {
      inCondition = true;
      inTestSection = false;
      continue;
    }
    
    // Check if we're leaving this condition (entering another)
    if (inCondition && /^FOR\s+/i.test(line) && !conditionPattern.test(line)) {
      break;
    }
    
    // Check for TEST section markers
    if (inCondition && (upperLine === 'TEST' || upperLine === 'TESTS' || upperLine === 'TEST:' || upperLine === 'TESTS:' || upperLine.startsWith('SPECIAL TEST') || upperLine.startsWith('CONFIRMATORY TEST'))) {
      inTestSection = true;
      continue;
    }
    
    // Check for Radiographic confirmation
    if (inCondition && (upperLine.includes('RADIOGRAPHIC') || upperLine.includes('X-RAY') || upperLine.includes('MRI') || upperLine.includes('ULTRASOUND'))) {
      if (line.length > 5) {
        const test = parseTestString(line);
        if (!test.name.toLowerCase().startsWith('radiographic')) {
          test.name = 'Radiographic Confirmation';
          test.procedure = line;
        }
        tests.push(test);
      }
      continue;
    }
    
    // Collect test descriptions
    if (inTestSection && line.length > 10) {
      // Skip if it looks like a new section or question
      if (/^FOR\s+/i.test(line) || line.includes('?') || /^Age\s*\(/i.test(line)) {
        inTestSection = false;
        continue;
      }
      
      // Skip simple observation lines that aren't tests
      if (/^(Yes|No)$/i.test(line)) {
        continue;
      }
      
      const test = parseTestString(line);
      if (test.name || test.procedure) {
        tests.push(test);
      }
    }
  }
  
  return tests;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get tests for all conditions by parsing raw text more thoroughly
 */
function parseAllTestsFromRawText(rawText) {
  const conditionTests = {};
  const lines = rawText.split('\n');
  
  let currentCondition = null;
  let inTestSection = false;
  let currentTests = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const upperLine = line.toUpperCase();
    
    // Detect condition headers
    if (/^FOR\s+/i.test(line) && !line.includes('?')) {
      // Save previous condition's tests
      if (currentCondition && currentTests.length > 0) {
        conditionTests[currentCondition] = [...currentTests];
      }
      
      // Start new condition
      currentCondition = line.replace(/^FOR\s+/i, '').replace(/[:\s…]*$/, '').trim();
      currentTests = [];
      inTestSection = false;
      continue;
    }
    
    // Detect standalone condition headers (e.g., "RHEUMATOID ARTHRITIS", "OSTEOARTHRITIS")
    if (/^[A-Z][A-Z\s]+$/.test(line) && line.length > 5 && !upperLine.includes('TEST') && !upperLine.includes('OBSERVATION')) {
      if (currentCondition && currentTests.length > 0) {
        conditionTests[currentCondition] = [...currentTests];
      }
      currentCondition = line.trim();
      currentTests = [];
      inTestSection = false;
      continue;
    }
    
    // Detect TEST section
    if (upperLine === 'TEST' || upperLine === 'TESTS' || upperLine === 'TEST:' || upperLine === 'TESTS:' || 
        upperLine.startsWith('SPECIAL TEST') || upperLine.startsWith('CONFIRMATORY TEST') ||
        upperLine.startsWith('PROVOCATIVE TEST')) {
      inTestSection = true;
      continue;
    }
    
    // End of test section markers
    if (inTestSection && (upperLine === 'OBSERVATION' || upperLine === 'OBSERVATIONS' || upperLine.startsWith('OBSERVATION'))) {
      inTestSection = false;
      continue;
    }
    
    // Collect tests
    if (inTestSection && line.length > 10 && currentCondition) {
      // Skip questions and answers
      if (line.includes('?') || /^(Yes|No)$/i.test(line) || /^[a-e]\.\s+/i.test(line)) {
        continue;
      }
      
      // Skip new condition markers
      if (/^FOR\s+/i.test(line)) {
        inTestSection = false;
        continue;
      }
      
      const test = parseTestString(line);
      if (test.name) {
        currentTests.push(test);
      }
    }
    
    // Also capture radiographic confirmations even outside TEST sections
    if (currentCondition && !inTestSection) {
      if (upperLine.startsWith('RADIOGRAPHIC CONFIRMATION') || 
          upperLine.startsWith('RADIOGRAPHIC IMAGING') ||
          upperLine === 'MRI TEST' ||
          upperLine === 'MRI TEST.') {
        const nextLine = lines[i + 1]?.trim() || '';
        let procedure = line.includes(':') ? line.split(':')[1]?.trim() : '';
        if (!procedure && nextLine && !nextLine.includes('?') && !/^FOR\s+/i.test(nextLine) && nextLine.length > 5) {
          procedure = nextLine;
        }
        currentTests.push({
          name: 'Radiographic Confirmation',
          procedure: procedure || 'Imaging study to confirm diagnosis'
        });
      } else if ((upperLine.includes('MRI') || upperLine.includes('X-RAY') || upperLine.includes('ULTRASOUND')) && 
                 !line.includes('?') && currentCondition) {
        // Standalone imaging reference
        if (line.toLowerCase().includes('use ') || line.toLowerCase().includes('check ')) {
          currentTests.push({
            name: 'Imaging Study',
            procedure: line
          });
        }
      }
    }
  }
  
  // Save last condition's tests
  if (currentCondition && currentTests.length > 0) {
    conditionTests[currentCondition] = [...currentTests];
  }
  
  return conditionTests;
}

/**
 * Match condition name to tests (fuzzy matching)
 */
function findTestsForCondition(conditionName, allTests) {
  // Try exact match first
  if (allTests[conditionName]) {
    return allTests[conditionName];
  }
  
  // Try case-insensitive match
  const lowerName = conditionName.toLowerCase();
  for (const [key, tests] of Object.entries(allTests)) {
    if (key.toLowerCase() === lowerName) {
      return tests;
    }
  }
  
  // Try partial match
  for (const [key, tests] of Object.entries(allTests)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return tests;
    }
  }
  
  return [];
}

/**
 * Build comprehensive tests from existing fields and raw text
 */
function buildTestsArray(condition, allTests) {
  const tests = [];
  const seenNames = new Set();
  
  // First, get tests from raw text parsing
  const rawTests = findTestsForCondition(condition.name, allTests);
  for (const test of rawTests) {
    const normalizedName = test.name.toLowerCase().trim();
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName);
      tests.push(test);
    }
  }
  
  // Then add from recommended_tests
  if (condition.recommended_tests && condition.recommended_tests.length > 0) {
    for (const testStr of condition.recommended_tests) {
      const test = parseTestString(testStr);
      const normalizedName = test.name.toLowerCase().trim();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        tests.push(test);
      }
    }
  }
  
  // Add from observations (many observations are actually tests)
  if (condition.observations && condition.observations.length > 0) {
    for (const obs of condition.observations) {
      // Check if this observation is actually a test
      const upperObs = obs.toUpperCase();
      if (upperObs.includes('TEST') || upperObs.includes("'S ") || 
          obs.includes('The examiner') || obs.includes('Patient') ||
          obs.includes('positive if') || obs.includes('Positive if')) {
        const test = parseTestString(obs);
        const normalizedName = test.name.toLowerCase().trim();
        if (!seenNames.has(normalizedName) && test.name !== 'Clinical Observation') {
          seenNames.add(normalizedName);
          tests.push(test);
        }
      } else if (/^check (if|for)/i.test(obs)) {
        // These are clinical observations to include as tests
        const test = {
          name: 'Clinical Observation',
          procedure: obs
        };
        tests.push(test);
      }
    }
  }
  
  // Add from confirmation_methods
  if (condition.confirmation_methods && condition.confirmation_methods.length > 0) {
    for (const method of condition.confirmation_methods) {
      const test = parseTestString(method);
      if (!test.name.toLowerCase().includes('radiographic')) {
        test.name = 'Radiographic Confirmation';
      }
      const normalizedName = test.name.toLowerCase().trim();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        tests.push(test);
      }
    }
  }
  
  return tests;
}

/**
 * Process a single JSON file
 */
function processRuleFile(jsonPath) {
  console.log(`\nProcessing: ${path.basename(jsonPath)}`);
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  if (!data.conditions || data.conditions.length === 0) {
    console.log('  No conditions found, skipping...');
    return null;
  }
  
  // Parse all tests from raw text
  const allTests = parseAllTestsFromRawText(data.raw_text || '');
  console.log(`  Found test sections for ${Object.keys(allTests).length} conditions in raw text`);
  
  // Process each condition
  for (const condition of data.conditions) {
    const tests = buildTestsArray(condition, allTests);
    
    // If no tests found, create a placeholder
    if (tests.length === 0) {
      tests.push({
        name: 'Clinical Assessment',
        procedure: 'Physical examination and clinical assessment based on presenting symptoms'
      });
    }
    
    condition.tests = tests;
    
    // Remove old fields (now consolidated into tests)
    delete condition.recommended_tests;
    delete condition.confirmation_methods;
    delete condition.observations;
    
    console.log(`  ${condition.name}: ${tests.length} tests`);
  }
  
  // Remove raw_text from output (too large)
  delete data.raw_text;
  delete data.extraction_messages;
  
  // Update version
  data.version = '2.0.0';
  data.extracted_at = new Date().toISOString();
  
  // Write updated file
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`  Updated: ${path.basename(jsonPath)}`);
  
  return data;
}

/**
 * Main transformation process
 */
async function transformAllRules() {
  console.log('='.repeat(60));
  console.log('CLINICAL TEST TRANSFORMATION');
  console.log('='.repeat(60));
  console.log(`Rules directory: ${RULES_DIR}`);
  
  // Find all JSON files
  const files = fs.readdirSync(RULES_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json') && 
    !f.includes('index') && 
    !f.includes('clinical-tests'));
  
  console.log(`Found ${jsonFiles.length} rule files\n`);
  
  const results = [];
  
  for (const jsonFile of jsonFiles) {
    const fullPath = path.join(RULES_DIR, jsonFile);
    const result = processRuleFile(fullPath);
    if (result) {
      results.push({
        file: jsonFile,
        conditions: result.conditions.length,
        totalTests: result.conditions.reduce((sum, c) => sum + (c.tests?.length || 0), 0)
      });
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TRANSFORMATION COMPLETE');
  console.log('='.repeat(60));
  
  for (const r of results) {
    console.log(`${r.file}: ${r.conditions} conditions, ${r.totalTests} total tests`);
  }
}

// Run if executed directly
if (require.main === module) {
  transformAllRules().catch(console.error);
}

module.exports = { transformAllRules, processRuleFile };
