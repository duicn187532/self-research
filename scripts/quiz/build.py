"""Build papers/<id>/quiz.js from scripts/quiz/q_<name>.py, checking the bank against the page.

    python3 scripts/quiz/build.py            # every bank
    python3 scripts/quiz/build.py fademem    # one

A bank module defines BANK = { paper, title, sections: { chapter id: { tier, ask?, qs } }, boss: { qs } }.
Write each question with Q(id, facet, question, [right answer, wrong, wrong, ...], why, src). The right
answer goes first; battle.js shuffles the options every time. facet is "method" (方法理解), "reason"
(公式與情境推理) or "critique" (實驗批判); src lists the chapters that explain it (default: its own).

Checks, so a bank cannot drift from its page: unique ids, 3 or 4 options, every chapter and src id on
the page, every battle chapter has a 讀完這節 box, the BOSS asks 5 or 6 questions that each span two or
more chapters, and the BOSS and the bank as a whole cover all three facets. And so a reader cannot win by
picking the longest option: no answer may run past 1.4 times its longest distractor, and the answer may
be the longest option in at most half the questions. Keep the answer to its core claim and put the
detail in why; write each distractor as a specific, plausible statement the page shows to be wrong.
"""
import importlib
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
FACETS = {"method", "reason", "critique"}


def Q(id, facet, q, opts, why, src=None):
    return {"id": id, "facet": facet, "q": q, "opts": list(opts), "a": 0, "why": why, "src": list(src) if src else None}


def Sequence(id, facet, q, steps, why, src=None):
    """A click-to-order question; steps are stored in their scientifically correct order."""
    return {"id": id, "facet": facet, "kind": "sequence", "q": q,
            "steps": list(steps), "why": why, "src": list(src) if src else None}


def visible(text):
    """Length as read: a TeX span counts as two characters."""
    return len(re.sub(r"\\\(.*?\\\)", "xx", text))


def check(bank):
    page = (ROOT / "papers" / bank["paper"] / "index.html").read_text(encoding="utf-8")
    ids = set(re.findall(r'<section class="sec[^"]*" id="([^"]+)"', page))
    seen, problems, facets = set(), [], set()

    def one(q, where):
        if q["id"] in seen:
            problems.append(f"duplicate id {q['id']}")
        seen.add(q["id"])
        if q["facet"] not in FACETS:
            problems.append(f"{q['id']}: facet {q['facet']}")
        facets.add(q["facet"])
        if q.get("kind") == "sequence":
            steps = q.get("steps", [])
            if not 3 <= len(steps) <= 5 or len(set(steps)) != len(steps):
                problems.append(f"{q['id']}: needs 3 to 5 distinct ordered steps")
            if "opts" in q or "a" in q:
                problems.append(f"{q['id']}: sequence must not have choice answers")
        else:
            opts = q.get("opts", [])
            if not 3 <= len(opts) <= 4 or len(set(opts)) != len(opts):
                problems.append(f"{q['id']}: needs 3 or 4 distinct options")
            else:
                # The right answer must not stand out by length.
                lens = [visible(o) for o in opts]
                if lens[0] > 1.4 * max(lens[1:]):
                    problems.append(f"{q['id']}: the answer ({lens[0]}) is much longer than every distractor ({max(lens[1:])})")
        for s in q["src"] or [where]:
            if s not in ids:
                problems.append(f"{q['id']}: src {s} not on the page")

    for sec, c in bank["sections"].items():
        if sec not in ids:
            problems.append(f"chapter {sec} not on the page")
        elif not re.search(r'id="' + re.escape(sec) + r'".*?data-done="' + re.escape(sec) + '"', page, re.S):
            problems.append(f"chapter {sec} has no 讀完這節 box")
        if c.get("tier", "normal") not in ("normal", "elite"):
            problems.append(f"{sec}: tier {c.get('tier')}")
        if not c["qs"]:
            problems.append(f"{sec}: no questions")
        if c.get("tier") == "elite" and min(c.get("ask", len(c["qs"])), len(c["qs"])) < 3:
            problems.append(f"{sec}: an elite asks at least 3")
        for q in c["qs"]:
            one(q, sec)
            if q["src"] is None:
                q["src"] = [sec]
    boss = bank["boss"]["qs"]
    if not 5 <= len(boss) <= 6:
        problems.append("the BOSS asks 5 or 6 questions")
    for q in boss:
        one(q, "s-boss")
        if not q["src"] or len(set(q["src"])) < 2:
            problems.append(f"{q['id']}: a BOSS question spans two or more chapters")
    if {q["facet"] for q in boss} != FACETS:
        problems.append("the BOSS covers all three facets")
    if facets != FACETS:
        problems.append("the bank covers all three facets")
    qs = [q for c in bank["sections"].values() for q in c["qs"]] + boss
    choice_qs = [q for q in qs if q.get("kind") != "sequence"]
    longest = sum(1 for q in choice_qs if visible(q["opts"][0]) > max(visible(o) for o in q["opts"][1:]))
    if longest > 0.5 * len(choice_qs):
        problems.append(f"the answer is the longest option in {longest} of {len(qs)} questions")
    return problems


def build(name):
    sys.path.insert(0, str(HERE))
    bank = importlib.import_module("q_" + name).BANK
    problems = check(bank)
    if problems:
        print(f"{name}: " + "; ".join(problems))
        return False
    out = ROOT / "papers" / bank["paper"] / "quiz.js"
    n = sum(len(c["qs"]) for c in bank["sections"].values()) + len(bank["boss"]["qs"])
    out.write_text("// Built by scripts/quiz/build.py from scripts/quiz/q_" + name + ".py; edit that file, not this one.\n"
                   "window.STUDY_QUIZ = " + json.dumps(bank, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"{name}: {len(bank['sections'])} chapters, {n} questions -> papers/{bank['paper']}/quiz.js")
    return True


if __name__ == "__main__":
    names = sys.argv[1:] or sorted(p.stem[2:] for p in HERE.glob("q_*.py"))
    ok = all([build(n) for n in names])
    raise SystemExit(0 if ok else 1)
