/**
 * validate_region.mjs
 * Validates a generated region JSON against the REAL engine + test wiring.
 *
 * Usage: node scripts/validate_region.mjs "Hip" hip-pain-screener
 *
 * Checks:
 *  1. initializeEngine() succeeds; question order non-empty.
 *  2. Every condition name referenced in effects (excluded/triggered/increase/decrease)
 *     resolves to a REAL condition EXACTLY (no reliance on fuzzy partial matching).
 *  3. No condition name is a substring of another (fuzzy-match collision risk).
 *  4. nextQuestionId / skipToQuestionId targets exist.
 *  5. Walk the default path answering first option each step — must terminate, no crash.
 *  6. Flow-graph: every node.id (non-terminal) exists in test-library; every edge target exists;
 *     every terminal diagnosisMapping matches a real condition name.
 *  7. Condition.tests[] ids all exist in test-library.
 */
import {
  initializeEngine,
  getCurrentQuestion,
  processAnswer,
} from '../src/lib/branching-assessment-engine.js';
import { readFileSync } from 'fs';

const [, , regionName, screenerKey] = process.argv;
if (!regionName) {
  console.error('Usage: node scripts/validate_region.mjs "<RegionName>" [screenerKey]');
  process.exit(1);
}

const ROOT = new URL('..', import.meta.url);
const rules = JSON.parse(
  readFileSync(new URL(`public/rules/${regionName} Region.json`, ROOT), 'utf-8')
);
const library = JSON.parse(
  readFileSync(new URL('src/lib/decision-engine/test-library.json', ROOT), 'utf-8')
);
const graphs = JSON.parse(
  readFileSync(new URL('src/lib/decision-engine/test-flow-graphs.json', ROOT), 'utf-8')
);

const errors = [];
const warnings = [];
const ok = (m) => console.log(`  ✓ ${m}`);

// --- 1. init ---
const state = initializeEngine(rules);
const condNames = rules.conditions.map((c) => c.name);
const condSet = new Set(condNames);
if (!state.questionOrder.length) errors.push('No questions in order');
else ok(`init: ${condNames.length} conditions, ${state.questionOrder.length} questions`);

// --- 2. effect references resolve exactly ---
const qIds = new Set(state.questionOrder);
let refChecks = 0;
for (const cond of rules.conditions) {
  for (const q of cond.questions || []) {
    for (const o of q.options || []) {
      const e = o.effects || {};
      for (const field of [
        'excludedConditions',
        'triggeredConditions',
        'increaseLikelihood',
        'decreaseLikelihood',
      ]) {
        for (const ref of e[field] || []) {
          refChecks++;
          if (!condSet.has(ref)) {
            errors.push(
              `${q.id} option "${o.value}" ${field} -> "${ref}" is NOT an exact condition name`
            );
          }
          // Host-condition self-EXCLUSION guard: a question must not HARD rule out
          // the condition block it lives in (the engine derives a question's
          // condition from its block, so excluding it hides the host's remaining
          // questions). Self-decreaseLikelihood is allowed — it's a legitimate
          // within-condition refinement ("this answer makes my own dx less likely").
          if (field === 'excludedConditions' && ref === cond.name && !cond.is_general) {
            errors.push(
              `${q.id} (in "${cond.name}") excludedConditions -> "${ref}" HARD-excludes its OWN host condition`
            );
          }
        }
      }
      // 4. jump targets exist
      for (const jf of ['nextQuestionId', 'skipToQuestionId']) {
        if (e[jf] && !qIds.has(e[jf])) {
          errors.push(`${q.id} option "${o.value}" ${jf} -> "${e[jf]}" does not exist`);
        }
      }
      // options/answers parity
    }
    // options vs answers identical
    const optJSON = JSON.stringify(q.options);
    const ansJSON = JSON.stringify(q.answers);
    if (optJSON !== ansJSON) {
      errors.push(`${q.id}: options[] and answers[] differ`);
    }
  }
}
if (!errors.length) ok(`effect references: ${refChecks} checked, all resolve exactly`);

// --- 3. substring collisions ---
for (const a of condNames) {
  for (const b of condNames) {
    if (a !== b && b.toLowerCase().includes(a.toLowerCase())) {
      warnings.push(`condition "${a}" is a substring of "${b}" — fuzzy match could collide`);
    }
  }
}

// --- 5. walk default path (answer first option each step) ---
let s = initializeEngine(rules);
let steps = 0;
let q = getCurrentQuestion(s);
while (q && steps < 500) {
  const val = q.answers?.[0]?.value || 'Skipped';
  s = processAnswer(s, q.id, val);
  q = getCurrentQuestion(s);
  steps++;
}
if (steps >= 500) errors.push('Default-path walk did not terminate (possible loop)');
else ok(`default-path walk terminated in ${steps} steps (${s.completionReason})`);

// --- 6. flow graph ---
if (screenerKey) {
  const g = graphs[screenerKey];
  if (!g) {
    errors.push(`flow-graph "${screenerKey}" not found`);
  } else {
    const libIds = new Set(library.map((t) => t.id));
    const nodeIds = new Set(Object.keys(g.nodes));
    if (!nodeIds.has(g.startNode)) errors.push(`startNode "${g.startNode}" missing`);
    for (const [id, node] of Object.entries(g.nodes)) {
      if (node.isTerminal) {
        if (!condSet.has(node.diagnosisMapping)) {
          errors.push(
            `terminal "${id}" diagnosisMapping "${node.diagnosisMapping}" != any condition name`
          );
        }
      } else {
        if (!libIds.has(node.id)) {
          warnings.push(`graph node "${node.id}" not in test-library (UI will show fallback name)`);
        }
        for (const edge of ['onPositive', 'onNegative']) {
          if (!nodeIds.has(node[edge])) {
            errors.push(`node "${id}" ${edge} -> "${node[edge]}" missing`);
          }
        }
      }
    }
    if (!errors.length) ok(`flow-graph "${screenerKey}": nodes + edges + diagnosisMappings valid`);
  }
}

// --- 7. condition.tests ids exist ---
const libIds = new Set(library.map((t) => t.id));
for (const cond of rules.conditions) {
  for (const tid of cond.tests || []) {
    if (!libIds.has(tid)) errors.push(`condition "${cond.name}" tests -> "${tid}" not in test-library`);
  }
}
if (!errors.length) ok('condition.tests ids all exist in test-library');

// --- report ---
console.log('');
if (warnings.length) {
  console.log('WARNINGS:');
  warnings.forEach((w) => console.log(`  ! ${w}`));
}
if (errors.length) {
  console.log('ERRORS:');
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log(`\nFAILED: ${errors.length} error(s)`);
  process.exit(1);
} else {
  console.log(`PASSED${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
}
