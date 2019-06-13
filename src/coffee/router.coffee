define ["jquery", "underscore", "backbone"],
($, _, Backbone) ->

	class Router extends Backbone.Router
		routes:
			# Admin
			"admin(/)": "admin"
			"admin/autoCrud/:table(/)": "autoCrud"
			"admin/autoCrud/:table/new(/)": "autoCrudNew"
			"admin/autoCrud/:table/edit/:id(/)": "autoCrudEdit"
			"admin/autoCrud/:table/related/:related_table/:fk/:filterID(/)": "autoCrudRelated"
			"admin/autoCrud/:table/related/:related_table/:fk/:filterID/new(/)": "autoCrudRelatedNew"

		instances:
			autoCrudView: {}
		
		autoCrudTable: ''
		# Admin
		admin: (openedData) ->
			defAdmin = $.Deferred()
			require ["#{ENV}/js/views/admin/admin"], (Admin) ->
				$("#mainContent").html (new Admin openedData).render().$el
				defAdmin.resolve()

			defAdmin.promise()

		# Auto Crud
		autoCrud: (options) ->
			# Se foi passado tabela string está vindo da rota
			if typeof options is 'string'
				options = {table: options}

			# Configura Options
			# Filtrar registro por ID
			options.filterID = options.filterID or 0
			# Opção para renderizar tabela
			options.renderTable = options.renderTable or true
			# Opção para abrir modo de edição
			options.edit = options.edit or false
			# Opção para abrir modo de inserção
			options.newData = options.newData or false
			# Se é uma tabela de dados de outra, tem uma 'parentTable'
			options.parentTable = options.parentTable or false

			if options.table is 'config_site'
				unless options.edit
					window.location.hash = '#admin'

			require ["#{ENV}/js/components/autoCrud/autoCrudView"], (AutoCrudView) =>
				if $('#panelContent').length
					if _.isEmpty(@instances.autoCrudView) or
						options.table isnt @autoCrudTable or
						options.edit or
						options.newData
							$("#panelContent").html (
								@instances.autoCrudView = new AutoCrudView options
							).render().$el
					else
						@instances.autoCrudView.renderTable()

					@autoCrudTable = options.table
				else
					$.when(@admin(options.table)).done =>
						if _.isEmpty(@instances.autoCrudView) or
							options.table isnt @autoCrudTable or
							options.edit or
							options.newData
								$("#panelContent").html (
									@instances.autoCrudView = new AutoCrudView options
								).render().$el
						else
							@instances.autoCrudView.renderTable()

						@autoCrudTable = options.table

		autoCrudRelated: (table, related_table, fk, filterID) ->
			@autoCrud
				table: related_table
				fk: fk
				filterID: filterID
				parentTable: table

		autoCrudRelatedNew: (table, related_table, fk, filterID) ->
			@autoCrud
				table: related_table
				fk: fk
				filterID: filterID
				parentTable: table

		autoCrudEdit: (table, id) ->
			@autoCrud
				table: table
				filterID: id
				edit: true

		autoCrudNew: (table) ->
			@autoCrud
				table: table
				newData: true

	new Router