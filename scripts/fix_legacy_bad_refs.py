"""
fix_legacy_bad_refs.py
Fixes PRE-EXISTING data-quality bugs in the legacy region JSONs (DOCX-extraction
artifacts that the engine silently ignored). Two classes:

1. Bad condition references — an excludedConditions/increaseLikelihood entry that names
   something which is NOT a condition in that region (e.g. "cervical myelopathy",
   "adhesive capsulitis", "ation"). These never fired. Fix:
     - If it was clearly a clinical note (a differential not modeled in the region),
       move the text into the option's `notes` field and drop the dead ref.
     - Pure garbage tokens ("ation", "ation,") are simply removed.

2. Host self-exclusion — a "No" option whose excludedConditions lists its OWN host
   condition (e.g. OA question: "No stiffness" -> exclude OSTEOARTHRITIS). This is
   intended gating logic expressed wrongly. Fix: convert to proper isGating=True on the
   question and remove the self-exclude (engine then rules out the host on a 'No').

Only touches the SPECIFIC options identified; everything else is untouched.
Idempotent. Reports every change.
"""
import json, os

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


def load(region):
    p = os.path.join(ROOT, "public", "rules", f"{region} Region.json")
    return p, json.load(open(p, encoding="utf-8"))


def save(p, j):
    json.dump(j, open(p, "w", encoding="utf-8"), indent=2, ensure_ascii=False)


def find_opt(j, qid, value):
    for c in j["conditions"]:
        for q in c.get("questions", []):
            if q["id"] == qid:
                for arr in ("options", "answers"):
                    for o in q.get(arr, []):
                        if o["value"] == value:
                            yield c, q, o


def find_q(j, qid):
    for c in j["conditions"]:
        for q in c.get("questions", []):
            if q["id"] == qid:
                return c, q
    return None, None


# (region, qid, optionValue, field, badRef, action)
#   action: ("note", "<text>")  -> drop ref, set notes if empty
#           ("drop", None)        -> just remove garbage ref
#           ("gate", None)        -> remove self-exclude + set question isGating=True
FIXES = [
    # --- Ankle ---
    ("Ankle", "ankle_q54", "Yes", "increaseLikelihood", "ation", ("drop", None)),
    ("Ankle", "ankle_q71", "No", "excludedConditions", "OSTEOARTHRITIS", ("gate", None)),
    # --- Cervical (these "conditions" are differentials NOT modeled in the 2-condition region) ---
    ("Cervical", "cervical_q9", "Yes", "excludedConditions", "cervical myelopathy",
     ("note", "Pain increasing with cough/sneeze/strain raises disc/radicular involvement; consider myelopathy work-up if neuro signs.")),
    ("Cervical", "cervical_q10", "Yes", "excludedConditions", "cervical stenosis",
     ("note", "Movement restriction noted; consider cervical stenosis if accompanied by myelopathic signs.")),
    ("Cervical", "cervical_q25", "Yes", "excludedConditions", "cervical stenosis",
     ("note", "Movement restriction noted; consider cervical stenosis if accompanied by myelopathic signs.")),
    # --- Elbow ---
    ("Elbow", "elbow_q3", "Sudden", "excludedConditions", "rupture, link to avulsion of the biceps tendon",
     ("note", "Sudden onset: consider biceps tendon rupture/avulsion (not modeled here) — refer if a pop/bulge is reported.")),
    # --- Lumbar (red-flag differentials not modeled as conditions; preserve as notes) ---
    ("Lumbar", "lumbar_q4", "Standing", "excludedConditions", "facet joint syndrome",
     ("note", "Pain aggravated by standing/extension can indicate facet joint syndrome (not modeled here).")),
    ("Lumbar", "lumbar_q11", "Yes", "excludedConditions", "ankylosing spondylitis or bone tumours and infection",
     ("note", "RED FLAG: fever/chills — consider infection, inflammatory (ankylosing spondylitis) or tumour; urgent work-up.")),
    ("Lumbar", "lumbar_q12", "Yes", "excludedConditions", "cancers/infection",
     ("note", "RED FLAG: unexplained weight loss — consider malignancy or infection; urgent work-up.")),
    # --- Shoulder ---
    ("Shoulder", "shoulder_q4", "Yes", "excludedConditions", "nerve involvement",
     ("note", "Tingling/abnormal sensation suggests neural involvement (cervical radiculopathy / brachial plexus) — assess accordingly.")),
    ("Shoulder", "shoulder_q16", "Yes", "increaseLikelihood", "ation,", ("drop", None)),
    ("Shoulder", "shoulder_q38", "Yes", "excludedConditions", "rotator cuff disorder and cervical radiculitis",
     ("note", "Catching + numbness can also reflect rotator cuff disorder or cervical radiculitis — differentiate clinically.")),
    ("Shoulder", "shoulder_q47", "Yes", "excludedConditions", "adhesive capsulitis",
     ("note", "Night pain is common in adhesive capsulitis (not modeled here) as well as OA.")),
    ("Shoulder", "shoulder_q48", "No", "excludedConditions", "Adhesive Capsulitis. Extension is free in Adhesive Capsulitis",
     ("note", "Global motion restriction favours adhesive capsulitis; in OA, extension is typically freer.")),
    ("Shoulder", "shoulder_q49", "No", "excludedConditions", "OSTEOARTHRITIS", ("gate", None)),
    ("Shoulder", "shoulder_q50", "No", "excludedConditions", "OSTEOARTHRITIS", ("gate", None)),
]


def apply_fixes():
    by_region = {}
    for fx in FIXES:
        by_region.setdefault(fx[0], []).append(fx)

    for region, fixes in by_region.items():
        p, j = load(region)
        changed = 0
        for (_, qid, val, field, badref, (action, text)) in fixes:
            if action == "gate":
                c, q = find_q(j, qid)
                if not q:
                    print(f"  ! {region} {qid}: not found"); continue
                q["isGating"] = True
                # remove the self-exclude ref from both arrays
                for arr in ("options", "answers"):
                    for o in q.get(arr, []):
                        if o["value"] == val:
                            o["effects"]["excludedConditions"] = [
                                x for x in o["effects"].get("excludedConditions", []) if x != badref
                            ]
                changed += 1
                print(f"  {region} {qid}: set isGating=True, removed self-exclude '{badref}'")
                continue
            # note / drop: edit the matching option in both arrays
            touched = False
            for c, q, o in find_opt(j, qid, val):
                e = o["effects"]
                if badref in e.get(field, []):
                    e[field] = [x for x in e[field] if x != badref]
                    if action == "note" and not e.get("notes"):
                        e["notes"] = text
                    touched = True
            if touched:
                changed += 1
                act = "noted" if action == "note" else "dropped"
                print(f"  {region} {qid} '{val}': {act} bad {field} ref '{badref[:40]}'")
            else:
                print(f"  ! {region} {qid} '{val}': ref '{badref[:30]}' not found (already fixed?)")
        save(p, j)
        print(f"{region}: {changed} fixes applied\n")


if __name__ == "__main__":
    apply_fixes()
