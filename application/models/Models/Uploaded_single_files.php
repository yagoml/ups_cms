<?php 

namespace Models;

class Uploaded_single_files{

    private $uuid;
    private $name;
    private $caminho_arquivo;
    private $insertionDate;
    private $id_registro;
    private $tabela;

    function __construct() {
        $this->uuid = "";
        $this->name = "";
        $this->caminho_arquivo = "";
        $this->insertionDate = "0000-00-00 00:00";
        $this->id_registro = 0;
        $this->tabela = "";
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
     * id_registro
     * @type int
     */
    public function getId_registro() {
        return $this->id_registro;
    }
    public function setId_registro($id_registro) {
        $this->id_registro = $id_registro;
        return $this;
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

}