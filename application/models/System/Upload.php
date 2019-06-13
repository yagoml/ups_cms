<?php

namespace System;

define('IMAGES', 'gif|jpg|png');
define('VIDEOS', '|mp4');
define('DOCUMENTS', '|pdf|doc|docx|xls|xlsx|ppt|pptx|txt');
define('ALLOWED_EXT', IMAGES . DOCUMENTS . VIDEOS);

class Upload {
	static $config = [
		'upload_path' => 'uploads/',
		'allowed_types' => ALLOWED_EXT,
		'max_size' => '10000',
		'max_width' => '2000',
		'max_height' => '2000'
	];

	public static function sendInputFile($inputName, $idName = null) {
		$ci = get_instance();

		if($idName) {
			self::$config['file_name'] = $idName;
		}

		$ci->load->library('upload', self::$config);
		$success = $ci->upload->do_upload($inputName);

		if($success) {
			return $ci->upload->data();
		} else {
			// Parametros: html text antes e depois do erro
			return $ci->upload->display_errors('', '');
		}
	}

	public static function deleteFile($input) {
		$ci = get_instance();
		$namespace = '\\DAOs\\' . $input['table'];
		$file = ${"namespace"}::buscarPorId($input['qquuid']);
		// Remove do BD
		${"namespace"}::deletar($input['qquuid']);
		/* Remove do diretório uploads
		 Espaços são substituidos por '_', no plugin uploader */
		unlink(str_replace(' ', '_', $file->caminho_arquivo));
		if(isset($input['singleFile']) && $input['singleFile']) {
			// Atualiza o caminho do arquivo no registro da tabela pai
			$ci->db->query("
				update ".$ci->db->escape_str($input['parentTable'])." set ".$ci->db->escape_str($input['fieldDir'])." = 'uploads/' where " . $ci->db->escape_str($input['parentPK']) . " = " . (int) $input['id']
			);
		}
	}
}