/* Optional, offline-first learning sync for GitHub Pages. No build step. */
(function () {
  'use strict';
  if (window.StudySyncV1) return;
  window.StudySyncV1 = true;
  var scriptUrl = document.currentScript && document.currentScript.src;
  var mapleArt = new URL('maple/', scriptUrl).href;
  var scope = scriptUrl && scriptUrl.indexOf('/shared/') !== -1 ? 'os-lab' : 'self-research';
  var configUrl = new URL('study-sync-config.js', scriptUrl).href;
  var ownerKey = '__study_sync_owner_v1:' + scope;
  var userId = null, client = null, session = null, syncing = false, needsReload = false;
  var meta = {}, conflicts = {}, status = '', initial = true, lastSync = 0, initialized = false;
  var pendingTimer = null;
  var ui = {}, known = null;
  var schema = 'study_sync_entries';

  function read(key, fallback) {
    try { var x = localStorage.getItem(key); return x === null ? fallback : JSON.parse(x); }
    catch (_) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function raw(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function storageKey() { return '__study_sync_meta_v1:' + scope + ':' + userId; }
  function valid(k) {
    if (scope === 'self-research') return k.indexOf('study:') === 0;
    var fixed = ['os_lab_2026_v1', 'dsa.progress', 'ailab.progress',
      'dm_lab_progress_v1', 'ics.progress', 'net.progress', 'co-lab-v1',
      'la-lab-v1', 'asm-done'];
    return fixed.indexOf(k) !== -1 || k.indexOf('cslab.code.v1.') === 0 ||
      !!(window.CSLAB_COURSE && k === window.CSLAB_COURSE.storageKey);
  }
  function entries() {
    var result = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && valid(k)) result[k] = localStorage.getItem(k);
      }
    } catch (_) { /* storage blocked */ }
    return result;
  }
  function localSet(key, value) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    needsReload = true; // Existing lesson apps cache storage in memory.
  }
  function equal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function parse(s) { try { return JSON.parse(s); } catch (_) { return undefined; } }
  function fail() { throw Error('CONFLICT'); }
  function mergeDeep(a, b, path) {
    if (equal(a, b)) return a;
    if (a === undefined || a === null) return b;
    if (b === undefined || b === null) return a;
    if (path === 'last' || path === 'theme' || path === 'study:level' ||
        path === 'study:mode' || path === 'study:skin' ||
        path === 'study:hero' || path === 'study:focus-reading') return b;
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      if (/done|solved|complete/.test(path)) return a || b;
      fail();
    }
    if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
    if (Array.isArray(a) && Array.isArray(b)) {
      if (path.indexOf(':qstat.') !== -1) {
        if (a.length !== b.length) fail();
        return a.map(function (x, i) {
          // Slot 2 means "most recent answer was right". Without answer timestamps,
          // two disagreeing devices cannot prove which answer came last.
          return i === 2 && x !== b[i] ? 0 : mergeDeep(x, b[i], path + '.' + i);
        });
      }
      var z = a.slice();
      b.forEach(function (x) { if (!z.some(function (y) { return equal(x, y); })) z.push(x); });
      return z;
    }
    if (typeof a === 'object' && typeof b === 'object' &&
        !Array.isArray(a) && !Array.isArray(b)) {
      if (typeof a.at === 'number' && typeof b.at === 'number' && a.at !== b.at)
        return a.at > b.at ? a : b;
      var out = {}, keys = new Set(Object.keys(a).concat(Object.keys(b)));
      keys.forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(a, k) &&
            Object.prototype.hasOwnProperty.call(b, k))
          out[k] = mergeDeep(a[k], b[k], path + '.' + k);
        else out[k] = Object.prototype.hasOwnProperty.call(b, k) ? b[k] : a[k];
      });
      return out;
    }
    fail(); // Text notes and program drafts require explicit resolution.
  }
  // Normalize historic cloud records before merging with the shorter job names.
  var LEGACY_PROFILE_JOBS = {
    "時序織網師":"時序行者",
    "遺忘調律師":"忘卻之羽",
    "記憶錨定師":"永恆之錨",
    "過期記憶偵查員":"破妄者",
    "狀態追蹤師":"變界旅人",
    "常駐智能體守護者":"不眠守望",
    "真值維護師":"真理之眼"
  };
  function canonicalProfileJob(title) {
    return typeof title === 'string' ? (LEGACY_PROFILE_JOBS[title] || title) : '';
  }
  function mergeStudyProfile(cloudValue, localValue) {
    var remote = parse(cloudValue), local = parse(localValue);
    if (!remote || !local || Array.isArray(remote) || Array.isArray(local) ||
        typeof remote !== 'object' || typeof local !== 'object') fail();
    var a = typeof remote.displayId === 'string' ? remote.displayId : '';
    var b = typeof local.displayId === 'string' ? local.displayId : '';
    if (a && b && a !== b) fail(); // Do not silently overwrite two different names.
    var unlock = [];
    [remote.unlockedJobs, local.unlockedJobs].forEach(function (list) {
      if (Array.isArray(list)) list.forEach(function (job) {
        job = canonicalProfileJob(job);
        if (job && unlock.indexOf(job) < 0) unlock.push(job);
      });
    });
    var r = canonicalProfileJob(remote.activeJob) || '初心者';
    var l = canonicalProfileJob(local.activeJob) || '初心者';
    if (r !== l && r !== '初心者' && l !== '初心者') fail();
    var active = r !== '初心者' ? r : l;
    if (active !== '初心者' && unlock.indexOf(active) < 0) active = '初心者';
    return JSON.stringify({ displayId:a || b, activeJob:active, unlockedJobs:unlock });
  }
  function mergeValues(key, cloudValue, localValue) {
    if (cloudValue === localValue) return cloudValue;
    if (cloudValue === null || localValue === null) fail();
    if (key === 'study:profile') return mergeStudyProfile(cloudValue, localValue);
    var a = parse(cloudValue), b = parse(localValue);
    if (a === undefined || b === undefined) fail();
    if (/:last$/.test(key) && a && b && typeof a.id === 'string' && typeof b.id === 'string' &&
        Number.isFinite(a.at) && Number.isFinite(b.at))
      return a.at > b.at ? cloudValue : localValue;
    if (key === 'study:quest:fademem-v1' || key === 'study:quest:fademem-v2') {
      var questVersion = key.slice(-1) === '2' ? 2 : 1;
      if (!a || !b || typeof a !== 'object' || typeof b !== 'object' ||
          Array.isArray(a) || Array.isArray(b) || a.version !== questVersion || b.version !== questVersion) fail();
      var required = [];
      if (questVersion === 1) [a.required, b.required].forEach(function (xs) { if (Array.isArray(xs)) xs.forEach(function (id) {
        if (typeof id === 'string' && required.indexOf(id) < 0) required.push(id);
      }); });
      var quest = { version:questVersion, accepted:!!(a.accepted || b.accepted),
        reported:!!(a.reported || b.reported),
        acceptedAt:[a.acceptedAt,b.acceptedAt].filter(Boolean).sort()[0] || '',
        reportedAt:[a.reportedAt,b.reportedAt].filter(Boolean).sort().pop() || '' };
      if (questVersion === 1) { quest.required = required; quest.total = required.length; }
      return JSON.stringify(quest);
    }
    // Do not silently choose one side for free-form writing.
    if (typeof a === 'string' || typeof b === 'string') fail();
    return JSON.stringify(mergeDeep(a, b, key));
  }
  function message(text) { status = text; render(); }
  function styleUi() {
    var style = document.createElement('style');
    style.textContent =
      /* Place the control in the existing sticky top bar, not over lesson content. */
      '#study-sync-root{display:inline-flex;align-items:center;flex:0 0 auto;font:inherit;min-width:0}' +
      '#study-sync-root button{cursor:pointer;font:inherit}' +
      '#study-sync-root .ss-trigger{display:inline-flex;align-items:center;justify-content:center;gap:.35rem;min-height:2.25rem;padding:0 .8rem;' +
        'border:1px solid var(--rule,#9baac2);border-radius:999px;background:var(--paper,#fff);color:var(--ink,#182235);' +
        'white-space:nowrap;font-size:var(--step--1,.85rem)}' +
      '#study-sync-root .ss-trigger[aria-expanded="true"]{border-color:var(--accent,#347b78);color:var(--accent,#347b78)}' +
      ':root[data-skin="maple"] #study-sync-root .ss-trigger{min-height:34px;height:34px;padding:0 10px;border-style:solid;border-width:2px 3px;' +
        'border-radius:0;background:none;border-image:url("' + mapleArt + 'bt-orange-normal.png") 2 3 fill / 2px 3px stretch;' +
        'color:#fff;font-weight:800;text-shadow:-1px 0 #8a3c00,1px 0 #8a3c00,0 -1px #8a3c00,0 1px #8a3c00}' +
      ':root[data-skin="maple"] #study-sync-root .ss-trigger:hover{border-image-source:url("' + mapleArt + 'bt-orange-hover.png")}' +
      ':root[data-skin="maple"] #study-sync-root .ss-trigger[aria-expanded="true"]{border-image-source:url("' + mapleArt + 'bt-orange-pressed.png");color:#fff}' +
      ':root[data-skin="maple"] #study-sync-root .ss-icon{display:inline-block;width:16px;height:16px;flex:none;font-size:0;' +
        'background:url("' + mapleArt + 'leaf.png") center / contain no-repeat}' +
      '#study-sync-root .ss-trigger:focus-visible,#study-sync-root .ss-panel button:focus-visible{outline:2px solid var(--accent,#347b78);outline-offset:2px}' +
      '#study-sync-root .ss-panel{position:absolute;top:100%;right:max(12px,env(safe-area-inset-right,0px));' +
        'z-index:30;box-sizing:border-box;width:min(340px,calc(100vw - 24px));max-height:min(75vh,650px);overflow-y:auto;' +
        'margin-top:.4rem;padding:14px;border:1px solid var(--rule,#9baac2);border-radius:var(--radius,12px);' +
        'background:var(--surface,#fff);color:var(--ink,#182235);box-shadow:var(--shadow,0 8px 36px #0005);' +
        'font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere}' +
      '#study-sync-root .ss-panel[hidden]{display:none}' +
      '#study-sync-root .ss-panel button{padding:7px 10px;border:1px solid var(--rule,#9baac2);border-radius:8px;' +
        'background:var(--paper,#fff);color:var(--ink,#182235)}' +
      '#study-sync-root button:disabled{opacity:.5;cursor:not-allowed}' +
      '#study-sync-root .ss-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}' +
      '#study-sync-root .ss-status{font-size:12px;margin:9px 0;color:var(--muted,#394962);overflow-wrap:anywhere}' +
      '#study-sync-root .ss-conflict{padding:8px;border:1px solid #d49a59;border-radius:6px;margin:8px 0;overflow-wrap:anywhere}' +
      '#study-sync-root .ss-recovery{margin-top:12px;padding:10px;border:1px solid #d49a59;border-radius:7px;background:var(--paper,#f8f7e7);color:var(--ink,#182235);font-size:12px}' +
      '#study-sync-root .ss-recovery[hidden]{display:none}' +
      '#study-sync-root .ss-recovery p{margin:5px 0 8px}' +
      '#study-sync-root .ss-recovery select{width:100%;min-height:36px;max-width:100%;padding:5px;border:1px solid #9baac2;border-radius:5px;background:#fff;color:#182235;font:inherit}' +
      '#study-sync-root .ss-heading{font-weight:700;font-size:16px}' +
      '#study-sync-root .ss-id-form{display:grid;gap:6px;padding:9px 0;border-block:1px solid var(--rule,#9baac2)}' +
      '#study-sync-root .ss-id-form[hidden]{display:none}' +
      '#study-sync-root .ss-id-form label{font-weight:700}' +
      '#study-sync-root .ss-id-form input{box-sizing:border-box;width:100%;min-height:38px;padding:6px 8px;' +
        'border:1px solid var(--rule,#9baac2);border-radius:5px;background:var(--surface,#fff);color:var(--ink,#182235);font:inherit}' +
      '#study-sync-root .ss-id-form small{color:var(--muted,#394962)}' +
      '#study-sync-root .ss-job-form{display:grid;gap:6px;padding:9px 0;border-bottom:1px solid var(--rule,#9baac2)}' +
      '#study-sync-root .ss-job-form label{font-weight:700}' +
      '#study-sync-root .ss-job-form select{box-sizing:border-box;width:100%;min-height:38px;padding:5px 8px;border:1px solid var(--rule,#9baac2);border-radius:5px;background:var(--surface,#fff);color:var(--ink,#182235);font:inherit}' +
      '#study-sync-root .ss-job-form small{color:var(--muted,#394962)}' +
      '@media(max-width:600px){#study-sync-root .ss-label{display:inline-block;max-width:7ch;overflow:hidden;text-overflow:ellipsis}' +
        '#study-sync-root .ss-trigger{min-width:2.25rem;padding:0 .55rem}' +
        '#study-sync-root .ss-panel{font-size:14px}}' +
      '@media(max-width:380px){#study-sync-root .ss-trigger{min-width:2rem;padding:0 .35rem}' +
        '.toolbar-inner:has(#study-sync-root) .levels .seg button{padding:0 .3rem}}';
    document.head.appendChild(style);
  }
  function el(tag, cls, text) {
    var x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text !== undefined) x.textContent = text;
    return x;
  }
  function button(text, fn) {
    var x = el('button', '', text);
    x.type = 'button'; x.addEventListener('click', fn); return x;
  }
  // StudyProfile owns the portable profile; Supabase metadata is legacy fallback for old IDs.
  function profileApi() { return window.StudyProfile || null; }
  function profileData() {
    var api = profileApi();
    return api ? api.get() : { displayId:"", activeJob:"初心者", unlockedJobs:[] };
  }
  function metadataId() {
    var data = session && session.user && session.user.user_metadata;
    var id = data && data.study_display_id;
    return typeof id === 'string' && /^[\p{L}\p{N}_-]{2,20}$/u.test(id) ? id : '';
  }
  function displayId() { return profileData().displayId || metadataId(); }
  function refreshJobChoices() {
    if (!ui.jobSelect || !profileApi()) return;
    var p = profileData(), options = ['初心者'].concat(p.unlockedJobs);
    if (ui.jobSelect.options.length !== options.length ||
        Array.from(ui.jobSelect.options).some(function (o, i) { return o.value !== options[i]; })) {
      ui.jobSelect.replaceChildren();
      options.forEach(function (job) {
        var option = el('option', '', job);
        option.value = job;
        ui.jobSelect.appendChild(option);
      });
    }
    ui.jobSelect.value = p.activeJob;
    ui.jobSelect.disabled = p.unlockedJobs.length === 0;
    ui.jobNote.textContent = p.unlockedJobs.length ?
      '已解鎖 ' + p.unlockedJobs.length + ' 個研究職業，可自由裝備已獲得的稱號。' :
      '尚未完成整篇論文，職業為「初心者」。完成所有研讀章節即可解鎖。';
  }
  async function saveDisplayId(event) {
    event.preventDefault();
    var id = ui.idInput.value.trim().normalize('NFKC');
    if (!/^[\p{L}\p{N}_-]{2,20}$/u.test(id)) {
      message('ID 須為 2–20 字，可用中英文字、數字、底線或連字號。'); return;
    }
    ui.idSubmit.disabled = true;
    try {
      if (userId && client) {
        // Keep legacy metadata for older clients. Never save on failure.
        var result = await client.auth.updateUser({ data: { study_display_id: id } });
        if (result.error) throw result.error;
        session = { user: result.data.user };
      }
      if (!profileApi() || !profileApi().setDisplayId(id)) throw Error('無法儲存角色資料');
      message(userId ? '冒險者 ID 已儲存，將同步至其他裝置。' : '冒險者 ID 已儲存在本機；登入後可跨裝置同步。');
      if (userId) sync(true);
    } catch (e) { message('ID 儲存失敗：' + e.message); }
    finally { ui.idSubmit.disabled = false; }
  }
  function selectJob() {
    var api = profileApi();
    if (!api || !api.setActiveJob(ui.jobSelect.value)) {
      message('此職業尚未解鎖。');
      refreshJobChoices();
      return;
    }
    message('已裝備研究職業「' + ui.jobSelect.value + '」！');
    if (userId) sync(true);
  }
  function migrateLegacyId() {
    var api = profileApi();
    if (!api || !userId || !metadataId()) return;
    // Existing users stored their display ID in auth.user_metadata. Preserve it
    // when adopting the portable study:profile instead of resetting it.
    if (!api.get().displayId) api.setDisplayId(metadataId());
  }
  function render() {
    if (!ui.root) return;
    var id = displayId();
    var labelText = userId ? '已登入' : '登入';
    ui.labelText.textContent = labelText;
    ui.label.setAttribute('aria-label', userId ? '冒險者 ID：' + labelText + '；學習同步設定' : '登入與學習同步');
    ui.label.title = userId ? '冒險者 ID：' + labelText : '登入與學習同步';
    ui.status.textContent = status || (userId ? '已登入，進度將同步至雲端。' : '未登入：學習進度只保留在此瀏覽器。');
    ui.identity.textContent = userId ? ('已登入 · 冒險者 ID：' + (id || '尚未設定')) : '訪客模式 · ' + (id || '未命名冒險者');
    ui.guideText.textContent = userId ? '已辨識冒險者身分！可在這裡檢查雲端存檔。' : '歡迎來到公會！登入後即可跨裝置接續精讀任務。';
    ui.idForm.hidden = false;
    refreshJobChoices();
    if (document.activeElement !== ui.idInput) ui.idInput.value = id;
    ui.github.hidden = !!userId || !client;
    ui.google.hidden = !!userId || !client;
    ui.logout.hidden = !userId;
    ui.now.hidden = !userId;
    ui.reload.hidden = !needsReload;
    ui.offline.hidden = !!client;
    renderRecovery();
    ui.conflicts.replaceChildren();
    var keys = Object.keys(conflicts);
    if (keys.length) {
      ui.conflicts.appendChild(el('strong', '', '有 ' + keys.length + ' 筆衝突，未覆蓋任何一方：'));
      keys.forEach(function (key) {
        var row = el('div', 'ss-conflict');
        row.appendChild(el('div', '', key));
        var actions = el('div', 'ss-actions');
        actions.appendChild(button('保留本機版本', function () { resolve(key, 'local'); }));
        actions.appendChild(button('採用雲端版本', function () { resolve(key, 'remote'); }));
        row.appendChild(actions);
        ui.conflicts.appendChild(row);
      });
    }
  }
  function createUi() {
    if (!document.body) return;
    styleUi();
    ui.root = el('div'); ui.root.id = 'study-sync-root';
    var panel = el('section', 'ss-panel'); panel.hidden = true;
    panel.setAttribute('aria-label', '學習進度同步');
    panel.appendChild(el('div', 'ss-heading', '學習進度同步'));
    var guide = el('div', 'ss-guide');
    var npc = el('img'); npc.src = mapleArt + 'spr-npc-robin-stand.png';
    npc.alt = '冒險者公會的存檔管理員'; npc.loading = 'lazy';
    guide.appendChild(npc);
    var dialogue = el('div', 'ss-guide-text');
    dialogue.appendChild(el('div', 'ss-guide-title', '冒險者公會 · 存檔管理員'));
    ui.guideText = el('div', '', '登入後即可在不同裝置接續精讀任務。');
    dialogue.appendChild(ui.guideText);
    guide.appendChild(dialogue);
    panel.appendChild(guide);
    ui.identity = el('div', 'ss-status');
    ui.status = el('div', 'ss-status');
    ui.offline = el('div', 'ss-status', '尚未設定 Supabase；目前維持原有訪客儲存模式。');
    panel.appendChild(ui.identity);
    panel.appendChild(ui.status);
    panel.appendChild(ui.offline);
    ui.idForm = el('form', 'ss-id-form');
    var idLabel = el('label', '', '冒險者 ID'); idLabel.htmlFor = 'study-display-id';
    ui.idInput = el('input'); ui.idInput.id = 'study-display-id'; ui.idInput.type = 'text';
    ui.idInput.maxLength = 20; ui.idInput.autocomplete = 'nickname';
    ui.idSubmit = el('button', '', '儲存 ID'); ui.idSubmit.type = 'submit';
    ui.idForm.appendChild(idLabel); ui.idForm.appendChild(ui.idInput);
    ui.idForm.appendChild(el('small', '', '2–20 字；可用中英文字、數字、_ 或 -。只用來顯示，不改登入方式。'));
    ui.idForm.appendChild(ui.idSubmit);
    ui.idForm.addEventListener('submit', saveDisplayId);
    panel.appendChild(ui.idForm);
    var jobRow = el('div', 'ss-job-form');
    var jobLabel = el('label', '', '研究職業（成就稱號）');
    jobLabel.htmlFor = 'study-active-job';
    ui.jobSelect = el('select'); ui.jobSelect.id = 'study-active-job';
    ui.jobSelect.addEventListener('change', selectJob);
    ui.jobNote = el('small', '', '完成整篇論文後，即可解鎖研究職業。');
    jobRow.appendChild(jobLabel);
    jobRow.appendChild(ui.jobSelect);
    jobRow.appendChild(ui.jobNote);
    panel.appendChild(jobRow);
    var actions = el('div', 'ss-actions');
    ui.github = button('GitHub 登入', function () { login('github'); });
    ui.google = button('Google 登入', function () { login('google'); });
    ui.logout = button('安全登出', logout);
    ui.now = button('立即同步', function () { sync(true); });
    ui.reload = button('重新載入套用', function () { location.reload(); });
    actions.appendChild(ui.github); actions.appendChild(ui.google);
    actions.appendChild(ui.now); actions.appendChild(ui.reload);
    actions.appendChild(ui.logout);
    actions.appendChild(button('匯出本機與衝突備份', backup));
    panel.appendChild(actions);
    ui.recoveryBox = el('div', 'ss-recovery');
    ui.recoveryBox.hidden = true;
    ui.recoveryBox.appendChild(el('strong', '', '歷史存檔救援'));
    ui.recoveryBox.appendChild(el('p', '', '若登出後進度歸零，請選登出前的存檔進行安全合併。'));
    ui.recoverySelect = el('select');
    ui.recoverySelect.setAttribute('aria-label', '選擇歷史存檔');
    ui.recoveryBox.appendChild(ui.recoverySelect);
    var recoverActions = el('div','ss-actions');
    recoverActions.appendChild(button('預覽並下載存檔', function () {
      var snap = read(ui.recoverySelect.value, null);
      if (snap) downloadRecovery(snap, 'self-research-recovery.json');
    }));
    recoverActions.appendChild(button('合併恢復進度', restoreSnapshot));
    ui.recoveryBox.appendChild(recoverActions);
    panel.appendChild(ui.recoveryBox);
    ui.conflicts = el('div');
    panel.appendChild(ui.conflicts);
    panel.id = 'study-sync-panel';
    ui.label = button('', function () {
      panel.hidden = !panel.hidden;
      ui.label.setAttribute('aria-expanded', String(!panel.hidden));
    });
    ui.label.className = 'ss-trigger';
    ui.label.setAttribute('aria-controls', panel.id);
    ui.label.setAttribute('aria-haspopup', 'true');
    ui.label.setAttribute('aria-expanded', 'false');
    ui.label.appendChild(el('span', 'ss-icon', '☁'));
    ui.labelText = el('span', 'ss-label', '登入');
    ui.label.appendChild(ui.labelText);
    ui.root.appendChild(ui.label);
    ui.root.appendChild(panel);
    var toolbar = document.querySelector('.toolbar .toolbar-inner');
    if (toolbar) toolbar.appendChild(ui.root);
    else {
      // Safety fallback for unusual pages without a toolbar.
      ui.root.style.cssText = 'position:fixed;right:12px;top:12px;z-index:50';
      ui.root.appendChild(panel);
      document.body.appendChild(ui.root);
    }
    document.addEventListener('click', function (event) {
      if (!panel.hidden && !ui.root.contains(event.target)) {
        panel.hidden = true;
        ui.label.setAttribute('aria-expanded', 'false');
      }
    });
    ui.root.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        ui.label.setAttribute('aria-expanded', 'false');
        ui.label.focus();
      }
    });
    render();
  }
  // A previous sign-out saved durable local snapshots. Keep them available to the
  // authenticated owner, even if a later (buggy) sync erased the live progress.
  function recoverySnapshots() {
    if (!userId) return [];
    var prefixes = [
      '__study_sync_logout_backup:' + scope + ':' + userId + ':',
      '__study_sync_account_switch_backup:' + scope + ':' + userId + ':',
      '__study_sync_first_backup:' + scope + ':' + userId
    ];
    var result = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key || !prefixes.some(function (p) { return key.indexOf(p) === 0; })) continue;
        var snap = read(key, null);
        if (!snap || !snap.entries || typeof snap.entries !== 'object') continue;
        var count = Object.keys(snap.entries).filter(valid).length;
        if (!count) continue;
        var progress = Object.keys(snap.entries).reduce(function (n, k) {
          if (!/:done$/.test(k)) return n;
          var list = parse(snap.entries[k]);
          return n + (Array.isArray(list) ? list.length : 0);
        }, 0);
        result.push({ key:key, when:snap.exported || '', keys:count, progress:progress });
      }
    } catch (_) { /* browser may block storage enumeration */ }
    result.sort(function (a,b) {
      // Suggest the most complete historical snapshot first, not the newest empty one.
      return b.progress - a.progress || b.keys - a.keys || (a.key < b.key ? 1 : -1);
    });
    return result;
  }
  function meaningful(value) {
    if (value === null || value === undefined) return false;
    var parsed = parse(value);
    if (Array.isArray(parsed)) return parsed.length > 0;
    if (parsed && typeof parsed === 'object') return Object.keys(parsed).length > 0;
    if (typeof parsed === 'string') return parsed.trim().length > 0;
    if (typeof parsed === 'number') return parsed !== 0;
    return !!parsed;
  }
  function downloadRecovery(snapshot, filename) {
    var url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], {type:'application/json'}));
    var anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename;
    anchor.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function restoreSnapshot() {
    if (!userId || !ui.recoverySelect) return;
    var key = ui.recoverySelect.value;
    var choice = recoverySnapshots().find(function (s) { return s.key === key; });
    var snap = choice && read(key, null);
    if (!snap || !snap.entries) { message('找不到選取的存檔。'); return; }
    var incoming = snap.entries;
    var howMany = Object.keys(incoming).filter(valid).length;
    if (!window.confirm('要從此歷史存檔合併 ' + howMany + ' 筆學習資料嗎？\n'
      + '不會刪除目前內容；若筆記有不同內容，保留目前版本。\n'
      + '操作前會保存一份本機快照。')) return;
    // Persistent undo point, created BEFORE touching any lesson keys.
    var safetyKey = '__study_sync_before_restore:' + scope + ':' + userId + ':' + Date.now();
    var before = { exported:new Date().toISOString(), entries:entries() };
    if (!write(safetyKey, before)) {
      message('無法建立還原前備份，已停止操作。'); return;
    }
    var applied = 0, skipped = 0;
    Object.keys(incoming).filter(valid).forEach(function (k) {
      var old = incoming[k], now = raw(k);
      if (!meaningful(old)) return;
      var result = old;
      if (meaningful(now)) {
        if (now === old) return;
        try { result = mergeValues(k, now, old); }
        catch (_) {
          // Distinct free-text versions require manual comparison; never overwrite.
          skipped++; return;
        }
      }
      if (now !== result && result !== null) {
        try { localStorage.setItem(k, result); applied++; }
        catch (_) { skipped++; }
      }
    });
    // Preserve changed state for a manual retry if the cloud is temporarily offline.
    downloadRecovery(before, scope + '-before-restore.json');
    message('已從歷史存檔合併 ' + applied + ' 筆；' + skipped
      + ' 筆不同內容未覆蓋。請重新載入後按「立即同步」。');
    needsReload = applied > 0;
    render();
  }
  function renderRecovery() {
    if (!ui.recoveryBox) return;
    var snaps = recoverySnapshots();
    ui.recoveryBox.hidden = !snaps.length;
    if (!snaps.length) return;
    var selected = ui.recoverySelect.value;
    ui.recoverySelect.replaceChildren();
    snaps.forEach(function (snap, i) {
      var op = el('option', '', (snap.when ? snap.when.replace('T',' ').slice(0,19) : '首次備份')
        + ' · ' + snap.keys + ' 筆紀錄 · ' + snap.progress + ' 節');
      op.value = snap.key;
      ui.recoverySelect.appendChild(op);
    });
    if (snaps.some(function (x) { return x.key === selected; })) ui.recoverySelect.value = selected;
  }
  function backup() {
    var data = { format: 'study-sync-backup-v1', app: scope,
      exported: new Date().toISOString(), entries: entries(), conflicts: conflicts };
    var url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    var a = document.createElement('a');
    a.href = url; a.download = scope + '-progress-backup.json';
    a.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script'); s.src = url;
      s.onload = resolve; s.onerror = function () { reject(Error('無法載入同步元件')); };
      document.head.appendChild(s);
    });
  }
  async function login(provider) {
    try {
      var redirect = location.origin + location.pathname; // no lesson # route on OAuth callback
      var result = await client.auth.signInWithOAuth({ provider: provider,
        options: { redirectTo: redirect } });
      if (result.error) throw result.error;
    } catch (e) { message('登入失敗：' + e.message); }
  }
  async function logout() {
    if (Object.keys(conflicts).length) { message('請先處理衝突並下載備份，再登出。'); return; }
    if (syncing) { message('同步仍在進行，請完成後再登出。'); return; }
    var good = await sync(true);
    if (!good || Object.keys(conflicts).length || needsReload) {
      message('同步未完成；為保護本機資料，已取消登出。'); return;
    }
    // Archive and remove signed-in data before returning to guest mode. Without
    // this, the next account could accidentally import the previous user's cache.
    if (!write('__study_sync_logout_backup:' + scope + ':' + userId + ':' + Date.now(),
      { exported: new Date().toISOString(), entries: entries() })) {
      message('瀏覽器無法儲存登出備份，已取消登出。請先匯出 JSON。'); return;
    }
    var result = await client.auth.signOut();
    if (result.error) { message('登出失敗：' + result.error.message); return; }
    Object.keys(entries()).forEach(function (k) { localStorage.removeItem(k); });
    localStorage.setItem(ownerKey, 'guest');
    location.reload();
  }
  function switchUser(next, user) {
    if (userId === next && initialized) { session = user ? { user: user } : null; render(); return; }
    var old = raw(ownerKey) || 'guest';
    // Never import one signed-in account's cached progress into another account.
    if (old !== 'guest' && old !== next) {
      // Preserve previous account's progress even on forced account switching.
      var stash = {exported:new Date().toISOString(), entries:entries()};
      if (Object.keys(stash.entries).length &&
          !write('__study_sync_account_switch_backup:' + scope + ':' + old + ':' + Date.now(), stash)) {
        message('無法備份原帳號資料，已取消切換。'); return;
      }
      Object.keys(stash.entries).forEach(function (k) { localStorage.removeItem(k); });
      needsReload = true;
    }
    localStorage.setItem(ownerKey, next || 'guest');
    userId = next;
    session = user ? { user: user } : null;
    migrateLegacyId();
    meta = userId ? read(storageKey(), {}) : {};
    conflicts = {};
    initialized = true;
    initial = true;
    if (userId) {
      var backupKey = '__study_sync_first_backup:' + scope + ':' + userId;
      if (!raw(backupKey)) write(backupKey, { exported: new Date().toISOString(), entries: entries() });
      sync(true);
    } else {
      message('訪客模式：可繼續學習，進度只保留在此瀏覽器。');
      if (needsReload) render();
    }
  }
  function storeMeta() { if (userId) write(storageKey(), meta); }
  function resolve(key, choice) {
    var c = conflicts[key];
    if (!c) return;
    // Keep a durable local snapshot of both alternatives before choosing.
    write('__study_sync_conflict_backup:' + scope + ':' + userId + ':' + Date.now(),
      { key: key, local: c.local, cloud: c.value, revision: c.revision });
    if (choice === 'remote') {
      localSet(key, c.value);
      meta[key] = { revision: c.revision, base: c.value };
    } else meta[key] = { revision: c.revision, base: c.value };
    delete conflicts[key];
    storeMeta(); render();
    if (choice === 'local') sync(true);
    else message('已採用雲端資料，請重新載入頁面套用。');
  }
  async function cas(key, value, revision) {
    if (value === null) throw Error('拒絕空值覆蓋雲端學習資料');
    var r = await client.rpc('study_sync_cas', {
      p_app_id: scope, p_storage_key: key,
      p_value: value, p_expected_revision: revision
    });
    if (r.error) throw r.error;
    return r.data && r.data[0];
  }
  async function sync(force) {
    if (!userId || !client || syncing || needsReload) return false;
    if (!force && Date.now() - lastSync < 6000) return;
    syncing = true;
    message('正在同步…');
    try {
      var result = await client.from(schema).select('storage_key,value,revision').eq('app_id', scope);
      if (result.error) throw result.error;
      var cloud = {};
      (result.data || []).forEach(function (row) { if (valid(row.storage_key)) cloud[row.storage_key] = row; });
      var local = entries(), keys = new Set(Object.keys(local).concat(Object.keys(cloud), Object.keys(meta)));
      var found = {}, downloaded = 0, uploaded = 0;
      for (var key of keys) {
        if (!valid(key)) continue;
        var row = cloud[key] || { value: null, revision: 0 };
        var value = Object.prototype.hasOwnProperty.call(local, key) ? local[key] : null;
        var base = meta[key];
        var target = value;
        // Older clients accidentally uploaded null tombstones on logout. They are
        // not authoritative deletions. Never erase a surviving local value for null.
        if (row.revision > 0 && row.value === null) {
          if (!meaningful(value)) continue;
          // Recover non-empty local values through the normal optimistic CAS path.
          base = null;
        }
        // An empty array/string or zero must never wipe meaningful local work
        // merely because a second device or stale client reset that field.
        if (row.revision > 0 && row.value !== null &&
            !meaningful(row.value) && meaningful(value) &&
            !(base && base.revision === row.revision && base.base === row.value)) {
          found[key] = { local:value, value:row.value, revision:row.revision };
          continue;
        }
        if (meaningful(row.value) && !meaningful(value)) {
          localSet(key, row.value); downloaded++;
          meta[key] = { revision:row.revision, base:row.value };
          continue;
        }
        if (value === row.value) {
          meta[key] = { revision: row.revision, base: value };
          continue;
        }
        if (base && value === base.base) {
          localSet(key, row.value); downloaded++;
          meta[key] = { revision: row.revision, base: row.value };
          continue;
        }
        if (row.revision === 0 && value === null) continue;
        if (!base && value === null && row.revision > 0) {
          localSet(key, row.value); downloaded++;
          meta[key] = { revision: row.revision, base: row.value };
          continue;
        }
        try {
          if (base && base.revision === row.revision) target = value;
          else if (row.revision === 0) target = value;
          else if (row.value === null && meaningful(value)) target = value;
          else target = mergeValues(key, row.value, value);
        } catch (_) {
          found[key] = { local: value, value: row.value, revision: row.revision };
          continue;
        }
        if (target !== value) { localSet(key, target); downloaded++; }
        if (target === row.value) {
          meta[key] = { revision: row.revision, base: row.value };
          continue;
        }
        var success = false;
        for (var attempt = 0; attempt < 2; attempt++) {
          var answer = await cas(key, target, row.revision);
          if (answer && answer.applied) {
            meta[key] = { revision: Number(answer.revision), base: target };
            uploaded++; success = true; break;
          }
          if (!answer) throw Error('同步服務未回傳版本');
          row = { revision: Number(answer.revision), value: answer.value };
          try { target = row.value === null && meaningful(target) ? target : mergeValues(key, row.value, target); }
          catch (_) { break; }
        }
        if (!success) found[key] = { local: value, value: row.value, revision: row.revision };
      }
      storeMeta();
      conflicts = found;
      lastSync = Date.now(); initial = false;
      message(Object.keys(found).length ? '有版本衝突，需選擇保留版本。' :
        needsReload ? '已取得雲端變更，請重新載入套用。' :
        '已同步（上傳 ' + uploaded + ' 筆，下載 ' + downloaded + ' 筆）');
      return !Object.keys(found).length && !needsReload;
    } catch (e) {
      message('同步失敗：' + (e && e.message ? e.message : '網路或設定問題') + '；本機進度仍保留。');
      return false;
    } finally { syncing = false; }
  }
  async function setup() {
    createUi();
    window.addEventListener('study-profile-change', function () { render(); });
    window.addEventListener('storage', function (event) { if (event.key === 'study:profile') render(); });
    try { await loadScript(configUrl); }
    catch (_) { message('同步設定檔尚未部署，仍可使用訪客模式。'); return; }
    var c = window.STUDY_SYNC_CONFIG || {};
    if (!/^https:\/\/[^/]+\.supabase\.co\/?$/.test(c.url || '') || !c.anonKey) {
      message('尚未設定雲端專案，仍可使用訪客模式。'); return;
    }
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/dist/umd/supabase.min.js');
      if (!window.supabase || !window.supabase.createClient) throw Error('SDK 未載入');
      client = window.supabase.createClient(c.url, c.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      client.auth.onAuthStateChange(function (_event, current) {
        setTimeout(function () { switchUser(current && current.user ? current.user.id : null, current && current.user); }, 0);
      });
      var result = await client.auth.getSession();
      if (result.error) throw result.error;
      switchUser(result.data.session && result.data.session.user ? result.data.session.user.id : null,
        result.data.session && result.data.session.user);
      window.addEventListener('online', function () { sync(true); });
      window.addEventListener('study-local-write', function () {
        if (!userId) return;
        message('待同步：新進度已保存在此瀏覽器。');
        clearTimeout(pendingTimer);
        pendingTimer = setTimeout(function () { sync(true); }, 1200);
      });
      window.addEventListener('focus', function () { sync(false); });
      window.addEventListener('storage', function () { sync(false); });
      setInterval(function () { if (!document.hidden) sync(false); }, 15000);
    } catch (e) { message('雲端服務啟動失敗：' + e.message + '；本機學習不受影響。'); }
    render();
  }
  window.StudySync = { sync: function () { return sync(true); }, backup: backup };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
