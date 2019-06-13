define ['jquery', 'underscore', 'backbone'
	"#{ENV}/js/router"
	"#{ENV}/js/components/windowPopup"
	"#{ENV}/js/components/loader"
	"text!src/templates/components/autoCrud/EditDataTpl.html"
	"text!src/templates/components/upload/upload.html"

	"lib/ckeditor/ckeditor"
], ($, _, Backbone, Router, WindowPopup, Loader, EditDataTpl, UploadTpl) ->

	mediaCharsWidth = 7.058252427184466

	class EditData extends Backbone.View
		className: 'auto-crud-edit-data'
		template: _.template(EditDataTpl)
		events:
			'submit #editDataForm': 'prepareToSave'

		initialize: (@options) ->
			{
				@model, @table, @tableInfos, @tableFks,
				@tableTitles, @systemFields, @inputTypes,
				@fks, @refTables, @fk, @filterID, @configSite
			} = @options

			@options.pk = (_.findWhere @tableInfos, primary_key: 1).name
			@pk = @options.pk

		render: ->
			@$el.html @template @options
			@

		afterRender: ->
			charsPerLine = @getCharsPerLine()
			fields = ''
			hasUpload = false
			
			if _.any @refTables
				@$('#relatedData').html @createRefLinks()
			else
				@$("#relatedData")
					.parent()
					.hide()

			_.each @tableInfos, (tabInfo) =>
				# Nome dos campos cadastrados ou nome da coluna
				fieldName = _.findWhere(@tableTitles, campo: tabInfo.name)?.nome or capitalize(tabInfo.name.replace(/(?![a-zA-Z0-9])./g, ' '))
				# Campo de controle do sistema
				isSystemField = @systemFields.includes tabInfo.name
				# Verifica se não é PK
				if not tabInfo.primary_key
					# Verifica se é chave estrangeira
					isFk = _.findWhere @fks, COLUMN_NAME: tabInfo.name
					# Se não for FK
					unless isFk
						fieldData = @model.get(tabInfo.name)
						dataLen = fieldData?.length
						fields += "
							<div class='form-box-edit' style='
							#{
								if tabInfo.type is 'text' or tabInfo.type is 'varchar'
									'width: 100%;'
								else
									'width: fit-content;
									margin-right: 15px;'
							}
							#{
								if isSystemField
									'display: none;'

							}
							'><label>#{fieldName}</label>"

						if tabInfo.type isnt 'text' and tabInfo.type isnt 'varchar'
							fields += "<input type='#{@inputTypes[tabInfo.type]}' id='#{tabInfo.name}' name='#{tabInfo.name}' class='form-control' value='#{if fieldData? then fieldData else ''}'>"
						else
							if @isFileDirectory fieldData
								hasUpload = true
								fields += '<div class="fn-upload"></div>'
							else
								fields += "<textarea class='form-control' id='#{tabInfo.name}' name='#{tabInfo.name}' rows='#{if dataLen? then (Math.ceil(dataLen / charsPerLine)) else 1}'>#{if fieldData? then fieldData else ''}</textarea>"

						fields += '</div>'

			@$('.form-body').html fields
			if hasUpload
				@filesUpload()

			_.each @$('textarea'), (textArea) =>
				textAreaName = $(textArea).attr('name')
				if (_.findWhere(@tableInfos, name: textAreaName)).type isnt 'varchar' and not @configSite
					CKEDITOR.replace(textAreaName)

		prepareToSave: (e) ->
			e.stopPropagation()
			e.preventDefault()
			data = @getFormData()
			@save data

		save: (data) ->
			id = @model.get(@pk)
			$.ajax
				type: 'post'
				dataType: 'json'
				url: "#{baseUrl}dados/saveData"
				data:
					data: data
					table: @table
					pk: @pk
					id: id if id?
					fk: @fk if @fk?
					filterID: @filterID if @filterID?
				beforeSend: =>
					@disableBtn()
				success: (savedData) =>
					@enableBtn()
					unless _.isEmpty(@model.attributes)
						@model.set data
					else
						@model.set savedData
					
					unless @configSite
						@trigger 'backFromEdit', @model

		getFormData: ->
			data = {}
			_.each @tableInfos, (tabInfo) =>
				value = @$("##{tabInfo.name}").val()
				if value? and _.any value
					data[tabInfo.name] = value
			data

		disableBtn: ->
			# Desabilita e mostra Loader no botão
			@$('#saveData').attr 'disabled', true
			@$('#saveData').prepend (new Loader class: 'pLoader').show()

		enableBtn: ->
			@$('#saveData').attr 'disabled', false
			@$('#saveData').find('.loader-wrapper').remove()

		getCharsPerLine: ->
			@$('.auto-crud-form-edit').width() / mediaCharsWidth

		isFileDirectory: (string) ->
			regex = new RegExp 'uploads/', 'ig'
			regex.test string

		createRefLinks: ->
			relatedLinks = ''
			_.each @refTables, (refTable) =>
				relatedLinks += "<a href='#admin/autoCrud/#{@table}/related/#{refTable.TABLE_NAME + '/' + refTable.COLUMN_NAME + '/' + @model.get(@pk)}' class='col-xs-12 margB10'>
					#{capitalize(refTable.TABLE_NAME.replace(/(?![a-zA-Z0-9])./g, ' '))}
				</a>"
			relatedLinks

		filesUpload: ->
			@$('.fn-upload').html UploadTpl

			fieldDir = @getFieldDirectory @model

			modelID = @model.get(@pk)

			@$('#fine-uploader-manual-trigger').fineUploader
				autoUpload: false
				multiple: false
				template: 'qq-template-manual-trigger'
				session:
					endpoint: "#{baseUrl}dados/singleFile?table=#{@table}&pk=#{@pk}&filterID=#{modelID}" + (if fieldDir? then "&fieldDir=#{fieldDir}" else "")
				deleteFile:
					enabled: true
					endpoint: "#{baseUrl}dados/deleteFile"
					method: 'POST'
					params:
						table: 'uploaded_single_files'
						fieldDir: fieldDir if fieldDir?
						singleFile: true
						parentTable: @table
						parentPK: @pk
						id: modelID
				request:
					endpoint: "#{baseUrl}dados/upload"
					params:
						fk: 'id_registro'
						id: modelID
						table: 'uploaded_single_files'
						singleFile: true
						parentTable: @table
						parentPK: @pk
						fieldDir: fieldDir
				thumbnails:
					placeholders:
						waitingPath: baseUrl + '/lib/fine-uploader/placeholders/waiting-generic.png'
						notAvailablePath: baseUrl + '/lib/fine-uploader/placeholders/not_available-generic.png'
				callbacks:
					onError: (id, name, errorReason, xhr) ->
						alert JSON.parse(xhr.response).error

			@$('#trigger-upload').click =>
				@$('#fine-uploader-manual-trigger').fineUploader('uploadStoredFiles')

		getFieldDirectory: (data) ->
			dirField = ''
			_.map data.attributes, (value, field) =>
				if @isFileDirectory value
					dirField = field
			dirField