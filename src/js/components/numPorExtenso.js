
/* numPorExtenso
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
 */
define([], function() {
  var CENTENAS, DEZENAS, MILHAR, MILHARES, NumPorExtenso, UNIDADES;
  UNIDADES = ["Zero", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove"];
  DEZENAS = ["Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "oitenta", "Noventa"];
  CENTENAS = ["Cem", "Cento", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seissentos", "Setecentos", "Oitocentos", "Novecentos"];
  MILHAR = ["Mil", "Milhão", "Bilhão", "Trilhão", "Quatrilhão"];
  MILHARES = ["Mil", "Milhões", "Bilhões", "Trilhões", "Quatrilhões"];
  NumPorExtenso = (function() {
    function NumPorExtenso() {}

    NumPorExtenso.prototype.write = function(num, money) {
      var i, nLeft, text;
      if (money == null) {
        money = false;
      }
      if (num < 0.01) {
        return '';
      }
      text = money ? " Rea" + (num >= 1 && num < 2 ? 'l' : 'is') : '';
      nLeft = Math.floor(num);
      i = 0;
      while (nLeft) {
        if (nLeft % 1000) {
          text += (i ? this.convertToHundreds(nLeft) + " " + (nLeft === 1 ? MILHAR[i - 1] : MILHARES[i - 1]) : this.convertToHundreds(nLeft)) + text;
        }
        nLeft = Math.floor(nLeft / 1000);
        i++;
      }
      num = Math.round(num * 100) % 100;
      if (num) {
        text += " e " + this.convertToHundreds(num) + (money ? " Centavos" : '');
      }
      return "(" + text + ")";
    };

    NumPorExtenso.prototype.convertToHundreds = function(num) {
      var nNum, text;
      text = '';
      num %= 1000;
      if (num > 99) {
        nNum = Number((String(num)).charAt(0));
        text = num === 100 ? CENTENAS[nNum - 1] : CENTENAS[nNum];
        num %= 100;
        if (num) {
          text += " e ";
        }
      }
      if (num > 19) {
        nNum = Number((String(num)).charAt(0));
        text += DEZENAS[nNum - 2];
        num %= 10;
        if (num) {
          text += " e ";
        }
      }
      if (num) {
        text += UNIDADES[Math.floor(num)];
      }
      return text;
    };

    return NumPorExtenso;

  })();
  return new NumPorExtenso;
});
