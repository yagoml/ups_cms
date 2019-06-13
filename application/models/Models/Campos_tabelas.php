<?php 

namespace Models;

class Campos_tabelas{

    private $tabela;
    private $campo;
    private $nome;
    private $dataType;

    function __construct() {
        $this->tabela = "";
        $this->campo = "";
        $this->nome = "";
        $this->dataType = "";
    }

    /**
     * tabela
     * @type varchar
     */
    public function getTabela() {
        return $this->tabela;
    }
    public function setTabela($tabela) {
        $this->tabela = $tabela;
        return $this;
    }

    /**
     * campo
     * @type varchar
     */
    public function getCampo() {
        return $this->campo;
    }
    public function setCampo($campo) {
        $this->campo = $campo;
        return $this;
    }

    /**
     * nome
     * @type varchar
     */
    public function getNome() {
        return $this->nome;
    }
    public function setNome($nome) {
        $this->nome = $nome;
        return $this;
    }

    /**
     * dataType
     * @type varchar
     */
    public function getDataType() {
        return $this->dataType;
    }
    public function setDataType($dataType) {
        $this->dataType = $dataType;
        return $this;
    }

}