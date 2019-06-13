define [
	"text"
	"global"
	ENV + "/js/components/loader"
], (text, global, Loader) ->

	# @$('body').html (new Loader class: "gLoaderAbsolut").show()

	loadCss "#{baseUrl}lib/bootstrap/bootstrap.min.css"

	require ["jquery", "underscore", "backbone"
		"#{ENV}/js/router"
		"text!src/templates/app.html"
	], ($, _, Backbone, Router, AppTpl) =>

		loadCss "#{baseUrl}#{ENV}/css/yagoml_frame_styles.css"
		loadCss "#{baseUrl}#{ENV}/css/style.css"

		class App extends Backbone.View
			template: _.template AppTpl

			initialize: ->
				Backbone.history.start()
				@render()

			render: ->
				$('body').html @template

		new App