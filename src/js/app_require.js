var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(["text", "global", ENV + "/js/components/loader"], function(text, global, Loader) {
  loadCss(baseUrl + "lib/bootstrap/bootstrap.min.css");
  return require(["jquery", "underscore", "backbone", ENV + "/js/router", "text!src/templates/app.html"], (function(_this) {
    return function($, _, Backbone, Router, AppTpl) {
      var App;
      loadCss("" + baseUrl + ENV + "/css/yagoml_frame_styles.css");
      loadCss("" + baseUrl + ENV + "/css/style.css");
      App = (function(superClass) {
        extend(App, superClass);

        function App() {
          return App.__super__.constructor.apply(this, arguments);
        }

        App.prototype.template = _.template(AppTpl);

        App.prototype.initialize = function() {
          Backbone.history.start();
          return this.render();
        };

        App.prototype.render = function() {
          return $('body').html(this.template);
        };

        return App;

      })(Backbone.View);
      return new App;
    };
  })(this));
});
