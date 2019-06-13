var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(['jquery', 'underscore', 'backbone', 'text!src/templates/components/windowTpl.html'], function($, _, Backbone, WindowTpl) {
  var WindowPopup;
  loadCss("" + baseUrl + ENV + "/css/components/windowPopup.css");
  return WindowPopup = (function(superClass) {
    extend(WindowPopup, superClass);

    function WindowPopup() {
      return WindowPopup.__super__.constructor.apply(this, arguments);
    }

    WindowPopup.prototype.tagName = 'div';

    WindowPopup.prototype.className = 'windowPopup';

    WindowPopup.prototype.template = _.template(WindowTpl);

    WindowPopup.prototype.events = {
      'click .closeWindow': 'close',
      'click': 'closeOutClick',
      'click button': 'clickButtonCall'
    };

    WindowPopup.prototype.initialize = function(options) {
      this.options = options;
      return this.render();
    };

    WindowPopup.prototype.render = function() {
      return this.$el.html(this.template());
    };

    WindowPopup.prototype.setTitle = function(title) {
      return this.$('#windowTitle').html(title);
    };

    WindowPopup.prototype.setContent = function(content) {
      return this.$('#windowContent').html(content);
    };

    WindowPopup.prototype.setButtons = function(buttons) {
      var parsedButtons;
      parsedButtons = '';
      _.each(buttons, (function(_this) {
        return function(button) {
          return parsedButtons += '<button type="button" class="btn ' + button["class"] + '" id="' + button.id + '">' + button.title + '</button>';
        };
      })(this));
      return this.$('#windowButtons').html(parsedButtons);
    };

    WindowPopup.prototype.open = function() {
      return this.$el.css('display', 'flex');
    };

    WindowPopup.prototype.close = function() {
      return this.$el.remove();
    };

    WindowPopup.prototype.closeOutClick = function(e) {
      if (e.target.className === 'windowPopup') {
        return this.close();
      }
    };

    WindowPopup.prototype.clickButtonCall = function(e) {
      return this.trigger('clickButtonCall', e);
    };

    WindowPopup.prototype.setWidth = function(width) {
      return this.$('#windowContainer').css({
        width: width
      });
    };

    return WindowPopup;

  })(Backbone.View);
});
