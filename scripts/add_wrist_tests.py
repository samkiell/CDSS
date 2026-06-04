"""
add_wrist_tests.py
Appends the 13 Wrist clinical tests to test-library.json (idempotent) and adds the
wrist-pain-screener decision graph to test-flow-graphs.json (idempotent).
"""

import json, os

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
LIB = os.path.join(ROOT, "src", "lib", "decision-engine", "test-library.json")
GRAPHS = os.path.join(ROOT, "src", "lib", "decision-engine", "test-flow-graphs.json")

WRIST_TESTS = [
    {
        "id": "phalens_test", "name": "Phalen's Test", "type": "Clinical Test",
        "purpose": "To provoke median nerve symptoms in carpal tunnel syndrome.",
        "instructions": [
            "Patient fully flexes both wrists and holds the backs of the hands together.",
            "Hold the position for up to 60 seconds.",
            "Positive: Numbness or tingling in the median nerve distribution (thumb, index, middle, radial ring).",
        ], "image": None,
    },
    {
        "id": "tinels_sign_wrist", "name": "Tinel's Sign (Wrist)", "type": "Clinical Test",
        "purpose": "To detect median nerve irritation at the carpal tunnel.",
        "instructions": [
            "Examiner taps lightly over the carpal tunnel on the palmar wrist.",
            "Positive: Tingling or 'pins and needles' in the median nerve distribution.",
        ], "image": None,
    },
    {
        "id": "carpal_compression_test", "name": "Carpal Compression Test (Durkan's)", "type": "Clinical Test",
        "purpose": "To reproduce CTS symptoms via direct carpal tunnel pressure.",
        "instructions": [
            "Examiner applies firm, direct pressure over the carpal tunnel with both thumbs for 30 seconds.",
            "Positive: Reproduction of numbness/tingling in the median nerve distribution.",
        ], "image": None,
    },
    {
        "id": "finkelsteins_test", "name": "Finkelstein's Test", "type": "Clinical Test",
        "purpose": "To detect De Quervain's tenosynovitis.",
        "instructions": [
            "Patient makes a fist with the thumb tucked inside the fingers.",
            "Examiner passively ulnar-deviates the wrist.",
            "Positive: Sharp pain over the radial styloid (thumb side of the wrist).",
        ], "image": None,
    },
    {
        "id": "what_test", "name": "WHAT Test (Wrist Hyperflexion & Abduction of Thumb)", "type": "Clinical Test",
        "purpose": "To detect De Quervain's tenosynovitis.",
        "instructions": [
            "Patient hyperflexes the wrist and abducts the thumb against examiner resistance.",
            "Positive: Pain reproduced over the radial wrist.",
        ], "image": None,
    },
    {
        "id": "ligament_stress_wrist", "name": "Wrist Ligament Stress Tests", "type": "Clinical Test",
        "purpose": "To detect ligamentous injury (wrist sprain).",
        "instructions": [
            "Examiner applies directed stress to specific wrist ligaments (e.g., scapholunate, lunotriquetral).",
            "Positive: Pain or laxity at the stressed ligament.",
        ], "image": None,
    },
    {
        "id": "tfcc_load_test", "name": "TFCC Load Test (Ulnar Grind)", "type": "Clinical Test",
        "purpose": "To detect triangular fibrocartilage complex injury.",
        "instructions": [
            "Hold the wrist in ulnar deviation, apply axial load, and rotate the forearm.",
            "Positive: Pain or clicking on the ulnar side of the wrist.",
        ], "image": None,
    },
    {
        "id": "press_test_wrist", "name": "Press Test", "type": "Clinical Test",
        "purpose": "Highly sensitive functional screen for a TFCC tear.",
        "instructions": [
            "Patient pushes up from a chair using the affected hand to bear weight.",
            "Positive: Ulnar-sided wrist pain reproduced.",
        ], "image": None,
    },
    {
        "id": "transillumination_wrist", "name": "Transillumination Test (Wrist)", "type": "Clinical Test",
        "purpose": "To confirm that a wrist mass is fluid-filled (ganglion cyst).",
        "instructions": [
            "Apply a light source through the swelling in a darkened room.",
            "Positive: Light passes through, indicating a fluid-filled cyst rather than a solid mass.",
        ], "image": None,
    },
    {
        "id": "resisted_wrist_extension", "name": "Resisted Wrist Extension Test", "type": "Clinical Test",
        "purpose": "To detect intersection syndrome.",
        "instructions": [
            "Patient extends the wrist against examiner resistance.",
            "Positive: Pain or crepitus over the dorsal radial forearm (4-6 cm proximal to the wrist).",
        ], "image": None,
    },
    {
        "id": "snuffbox_tenderness", "name": "Anatomical Snuffbox Tenderness Test", "type": "Clinical Test",
        "purpose": "Most important clinical sign of a scaphoid fracture.",
        "instructions": [
            "Palpate the anatomical snuffbox at the base of the thumb.",
            "Positive: Localized tenderness — treat as scaphoid fracture until imaging excludes it.",
        ], "image": None,
    },
    {
        "id": "scaphoid_compression", "name": "Scaphoid Compression Test", "type": "Clinical Test",
        "purpose": "To support suspicion of a scaphoid fracture.",
        "instructions": [
            "Apply axial load (compression) along the line of the thumb metacarpal toward the scaphoid.",
            "Positive: Pain reproduced in the scaphoid region.",
        ], "image": None,
    },
    {
        "id": "axial_load_wrist", "name": "Axial Load Test (Wrist / Lunate)", "type": "Clinical Test",
        "purpose": "Non-specific provocation suggesting intra-articular pathology (e.g., Kienbock's). No single definitive test exists.",
        "instructions": [
            "Apply axial compression through the wrist.",
            "Positive: Central dorsal wrist pain — correlate with imaging; Kienbock's is imaging-dependent.",
        ], "image": None,
    },
]

# diagnosisMapping strings must EXACTLY match Wrist Region.json condition names.
WRIST_GRAPH = {
    "wrist-pain-screener": {
        "startNode": "snuffbox_tenderness",
        "nodes": {
            # Scaphoid screened FIRST — it is the critical red flag.
            "snuffbox_tenderness": {
                "id": "snuffbox_tenderness",
                "onPositive": "scaphoid_compression",
                "onNegative": "tinels_sign_wrist",
                "isTerminal": False,
            },
            "scaphoid_compression": {
                "id": "scaphoid_compression",
                "onPositive": "diag_wrist_scaphoid",
                "onNegative": "diag_wrist_scaphoid",
                "isTerminal": False,
            },
            "tinels_sign_wrist": {
                "id": "tinels_sign_wrist",
                "onPositive": "phalens_test",
                "onNegative": "finkelsteins_test",
                "isTerminal": False,
            },
            "phalens_test": {
                "id": "phalens_test",
                "onPositive": "diag_wrist_cts",
                "onNegative": "diag_wrist_cts",
                "isTerminal": False,
            },
            "finkelsteins_test": {
                "id": "finkelsteins_test",
                "onPositive": "diag_wrist_dequervains",
                "onNegative": "tfcc_load_test",
                "isTerminal": False,
            },
            "tfcc_load_test": {
                "id": "tfcc_load_test",
                "onPositive": "diag_wrist_tfcc",
                "onNegative": "resisted_wrist_extension",
                "isTerminal": False,
            },
            "resisted_wrist_extension": {
                "id": "resisted_wrist_extension",
                "onPositive": "diag_wrist_intersection",
                "onNegative": "transillumination_wrist",
                "isTerminal": False,
            },
            "transillumination_wrist": {
                "id": "transillumination_wrist",
                "onPositive": "diag_wrist_ganglion",
                "onNegative": "axial_load_wrist",
                "isTerminal": False,
            },
            "axial_load_wrist": {
                "id": "axial_load_wrist",
                "onPositive": "diag_wrist_kienbock",
                "onNegative": "diag_wrist_sprain",
                "isTerminal": False,
            },
            "diag_wrist_scaphoid": {
                "id": "diag_wrist_scaphoid",
                "name": "Refined Diagnosis: Scaphoid Fracture",
                "instruction": "Snuffbox tenderness after FOOSH indicates probable scaphoid fracture. IMAGING IS MANDATORY (X-ray; MRI/CT if X-ray normal). Immobilize and treat as fracture pending imaging.",
                "isTerminal": True, "diagnosisMapping": "Scaphoid Fracture",
            },
            "diag_wrist_cts": {
                "id": "diag_wrist_cts",
                "name": "Refined Diagnosis: Carpal Tunnel Syndrome",
                "instruction": "Positive median-nerve provocation confirms CTS. Consider nerve conduction studies if surgery is contemplated.",
                "isTerminal": True, "diagnosisMapping": "Carpal Tunnel Syndrome",
            },
            "diag_wrist_dequervains": {
                "id": "diag_wrist_dequervains",
                "name": "Refined Diagnosis: De Quervain's Tenosynovitis",
                "instruction": "Positive Finkelstein's confirms De Quervain's tenosynovitis of the first dorsal compartment.",
                "isTerminal": True, "diagnosisMapping": "De Quervain's Tenosynovitis",
            },
            "diag_wrist_tfcc": {
                "id": "diag_wrist_tfcc",
                "name": "Refined Diagnosis: TFCC Injury",
                "instruction": "Positive ulnar load test indicates TFCC injury. MRI arthrogram confirms.",
                "isTerminal": True, "diagnosisMapping": "TFCC Injury",
            },
            "diag_wrist_intersection": {
                "id": "diag_wrist_intersection",
                "name": "Refined Diagnosis: Intersection Syndrome",
                "instruction": "Dorsal radial forearm pain/crepitus on resisted extension indicates intersection syndrome.",
                "isTerminal": True, "diagnosisMapping": "Intersection Syndrome",
            },
            "diag_wrist_ganglion": {
                "id": "diag_wrist_ganglion",
                "name": "Refined Diagnosis: Ganglion Cyst",
                "instruction": "Transillumination-positive fluid-filled mass confirms ganglion cyst.",
                "isTerminal": True, "diagnosisMapping": "Ganglion Cyst",
            },
            "diag_wrist_kienbock": {
                "id": "diag_wrist_kienbock",
                "name": "Refined Diagnosis: Kienbock's Disease",
                "instruction": "Central dorsal wrist pain on axial load with relevant history raises Kienbock's suspicion. Imaging (X-ray staging, MRI for early AVN) is required.",
                "isTerminal": True, "diagnosisMapping": "Kienbock's Disease",
            },
            "diag_wrist_sprain": {
                "id": "diag_wrist_sprain",
                "name": "Refined Diagnosis: Wrist Sprain",
                "instruction": "No provocative test positive and fracture excluded — consistent with a ligamentous wrist sprain.",
                "isTerminal": True, "diagnosisMapping": "Wrist Sprain",
            },
        },
    }
}


def upsert_library():
    with open(LIB, encoding="utf-8") as f:
        lib = json.load(f)
    existing = {t["id"] for t in lib}
    added = 0
    for t in WRIST_TESTS:
        if t["id"] not in existing:
            lib.append(t); added += 1
    with open(LIB, "w", encoding="utf-8") as f:
        json.dump(lib, f, indent=2, ensure_ascii=False)
    return added, len(lib)


def upsert_graph():
    with open(GRAPHS, encoding="utf-8") as f:
        graphs = json.load(f)
    for k, v in WRIST_GRAPH.items():
        graphs[k] = v
    with open(GRAPHS, "w", encoding="utf-8") as f:
        json.dump(graphs, f, indent=2, ensure_ascii=False)
    return list(graphs.keys())


if __name__ == "__main__":
    added, total = upsert_library()
    keys = upsert_graph()
    print(f"test-library: +{added} wrist tests (total {total})")
    print(f"flow-graphs keys: {keys}")
