"use strict";

var leveldown = require('adapter-plugin');
var factory = require('pouchdb-abstract-adapter');
var LevelPouch = require('./adapters/leveldb.js');

var adapter = factory(leveldown, LevelPouch);

window.PouchDB.adapter(adapter);