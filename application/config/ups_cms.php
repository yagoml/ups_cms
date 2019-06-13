<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$config['upsConfig'] = [
	'accessibleTables' => [
		(object) ['table' => 'tabela', 'name' => 'Tabela'],
		(object) ['table' => 'config_site', 'name' => 'Configurações', 'unique' => true]
	],
	'systemFields' => [
		'ordem',
		'insertionDate'
	]
];