<?php 

namespace Models;

class Arquivos_tabela{

    private $uuid;
    private $caminho_arquivo;
    private $name;
    private $tabela_idTabela;
    private $insertionDate;
    private $ordem;

    function __construct() {
        $this->uuid = "";
        $this->caminho_arquivo = "";
        $this->name = "";
        $this->tabela_idTabela = 0;
        $this->insertionDate = "0000-00-00 00:00";
        $this->ordem = 0;
    }

    /**
     * uuid
     * @type char
     */
    public function getUuid() {
        return $this->uuid;
    }
    public function setUuid($uuid) {
        $this->uuid = $uuid;
        return $this;
    }

    /**
     * caminho_arquivo
     * @type varchar
     */
    public function getCaminho_arquivo() {
        return $this->caminho_arquivo;
    }
    public function setCaminho_arquivo($caminho_arquivo) {
        $this->caminho_arquivo = $caminho_arquivo;
        return $this;
    }

    /**
     * name
     * @type varchar
     */
    public function getName() {
        return $this->name;
    }
    public function setName($name) {
        $this->name = $name;
        return $this;
    }

    /**
     * tabela_idTabela
     * @type int
     */
    public function getTabela_idTabela() {
        return $this->tabela_idTabela;
    }
    public function setTabela_idTabela($tabela_idTabela) {
        $this->tabela_idTabela = $tabela_idTabela;
        return $this;
    }

    /**
     * insertionDate
     * @type timestamp
     */
    public function getInsertionDate() {
        return $this->insertionDate;
    }
    public function setInsertionDate($insertionDate) {
        $this->insertionDate = $insertionDate;
        return $this;
    }

    /**
     * ordem
     * @type int
     */
    public function getOrdem() {
        return $this->ordem;
    }
    public function setOrdem($ordem) {
        $this->ordem = $ordem;
        return $this;
    }

}