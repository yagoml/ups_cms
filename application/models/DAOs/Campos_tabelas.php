<?php 

namespace DAOs;

class Campos_tabelas {

    /** 
     * CRUD Basico de campos_tabelas
     * @author UpSide Software Tools por YagoML
     */
    /* Nome da Tabela */
    private static $tableName = "campos_tabelas";

    /**
     * Faz a busca em campos_tabelas por ID.
     * @param integer $id idCamposTabela
     */

    public static function buscarPorId($id) {
        return $GLOBALS["CI"]->db->get_where(self::$tableName, ["idCamposTabela" => $id])->row();
    }

    /**
     * Faz busca filtrada em campos_tabelas.
     * @param array $filtros [wheres[{"field" => " =/!= $value"}], joins[{$table => $field}], order_by[$field, $value], limit[$start, $qtd]]
     * @return object Campos_tabelas = {idCamposTabela, tabela, campo, nome, dataType};
     */

    public static function buscar($filtros = []) {
        $query = "SELECT * FROM " . self::$tableName;

        if (isset($filtros["joins"])) {
            foreach ($filtros["joins"] as $join) {
                $query .= " LEFT JOIN " . $join["table"] . " ON " . self::$tableName . "." . $join["fk"] . " = " . $join["table"] . "." . $join["field"];
            }
        }

        if (isset($filtros["wheres"])) {
            $query .= " WHERE";
            foreach ($filtros["wheres"] as $key => $where) {
                if (!$where) {
                    unset($filtros[$key]);
                }

                $query .= " " . $where["field"] . $where["value"];
                if (count($filtros["wheres"]) > 1 && $key < count($filtros["wheres"]) - 1) {
                    $query .= " AND";
                }
            }
        }

        if (isset($filtros["orWheres"])) {
            $query .= !isset($filtros["wheres"]) ? " WHERE" : " OR";
            foreach ($filtros["orWheres"] as $key => $orWhere) {
                if (!$orWhere) {
                    unset($filtros[$key]);
                } 
                $query .= " " . $orWhere["field"] . $orWhere["value"];
                if (count($filtros["orWheres"]) > 1 && $key < count($filtros["orWheres"]) - 1) {
                    $query .= " OR";
                }
            }
        }

        if (isset($filtros["order_by"])) {
            $query .= " ORDER BY " . $filtros["order_by"]["field"] . " " . $filtros["order_by"]["value"];
        }

        if (isset($filtros["limit"])) {
            $query .= " LIMIT " . $filtros["limit"]["start"] . ", " . $filtros["limit"]["qtd"];
        }

        return $GLOBALS["CI"]->db->query($query)->result();
    }

    /**
     * Insere campos_tabelas no Banco.
     * @param array $dados [idCamposTabela, tabela, campo, nome, dataType]
     */

    public static function inserir($dados) {
        $arrayDados = \System\Tools::fieldsTableArray(self::$tableName, $dados);
        $GLOBALS["CI"]->db->set($arrayDados);
        $GLOBALS["CI"]->db->insert(self::$tableName);
        $lastId = $GLOBALS["CI"]->db->insert_id();
        $filters = [];
        $filters["wheres"][] = ["field" => "idCamposTabela = ", "value" => $lastId];
        return current(self::buscar($filters));
    }

    /** 
     * Retorna a quantidade de registros em campos_tabelas.
     * @return integer = quantidade de registros em campos_tabelas
     */ 

    public static function qtdRegistros() {
        return $GLOBALS["CI"]->db->count_all(self::$tableName);
    }

    /**
     * Atualiza registro de campos_tabelas por ID
     * @param $id integer ID de campos_tabelas a ser atualizado
     * @param $dados object Campos_tabelas = {idCamposTabela, tabela, campo, nome, dataType}
     */

    public static function update($id, $dados) {
        $arrayDados = gettype($dados) != "array" ? \System\Tools::object2array($dados) : $dados;
        $GLOBALS["CI"]->db->where("idCamposTabela", $id);
        $GLOBALS["CI"]->db->update("campos_tabelas", $arrayDados);
    }

    /**
     * Deleta registro de campos_tabelas por ID
     * @param $id integer ID de campos_tabelas a ser deletado
     */

    public static function deletar($id) {
        $GLOBALS["CI"]->db->delete("campos_tabelas", ["idCamposTabela" => $id]);
    }

}