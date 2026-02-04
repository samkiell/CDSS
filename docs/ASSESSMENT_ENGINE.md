# Assessment Engine Implementation

## Overview

This document describes the implementation of the branching assessment engine for the CDSS (Clinical Decision Support System). The engine provides a dynamic, rule-driven question flow for musculoskeletal diagnosis.

## Architecture

### 1. Rule Ingestion (`scripts/ingest-rules.js`)

**Purpose:** Convert DOCX medical rule files into structured JSON.

**Features:**
- Extracts conditions from "For X" headers
- Parses questions (lines ending with ?)
- Identifies Yes/No answer options
- Extracts effects (Rule out X, Confirm X) from parenthetical content
- Captures recommended tests and observation notes
- Preserves raw text for verification

**Usage:**
```bash
npm run ingest-rules
```

**Output:** JSON files in `public/rules/` alongside source DOCX files, plus an `index.json` catalog.

### 2. Assessment Engine (`src/lib/assessment-engine.js`)

**Purpose:** Core logic for the branching question flow.

**Key Functions:**
- `initializeEngine(rulesJson)` - Initialize state with loaded rules
- `getCurrentQuestion(state)` - Get the next question to display
- `processAnswer(state, questionId, answerValue)` - Process an answer and update condition likelihoods
- `completeAssessment(state)` - Generate final summary with ranked conditions
- `prepareForAiAnalysis(state, biodata)` - Prepare payload for AI temporal diagnosis

**State Schema:**
```javascript
{
  region: string,               // Selected body region
  currentConditionIndex: number,
  currentQuestionIndex: number,
  askedQuestions: [],           // Full Q&A log with timestamps
  conditionStates: {            // Condition likelihood tracking
    [name]: {
      active: boolean,
      likelihood: number,       // 0-100 score
      ruleOutReasons: [],       // Evidence for investigation
      confirmationReasons: [],  // Evidence supporting condition
    }
  },
  redFlags: [],                 // Detected clinical concerns
  isComplete: boolean,
  completionReason: string,
}
```

### 3. Question Engine Component (`src/app/...assessment/components/QuestionEngine.js`)

**Purpose:** React component for rendering the branching question flow.

**Behavior:**
1. Loads region-specific JSON rules on mount
2. Displays one question at a time with answer options
3. Shows condition being investigated (when applicable)
4. Tracks progress through total questions
5. Displays red flag warnings when detected
6. Moves to summary when all questions answered

### 4. Assessment Summary Component (`src/app/...assessment/components/AssessmentSummary.js`)

**Purpose:** Review screen before AI analysis submission.

**Features:**
- Shows biodata summary
- Displays all answered questions
- Highlights detected red flags
- Allows editing answers before submission
- Submits for AI temporal diagnosis

### 5. Updated DiagnosisSession Model (`src/models/DiagnosisSession.js`)

**New Schemas:**
- `BiodataSnapshotSchema` - Patient info at time of assessment
- `SymptomDataSchema` - Full Q&A with effects tracking
- `ConditionAnalysisSchema` - Ranked condition likelihoods
- `RedFlagSchema` - Clinical concerns
- `AssessmentTraceSchema` - Complete audit trail

**New Fields:**
- `assessmentTrace` - Full traceability record
- `submittedToTherapistAt` - Handoff timestamp
- `status: 'submitted_to_therapist'` - New status for handoff

### 6. Updated Submission API (`src/app/api/assessment/submit/route.js`)

**Changes:**
- Accepts branching engine payload format
- Stores full assessment trace
- Sets status to `submitted_to_therapist`
- Records submission timestamp
- Includes fallback analysis if AI fails

## Flow Summary

```
Patient Journey:
1. Biodata Confirmation (MANDATORY)
   └─> Patient confirms/edits biodata for this assessment
   
2. Body Region Selection
   └─> Select affected area (ankle, lumbar, etc.)
   
3. Branching Questions
   └─> QuestionEngine loads region JSON rules
   └─> Questions presented one at a time
   └─> Answers update condition likelihood
   └─> Red flags detected and recorded
   
4. Review Summary
   └─> AssessmentSummary shows all answers
   └─> Patient can edit before submission
   
5. AI Analysis
   └─> Submission API triggers AI temporal diagnosis
   └─> Assessment trace stored for therapist
   
6. Complete/Handoff
   └─> Status set to 'submitted_to_therapist'
   └−> Patient answers locked from editing
   └−> Visible in therapist dashboard
```

## Data Traceability

Every assessment stores:
- Biodata snapshot (patient info at time of assessment)
- Selected region
- Full question/answer log with timestamps
- Effects triggered (rule-out, confirmations)
- Condition likelihood analysis
- Red flags detected
- AI temporal diagnosis output
- Submission timestamp

## Generated Rule Files

| Region | Conditions | Questions |
|--------|------------|-----------|
| Ankle | 17 | 85 |
| Cervical | 2 | 29 |
| Elbow | 5 | 25 |
| Lumbar | 6 | 49 |
| Shoulder | 9 | 51 |

## TODOs

1. **Parser Refinement:** Some questions may have empty answer arrays if the DOCX format varies. Manual review recommended.

2. **Red Flag Detection:** The parser should be updated to explicitly mark red flag questions in the DOCX files.

3. **Therapist Dashboard:** Implementation of therapist-side review logic is pending.

4. **General Features:** The `General Features.docx` file has a different structure and currently extracts 0 conditions.
