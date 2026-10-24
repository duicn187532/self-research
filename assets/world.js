/* Shelf map and research codex. All progress comes from existing study: records. */
(function (root) {
  'use strict';
  var PLACES = [
    { id:'2601.18642', scene:'ellinia-town', name:'魔法森林', topic:'遺忘與雙層記憶' },
    { id:'2501.13956', scene:'ludibrium', name:'玩具城', topic:'時序知識圖譜' },
    { id:'2604.14362', scene:'perion', name:'勇士之村', topic:'只增不刪的記憶' },
    { id:'2605.06527', scene:'kerning', name:'墮落城市', topic:'過期記憶診斷' },
    { id:'2608.19652', scene:'lachelein', name:'夢都', topic:'依賴與狀態更新' },
    { id:'2606.30306', scene:'orbis', name:'天空之城', topic:'持久代理綜述' },
    { id:'dekleer-1986-atms', scene:'henesys', name:'弓箭手村', topic:'假設與真值維護' }
  ];
  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (_) { return fallback; }
  }
  function object(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function array(v) { return Array.isArray(v) ? v : []; }
  function el(tag, cls, value) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function link(label, href, cls) { var a = el('a', cls, label); a.href = href; return a; }
  function dateNow() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function validSection(id) { return typeof id === 'string' && /^s-[a-z0-9-]+$/.test(id); }
  function data(place) {
    var card = document.querySelector('[data-progress-for="' + place.id + '"]');
    card = card && card.closest('.card');
    var title = card && card.querySelector('h3');
    return { href:card ? card.getAttribute('href') : 'papers/' + place.id + '/index.html',
      title:title ? title.textContent.trim() : place.id,
      total:card ? Number(card.querySelector('[data-progress-for]').getAttribute('data-total')) || 0 : 0,
      done:array(read('study:' + place.id + ':done', [])),
      toc:array(read('study:' + place.id + ':toc', [])),
      battle:object(read('study:' + place.id + ':battle', {})),
      grasp:object(read('study:' + place.id + ':grasp', {})),
      completedAt:read('study:' + place.id + ':completedAt', null),
      last:read('study:' + place.id + ':last', null) };
  }
  function chapterName(info, id) {
    var entry = info.toc.find(function (row) { return Array.isArray(row) && row[0] === id; });
    return entry && typeof entry[1] === 'string' ? entry[1] : id === 's-boss' ? '跨章節 BOSS' : id;
  }
  function battles(info) {
    return Object.keys(info.battle).filter(validSection).filter(function (key) {
      var record = object(info.battle[key]);
      return Number(record.w) > 0 || Number(record.l) > 0;
    });
  }
  function dueChapters(place, info) {
    return Object.keys(info.grasp).filter(validSection).filter(function (key) {
      var rec = object(info.grasp[key]);
      return typeof rec.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rec.due) && rec.due <= dateNow() &&
        info.toc.some(function (row) { return Array.isArray(row) && row[0] === key; });
    }).map(function (key) { return { place:place, info:info, id:key, rec:info.grasp[key] }; });
  }
  function nextUnread(info) {
    var pending = info.toc.filter(function (row) { return Array.isArray(row) && validSection(row[0]) && info.done.indexOf(row[0]) < 0; });
    var last = object(info.last);
    return validSection(last.id) && pending.some(function (row) { return row[0] === last.id; }) ? last.id :
      (pending.length ? pending[0][0] : null);
  }
  function mount() {
    var nav = document.getElementById('world-map-places'), detail = document.getElementById('world-map-detail');
    var codex = document.getElementById('codex-body'), nextAction = document.getElementById('next-action');
    var questHost = document.querySelector('.world-quest-host');
    if (!nav || !detail || !codex || !nextAction) return;
    var css = document.querySelector('link[href*="assets/site.css"]');
    var cacheKey = (css && css.getAttribute('href').match(/[?&]v=(\w+)/) || [])[1];
    function sceneUrl(name, small) {
      return 'assets/maple/scene-' + name + (small ? '-sm' : '') + '.jpg' + (cacheKey ? '?v=' + cacheKey : '');
    }
    function fromHash(fallback) {
      var id = (location.hash || '').replace(/^#quest-/, '');
      return PLACES.find(function (place) { return place.id === id; }) || fallback;
    }
    var selected = fromHash(PLACES[0]);
    var buttons = [];
    PLACES.forEach(function (place) {
      var button = el('button', 'world-place', place.name);
      button.type = 'button';
      button.addEventListener('click', function () {
        selected = place;
        if (history.replaceState) history.replaceState(null, '', '#quest-' + place.id);
        render();
      });
      nav.appendChild(button); buttons.push(button);
    });
    function renderDetail() {
      var info = data(selected), seen = battles(info), due = dueChapters(selected, info);
      detail.textContent = '';
      var art = el('div', 'world-scene'), img = document.createElement('img');
      img.alt = selected.name + '場景'; img.loading = 'lazy'; img.decoding = 'async';
      img.onerror = function () { img.hidden = true; art.appendChild(el('span', 'world-scene-fallback', selected.name)); };
      img.src = sceneUrl(selected.scene, true);
      img.srcset = sceneUrl(selected.scene, true) + ' 768w, ' + sceneUrl(selected.scene, false) + ' 1600w';
      img.sizes = '(max-width: 720px) calc(100vw - 64px), (max-width: 1150px) 45vw, 600px';
      art.appendChild(img); detail.appendChild(art);
      var body = el('div', 'world-detail-body');
      body.appendChild(el('h3', null, selected.name + ' · ' + selected.topic));
      body.appendChild(el('p', 'world-paper-title', info.title));
      body.appendChild(el('p', 'world-progress', '已讀 ' + Math.min(info.done.length, info.total) + ' / ' + info.total +
        ' 節 · 已挑戰 ' + seen.length + ' 個章節' + (due.length ? ' · ' + due.length + ' 節待複習' : '')));
      body.appendChild(link('進入論文', info.href, 'btn'));
      detail.appendChild(body);
      if (questHost) Array.prototype.forEach.call(questHost.querySelectorAll('[data-quest-paper]'), function (box) {
        box.hidden = box.getAttribute('data-quest-paper') !== selected.id;
        if (!box.hidden) {
          var portrait = box.querySelector('img[data-src]');
          if (portrait) { portrait.src = portrait.dataset.src; portrait.removeAttribute('data-src'); }
        }
      });
      buttons.forEach(function (button, i) {
        button.setAttribute('aria-pressed', String(PLACES[i] === selected));
      });
    }
    function renderCodex() {
      codex.textContent = '';
      nextAction.textContent = '';
      var allDue = [];
      PLACES.forEach(function (place) { allDue = allDue.concat(dueChapters(place, data(place))); });
      allDue.sort(function (a, b) { return a.rec.due.localeCompare(b.rec.due); });
      var suggestion = el('div', 'codex-suggestion');
      suggestion.appendChild(el('h4', null, '下一步建議'));
      if (allDue.length) {
        var first = allDue[0];
        suggestion.appendChild(el('p', null, '先回顧到期的章節，再決定是否已理解。'));
        suggestion.appendChild(link(first.place.name + ' · ' + chapterName(first.info, first.id), first.info.href + '#' + first.id));
      } else {
          var unfinished = PLACES.map(function (place) {
            var info = data(place), last = object(info.last);
            return { place:place, info:info, target:nextUnread(info), at:Number.isFinite(last.at) ? last.at : 0 };
          }).filter(function (entry) { return entry.info.done.length < entry.info.total && entry.at > 0; })
            .sort(function (a, b) { return b.at - a.at; })[0];
          if (unfinished) {
            suggestion.appendChild(el('p', null, '接著讀尚未完成的章節。'));
            suggestion.appendChild(link(unfinished.place.name + ' · 繼續閱讀',
              unfinished.info.href + (unfinished.target ? '#' + unfinished.target : '')));
          }
      }
      nextAction.hidden = !suggestion.querySelector('a');
      if (!nextAction.hidden) nextAction.appendChild(suggestion);
      var list = el('ul', 'codex-list');
      PLACES.forEach(function (place) {
        var info = data(place), seen = battles(info), li = el('li');
        li.appendChild(link(place.name + ' · ' + place.topic, info.href));
        li.appendChild(el('span', 'codex-count', seen.length ? '已遭遇 ' + seen.length + ' 個章節' : '尚未挑戰'));
        var finished = info.total > 0 && info.toc.length === info.total ?
          info.toc.every(function (row) { return Array.isArray(row) && info.done.indexOf(row[0]) >= 0; }) :
          info.total > 0 && new Set(info.done.filter(validSection)).size >= info.total;
        if (finished) li.appendChild(el('span', 'codex-count',
          '全篇已讀完 · ' + (typeof info.completedAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(info.completedAt) ?
            '完成於 ' + info.completedAt.slice(0, 10) : '舊紀錄未記完成日期')));
        var earned = array(read('study:titles', [])).find(function (title) { return title && title.p === place.id; });
        if (earned && typeof earned.t === 'string') li.appendChild(el('span', 'codex-count', '稱號：' + earned.t));
        var dims = object(root.StudyResearchDimensions)[place.id];
        if (Array.isArray(dims) && dims.length === 5) {
          var facets = el('details', 'codex-facets');
          facets.appendChild(el('summary', null, '五面向學習紀錄'));
          var facetList = el('ul');
          dims.forEach(function (dim) {
            var sections = array(dim.sections).filter(function (id) { return info.toc.some(function (row) { return Array.isArray(row) && row[0] === id; }); });
            var readCount = sections.filter(function (id) { return info.done.indexOf(id) >= 0; }).length;
            var understood = sections.filter(function (id) { return object(info.grasp[id]).g === 'got'; }).length;
            var passed = sections.filter(function (id) { return Number(object(info.battle[id]).w) > 0; }).length;
            var item = el('li');
            item.appendChild(link(dim.name, info.href + '#' + (sections[0] || 's-route')));
            item.appendChild(el('span', null, '已讀 ' + readCount + '/' + sections.length +
              ' · 自評理解 ' + understood + ' · 挑戰通過 ' + passed));
            facetList.appendChild(item);
          });
          facets.appendChild(facetList); li.appendChild(facets);
        }
        if (seen.length) {
          var chapters = el('ul', 'codex-chapters');
          seen.forEach(function (id) {
            var record = object(info.battle[id]), item = el('li');
            item.appendChild(link(chapterName(info, id), info.href + '#' + id));
            item.appendChild(el('span', null, Number(record.w) > 0 ? '已討伐 ' + record.w + ' 次' : '挑戰中'));
            chapters.appendChild(item);
          });
          li.appendChild(chapters);
        }
        list.appendChild(li);
      });
      codex.appendChild(list);
    }
    function render() { renderDetail(); renderCodex(); }
    root.addEventListener('study-progress-change', render);
    root.addEventListener('storage', render);
    root.addEventListener('study-local-write', render);
    root.addEventListener('hashchange', function () { selected = fromHash(selected); render(); });
    render();
  }
  root.StudyWorld = { places:PLACES.slice(), mount:mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
  else mount();
})(window);
