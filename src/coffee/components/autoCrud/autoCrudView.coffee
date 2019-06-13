define ["jquery", "underscore", "backbone"
	"#{ENV}/js/router"
	"#{ENV}/js/components/autoCrud/dataTable"
	"#{ENV}/js/components/autoCrud/newData"
	"#{ENV}/js/components/autoCrud/editData"
	"#{ENV}/js/components/autoCrud/dataFilters"
	"#{ENV}/js/components/autoCrud/inputTypes"
	"#{ENV}/js/components/loader"
	# Templates
	"text!src/templates/components/autoCrud/autoCrud.html"
	"text!src/templates/components/autoCrud/newDataTpl.html"
	"text!src/templates/components/autoCrud/editDataTpl.html"
	"text!lib/fine-uploader/templates/gallery.html"
	"text!lib/fine-uploader/templates/simple-thumbnails.html"
	"text!src/templates/components/upload/upload.html"

	"lib/fine-uploader/jquery.fine-uploader.min"
	"lib/jquery-ui-sortable/jquery-ui.min"
], ($, _, Backbone, Router, DataTable, NewData, EditData, dataFilters, InputTypes, Loader, AutoCrudTpl, NewDataTpl, EditDataTpl, FnUploadGalleryTpl, FnUploadSimpleThumbsTpl, UploadTpl) ->

	URL = "#{baseUrl}dados/"
	mLoader = new Loader class: 'mLoader'
	loadCss "#{baseUrl}lib/fine-uploader/fine-uploader-new.min.css"
	loadCss "#{baseUrl}lib/fine-uploader/fine-uploader-gallery.min.css"
	loadCss "#{baseUrl}lib/jquery-ui-sortable/jquery-ui.min.css"
	loadCss "#{baseUrl + ENV}/css/components/autoCrud.css"

	class Ordenator # Static
		# Classe que gerencia a ordenação dos itens na tabela
		@addOrder: (data) ->
			$.ajax
				method: 'POST'
				dataType: 'json'
				url: "#{baseUrl}dados/addOrder"
				data:
					table: data.table
					id: data.model.get data.pk
					data: data.model.attributes

		@subOrder: (data) ->
			$.ajax
				method: 'POST'
				dataType: 'json'
				url: "#{baseUrl}dados/subOrder"
				data:
					table: data.table
					id: data.model.get data.pk
					data: data.model.attributes

		@setOrder: (data) ->
			$.ajax
				method: 'POST'
				dataType: 'json'
				url: "#{baseUrl}dados/setOrder"
				data:
					table: data.table
					id: data.model.get data.pk
					data: data.model.attributes
					ordem: data.ordem

	class AutoCrudView extends Backbone.View
		className: 'auto-crud'
		template: _.template AutoCrudTpl
		qtdDados: 20
		events:
			'click #newData': 'openNewData'
			'click #filtrarDados': 'openWindowdataFilters'
			'click #removerFiltro': 'removerFiltro'
			'click #deleteData': 'deleteList'
			'click #backGrid': 'backGrid'
			'click #deleteDataEdit': 'deleteDataEdit'
			'sortupdate .qq-upload-list': 'dragFile'
			'click .qq-thumbnail-selector': 'openFile'

		resetPaginationControls: ->
			@paginationControls =
				limiteBuscaAtingido: false
				requisicaoAtiva: false
				paginaAtual: 1

		initialize: (@options) ->
			@defCmsAccessTables = @getCmsTables()
			@defAllowAccess = $.Deferred()
			@configSite = @options.table is 'config_site'
			@filesCollection = false

			@resetPaginationControls()

			$.when(@defCmsAccessTables).done =>
				{@table, @filterID, @edit, @newData, @parentTable, @pk, @fk} = @options
				@allowAcess = _.findWhere(@cmsAccessTables, table: @table) or @fk?

				if @allowAcess
					if not @edit and @configSite
						return

					@renderizeTable = @options.renderTable or true
					@collection = new Backbone.Collection
					@checkedModels = new Backbone.Collection
					@collection.url = URL
					@colFetchDef = $.Deferred()
					@colFetchDef.promise()
					@tableInfos = @getTableInfos()
					@defFetchData = $.Deferred()
					@defFetchData.promise()

					if @newData
						$.when.apply($, [@getTableTitles(), @getFKs(), @getSystemFields()]).done (model) =>
							@colFetchDef.resolve()
							@openNewData()
					else
						@filesCollection = true
				else
					Router.navigate "#admin"

				@defAllowAccess.resolve()

		getCmsTables: ->
			$.ajax
				type: 'post'
				dataType: 'json'
				url: "#{baseUrl}tableInfos/cmsTables"
				success: (@cmsAccessTables) =>

		prepareCollection: ->
			@pk = (_.findWhere @tableInfos, primary_key: 1).name

			unless @edit # Modo GRID
				if @filterID
					if @fk?
						# Related table
						@fetchData =
							table: @table
							fk: @fk
							filterID: @filterID # Passar o ID da FK Table aqui para filtrar-vos
							pagina: 0
					else
						# Related table
						@fetchData =
							table: @table
							pk: @pk
							filterID: @filterID # Passar o ID da Table aqui para filtrar-vos
							pagina: 0
				else
					@fetchData =
						table: @table
						pagina: 0

				@defFetchData.resolve()

				@collection.fetch
					data: @fetchData
					success: =>
						@colFetchDef.resolve()
						@showQtdDados()

						if @checkForFilesTable @tableInfos
							# Coleção de arquivos relacionada
							@filesCollectionUpload()
							@$('#newData').hide()
						else
							@$('#newData').show()
							if @renderizeTable
								$.when.apply($, [@getTableTitles(), @getFKs()]).done =>
									@createTable()
									@delegateEvents()
			else # Modo de edição
				@$('#newData').show()
				if @configSite
					@$('#buttonsArea').remove()

				$.when.apply($, [@defItemData = @getItemData(@filterID), @getTableTitles(), @getFKs()]).done (model) =>
					@editModel = model
					@colFetchDef.resolve()
					@openEditData model

			@collection.on 'update', @updateRegCounter, @
			@editing = false

		delegateEvents: ->
			super
			if @crudTableView?
				@crudTableView.delegateEvents()
				@listenTo @crudTableView, 'openEditData', @openEditData
				@listenTo @crudTableView, 'itemChecked', @interactExcBtn
				@listenTo @crudTableView, 'removeData', @deletarDado
				@listenTo @crudTableView, 'dadosSolicitados', @nextScrollPage
				@listenTo @crudTableView, 'addOrder', @addOrder
				@listenTo @crudTableView, 'subOrder', @subOrder

			# Scroll listener
			@$('#dataTableContent .table-responsive').on 'scroll', (e) =>
				@scroll()

		undelegateEvents: ->
			super
			if @crudTableView?
				@crudTableView.undelegateEvents()
				@stopListening @crudTableView, 'openEditData'
				@stopListening @crudTableView, 'itemChecked'
				@stopListening @crudTableView, 'removeData'
				@stopListening @crudTableView, 'addOrder'
				@stopListening @crudTableView, 'subOrder'

		render: ->
			$.when(@defAllowAccess).done =>
				if @allowAcess
					@autoCrudEL = @template
						table: @table
						gurmetTable: @allowAcess.name or capitalize @table.replace(/(?![a-zA-Z0-9])./g, ' ')
						parentTable: @parentTable if @parentTable
						filterID: @filterID if @parentTable

					@$el.html @autoCrudEL

					@$('#dataTableContent').html mLoader.show()

					if @filesCollection
						$.when.apply($, [@tableInfos, @getSystemFields()]).done =>
							@prepareCollection()

			@

		openEditData: (model) ->
			@editModel = model
			@edit = true

			$.when.apply($, [@colFetchDef, @tableInfos, @getRefTables()]).done =>
				unless model instanceof Backbone.Model
					model = @collection.findWhere "#{@pk}": model

				Router.navigate "admin/autoCrud/#{@table}/edit/#{model.get(@pk)}", trigger: false

				@editData = new EditData
					model: model
					table: @table
					tableInfos: @tableInfos
					tableTitles: @tableTitles
					systemFields: @systemFields
					inputTypes: InputTypes
					fks: @fks
					pk: @pk
					refTables: @refTables
					parentTable: @parentTable
					configSite: @configSite

				@$('#dataTableContent').html @editData.render().$el
				@editData.afterRender()
				@listenTo @editData, 'backFromEdit', @renderTable.bind @
				@$('#backGrid').removeClass 'hidden'

				@$('#deleteData').hide()
				@$('#deleteDataEdit').show()

		getItemData: (itemID) ->
			def = $.Deferred()
			$.ajax
				type: 'get'
				dataType: 'json'
				url: "#{baseUrl}dados"
				data:
					table: @table
					pk: @pk
					filterID: @filterID
					orderBy: '' if @configSite
				success: (itemData) =>
					def.resolve new Backbone.Model itemData[0]

			def.promise()

		openNewData: (event) ->
			$.when.apply($, [@colFetchDef, @tableInfos, @getRefTables()]).done =>
				if @fk?
					Router.navigate "admin/autoCrud/#{@parentTable}/related/#{@table}/#{@fk}/#{@filterID}/new", trigger: false
				else
					Router.navigate "admin/autoCrud/#{@table}/new", trigger: false

				@newData = new NewData
					model: new Backbone.Model
					table: @table
					tableInfos: @tableInfos
					tableTitles: @tableTitles
					systemFields: @systemFields
					inputTypes: InputTypes
					fks: @fks
					pk: @pk
					refTables: @refTables
					parentTable: @parentTable
					fk: @fk if @fk?
					filterID: @filterID if @filterID?

				@listenTo @newData, 'backFromEdit', @renderTable.bind @
				@$('#dataTableContent').html @newData.render().$el
				@newData.afterRender()
				@$('#backParent').removeClass 'hidden'

				@$('#newData').hide()
				@$('#deleteData').hide()

		openWindowdataFilters: ->
			@windowdataFilters = new dataFilters model: @model
			@stopListening @windowdataFilters
			@listenTo @windowdataFilters, 'eventoFiltrado', @filtrarDados.bind @
			@$('#dataTableContent').append @windowdataFilters.render()

		addDado: (dadosDado) ->
			@endTableLoader 'show'
			evento = ((new Dado).set dadosDado).attributes
			@collection.create evento,
				wait: true
				success: (evento) =>
					@crudTableView.addLinha evento
					@endTableLoader 'hide'

		editDado: (evento) ->
			@crudTableView.loaderLinha evento.id_evento
			novoDado = ((new Dado).set evento).attributes
			@model.save novoDado,
				wait: true
				success: =>
					@crudTableView.editLinha novoDado

		filtrarDados: (filtro) ->
			$.ajax
				url: "#{baseUrl}dados/filtro"
				type: 'POST'
				dataType: "json"
				data: filtro
				success: (dadosFiltrados) =>
					@collection = new Dados
					_.each dadosFiltrados, (novoDado) =>
						@collection.models.push ((new Dado).set novoDado)

					@createTable()
					@renderfiltroAplicado filtro

		deletarDado: (models) ->
			# Já que o BB não manda o del req. no destroy acima, tive q fazer a req. manual -.-'
			# E nem todos os browser aceitam DEL request
			delDef = $.Deferred()

			ids = []
			_.each models, (model) =>
				id = model.get(@pk)
				ids.push id

			$.ajax
				type: 'POST'
				data:
					table: @table
					ids: ids
					pk: @pk
				url: "#{URL}removeData"
				success: =>
					@collection.remove models
					delDef.resolve()

			delDef.promise()

		deleteList: ->
			chklen = @checkedModels.models.length
			if window.confirm "Deseja realmente excluir #{if chklen > 1 then 'os ' + chklen + ' registros selecionados' else ' o registro #' + _.first(@checkedModels.models).get(@pk)}? Todos os dados relacionados serão excluídos também."
				$.when(@deletarDado @checkedModels.models).done =>
					@crudTableView.removeLines @checkedModels.models
					@checkedModels.reset()
					$btn = @$('#deleteData')
					$btn.find('#qntSelectedItens').empty()
					$btn.hide()

					if chklen >= 20
						for[1..0]
							@nextScrollPage @paginationControls.paginaAtual

						@ultimaPosicaoScroll = 0
				
					@crudTableView.$('#dadosSelectAll')[0].checked = false
					@crudTableView.selectAllState = false

		createTable: ->
			@$('#dataTableContent').html mLoader.show()
			@crudTableView = new DataTable
				dados: @collection
				systemFields: @systemFields
				tableTitles: @tableTitles if @tableTitles?
				pk: @pk
				fk: @fk if @fk?
				fks: @fks

			@$('#dataTableContent').html @crudTableView.render().$el
			@crudTableView.ellipsisTableData()

		renderTable: (model = {}) ->
			unless @configSite
				if @fk?
					Router.navigate "admin/autoCrud/#{@parentTable}/related/#{@table}/#{@fk}/#{@filterID}", trigger: false
				else
					Router.navigate "admin/autoCrud/#{@table}", trigger: false

				if @crudTableView?
					# Reaproveitamento de view
					$('#panelContent').html @$el
					# Remove a margin que sobe o elemento na edição de dados
					@$('#dataTableContent').css 'margin-top': '0'
					@$('#dataTableContent').html @crudTableView.$el
					unless @fk
						@$('#backParent').addClass 'hidden'

					@$('#backGrid').addClass 'hidden'
					@$('.table-responsive').find('.loader-wrapper').remove()
					@$('#deleteDataEdit').hide()

					unless _.isEmpty model
						idx = @collection.findIndex model
						if idx >= 0
							@editing = true
							@collection.models[idx] = model
							@crudTableView.updateLinha model
						else
							@editing = false
							@collection.add model

					@delegateEvents()
				else
					@resetPaginationControls()
					$('#panelContent').html @render().$el

					if not @edit and @configSite
						return

					@collection.fetch
						data:
							pagina: 0
							table: @table
						success: =>
							@createTable()
							@showQtdDados()
							@delegateEvents()

				@defFetchData.resolve()
				@$('#newData').show()

		getTableTitles: ->
			$.ajax
				type: 'POST'
				dataType: 'json'
				url: "#{baseUrl}tableInfos/titles"
				data: table: @table
				success: (@tableTitles) =>

		endTableLoader: (command) ->
			@crudTableView.endTableLoader command

		tableLoader: (command) ->
			if command is 'show'
				@$('#dataTableContent').prepend mLoader.show()
			else
				@$('#dataTableContent').children('.loader-wrapper').remove()

		renderfiltroAplicado: (filtro) ->
			filtroInfos = []

			@$('#titleFiltro').css 'display', 'block'
			
			if filtro.id_evento.length > 0
				filtroInfos.push "ID Dado: <span class='pad5 alert-info'>#{filtro.id_evento}</span>"
			if filtro.tipo.length > 0
				filtroInfos.push "Tipo contém: <span class='pad5 alert-info'>#{filtro.tipo}</span>"

			_.each filtroInfos, (filtroInfo) =>
				@$('#filtroInfos').append "<li>#{filtroInfo}</li>"

		removerFiltro: ->
			@$('#dataTableContent').html mLoader.show()
			@initialize()

			@$('#titleFiltro').css 'display', 'none'
			@$('#filtroInfos').html ''

		showQtdDados: ->
			@$('#qtdDados').html @collection.models.length

		getDataPage: (pagina) ->
			$.ajax
				type: 'get'
				dataType: 'json'
				url: "#{baseUrl}dados"
				data: @fetchData
				success: (data) =>
					if data.length
						_.each data, (item) =>
							model = (new Backbone.Model).set item
							@collection.add model

						@crudTableView.ellipsisTableData()
					else
						@paginationControls.limiteBuscaAtingido = true

		getTableInfos: ->
			$.ajax
				type: 'POST'
				dataType: 'json'
				url: "#{baseUrl}tableInfos"
				data: table: @table
				success: (tableData) =>
					@tableInfos = tableData.fieldsData
					@tableFks = tableData.fksData

		getFKs: ->
			$.ajax
				type: 'POST'
				dataType: 'json'
				url: "#{baseUrl}tableInfos/fks"
				success: (@fks) =>

		getSystemFields: ->
			$.ajax
				type: 'POST'
				dataType: 'json'
				url: "#{baseUrl}tableInfos/systemFields"
				success: (@systemFields) =>

		getRefTables: ->
			$.ajax
				type: 'post'
				dataType: 'json'
				url: "#{baseUrl}tableInfos/getTableFKs"
				data: table: @table
				success: (@refTables) =>

		filesCollectionUpload: ->
			@$('#dataTableContent').html UploadTpl
			if _.any @collection.models
				fieldDir = @getFieldDirectory @collection.models[0]

			@$('#fine-uploader-manual-trigger').fineUploader
				autoUpload: false
				multiple: true
				template: 'qq-template-manual-trigger'
				session:
					endpoint: "#{URL}?table=#{@table}&fk=#{@fk}&pk=#{@pk}&filterID=#{@filterID}" + (if fieldDir? then "&fieldDir=#{fieldDir}" else "")
				deleteFile:
					enabled: true
					endpoint: "#{URL}deleteFile"
					method: 'POST'
					params:
						table: @table
						fieldDir: fieldDir if fieldDir?
				request:
					endpoint: "#{URL}upload"
					params:
						fk: @fk
						id: @filterID
						table: @table
				thumbnails:
					placeholders:
						waitingPath: baseUrl + '/lib/fine-uploader/placeholders/waiting-generic.png'
						notAvailablePath: baseUrl + '/lib/fine-uploader/placeholders/not_available-generic.png'
				callbacks:
					onError: (id, name, errorReason, xhr) ->
						alert JSON.parse(xhr.response).error
					onSessionRequestComplete: =>
						# Callback ao carregar arquivos no server
						return

			@$('#trigger-upload').click =>
				@$('#fine-uploader-manual-trigger').fineUploader('uploadStoredFiles')

			@activeSortFiles()

		activeSortFiles: ->
			# Sortable plugin
			$uploadList = @$('.qq-upload-list')
			$uploadList.sortable axis: "y"
			$uploadList.disableSelection()

		checkForFilesTable: ->
			_.find @tableInfos, (value, index) =>
				value.name is 'uuid'

		getFieldDirectory: (data) ->
			dirField = ''
			_.map data.attributes, (value, field) =>
				if @isFileDirectory value
					dirField = field
			dirField

		isFileDirectory: (string) ->
			regex = new RegExp 'uploads/', 'ig'
			regex.test string

		interactExcBtn: (models) ->
			_.each models, (model) =>
				if model.get('checked')
					@checkedModels.add model
				else
					@checkedModels.remove model

			$btn = @$('#deleteData')

			if @checkedModels.models.length
				$btn.show()
				$btn.find('#qntSelectedItens').html @checkedModels.models.length
			else
				$btn.hide()

		updateRegCounter: (collection) ->
			unless @editing
				if @crudTableView?
					@crudTableView.addLinha _.last(collection.models)
					@crudTableView.ellipsisTableData()
				@$('#qtdDados').html @collection.models.length

		backGrid: ->
			@resetGridStatus()

			unless @configSite
				if @fk?
					route = "admin/autoCrud/#{@parentTable}/related/#{@table}/#{@fk}/#{@filterID}"
				else
					route = "admin/autoCrud/#{@table}"

				Router.navigate route, trigger: false
				@filterID = null
				@renderTable()
				@$('#deleteDataEdit').hide()

				if _.any @checkedModels.models
					@$('#deleteData').show()

			else
				window.location.hash = "admin"

			@defFetchData.resolve()

		deleteDataEdit: ->
			if window.confirm "Deseja realmente excluir o registro ##{@editData.model.get(@pk)}? Todos os dados relacionados serão excluídos também."
				@deletarDado [@editData.model]
				@backGrid()

		nextScrollPage: (page) ->
			# Próxima página scroll
			@tableLoader 'show'
			$wrapper = @$("#dataTableContent").children('.table-responsive')
			@paginationControls.requisicaoAtiva = true
			@paginationControls.paginaAtual++
			# Registra a última posição do scroll
			@ultimaPosicaoScroll = $wrapper.scrollTop()

			$.when(@defFetchData).done =>
				if @fetchData?
					@fetchData.pagina = page
				else
					@fetchData =
						table: @table
						pagina: 1

				$.when(@getDataPage()).done =>
					@paginationControls.requisicaoAtiva = false
					@tableLoader 'hide'

		scroll: ->
			# Checa se já atingiu o limite e se alguma requisição está em progresso
			if not @paginationControls.limiteBuscaAtingido and not @paginationControls.requisicaoAtiva
				# Ao atingir cerca de 90% do scroll, a busca dos próximos itens é acionada.
				$wrapperScroll = @$('#dataTableContent > .table-responsive')
				$table = @$(".dadosTable")
				### Condição para buscar
				Quando scroll chegar a 50px do final ###
				if ($wrapperScroll.scrollTop() + $wrapperScroll.height()) >= ($table.height() - 50)
					@nextScrollPage @paginationControls.paginaAtual

		resetGridStatus: ->
			@edit = false
			@newData = null
			@resetPaginationControls()

		addOrder: (model) ->
			Ordenator.addOrder
				model: model
				table: @table
				pk: @pk

		subOrder: (model) ->
			Ordenator.subOrder
				model: model
				table: @table
				pk: @pk

		dragFile: (e, ui) ->
			totalPos = @$('.qq-upload-list').children().length

			_.each @$('.qq-upload-list > li'), (fileLI, i) =>
				$fileLI = $(fileLI)
				fileIdx = $fileLI.attr('qq-file-id')
				actualPos = totalPos - i

				Ordenator.setOrder
					model: @collection.at fileIdx
					table: @table
					pk: @pk
					ordem: actualPos

		openFile: (e) ->
			if @edit
				fieldDir = @getFieldDirectory @editModel
				window.open @editModel.get(fieldDir), 'blank'
			else
				$target = $(e.target)
				idx = $target.closest('li').attr('qq-file-id')
				model = @collection.at idx
				window.open model.get(@getFieldDirectory model), 'blank'