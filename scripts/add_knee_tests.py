"""
add_knee_tests.py
Appends Knee clinical tests to test-library.json (idempotent; reuses existing
valgus_stress_test_knee and drawer_test_knee) and adds the knee-pain-screener
decision graph to test-flow-graphs.json (idempotent).
"""

import json, os

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
LIB = os.path.join(ROOT, "src", "lib", "decision-engine", "test-library.json")
GRAPHS = os.path.join(ROOT, "src", "lib", "decision-engine", "test-flow-graphs.json")


def t(id, name, purpose, instructions):
    return {"id": id, "name": name, "type": "Clinical Test",
            "purpose": purpose, "instructions": instructions, "image": None}


KNEE_TESTS = [
    # PFPS
    t("clarkes_test", "Clarke's Test (Patellar Grind)",
      "To detect patellofemoral joint dysfunction (PFPS).",
      ["Patient supine, knee extended. Apply gentle downward pressure on the superior pole of the patella.",
       "Ask the patient to contract the quadriceps.",
       "Positive: Anterior knee pain reproduced."]),
    t("step_down_test", "Step-Down Test",
      "To detect PFPS and poor lower-limb control.",
      ["Patient stands on a 20 cm step and slowly lowers the opposite heel to the ground.",
       "Observe knee alignment.",
       "Positive: Anterior knee pain or medial collapse (dynamic valgus)."]),
    t("patellar_tilt_test", "Patellar Tilt Test",
      "To detect tight lateral structures contributing to PFPS / OA.",
      ["Patient supine, knee extended. Lift the lateral edge of the patella.",
       "Positive: The lateral edge cannot reach the horizontal."]),
    t("waldron_test", "Waldron Test",
      "To detect patellofemoral joint irritation (PFPS).",
      ["Patient actively flexes and extends the knee while the examiner palpates the patellofemoral joint.",
       "Positive: Grinding, crepitus, or anterior knee pain."]),
    t("patellar_glide_test", "Patellar Glide Test",
      "To detect patellar maltracking (PFPS).",
      ["Patient supine, knee extended. Glide the patella medially and laterally.",
       "Positive: Pain or abnormal patellar mobility."]),
    # Meniscus
    t("mcmurray_test", "McMurray Test",
      "To detect a meniscal tear.",
      ["Patient supine. Fully flex the hip and knee, then rotate the tibia and extend the knee.",
       "Positive: Palpable click/snap or joint-line pain (internal rotation = lateral meniscus; external = medial)."]),
    t("apley_compression", "Apley's Compression Test",
      "To detect a meniscal injury.",
      ["Patient prone, knee flexed 90 degrees. Apply downward compression while rotating the tibia.",
       "Positive: Joint-line pain on compression."]),
    t("thessaly_test", "Thessaly Test",
      "To detect a meniscal tear (weight-bearing).",
      ["Patient stands on one leg, knee flexed ~20 degrees, and rotates the body/knee three times.",
       "Positive: Joint-line pain or a sense of locking/catching."]),
    t("joint_line_tenderness", "Joint Line Tenderness",
      "To detect meniscal or tibiofemoral pathology.",
      ["Palpate along the medial and lateral joint lines.",
       "Positive: Localized joint-line tenderness."]),
    t("bounce_home_test", "Bounce Home Test",
      "To detect a displaced meniscal fragment (e.g., bucket-handle tear).",
      ["Patient supine. Fully flex the knee, then allow it to passively extend.",
       "Positive: Knee does not fully extend (block) or has a springy end-feel."]),
    # Muscle strain
    t("resisted_contraction_test", "Resisted Contraction Test",
      "To detect a muscle strain.",
      ["Patient contracts the affected muscle against resistance at mid-range.",
       "Positive: Pain at the muscle site."]),
    t("passive_stretch_test", "Passive Stretch Test",
      "To detect a muscle strain.",
      ["Examiner slowly stretches the affected muscle.",
       "Positive: Pain at the muscle site."]),
    # Ligaments
    t("lachman_test", "Lachman Test",
      "To detect an ACL tear (most sensitive ACL test).",
      ["Knee flexed ~30 degrees. Stabilize the femur and pull the tibia anteriorly.",
       "Positive: Soft endpoint or increased anterior tibial translation."]),
    t("anterior_drawer_knee", "Anterior Drawer Test (Knee)",
      "To detect an ACL injury.",
      ["Knee flexed 90 degrees, foot stabilized. Pull the tibia anteriorly.",
       "Positive: Increased anterior translation versus the other side."]),
    t("varus_stress_test_knee", "Varus Stress Test",
      "To detect an LCL injury.",
      ["Knee flexed 30 degrees. Stabilize the femur and apply a varus (outward) force.",
       "Positive: Pain or gapping at the lateral joint line (Grade I/II/III by laxity)."]),
    t("posterior_drawer_test", "Posterior Drawer Test",
      "To detect a PCL tear.",
      ["Knee flexed 90 degrees. Push the tibia posteriorly.",
       "Positive: Increased posterior translation."]),
    t("godfrey_test", "Godfrey (Posterior Sag) Test",
      "To detect a PCL injury.",
      ["Hip and knee flexed 90 degrees, examiner supports the leg. Observe the tibial plateau.",
       "Positive: The tibia sags posteriorly versus the other side."]),
    # OA
    t("patellofemoral_compression", "Patellofemoral Compression Test (Grind)",
      "To detect patellofemoral OA.",
      ["Patient supine, knee extended. Apply downward pressure on the patella while the patient contracts the quadriceps.",
       "Positive: Pain or crepitus at the patellofemoral joint."]),
    t("crepitus_test", "Crepitus Test",
      "To detect articular cartilage degeneration (OA).",
      ["Move the knee through full flexion and extension while palpating.",
       "Positive: Audible or palpable crepitus/grinding."]),
    t("knee_rom_assessment", "Range of Motion Assessment (Knee)",
      "To detect joint degeneration (OA).",
      ["Passively flex and extend the knee, noting pain, stiffness, and limited ROM.",
       "Positive: Reduced flexion or extension."]),
    # Patellar dislocation
    t("patellar_apprehension", "Patellar Apprehension Test",
      "To detect lateral patellar instability / prior dislocation.",
      ["Patient supine, knee extended and relaxed. Gently push the patella laterally.",
       "Positive: Apprehension or quadriceps contraction to resist displacement."]),
    t("patella_tracking_assess", "Patella Tracking Assessment",
      "To detect abnormal patellar motion / prior dislocation.",
      ["Observe the patella during active knee flexion and extension.",
       "Positive: The patella deviates laterally or fails to track smoothly."]),
    t("patella_hypermobility", "Patellar Hypermobility Test",
      "To detect generalized patellar laxity.",
      ["Patient supine, knee extended. Displace the patella medially and laterally.",
       "Positive: Excessive movement (>50% of patellar width)."]),
    t("q_angle_measurement", "Q-Angle Measurement",
      "To detect malalignment predisposing to lateral patellar dislocation.",
      ["Measure the angle between the ASIS-patella line and the patella-tibial tuberosity line with the knee extended.",
       "Positive: Q-angle >15 degrees (men) or >20 degrees (women)."]),
    # Fracture
    t("knee_slr_test", "Straight Leg Raise Test (Knee)",
      "To detect extensor mechanism disruption / patella fracture.",
      ["Patient supine, legs extended. Ask the patient to lift the affected leg straight without bending the knee.",
       "Positive: Inability to actively lift the leg."]),
    t("patellar_integrity_palpation", "Patellar Integrity Palpation",
      "To detect a patella fracture.",
      ["Palpate the patella gently for tenderness, irregularity, or a gap.",
       "Positive: Severe localized tenderness, palpable gap, or irregularity."]),
    t("active_knee_extension", "Active Knee Extension Test",
      "To detect a patella fracture / extensor disruption.",
      ["Ask the patient to actively straighten the knee from a flexed position.",
       "Positive: Inability or severe pain during active extension."]),
    t("axial_loading_test", "Axial Loading Test (Tibia)",
      "To detect a tibial plateau fracture.",
      ["Apply gentle axial compression through the heel toward the tibia.",
       "Positive: Severe pain at the tibial plateau region."]),
    # ITBS
    t("noble_compression", "Noble Compression Test",
      "To detect iliotibial band syndrome.",
      ["Patient supine, knee flexed 90 degrees. Apply pressure over the lateral femoral epicondyle while slowly extending the knee.",
       "Positive: Pain at approximately 30 degrees of knee flexion."]),
    t("knee_obers_test", "Ober's Test (Knee / ITBS)",
      "To detect iliotibial band tightness contributing to ITBS.",
      ["Patient side-lying on the unaffected side. Extend and abduct the hip, then slowly lower the leg.",
       "Positive: The leg remains elevated and does not drop."]),
    t("renne_test", "Renne Test",
      "To detect iliotibial band syndrome (weight-bearing).",
      ["Patient stands and performs a squat while the examiner presses over the lateral femoral epicondyle.",
       "Positive: Pain at approximately 30 degrees of knee flexion."]),
    # Tendinopathy
    t("decline_squat_test", "Decline Squat Test",
      "To detect patellar tendinopathy.",
      ["Patient stands on a 25-degree decline board and performs a squat.",
       "Positive: Localized pain at the inferior pole of the patella."]),
    t("resisted_knee_extension", "Resisted Knee Extension Test",
      "To detect patellar/quadriceps tendinopathy.",
      ["Patient seated, knee flexed. Resist knee extension.",
       "Positive: Localized tendon pain."]),
    t("single_leg_decline_squat", "Single-Leg Decline Squat Test",
      "To detect patellar tendinopathy.",
      ["Patient performs a single-leg squat on a decline surface.",
       "Positive: Reproduction of localized tendon pain."]),
    t("hop_test_knee", "Hop Test (Knee)",
      "Functional indicator of patellar/quadriceps tendinopathy.",
      ["Patient performs repeated hopping on the affected leg.",
       "Positive: Pain localized to the patellar or quadriceps tendon."]),
    # Pes anserine
    t("pes_anserine_palpation", "Pes Anserine Palpation Test",
      "To detect pes anserine bursitis.",
      ["Patient supine, knee extended. Palpate 5-7 cm below the medial joint line.",
       "Positive: Localized tenderness (below, not at, the joint line)."]),
    t("resisted_knee_flexion", "Resisted Knee Flexion Test",
      "To detect pes anserine bursitis.",
      ["Patient flexes the knee against resistance.",
       "Positive: Pain at the pes anserine region."]),
    t("resisted_hip_adduction", "Resisted Hip Adduction Test",
      "To detect pes anserine bursitis (sartorius/gracilis/semitendinosus).",
      ["Patient performs hip adduction against resistance.",
       "Positive: Pain at the pes anserine insertion."]),
    # OCD
    t("wilsons_test", "Wilson's Test",
      "To detect osteochondritis dissecans of the medial femoral condyle.",
      ["Patient supine, knee flexed 90 degrees. Patient actively extends the knee while the examiner internally rotates the tibia.",
       "Positive: Pain at 30-40 degrees relieved by external rotation of the tibia."]),
    t("condylar_palpation", "Passive Condylar Palpation Test",
      "To detect an OCD lesion.",
      ["Knee flexed 90 degrees. Palpate the femoral condyles.",
       "Positive: Localized pain over a femoral condyle."]),
    t("joint_effusion_stroke_test", "Joint Effusion (Stroke) Test",
      "To detect joint effusion associated with intra-articular pathology.",
      ["Stroke the medial knee upward, then the lateral knee downward.",
       "Positive: A fluid wave or bulge appears."]),
    # Baker's cyst
    t("foucher_sign", "Foucher's Sign",
      "To confirm a Baker's cyst.",
      ["Palpate the popliteal mass with the knee extended, then flexed.",
       "Positive: The mass is firm in extension and softens/disappears in flexion."]),
    t("popliteal_palpation", "Popliteal Palpation Test",
      "To detect a Baker's cyst.",
      ["Patient prone or supine. Palpate the popliteal fossa.",
       "Positive: A palpable fluid-filled mass."]),
    t("knee_effusion_test", "Knee Effusion Test (Bulge / Stroke)",
      "To detect intra-articular effusion.",
      ["Perform the bulge or stroke test over the knee.",
       "Positive: Fluid accumulation present."]),
    # Septic
    t("passive_joint_motion_knee", "Passive Joint Motion Test (Knee)",
      "To screen for septic arthritis. AVOID aggressive testing.",
      ["Gently move the knee through a small range of passive flexion/extension.",
       "Positive: Severe pain even with minimal passive movement."]),
    t("knee_temp_assessment", "Temperature Assessment (Knee)",
      "To detect joint infection.",
      ["Compare the temperature of the affected and unaffected knee with the back of the hand.",
       "Positive: The affected knee is significantly warmer."]),
]

# knee-pain-screener: triage emergency-free path. (Septic emergency is handled in the
# patient assessment via terminateAssessment, not in this clinician screener.)
# diagnosisMapping must EXACTLY match Knee Region.json condition names.
KNEE_GRAPH = {
    "knee-pain-screener": {
        "startNode": "joint_line_tenderness",
        "nodes": {
            "joint_line_tenderness": {
                "id": "joint_line_tenderness",
                "onPositive": "mcmurray_test",
                "onNegative": "lachman_test",
                "isTerminal": False,
            },
            "mcmurray_test": {
                "id": "mcmurray_test",
                "onPositive": "diag_knee_meniscus",
                "onNegative": "crepitus_test",
                "isTerminal": False,
            },
            "crepitus_test": {
                "id": "crepitus_test",
                "onPositive": "diag_knee_oa",
                "onNegative": "diag_knee_meniscus",
                "isTerminal": False,
            },
            "lachman_test": {
                "id": "lachman_test",
                "onPositive": "diag_knee_acl",
                "onNegative": "valgus_stress_test_knee",
                "isTerminal": False,
            },
            "valgus_stress_test_knee": {
                "id": "valgus_stress_test_knee",
                "onPositive": "diag_knee_mcl",
                "onNegative": "varus_stress_test_knee",
                "isTerminal": False,
            },
            "varus_stress_test_knee": {
                "id": "varus_stress_test_knee",
                "onPositive": "diag_knee_lcl",
                "onNegative": "posterior_drawer_test",
                "isTerminal": False,
            },
            "posterior_drawer_test": {
                "id": "posterior_drawer_test",
                "onPositive": "diag_knee_pcl",
                "onNegative": "clarkes_test",
                "isTerminal": False,
            },
            "clarkes_test": {
                "id": "clarkes_test",
                "onPositive": "diag_knee_pfps",
                "onNegative": "noble_compression",
                "isTerminal": False,
            },
            "noble_compression": {
                "id": "noble_compression",
                "onPositive": "diag_knee_itbs",
                "onNegative": "decline_squat_test",
                "isTerminal": False,
            },
            "decline_squat_test": {
                "id": "decline_squat_test",
                "onPositive": "diag_knee_tendinopathy",
                "onNegative": "foucher_sign",
                "isTerminal": False,
            },
            "foucher_sign": {
                "id": "foucher_sign",
                "onPositive": "diag_knee_bakers",
                "onNegative": "diag_knee_undetermined",
                "isTerminal": False,
            },
        },
    }
}


# Terminal nodes (diagnosisMapping must EXACTLY match Knee Region.json condition names)
TERMINALS = {
    "diag_knee_meniscus": ("Meniscus Tear",
        "Positive meniscal provocation with joint-line tenderness indicates a meniscus tear. Confirm with MRI."),
    "diag_knee_oa": ("Knee Osteoarthritis",
        "Crepitus and joint changes indicate knee OA. Confirm with weight-bearing X-ray."),
    "diag_knee_acl": ("ACL Injury",
        "Positive Lachman indicates an ACL tear. MRI confirms and assesses associated injuries."),
    "diag_knee_mcl": ("MCL Injury",
        "Medial gapping/pain on valgus stress indicates an MCL injury; grade by laxity."),
    "diag_knee_lcl": ("LCL Injury",
        "Lateral gapping/pain on varus stress indicates an LCL injury; grade by laxity."),
    "diag_knee_pcl": ("PCL Injury",
        "Posterior translation indicates a PCL injury. MRI confirms."),
    "diag_knee_pfps": ("Patellofemoral Pain Syndrome",
        "Positive patellofemoral provocation with anterior knee pain indicates PFPS."),
    "diag_knee_itbs": ("Iliotibial Band Syndrome",
        "Lateral pain at ~30 degrees on Noble compression indicates ITBS."),
    "diag_knee_tendinopathy": ("Patellar Tendinopathy",
        "Load-dependent inferior-pole pain on decline squat indicates patellar tendinopathy."),
    "diag_knee_bakers": ("Baker's Cyst",
        "Foucher's sign positive confirms a Baker's cyst (popliteal). Treat the underlying cause."),
    "diag_knee_undetermined": ("Meniscus Tear",
        "No single provocative test was definitive. Re-evaluate, consider imaging, and correlate clinically."),
}


def build_graph():
    g = KNEE_GRAPH["knee-pain-screener"]
    nodes = dict(g["nodes"])  # non-terminal nodes
    for nid, (mapping, instr) in TERMINALS.items():
        nodes[nid] = {
            "id": nid,
            "name": "Refined Diagnosis: " + mapping,
            "instruction": instr,
            "isTerminal": True,
            "diagnosisMapping": mapping,
        }
    g["nodes"] = nodes
    return {"knee-pain-screener": g}


def upsert_library():
    with open(LIB, encoding="utf-8") as f:
        lib = json.load(f)
    existing = {x["id"] for x in lib}
    added = 0
    for x in KNEE_TESTS:
        if x["id"] not in existing:
            lib.append(x); added += 1
    with open(LIB, "w", encoding="utf-8") as f:
        json.dump(lib, f, indent=2, ensure_ascii=False)
    return added, len(lib)


def upsert_graph():
    with open(GRAPHS, encoding="utf-8") as f:
        graphs = json.load(f)
    for k, v in build_graph().items():
        graphs[k] = v
    with open(GRAPHS, "w", encoding="utf-8") as f:
        json.dump(graphs, f, indent=2, ensure_ascii=False)
    return list(graphs.keys())


if __name__ == "__main__":
    added, total = upsert_library()
    keys = upsert_graph()
    print(f"test-library: +{added} knee tests (total {total})")
    print(f"flow-graphs keys: {keys}")
