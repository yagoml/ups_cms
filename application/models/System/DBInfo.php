<?php

namespace System;

class DBInfo {

	// Pega chaves estrangeiras de determinada tabela
	public static function getTableFKs($table) {
		$schemaName = 'ups_cms';
		return
			$GLOBALS["CI"]->db->query("
				SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
				FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
				WHERE
					CONSTRAINT_SCHEMA = '$schemaName'
					AND REFERENCED_TABLE_NAME = '$table'"
			)->result();
	}

	// Pega chaves estrangeiras do BD
	public static function getFKs() {
		$schemaName = 'ups_cms';
		return
			$GLOBALS["CI"]->db->query("
				SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_COLUMN_NAME
				FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
				WHERE CONSTRAINT_SCHEMA = '$schemaName'
			")->result();
	}

	// Pega valor default de uma columa de uma tabela
	public static function getColumnDefValue($tableInfo) {
		$schemaName = 'ups_cms';
		return
		// WHERE $where['table'] AND $where['column']
			current($GLOBALS["CI"]->db->query("
				SELECT *
				FROM INFORMATION_SCHEMA.COLUMNS
				WHERE
					TABLE_SCHEMA = '".$schemaName."'
					AND TABLE_NAME = '".$tableInfo['table']."'
					AND COLUMN_NAME = '".$tableInfo['column']."'
			")->result())->COLUMN_DEFAULT;
	}
}