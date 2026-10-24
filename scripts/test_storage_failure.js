// A failed chapter write must stay visibly unsaved and keep the previous record.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('assets/site.js', 'utf8');
const begin = source.indexOf('  var store = {');
const end = source.indexOf('  // dates for the review schedule', begin);
assert.ok(begin >= 0 && end > begin);
const listeners = {};
let warning;
const document = {
  getElementById() { return warning; },
  createElement() { return { setAttribute(k,v) { this[k]=v; } }; },
  body: { appendChild(x) { warning=x; } }
};
const window = {
  addEventListener(k, fn) { listeners[k]=fn; },
  dispatchEvent(event) { if (listeners[event.type]) listeners[event.type](event); }
};
const CustomEvent = class { constructor(type, options) { this.type=type; this.detail=options.detail; } };
const localStorage = {
  getItem() { return '["s-route"]'; },
  setItem() { throw Error('QuotaExceededError'); }
};
vm.runInNewContext(source.slice(begin,end), {window,document,localStorage,CustomEvent});
assert.equal(window.StudyStore.set('study:2601.18642:done',['s-route','s-problem']),false);
assert.match(warning.textContent,/無法寫入/);
assert.equal(warning.role,'alert');
assert.deepEqual(Array.from(window.StudyStore.get('study:2601.18642:done',[])),['s-route']);
console.log('Storage failure: prior progress preserved and visible warning passed.');
