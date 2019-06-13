var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(["jquery", "underscore", "backbone"], function($, _, Backbone) {
  var Router;
  Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      "admin(/)": "admin",
      "admin/autoCrud/:table(/)": "autoCrud",
      "admin/autoCrud/:table/new(/)": "autoCrudNew",
      "admin/autoCrud/:table/edit/:id(/)": "autoCrudEdit",
      "admin/autoCrud/:table/related/:related_table/:fk/:filterID(/)": "autoCrudRelated",
      "admin/autoCrud/:table/related/:related_table/:fk/:filterID/new(/)": "autoCrudRelatedNew"
    };

    Router.prototype.instances = {
      autoCrudView: {}
    };

    Router.prototype.autoCrudTable = '';

    Router.prototype.admin = function(openedData) {
      var defAdmin;
      defAdmin = $.Deferred();
      require([ENV + "/js/views/admin/admin"], function(Admin) {
        $("#mainContent").html((new Admin(openedData)).render().$el);
        return defAdmin.resolve();
      });
      return defAdmin.promise();
    };

    Router.prototype.autoCrud = function(options) {
      if (typeof options === 'string') {
        options = {
          table: options
        };
      }
      options.filterID = options.filterID || 0;
      options.renderTable = options.renderTable || true;
      options.edit = options.edit || false;
      options.newData = options.newData || false;
      options.parentTable = options.parentTable || false;
      if (options.table === 'config_site') {
        if (!options.edit) {
          window.location.hash = '#admin';
        }
      }
      return require([ENV + "/js/components/autoCrud/autoCrudView"], (function(_this) {
        return function(AutoCrudView) {
          if ($('#panelContent').length) {
            if (_.isEmpty(_this.instances.autoCrudView) || options.table !== _this.autoCrudTable || options.edit || options.newData) {
              $("#panelContent").html((_this.instances.autoCrudView = new AutoCrudView(options)).render().$el);
            } else {
              _this.instances.autoCrudView.renderTable();
            }
            return _this.autoCrudTable = options.table;
          } else {
            return $.when(_this.admin(options.table)).done(function() {
              if (_.isEmpty(_this.instances.autoCrudView) || options.table !== _this.autoCrudTable || options.edit || options.newData) {
                $("#panelContent").html((_this.instances.autoCrudView = new AutoCrudView(options)).render().$el);
              } else {
                _this.instances.autoCrudView.renderTable();
              }
              return _this.autoCrudTable = options.table;
            });
          }
        };
      })(this));
    };

    Router.prototype.autoCrudRelated = function(table, related_table, fk, filterID) {
      return this.autoCrud({
        table: related_table,
        fk: fk,
        filterID: filterID,
        parentTable: table
      });
    };

    Router.prototype.autoCrudRelatedNew = function(table, related_table, fk, filterID) {
      return this.autoCrud({
        table: related_table,
        fk: fk,
        filterID: filterID,
        parentTable: table
      });
    };

    Router.prototype.autoCrudEdit = function(table, id) {
      return this.autoCrud({
        table: table,
        filterID: id,
        edit: true
      });
    };

    Router.prototype.autoCrudNew = function(table) {
      return this.autoCrud({
        table: table,
        newData: true
      });
    };

    return Router;

  })(Backbone.Router);
  return new Router;
});
