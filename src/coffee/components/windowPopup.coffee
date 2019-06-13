define ['jquery', 'underscore', 'backbone'
	'text!src/templates/components/windowTpl.html'
], ($, _, Backbone, WindowTpl) ->

	loadCss "#{baseUrl}#{ENV}/css/components/windowPopup.css"

	class WindowPopup extends Backbone.View
		tagName: 'div'
		className: 'windowPopup'
		template: _.template WindowTpl
		events:
			'click .closeWindow': 'close'
			'click': 'closeOutClick'
			'click button': 'clickButtonCall'

		initialize: (@options) ->
			@render()

		render: ->
			@$el.html @template()

		setTitle: (title) ->
			# Título da popup
			@$('#windowTitle').html title

		setContent: (content) ->
			# Conteúdo da popup
			@$('#windowContent').html content

		setButtons: (buttons) ->
			# Botões da popup
			parsedButtons = ''
			_.each buttons, (button) =>
				parsedButtons += '<button type="button" class="btn '+button.class+'" id="'+button.id+'">'+button.title+'</button>'

			@$('#windowButtons').html parsedButtons

		open: ->
			# Mostra a Window
			@$el.css 'display', 'flex'

		close: ->
			# Remove popup
			@$el.remove()

		closeOutClick: (e) ->
			# Fechar clicando fora da popup
			if e.target.className is 'windowPopup'
				@close()

		clickButtonCall: (e) ->
			@trigger 'clickButtonCall', e

		setWidth: (width) ->
			@$('#windowContainer').css width: width