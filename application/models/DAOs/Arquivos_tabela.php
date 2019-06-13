<?php 

namespace DAOs;

class Arquivos_tabela {

    /** 
     * CRUD Basico de arquivos_tabela
     * @author UpSide Software Tools por YagoML
     */
    /* Nome da Tabela */
    private static $tableName = "arquivos_tabela";

    /**
     * Faz a busca em arquivos_tabela por ID.
     * @param integer $id uuid
     */

    public static function buscarPorId($id) {
        return $GLOBALS["CI"]->db->get_where(self::$tableName, ["uuid" => $id])->row();
    }

    /**
     * Faz busca filtrada em arquivos_tabela.
     * @param array $filtros [wheres[{"field" => " =/!= $value"}], joins[{$table => $field}], order_by[$field, $value], limit[$start, $qtd]]
     * @return object Arquivos_tabela = {uuid, caminho_arquivo, name, tabela_idTabela, insertionDate, ordem};
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
     * Insere arquivos_tabela no Banco.
     * @param array $dados [uuid, caminho_arquivo, name, tabela_idTabela, insertionDate, ordem]
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
     * Retorna a quantidade de registros em arquivos_tabela.
     * @return integer = quantidade de registros em arquivos_tabela
     */ 

    public static function qtdRegistros() {
        return $GLOBALS["CI"]->db->count_all(self::$tableName);
    }

    /**
     * Atualiza registro de arquivos_tabela por ID
     * @param $id integer ID de arquivos_tabela a ser atualizado
     * @param $dados object Arquivos_tabela = {uuid, caminho_arquivo, name, tabela_idTabela, insertionDate, ordem}
     */

    public static function update($id, $dados) {
        $arrayDados = gettype($dados) != "array" ? \System\Tools::object2array($dados) : $dados;
        $GLOBALS["CI"]->db->where("uuid", $id);
        $GLOBALS["CI"]->db->update("arquivos_tabela", $arrayDados);
    }

    /**
     * Deleta registro de arquivos_tabela por ID
     * @param $id integer ID de arquivos_tabela a ser deletado
     */

    public static function deletar($id) {
        $GLOBALS["CI"]->db->delete("arquivos_tabela", ["uuid" => $id]);
    }

}