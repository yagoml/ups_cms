<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cms extends CI_Controller {

	public function index() {
		$data = array();
		$data['pagina'] = 'admin';
		$this->load->view('index', $data);
	}
}