'use strict';

var PouchDB = require('../..');
var Reporter = require('./perf.reporter');
var reporter = new Reporter();
var test = require('tape');
var randomizer = Math.random();

var testContext = {};

function padInt(i) {
  var intString = i.toString();
  while (intString.length < 10) {
    intString += '0' + intString;
  }
  return intString;
}

// so we don't have to generate them every time, which might throw off
// the perf numbers
var docIds = [];
for (var counter = 0; counter < 10000; counter++) {
  docIds.push('numero_' + padInt(counter));
}

var tapeLock = true;

function runTests(testName, callback) {

  var testCases = [
    {
      name : 'basic-inserts',
      assertions : 1,
      iterations : 100,
      setup : function (db, callback) {
        callback(null, {'yo': 'dawg'});
      },
      test : function (db, itr, doc, done) {
        db.put(doc, '' + itr, done);
      }
    }, {
      name : 'bulk-inserts',
      assertions : 1,
      iterations : 10,
      setup : function (db, callback) {
        var docs = [];
        for (var i = 0; i < 100; i++) {
          docs.push({much : 'docs', very : 'bulk'});
        }
        callback(null, {docs : docs});
      },
      test : function (db, itr, docs, done) {
        db.bulkDocs(docs, done);
      }
    }, {
      name : 'basic-gets',
      assertions : 1,
      iterations : 1000,
      setup : function (db, callback) {
        var docs = [];
        for (var i = 0; i < 1000; i++) {
          docs.push({_id : docIds[i], foo : 'bar', baz : 'quux'});
        }
        db.bulkDocs({docs : docs}, callback);
      },
      test : function (db, itr, docs, done) {
        db.get(docIds[itr], done);
      }
    }, {
      name : 'all-docs-skip-limit',
      assertions : 1,
      iterations : 50,
      setup : function (db, callback) {
        var docs = [];
        for (var i = 0; i < 1000; i++) {
          docs.push({_id : docIds[i], foo : 'bar', baz : 'quux'});
        }
        db.bulkDocs({docs : docs}, callback);
      },
      test : function (db, itr, docs, done) {
        db.allDocs({skip : itr, limit : 10}, done);
      }
    }, {
      name : 'all-docs-startkey-endkey',
      assertions : 1,
      iterations : 50,
      setup : function (db, callback) {
        var docs = [];
        for (var i = 0; i < 1000; i++) {
          docs.push({_id : docIds[i], foo : 'bar', baz : 'quux'});
        }
        db.bulkDocs({docs : docs}, callback);
      },
      test : function (db, itr, docs, done) {
        db.allDocs({
          startkey : docIds[itr],
          endkey : docIds[itr + 10]
        }, done);
      }
    }
  ];

  testCases.forEach(function (testCase, i) {
    test('benchmarking ' + testName, function (t) {

      var db;
      var setupObj;

      t.test('setup', function (t) {
        new testContext.PouchDB('test_' + randomizer).then(function (d) {
          db = d;
          testCase.setup(db, function (err, res) {
            setupObj = res;
            reporter.start(testCase);
            t.end();
          });
        });
      });

      var testCaseName = testCase.name + (testName ? (' for ' + testName): '');
      t.test(testCaseName, function (t) {
        t.plan(testCase.assertions);
        var num = 0;
        function after(err) {
          if (err) {
            t.error(err);
          }
          if (++num < testCase.iterations) {
            process.nextTick(function () {
              testCase.test(db, num, setupObj, after);
            });
          } else {
            t.ok(testCase.name + ' completed');
          }
        }
        testCase.test(db, num, setupObj, after);
      });
      t.test('teardown', function (t) {
        reporter.end(testCase);
        db.destroy(function () {
          t.end();
          if (i === testCases.length - 1) {
            reporter.complete();
            if (callback) {
              callback();
            }
          }
        });
      });
    });
  });

  if (window.location.hash) {
  // tapeLock test to keep tape from declaring the tests done
    test('tapeLock ' + Math.random(), function (t) {
      t.test('tapeLock ' + Math.random(), function (t) {
        tapeLock = true;
        t.plan(1);
        var timeout = setInterval(function () {
          if (!tapeLock) {
            clearInterval(timeout);
            t.ok('tapeLock test completed');
          }
        }, 100);
      });
    });
  }
}

if (!window.location.hash) {
  testContext.PouchDB = PouchDB;
  return runTests();
}

// run for particular build of PouchDB
var timestamp = window.location.hash.substring(1);

function runTestsForCommit() {
  var buildsUrl = require('./constants').buildsUrl;
  var pouchdbBuilds = new PouchDB(buildsUrl);

  var opts = {descending : true, limit : 2};
  if (timestamp !== 'latest') {
    opts.startkey = parseInt(timestamp, 10);
  }
  pouchdbBuilds.query('by_timestamp/by_timestamp', opts).then(function (res) {
    var commitId = res.rows[0].id;
    var trueTimestamp = res.rows[0].key;
    var nextTimestamp = res.rows[1] && res.rows[1].key;

    reporter.log('Running tests against commit ' +
      '<a href="https://github.com/pouchdb/pouchdb/commit/"' + commitId + '">' + commitId +
      '</a>&hellip;');

    delete global.PouchDB;
    var script = document.createElement('script');
    script.src = 'http://localhost:5984/pouchdb_builds/' + commitId + '/pouchdb.min.js';
    document.body.appendChild(script);
    var callbackTimer = setInterval(function () {
      if (typeof global.PouchDB === 'function') {
        testContext.PouchDB = global.PouchDB;
        clearInterval(callbackTimer);
        runTests(commitId, function () {
          var url = document.location.toString().replace(/\#.*$/, '#' + trueTimestamp);
          reporter.log('To re-run tests: ' + '<a href="' + url + '">' + url + '</a>');
          reporter = new Reporter();
          if (nextTimestamp) {
            timestamp = nextTimestamp;
            runTestsForCommit();
          }
          setTimeout(function () {
            tapeLock = false;
          }, 5000);

        });
      }
    }, 100);
  }).catch(function (err) {
      console.log(err);
    });
}

runTestsForCommit();