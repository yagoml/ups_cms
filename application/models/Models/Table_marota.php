<?php 

namespace Models;

class Table_marota{

    private $bagaceira;
    private $fudencio;
    private $puts_man;
    private $insertionDate;
    private $ordem;
    private $tabela_idTabela;

    function __construct() {
        $this->bagaceira = "";
        $this->fudencio = "";
        $this->puts_man = "0000-00-00 00:00";
        $this->insertionDate = "0000-00-00 00:00";
        $this->ordem = 0;
        $this->tabela_idTabela = 0;
    }

    /**
     * bagaceira
     * @type varchar
     */
    public function getBagaceira() {
        return $this->bagaceira;
    }
    public function setBagaceira($bagaceira) {
        $this->bagaceira = $bagaceira;
        return $this;
    }

    /**
     * fudencio
     * @type text
     */
    public function getFudencio() {
        return $this->fudencio;
    }
    public function setFudencio($fudencio) {
        $this->fudencio = $fudencio;
        return $this;
    }

    /**
     * puts_man
     * @type timestamp
     */
    public function getPuts_man() {
        return $this->puts_man;
    }
    public function setPuts_man($puts_man) {
        $this->puts_man = $puts_man;
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

}