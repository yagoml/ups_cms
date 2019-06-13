<?php

namespace System;

class Tools {

	/**
	 * Gera todos os DAO's (Data Access Object's) de um BD
	 * @param string $db Nome do BD
	 * @author Yago M. Laignier <yagoskor@gmail.com>
	 */
	public static function generateDaos($db) {
		$tables = $GLOBALS["CI"]->db->query("SHOW TABLES")->result();
		$namespace = 'DAOs';
		$indexTables = 'Tables_in_' . $db;

		foreach ($tables as $table) {
			$tableName = $table->$indexTables;
			$fields = $GLOBALS["CI"]->db->field_data($tableName);
			$dao = fopen('application/models/' . $namespace . '/' . ucfirst($tableName) . '.php', 'w');
			$fieldsInfo = '';
			foreach ($fields as $key => $field) {
				if ($field->primary_key) {
					$pk = $field->name;
				}
				$fieldsInfo .= "$field->name" . ($key == count($fields) - 1 ? '' : ', ');
			}

			$daoInfo = '    /** ' . PHP_EOL
					. '     * CRUD Basico de ' . $tableName . '' . PHP_EOL
					. '     * @author UpSide Software Tools por YagoML' . PHP_EOL
					. '     */' . PHP_EOL
					. '    /* Nome da Tabela */' . PHP_EOL
					. '    private static $tableName = "' . $tableName . '";' . PHP_EOL . PHP_EOL
					. '    /**' . PHP_EOL
					. '     * Faz a busca em ' . $tableName . ' por ID.' . PHP_EOL
					. '     * @param integer $id ' . $pk . PHP_EOL
					. '     */' . PHP_EOL . PHP_EOL
					. '    public static function buscarPorId($id) {' . PHP_EOL
					. '        return $GLOBALS["CI"]->db->get_where(self::$tableName, ["' . $pk . '" => $id])->row();' . PHP_EOL
					. '    }' . PHP_EOL . PHP_EOL
					. '    /**' . PHP_EOL
					. '     * Faz busca filtrada em ' . $tableName . '.' . PHP_EOL
					. '     * @param array $filtros [wheres[{"field" => " =/!= $value"}], joins[{$table => $field}], order_by[$field, $value], limit[$start, $qtd]]' . PHP_EOL
					. '     * @return object ' . ucfirst($tableName) . ' = {' . $fieldsInfo . '};' . PHP_EOL
					. '     */' . PHP_EOL . PHP_EOL
					. '    public static function buscar($filtros = []) {' . PHP_EOL
					. '        $query = "SELECT * FROM " . self::$tableName;' . PHP_EOL . PHP_EOL
					. '        if (isset($filtros["joins"])) {' . PHP_EOL
					. '            foreach ($filtros["joins"] as $join) {' . PHP_EOL
					. '                $query .= " LEFT JOIN " . $join["table"] . " ON " . self::$tableName . "." . $join["fk"] . " = " . $join["table"] . "." . $join["field"];' . PHP_EOL
					. '            }' . PHP_EOL
					. '        }' . PHP_EOL . PHP_EOL
					. '        if (isset($filtros["wheres"])) {' . PHP_EOL
					. '            $query .= " WHERE";' . PHP_EOL
					. '            foreach ($filtros["wheres"] as $key => $where) {' . PHP_EOL
					. '                if (!$where) {' . PHP_EOL
					. '                    unset($filtros[$key]);' . PHP_EOL
					. '                }' . PHP_EOL . PHP_EOL
					. '                $query .= " " . $where["field"] . $where["value"];' . PHP_EOL
					. '                if (count($filtros["wheres"]) > 1 && $key < count($filtros["wheres"]) - 1) {' . PHP_EOL
					. '                    $query .= " AND";' . PHP_EOL
					. '                }' . PHP_EOL
					. '            }' . PHP_EOL
					. '        }' . PHP_EOL . PHP_EOL
					. '        if (isset($filtros["orWheres"])) {' . PHP_EOL
					. '            $query .= !isset($filtros["wheres"]) ? " WHERE" : " OR";' . PHP_EOL
					. '            foreach ($filtros["orWheres"] as $key => $orWhere) {' . PHP_EOL
					. '                if (!$orWhere) {' . PHP_EOL
					. '                    unset($filtros[$key]);' . PHP_EOL
					. '                } ' . PHP_EOL
					. '                $query .= " " . $orWhere["field"] . $orWhere["value"];' . PHP_EOL
					. '                if (count($filtros["orWheres"]) > 1 && $key < count($filtros["orWheres"]) - 1) {' . PHP_EOL
					. '                    $query .= " OR";' . PHP_EOL
					. '                }' . PHP_EOL
					. '            }' . PHP_EOL
					. '        }' . PHP_EOL . PHP_EOL
					. '        if (isset($filtros["order_by"])) {' . PHP_EOL
					. '            $query .= " ORDER BY " . $filtros["order_by"]["field"] . " " . $filtros["order_by"]["value"];' . PHP_EOL
					. '        }' . PHP_EOL . PHP_EOL
					. '        if (isset($filtros["limit"])) {' . PHP_EOL
					. '            $query .= " LIMIT " . $filtros["limit"]["start"] . ", " . $filtros["limit"]["qtd"];' . PHP_EOL
					. '        }' . PHP_EOL . PHP_EOL
					. '        return $GLOBALS["CI"]->db->query($query)->result();' . PHP_EOL
					. '    }' . PHP_EOL . PHP_EOL
					. '    /**' . PHP_EOL
					. '     * Insere ' . $tableName . ' no Banco.' . PHP_EOL
					. '     * @param array $dados [' . $fieldsInfo . ']' . PHP_EOL
					. '     */' . PHP_EOL . PHP_EOL
					. '    public static function inserir($dados) {' . PHP_EOL
					. '        $arrayDados = \System\Tools::fieldsTableArray(self::$tableName, $dados);' . PHP_EOL
					. '        $GLOBALS["CI"]->db->set($arrayDados);' . PHP_EOL
					. '        $GLOBALS["CI"]->db->insert(self::$tableName);' . PHP_EOL
					. '        $lastId = $GLOBALS["CI"]->db->insert_id();' . PHP_EOL
					. '        $filters = [];' . PHP_EOL
					. '        $filters["wheres"][] = ["field" => "' . $pk . ' = ", "value" => $lastId];' . PHP_EOL
					. '        return current(self::buscar($filters));' . PHP_EOL
					. '    }' . PHP_EOL . PHP_EOL
					. '    /** ' . PHP_EOL
					. '     * Retorna a quantidade de registros em ' . $tableName . '.' . PHP_EOL
					. '     * @return integer = quantidade de registros em ' . $tableName . PHP_EOL
					. '     */ ' . PHP_EOL . PHP_EOL
					. '    public static function qtdRegistros() {' . PHP_EOL
					. '        return $GLOBALS["CI"]->db->count_all(self::$tableName);' . PHP_EOL
					. '    }' . PHP_EOL . PHP_EOL
					. '    /**' . PHP_EOL
					. '     * Atualiza registro de ' . $tableName . ' por ID' . PHP_EOL
					. '     * @param $id integer ID de ' . $tableName . ' a ser atualizado' . PHP_EOL
					. '     * @param $dados object ' . ucfirst($tableName) . ' = {' . $fieldsInfo . '}' . PHP_EOL
					. '     */' . PHP_EOL . PHP_EOL
					. '    public static function update($id, $dados) {' . PHP_EOL
					. '        $arrayDados = gettype($dados) != "array" ? \System\Tools::object2array($dados) : $dados;' . PHP_EOL
					. '        $GLOBALS["CI"]->db->where("' . $pk . '", $id);' . PHP_EOL
					. '        $GLOBALS["CI"]->db->update("' . $tableName . '", $arrayDados);' . PHP_EOL
					. '    }' . PHP_EOL . PHP_EOL
					. '    /**' . PHP_EOL
					. '     * Deleta registro de ' . $tableName . ' por ID' . PHP_EOL
					. '     * @param $id integer ID de ' . $tableName . ' a ser deletado' . PHP_EOL
					. '     */' . PHP_EOL . PHP_EOL
					. '    public static function deletar($id) {' . PHP_EOL
					. '        $GLOBALS["CI"]->db->delete("' . $tableName . '", ["' . $pk . '" => $id]);' . PHP_EOL
					. '    }' . PHP_EOL . PHP_EOL;

			fwrite($dao, '<?php ' . PHP_EOL . PHP_EOL
					. 'namespace ' . $namespace . ';' . PHP_EOL . PHP_EOL
					. 'class ' . ucfirst($tableName) . ' {' . PHP_EOL . PHP_EOL
					. $daoInfo
					. '}'
			);

			fclose($dao);
		}
	}

	/**
	 * Converte array para objeto
	 * @param object $object 
	 * Objeto de Dados
	 * @return array
	 */
	public static function object2array($object) {
		$reflectionClass = new \ReflectionClass(get_class($object));
		$array = [];
		foreach ($reflectionClass->getProperties() as $property) {
			$property->setAccessible(true);
			$array[$property->getName()] = $property->getValue($object);
			$property->setAccessible(false);
		}
		return $array;
	}

	/**
	 * Gera um array para uma tabela a partir de um objeto
	 * @param string $table Nome da tabela
	 * @param object $dados Objeto de Dados
	 * @return array
	 */
	public static function fieldsTableArray($table, $dados) {
		if(gettype($dados) != 'array') {
			$arrayDados = [];
			$fields = $GLOBALS['CI']->db->field_data($table);

			foreach ($fields as $field) {
				if (!$field->primary_key || ($field->primary_key && $field->type != 'int')) {
					$getField = 'get' . ucfirst($field->name);
					$arrayDados[$field->name] = $dados->$getField();
				}
			}

			return $arrayDados;
		} else {
			return $dados;
		}
	}

	/**
	 * Inicializa campos do Model
	 * @param string $type
	 * @author Yago M. Laignier <yagoskor@gmail.com>
	 */
	public static function initField($type) {
		switch ($type) {
			case ($type == 'int' || $type == 'tinyint'):
				return 0;
			case ($type == 'varchar' || $type == 'char' || $type == 'text') :
				return '""';
			case ($type == 'decimal' || $type == 'double' || $type == 'float'):
				return '0.00';
			case ($type == 'datetime' || $type == 'date' || $type == 'timestamp'):
				return '"0000-00-00 00:00"';
			default:
				break;
		}
	}

	/**
	 * Gera todos os models de um BD
	 * @param string $db Nome do BD
	 * @author Yago M. Laignier <yagoskor@gmail.com>
	 */
	public static function generateModels($db) {
		$ci = &get_instance();
		$tables = $ci->db->query("SHOW TABLES")->result();
		$namespace = 'Models';
		$indexTables = 'Tables_in_' . $db;

		foreach ($tables as $table) {
			$tableName = $table->$indexTables;
			$fields = $ci->db->field_data($tableName);
			$model = fopen('application/models/' . $namespace . '/' . ucfirst($tableName) . '.php', 'w');
			$modelInfo = '';

			foreach ($fields as $field) {
				if (!$field->primary_key || ($field->primary_key && $field->type != 'int')) {
					$modelInfo .= '    private $' . $field->name . ';' . PHP_EOL;
				}
			}

			$modelInfo .= PHP_EOL . '    function __construct() {' . PHP_EOL;
			foreach ($fields as $field) {
				if (!$field->primary_key || ($field->primary_key && $field->type != 'int')) {
					$modelInfo .= '        $this->' . $field->name . ' = ' . self::initField($field->type) . ';' . PHP_EOL;
				}
			}
			$modelInfo .= '    }' . PHP_EOL . PHP_EOL;

			foreach ($fields as $field) {
				if (!$field->primary_key || ($field->primary_key && $field->type != 'int')) {
					$modelInfo .= '    /**' . PHP_EOL . '     * ' . $field->name . PHP_EOL . '     * @type ' . $field->type . PHP_EOL . '     */' . PHP_EOL;
					$modelInfo .= '    public function get' . ucfirst($field->name) . '() {' . PHP_EOL;
					$modelInfo .= '        return $this->' . $field->name . ';' . PHP_EOL;
					$modelInfo .= '    }' . PHP_EOL;

					$modelInfo .= '    public function set' . ucfirst($field->name) . '($' . $field->name . ') {' . PHP_EOL;
					$modelInfo .= '        $this->' . $field->name . ' = $' . $field->name . ';' . PHP_EOL;
					$modelInfo .= '        return $this;' . PHP_EOL;
					$modelInfo .= '    }' . PHP_EOL . PHP_EOL;
				}
			}

			fwrite($model, '<?php ' . PHP_EOL . PHP_EOL
					. 'namespace ' . $namespace . ';' . PHP_EOL . PHP_EOL
					. 'class ' . ucfirst($tableName) . '{' . PHP_EOL . PHP_EOL
					. $modelInfo
					. '}'
			);
			fclose($model);
		}
	}
	
	/**
	 * Gera uma String Aleatória
	 * @param int $length Tamanho da string desejada
	 * @return string
	 */
	public static function stringGenerator($length) {
		$caracters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		return substr(str_shuffle(str_repeat($x = $caracters, ceil($length / strlen($x)))), 1, $length);
	}

	/**
	 * Pega os dados do cabeçalho da requisição
	 * @return array
	 */
	public static function getallheaders() {
		if (!function_exists('getallheaders')) {
			$headers = []; 
			foreach ($_SERVER as $name => $value) {
				if (substr($name, 0, 5) == 'HTTP_') {
					$headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
				}
			}
			return $headers; 
		} else {
			return getallheaders();
		}
	}
}
