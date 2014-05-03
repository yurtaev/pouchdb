'use strict';

var errors = require('../../deps/errors');

module.exports = {
  idbError : function (callback) {
    return function (event) {
      var message = (event.target && event.target.error &&
        event.target.error.name) || event.target;
      callback(errors.error(errors.IDB_ERROR, message, event.type));
    };
  },
  openReqList : {},
  cachedDBs : {}
};