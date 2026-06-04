"""
rebuild_index.py — Rebuilds public/rules/index.json from the actual region JSON files.
Counts conditions (excluding the 'General Assessment' / is_general block, to match the
existing manifest convention where condition_count reflects diagnosable conditions) and
total questions. Preserves the General region entry.
"""
import json, os, glob

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
RULES_DIR = os.path.join(ROOT, "public", "rules")
INDEX = os.path.join(RULES_DIR, "index.json")

# Load existing index to preserve generated_at + any special entries (e.g. General Features)
with open(INDEX, encoding="utf-8") as f:
    existing = json.load(f)
existing_by_region = {r["region"]: r for r in existing.get("regions", [])}

regions = []
for path in sorted(glob.glob(os.path.join(RULES_DIR, "*.json"))):
    fname = os.path.basename(path)
    if fname == "index.json":
        continue
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if "region" not in data:
        continue
    conds = data.get("conditions", [])
    # Match the existing manifest convention: condition_count = ALL condition blocks
    # (the General/Initial Assessment block is counted, as in the original index.json).
    q_count = sum(len(c.get("questions", [])) for c in conds)
    regions.append({
        "region": data["region"],
        "title": data.get("title", data["region"].title()),
        "source_file": data.get("source_file", fname.replace(".json", ".docx")),
        "json_file": fname,
        "condition_count": len(conds),
        "question_count": q_count,
    })

# Preserve the synthetic "general" entry from the existing manifest if it isn't a file.
if "general" not in {r["region"] for r in regions} and "general" in existing_by_region:
    regions.append(existing_by_region["general"])

regions.sort(key=lambda r: r["region"])

out = {
    "generated_at": existing.get("generated_at", "2026-06-04T00:00:00.000Z"),
    "regions": regions,
}
with open(INDEX, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)

print("Rebuilt index.json:")
for r in regions:
    print(f"  {r['region']:10s} {r['condition_count']:2d} conditions  {r['question_count']:3d} questions  ({r['json_file']})")
