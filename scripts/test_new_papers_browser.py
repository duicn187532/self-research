"""Headless Chrome smoke check for the two new lessons and their core interactions."""
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

ROOT = Path(__file__).resolve().parents[1]
opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--disable-gpu")
opts.add_argument("--no-sandbox")
opts.add_argument("--window-size=1280,900")

with webdriver.Chrome(options=opts) as browser:
    wait = WebDriverWait(browser, 12)
    for pid in ("2604.20006", "2610.09008"):
        scene = "leafre" if pid == "2604.20006" else "nautilus"
        browser.get((ROOT / "index.html").as_uri() + "#quest-" + pid)
        browser.execute_script("localStorage.setItem('study:skin', JSON.stringify('maple'))")
        browser.refresh()
        wait.until(lambda d: d.execute_script("return document.body.getAttribute('data-map-scene')") == scene)
        wait.until(lambda d: d.execute_script("return document.querySelector('.world-scene img')?.naturalWidth > 0"))
        assert "scene-" + scene + ".jpg" in browser.execute_script(
            "return getComputedStyle(document.body, '::after').backgroundImage"
        )
        browser.get((ROOT / "papers" / pid / "index.html").as_uri())
        wait.until(lambda d: d.find_element(By.ID, "reading-lab"))
        browser.execute_script("localStorage.setItem('study:skin', JSON.stringify('maple'))")
        browser.refresh()
        wait.until(lambda d: d.execute_script("return document.body.getAttribute('data-map-scene')") == scene)
        background = browser.execute_script("return getComputedStyle(document.body, '::after').backgroundImage")
        assert "scene-" + scene + ".jpg" in background, (pid, background)
        assert browser.execute_async_script("""
            const done = arguments[0];
            const bg = getComputedStyle(document.body, '::after').backgroundImage;
            const url = bg.slice(5, -2);
            const image = new Image();
            image.onload = () => done(image.naturalWidth > 0);
            image.onerror = () => done(false);
            image.src = url;
        """), pid + " background image failed to load"
        assert browser.find_element(By.CSS_SELECTOR, "[data-paper]").get_attribute("data-paper") == pid
        assert browser.find_element(By.CSS_SELECTOR, "body").get_attribute("data-map-scene") == scene
        assert len(browser.find_elements(By.CSS_SELECTOR, ".paper-source")) == 15
        assert browser.execute_script("""
            return [...document.querySelectorAll('section.sec:not(.sec-boss):not(.sec-research):not(#s-overview):not(#s-glossary):not(#s-export)')]
                .every(section => section.querySelector('.paper-source') && section.querySelector('.paper-source').compareDocumentPosition(section.querySelector('.explain')) & Node.DOCUMENT_POSITION_FOLLOWING)
        """), pid + " lacks source-first chapter analysis"
        assert len(browser.find_elements(By.CSS_SELECTOR, "section.sec input[data-done]")) == 18
        assert browser.find_element(By.ID, "boss-board")
        assert len(browser.find_elements(By.CSS_SELECTOR, "#reading-lab .reading-dim")) == 5
        assert len(browser.find_elements(By.CSS_SELECTOR, "section.sec .battle")) == 15
        core = "s-fama" if pid == "2604.20006" else "s-key"
        browser.execute_script("document.querySelector('#' + arguments[0] + ' .bt-go').click()", core)
        assert browser.execute_script("return document.querySelector('#' + arguments[0] + ' .bt-q').textContent.length > 3", core)
        assert browser.execute_script("return document.querySelectorAll('#' + arguments[0] + ' .bt-opts button').length >= 3", core)
        if pid == "2604.20006":
            wait.until(lambda d: "0.583" in d.execute_script("return document.getElementById('fama-out').textContent"))
            browser.execute_script("document.getElementById('fah').value='2'; document.getElementById('fah').dispatchEvent(new Event('input',{bubbles:true}))")
            assert "0.750" in browser.execute_script("return document.getElementById('fama-out').textContent")
            browser.execute_script("document.getElementById('fah').value='3'; document.getElementById('fah').dispatchEvent(new Event('input',{bubbles:true}))")
            assert "不能大於總數" in browser.execute_script("return document.getElementById('fama-out').textContent")
        else:
            wait.until(lambda d: "可作為" in d.execute_script("return document.getElementById('scope-result').textContent"))
            browser.execute_script("document.getElementById('scope-owner').value='plan'; document.getElementById('scope-owner').dispatchEvent(new Event('change',{bubbles:true}))")
            assert "不能把" in browser.execute_script("return document.getElementById('scope-result').textContent")
            browser.execute_script("document.getElementById('scope-query').value='plan'; document.getElementById('scope-query').dispatchEvent(new Event('change',{bubbles:true}))")
            assert "可作為" in browser.execute_script("return document.getElementById('scope-result').textContent")
        browser.set_window_size(390, 844)
        assert browser.execute_script("return document.documentElement.scrollWidth <= innerWidth + 1"), pid + " overflows phone viewport"
        assert "scene-" + scene + "-sm.jpg" in browser.execute_script(
            "return getComputedStyle(document.body, '::after').backgroundImage"
        )
        wait.until(lambda d: d.execute_script("return document.querySelectorAll('mjx-container').length >= 5"))
        assert browser.execute_script("return document.querySelectorAll('mjx-merror').length === 0"), pid + " math parse error"
        browser.set_window_size(1280, 900)
        print(pid, "browser interactions and mobile width passed")
