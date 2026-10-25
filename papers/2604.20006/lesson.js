(function () {
  'use strict';
  var box = document.getElementById('fama-lab');
  if (!box) return;
  var fields = ['fp','fph','fa','fah'].map(function (id) { return document.getElementById(id); });
  var out = document.getElementById('fama-out');
  function render() {
    var v = fields.map(function (el) { return Number(el.value); });
    if (v.some(function (x) { return !Number.isInteger(x) || x < 0 || x > 20; }) || v[0] < 1 || v[2] < 1 || v[1] > v[0] || v[3] > v[2]) {
      out.textContent = '請填入 1–20 個 criterion，且通過數不能大於總數。';
      return;
    }
    var mpa = v[1] / v[0], faa = v[3] / v[2], lambda = v[2] / (v[0] + v[2]);
    var penalty = lambda * (1 - faa), fama = Math.max(0, mpa - penalty);
    out.textContent = 'MPA = ' + mpa.toFixed(3) + '；FAA = ' + faa.toFixed(3) + '；λ = ' + lambda.toFixed(3) +
      '；過期記憶扣分 = ' + penalty.toFixed(3) + '；FAMA = ' + fama.toFixed(3) + '（' + (fama * 100).toFixed(1) + ' / 100）';
  }
  fields.forEach(function (el) { el.addEventListener('input', render); });
  render();
}());
