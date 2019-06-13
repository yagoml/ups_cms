# Listener para fechar windowPopup's no ESC
document.body.addEventListener 'keydown', (e) ->
	if e.which is 27
		$('.windowPopup').remove()

# Carrega CSS dinâmico na app. Opção de callback após carregamento
loadCss = (url, callback) ->
	link = document.createElement("link")
	link.type = "text/css"
	link.rel = "stylesheet"
	link.href = url

	if callback?
		link.onload = callback.call()

	document.getElementsByTagName("head")[0].appendChild link

# Espera CSS INLINE ser carregado na view
waitCssInlineLoad = (load, callback) ->
	setTimeout (=>
		if load.outerText.length is 0
			waitLoad load, callback
		else
			callback.call()
	), 25

# Carrega CSS INLINE em uma view. Opção de Deferred
loadCssInline = (css) ->
	defer = $.Deferred()

	style = document.createElement("style")
	style.type = "text/css"
	style.rel = "stylesheet"
	style.innerHTML = css

	load = document.body.insertBefore style, document.body.firstChild

	waitCssInlineLoad load, () =>
		defer.resolve()

	defer.promise()

# Similar a 'setTimeout', porém não executa todos os comandos disparados, somente executa o comando acionado após o tempo especificado em ms
delay = (
	() ->
		timer = 0
		return (callback, ms) =>
			clearTimeout timer
			timer = setTimeout callback, ms
)()

# Espera por TRUE
waitFor = (cond, callback) ->
	setTimeout (=>
		unless cond
			waitFor cond, callback
		else
			callback.call()
	), 25

# Primeira letra maiúscula
capitalize = (string) ->
	string = String string
	string.charAt(0).toUpperCase() + string.slice(1)