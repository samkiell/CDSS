"""
apply_branching.py
Applies a verified branching map (from the derive-region-branching workflow) to a
region JSON in place. For each rule, finds the matching question id + option value
in the General Assessment block and MERGES the excludedConditions / decreaseLikelihood
into that option's effects (both the `options` and `answers` arrays, kept identical).

Usage: python scripts/apply_branching.py <RegionName> <branching_map.json>
  where branching_map.json = { "region": "...", "rules": [ {questionId, answerValue,
  excludedConditions[], decreaseLikelihood[], rationale}, ... ] }

Idempotent: re-running with the same map produces the same result (set-merge).
Reports any rule whose questionId/answerValue could not be matched (so nothing fails silently).
"""
import json, os, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


def merge_list(dst, add):
    seen = list(dst)
    for x in add:
        if x not in seen:
            seen.append(x)
    return seen


def apply(region_name, map_path):
    rules_path = os.path.join(ROOT, "public", "rules", f"{region_name} Region.json")
    with open(rules_path, encoding="utf-8") as f:
        region = json.load(f)
    with open(map_path, encoding="utf-8") as f:
        bmap = json.load(f)

    # index questions by id
    qindex = {}
    for c in region["conditions"]:
        for q in c.get("questions", []):
            qindex[q["id"]] = q

    applied, unmatched = 0, []
    for rule in bmap.get("rules", []):
        qid = rule["questionId"]
        val = rule["answerValue"]
        excl = rule.get("excludedConditions", []) or []
        dec = rule.get("decreaseLikelihood", []) or []
        if not excl and not dec:
            continue
        q = qindex.get(qid)
        if not q:
            unmatched.append(f"{qid} (no such question)")
            continue
        matched_opt = False
        for arr_name in ("options", "answers"):
            for o in q.get(arr_name, []):
                if o["value"] == val:
                    e = o["effects"]
                    if excl:
                        e["excludedConditions"] = merge_list(e.get("excludedConditions", []), excl)
                    if dec:
                        e["decreaseLikelihood"] = merge_list(e.get("decreaseLikelihood", []), dec)
                    matched_opt = True
        if matched_opt:
            applied += 1
        else:
            unmatched.append(f'{qid} answerValue="{val}" (no matching option)')

    with open(rules_path, "w", encoding="utf-8") as f:
        json.dump(region, f, indent=2, ensure_ascii=False)

    print(f"{region_name}: applied {applied} branching rules")
    if unmatched:
        print("  UNMATCHED (NOT applied — fix these):")
        for u in unmatched:
            print("   -", u)
    return applied, unmatched


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/apply_branching.py <RegionName> <branching_map.json>")
        sys.exit(1)
    apply(sys.argv[1], sys.argv[2])
