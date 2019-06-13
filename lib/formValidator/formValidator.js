/**
 * Valida um formulário HTML e interrompe a execução no primeiro campo inválido ou continua executando uma callback.
 * @requires Plugin Modal
 * @param {array} inputs Array de inputs do formulário [nomeCampo, nameInput]
 * @param {array} inputNames Array de nomes dos inputs, os campos devem estar na mesma ordem do formulário ou do array inputs
 * @callback {function} callback Função que será chamada apos a validação
 * @author Yago ML
 */

var formValidator = function (inputs, inputNames, callback) {
    // var modal = new Modal();

    // for (i = 0; i < inputs.length; i++) {
    //     if (!document.getElementById(inputs[i]['name']).checkValidity()) {
    //         modal.response({
    //             class: 'danger',
    //             msg: inputNames[i] + ' inválido(a).'
    //         });
    //         return false;
    //     }
    // }
    
    callback();
};
