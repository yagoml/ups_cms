define ['jquery', 'underscore', 'backbone'
	"#{ENV}/js/components/loader"
], ($, _, Backbone, Loader) ->

	EMPTY_TABLE = "<div class='alert'>Sem dados cadastrados.</div>"

	class LinhaView extends Backbone.View
		tagName: 'tr'
		template: _.template """
			<td><input type="checkbox" class="dado-selector"></td>
			<% _.each(keys, (key) => { %>
				<td title='<%= dado.get(key) %>'>
					<div class='dado-wrapper'>
						<% if(regexFileDir.test(dado.get(key))) { %>
							<a href='<%= baseUrl + dado.get(key) %>' target='blank'><%= dado.get(key).replace('uploads/', '') %></a>
						<% } else { %>
							<%= dado.get(key).replace(/<[^>]*>/ig, "") %>
						<% } %>
					</div>
				</td>
			<% }); %>
			<td>
				<div class='dado-wrapper dado-ordem'>
					<%= dado.get('ordem') %>
				</div>
			</td>
			<td>
				<div style="width: 70px; margin-top: 3.5px;">
					<i title="Expandir item" class="glyphicon glyphicon-chevron-down"></i>
					<i title="Aumentar prioridade" class="glyphicon glyphicon-arrow-up"></i>
					<i title="Diminuir prioridade" class="glyphicon glyphicon-arrow-down"></i>
					<i title="Excluir item" class="glyphicon glyphicon-trash remove-data"></i>
				</div>
			</td>
		"""
		events:
			'change .dado-selector': 'toggleCheckItem'
			'click': 'openEditDado'
			'click .remove-data': 'removeData'
			'click .glyphicon-arrow-up': 'addOrder'
			'click .glyphicon-arrow-down': 'subOrder'
			'click .glyphicon-chevron-down': 'expandLine'
			'click .glyphicon-chevron-up': 'retractLine'

		initialize: (@model, @keys, @pk) ->

		render: ->
			@$el.html @template
				dado: @model
				keys: @keys
				regexFileDir: new RegExp 'uploads/', 'ig'

			@

		openEditDado:(e) ->
			return if $(e.target).is('input.dado-selector') or
				$(e.target)[0].nodeName is 'I' or
				$(e.target).is('.dado-wrapper a')

			@trigger 'openEditData', @model

		toggleCheckItem: (e) ->
			@model.set 'checked', $(e.target).prop('checked')
			@trigger 'itemChecked', @model

		removeData: ->
			if window.confirm "Deseja realmente excluir o registro ##{@model.get(@pk)}?"
				@trigger 'removeData', @model
				@remove()

		addOrder: (e) ->
			@model.set('ordem', parseInt(@model.get('ordem')) + 1)
			@$('.dado-ordem').html @model.get('ordem')
			@$el.attr('ordem', @model.get('ordem'))
			@trigger 'addOrder', model: @model, e: e, view: @

		subOrder: (e) ->
			@model.set('ordem', parseInt(@model.get('ordem')) - 1)
			@$('.dado-ordem').html @model.get('ordem')
			@$el.attr('ordem', @model.get('ordem'))
			@trigger 'subOrder', model: @model, e: e, view: @

		expandLine: ->
			_.each @$('.dado-wrapper'), (dadoWrap) =>
				$dadoWrap = $(dadoWrap)
				$icon = @$('.glyphicon-chevron-down')

				$dadoWrap.css 'white-space': 'normal'
				$icon.addClass 'glyphicon-chevron-up'
				$icon.removeClass 'glyphicon-chevron-down'

		retractLine: ->
			_.each @$('.dado-wrapper'), (dadoWrap) =>
				$dadoWrap = $(dadoWrap)
				$icon = @$('.glyphicon-chevron-up')

				$dadoWrap.css 'white-space': 'nowrap'
				$icon.addClass 'glyphicon-chevron-down'
				$icon.removeClass 'glyphicon-chevron-up'

	class DataTable extends Backbone.View
		className: 'table-responsive'
		linhas: []
		events:
			'change #dadosSelectAll': 'selectAll'

		initialize: (@options) ->
			{@dados, @systemFields, @tableTitles, @pk, @fk, @fks} = @options

			@selectAllState = false

		render: ->
			if @dados.models.length
				@keys = []
				template = '<table class="table table-bordered table-striped table-hover dadosTable"><thead><tr><th><input type="checkbox" id="dadosSelectAll"></th>'

				_.each _.keys(_.first(@dados.models).attributes), (key) =>
					# Verifica se não é um campo do sistema
					isSystemField = @systemFields.includes key
					isFk = _.findWhere @fks, COLUMN_NAME: key
					if not isSystemField and not isFk
						@keys.push key
						gurmetTitle = capitalize(key).replace(/(?![a-zA-Z0-9])./g, ' ')
						template += "<th>" +
							if @tableTitles?
								(_.findWhere @tableTitles, campo: key)?.nome or gurmetTitle
							else
								gurmetTitle
						+ "</th>"

					if key is @pk
						@keys.push key
						template += "<th>ID</th>"

				template += '<th title="Prioridade">Prio.</th>'
				template += '<th>Ações</th></tr></thead><tbody></tbody></table>'

				@$el.first('tr').append template

				_.each @dados.models, (dado) =>
					@addLinha dado
			else
				@$el.html EMPTY_TABLE

			@

		addLinhaTpl: (dado) ->
			@linhas.push linhaView = new LinhaView dado, @keys, @pk

			@listenTo linhaView, 'openEditData', (model) =>
				@$el.prepend (new Loader class: 'mLoader').show()
				@trigger 'openEditData', model
			@listenTo linhaView, 'itemChecked', (model) =>
				@trigger 'itemChecked', [model]
			@listenTo linhaView, 'removeData', (model) =>
				@trigger 'removeData', [model]
			@listenTo linhaView, 'addOrder', (data) =>
				@trigger 'addOrder', data.model
				@upLine data
			@listenTo linhaView, 'subOrder', (data) =>
				@trigger 'subOrder', data.model
				@downLine data

			linhaView.render().$el

		editLinhaTpl: (dado, linhaView) ->
			@listenTo linhaView, 'openEditData', (model) =>
				@$el.prepend (new Loader class: 'mLoader').show()
				@trigger 'openEditData', model
			@listenTo linhaView, 'itemChecked', (model) =>
				@trigger 'itemChecked', model
			@listenTo linhaView, 'removeData', (model) =>
				@trigger 'removeData', [model]

			linhaView.render().$el

		updateLinha: (model) ->
			idx = _.findIndex @linhas, model: model
			rowIndex = @linhas[idx].$el[0].rowIndex - 1
			linhaView = new LinhaView model, @keys, @pk
			linhaTpl = @editLinhaTpl model, linhaView
			$(@$('tbody')[0].children[rowIndex]).replaceWith linhaTpl
			@linhas[idx].remove()
			@linhas[idx] = linhaView
			@ellipsisTableData()

		addLinha: (model) ->
			@$('tbody').append @addLinhaTpl(model)

		delegateEvents: ->
			super
			if _.any @linhas
				_.each @linhas, (linha) =>
					linha.delegateEvents()

		undelegateEvents: ->
			super
			if _.any @linhas
				_.each @linhas, (linha) =>
					linha.undelegateEvents()

		editLinha: (dado) ->
			# Edita o texto do Tipo, que é o 2º filho <td> da linha correspondente
			@linhas[dado.id_dado].$el.children('td').eq(1).html dado.tipo

		loaderLinha: (idDado) ->
			@linhas[idDado].$el.children('td').eq(1).html (new Loader class: 'pLoader').show()

		endTableLoader: (command) ->
			switch command
				when 'show'
					@$el.append "<tr class='dataTableLoader'><td colspan='3'>#{(new Loader class: 'pLoader').show()}</td></tr>"
				when 'hide'
					@$('.dataTableLoader').remove()

		checkEmptyTable: ->
			unless @dados.models.length
				@$el.html EMPTY_TABLE

		ellipsisTableData: ->
			_.each @$('.dado-wrapper'), (dadoWrap) =>
				dadoWrap = $(dadoWrap)
				dadoWrap.css
					'white-space': 'nowrap'
					'width': "#{dadoWrap.width()}px"

		removeLines: (models) ->
			_.each models, (model) =>
				idx = _.findIndex(@linhas, model: model)
				@linhas[idx].remove()
				@linhas.splice idx, 1

		upLine: (data) ->
			# Sobe linha
			$target = $(data.e.target)
			$line = $target.closest('tr')
			$prevLine = $line.prev('tr')

			if parseInt($prevLine.attr('ordem')) < parseInt($line.attr('ordem'))
				data.view.remove()
				$prevLine.before(data.view.render().$el)
				data.view.delegateEvents()

				_.each data.view.$('.dado-wrapper'), (dadoWrap) =>
					dadoWrap = $(dadoWrap)
					dadoWrap.css
						'white-space': 'nowrap'
						'width': "#{dadoWrap.width()}px"

		downLine: (data) ->
			# Desce linha
			$target = $(data.e.target)
			$line = $target.closest('tr')
			$nextLine = $line.next('tr')

			if parseInt($nextLine.attr('ordem')) > parseInt($line.attr('ordem'))
				data.view.remove()
				$nextLine.after(data.view.render().$el)
				data.view.delegateEvents()

				_.each data.view.$('.dado-wrapper'), (dadoWrap) =>
					dadoWrap = $(dadoWrap)
					dadoWrap.css
						'white-space': 'nowrap'
						'width': "#{dadoWrap.width()}px"

		selectAll: ->
			@selectAllState = not @selectAllState

			$dadoCheck = @$('.dado-selector')
			_.each $dadoCheck, (checkbox) =>
				$checkbox = $(checkbox)
				$checkbox[0].checked = @selectAllState

			models = []

			_.each @linhas, (linha) =>
				linha.model.set('checked', @selectAllState)
				models.push linha.model

			@trigger 'itemChecked', models