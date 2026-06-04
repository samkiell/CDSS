"""
region_gen.py
=============
Generator for CDSS V2 branching region rules JSON.

Emits files structurally identical to public/rules/Lumbar Region.json:
- Each condition: { name, entry_criteria, is_general, source_line, questions[], tests[] }
- Each question:  { id, questionText, question, condition, category, inputType,
                    source_line, isGating, requiredConditions, excludedIfConditions,
                    options[], answers[] }
- options[] and answers[] are IDENTICAL (engine reads options||answers; frontend reads answers).
- Each option: { value, effects{ nextQuestionId, skipToQuestionId, triggeredConditions,
                 excludedConditions, increaseLikelihood, decreaseLikelihood,
                 redFlag, redFlagText, terminateAssessment, notes } }

The compact spec format (see build_hip / build_wrist / build_knee) keeps clinical
authoring readable while this module handles the verbose, duplication-prone JSON.

NOTE on the scoring idiom: the engine applies +15 per entry in increaseLikelihood.
To express a STRONG/CRITICAL signal (+30), list the condition name TWICE in the
increaseLikelihood list. This matches the existing engine (no weight field exists).
"""

import json
import os

EMPTY_EFFECTS = {
    "nextQuestionId": None,
    "skipToQuestionId": None,
    "triggeredConditions": [],
    "excludedConditions": [],
    "increaseLikelihood": [],
    "decreaseLikelihood": [],
    "redFlag": False,
    "redFlagText": None,
    "terminateAssessment": False,
    "notes": None,
}


def make_effects(
    next_q=None,
    skip_to=None,
    triggered=None,
    excluded=None,
    increase=None,
    decrease=None,
    red_flag=False,
    red_flag_text=None,
    terminate=False,
    notes=None,
):
    return {
        "nextQuestionId": next_q,
        "skipToQuestionId": skip_to,
        "triggeredConditions": triggered or [],
        "excludedConditions": excluded or [],
        "increaseLikelihood": increase or [],
        "decreaseLikelihood": decrease or [],
        "redFlag": red_flag,
        "redFlagText": red_flag_text,
        "terminateAssessment": terminate,
        "notes": notes,
    }


def opt(value, **effect_kwargs):
    """Build one option from a value and effect kwargs."""
    return {"value": value, "effects": make_effects(**effect_kwargs)}


def question(qid, text, condition, category, options, input_type="select",
             is_gating=False, required=None, excluded_if=None, source_line=0):
    """Build a full question. options/answers kept identical."""
    opts = []
    for o in options:
        if isinstance(o, dict):
            opts.append(o)
        else:
            # bare string => option with empty effects
            opts.append(opt(o))
    return {
        "id": qid,
        "questionText": text,
        "question": text,
        "condition": condition,
        "category": category,
        "inputType": input_type,
        "source_line": source_line,
        "isGating": is_gating,
        "requiredConditions": required or [],
        "excludedIfConditions": excluded_if or [],
        "options": opts,
        "answers": [json.loads(json.dumps(o)) for o in opts],  # deep copy
    }


def condition(name, questions, is_general=False, entry_criteria=None,
              tests=None, clinical_note=None, source_line=0):
    c = {
        "name": name,
        "entry_criteria": entry_criteria or [],
        "is_general": is_general,
        "source_line": source_line,
        "questions": questions,
    }
    if tests:
        c["tests"] = tests  # list of test-library ids (strings)
    if clinical_note:
        c["clinical_note"] = clinical_note
    return c


def region(region_key, title, source_file, conditions):
    return {
        "region": region_key,
        "title": title,
        "source_file": source_file,
        "extracted_at": "2026-06-04T00:00:00.000Z",
        "migrated_at": "2026-06-04T00:00:00.000Z",
        "engine_version": "v2-branching",
        "conditions": conditions,
    }


def write_region(region_obj, out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(region_obj, f, indent=2, ensure_ascii=False)
    # stats
    cond_count = len([c for c in region_obj["conditions"]])
    q_count = sum(len(c["questions"]) for c in region_obj["conditions"])
    return cond_count, q_count
