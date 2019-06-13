<?php 

namespace Models;

class Tabela{

    private $varChar;
    private $text;
    private $date;
    private $integer;
    private $ordem;
    private $insertionDate;
    private $arquivo;

    function __construct() {
        $this->varChar = "";
        $this->text = "";
        $this->date = "0000-00-00 00:00";
        $this->integer = 0;
        $this->ordem = 0;
        $this->insertionDate = "0000-00-00 00:00";
        $this->arquivo = "";
    }

    /**
     * varChar
     * @type varchar
     */
    public function getVarChar() {
        return $this->varChar;
    }
    public function setVarChar($varChar) {
        $this->varChar = $varChar;
        return $this;
    }

    /**
     * text
     * @type text
     */
    public function getText() {
        return $this->text;
    }
    public function setText($text) {
        $this->text = $text;
        return $this;
    }

    /**
     * date
     * @type date
     */
    public function getDate() {
        return $this->date;
    }
    public function setDate($date) {
        $this->date = $date;
        return $this;
    }

    /**
     * integer
     * @type int
     */
    public function getInteger() {
        return $this->integer;
    }
    public function setInteger($integer) {
        $this->integer = $integer;
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
     * arquivo
     * @type varchar
     */
    public function getArquivo() {
        return $this->arquivo;
    }
    public function setArquivo($arquivo) {
        $this->arquivo = $arquivo;
        return $this;
    }

}