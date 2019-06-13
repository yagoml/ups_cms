<?php 

namespace DAOs;

class Uploaded_single_files {

    /** 
     * CRUD Basico de uploaded_single_files
     * @author UpSide Software Tools por YagoML
     */
    /* Nome da Tabela */
    private static $tableName = "uploaded_single_files";

    /**
     * Faz a busca em uploaded_single_files por ID.
     * @param integer $id uuid
     */

    public static function buscarPorId($id) {
        return $GLOBALS["CI"]->db->get_where(self::$tableName, ["uuid" => $id])->row();
    }

    /**
     * Faz busca filtrada em uploaded_single_files.
     * @param array $filtros [wheres[{"field" => " =/!= $value"}], joins[{$table => $field}], order_by[$field, $value], limit[$start, $qtd]]
     * @return object Uploaded_single_files = {uuid, name, caminho_arquivo, insertionDate, id_registro, tabela};
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
     * Insere uploaded_single_files no Banco.
     * @param array $dados [uuid, name, caminho_arquivo, insertionDate, id_registro, tabela]
     */

    public static function inserir($dados) {
        $arrayDados = \System\Tools::fieldsTableArray(self::$tableName, $dados);
        $GLOBALS["CI"]->db->set($arrayDados);
        $GLOBALS["CI"]->db->insert(self::$tableName);
        $lastId = $GLOBALS["CI"]->db->insert_id();
        $filters = [];
        $filters["wheres"][] = ["field" => "uuid = ", "value" => $lastId];
        return current(self::buscar($filters));
    }

    /** 
     * Retorna a quantidade de registros em uploaded_single_files.
     * @return integer = quantidade de registros em uploaded_single_files
     */ 

    public static function qtdRegistros() {
        return $GLOBALS["CI"]->db->count_all(self::$tableName);
    }

    /**
     * Atualiza registro de uploaded_single_files por ID
     * @param $id integer ID de uploaded_single_files a ser atualizado
     * @param $dados object Uploaded_single_files = {uuid, name, caminho_arquivo, insertionDate, id_registro, tabela}
     */

    public static function update($id, $dados) {
        $arrayDados = gettype($dados) != "array" ? \System\Tools::object2array($dados) : $dados;
        $GLOBALS["CI"]->db->where("uuid", $id);
        $GLOBALS["CI"]->db->update("uploaded_single_files", $arrayDados);
    }

    /**
     * Deleta registro de uploaded_single_files por ID
     * @param $id integer ID de uploaded_single_files a ser deletado
     */

    public static function deletar($id) {
        $GLOBALS["CI"]->db->delete("uploaded_single_files", ["uuid" => $id]);
    }

}