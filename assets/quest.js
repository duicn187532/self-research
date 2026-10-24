/* One introductory quest. Reading, EXP, mastery and titles remain owned by the existing systems. */
(function (root) {
  'use strict';
  var PAPER = '2601.18642', KEY = 'study:quest:fademem-v1';
  var CHAPTERS = ['s-route','s-problem','s-arch','s-importance','s-decay','s-migrate',
    's-conflict','s-fusion','s-anim','s-setup','s-results','s-ablation','s-context','s-critique','s-boss'];
  function object(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function state(progress, done, boss) {
    progress = object(progress);
    if (progress.reported) return '已完成';
    if (Array.isArray(done) && boss && progress.accepted && Array.isArray(progress.required) && progress.required.length &&
        progress.required.every(function (id) { return done.indexOf(id) !== -1; })) return '可回報';
    return progress.accepted ? '進行中' : '未接取';
  }
  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (_) { return fallback; }
  }
  function put(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
      root.dispatchEvent(new CustomEvent('study-local-write', { detail: { key: KEY } }));
      return true;
    }
    catch (_) {
      root.dispatchEvent(new CustomEvent('study-save-error', { detail: { key: KEY } }));
      return false;
    }
  }
  function mount() {
    var paper = document.querySelector('[data-paper="' + PAPER + '"]');
    var home = !paper && document.querySelector('.shelf-head');
    var host = paper ? document.querySelector('.paper-head') : home;
    if (!host) return;
    var required = paper ? Array.prototype.map.call(document.querySelectorAll('input[data-done]'), function (box) {
      return box.getAttribute('data-done');
    }) : CHAPTERS.slice();
    var box = document.createElement('section'); box.className = 'intro-quest';
    box.setAttribute('aria-label', '魔法森林研究任務');
    var img = document.createElement('img'); img.src = (paper ? '../../' : '') + 'assets/maple/spr-npc-hines-stand.png';
    img.alt = ''; img.loading = 'lazy'; img.onerror = function () { img.remove(); };
    box.appendChild(img);
    var body = document.createElement('div'); body.className = 'intro-quest-body'; box.appendChild(body);
    var heading = document.createElement('h2'); heading.textContent = '魔法森林 · 漢斯的研究任務'; body.appendChild(heading);
    var description = document.createElement('p');
    description.textContent = '追查 FadeMem 如何界定遺忘問題、設計衰減方法、驗證成效與辨識研究缺口。讀完章節並通過綜合挑戰，再向漢斯回報。';
    body.appendChild(description);
    var reward = document.createElement('p');
    reward.textContent = '完成條件：15 節精讀與 Boss 勝利。獎勵：既有 EXP、Boss 圖鑑紀錄與「遺忘曲線馴服者」；整篇完成另解鎖「忘卻之羽」。回報只記錄一次，不重複給 EXP。';
    body.appendChild(reward);
    var status = document.createElement('p'); status.className = 'intro-quest-status'; status.setAttribute('role', 'status'); body.appendChild(status);
    var actions = document.createElement('div'); actions.className = 'intro-quest-actions'; body.appendChild(actions);
    var action = document.createElement('button'); action.type = 'button'; action.className = 'btn'; actions.appendChild(action);
    var link = document.createElement('a'); link.className = 'btn'; link.href = paper ? '#s-route' : 'papers/2601.18642/index.html#s-route';
    link.textContent = '前往五面向精讀'; actions.appendChild(link);
    var bossLink = document.createElement('a'); bossLink.className = 'btn'; bossLink.href = paper ? '#s-boss' : 'papers/2601.18642/index.html#s-boss';
    bossLink.textContent = '前往綜合挑戰'; actions.appendChild(bossLink);
    host.appendChild(box);
    function render() {
      var progress = object(read(KEY, {}));
      var done = read('study:' + PAPER + ':done', []);
      var battle = object(read('study:' + PAPER + ':battle', {}));
      var ids = required.length ? required : (Array.isArray(progress.required) ? progress.required : []);
      var boss = !!(battle['s-boss'] && battle['s-boss'].w);
      var phase = state({ accepted: progress.accepted, reported: progress.reported, required: ids }, done, boss);
      status.textContent = '任務：' + phase + ' · 已讀 ' + (Array.isArray(done) ? ids.filter(function (id) { return done.indexOf(id) !== -1; }).length : 0) + '/' + ids.length + ' 節 · Boss ' + (boss ? '已通過' : '待挑戰') + (progress.reported ? ' · 成就已記錄' : '');
      action.textContent = phase === '未接取' ? '向漢斯接任務' : phase === '可回報' ? '回報任務' : phase === '已完成' ? '任務已完成' : '繼續研究';
      action.disabled = phase === '已完成';
      action.onclick = function () {
        if (phase === '進行中') { location.href = link.href; return; }
        var next = { version: 1, accepted: true, reported: phase === '可回報', required: ids,
          total: ids.length, acceptedAt: progress.acceptedAt || new Date().toISOString() };
        if (next.reported) next.reportedAt = progress.reportedAt || new Date().toISOString();
        if (put(next)) render();
      };
      bossLink.hidden = !progress.accepted || boss;
    }
    root.addEventListener('study-progress-change', render);
    root.addEventListener('storage', render);
    render();
  }
  root.StudyIntroQuest = { state: state, chapters: CHAPTERS.slice(), mount: mount };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
  }
})(window);
