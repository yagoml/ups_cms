var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(["jquery", "underscore", "backbone", ENV + "/js/router", "text!src/templates/admin/adminTpl.html", ENV + "/js/views/admin/menu", ENV + "/js/components/autoCrud/autoCrudView"], function($, _, Backbone, Router, AdminTpl, Menu, AutoCrudView) {
  var Admin;
  loadCss(baseUrl + "src/css/admin/admin.css");
  return Admin = (function(superClass) {
    extend(Admin, superClass);

    function Admin() {
      return Admin.__super__.constructor.apply(this, arguments);
    }

    Admin.prototype.tagName = "div";

    Admin.prototype.className = "container-fluid";

    Admin.prototype.template = _.template(AdminTpl);

    Admin.prototype.initialize = function(openedData) {
      if (openedData == null) {
        openedData = null;
      }
      return this.menu = new Menu(openedData);
    };

    Admin.prototype.delegateEvents = function() {
      return this.listenTo(this.menu, 'tableLinkAccess', this.autoCrudTable, this);
    };

    Admin.prototype.undelegateEvents = function() {
      return this.stopListening(this.menu, 'tableLinkAccess');
    };

    Admin.prototype.render = function() {
      this.$el.html(this.template);
      this.$('#listMenu').html(this.menu.render().$el);
      return this;
    };

    Admin.prototype.autoCrudTable = function(name) {
      return $('#panelContent').html((new AutoCrudView(name)).render().$el);
    };

    return Admin;

  })(Backbone.View);
});
