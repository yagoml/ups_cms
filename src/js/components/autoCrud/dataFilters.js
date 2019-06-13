var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(['jquery', 'underscore', 'backbone', ENV + "/js/components/windowPopup", ENV + "/js/components/loader", "text!src/templates/components/autoCrud/dataFiltersTpl.html"], function($, _, Backbone, WindowPopup, Loader, DataFiltersTpl) {
  var DataFilters;
  return DataFilters = (function(superClass) {
    extend(DataFilters, superClass);

    function DataFilters() {
      return DataFilters.__super__.constructor.apply(this, arguments);
    }

    DataFilters.prototype.template = _.template(DataFiltersTpl);

    DataFilters.prototype.initialize = function(options) {
      this.options = options;
      this.windowPopup = new WindowPopup;
      this.windowPopup.setWidth('70%');
      this.windowPopup.setTitle('Filtrar Dados');
      this.windowPopup.setContent(this.template);
      this.windowPopup.setButtons([
        {
          title: 'Cancelar',
          id: 'cancelar',
          "class": 'btn-default'
        }, {
          title: 'Filtrar',
          id: 'filtrar',
          "class": 'btn-primary'
        }
      ]);
      this.stopListening(this.windowPopup);
      return this.listenTo(this.windowPopup, 'clickButtonCall', this.buttonClick);
    };

    DataFilters.prototype.render = function() {
      return this.windowPopup.open();
    };

    DataFilters.prototype.prepareToFilter = function() {
      var evento;
      evento = {
        id_evento: this.windowPopup.$('#idDado').val(),
        tipo: this.windowPopup.$('#tipoDado').val()
      };
      return this.trigger('eventoFiltrado', evento);
    };

    DataFilters.prototype.buttonClick = function(e) {
      this.buttonLoader(e.target);
      if (e.target.id === 'filtrar') {
        this.prepareToFilter();
      }
      return this.windowPopup.close();
    };

    DataFilters.prototype.buttonLoader = function(button) {
      $(button).css('pointer-events', 'none');
      $(button).attr('disabled', true);
      return $(button).html((new Loader({
        "class": 'pLoader'
      })).show());
    };

    return DataFilters;

  })(WindowPopup);
});
