"""Regenerate every paper's 研究者進階分析 section (s-research) from the rd_*.py data files.

    python3 scripts/research/run.py            # from the repo root
    python3 scripts/research/build_legacy_audits.py  # seven source-first cards
    python3 scripts/research/build_compare.py  # then the workbench, compare/index.html
    python3 scripts/stamp_assets.py

Each rd_<paper>.py holds the content as a dict (method, repro, claims, hypo); rg_lib.py renders it.
"""
import sys, importlib, os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.chdir(os.path.dirname(os.path.dirname(HERE)))
import rg_lib
for name in ["rd_zep", "rd_fademem", "rd_apex", "rd_stale", "rd_alwayson", "rd_statemem", "rd_atms"]:
    d = importlib.import_module(name).DATA
    rg_lib.insert(d["page"], rg_lib.render(d))
    print("updated", d["page"])
