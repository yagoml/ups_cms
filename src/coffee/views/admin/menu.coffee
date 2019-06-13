define ['jquery', 'underscore', 'backbone'
	"#{ENV}/js/router"
	"text!src/templates/admin/menu.html"
	"text!#{ENV}/css/admin/menu.css"
], ($, _, Backbone, Router, MenuTpl, MenuCss) ->

	class Menu extends Backbone.View
		template: _.template MenuTpl
		events:
			'click .menu-parent, .submenu-indicator': 'toggleDropMenu'
			'click .link-menu': 'redirectTable'

		initialize: (@openedData = null) ->

		render: ->
			$.when.apply($, [loadCssInline(MenuCss), @getCmsTables()]).then =>
				@$el.html @template
					tables: @tables
					openedData: @openedData if @openedData?

				@checkOpenedData()

			@

		getCmsTables: ->
			$.ajax
				type: 'post'
				dataType: 'json'
				url: "#{baseUrl}tableInfos/cmsTables"
				success: (@tables) =>

		toggleDropMenu: (e) ->
			e.stopPropagation()
			e.preventDefault()
			
			$target = $(e.target)
			toggleTime = 200

			if $target.hasClass 'submenu-indicator'
				$target = $target.parent()

			if $target.hasClass 'opened'
				$target.next('.submenu').slideUp(toggleTime)
				$target.removeClass 'opened'
				$target.removeClass 'submenu-indicator-minus'
			else
				$target.next('.submenu').slideDown(toggleTime)
				$target.addClass 'opened'
				$target.addClass 'submenu-indicator-minus'

		checkOpenedData: ->
			# Checa por menu (tabela) de dados aberto
			$subMenu = @$('.selected-menu').closest('.submenu')
			$subMenu.show()
			$subMenu.prev('.menu-parent').addClass 'opened submenu-indicator-minus'

		redirectTable: (e) ->
			table = $(e.target).attr 'ref'
			@toggleOpenedData table
			window.location.hash = "#admin/autoCrud/#{table}"

		toggleOpenedData: (table) ->
			# Controle de seleção de link de tabela de dados
			@$('.selected-menu').removeClass 'selected-menu'
			_.each @$('.link-menu'), (link) =>
				$link = $(link)
				if $link.attr('ref') is table
					$link.addClass 'selected-menu'