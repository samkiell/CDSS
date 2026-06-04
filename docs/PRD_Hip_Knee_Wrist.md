# Product Requirements Document — Hip, Knee & Wrist Regions
### CDSS Musculoskeletal Diagnosis Expansion

**Status:** Implemented & shipped to `main` (as-built documentation)
**Source of clinical content:** `docs/Hip region.docx`, `docs/Knee Region.docx`, `docs/Wrist Region.docx`
**Engine:** V2 branching assessment engine (`src/lib/branching-assessment-engine.js`)
**Author:** Implementation by Claude (Opus 4.8); clinical content derived verbatim from the source DOCX files — no diagnostic content invented.

---

## Provenance note (read first)

Every diagnosis, patient question, observation, physical test, imaging requirement, and red flag in this document is sourced from the three DOCX files. The engineering team's contributions are limited to: (a) consolidating questions repeated across diagnoses into shared blocks, (b) rephrasing clinician-facing wording into patient-friendly language without changing meaning, and (c) encoding the DOCX's qualitative emphasis ("Classic", "Strong", "CRITICAL", "Rule out") into the engine's numeric/branching fields. All such encoding judgments are recorded in `docs/branching_{hip,knee,wrist}.json` for clinical review.

---

# 1. Executive Summary

This PRD covers the addition of three musculoskeletal regions — **Hip**, **Knee**, and **Wrist** — to the existing CDSS, which previously supported Cervical, Lumbar, Ankle, Shoulder, and Elbow.

- **Hip** — 6 diagnoses. First region with a dedicated avascular-necrosis (AVN) red-flag pathway driven by rest-pain and steroid/alcohol/sickle-cell history.
- **Knee** — 16 diagnoses (largest region). Includes 4 separately-modelled ligament injuries (ACL/MCL/LCL/PCL) and a **Septic Arthritis medical-emergency hard-stop**.
- **Wrist** — 8 diagnoses. Includes the **Scaphoid Fracture critical red flag** (imaging mandatory even on a normal X-ray).

No database schema migration was required — the `DiagnosticModule` region enum already included Hip/Knee/Wrist, and diagnosis/test fields are free strings. The work is data-driven (region rules JSON + test library + flow graphs) plus minimal frontend wiring.

---

# 2. Diagnostic Conditions

## Hip (6)
| # | Diagnosis | Key differentiator |
|---|-----------|--------------------|
| 1 | Hip Osteoarthritis | Age >45, groin/anterior pain, morning stiffness <60 min |
| 2 | Greater Trochanteric Pain Syndrome (GTPS) | Lateral hip, pain lying on affected side, trochanteric tenderness |
| 3 | Femoroacetabular Impingement (FAI) | Age 15–40, groin pain with sitting/deep flexion |
| 4 | Hip Labral Tear | Deep groin, clicking/catching, twisting mechanism |
| 5 | Avascular Necrosis (AVN) | Pain NOT relieved by rest, rest/night pain, steroid/alcohol/sickle-cell |
| 6 | Snapping Hip Syndrome | Snapping sensation (defining feature — gated) |

## Knee (16)
PFPS · Meniscus Tear · Muscle Strain · ACL Injury · MCL Injury · LCL Injury · PCL Injury · Knee Osteoarthritis · Patellar Dislocation · Knee Fracture · Iliotibial Band Syndrome · Patellar Tendinopathy · Pes Anserine Bursitis · Osteochondritis Dissecans · Baker's Cyst · **Septic Arthritis (emergency)**

## Wrist (8)
Carpal Tunnel Syndrome · De Quervain's Tenosynovitis · Wrist Sprain · TFCC Injury · Ganglion Cyst · Intersection Syndrome · **Scaphoid Fracture (critical red flag)** · Kienböck's Disease

---

# 3. Shared Questions (General Assessment block)

Each region opens with a `General Assessment` block (`is_general: true`) — questions answered once by every patient, whose answers branch into the diagnosis-specific blocks.

- **Hip General Assessment (16 q):** age range; pain location; trauma history; onset; pain quality; aggravating factor; relieved by rest; radiation below knee; night pain; steroid/alcohol/sickle-cell history; clicking/locking/catching; **+ 5 red-flag screens** (inability to bear weight, weight loss, fever, cancer history, rapidly-worsening pain).
- **Knee General Assessment (10 q):** age; pain location; trauma; onset; instability; locking/catching; swelling timing; aggravating factor; radiation; **+ deformity/inability-to-move red flag**.
- **Wrist General Assessment (7 q):** age; pain location; trauma/FOOSH; onset; pain quality; rest/night pain; proximal radiation.

> Gating/defining-feature questions (Snapping Hip's snapping sensation, Ganglion's visible lump, Septic Arthritis's emergency triad) live as the **first question of their own condition block** — a "No" rules out that condition and skips its remaining questions.

---

# 4. Diagnosis-Specific Question Trees

The full per-diagnosis question flow, with entry/branching/exit logic, is encoded in the region rules JSON files and was previously detailed in the planning document. Representative structure:

**Entry** → General Assessment answers raise/lower each condition's likelihood and rule out impossible ones → **condition-specific questions** appear for conditions still in play → **gating** questions can exclude a condition entirely → **exit** when all relevant questions answered or an emergency terminates the assessment.

Examples (verified against the engine):
- **AVN path:** rest-pain + risk factors → AVN reaches 100% likelihood, 4 red flags raised.
- **Snapping Hip gate:** "No snapping" → condition ruled out, its 3 sub-questions skipped.
- **Septic Arthritis:** fever + hot swollen knee + inability to bear weight → `terminateAssessment`, emergency screen shown.
- **Scaphoid:** FOOSH + snuffbox tenderness → 100% likelihood + red flags, assessment continues (flag-not-stop).
- **Wrist ulnar pain:** rules out De Quervain's / Intersection / CTS (radial/palmar), keeps TFCC.

Authoritative source: `public/rules/{Hip,Knee,Wrist} Region.json`.

---

# 5. Rules Engine Specification

The engine applies effects per answer option. Scoring constants (existing engine): `INITIAL_LIKELIHOOD=50`, `LIKELIHOOD_INCREMENT/DECREMENT=15`, `HIGH_CONFIDENCE=85`, `LOW_CONFIDENCE=20`. A **strong/critical** DOCX signal is encoded as the condition listed twice (`+30`).

Representative rules (all derived from DOCX clinical notes):
```
IF hip pain_relieved_by_rest == "No"        THEN AVN += 30, redFlag       # DOCX "CRITICAL"
IF hip risk_factors (steroid/alcohol/sickle) THEN AVN += 30, redFlag       # DOCX "VERY STRONG"
IF hip snapping_sensation == "No"            THEN ruleOut Snapping Hip      # gating
IF knee fever AND hot_swollen AND no_weightbear THEN terminate, redFlag     # septic emergency
IF wrist pain_location == "Ulnar"            THEN ruleOut DeQuervain's, Intersection, CTS
IF wrist FOOSH AND snuffbox_tenderness        THEN Scaphoid += 30, redFlag (no terminate)
IF hip pain_location == "Lateral"            THEN GTPS up, intra-articular dx down-weighted
```
Full rule maps: `docs/branching_{hip,knee,wrist}.json`.

---

# 6. Database Design

**No schema migration required.**
- `DiagnosticModule.region` enum already contains `Hip`, `Knee`, `Wrist`.
- `DiagnosisSession.bodyRegion`, `finalDiagnosis`, `confirmedDiagnosis`, `testName`, `testId` are free strings — no enum constraints.

**New data files (not DB tables):**
- `public/rules/{Hip,Knee,Wrist} Region.json` — region rules
- `public/rules/index.json` — manifest (updated)
- `src/lib/decision-engine/test-library.json` — appended ~70 new tests
- `src/lib/decision-engine/test-flow-graphs.json` — 3 new screener graphs

Suggested diagnosis identifiers follow the pattern `hip_osteoarthritis`, `knee_acl_injury`, `wrist_scaphoid_fracture`, etc.

---

# 7. Frontend Requirements

| Screen | Change |
|--------|--------|
| Body-map picker (`BodyMapPicker.js`) | Added Hip/Knee/Wrist cards to `BODY_REGIONS`; null-safe `startQuestionId` lookup |
| Question engine (`QuestionEngine.js`) | Added a dedicated **emergency screen** when an answer sets `terminateAssessment` (used by Septic Arthritis) |
| Assessment summary | No structural change — red flags surface via existing `redFlags[]` |
| Clinician case view / guided test | No structural change — driven by the new flow graphs |

`MEDICAL_RULES` gained V2 stubs for the 3 regions (title + startQuestionId) for legacy-consumer compatibility.

---

# 8. Observation Module Requirements

Clinician observations are recorded in `clinicianReview.physicalTestResults[]`. Each region's observations are derived from the DOCX "Objective / Observation" sections — e.g. Hip: reduced internal rotation, antalgic gait, Trendelenburg sign, trochanteric tenderness; Knee: joint-line tenderness, effusion, bony enlargement, joint warmth/redness (septic), visible deformity; Wrist: thenar wasting, snuffbox tenderness, lunate tenderness, transillumination.

---

# 9. Physical Test Module Requirements

~70 physical tests added to `test-library.json`, each with `{id, name, type, purpose, instructions[], image}`. Positive criteria and result data type (boolean ± grade/degrees/time) are captured per test. Counts: **Hip 11, Knee ~46, Wrist 13** (Knee reuses pre-existing `valgus_stress_test_knee` / `drawer_test_knee`).

Examples: FABER, FADIR, Scour, Log Roll, Trendelenburg, Single-Leg Stance (Hip); McMurray, Lachman, Valgus/Varus stress (graded I/II/III), Wilson's, Foucher's (Knee); Phalen's, Tinel's, Finkelstein's, snuffbox tenderness, TFCC load (Wrist). All sourced from the DOCX "Special Confirmatory Tests" sections.

---

# 10. Imaging Module Requirements

Imaging requirements surface via red-flag text and clinician recommendations:
- **Hip AVN** — MRI (definitive, early); X-ray (late).
- **Knee Fracture** — X-ray AP/Lateral/Skyline; CT (tibial plateau); MRI (soft tissue). **OCD** — X-ray + MRI. **Septic Arthritis** — joint aspiration (gold standard) + X-ray/MRI.
- **Wrist Scaphoid** — X-ray first-line; MRI/CT mandatory if X-ray normal but snuffbox tender. **Kienböck's** — X-ray (staging) + MRI (early AVN).

---

# 11. Scoring & Diagnostic Logic

0–100 likelihood per condition, 50 baseline. Signals encoded from DOCX emphasis:
| DOCX emphasis | Encoding |
|---|---|
| "Classic" / "Typical" | +15 |
| "Strong" / "Highly specific" / "CRITICAL" / "VERY STRONG" | +30 (listed twice) |
| "Defining feature / required" | gating question |
| "Rule out X" (impossible) | `excludedConditions` |
| "Suggests / less likely" | `decreaseLikelihood` (−15) |
| Red flag / emergency | `redFlag` ± `terminateAssessment` |

---

# 12. API Requirements

**No new endpoints.** Existing routes handle all three regions generically:
- `POST /api/assessment/submit` — intake (bodyRegion = hip/knee/wrist)
- `GET|POST /api/diagnosis/[id]/guided-test` — guided test flow (slug map extended for the 3 regions)
- `PATCH /api/diagnosis/[id]` — clinician review

---

# 13. Development Breakdown (as completed)

| Area | Work |
|------|------|
| **Data** | 3 region JSONs; test-library (+70 tests); 3 flow-graph screeners; index manifest |
| **Backend** | Guided-test slug map extended (hip/knee/wrist screeners) |
| **Frontend** | BODY_REGIONS + MEDICAL_RULES stubs; emergency UI in QuestionEngine |
| **Tooling** | `region_gen.py` generator; `build_{hip,knee,wrist}.py`; `apply_branching.py`; `validate_region.mjs`; `rebuild_index.py` |
| **Validation** | Engine-level validator (refs resolve, paths terminate, graph integrity, host-self-exclusion guard); clinical-path tests per region |

---

# 14. Risks, Ambiguities & Open Items for the Clinical Team

1. **Wording sign-off** — patient-facing rephrasing and red-flag text are faithful to the DOCX but are engineering phrasing. Needs a clinician read-through.
2. **Numeric encoding** — the +15/+30 mapping of "strong/classic" is an engineering choice, not a DOCX value. Confirm thresholds are clinically acceptable.
3. **Branching aggressiveness** — Hip/Knee branching is mostly soft down-weights (conservative; questionnaires stay ~31–41 questions). If shorter assessments are desired, specific location-based hard rule-outs can be added (see `docs/branching_*.json`).
4. **Ligament modelling** — ACL/MCL/LCL/PCL are 4 separate conditions (per the ankle-ligament precedent). Confirm this is preferred over a single grouped "Knee Ligament Injury".
5. **Septic Arthritis gate** — currently triggers `terminateAssessment` only on the full triad (fever + hot/swollen + inability to bear weight). Confirm whether a partial presentation should also escalate.
6. **Scaphoid imaging** — flagged for imaging but not hard-stopped; confirms clinician follow-up is the intended path.
7. **Validated against engine, not yet UI-walked** — every region passes the engine validator and clinical-path tests; an in-app click-through pending the live DB connection would close the loop.

---

## Verification status

All 3 regions: ✅ load in engine · ✅ effect references resolve exactly · ✅ paths terminate · ✅ flow-graph integrity · ✅ red-flag triggers fire · ✅ shipped to `main`. No DB migration. Working tree clean.
