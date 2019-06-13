<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Sistema extends CI_Controller {
	
	public function genModelDaos() {
		echo "Started: " . date('H:i:s', time());
		\System\Tools::generateModels($this->db->database);
		\System\Tools::generateDaos($this->db->database);
		echo "<br>Finished: " . date('H:i:s', time());
		echo "<h3><i><b>Models and DAO's successfully updated.</b></i></h3>";
	}

}