/* Additional town NPC quests. Battles remain the source of truth for every stage. */
(function (root) {
  'use strict';
  var STEPS = [
    ['Problem', '辨識研究問題'], ['Method', '重建方法'],
    ['Evidence', '判讀證據'], ['Contribution', '界定貢獻'],
    ['Gap', '追問研究缺口'], ['Boss', '跨章節整合']
  ];
  var QUESTS = [
    { paper:'2501.13956', town:'玩具城', npc:'馬賽爾', art:'marcel', frame:[56,105], scale:.9,
      title:'追蹤會變動的事實', reward:'時序圖譜守門人',
      chapters:['s-problem','s-graph','s-dmr','s-lme','s-critique','s-boss'] },
    { paper:'2604.14362', town:'勇士之村', npc:'武術教練', art:'dances-with-balrog', frame:[81,88], scale:1,
      title:'保留歷史，再查明現在', reward:'只增不刪的記錄官',
      chapters:['s-problem','s-tools','s-ablation','s-locomo','s-critique','s-boss'] },
    { paper:'2605.06527', town:'墮落城市', npc:'達克魯', art:'dark-lord', frame:[135,174], scale:.6,
      title:'找出未明說的過期記憶', reward:'隱性衝突偵探',
      chapters:['s-problem','s-cupmem','s-probe','s-results','s-gap','s-boss'] },
    { paper:'2608.19652', town:'拉契爾恩', npc:'防毒面具', art:'gas-mask', frame:[78,86], scale:1,
      title:'讓依賴的狀態跟上變化', reward:'狀態漂移獵人',
      chapters:['s-problem','s-method','s-wrapper','s-results','s-critique','s-boss'] },
    { paper:'2606.30306', town:'天空之城', npc:'妖精 克莉爾', art:'kriel', frame:[170,140], scale:.58,
      title:'盤點持久代理的設計邊界', reward:'持久狀態治理官',
      chapters:['s-thesis','s-axes','s-corpus','s-front','s-critique','s-boss'] },
    { paper:'dekleer-1986-atms', town:'弓箭手村', npc:'長老斯坦', art:'elder-stan', frame:[51,73], scale:1.35,
      title:'追溯結論依賴的假設', reward:'情境標籤大師',
      chapters:['s-tms','s-labels','s-search','s-algo','s-context','s-boss'] }
  ];
  function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (_) { return fallback; }
  }
  function key(paper) { return 'study:quest:' + paper + ':v1'; }
  function progress(paper) { return object(read(key(paper), {})); }
  function stages(quest) { return quest.chapters.map(function (id, i) {
    return { id:id, name:STEPS[i][0] + ' · ' + STEPS[i][1], short:STEPS[i][1] };
  }); }
  function battle(paper) { return object(read('study:' + paper + ':battle', {})); }
  function cleared(record, id) { return Number(object(record[id]).w) > 0; }
  function state(quest, saved, fights) {
    if (object(saved).reported) return '已完成';
    if (quest.chapters.every(function (id) { return cleared(object(fights), id); })) return '可回報';
    return object(saved).accepted ? '進行中' : '未接取';
  }
  function nextStage(quest) {
    var wins = battle(quest.paper);
    return stages(quest).find(function (stage) { return !cleared(wins, stage.id); }) || null;
  }
  function put(quest, value) {
    var storageKey = key(quest.paper);
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
      root.dispatchEvent(new CustomEvent('study-local-write', { detail:{ key:storageKey } }));
      return true;
    } catch (_) {
      root.dispatchEvent(new CustomEvent('study-save-error', { detail:{ key:storageKey } }));
      return false;
    }
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function mountOne(quest, host, paperPage) {
    var prefix = paperPage ? '../../' : '';
    function href(id) { return paperPage ? '#' + id : 'papers/' + quest.paper + '/index.html#' + id; }
    var box = el('section', 'intro-quest world-quest');
    box.id = 'quest-' + quest.paper;
    box.setAttribute('data-quest-paper', quest.paper);
    box.setAttribute('aria-label', quest.town + quest.npc + '的研究任務');
    var portrait = el('span', 'world-quest-art');
    portrait.style.width = (quest.frame[0] * quest.scale) + 'px';
    portrait.style.height = (quest.frame[1] * quest.scale) + 'px';
    var img = document.createElement('img');
    img.alt = quest.npc; img.loading = 'lazy'; img.decoding = 'async';
    img.style.transform = 'scale(' + quest.scale + ')';
    img.onerror = function () { portrait.textContent = quest.npc; };
    if (paperPage) img.src = prefix + 'assets/maple/spr-npc-' + quest.art + '-stand.png';
    else img.dataset.src = 'assets/maple/spr-npc-' + quest.art + '-stand.png';
    portrait.appendChild(img); box.appendChild(portrait);
    var body = el('div', 'intro-quest-body'); box.appendChild(body);
    body.appendChild(el('h2', null, quest.town + ' · ' + quest.npc));
    body.appendChild(el('p', 'intro-quest-guide', quest.title + '。完成五個研究面向，再通過跨章節整合挑戰。'));
    var status = el('p', 'intro-quest-status'); status.setAttribute('role', 'status'); body.appendChild(status);
    var meter = document.createElement('progress'); meter.className = 'intro-quest-meter';
    meter.max = quest.chapters.length; meter.setAttribute('aria-label', '研究任務通關數'); body.appendChild(meter);
    var actions = el('div', 'intro-quest-actions'), action = el('button', 'btn');
    action.type = 'button'; actions.appendChild(action);
    var secondary = el('a', 'btn', paperPage ? '返回' + quest.town : '先看閱讀路線');
    secondary.href = paperPage ? '../../index.html#' + box.id : href('s-route');
    actions.appendChild(secondary); body.appendChild(actions);
    var details = el('details', 'intro-quest-details');
    details.appendChild(el('summary', null, '查看五面向任務路線與獎勵'));
    var list = el('ol');
    stages(quest).forEach(function (stage) {
      var item = el('li'), a = el('a', null, stage.name);
      a.href = href(stage.id); item.appendChild(a); list.appendChild(item);
    });
    details.appendChild(list);
    details.appendChild(el('p', null, '章節戰鬥依既有規則記錄 EXP 與熟練度；Boss 首次勝利可取得「' + quest.reward + '」。回報任務不另發可重複獎勵。'));
    body.appendChild(details); host.appendChild(box);
    function render() {
      var saved = progress(quest.paper), fights = battle(quest.paper);
      var wins = quest.chapters.filter(function (id) { return cleared(fights, id); }).length;
      var next = nextStage(quest), phase = state(quest, saved, fights);
      meter.value = wins;
      status.textContent = '任務：' + phase + ' · ' +
        (phase === '已完成' && wins < quest.chapters.length ? '部分戰鬥紀錄待恢復' : wins + '/' + quest.chapters.length + ' 關通過') +
        (next && phase === '進行中' ? ' · 下一關：' + next.short : '');
      action.textContent = phase === '未接取' ? '接下任務' : phase === '可回報' ? '回報任務' :
        phase === '已完成' ? '查看遠征紀錄' : '前往：' + next.short;
      action.onclick = function () {
        if (phase === '進行中') { location.href = href(next.id); return; }
        if (phase === '已完成') { location.href = paperPage ? '../../index.html#expedition' : '#expedition'; return; }
        var updated = { version:1, accepted:true, reported:phase === '可回報',
          acceptedAt:saved.acceptedAt || new Date().toISOString() };
        if (updated.reported) updated.reportedAt = saved.reportedAt || new Date().toISOString();
        if (put(quest, updated)) render();
      };
      Array.prototype.forEach.call(list.children, function (item, i) {
        item.classList.toggle('is-done', cleared(fights, quest.chapters[i]));
      });
    }
    root.addEventListener('study-progress-change', render);
    root.addEventListener('storage', render);
    render();
  }
  function mount() {
    var paperNode = document.querySelector('[data-paper]');
    var paper = paperNode && paperNode.getAttribute('data-paper');
    var host = paper ? document.querySelector('.paper-head') : document.querySelector('.world-quest-host');
    if (!host) return;
    QUESTS.filter(function (quest) { return !paper || quest.paper === paper; }).forEach(function (quest) {
      if (!document.getElementById('quest-' + quest.paper)) mountOne(quest, host, !!paper);
    });
  }
  root.StudyWorldQuests = { definitions:QUESTS.slice(), state:state, nextStage:nextStage, readProgress:progress, mount:mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
  else mount();
})(window);
