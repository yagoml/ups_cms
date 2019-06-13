var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(['jquery', 'underscore', 'backbone', ENV + "/js/components/loader"], function($, _, Backbone, Loader) {
  var DataTable, EMPTY_TABLE, LinhaView;
  EMPTY_TABLE = "<div class='alert'>Sem dados cadastrados.</div>";
  LinhaView = (function(superClass) {
    extend(LinhaView, superClass);

    function LinhaView() {
      return LinhaView.__super__.constructor.apply(this, arguments);
    }

    LinhaView.prototype.tagName = 'tr';

    LinhaView.prototype.template = _.template("<td><input type=\"checkbox\" class=\"dado-selector\"></td>\n<% _.each(keys, (key) => { %>\n	<td title='<%= dado.get(key) %>'>\n		<div class='dado-wrapper'>\n			<% if(regexFileDir.test(dado.get(key))) { %>\n				<a href='<%= baseUrl + dado.get(key) %>' target='blank'><%= dado.get(key).replace('uploads/', '') %></a>\n			<% } else { %>\n				<%= dado.get(key).replace(/<[^>]*>/ig, \"\") %>\n			<% } %>\n		</div>\n	</td>\n<% }); %>\n<td>\n	<div class='dado-wrapper dado-ordem'>\n		<%= dado.get('ordem') %>\n	</div>\n</td>\n<td>\n	<div style=\"width: 70px; margin-top: 3.5px;\">\n		<i title=\"Expandir item\" class=\"glyphicon glyphicon-chevron-down\"></i>\n		<i title=\"Aumentar prioridade\" class=\"glyphicon glyphicon-arrow-up\"></i>\n		<i title=\"Diminuir prioridade\" class=\"glyphicon glyphicon-arrow-down\"></i>\n		<i title=\"Excluir item\" class=\"glyphicon glyphicon-trash remove-data\"></i>\n	</div>\n</td>");

    LinhaView.prototype.events = {
      'change .dado-selector': 'toggleCheckItem',
      'click': 'openEditDado',
      'click .remove-data': 'removeData',
      'click .glyphicon-arrow-up': 'addOrder',
      'click .glyphicon-arrow-down': 'subOrder',
      'click .glyphicon-chevron-down': 'expandLine',
      'click .glyphicon-chevron-up': 'retractLine'
    };

    LinhaView.prototype.initialize = function(model1, keys, pk) {
      this.model = model1;
      this.keys = keys;
      this.pk = pk;
    };

    LinhaView.prototype.render = function() {
      this.$el.html(this.template({
        dado: this.model,
        keys: this.keys,
        regexFileDir: new RegExp('uploads/', 'ig')
      }));
      return this;
    };

    LinhaView.prototype.openEditDado = function(e) {
      if ($(e.target).is('input.dado-selector') || $(e.target)[0].nodeName === 'I' || $(e.target).is('.dado-wrapper a')) {
        return;
      }
      return this.trigger('openEditData', this.model);
    };

    LinhaView.prototype.toggleCheckItem = function(e) {
      this.model.set('checked', $(e.target).prop('checked'));
      return this.trigger('itemChecked', this.model);
    };

    LinhaView.prototype.removeData = function() {
      if (window.confirm("Deseja realmente excluir o registro #" + (this.model.get(this.pk)) + "?")) {
        this.trigger('removeData', this.model);
        return this.remove();
      }
    };

    LinhaView.prototype.addOrder = function(e) {
      this.model.set('ordem', parseInt(this.model.get('ordem')) + 1);
      this.$('.dado-ordem').html(this.model.get('ordem'));
      this.$el.attr('ordem', this.model.get('ordem'));
      return this.trigger('addOrder', {
        model: this.model,
        e: e,
        view: this
      });
    };

    LinhaView.prototype.subOrder = function(e) {
      this.model.set('ordem', parseInt(this.model.get('ordem')) - 1);
      this.$('.dado-ordem').html(this.model.get('ordem'));
      this.$el.attr('ordem', this.model.get('ordem'));
      return this.trigger('subOrder', {
        model: this.model,
        e: e,
        view: this
      });
    };

    LinhaView.prototype.expandLine = function() {
      return _.each(this.$('.dado-wrapper'), (function(_this) {
        return function(dadoWrap) {
          var $dadoWrap, $icon;
          $dadoWrap = $(dadoWrap);
          $icon = _this.$('.glyphicon-chevron-down');
          $dadoWrap.css({
            'white-space': 'normal'
          });
          $icon.addClass('glyphicon-chevron-up');
          return $icon.removeClass('glyphicon-chevron-down');
        };
      })(this));
    };

    LinhaView.prototype.retractLine = function() {
      return _.each(this.$('.dado-wrapper'), (function(_this) {
        return function(dadoWrap) {
          var $dadoWrap, $icon;
          $dadoWrap = $(dadoWrap);
          $icon = _this.$('.glyphicon-chevron-up');
          $dadoWrap.css({
            'white-space': 'nowrap'
          });
          $icon.addClass('glyphicon-chevron-down');
          return $icon.removeClass('glyphicon-chevron-up');
        };
      })(this));
    };

    return LinhaView;

  })(Backbone.View);
  return DataTable = (function(superClass) {
    extend(DataTable, superClass);

    function DataTable() {
      return DataTable.__super__.constructor.apply(this, arguments);
    }

    DataTable.prototype.className = 'table-responsive';

    DataTable.prototype.linhas = [];

    DataTable.prototype.events = {
      'change #dadosSelectAll': 'selectAll'
    };

    DataTable.prototype.initialize = function(options) {
      var ref;
      this.options = options;
      ref = this.options, this.dados = ref.dados, this.systemFields = ref.systemFields, this.tableTitles = ref.tableTitles, this.pk = ref.pk, this.fk = ref.fk, this.fks = ref.fks;
      return this.selectAllState = false;
    };

    DataTable.prototype.render = function() {
      var template;
      if (this.dados.models.length) {
        this.keys = [];
        template = '<table class="table table-bordered table-striped table-hover dadosTable"><thead><tr><th><input type="checkbox" id="dadosSelectAll"></th>';
        _.each(_.keys(_.first(this.dados.models).attributes), (function(_this) {
          return function(key) {
            var gurmetTitle, isFk, isSystemField, ref;
            isSystemField = _this.systemFields.includes(key);
            isFk = _.findWhere(_this.fks, {
              COLUMN_NAME: key
            });
            if (!isSystemField && !isFk) {
              _this.keys.push(key);
              gurmetTitle = capitalize(key).replace(/(?![a-zA-Z0-9])./g, ' ');
              template += "<th>" + (_this.tableTitles != null ? ((ref = _.findWhere(_this.tableTitles, {
                campo: key
              })) != null ? ref.nome : void 0) || gurmetTitle : gurmetTitle);
              +"</th>";
            }
            if (key === _this.pk) {
              _this.keys.push(key);
              return template += "<th>ID</th>";
            }
          };
        })(this));
        template += '<th title="Prioridade">Prio.</th>';
        template += '<th>Ações</th></tr></thead><tbody></tbody></table>';
        this.$el.first('tr').append(template);
        _.each(this.dados.models, (function(_this) {
          return function(dado) {
            return _this.addLinha(dado);
          };
        })(this));
      } else {
        this.$el.html(EMPTY_TABLE);
      }
      return this;
    };

    DataTable.prototype.addLinhaTpl = function(dado) {
      var linhaView;
      this.linhas.push(linhaView = new LinhaView(dado, this.keys, this.pk));
      this.listenTo(linhaView, 'openEditData', (function(_this) {
        return function(model) {
          _this.$el.prepend((new Loader({
            "class": 'mLoader'
          })).show());
          return _this.trigger('openEditData', model);
        };
      })(this));
      this.listenTo(linhaView, 'itemChecked', (function(_this) {
        return function(model) {
          return _this.trigger('itemChecked', [model]);
        };
      })(this));
      this.listenTo(linhaView, 'removeData', (function(_this) {
        return function(model) {
          return _this.trigger('removeData', [model]);
        };
      })(this));
      this.listenTo(linhaView, 'addOrder', (function(_this) {
        return function(data) {
          _this.trigger('addOrder', data.model);
          return _this.upLine(data);
        };
      })(this));
      this.listenTo(linhaView, 'subOrder', (function(_this) {
        return function(data) {
          _this.trigger('subOrder', data.model);
          return _this.downLine(data);
        };
      })(this));
      return linhaView.render().$el;
    };

    DataTable.prototype.editLinhaTpl = function(dado, linhaView) {
      this.listenTo(linhaView, 'openEditData', (function(_this) {
        return function(model) {
          _this.$el.prepend((new Loader({
            "class": 'mLoader'
          })).show());
          return _this.trigger('openEditData', model);
        };
      })(this));
      this.listenTo(linhaView, 'itemChecked', (function(_this) {
        return function(model) {
          return _this.trigger('itemChecked', model);
        };
      })(this));
      this.listenTo(linhaView, 'removeData', (function(_this) {
        return function(model) {
          return _this.trigger('removeData', [model]);
        };
      })(this));
      return linhaView.render().$el;
    };

    DataTable.prototype.updateLinha = function(model) {
      var idx, linhaTpl, linhaView, rowIndex;
      idx = _.findIndex(this.linhas, {
        model: model
      });
      rowIndex = this.linhas[idx].$el[0].rowIndex - 1;
      linhaView = new LinhaView(model, this.keys, this.pk);
      linhaTpl = this.editLinhaTpl(model, linhaView);
      $(this.$('tbody')[0].children[rowIndex]).replaceWith(linhaTpl);
      this.linhas[idx].remove();
      this.linhas[idx] = linhaView;
      return this.ellipsisTableData();
    };

    DataTable.prototype.addLinha = function(model) {
      return this.$('tbody').append(this.addLinhaTpl(model));
    };

    DataTable.prototype.delegateEvents = function() {
      DataTable.__super__.delegateEvents.apply(this, arguments);
      if (_.any(this.linhas)) {
        return _.each(this.linhas, (function(_this) {
          return function(linha) {
            return linha.delegateEvents();
          };
        })(this));
      }
    };

    DataTable.prototype.undelegateEvents = function() {
      DataTable.__super__.undelegateEvents.apply(this, arguments);
      if (_.any(this.linhas)) {
        return _.each(this.linhas, (function(_this) {
          return function(linha) {
            return linha.undelegateEvents();
          };
        })(this));
      }
    };

    DataTable.prototype.editLinha = function(dado) {
      return this.linhas[dado.id_dado].$el.children('td').eq(1).html(dado.tipo);
    };

    DataTable.prototype.loaderLinha = function(idDado) {
      return this.linhas[idDado].$el.children('td').eq(1).html((new Loader({
        "class": 'pLoader'
      })).show());
    };

    DataTable.prototype.endTableLoader = function(command) {
      switch (command) {
        case 'show':
          return this.$el.append("<tr class='dataTableLoader'><td colspan='3'>" + ((new Loader({
            "class": 'pLoader'
          })).show()) + "</td></tr>");
        case 'hide':
          return this.$('.dataTableLoader').remove();
      }
    };

    DataTable.prototype.checkEmptyTable = function() {
      if (!this.dados.models.length) {
        return this.$el.html(EMPTY_TABLE);
      }
    };

    DataTable.prototype.ellipsisTableData = function() {
      return _.each(this.$('.dado-wrapper'), (function(_this) {
        return function(dadoWrap) {
          dadoWrap = $(dadoWrap);
          return dadoWrap.css({
            'white-space': 'nowrap',
            'width': (dadoWrap.width()) + "px"
          });
        };
      })(this));
    };

    DataTable.prototype.removeLines = function(models) {
      return _.each(models, (function(_this) {
        return function(model) {
          var idx;
          idx = _.findIndex(_this.linhas, {
            model: model
          });
          _this.linhas[idx].remove();
          return _this.linhas.splice(idx, 1);
        };
      })(this));
    };

    DataTable.prototype.upLine = function(data) {
      var $line, $prevLine, $target;
      $target = $(data.e.target);
      $line = $target.closest('tr');
      $prevLine = $line.prev('tr');
      if (parseInt($prevLine.attr('ordem')) < parseInt($line.attr('ordem'))) {
        data.view.remove();
        $prevLine.before(data.view.render().$el);
        data.view.delegateEvents();
        return _.each(data.view.$('.dado-wrapper'), (function(_this) {
          return function(dadoWrap) {
            dadoWrap = $(dadoWrap);
            return dadoWrap.css({
              'white-space': 'nowrap',
              'width': (dadoWrap.width()) + "px"
            });
          };
        })(this));
      }
    };

    DataTable.prototype.downLine = function(data) {
      var $line, $nextLine, $target;
      $target = $(data.e.target);
      $line = $target.closest('tr');
      $nextLine = $line.next('tr');
      if (parseInt($nextLine.attr('ordem')) > parseInt($line.attr('ordem'))) {
        data.view.remove();
        $nextLine.after(data.view.render().$el);
        data.view.delegateEvents();
        return _.each(data.view.$('.dado-wrapper'), (function(_this) {
          return function(dadoWrap) {
            dadoWrap = $(dadoWrap);
            return dadoWrap.css({
              'white-space': 'nowrap',
              'width': (dadoWrap.width()) + "px"
            });
          };
        })(this));
      }
    };

    DataTable.prototype.selectAll = function() {
      var $dadoCheck, models;
      this.selectAllState = !this.selectAllState;
      $dadoCheck = this.$('.dado-selector');
      _.each($dadoCheck, (function(_this) {
        return function(checkbox) {
          var $checkbox;
          $checkbox = $(checkbox);
          return $checkbox[0].checked = _this.selectAllState;
        };
      })(this));
      models = [];
      _.each(this.linhas, (function(_this) {
        return function(linha) {
          linha.model.set('checked', _this.selectAllState);
          return models.push(linha.model);
        };
      })(this));
      return this.trigger('itemChecked', models);
    };

    return DataTable;

  })(Backbone.View);
});
