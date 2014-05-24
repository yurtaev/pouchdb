"use strict";

var adapter = require('./levelalt');

window.PouchDB.adapter(adapter.adapterName, adapter);
window.PouchDB.preferredAdapters.push(adapter.adapterName);
