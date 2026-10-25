"""Check that the seven audited papers expose source evidence on phone width."""
import json
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "scripts/research/source_manifest.json").read_text(encoding="utf-8"))
ids = ("2501.13956", "2601.18642", "2604.14362", "2605.06527",
       "2606.30306", "2608.19652", "dekleer-1986-atms")
opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--disable-gpu")
opts.add_argument("--no-sandbox")
opts.add_argument("--window-size=390,844")

with webdriver.Chrome(options=opts) as browser:
    wait = WebDriverWait(browser, 12)
    for pid in ids:
        browser.get((ROOT / "papers" / pid / "index.html").as_uri())
        card = wait.until(lambda d: d.find_element(By.CSS_SELECTOR, ".paper-head .source-audit"))
        assert len(card.find_elements(By.CSS_SELECTOR, "tbody tr")) == 3, pid
        pdf = manifest["papers"][pid]
        assert card.find_element(By.CSS_SELECTOR, "a[href$='.pdf'], a[href*='/pdf/']").get_attribute("href") == pdf["fulltext_evidence"], pid
        assert pdf["fulltext_status"] == "primary_pdf_targeted_text_and_page_image_checked", pid
        assert browser.execute_script("return document.documentElement.scrollWidth <= innerWidth + 1"), pid + " phone overflow"
        assert "待覆核" not in browser.find_element(By.CSS_SELECTOR, ".reading-verification-note").text, pid
        assert "\\lambda" not in card.text and "\\exp" not in card.text, pid + " unrendered math"
        print(pid, "source card, provenance and phone width passed")
