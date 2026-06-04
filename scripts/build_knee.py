"""
build_knee.py — Generates public/rules/Knee Region.json

Source: docs/Knee Region.docx (extracted). Largest region.
General Assessment + 16 diagnosis conditions (4 ligaments modelled SEPARATELY,
following the ankle-ligament precedent in the existing codebase).

Condition names (distinct, non-substring; ligament names align with the existing
knee-pain-assessment graph's diagnosisMapping values "ACL Injury" / "MCL Injury"):
  PFPS = "Patellofemoral Pain Syndrome"
  MEN  = "Meniscus Tear"
  STR  = "Muscle Strain"
  ACL  = "ACL Injury"
  MCL  = "MCL Injury"
  LCL  = "LCL Injury"
  PCL  = "PCL Injury"
  KOA  = "Knee Osteoarthritis"
  PDX  = "Patellar Dislocation"
  FX   = "Knee Fracture"
  ITBS = "Iliotibial Band Syndrome"
  TEN  = "Patellar Tendinopathy"
  PAB  = "Pes Anserine Bursitis"
  OCD  = "Osteochondritis Dissecans"
  BAK  = "Baker's Cyst"
  SEP  = "Septic Arthritis"

Decisions applied:
- Septic Arthritis is a MEDICAL EMERGENCY: a gate question (fever + joint warmth +
  inability to bear weight) sets terminateAssessment=True AND a red flag. This is the
  ONLY hard-stop in the three regions.
- Gating questions live first in their own condition block.
- STRONG signal (+30) = condition listed twice in `increase`.
"""

import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from region_gen import region, condition, question, opt, write_region

PFPS = "Patellofemoral Pain Syndrome"
MEN  = "Meniscus Tear"
STR  = "Muscle Strain"
ACL  = "ACL Injury"
MCL  = "MCL Injury"
LCL  = "LCL Injury"
PCL  = "PCL Injury"
KOA  = "Knee Osteoarthritis"
PDX  = "Patellar Dislocation"
FX   = "Knee Fracture"
ITBS = "Iliotibial Band Syndrome"
TEN  = "Patellar Tendinopathy"
PAB  = "Pes Anserine Bursitis"
OCD  = "Osteochondritis Dissecans"
BAK  = "Baker's Cyst"
SEP  = "Septic Arthritis"
GEN  = "General Assessment"

# ----------------------------------------------------------------------------
# GENERAL ASSESSMENT
# ----------------------------------------------------------------------------
general_qs = [
    # EMERGENCY GATE FIRST — but emergency rule-out belongs to SEP block.
    # Here in general we capture broad triage; the hard-stop gate lives in SEP block.
    question("knee_q1", "What is your age range?", GEN, "demographic", [
        opt("10 to 20", increase=[OCD, PDX]),
        opt("15 to 40", increase=[PFPS, ITBS, TEN]),
        opt("15 to 50", increase=[MEN, STR, ACL, MCL, LCL, PCL]),
        opt("35 to 70", increase=[BAK]),
        opt("40 to 70", increase=[PAB]),
        opt("Over 50", increase=[KOA, SEP]),
    ]),
    question("knee_q2", "Where is the pain located?", GEN, "location", [
        opt("Anterior knee (front / kneecap)", increase=[PFPS, PDX, TEN]),
        opt("Medial joint line (inner)", increase=[MEN, MCL, KOA]),
        opt("Medial knee, 5-7 cm below the joint line", increase=[PAB, PAB]),
        opt("Lateral knee (outer)", increase=[LCL, ITBS]),
        opt("Posterior knee (back)", increase=[BAK, BAK]),
        opt("Deep, poorly localized", increase=[OCD]),
        opt("Diffuse / whole joint", increase=[KOA, SEP]),
    ]),
    question("knee_q3", "Do you have a recent history of fall, trauma, road accident, or high-impact injury?",
             GEN, "onset", [
        opt("Yes", increase=[FX, ACL, MCL, LCL, PCL, MEN], red_flag=True,
            red_flag_text="Significant trauma — rule out fracture and ligament/meniscus injury."),
        opt("No", decrease=[FX]),
    ]),
    question("knee_q4", "How did the pain begin?", GEN, "onset", [
        opt("Sudden during trauma/injury", increase=[ACL, MCL, LCL, PCL, FX, PDX]),
        opt("Sudden during activity (no impact)", increase=[STR, MEN]),
        opt("Gradual and insidious", increase=[PFPS, KOA, ITBS, TEN, OCD, PAB]),
    ]),
    question("knee_q5", "Do you feel instability or giving way of the knee?", GEN, "stability", [
        opt("Yes", increase=[ACL, PCL, LCL, PDX]),
        opt("No"),
    ]),
    question("knee_q6", "Do you experience locking or catching of the knee?", GEN, "mechanical", [
        opt("Yes", increase=[MEN, OCD]),
        opt("No"),
    ]),
    question("knee_q7", "Is there swelling, and how quickly did it appear?", GEN, "swelling", [
        opt("Immediate and extensive (within 2 hours)", increase=[ACL, FX, PDX]),
        opt("Within 24 hours", increase=[MEN]),
        opt("Gradual / mild", increase=[KOA, PAB, BAK]),
        opt("No swelling"),
    ]),
    question("knee_q8", "What most aggravates the pain?", GEN, "aggravation", [
        opt("Running, squatting, stairs, prolonged sitting", increase=[PFPS]),
        opt("Twisting, kneeling, pivoting", increase=[MEN]),
        opt("Running, especially downhill or long distance", increase=[ITBS, ITBS]),
        opt("Jumping or loading the knee", increase=[TEN]),
        opt("Walking and prolonged standing", increase=[KOA]),
        opt("Stair climbing and sit-to-stand", increase=[PAB]),
    ]),
    question("knee_q9", "Does the pain radiate down the leg?", GEN, "radiation", [
        opt("Yes", notes="Consider nerve involvement / lumbar referral."),
        opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# SEPTIC ARTHRITIS — EMERGENCY (gate first; hard-stop on full triad)
# ----------------------------------------------------------------------------
sep_qs = [
    question("knee_sep_q0",
             "Do you have fever WITH a hot, swollen knee AND inability to bear weight?",
             SEP, "redFlag", [
        opt("Yes", increase=[SEP, SEP], red_flag=True, terminate=True,
            red_flag_text="MEDICAL EMERGENCY: features suggest septic arthritis. "
                          "Seek immediate emergency care — joint aspiration is required."),
        opt("No"),
    ], is_gating=True),
    question("knee_sep_q1", "Is there a history of recent infection (skin, urinary, respiratory)?",
             SEP, "history", [
        opt("Yes", increase=[SEP]), opt("No"),
    ]),
    question("knee_sep_q2", "Any recent joint surgery, injection, or prosthesis?", SEP, "history", [
        opt("Yes", increase=[SEP]), opt("No"),
    ]),
    question("knee_sep_q3", "Any diabetes, HIV, or immunosuppression?", SEP, "history", [
        opt("Yes", increase=[SEP]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# PATELLOFEMORAL PAIN SYNDROME
# ----------------------------------------------------------------------------
pfps_qs = [
    question("knee_pfps_q1", "Is the pain worse when descending stairs than ascending?",
             PFPS, "aggravation", [
        opt("Yes", increase=[PFPS, PFPS]), opt("No"),
    ]),
    question("knee_pfps_q2",
             "Do you get pain when sitting for long periods with the knee bent (cinema sign)?",
             PFPS, "aggravation", [
        opt("Yes", increase=[PFPS, PFPS]), opt("No"),
    ]),
    question("knee_pfps_q3", "Is the pain poorly localized / hard to point to with one finger?",
             PFPS, "location", [
        opt("Yes", increase=[PFPS]),
        opt("No - it is localized to the inferior pole of the kneecap",
            increase=[TEN], decrease=[PFPS],
            notes="Localized inferior-pole pain suggests patellar tendinopathy."),
    ]),
    question("knee_pfps_q4", "Did symptoms begin after increased activity, overuse, or training?",
             PFPS, "history", [
        opt("Yes", increase=[PFPS]), opt("No"),
    ]),
    question("knee_pfps_q5", "Do you feel your kneecap moves out of place or dislocates?",
             PFPS, "mechanical", [
        opt("Yes", increase=[PDX], decrease=[PFPS],
            notes="Consider patellar instability/dislocation."),
        opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# MENISCUS TEAR
# ----------------------------------------------------------------------------
men_qs = [
    question("knee_men_q1", "Was there a twisting injury to the knee?", MEN, "onset", [
        opt("Yes", increase=[MEN, MEN]), opt("No"),
    ]),
    question("knee_men_q2", "Do you hear popping, clicking, or snapping during activity?",
             MEN, "mechanical", [
        opt("Yes", increase=[MEN]), opt("No"),
    ]),
    question("knee_men_q3", "How long have you had the pain?", MEN, "temporal", [
        opt("Acute (less than 6 weeks)", increase=[MEN]),
        opt("Chronic (more than 6 weeks)"),
    ]),
]

# ----------------------------------------------------------------------------
# MUSCLE STRAIN
# ----------------------------------------------------------------------------
str_qs = [
    question("knee_str_q1", "Is the pain aggravated by stretching or contracting the muscle?",
             STR, "aggravation", [
        opt("Yes", increase=[STR, STR]), opt("No"),
    ]),
    question("knee_str_q2", "Is there tenderness, swelling, or bruising over the muscle?",
             STR, "observation", [
        opt("Yes", increase=[STR]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# LIGAMENTS — ACL / MCL / LCL / PCL (separate conditions)
# Shared mechanism question lives in general (knee_q4). Each block adds specifics.
# ----------------------------------------------------------------------------
acl_qs = [
    question("knee_acl_q1", "Was the mechanism a non-contact cutting, pivoting, or deceleration move?",
             ACL, "mechanism", [
        opt("Yes", increase=[ACL, ACL]), opt("No"),
    ]),
    question("knee_acl_q2", "Did you hear or feel an audible pop at the time of injury?",
             ACL, "onset", [
        opt("Yes", increase=[ACL, ACL]), opt("No"),
    ]),
]
mcl_qs = [
    question("knee_mcl_q1", "Was there a direct blow to the OUTSIDE of the knee (pushing it inward)?",
             MCL, "mechanism", [
        opt("Yes", increase=[MCL, MCL]), opt("No"),
    ]),
    question("knee_mcl_q2", "Is the pain and tenderness on the INNER (medial) side of the knee?",
             MCL, "location", [
        opt("Yes", increase=[MCL]), opt("No"),
    ]),
]
lcl_qs = [
    question("knee_lcl_q1", "Was there a direct blow to the INSIDE of the knee (pushing it outward)?",
             LCL, "mechanism", [
        opt("Yes", increase=[LCL, LCL]), opt("No"),
    ]),
    question("knee_lcl_q2", "Is the pain and tenderness on the OUTER (lateral) side of the knee?",
             LCL, "location", [
        opt("Yes", increase=[LCL]), opt("No"),
    ]),
]
pcl_qs = [
    question("knee_pcl_q1",
             "Was the injury a blow to the front of the bent knee, or a hyperextension?",
             PCL, "mechanism", [
        opt("Yes", increase=[PCL, PCL]), opt("No"),
    ]),
    question("knee_pcl_q2", "Is pain worse with flexion while weight-bearing (e.g., going down stairs)?",
             PCL, "aggravation", [
        opt("Yes", increase=[PCL]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# KNEE OSTEOARTHRITIS
# ----------------------------------------------------------------------------
koa_qs = [
    question("knee_koa_q1", "Do you have morning stiffness lasting less than 30 minutes?",
             KOA, "stiffness", [
        opt("Yes", increase=[KOA]), opt("No"),
    ]),
    question("knee_koa_q2", "Do you hear or feel crepitus (grinding) during movement?",
             KOA, "mechanical", [
        opt("Yes", increase=[KOA]), opt("No"),
    ]),
    question("knee_koa_q3", "Is there swelling or bony enlargement of the knee?", KOA, "observation", [
        opt("Yes", increase=[KOA]), opt("No"),
    ]),
    question("knee_koa_q4", "Do you have night pain?", KOA, "redFlag", [
        opt("Yes", notes="Rule out inflammatory arthritis."), opt("No"),
    ]),
    question("knee_koa_q5", "Any previous knee injury or surgery?", KOA, "history", [
        opt("Yes", increase=[KOA], notes="Risk for secondary OA."), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# PATELLAR DISLOCATION / SUBLUXATION
# ----------------------------------------------------------------------------
pdx_qs = [
    question("knee_pdx_q1", "Did you feel the kneecap move out of place?", PDX, "mechanical", [
        opt("Yes", increase=[PDX, PDX]), opt("No"),
    ]),
    question("knee_pdx_q2", "Did it go back in (reduce) on its own?", PDX, "mechanical", [
        opt("Yes", increase=[PDX], notes="Common in subluxation."), opt("No"),
    ]),
    question("knee_pdx_q3", "Have you had repeated episodes of the kneecap dislocating?",
             PDX, "history", [
        opt("Yes", increase=[PDX]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# KNEE FRACTURE (Tibial Plateau / Patella)
# ----------------------------------------------------------------------------
fx_qs = [
    question("knee_fx_q1", "Are you unable to bear weight on the leg since the injury?",
             FX, "redFlag", [
        opt("Yes", increase=[FX, FX], red_flag=True,
            red_flag_text="Inability to bear weight after trauma — strong fracture indicator; urgent X-ray."),
        opt("No"),
    ]),
    question("knee_fx_q2", "Are you unable to perform a straight leg raise (lift the leg straight)?",
             FX, "function", [
        opt("Yes", increase=[FX, FX], red_flag=True,
            red_flag_text="Inability to straight-leg-raise — strong indicator of patella fracture / extensor disruption."),
        opt("No"),
    ]),
    question("knee_fx_q3", "Was there a direct blow to the front of the knee?", FX, "mechanism", [
        opt("Yes", increase=[FX], notes="Suggests patella fracture."), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# ILIOTIBIAL BAND SYNDROME
# ----------------------------------------------------------------------------
itbs_qs = [
    question("knee_itbs_q1", "Does your activity involve repetitive knee bending (running, cycling)?",
             ITBS, "history", [
        opt("Yes", increase=[ITBS, ITBS]), opt("No"),
    ]),
    question("knee_itbs_q2", "Is the pain worse running downhill or descending stairs?",
             ITBS, "aggravation", [
        opt("Yes", increase=[ITBS]), opt("No"),
    ]),
    question("knee_itbs_q3", "Is the pain absent at rest but appears during activity?",
             ITBS, "pattern", [
        opt("Yes", increase=[ITBS]), opt("No"),
    ]),
    question("knee_itbs_q4", "Was there a recent increase in training intensity or distance?",
             ITBS, "history", [
        opt("Yes", increase=[ITBS]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# PATELLAR / QUADRICEPS TENDINOPATHY
# ----------------------------------------------------------------------------
ten_qs = [
    question("knee_ten_q1", "Does your activity involve jumping, sprinting, or frequent knee loading?",
             TEN, "history", [
        opt("Yes", increase=[TEN, TEN]), opt("No"),
    ]),
    question("knee_ten_q2", "Does the pain increase with higher load (deeper squat, higher jump)?",
             TEN, "aggravation", [
        opt("Yes", increase=[TEN, TEN]), opt("No"),
    ]),
    question("knee_ten_q3", "Is there NO pain at rest (pain only with loading)?", TEN, "pattern", [
        opt("Yes", increase=[TEN]),
        opt("No - I do have pain at rest", notes="Pain at rest suggests severe or other pathology."),
    ]),
    question("knee_ten_q4", "Does the pain improve after a warm-up?", TEN, "pattern", [
        opt("Yes", increase=[TEN]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# PES ANSERINE BURSITIS
# ----------------------------------------------------------------------------
pab_qs = [
    question("knee_pab_q1", "Do you have a history of knee osteoarthritis?", PAB, "history", [
        opt("Yes", increase=[PAB]), opt("No"),
    ]),
    question("knee_pab_q2", "Do you have a history of obesity?", PAB, "history", [
        opt("Yes", increase=[PAB]), opt("No"),
    ]),
    question("knee_pab_q3", "Is the pain reproduced by stair climbing or rising from a chair?",
             PAB, "aggravation", [
        opt("Yes", increase=[PAB]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# OSTEOCHONDRITIS DISSECANS
# ----------------------------------------------------------------------------
ocd_qs = [
    question("knee_ocd_q1", "Is there a history of repetitive sports activity (running, jumping, football)?",
             OCD, "history", [
        opt("Yes", increase=[OCD, OCD]), opt("No"),
    ]),
    question("knee_ocd_q2", "Have the symptoms persisted for months or years?", OCD, "temporal", [
        opt("Yes", increase=[OCD]), opt("No"),
    ]),
    question("knee_ocd_q3", "Do you have a catching sensation or the knee giving way?",
             OCD, "mechanical", [
        opt("Yes", increase=[OCD]), opt("No"),
    ]),
]

# ----------------------------------------------------------------------------
# BAKER'S CYST  (defining feature = posterior swelling => gating)
# ----------------------------------------------------------------------------
bak_qs = [
    question("knee_bak_q0", "Do you notice swelling or a lump behind the knee?", BAK, "observation", [
        opt("Yes", increase=[BAK, BAK]),
        opt("No"),
    ], is_gating=True),
    question("knee_bak_q1", "Do you feel tightness behind the knee?", BAK, "symptom", [
        opt("Yes", increase=[BAK]), opt("No"),
    ]),
    question("knee_bak_q2", "Do you have calf swelling or calf pain without injury?", BAK, "redFlag", [
        opt("Yes", red_flag=True,
            red_flag_text="Calf swelling/pain — possible ruptured Baker's cyst vs DVT; assess urgently."),
        opt("No"),
    ]),
    question("knee_bak_q3", "Do you have a history of knee OA or meniscus injury?", BAK, "history", [
        opt("Yes", increase=[BAK], notes="Baker's cyst is usually secondary to intra-articular pathology."),
        opt("No"),
    ]),
]

conditions = [
    condition(GEN, general_qs, is_general=True),
    condition(SEP, sep_qs,
              tests=["passive_joint_motion_knee", "knee_temp_assessment"],
              clinical_note="MEDICAL EMERGENCY. Diagnosis is clinical + laboratory; joint aspiration "
                            "is the gold standard. AVOID aggressive manual testing."),
    condition(PFPS, pfps_qs,
              tests=["clarkes_test", "step_down_test", "patellar_tilt_test", "waldron_test", "patellar_glide_test"]),
    condition(MEN, men_qs,
              tests=["mcmurray_test", "apley_compression", "thessaly_test", "joint_line_tenderness", "bounce_home_test"]),
    condition(STR, str_qs,
              tests=["resisted_contraction_test", "passive_stretch_test"]),
    condition(ACL, acl_qs, tests=["lachman_test", "anterior_drawer_knee"]),
    condition(MCL, mcl_qs, tests=["valgus_stress_test_knee"]),
    condition(LCL, lcl_qs, tests=["varus_stress_test_knee"]),
    condition(PCL, pcl_qs, tests=["posterior_drawer_test", "godfrey_test"]),
    condition(KOA, koa_qs,
              tests=["patellofemoral_compression", "crepitus_test", "knee_rom_assessment", "joint_line_tenderness"]),
    condition(PDX, pdx_qs,
              tests=["patellar_apprehension", "patella_tracking_assess", "patella_hypermobility", "q_angle_measurement"],
              clinical_note="Imaging: lateral + axial X-rays; MRI if MPFL tear suspected."),
    condition(FX, fx_qs,
              tests=["knee_slr_test", "patellar_integrity_palpation", "active_knee_extension", "axial_loading_test"],
              clinical_note="Imaging REQUIRED: X-ray AP/Lateral/Skyline; CT for tibial plateau detail; MRI for soft tissue."),
    condition(ITBS, itbs_qs,
              tests=["noble_compression", "knee_obers_test", "renne_test"]),
    condition(TEN, ten_qs,
              tests=["decline_squat_test", "resisted_knee_extension", "single_leg_decline_squat", "hop_test_knee"]),
    condition(PAB, pab_qs,
              tests=["pes_anserine_palpation", "resisted_knee_flexion", "resisted_hip_adduction"]),
    condition(OCD, ocd_qs,
              tests=["wilsons_test", "condylar_palpation", "joint_effusion_stroke_test"],
              clinical_note="Imaging REQUIRED: X-ray (AP/lateral/tunnel view); MRI for staging."),
    condition(BAK, bak_qs,
              tests=["foucher_sign", "popliteal_palpation", "knee_effusion_test"],
              clinical_note="Usually secondary to OA or meniscus pathology — treat the underlying cause."),
]

knee = region("knee", "Knee Region", "Knee Region.docx", conditions)

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "..", "public", "rules", "Knee Region.json")
    out = os.path.normpath(out)
    c, q = write_region(knee, out)
    print(f"Wrote {out}: {c} conditions, {q} questions")
    # Re-apply the verified answer-driven branching map (rule-out / down-weight rules
    # derived from the DOCX clinical notes) so a rebuild stays reproducible.
    bmap = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                         "..", "docs", "branching_knee.json"))
    if os.path.exists(bmap):
        from apply_branching import apply
        apply("Knee", bmap)
