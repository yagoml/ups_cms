var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(['jquery', 'underscore', 'backbone', ENV + "/js/router", "text!src/templates/admin/menu.html", "text!" + ENV + "/css/admin/menu.css"], function($, _, Backbone, Router, MenuTpl, MenuCss) {
  var Menu;
  return Menu = (function(superClass) {
    extend(Menu, superClass);

    function Menu() {
      return Menu.__super__.constructor.apply(this, arguments);
    }

    Menu.prototype.template = _.template(MenuTpl);

    Menu.prototype.events = {
      'click .menu-parent, .submenu-indicator': 'toggleDropMenu',
      'click .link-menu': 'redirectTable'
    };

    Menu.prototype.initialize = function(openedData) {
      this.openedData = openedData != null ? openedData : null;
    };

    Menu.prototype.render = function() {
      $.when.apply($, [loadCssInline(MenuCss), this.getCmsTables()]).then((function(_this) {
        return function() {
          _this.$el.html(_this.template({
            tables: _this.tables,
            openedData: _this.openedData != null ? _this.openedData : void 0
          }));
          return _this.checkOpenedData();
        };
      })(this));
      return this;
    };

    Menu.prototype.getCmsTables = function() {
      return $.ajax({
        type: 'post',
        dataType: 'json',
        url: baseUrl + "tableInfos/cmsTables",
        success: (function(_this) {
          return function(tables) {
            _this.tables = tables;
          };
        })(this)
      });
    };

    Menu.prototype.toggleDropMenu = function(e) {
      var $target, toggleTime;
      e.stopPropagation();
      e.preventDefault();
      $target = $(e.target);
      toggleTime = 200;
      if ($target.hasClass('submenu-indicator')) {
        $target = $target.parent();
      }
      if ($target.hasClass('opened')) {
        $target.next('.submenu').slideUp(toggleTime);
        $target.removeClass('opened');
        return $target.removeClass('submenu-indicator-minus');
      } else {
        $target.next('.submenu').slideDown(toggleTime);
        $target.addClass('opened');
        return $target.addClass('submenu-indicator-minus');
      }
    };

    Menu.prototype.checkOpenedData = function() {
      var $subMenu;
      $subMenu = this.$('.selected-menu').closest('.submenu');
      $subMenu.show();
      return $subMenu.prev('.menu-parent').addClass('opened submenu-indicator-minus');
    };

    Menu.prototype.redirectTable = function(e) {
      var table;
      table = $(e.target).attr('ref');
      this.toggleOpenedData(table);
      return window.location.hash = "#admin/autoCrud/" + table;
    };

    Menu.prototype.toggleOpenedData = function(table) {
      this.$('.selected-menu').removeClass('selected-menu');
      return _.each(this.$('.link-menu'), (function(_this) {
        return function(link) {
          var $link;
          $link = $(link);
          if ($link.attr('ref') === table) {
            return $link.addClass('selected-menu');
          }
        };
      })(this));
    };

    return Menu;

  })(Backbone.View);
});
