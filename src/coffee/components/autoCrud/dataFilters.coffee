define ['jquery', 'underscore', 'backbone'
	"#{ENV}/js/components/windowPopup"
	"#{ENV}/js/components/loader"
	"text!src/templates/components/autoCrud/dataFiltersTpl.html"
], ($, _, Backbone, WindowPopup, Loader, DataFiltersTpl) ->

	class DataFilters extends WindowPopup
		template: _.template DataFiltersTpl

		initialize: (@options) ->
			@windowPopup = new WindowPopup
			@windowPopup.setWidth '70%'
			@windowPopup.setTitle 'Filtrar Dados'
			@windowPopup.setContent @template
			@windowPopup.setButtons [
				{title: 'Cancelar', id: 'cancelar', class: 'btn-default'}
				{title: 'Filtrar', id: 'filtrar', class: 'btn-primary'}
			]

			@stopListening @windowPopup
			@listenTo @windowPopup, 'clickButtonCall', @buttonClick

		render: ->
			@windowPopup.open()

		prepareToFilter: ->
			evento =
				id_evento: @windowPopup.$('#idDado').val()
				tipo: @windowPopup.$('#tipoDado').val()

			@trigger 'eventoFiltrado', evento

		buttonClick: (e) ->
			@buttonLoader e.target
			if e.target.id is 'filtrar'
				@prepareToFilter()

			@windowPopup.close()

		buttonLoader: (button) ->
			# Desabilita e mostra Loader no botão
			$(button).css 'pointer-events', 'none'
			$(button).attr 'disabled', true
			$(button).html (new Loader class: 'pLoader').show()