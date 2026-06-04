"""
add_hip_tests.py
Appends the 11 Hip clinical tests to test-library.json (idempotent) and adds the
hip-pain-screener decision graph to test-flow-graphs.json (idempotent).

Test-library entry shape (matches existing):
  { id, name, type, purpose, instructions[], image }

Flow-graph node IDs must equal test-library IDs (engine matches node.id -> test.id).
Terminal nodes carry { name, instruction, isTerminal, diagnosisMapping }.
diagnosisMapping strings must EXACTLY match Hip Region.json condition names.
"""

import json, os

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
LIB = os.path.join(ROOT, "src", "lib", "decision-engine", "test-library.json")
GRAPHS = os.path.join(ROOT, "src", "lib", "decision-engine", "test-flow-graphs.json")

HIP_TESTS = [
    {
        "id": "faber_test",
        "name": "FABER Test (Patrick's Test)",
        "type": "Clinical Test",
        "purpose": "To detect intra-articular hip pathology such as osteoarthritis or FAI, and to screen the SIJ.",
        "instructions": [
            "Patient supine; place the affected leg in the figure-4 position (flexion, abduction, external rotation).",
            "Apply gentle downward pressure on the flexed knee while stabilizing the opposite ASIS.",
            "Positive: Pain reproduced in the groin or restricted movement compared to the other side."
        ],
        "image": None,
    },
    {
        "id": "fadir_test",
        "name": "FADIR Test (Flexion, Adduction, Internal Rotation)",
        "type": "Clinical Test",
        "purpose": "To detect femoroacetabular impingement and intra-articular/labral pathology.",
        "instructions": [
            "Patient supine; flex the hip to 90 degrees.",
            "Adduct and internally rotate the hip.",
            "Positive: Groin pain (or clicking) reproduced."
        ],
        "image": None,
    },
    {
        "id": "hip_scour_test",
        "name": "Scour Test (Hip Quadrant)",
        "type": "Clinical Test",
        "purpose": "To assess hip joint degeneration and intra-articular pathology (OA, FAI, labral).",
        "instructions": [
            "Patient supine; flex and adduct the hip.",
            "Apply axial compression through the femur while moving the hip in an arc.",
            "Positive: Pain, grinding, clicking, or crepitus felt."
        ],
        "image": None,
    },
    {
        "id": "hip_log_roll_test",
        "name": "Log Roll Test",
        "type": "Clinical Test",
        "purpose": "To detect intra-articular hip pathology (the most specific test for the hip joint).",
        "instructions": [
            "Patient supine with legs extended and relaxed.",
            "Gently roll the leg internally and externally.",
            "Positive: Pain reproduced, or increased external rotation compared to the other side."
        ],
        "image": None,
    },
    {
        "id": "trendelenburg_test",
        "name": "Trendelenburg Test",
        "type": "Clinical Test",
        "purpose": "To assess gluteus medius strength and detect gluteal weakness (OA, GTPS).",
        "instructions": [
            "Patient stands on the affected leg only; examiner observes the pelvis from behind.",
            "Positive: The pelvis drops on the opposite (contralateral) side."
        ],
        "image": None,
    },
    {
        "id": "single_leg_stance_hip",
        "name": "Single-Leg Stance Test (Hip)",
        "type": "Clinical Test",
        "purpose": "Highly sensitive screen for gluteal tendinopathy / GTPS.",
        "instructions": [
            "Patient stands on the affected leg for up to 30 seconds.",
            "Positive: Lateral hip pain reproduced within 30 seconds."
        ],
        "image": None,
    },
    {
        "id": "resisted_ext_derotation",
        "name": "Resisted External Derotation Test",
        "type": "Clinical Test",
        "purpose": "To detect gluteus medius/minimus tendinopathy (GTPS).",
        "instructions": [
            "Patient supine, hip flexed to 90 degrees; examiner passively externally rotates the hip.",
            "Ask the patient to return the leg to neutral against resistance.",
            "Positive: Pain reproduced over the lateral hip."
        ],
        "image": None,
    },
    {
        "id": "obers_test_hip",
        "name": "Ober's Test",
        "type": "Clinical Test",
        "purpose": "To detect iliotibial band tightness contributing to GTPS or lateral snapping hip.",
        "instructions": [
            "Patient side-lying with the unaffected leg down.",
            "Extend and abduct the affected hip, then allow it to drop into adduction.",
            "Positive: The leg remains abducted and does not drop."
        ],
        "image": None,
    },
    {
        "id": "dynamic_hip_movement",
        "name": "Dynamic Hip Movement Test",
        "type": "Clinical Test",
        "purpose": "To confirm snapping hip syndrome.",
        "instructions": [
            "Patient actively flexes and extends the hip while the examiner palpates over the anterior (iliopsoas) or lateral (ITB) hip.",
            "Positive: Snapping is reproduced (visible, palpable, or audible)."
        ],
        "image": None,
    },
    {
        "id": "thomas_test_hip",
        "name": "Thomas Test (Modified, Hip)",
        "type": "Clinical Test",
        "purpose": "To detect hip flexor tightness, iliopsoas involvement, or labral irritation.",
        "instructions": [
            "Patient supine at the edge of the table; pull one knee to the chest while the other leg hangs off the table.",
            "Positive: The hanging leg produces hip pain, clicking, or fails to extend fully."
        ],
        "image": None,
    },
    {
        "id": "int_rotation_overpressure",
        "name": "Internal Rotation Overpressure Test",
        "type": "Clinical Test",
        "purpose": "To detect FAI due to limited internal rotation.",
        "instructions": [
            "Patient supine, hip flexed to 90 degrees; apply internal rotation with overpressure.",
            "Positive: Groin pain or restriction noted."
        ],
        "image": None,
    },
]

# Hip pain screener decision graph.
# Logic: triage by location first (Scour for groin/intra-articular vs single-leg-stance for lateral),
# then provocative tests narrow to the most likely diagnosis. Terminal diagnosisMapping
# values match Hip Region.json condition names EXACTLY.
HIP_GRAPH = {
    "hip-pain-screener": {
        "startNode": "hip_scour_test",
        "nodes": {
            "hip_scour_test": {
                "id": "hip_scour_test",
                "onPositive": "fadir_test",
                "onNegative": "single_leg_stance_hip",
                "isTerminal": False,
            },
            "fadir_test": {
                "id": "fadir_test",
                "onPositive": "int_rotation_overpressure",
                "onNegative": "hip_log_roll_test",
                "isTerminal": False,
            },
            "int_rotation_overpressure": {
                "id": "int_rotation_overpressure",
                "onPositive": "diag_hip_fai",
                "onNegative": "diag_hip_labral_tear",
                "isTerminal": False,
            },
            "hip_log_roll_test": {
                "id": "hip_log_roll_test",
                "onPositive": "faber_test",
                "onNegative": "diag_hip_oa",
                "isTerminal": False,
            },
            "faber_test": {
                "id": "faber_test",
                "onPositive": "diag_hip_avn",
                "onNegative": "diag_hip_oa",
                "isTerminal": False,
            },
            "single_leg_stance_hip": {
                "id": "single_leg_stance_hip",
                "onPositive": "obers_test_hip",
                "onNegative": "dynamic_hip_movement",
                "isTerminal": False,
            },
            "obers_test_hip": {
                "id": "obers_test_hip",
                "onPositive": "diag_hip_gtps",
                "onNegative": "diag_hip_gtps",
                "isTerminal": False,
            },
            "dynamic_hip_movement": {
                "id": "dynamic_hip_movement",
                "onPositive": "diag_hip_snapping",
                "onNegative": "diag_hip_gtps",
                "isTerminal": False,
            },
            # Terminal nodes — diagnosisMapping must match Hip Region.json condition names
            "diag_hip_fai": {
                "id": "diag_hip_fai",
                "name": "Refined Diagnosis: Femoroacetabular Impingement",
                "instruction": "Positive impingement provocation with limited internal rotation indicates FAI. Consider imaging to assess cam/pincer morphology and associated labral involvement.",
                "isTerminal": True,
                "diagnosisMapping": "Femoroacetabular Impingement",
            },
            "diag_hip_labral_tear": {
                "id": "diag_hip_labral_tear",
                "name": "Refined Diagnosis: Hip Labral Tear",
                "instruction": "Positive impingement provocation without rotation restriction points to labral pathology. MRI arthrogram recommended for confirmation.",
                "isTerminal": True,
                "diagnosisMapping": "Hip Labral Tear",
            },
            "diag_hip_avn": {
                "id": "diag_hip_avn",
                "name": "Refined Diagnosis: Avascular Necrosis",
                "instruction": "Multi-directional provocation with red-flag history (rest pain, steroids/alcohol/sickle cell) raises AVN suspicion. URGENT MRI is required — AVN is imaging-dependent.",
                "isTerminal": True,
                "diagnosisMapping": "Avascular Necrosis",
            },
            "diag_hip_oa": {
                "id": "diag_hip_oa",
                "name": "Refined Diagnosis: Hip Osteoarthritis",
                "instruction": "Intra-articular pattern with mechanical features is consistent with hip OA. Confirm with weight-bearing X-ray.",
                "isTerminal": True,
                "diagnosisMapping": "Hip Osteoarthritis",
            },
            "diag_hip_gtps": {
                "id": "diag_hip_gtps",
                "name": "Refined Diagnosis: Greater Trochanteric Pain Syndrome",
                "instruction": "Lateral hip pain with positive single-leg stance / ITB findings indicates GTPS (gluteal tendinopathy).",
                "isTerminal": True,
                "diagnosisMapping": "Greater Trochanteric Pain Syndrome",
            },
            "diag_hip_snapping": {
                "id": "diag_hip_snapping",
                "name": "Refined Diagnosis: Snapping Hip Syndrome",
                "instruction": "Reproducible snapping on dynamic movement confirms snapping hip syndrome. Identify iliopsoas (anterior) vs ITB (lateral) subtype.",
                "isTerminal": True,
                "diagnosisMapping": "Snapping Hip Syndrome",
            },
        },
    }
}


def upsert_library():
    with open(LIB, encoding="utf-8") as f:
        lib = json.load(f)
    existing = {t["id"] for t in lib}
    added = 0
    for t in HIP_TESTS:
        if t["id"] not in existing:
            lib.append(t)
            added += 1
    with open(LIB, "w", encoding="utf-8") as f:
        json.dump(lib, f, indent=2, ensure_ascii=False)
    return added, len(lib)


def upsert_graph():
    with open(GRAPHS, encoding="utf-8") as f:
        graphs = json.load(f)
    for k, v in HIP_GRAPH.items():
        graphs[k] = v
    with open(GRAPHS, "w", encoding="utf-8") as f:
        json.dump(graphs, f, indent=2, ensure_ascii=False)
    return list(graphs.keys())


if __name__ == "__main__":
    added, total = upsert_library()
    keys = upsert_graph()
    print(f"test-library: +{added} hip tests (total {total})")
    print(f"flow-graphs keys: {keys}")
