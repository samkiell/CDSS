"""
build_hip.py — Generates public/rules/Hip Region.json

Source: docs/Hip region.docx (extracted).
6 diagnoses + General Assessment (shared questions).

Condition names (distinct, non-substring — avoids engine fuzzy-match collisions):
  OA   = "Hip Osteoarthritis"
  GTPS = "Greater Trochanteric Pain Syndrome"
  FAI  = "Femoroacetabular Impingement"
  LAB  = "Hip Labral Tear"
  AVN  = "Avascular Necrosis"
  SNAP = "Snapping Hip Syndrome"

Scoring idiom: list a condition twice in `increase` for a +30 (STRONG) signal.
"""

import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from region_gen import region, condition, question, opt, write_region

OA   = "Hip Osteoarthritis"
GTPS = "Greater Trochanteric Pain Syndrome"
FAI  = "Femoroacetabular Impingement"
LAB  = "Hip Labral Tear"
AVN  = "Avascular Necrosis"
SNAP = "Snapping Hip Syndrome"
GEN  = "General Assessment"

ALL_HIP = [OA, GTPS, FAI, LAB, AVN, SNAP]

# ----------------------------------------------------------------------------
# GENERAL ASSESSMENT (shared questions, asked once)
# ----------------------------------------------------------------------------
general_qs = [
    question("hip_q1", "What is your age range?", GEN, "demographic", [
        opt("Under 30", increase=[FAI, SNAP]),
        opt("30 to 44", increase=[GTPS, FAI]),
        opt("45 to 60", increase=[OA, GTPS]),
        opt("Over 60", increase=[OA]),
        opt("20 to 50", increase=[LAB, AVN]),
    ]),
    question("hip_q2", "Where is the pain located?", GEN, "location", [
        opt("Groin or anterior hip", increase=[OA, FAI, LAB, AVN]),
        opt("Lateral (side) of the hip", increase=[GTPS, SNAP], excluded=[]),
        opt("Buttock", increase=[],
            notes="Consider lumbar spine / SIJ referral — assess separately."),
        opt("Anterior hip with snapping", increase=[SNAP]),
        opt("Deep groin", increase=[LAB, AVN]),
    ]),
    question("hip_q3", "Do you have a recent history of fall or trauma to the hip?", GEN, "onset", [
        opt("Yes", red_flag=True,
            red_flag_text="Recent trauma — rule out hip fracture before proceeding."),
        opt("No"),
    ]),
    question("hip_q4", "How did the pain begin?", GEN, "onset", [
        opt("Gradual and insidious", increase=[OA, FAI, AVN, GTPS]),
        opt("Sudden", increase=[LAB]),
        opt("Sudden with a twisting injury", increase=[LAB, LAB]),
    ]),
    question("hip_q5", "How would you describe the pain?", GEN, "painType", [
        opt("Dull and aching", increase=[OA, AVN]),
        opt("Sharp or deep", increase=[FAI, LAB]),
        opt("Aching and localized to the side", increase=[GTPS]),
        opt("Painless snapping", increase=[SNAP]),
        opt("Painful snapping", increase=[SNAP]),
    ]),
    question("hip_q6", "What most aggravates the pain?", GEN, "aggravation", [
        opt("Walking, weight-bearing, or stairs", increase=[OA]),
        opt("Lying on the affected side", increase=[GTPS, GTPS]),
        opt("Sitting for long periods or deep flexion/squatting", increase=[FAI, FAI]),
        opt("Pivoting or twisting", increase=[LAB, LAB]),
        opt("Repetitive hip flexion/extension (running, dancing)", increase=[SNAP]),
        opt("Pain is present even at rest", increase=[AVN, AVN], red_flag=True,
            red_flag_text="Pain at rest — possible avascular necrosis or serious pathology."),
    ]),
    question("hip_q7", "Is the pain relieved by rest?", GEN, "relief", [
        opt("Yes", increase=[OA]),
        opt("No", increase=[AVN, AVN], red_flag=True,
            red_flag_text="Pain NOT relieved by rest — strongly suggests AVN; urgent imaging advised."),
    ]),
    question("hip_q8", "Does the pain radiate below the knee?", GEN, "radiation", [
        # NOTE: down-weight (not hard-exclude) is applied by docs/branching_hip.json —
        # a patient can have BOTH lumbar radiculopathy and a coexisting hip pathology
        # (e.g. AVN), so we must not hide the hip red-flag questions. Keep only the note here.
        opt("Yes",
            notes="Radiation below the knee suggests lumbar spine origin — also assess the lumbar spine."),
        opt("No"),
    ]),
    question("hip_q9", "Do you have night pain that is NOT relieved by rest?", GEN, "redFlag", [
        opt("Yes", increase=[AVN], red_flag=True,
            red_flag_text="Night pain unrelieved by rest — rule out malignancy, infection, or AVN."),
        opt("No"),
    ]),
    question("hip_q10",
             "Do you have any history of steroid use, heavy alcohol use, or sickle cell disease?",
             GEN, "riskFactor", [
        opt("Yes", increase=[AVN, AVN], red_flag=True,
            red_flag_text="AVN risk factors present (steroids/alcohol/sickle cell) — urgent MRI advised."),
        opt("No"),
    ]),
    question("hip_q12",
             "Do you experience clicking, locking, or catching in the hip?",
             GEN, "mechanical", [
        opt("Yes", increase=[LAB, OA, FAI]),
        opt("No"),
    ]),
    # --- RED-FLAG SCREENING (from the DOCX "Red Flag" section, lines 75-94) ---
    # Non-diagnostic safety screens answered by everyone. Each "Yes" raises a red flag.
    question("hip_q13", "Are you unable to bear weight on the affected leg?", GEN, "redFlag", [
        opt("Yes", red_flag=True,
            red_flag_text="Inability to bear weight — possible fracture or serious pathology; urgent assessment."),
        opt("No"),
    ]),
    question("hip_q14", "Have you had any unexplained weight loss recently?", GEN, "redFlag", [
        opt("Yes", red_flag=True,
            red_flag_text="Unexplained weight loss — possible malignancy; urgent medical referral."),
        opt("No"),
    ]),
    question("hip_q15", "Do you have a fever or feel systemically unwell?", GEN, "redFlag", [
        opt("Yes", red_flag=True,
            red_flag_text="Fever / systemic illness — possible infection; urgent medical referral."),
        opt("No"),
    ]),
    question("hip_q16", "Do you have a history of cancer?", GEN, "redFlag", [
        opt("Yes", red_flag=True,
            red_flag_text="History of cancer — metastasis risk; urgent medical referral."),
        opt("No"),
    ]),
    question("hip_q17", "Is the pain rapidly worsening without a clear cause?", GEN, "redFlag", [
        opt("Yes", red_flag=True,
            red_flag_text="Rapidly worsening pain without clear cause — red flag; urgent assessment."),
        opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# HIP OSTEOARTHRITIS
# ----------------------------------------------------------------------------
oa_qs = [
    question("hip_oa_q1", "How long does morning stiffness last?", OA, "stiffness", [
        opt("Less than 60 minutes", increase=[OA]),
        opt("More than 60 minutes", decrease=[OA],
            notes="Prolonged morning stiffness suggests inflammatory arthritis — refer."),
        opt("No morning stiffness"),
    ]),
    question("hip_oa_q2", "Do you have stiffness after periods of inactivity (e.g., sitting)?",
             OA, "stiffness", [
        opt("Yes", increase=[OA]), opt("No"),
    ]),
    question("hip_oa_q3", "Do you have difficulty with daily activities such as putting on shoes or socks?",
             OA, "function", [
        opt("Yes", increase=[OA]), opt("No"),
    ]),
    question("hip_oa_q4", "Is your walking tolerance reduced?", OA, "function", [
        opt("Yes", increase=[OA]), opt("No"),
    ]),
    question("hip_oa_q5", "Do you feel crepitus or a grinding sensation in the hip?", OA, "mechanical", [
        opt("Yes", increase=[OA]), opt("No"),
    ]),
    question("hip_oa_q6", "Do you have any previous history of hip injury or surgery?", OA, "history", [
        opt("Yes", increase=[OA], notes="May predispose to secondary OA."),
        opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# GREATER TROCHANTERIC PAIN SYNDROME
# ----------------------------------------------------------------------------
gtps_qs = [
    question("hip_gtps_q1", "Do you have pain when climbing stairs?", GTPS, "aggravation", [
        opt("Yes", increase=[GTPS]), opt("No"),
    ]),
    question("hip_gtps_q2", "Is there tenderness when you press on the side of your hip?",
             GTPS, "palpation", [
        opt("Yes", increase=[GTPS, GTPS]), opt("No", decrease=[GTPS]),
    ]),
    question("hip_gtps_q3", "Is your sleep affected because of pain when lying on the side?",
             GTPS, "sleep", [
        opt("Yes", increase=[GTPS]), opt("No"),
    ]),
    question("hip_gtps_q4", "Any previous hip or lower limb injury?", GTPS, "history", [
        opt("Yes", notes="Predisposing factor."), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# FEMOROACETABULAR IMPINGEMENT
# ----------------------------------------------------------------------------
fai_qs = [
    question("hip_fai_q1", "Does sitting for long periods aggravate the pain?", FAI, "aggravation", [
        opt("Yes", increase=[FAI]), opt("No"),
    ]),
    question("hip_fai_q2", "Does squatting or deep hip flexion aggravate the pain?", FAI, "aggravation", [
        opt("Yes", increase=[FAI, FAI]), opt("No"),
    ]),
    question("hip_fai_q3", "Do you feel clicking or catching in the hip?", FAI, "mechanical", [
        opt("Yes", increase=[FAI, LAB], notes="Possible labral involvement."),
        opt("No"),
    ]),
    question("hip_fai_q4", "Are you involved in sports or repetitive hip movements?", FAI, "history", [
        opt("Yes", increase=[FAI]), opt("No"),
    ]),
    question("hip_fai_q5", "Do you feel stiffness in the hip?", FAI, "stiffness", [
        opt("Yes", increase=[FAI]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# HIP LABRAL TEAR
# ----------------------------------------------------------------------------
lab_qs = [
    question("hip_lab_q1", "Do you experience clicking, locking, or catching in the hip?",
             LAB, "mechanical", [
        opt("Yes", increase=[LAB, LAB]), opt("No"),
    ]),
    question("hip_lab_q2", "Does pivoting or twisting aggravate the pain?", LAB, "aggravation", [
        opt("Yes", increase=[LAB]), opt("No"),
    ]),
    question("hip_lab_q3", "Do you feel instability or giving way in the hip?", LAB, "stability", [
        opt("Yes", increase=[LAB]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# AVASCULAR NECROSIS
# ----------------------------------------------------------------------------
avn_qs = [
    question("hip_avn_q1", "Do you experience pain at rest?", AVN, "restPain", [
        opt("Yes", increase=[AVN, AVN], red_flag=True,
            red_flag_text="Rest pain — strong AVN indicator; urgent imaging advised."),
        opt("No"),
    ]),
    question("hip_avn_q2", "How have your symptoms progressed?", AVN, "progression", [
        opt("Rapid worsening over weeks to months", increase=[AVN, AVN]),
        opt("Slow progression over years", increase=[OA],
            notes="Slow progression favours OA over AVN."),
    ]),
    question("hip_avn_q3", "Is your walking tolerance reduced?", AVN, "function", [
        opt("Yes", increase=[AVN]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# SNAPPING HIP SYNDROME
# Gating question MUST be the first question in this condition block: answering
# "No" rules out Snapping Hip Syndrome and skips its remaining questions.
# (The engine derives a question's condition from its block, not the `condition`
#  field — so the gate must physically live here.)
# ----------------------------------------------------------------------------
snap_qs = [
    question("hip_snap_q0",
             "Do you have a snapping sensation in the hip?",
             SNAP, "mechanical", [
        opt("Yes", increase=[SNAP, SNAP]),
        opt("No"),
    ], is_gating=True),
    question("hip_snap_q1", "Where is the snapping located?", SNAP, "location", [
        opt("Anterior hip (front)", increase=[SNAP],
            notes="Iliopsoas — internal snapping subtype."),
        opt("Lateral hip (side)", increase=[SNAP],
            notes="Iliotibial band — external snapping subtype."),
        opt("Deep groin with clicking", increase=[LAB], decrease=[SNAP],
            notes="Deep clicking suggests labral tear rather than isolated snapping hip."),
    ]),
    question("hip_snap_q2", "Is the snapping painful or painless?", SNAP, "painType", [
        opt("Painful", increase=[SNAP], notes="Pathological — requires attention."),
        opt("Painless", notes="Benign form."),
    ]),
    question("hip_snap_q3", "Is the snapping triggered by repetitive hip flexion and extension?",
             SNAP, "aggravation", [
        opt("Yes", increase=[SNAP]), opt("No"),
    ]),
]

conditions = [
    condition(GEN, general_qs, is_general=True),
    condition(OA, oa_qs,
              tests=["faber_test", "fadir_test", "hip_scour_test", "hip_log_roll_test", "trendelenburg_test"]),
    condition(GTPS, gtps_qs,
              tests=["single_leg_stance_hip", "resisted_ext_derotation", "obers_test_hip", "trendelenburg_test"]),
    condition(FAI, fai_qs,
              tests=["fadir_test", "faber_test", "hip_scour_test", "int_rotation_overpressure"]),
    condition(LAB, lab_qs,
              tests=["fadir_test", "hip_scour_test", "hip_log_roll_test", "thomas_test_hip"]),
    condition(AVN, avn_qs,
              tests=["hip_log_roll_test", "fadir_test", "faber_test"],
              clinical_note="AVN is imaging-dependent: MRI is definitive for early disease. "
                            "Use red flags (rest pain, risk factors) to prioritize urgent imaging."),
    condition(SNAP, snap_qs,
              tests=["dynamic_hip_movement", "obers_test_hip", "thomas_test_hip"]),
]

hip = region("hip", "Hip Region", "Hip region.docx", conditions)

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "..", "public", "rules", "Hip Region.json")
    out = os.path.normpath(out)
    c, q = write_region(hip, out)
    print(f"Wrote {out}: {c} conditions, {q} questions")
    # Re-apply the verified answer-driven branching map (rule-out / down-weight rules
    # derived from the DOCX clinical notes) so a rebuild stays reproducible.
    bmap = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                         "..", "docs", "branching_hip.json"))
    if os.path.exists(bmap):
        from apply_branching import apply
        apply("Hip", bmap)
