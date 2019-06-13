### numPorExtenso
	Escreve número por extenso (pt-br)
	____________________________________________________________________
	@Parâmetros
		@num float: Número à ser convertido
		@money boolean (opcional): se passado adiciona 'Reais' e 'Centavos'
	____________________________________________________________________
	@Exemplo NumPorExtenso.write(666.99, true)
		@Retorna Seissentos e Sessenta e Seis Reais e Noventa e Nove Centavos
	____________________________________________________________________
	Autor: YagoML
###

define [], ->

	UNIDADES = [ "Zero", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove",
	"Dez", "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito",
	"Dezenove"]
	DEZENAS = [ "Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "oitenta", "Noventa"]
	CENTENAS = ["Cem", "Cento", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seissentos", "Setecentos", "Oitocentos", "Novecentos"]
	MILHAR = [ "Mil", "Milhão", "Bilhão", "Trilhão", "Quatrilhão"]
	MILHARES = [ "Mil", "Milhões", "Bilhões", "Trilhões", "Quatrilhões"]

	class NumPorExtenso

		write: (num, money = false) ->
			if num < 0.01
				return ''

			text = if money then " Rea#{if num >= 1 and num < 2 then 'l' else 'is'}" else ''
			nLeft = Math.floor num
			i = 0

			while nLeft
				if nLeft % 1000
					text += (
						if i then (
							@convertToHundreds(nLeft) + " " +
							(if nLeft is 1 then MILHAR[i - 1] else MILHARES[i - 1])
						)
						else @convertToHundreds(nLeft)
					) + text

				nLeft = Math.floor nLeft / 1000
				i++

			num = Math.round(num * 100) % 100
			text += " e " + @convertToHundreds(num) + (if money then " Centavos" else '') if num
			"(#{text})"

		convertToHundreds: (num) ->
			text = ''
			num %= 1000

			if num > 99 # CENTENAS
				nNum = Number (String num).charAt(0)
				text = if num is 100 then CENTENAS[nNum-1] else CENTENAS[nNum]
				num %= 100
				text += " e " if num

			if num > 19 # DEZENAS
				nNum = Number (String num).charAt(0)
				text += DEZENAS[nNum - 2]
				num %= 10
				text += " e " if num

			# UNIDADES
			text += UNIDADES[Math.floor num] if num

			text

	new NumPorExtenso