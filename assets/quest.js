/* FadeMem's introductory quest reads the existing battle records; it never awards EXP itself. */
(function (root) {
  'use strict';
  var PAPER = '2601.18642';
  var KEY = 'study:quest:fademem-v2';
  var LEGACY_KEY = 'study:quest:fademem-v1';
  var STAGES = [
    { id:'s-problem', name:'Problem · 辨識研究問題', short:'研究問題' },
    { id:'s-decay', name:'Method · 推演衰減方法', short:'衰減方法' },
    { id:'s-results', name:'Benchmark · 判讀實驗', short:'實驗判讀' },
    { id:'s-context', name:'Contribution · 比對新意', short:'研究新意' },
    { id:'s-critique', name:'Gap · 追問限制', short:'研究缺口' },
    { id:'s-boss', name:'Boss · 跨章節整合', short:'綜合挑戰' }
  ];
  function object(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function cleared(battle, id) { return !!(object(battle)[id] && object(battle)[id].w > 0); }
  function state(progress, battle) {
    progress = object(progress);
    if (progress.reported) return '已完成';
    if (STAGES.every(function (stage) { return cleared(battle, stage.id); })) return '可回報';
    return progress.accepted ? '進行中' : '未接取';
  }
  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (_) { return fallback; }
  }
  function progress() {
    var current = object(read(KEY, {})), legacy = object(read(LEGACY_KEY, {}));
    return { accepted:!!(current.accepted || legacy.accepted),
      reported:!!(current.reported || legacy.reported),
      acceptedAt:[current.acceptedAt,legacy.acceptedAt].filter(Boolean).sort()[0] || '',
      reportedAt:[current.reportedAt,legacy.reportedAt].filter(Boolean).sort().pop() || '' };
  }
  function nextStage() {
    var battle = object(read('study:' + PAPER + ':battle', {}));
    return STAGES.find(function (stage) { return !cleared(battle, stage.id); }) || null;
  }
  function put(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
      root.dispatchEvent(new CustomEvent('study-local-write', { detail: { key: KEY } }));
      return true;
    } catch (_) {
      root.dispatchEvent(new CustomEvent('study-save-error', { detail: { key: KEY } }));
      return false;
    }
  }
  function mount() {
    var paper = !!document.querySelector('[data-paper="' + PAPER + '"]');
    var host = paper ? document.querySelector('.paper-head') :
      (document.querySelector('.world-quest-host') || document.querySelector('.shelf-head'));
    if (!host || document.getElementById('intro-quest')) return;
    var prefix = paper ? '../../' : '';
    function paperHref(id) { return paper ? '#' + id : 'papers/' + PAPER + '/index.html#' + id; }
    var box = document.createElement('section'); box.id = 'intro-quest'; box.className = 'intro-quest';
    box.setAttribute('data-quest-paper', PAPER);
    box.setAttribute('aria-label', '魔法森林研究任務');
    var portrait = document.createElement('span'); portrait.className = 'intro-quest-portrait';
    var img = document.createElement('img'); img.src = prefix + 'assets/maple/spr-npc-hines-stand.png';
    img.alt = '漢斯'; img.loading = 'lazy';
    img.onerror = function () { portrait.textContent = '漢斯'; };
    portrait.appendChild(img); box.appendChild(portrait);
    var body = document.createElement('div'); body.className = 'intro-quest-body'; box.appendChild(body);
    var heading = document.createElement('h2'); heading.textContent = '魔法森林 · 漢斯的研究任務'; body.appendChild(heading);
    var guide = document.createElement('p'); guide.className = 'intro-quest-guide';
    guide.textContent = '用 FadeMem 的五個研究面向通過知識挑戰，最後整合判斷。'; body.appendChild(guide);
    var status = document.createElement('p'); status.className = 'intro-quest-status';
    status.setAttribute('role', 'status'); body.appendChild(status);
    var meter = document.createElement('progress'); meter.className = 'intro-quest-meter';
    meter.max = STAGES.length; meter.setAttribute('aria-label', '研究任務通關數'); body.appendChild(meter);
    var actions = document.createElement('div'); actions.className = 'intro-quest-actions'; body.appendChild(actions);
    var action = document.createElement('button'); action.type = 'button'; action.className = 'btn'; actions.appendChild(action);
    var secondary = document.createElement('a'); secondary.className = 'btn';
    secondary.href = paper ? '../../index.html#intro-quest' : paperHref('s-route');
    secondary.textContent = paper ? '返回魔法森林' : '先看閱讀路線'; actions.appendChild(secondary);
    var details = document.createElement('details'); details.className = 'intro-quest-details';
    var summary = document.createElement('summary'); summary.textContent = '查看五面向任務路線與獎勵'; details.appendChild(summary);
    var list = document.createElement('ol'); details.appendChild(list);
    STAGES.forEach(function (stage) {
      var item = document.createElement('li');
      var link = document.createElement('a'); link.href = paperHref(stage.id); link.textContent = stage.name;
      item.appendChild(link); list.appendChild(item);
    });
    var reward = document.createElement('p'); reward.textContent = '各關依既有規則記 EXP、熟練度及遠征紀錄；Boss 勝利解鎖「遺忘曲線馴服者」。回報只記一次，不重複給 EXP。整篇 15 節完成後，原有進度另會解鎖短稱號「忘卻之羽」。';
    details.appendChild(reward); body.appendChild(details);
    host.appendChild(box);
    function render() {
      var record = progress();
      var battle = object(read('study:' + PAPER + ':battle', {}));
      var wins = STAGES.filter(function (stage) { return cleared(battle, stage.id); }).length;
      var next = STAGES.find(function (stage) { return !cleared(battle, stage.id); });
      var phase = state(record, battle);
      meter.value = wins;
      status.textContent = '任務：' + phase + ' · ' +
        (phase === '已完成' && wins < STAGES.length ? '部分戰鬥紀錄待恢復' : wins + '/' + STAGES.length + ' 關通過') +
        (next && phase !== '未接取' ? ' · 下一關：' + next.short : '') +
        (phase === '已完成' ? ' · 可到書架查看遠征紀錄' : '');
      action.textContent = phase === '未接取' ? '接下任務' :
        phase === '可回報' ? '向漢斯回報' :
        phase === '已完成' ? '查看遠征紀錄' : '前往：' + next.short;
      action.onclick = function () {
        if (phase === '進行中') { location.href = paperHref(next.id); return; }
        if (phase === '已完成') { location.href = paper ? '../../index.html#expedition' : '#expedition'; return; }
        var updated = { version:2, accepted:true, reported:phase === '可回報',
          acceptedAt:record.acceptedAt || new Date().toISOString() };
        if (updated.reported) updated.reportedAt = record.reportedAt || new Date().toISOString();
        if (put(updated)) render();
      };
      Array.prototype.forEach.call(list.children, function (item, i) {
        item.classList.toggle('is-done', cleared(battle, STAGES[i].id));
      });
    }
    root.addEventListener('study-progress-change', render);
    root.addEventListener('storage', render);
    render();
  }
  root.StudyIntroQuest = { state:state, stages:STAGES.slice(), readProgress:progress,
    nextStage:nextStage, mount:mount };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
    else mount();
  }
})(window);
