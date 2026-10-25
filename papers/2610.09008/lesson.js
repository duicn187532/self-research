(function () {
  'use strict';
  var owner = document.getElementById('scope-owner'), query = document.getElementById('scope-query');
  var record = document.getElementById('scope-record'), result = document.getElementById('scope-result');
  if (!owner || !query) return;
  var labels = {
    actual: '已決定去雪梨', plan: '曾考慮搬去巴黎', belief: '米娜認為會議在週五'
  };
  function render() {
    var a = owner.value, q = query.value, visible = a === q;
    record.textContent = '儲存邊：命題「' + labels[a] + '」屬於 ' + (a === 'actual' ? '共享世界' : a === 'plan' ? '計畫分支' : '米娜信念') + '。';
    result.textContent = visible ? '可作為這次查詢的前提；檢索仍須確認內容相關。' : '不能把這段命題當作此查詢範圍的事實；原範圍內仍可保留。';
  }
  owner.addEventListener('change', render);
  query.addEventListener('change', render);
  render();
}());
