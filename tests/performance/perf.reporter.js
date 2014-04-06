'use strict';

var pre = document && document.getElementById('output');

function Reporter() {
  this.results = {};
}

function log(msg) {
  if (pre) {
    pre.innerHTML = pre.innerHTML + msg;
  }
}

Reporter.prototype.log = function (msg) {
  log('<br/>' + msg + '<br/>');
};
Reporter.prototype.start = function (testCase) {
  var key = testCase.name;
  log('Starting test: ' + key + ' with ' + testCase.assertions +
    ' assertions and ' + testCase.iterations + ' iterations... ');
  this.results[key] = {
    start: Date.now()
  };
};

Reporter.prototype.end = function (testCase) {
  var key = testCase.name;
  var obj = this.results[key];
  obj.end = Date.now();
  obj.duration = obj.end - obj.start;
  log('done in ' + obj.duration + 'ms\n');
};

Reporter.prototype.complete = function () {
  this.results.completed = true;
  console.log(this.results);
  log('\nTests Complete!\n\n');
};

module.exports = Reporter;