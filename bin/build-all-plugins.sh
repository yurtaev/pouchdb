#!/bin/sh

plugins="memory localstorage idb-alt"

UGLIFY=./node_modules/uglify-js/bin/uglifyjs
BROWSERIFY=./node_modules/.bin/browserify

for plugin in $plugins; do
  $BROWSERIFY lib/plugins/index.js \
    -r pouchdb-${plugin}:adapter-plugin \
    -o ./dist/pouchdb.${plugin}.js

  $UGLIFY dist/pouchdb.${plugin}.js \
    -mc > dist/pouchdb.${plugin}.min.js

done