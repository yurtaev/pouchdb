'use strict';

(function () {
  window.mocha.setup({
    timeout: 100000,
    ui: 'bdd'
  });
  window.should = chai.should();  
})();

