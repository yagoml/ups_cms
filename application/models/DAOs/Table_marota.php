<?php 

namespace DAOs;

class Table_marota {

    /** 
     * CRUD Basico de table_marota
     * @author UpSide Software Tools por YagoML
     */
    /* Nome da Tabela */
    private static $tableName = "table_marota";

    /**
     * Faz a busca em table_marota por ID.
     * @param integer $id idtable_marota
     */

    public static function buscarPorId($id) {
        return $GLOBALS["CI"]->db->get_where(self::$tableName, ["idtable_marota" => $id])->row();
    }

    /**
     * Faz busca filtrada em table_marota.
     * @param array $filtros [wheres[{"field" => " =/!= $value"}], joins[{$table => $field}], order_by[$field, $value], limit[$start, $qtd]]
     * @return object Table_marota = {idtable_marota, bagaceira, fudencio, puts_man, insertionDate, ordem, tabela_idTabela};
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
     * Insere table_marota no Banco.
     * @param array $dados [idtable_marota, bagaceira, fudencio, puts_man, insertionDate, ordem, tabela_idTabela]
     */

    public static function inserir($dados) {
        $arrayDados = \System\Tools::fieldsTableArray(self::$tableName, $dados);
        $GLOBALS["CI"]->db->set($arrayDados);
        $GLOBALS["CI"]->db->insert(self::$tableName);
        $lastId = $GLOBALS["CI"]->db->insert_id();
        $filters = [];
        $filters["wheres"][] = ["field" => "idtable_marota = ", "value" => $lastId];
        return current(self::buscar($filters));
    }

    /** 
     * Retorna a quantidade de registros em table_marota.
     * @return integer = quantidade de registros em table_marota
     */ 

    public static function qtdRegistros() {
        return $GLOBALS["CI"]->db->count_all(self::$tableName);
    }

    /**
     * Atualiza registro de table_marota por ID
     * @param $id integer ID de table_marota a ser atualizado
     * @param $dados object Table_marota = {idtable_marota, bagaceira, fudencio, puts_man, insertionDate, ordem, tabela_idTabela}
     */

    public static function update($id, $dados) {
        $arrayDados = gettype($dados) != "array" ? \System\Tools::object2array($dados) : $dados;
        $GLOBALS["CI"]->db->where("idtable_marota", $id);
        $GLOBALS["CI"]->db->update("table_marota", $arrayDados);
    }

    /**
     * Deleta registro de table_marota por ID
     * @param $id integer ID de table_marota a ser deletado
     */

    public static function deletar($id) {
        $GLOBALS["CI"]->db->delete("table_marota", ["idtable_marota" => $id]);
    }

}