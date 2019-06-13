<?php 

namespace Models;

class Config_site{

    private $nome_empresa;
    private $titulo;
    private $autor;
    private $descricao;
    private $imagem;
    private $meta_descricao;
    private $maps_pub_key;
    private $maps_priv_key;

    function __construct() {
        $this->nome_empresa = "";
        $this->titulo = "";
        $this->autor = "";
        $this->descricao = "";
        $this->imagem = "";
        $this->meta_descricao = "";
        $this->maps_pub_key = "";
        $this->maps_priv_key = "";
    }

    /**
     * nome_empresa
     * @type varchar
     */
    public function getNome_empresa() {
        return $this->nome_empresa;
    }
    public function setNome_empresa($nome_empresa) {
        $this->nome_empresa = $nome_empresa;
        return $this;
    }

    /**
     * titulo
     * @type varchar
     */
    public function getTitulo() {
        return $this->titulo;
    }
    public function setTitulo($titulo) {
        $this->titulo = $titulo;
        return $this;
    }

    /**
     * autor
     * @type varchar
     */
    public function getAutor() {
        return $this->autor;
    }
    public function setAutor($autor) {
        $this->autor = $autor;
        return $this;
    }

    /**
     * descricao
     * @type text
     */
    public function getDescricao() {
        return $this->descricao;
    }
    public function setDescricao($descricao) {
        $this->descricao = $descricao;
        return $this;
    }

    /**
     * imagem
     * @type varchar
     */
    public function getImagem() {
        return $this->imagem;
    }
    public function setImagem($imagem) {
        $this->imagem = $imagem;
        return $this;
    }

    /**
     * meta_descricao
     * @type varchar
     */
    public function getMeta_descricao() {
        return $this->meta_descricao;
    }
    public function setMeta_descricao($meta_descricao) {
        $this->meta_descricao = $meta_descricao;
        return $this;
    }

    /**
     * maps_pub_key
     * @type varchar
     */
    public function getMaps_pub_key() {
        return $this->maps_pub_key;
    }
    public function setMaps_pub_key($maps_pub_key) {
        $this->maps_pub_key = $maps_pub_key;
        return $this;
    }

    /**
     * maps_priv_key
     * @type varchar
     */
    public function getMaps_priv_key() {
        return $this->maps_priv_key;
    }
    public function setMaps_priv_key($maps_priv_key) {
        $this->maps_priv_key = $maps_priv_key;
        return $this;
    }

}