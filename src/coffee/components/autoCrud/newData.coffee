define ["jquery", "underscore", "backbone"
	"#{ENV}/js/components/loader"
	"#{ENV}/js/components/autoCrud/editData"
	"text!src/templates/components/autoCrud/newDataTpl.html"
	"text!src/templates/components/upload/upload.html"
], ($, _, Backbone, Loader, EditData, NewDataTpl, UploadTpl) ->
	class WindowNewDado extends EditData
		template: _.template NewDataTpl
		events:
			'submit #newDataForm': 'prepareToSave'

		afterRender: ->
			charsPerLine = @getCharsPerLine()
			fields = ''
			hasUpload = false

			_.each @tableInfos, (tabInfo, i) =>
				unless @isFileDirectory(tabInfo.default)
					# Nome dos campos cadastrados ou nome da coluna
					fieldName = _.findWhere(@tableTitles, campo: tabInfo.name)?.nome or tabInfo.name
					# Campo de controle do sistema
					isSystemField = @systemFields.includes tabInfo.name
					# Verifica se não é PK ou campo de uso do sistema
					if not tabInfo.primary_key and not isSystemField
						# Verifica se é chave estrangeira
						isFk = _.findWhere @fks, COLUMN_NAME: tabInfo.name
						# Se não for FK
						unless isFk
							fields += "
								<div class='form-box-edit' style='
								#{
									if tabInfo.type is 'text' or tabInfo.type is 'varchar'
										'width: 100%;'
									else
										'width: fit-content;
										margin-right: 15px;'
								}
								'><label>#{fieldName}</label>"

							if tabInfo.type isnt 'text' and tabInfo.type isnt 'varchar'
								fields += "<input type='#{@inputTypes[tabInfo.type]}' id='#{tabInfo.name}' name='#{tabInfo.name}' class='form-control'>"
							else
								fields += "<textarea class='form-control' id='#{tabInfo.name}' name='#{tabInfo.name}' rows='#{if dataLen? then (Math.ceil(dataLen / charsPerLine)) else if tabInfo.type is 'text' then 3 else 1}'></textarea>"

							fields += '</div>'


			@$('.form-body').html fields

			if hasUpload
				@filesUpload()

		filesUpload: ->
			@$('.fn-upload').html UploadTpl

			fieldDir = @getFieldDirectory @model

			modelID = @model.get(@options.pk)

			@$('#fine-uploader-manual-trigger').fineUploader
				autoUpload: false
				multiple: false
				template: 'qq-template-manual-trigger'
				deleteFile:
					enabled: true
					endpoint: "#{baseUrl}dados/deleteFile"
					method: 'POST'
					params:
						table: 'uploaded_single_files'
						fieldDir: fieldDir if fieldDir?
						singleFile: true
						parentTable: @table
						parentPK: @options.pk
						id: modelID
				request:
					endpoint: "#{baseUrl}dados/upload"
					params:
						fk: 'id_registro'
						id: modelID
						table: 'uploaded_single_files'
						singleFile: true
						parentTable: @table
						parentPK: @options.pk
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