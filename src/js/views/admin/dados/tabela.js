var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(["jquery", "underscore", "backbone", "text!src/templates/components/autoCrud/dados.html", ENV + "/js/components/autoCrud/tableDados", ENV + "/js/components/autoCrud/windowNewDado", ENV + "/js/components/autoCrud/windowEditDado", ENV + "/js/components/autoCrud/filtroDados", ENV + "/js/components/loader", "text!src/templates/components/autoCrud/windowNewDadoTpl.html", "text!src/templates/components/autoCrud/windowEditDadoTpl.html", "text!" + ENV + "/css/components/autoCrud.css"], function($, _, Backbone, eventosTpl, TableDados, WindowNewDado, WindowEditDado, FiltroDados, Loader, windowNewDadoTpl, windowEditDadoTpl, AutoCrudCss) {
  var TabelaView, URL, pLoader;
  URL = baseUrl + "dados";
  pLoader = new Loader({
    "class": 'pLoader'
  });
  return TabelaView = (function(superClass) {
    extend(TabelaView, superClass);

    function TabelaView() {
      return TabelaView.__super__.constructor.apply(this, arguments);
    }

    TabelaView.prototype.template = _.template(eventosTpl);

    TabelaView.prototype.qtdDados = 20;

    TabelaView.prototype.events = {
      'click #editarDado': 'openWindowEditDado',
      'click #novoDado': 'openWindowNewDado',
      'click #filtrarDados': 'openWindowFiltroDados',
      'click #removerFiltro': 'removerFiltro'
    };

    TabelaView.prototype.initialize = function() {
      this.model = new Backbone.Model;
      this.collection = new Backbone.Collection;
      this.collection.model = this.model;
      this.collection.url = baseUrl + "dados/tabela";
      this.reloadEvents();
      return this.collection.fetch({
        data: {
          pagina: 0
        },
        success: (function(_this) {
          return function() {
            _this.showQtdDados();
            _this.checaNecessidadeBotoes();
            _this.renderTable();
            return _this.delegateEvents();
          };
        })(this)
      });
    };

    TabelaView.prototype.delegateEvents = function() {
      TabelaView.__super__.delegateEvents.apply(this, arguments);
      this.listenTo(this.tableDados, 'eventoDeletado', this.deletarDado.bind(this));
      return this.listenTo(this.tableDados, 'eventosSolicitados', this.buscarDados.bind(this));
    };

    TabelaView.prototype.undelegateEvents = function() {
      TabelaView.__super__.undelegateEvents.apply(this, arguments);
      this.stopListening(this.tableDados, 'eventoDeletado');
      return this.stopListening(this.tableDados, 'eventosSolicitados');
    };

    TabelaView.prototype.render = function() {
      $('#panelContent').html(pLoader.show());
      $.when(loadCssInline(AutoCrudCss)).then((function(_this) {
        return function() {
          _this.$el.html(_this.template);
          _this.buttons = _this.$('#buttonsArea').html();
          return _this.$('#buttonsArea').html(pLoader.show());
        };
      })(this));
      return this;
    };

    TabelaView.prototype.checaNecessidadeBotoes = function() {
      if (this.collection.models.length === 0) {
        return this.$('#buttonsArea').remove();
      } else {
        return this.$('#buttonsArea').html(this.buttons);
      }
    };

    TabelaView.prototype.reloadEvents = function() {
      this.undelegateEvents();
      return this.delegateEvents();
    };

    TabelaView.prototype.openWindowEditDado = function(event) {
      this.model = this.collection.findWhere({
        id_evento: this.$(event.target).attr('id-evento')
      });
      this.windowEditDado = new WindowEditDado({
        model: this.model.attributes
      });
      this.stopListening(this.windowEditDado);
      this.listenTo(this.windowEditDado, 'eventoEditado', this.editDado.bind(this));
      return this.$('#eventosTable').append(this.windowEditDado.render());
    };

    TabelaView.prototype.openWindowNewDado = function(event) {
      this.windowNewDado = new WindowNewDado({
        model: this.model
      });
      this.stopListening(this.windowNewDado);
      this.listenTo(this.windowNewDado, 'eventoAdicionado', this.addDado.bind(this));
      return this.$('#eventosTableContent').append(this.windowNewDado.render());
    };

    TabelaView.prototype.openWindowFiltroDados = function() {
      this.windowFiltroDados = new FiltroDados({
        model: this.model
      });
      this.stopListening(this.windowFiltroDados);
      this.listenTo(this.windowFiltroDados, 'eventoFiltrado', this.filtrarDados.bind(this));
      return this.$('#eventosTableContent').append(this.windowFiltroDados.render());
    };

    TabelaView.prototype.addDado = function(dadosDado) {
      var evento;
      this.endTableLoader('show');
      evento = ((new Dado).set(dadosDado)).attributes;
      return this.collection.create(evento, {
        wait: true,
        success: (function(_this) {
          return function(evento) {
            _this.tableDados.addLinha(evento);
            return _this.endTableLoader('hide');
          };
        })(this)
      });
    };

    TabelaView.prototype.editDado = function(evento) {
      var novoDado;
      this.tableDados.loaderLinha(evento.id_evento);
      novoDado = ((new Dado).set(evento)).attributes;
      return this.model.save(novoDado, {
        wait: true,
        success: (function(_this) {
          return function() {
            return _this.tableDados.editLinha(novoDado);
          };
        })(this)
      });
    };

    TabelaView.prototype.filtrarDados = function(filtro) {
      return $.ajax({
        url: baseUrl + "dados/filtro",
        type: 'POST',
        dataType: "json",
        data: filtro,
        success: (function(_this) {
          return function(eventosFiltrados) {
            _this.collection = new Dados;
            _.each(eventosFiltrados, function(novoDado) {
              return _this.collection.models.push((new Dado).set(novoDado));
            });
            _this.renderTable();
            return _this.renderfiltroAplicado(filtro);
          };
        })(this)
      });
    };

    TabelaView.prototype.deletarDado = function(idDado) {
      $.ajax({
        type: 'POST',
        data: {
          id: idDado
        },
        url: URL
      });
      this.model = this.collection.at(this.collection.findIndex({
        id_evento: idDado
      }));
      return this.model.destroy();
    };

    TabelaView.prototype.renderTable = function() {
      this.$('#eventosTableContent').html(pLoader.show());
      this.tableDados = new TableDados(this.collection.models);
      return this.$('#eventosTableContent').html(this.tableDados.render().$el);
    };

    TabelaView.prototype.endTableLoader = function(command) {
      return this.tableDados.endTableLoader(command);
    };

    TabelaView.prototype.tableLoader = function(command) {
      switch (command) {
        case 'show':
          return this.$('#eventosTableContent').html(pLoader.show());
      }
    };

    TabelaView.prototype.renderfiltroAplicado = function(filtro) {
      var filtroInfos;
      filtroInfos = [];
      this.$('#titleFiltro').css('display', 'block');
      if (filtro.id_evento.length > 0) {
        filtroInfos.push("ID Dado: <span class='pad5 alert-info'>" + filtro.id_evento + "</span>");
      }
      if (filtro.tipo.length > 0) {
        filtroInfos.push("Tipo contém: <span class='pad5 alert-info'>" + filtro.tipo + "</span>");
      }
      return _.each(filtroInfos, (function(_this) {
        return function(filtroInfo) {
          return _this.$('#filtroInfos').append("<li>" + filtroInfo + "</li>");
        };
      })(this));
    };

    TabelaView.prototype.removerFiltro = function() {
      this.$('#eventosTableContent').html(pLoader.show());
      this.initialize();
      this.$('#titleFiltro').css('display', 'none');
      return this.$('#filtroInfos').html('');
    };

    TabelaView.prototype.showQtdDados = function() {
      return this.$('#qtdDados').html(this.collection.models.length);
    };

    TabelaView.prototype.buscarDados = function(pagina) {
      return $.ajax({
        type: 'GET',
        dataType: 'json',
        url: baseUrl + "dados",
        data: pagina,
        success: (function(_this) {
          return function(dados) {
            if (dados.length !== 0) {
              return _.each(dados, function(evento, index) {
                var eventoModel;
                eventoModel = new Dado;
                eventoModel.set('id_evento', evento.id_evento);
                eventoModel.set('tipo', evento.tipo);
                _this.collection.models.push(eventoModel);
                _this.tableDados.addLinha(eventoModel.attributes);
                if (index === (dados.length - 1)) {
                  _this.tableDados.paginationControls.requisicaoAtiva = false;
                  _this.qtdDados += dados.length;
                  return _this.$('#qtdDados').html(_this.qtdDados);
                }
              });
            } else {
              _this.tableDados.paginationControls.limiteBuscaAtingido = true;
              return false;
            }
          };
        })(this)
      });
    };

    return TabelaView;

  })(Backbone.View);
});
