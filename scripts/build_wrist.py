"""
build_wrist.py — Generates public/rules/Wrist Region.json

Source: docs/Wrist Region.docx (extracted).
8 diagnoses + General Assessment (shared questions).

Condition names (distinct, non-substring):
  CTS   = "Carpal Tunnel Syndrome"
  DEQ   = "De Quervain's Tenosynovitis"
  SPR   = "Wrist Sprain"
  TFCC  = "TFCC Injury"
  GANG  = "Ganglion Cyst"
  INT   = "Intersection Syndrome"
  SCAPH = "Scaphoid Fracture"
  KIEN  = "Kienbock's Disease"

Decisions applied:
- Scaphoid Fracture => red flags but NO terminateAssessment (flag + continue).
- Ganglion Cyst defining feature (visible lump) => gating question, first in its block.
- Gating questions MUST be first in their own condition block (engine derives a
  question's condition from its block, not the `condition` field).
- STRONG signal (+30) = list the condition name twice in `increase`.
"""

import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from region_gen import region, condition, question, opt, write_region

CTS   = "Carpal Tunnel Syndrome"
DEQ   = "De Quervain's Tenosynovitis"
SPR   = "Wrist Sprain"
TFCC  = "TFCC Injury"
GANG  = "Ganglion Cyst"
INT   = "Intersection Syndrome"
SCAPH = "Scaphoid Fracture"
KIEN  = "Kienbock's Disease"
GEN   = "General Assessment"

# ----------------------------------------------------------------------------
# GENERAL ASSESSMENT
# ----------------------------------------------------------------------------
general_qs = [
    question("wrist_q1", "What is your age range?", GEN, "demographic", [
        opt("15 to 40", increase=[GANG, SCAPH]),
        opt("20 to 40", increase=[KIEN]),
        opt("20 to 50", increase=[TFCC, INT]),
        opt("30 to 50", increase=[DEQ]),
        opt("30 to 60", increase=[CTS]),
        opt("Over 60"),
    ]),
    question("wrist_q2", "Where is the pain located?", GEN, "location", [
        opt("Palmar (front) wrist / hand", increase=[CTS]),
        opt("Radial wrist (thumb side)", increase=[DEQ, SCAPH]),
        opt("Ulnar wrist (little-finger side)", increase=[TFCC]),
        opt("Dorsal central wrist", increase=[KIEN, GANG]),
        opt("Dorsal radial forearm, 4-6 cm above the wrist", increase=[INT, INT]),
        opt("Anatomical snuffbox (base of thumb)", increase=[SCAPH, SCAPH]),
    ]),
    question("wrist_q3",
             "Is there a recent history of trauma or a fall on an outstretched hand (FOOSH)?",
             GEN, "onset", [
        opt("Yes", increase=[SCAPH, SPR], red_flag=True,
            red_flag_text="FOOSH mechanism — rule out scaphoid fracture; imaging advised."),
        opt("No", decrease=[SPR]),
    ]),
    question("wrist_q4", "How did the symptoms begin?", GEN, "onset", [
        opt("Gradually (overuse)", increase=[CTS, DEQ, INT, KIEN]),
        opt("Suddenly after an injury", increase=[SPR, SCAPH]),
    ]),
    question("wrist_q5", "What does the pain feel like?", GEN, "painType", [
        opt("Tingling, numbness, or burning", increase=[CTS, CTS]),
        opt("Sharp, localized pain", increase=[SPR, SCAPH]),
        opt("Deep, aching pain", increase=[KIEN]),
        opt("Mild ache or painless", increase=[GANG]),
    ]),
    question("wrist_q6", "Do you experience pain at rest or at night?", GEN, "restPain", [
        opt("Yes", increase=[KIEN, CTS], red_flag=True,
            red_flag_text="Rest/night pain — consider Kienbock's disease (AVN of lunate) or advanced CTS."),
        opt("No"),
    ]),
    question("wrist_q7", "Does the pain radiate above the wrist into the forearm or arm?",
             GEN, "radiation", [
        opt("Yes", decrease=[CTS],
            notes="Proximal radiation / whole-arm symptoms — consider cervical or proximal nerve origin."),
        opt("No", increase=[CTS]),
    ]),
]

# ----------------------------------------------------------------------------
# CARPAL TUNNEL SYNDROME
# ----------------------------------------------------------------------------
cts_qs = [
    question("wrist_cts_q1",
             "Where are the symptoms felt?", CTS, "distribution", [
        opt("Thumb, index, middle, and radial half of ring finger", increase=[CTS, CTS]),
        opt("Whole hand", decrease=[CTS],
            notes="Whole-hand symptoms suggest proximal nerve or systemic cause."),
    ]),
    question("wrist_cts_q2", "Do your symptoms wake you from sleep at night?", CTS, "temporal", [
        opt("Yes", increase=[CTS, CTS]), opt("No"),
    ]),
    question("wrist_cts_q3",
             "Do you shake or flick your hand to relieve the symptoms (flick sign)?",
             CTS, "temporal", [
        opt("Yes", increase=[CTS, CTS]), opt("No"),
    ]),
    question("wrist_cts_q4", "Do repetitive wrist activities (typing, gripping) aggravate it?",
             CTS, "aggravation", [
        opt("Yes", increase=[CTS]), opt("No"),
    ]),
    question("wrist_cts_q5", "Do you have weakness in your grip or thumb?", CTS, "motor", [
        opt("Yes", increase=[CTS], red_flag=True,
            red_flag_text="Thenar weakness indicates advanced CTS — consider expedited referral."),
        opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# DE QUERVAIN'S TENOSYNOVITIS
# ----------------------------------------------------------------------------
deq_qs = [
    question("wrist_deq_q1", "Does thumb movement or gripping aggravate the pain?",
             DEQ, "aggravation", [
        opt("Yes", increase=[DEQ, DEQ]), opt("No"),
    ]),
    question("wrist_deq_q2", "Is there pain when lifting objects (e.g., a child or kettle)?",
             DEQ, "aggravation", [
        opt("Yes", increase=[DEQ]), opt("No"),
    ]),
    question("wrist_deq_q3", "Is there swelling near the base of the thumb?", DEQ, "observation", [
        opt("Yes", increase=[DEQ]), opt("No"),
    ]),
    question("wrist_deq_q4", "Do you feel a creaking sensation?", DEQ, "mechanical", [
        opt("Yes", increase=[DEQ]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# WRIST SPRAIN
# ----------------------------------------------------------------------------
spr_qs = [
    question("wrist_spr_q1", "What was the mechanism of injury?", SPR, "onset", [
        opt("Fall on an outstretched hand (FOOSH)", increase=[SPR, SCAPH]),
        opt("No trauma", decrease=[SPR],
            notes="No trauma makes a sprain unlikely; consider other conditions."),
    ]),
    question("wrist_spr_q2", "Is swelling present?", SPR, "observation", [
        opt("Yes", increase=[SPR]), opt("No"),
    ]),
    question("wrist_spr_q3", "Is the pain aggravated by movement?", SPR, "aggravation", [
        opt("Yes", increase=[SPR]), opt("No"),
    ]),
    question("wrist_spr_q4", "Is there severe pain with visible deformity, or are you unable to move the wrist?",
             SPR, "redFlag", [
        opt("Yes", red_flag=True,
            red_flag_text="Severe pain with deformity / inability to move — rule out fracture or dislocation."),
        opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# TFCC INJURY
# ----------------------------------------------------------------------------
tfcc_qs = [
    question("wrist_tfcc_q1", "Does ulnar deviation or rotation of the wrist aggravate the pain?",
             TFCC, "aggravation", [
        opt("Yes", increase=[TFCC, TFCC]), opt("No"),
    ]),
    question("wrist_tfcc_q2", "Do you have pain when clicking or catching the wrist?",
             TFCC, "mechanical", [
        opt("Yes", increase=[TFCC]), opt("No"),
    ]),
    question("wrist_tfcc_q3", "Is your grip strength weak?", TFCC, "motor", [
        opt("Yes", increase=[TFCC]), opt("No"),
    ]),
    question("wrist_tfcc_q4", "Is there severe wrist instability?", TFCC, "redFlag", [
        opt("Yes", red_flag=True,
            red_flag_text="Severe instability — possible serious ligament injury; refer."),
        opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# GANGLION CYST  (defining feature = visible/palpable lump => gating, first in block)
# ----------------------------------------------------------------------------
gang_qs = [
    question("wrist_gang_q0", "Do you notice a visible or palpable lump/swelling on the wrist?",
             GANG, "observation", [
        opt("Yes", increase=[GANG, GANG]),
        opt("No"),
    ], is_gating=True),
    question("wrist_gang_q1", "Does the size of the lump change over time?", GANG, "mechanical", [
        opt("Yes", increase=[GANG, GANG]), opt("No"),
    ]),
    question("wrist_gang_q2", "Is the lump hard and immobile, or growing rapidly?", GANG, "redFlag", [
        opt("Yes", red_flag=True, decrease=[GANG],
            red_flag_text="Hard/immobile or rapidly-growing mass — refer to exclude tumour."),
        opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# INTERSECTION SYNDROME
# ----------------------------------------------------------------------------
int_qs = [
    question("wrist_int_q1", "Does repetitive wrist extension (rowing, lifting) aggravate the pain?",
             INT, "aggravation", [
        opt("Yes", increase=[INT, INT]), opt("No"),
    ]),
    question("wrist_int_q2", "Do you feel creaking or squeaking with movement?", INT, "mechanical", [
        opt("Yes", increase=[INT, INT]), opt("No"),
    ]),
    question("wrist_int_q3", "Is there swelling over the dorsal radial forearm?", INT, "observation", [
        opt("Yes", increase=[INT]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# SCAPHOID FRACTURE  (critical red flag, but flag+continue — NO terminate)
# ----------------------------------------------------------------------------
scaph_qs = [
    question("wrist_scaph_q1", "Did the pain begin immediately after a fall?", SCAPH, "onset", [
        opt("Yes", increase=[SCAPH, SCAPH]), opt("No", decrease=[SCAPH]),
    ]),
    question("wrist_scaph_q2",
             "Do you still have persistent pain after a fall even if an X-ray was reported normal?",
             SCAPH, "redFlag", [
        opt("Yes", increase=[SCAPH, SCAPH], red_flag=True,
            red_flag_text="CRITICAL: Persistent snuffbox pain after FOOSH must be treated as a "
                          "scaphoid fracture despite a normal initial X-ray. Repeat imaging (MRI/CT) required."),
        opt("No"),
    ]),
    question("wrist_scaph_q3", "Was your presentation delayed (you ignored the injury initially)?",
             SCAPH, "history", [
        opt("Yes", red_flag=True,
            red_flag_text="Delayed scaphoid presentation — risk of non-union / AVN; urgent imaging."),
        opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# KIENBOCK'S DISEASE
# ----------------------------------------------------------------------------
kien_qs = [
    question("wrist_kien_q1", "Does wrist loading or activity aggravate the pain?", KIEN, "aggravation", [
        opt("Yes", increase=[KIEN]), opt("No"),
    ]),
    question("wrist_kien_q2", "Do you have progressive stiffness in the wrist?", KIEN, "stiffness", [
        opt("Yes", increase=[KIEN, KIEN], red_flag=True,
            red_flag_text="Progressive stiffness with pain — consistent with Kienbock's (AVN) progression."),
        opt("No"),
    ]),
    question("wrist_kien_q3",
             "Is there a history of repetitive trauma or heavy loading of the wrist?",
             KIEN, "history", [
        opt("Yes", increase=[KIEN]), opt("No"),
    ]),
]

conditions = [
    condition(GEN, general_qs, is_general=True),
    condition(CTS, cts_qs,
              tests=["phalens_test", "tinels_sign_wrist", "carpal_compression_test"]),
    condition(DEQ, deq_qs,
              tests=["finkelsteins_test", "what_test"]),
    condition(SPR, spr_qs,
              tests=["ligament_stress_wrist"]),
    condition(TFCC, tfcc_qs,
              tests=["tfcc_load_test", "press_test_wrist"]),
    condition(GANG, gang_qs,
              tests=["transillumination_wrist"]),
    condition(INT, int_qs,
              tests=["resisted_wrist_extension"]),
    condition(SCAPH, scaph_qs,
              tests=["snuffbox_tenderness", "scaphoid_compression"],
              clinical_note="Scaphoid fracture is the highest-risk wrist red flag. Persistent "
                            "snuffbox tenderness after FOOSH must be treated as a fracture and "
                            "imaged (MRI/CT) even if the initial X-ray is normal, due to non-union/AVN risk."),
    condition(KIEN, kien_qs,
              tests=["axial_load_wrist"],
              clinical_note="No single definitive clinical test exists for Kienbock's disease. "
                            "Diagnosis is imaging-dependent: X-ray for staging, MRI for early AVN detection."),
]

wrist = region("wrist", "Wrist Region", "Wrist Region.docx", conditions)

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "..", "public", "rules", "Wrist Region.json")
    out = os.path.normpath(out)
    c, q = write_region(wrist, out)
    print(f"Wrote {out}: {c} conditions, {q} questions")
    # Re-apply the verified answer-driven branching map (rule-out / down-weight rules
    # derived from the DOCX clinical notes) so a rebuild stays reproducible.
    bmap = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                         "..", "docs", "branching_wrist.json"))
    if os.path.exists(bmap):
        from apply_branching import apply
        apply("Wrist", bmap)
