####################################################################
	# Componente: SearchSelectizeBasic
	# Função: Criar select com opção de busca dinâmica
	# Autor: Yago M. Laignier
	####################################################################
	# Parâmetros:
	# (object) options
	####################################################################
	# Exemplo de uso:
	# @searchSelectizeBasic = new SearchSelectizeBasic
	# 	@selectItens = @searchSelectizeBasic.createSelect
	# 		el: @$('#selectItens')
	# 		url: "#{baseUrl}itens/filtro"
	# 		valueField: 'id_item'
	# 		labelField: 'descricao'
	# 		searchField: ['descricao', 'codigo']
	# 		itemTpl: "$descricao ($codigo)"
	# 		callback: @selectItem.bind @
	# 		preData: [{id_tipo_item: @$('#tiposItens').val()}]
	# 		placeholder: "Digite o código ou descrição do item"
####################################################################
define ["jquery", "underscore", "selectize"], ($, _) ->
	loadCss "#{baseUrl}lib/selectize/css/selectize.bootstrap3.css"
	class searchSelectizeBasic
		selectize: (@options) ->
			@options.el.selectize
				valueField: @options.valueField
				labelField: @options.labelField
				searchField: @options.searchField
				create: false
				persist: false
				preload: @options.preLoad?
				# openOnFocus: false
				placeholder: if @options.placeholder? then @options.placeholder else 'Pesquisar'
				render:
					option: (item, escape) =>
						if @options.itemTpl?
							"<div class='option'>#{@replaceKeys @options.itemTpl, item}</div>"
						else
							"<div class='option'>#{item[@options.labelField]}</div>"

				load: (query, callback) =>
					# Regex accepts: a-z, A-Z, 0-9, %
					return callback() if query.length <= 2 or /((?![\wáàâãéèêíïóôõöúçñ%]).)/ig.test query
					data = {}
					if @options.preData?
						_.each @options.preData, (pData, i) =>
							prop = Object.keys(pData)[i]
							data[prop] = pData[prop]
					data[@options.labelField] = query
					$.ajax
						url: @options.url
						type: 'POST'
						dataType: 'json'
						data: data
						error: () ->
							callback()
						success: (@result) =>
							callback @result
			@select = @options.el[0].selectize
			@delegateEvents()
			@select

		delegateEvents: ->
			# Item selected Callback
			@select.on 'item_add', @options.callback if @options.callback?
			if @options.clearOnBlur?
				# blur: On focus lost
				@select.on 'blur', @select.clearOptions
				# Text change on input
				$('#selectItens-selectized').keyup @checkKey.bind @

		replaceKeys: (template, item) ->
			keys = template.match /\$[\w]+/ig
			_.each keys, (key) =>
				template = template.replace key, item[key.replace '$', '']
			template
			
		checkKey: (e) ->
			unless $(e.target).val().length > 2
				@select.close()
				@select.clearOptions()