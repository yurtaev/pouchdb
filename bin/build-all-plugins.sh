#!/bin/sh

plugins="memory localstorage idb-alt"

UGLIFY=./node_modules/uglify-js/bin/uglifyjs
BROWSERIFY=./node_modules/.bin/browserify

for plugin in $plugins; do
  $BROWSERIFY lib/plugin.js \
    -r ./lib/deps/migrate-browser.js:../deps/migrate \
    -r ./lib/deps/migrate-browser.js:../adapters/../deps/migrate \
    -r ./lib/deps/migrate.js:./lib/deps/migrate-browser.js \
    -r pouchdb-${plugin}:adapter-plugin \
    -o ./dist/pouchdb.${plugin}.js

  $UGLIFY dist/pouchdb.${plugin}.js \
    -mc > dist/pouchdb.${plugin}.min.js

done