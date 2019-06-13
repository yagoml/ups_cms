
<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class TableInfos extends CI_Controller {

	public function index() {
		header('Content-Type: application/json');
		echo json_encode([
			'fieldsData' => $this->db->field_data($this->input->post('table')),
			'fksData' => \System\DBInfo::getTableFKs($this->input->post('table'))
		]);
	}

	public function titles() {
		$filter = [];
		$filter['wheres'] = [['field' => 'tabela = ', 'value' => '"' . $this->input->post('table') . '"']];
		header('Content-Type: application/json');
		echo json_encode(\DAOs\Campos_tabelas::buscar($filter));
	}

	public function fks() {
		header('Content-Type: application/json');
		echo json_encode(\System\DBInfo::getFKs());
	}

	public function getTableFKs() {
		header('Content-Type: application/json');
		echo json_encode(
			\System\DBInfo::getTableFKs($this->input->post('table'))
		);
	}

	public function systemFields() {
		header('Content-Type: application/json');
		echo json_encode($this->config->item('upsConfig')['systemFields']);
	}

	public function cmsTables() {
		header('Content-Type: application/json');
		echo json_encode($this->config->item('upsConfig')['accessibleTables']);
	}
}