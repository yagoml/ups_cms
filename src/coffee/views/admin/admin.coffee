define ["jquery", "underscore", "backbone"
	"#{ENV}/js/router"
	"text!src/templates/admin/adminTpl.html"
	"#{ENV}/js/views/admin/menu"
	"#{ENV}/js/components/autoCrud/autoCrudView"
], ($, _, Backbone, Router, AdminTpl, Menu, AutoCrudView) ->

	loadCss "#{baseUrl}src/css/admin/admin.css"

	class Admin extends Backbone.View
		tagName: "div"
		className: "container-fluid"
		template: _.template AdminTpl

		initialize: (openedData = null) ->
			@menu = new Menu openedData

		delegateEvents: ->
			@listenTo @menu, 'tableLinkAccess', @autoCrudTable, @

		undelegateEvents: ->
			@stopListening @menu, 'tableLinkAccess'

		render: ->
			@$el.html @template
			@$('#listMenu').html @menu.render().$el
			@

		autoCrudTable: (name) ->
			$('#panelContent').html (new AutoCrudView name).render().$el