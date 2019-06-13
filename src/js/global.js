var capitalize, delay, loadCss, loadCssInline, waitCssInlineLoad, waitFor;

document.body.addEventListener('keydown', function(e) {
  if (e.which === 27) {
    return $('.windowPopup').remove();
  }
});

loadCss = function(url, callback) {
  var link;
  link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = url;
  if (callback != null) {
    link.onload = callback.call();
  }
  return document.getElementsByTagName("head")[0].appendChild(link);
};

waitCssInlineLoad = function(load, callback) {
  return setTimeout(((function(_this) {
    return function() {
      if (load.outerText.length === 0) {
        return waitLoad(load, callback);
      } else {
        return callback.call();
      }
    };
  })(this)), 25);
};

loadCssInline = function(css) {
  var defer, load, style;
  defer = $.Deferred();
  style = document.createElement("style");
  style.type = "text/css";
  style.rel = "stylesheet";
  style.innerHTML = css;
  load = document.body.insertBefore(style, document.body.firstChild);
  waitCssInlineLoad(load, (function(_this) {
    return function() {
      return defer.resolve();
    };
  })(this));
  return defer.promise();
};

delay = (function() {
  var timer;
  timer = 0;
  return (function(_this) {
    return function(callback, ms) {
      clearTimeout(timer);
      return timer = setTimeout(callback, ms);
    };
  })(this);
})();

waitFor = function(cond, callback) {
  return setTimeout(((function(_this) {
    return function() {
      if (!cond) {
        return waitFor(cond, callback);
      } else {
        return callback.call();
      }
    };
  })(this)), 25);
};

capitalize = function(string) {
  string = String(string);
  return string.charAt(0).toUpperCase() + string.slice(1);
};
