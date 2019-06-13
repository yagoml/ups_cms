var extend = function(child, parent) {
	for (var key in parent) { 
		if (hasProp.call(parent, key)) child[key] = parent[key];
	} 
	function ctor() {
		 this.constructor = child; 
	}
	ctor.prototype = parent.prototype;
	child.prototype = new ctor();
	child.__super__ = parent.prototype; return child; 
},
hasProp = {}.hasOwnProperty;

define(["jquery", "underscore", "backbone", "text!src/templates/admin/eventos/eventos.html", ENV + "/js/admin/eventos/eventosModel", ENV + "/js/admin/eventos/eventosCollection", ENV + "/js/admin/eventos/tableEventos", ENV + "/js/admin/eventos/windowNewEvento", ENV + "/js/admin/eventos/windowEditEvento", ENV + "/js/admin/eventos/filtroEventos", ENV + "/js/components/loader", "text!src/templates/admin/eventos/windowNewEventoTpl.html", "text!src/templates/admin/eventos/windowEditEventoTpl.html", "text!dist/css/admin/eventos.css"], function($, _, Backbone, eventosTpl, Evento, Eventos, TableEventos, WindowNewEvento, WindowEditEvento, FiltroEventos, Loader, windowNewEventoTpl, windowEditEventoTpl, EventosCss) {
	var EventosView, URL, pLoader;
	URL = baseUrl + "eventos";
	pLoader = new Loader({
		"class": 'pLoader'
	});
	return EventosView = (function(superClass) {
		extend(EventosView, superClass);

		function EventosView() {
			return EventosView.__super__.constructor.apply(this, arguments);
		}

		EventosView.prototype.template = _.template(eventosTpl);

		EventosView.prototype.qtdEventos = 20;

		EventosView.prototype.events = {
			'click #editarEvento': 'openWindowEditEvento',
			'click #novoEvento': 'openWindowNewEvento',
			'click #filtrarEventos': 'openWindowFiltroEventos',
			'click #removerFiltro': 'removerFiltro'
		};

		EventosView.prototype.initialize = function() {
			this.model = new Evento;
			this.collection = new Eventos;
			this.reloadEvents();
			return this.collection.fetch({
				data: {
					pagina: 0
				},
				success: (function(_this) {
					return function() {
						_this.showQtdEventos();
						_this.checaNecessidadeBotoes();
						_this.renderTable();
						return _this.delegateEvents();
					};
				})(this)
			});
		};

		EventosView.prototype.delegateEvents = function() {
			EventosView.__super__.delegateEvents.apply(this, arguments);
			this.listenTo(this.tableEventos, 'eventoDeletado', this.deletarEvento.bind(this));
			return this.listenTo(this.tableEventos, 'eventosSolicitados', this.buscarEventos.bind(this));
		};

		EventosView.prototype.undelegateEvents = function() {
			EventosView.__super__.undelegateEvents.apply(this, arguments);
			this.stopListening(this.tableEventos, 'eventoDeletado');
			return this.stopListening(this.tableEventos, 'eventosSolicitados');
		};

		EventosView.prototype.render = function() {
			$('#panelContent').html(pLoader.show());
			$.when(loadCssInline(EventosCss)).then((function(_this) {
				return function() {
					_this.$el.html(_this.template);
					_this.buttons = _this.$('#buttonsArea').html();
					return _this.$('#buttonsArea').html(pLoader.show());
				};
			})(this));
			return this;
		};

		EventosView.prototype.checaNecessidadeBotoes = function() {
			if (this.collection.models.length === 0) {
				return this.$('#buttonsArea').remove();
			} else {
				return this.$('#buttonsArea').html(this.buttons);
			}
		};

		EventosView.prototype.reloadEvents = function() {
			this.undelegateEvents();
			return this.delegateEvents();
		};

		EventosView.prototype.openWindowEditEvento = function(event) {
			this.model = this.collection.findWhere({
				id_evento: this.$(event.target).attr('id-evento')
			});
			this.windowEditEvento = new WindowEditEvento({
				model: this.model.attributes
			});
			this.stopListening(this.windowEditEvento);
			this.listenTo(this.windowEditEvento, 'eventoEditado', this.editEvento.bind(this));
			return this.$('#eventosTable').append(this.windowEditEvento.render());
		};

		EventosView.prototype.openWindowNewEvento = function(event) {
			this.windowNewEvento = new WindowNewEvento({
				model: this.model
			});
			this.stopListening(this.windowNewEvento);
			this.listenTo(this.windowNewEvento, 'eventoAdicionado', this.addEvento.bind(this));
			return this.$('#eventosTableContent').append(this.windowNewEvento.render());
		};

		EventosView.prototype.openWindowFiltroEventos = function() {
			this.windowFiltroEventos = new FiltroEventos({
				model: this.model
			});
			this.stopListening(this.windowFiltroEventos);
			this.listenTo(this.windowFiltroEventos, 'eventoFiltrado', this.filtrarEventos.bind(this));
			return this.$('#eventosTableContent').append(this.windowFiltroEventos.render());
		};

		EventosView.prototype.addEvento = function(dadosEvento) {
			var evento;
			this.endTableLoader('show');
			evento = ((new Evento).set(dadosEvento)).attributes;
			return this.collection.create(evento, {
				wait: true,
				success: (function(_this) {
					return function(evento) {
						_this.tableEventos.addLinha(evento);
						return _this.endTableLoader('hide');
					};
				})(this)
			});
		};

		EventosView.prototype.editEvento = function(evento) {
			var novoEvento;
			this.tableEventos.loaderLinha(evento.id_evento);
			novoEvento = ((new Evento).set(evento)).attributes;
			return this.model.save(novoEvento, {
				wait: true,
				success: (function(_this) {
					return function() {
						return _this.tableEventos.editLinha(novoEvento);
					};
				})(this)
			});
		};

		EventosView.prototype.filtrarEventos = function(filtro) {
			return $.ajax({
				url: baseUrl + "eventos/filtro",
				type: 'POST',
				dataType: "json",
				data: filtro,
				success: (function(_this) {
					return function(eventosFiltrados) {
						_this.collection = new Eventos;
						_.each(eventosFiltrados, function(novoEvento) {
							return _this.collection.models.push((new Evento).set(novoEvento));
						});
						_this.renderTable();
						return _this.renderfiltroAplicado(filtro);
					};
				})(this)
			});
		};

		EventosView.prototype.deletarEvento = function(idEvento) {
			$.ajax({
				type: 'POST',
				data: {
					id: idEvento
				},
				url: URL
			});
			this.model = this.collection.at(this.collection.findIndex({
				id_evento: idEvento
			}));
			return this.model.destroy();
		};

		EventosView.prototype.renderTable = function() {
			this.$('#eventosTableContent').html(pLoader.show());
			this.tableEventos = new TableEventos(this.collection.models);
			return this.$('#eventosTableContent').html(this.tableEventos.render().$el);
		};

		EventosView.prototype.endTableLoader = function(command) {
			return this.tableEventos.endTableLoader(command);
		};

		EventosView.prototype.tableLoader = function(command) {
			switch (command) {
				case 'show':
					return this.$('#eventosTableContent').html(pLoader.show());
			}
		};

		EventosView.prototype.renderfiltroAplicado = function(filtro) {
			var filtroInfos;
			filtroInfos = [];
			this.$('#titleFiltro').css('display', 'block');
			if (filtro.id_evento.length > 0) {
				filtroInfos.push("ID Evento: <span class='pad5 alert-info'>" + filtro.id_evento + "</span>");
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

		EventosView.prototype.removerFiltro = function() {
			this.$('#eventosTableContent').html(pLoader.show());
			this.initialize();
			this.$('#titleFiltro').css('display', 'none');
			return this.$('#filtroInfos').html('');
		};

		EventosView.prototype.showQtdEventos = function() {
			return this.$('#qtdEventos').html(this.collection.models.length);
		};

		EventosView.prototype.buscarEventos = function(pagina) {
			return $.ajax({
				type: 'GET',
				dataType: 'json',
				url: baseUrl + "eventos",
				data: pagina,
				success: (function(_this) {
					return function(eventos) {
						if (eventos.length !== 0) {
							return _.each(eventos, function(evento, index) {
								var eventoModel;
								eventoModel = new Evento;
								eventoModel.set('id_evento', evento.id_evento);
								eventoModel.set('tipo', evento.tipo);
								_this.collection.models.push(eventoModel);
								_this.tableEventos.addLinha(eventoModel.attributes);
								if (index === (eventos.length - 1)) {
									_this.tableEventos.paginationControls.requisicaoAtiva = false;
									_this.qtdEventos += eventos.length;
									return _this.$('#qtdEventos').html(_this.qtdEventos);
								}
							});
						} else {
							_this.tableEventos.paginationControls.limiteBuscaAtingido = true;
							return false;
						}
					};
				})(this)
			});
		};

		return EventosView;

	})(Backbone.View);
});
