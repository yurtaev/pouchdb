chrome.app.runtime.onLaunched.addListener(function () {
  chrome.app.window.create('www/tests/test.html', {
    'bounds': {
      'width': 800,
      'height': 600
    }
  });
});
