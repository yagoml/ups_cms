# ENV = 'dist'
ENV = 'src'

requirejs.config
	baseUrl: baseUrl
	paths:
		# ENV
		"app_require": "#{ENV}/js/app_require"
		"global": "#{ENV}/js/global"
		# LIB
		"jquery": "lib/jquery-3.1.1.min"
		"underscore": "lib/underscore.min"
		"backbone": "lib/backbone.min"
		"bootstrap": "lib/bootstrap/bootstrap.min"
		"jquery_timeTo": "lib/timeTo/jquery.time-to.min"
		"text": "lib/require_text/text"
		"jquery_mask": "lib/jQuery-Mask-Plugin/#{ENV}/jquery.mask.min"
		"jquery_datepicker": "lib/jquery-ui-datePicker/jquery-ui.min"
		"dateTimePicker": "lib/datetimepicker/js/bootstrap-material-datetimepicker.min"
		"microplugin": "lib/selectize/js/deps/microplugin.min"
		"sifter": "lib/selectize/js/deps/sifter.min"
		"selectize": "lib/selectize/js/selectize.min"
		# YagoML Plugins
		"formValidator": "lib/formValidator/formValidator"
		"input_labels": "lib/input-labels/input_labels"

	shim:
		backbone:
			deps: ['underscore', 'jquery', 'global']
			exports: 'backbone'

		bootstrap:
			deps: ['jquery']
			exports: 'bootstrap'

		jquery_mask:
			deps: ['jquery']
			exports: 'jquery_mask'

		jquery_datepicker:
			deps: ['jquery']
			exports: 'jquery_datepicker'

		jquery_timeTo:
			deps: ['jquery']
			exports: 'jquery_timeTo'

		dateTimePicker:
			deps: ['bootstrap']
			exports: 'dateTimePicker'

		selectize:
			deps: ['jquery', 'microplugin', 'sifter']
			exports: 'selectize'

		input_labels:
			deps: ['jquery']
			exports: 'input_labels'

		tableEventosView:
			deps: ['jquery', 'underscore', 'backbone']
			exports: 'tableEventosView'

		text:
			deps: ['require']
			exports: 'text'

# Chamando módulo principal para iniciar a aplicação
requirejs ["app_require"]