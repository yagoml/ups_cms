<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dados extends CI_Controller {

	public function index() {
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
			header('Content-Type: application/json');
			$get = $this->input->get();
			$namespace = '\\DAOs\\' . $get['table'];
			$filters = [];

			if(isset($get['orderBy'])) {
				# Foi solicitado 
				$orderBy = $get['orderBy'];
			} else {
				$orderBy = 'ordem';
			}

			if(gettype($this->input->get('pagina')) != 'NULL') {
				// Busca paginada 20 em 20 dados
				$qtd = 20;
				$pagina = (int) $this->input->get('pagina');
				$filters = System\Paginator::filterPagination($pagina, $qtd);
			}
			
			if($orderBy && strlen($orderBy)) {
				$filters['order_by'] = ['field' => $orderBy, 'value' => 'DESC'];
			}

			if(isset($get['filterID'])) {
				// Pega dados da tabela 'children'
				// filterID: Busca Filtrada por ID (PK)
				$keyType = isset($get['fk']) ? 'fk' : 'pk';
				$filters['wheres'] = [
					['field' => $get[$keyType] . ' = ', 'value' => $get['filterID']]
				];
			}

			$data = ${"namespace"}::buscar($filters);

			# Se tem essa propriedade é upload de arquivos
			if(isset($get['qqtimestamp'])) {
				foreach ($data as $value) {
					$fieldDir = $get['fieldDir'];
					if(isset($value->${"fieldDir"}))
						$value->thumbnailUrl = $value->${"fieldDir"};
					else
						$value->thumbnailUrl = 'uploads/' . $value->uuid;
				}
			}

			echo json_encode($data);
		}

		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			$post = $this->input->post();
			$namespace = '\\DAOs\\' . $post['table'];
			$tableData = ${"namespace"}::buscar();

			if ($post) { // DELETAR: Post manual via ajax
				${"namespace"}::deletar($post[$post['pk']]);
			} else { // Post automático da collection
				$data = json_decode(file_get_contents('php://input'));
				$evento = new Models\Eventos;
				$evento->setTipo($data->tipo);

				if (isset($data->id_evento)) { // EDITAR: Se tem a prop. id_evento definida
					${"namespace"}::update($data->id_evento, $evento);
					echo json_encode(['finished' => true]);
				} else { // INSERIR
					echo json_encode(${"namespace"}::inserir($evento));
				}
			}
		}
	}

	public function filtro() {
		$filtro = $this->input->post();
		if ($filtro) {
			header('Content-Type: application/json');
			echo json_encode(\Repository\Eventos::filtroEventos($filtro));
		}
	}

	public function upload() {
		$input = $this->input->post();
		$dirUploads = 'uploads/';
		$dao = '\\DAOs\\' . strtoupper($input['table']);
		$model = '\\Models\\' . strtoupper($input['table']);
		// Nome do método que seta o ID da FK relacionada
		$setFKMethodName = 'set' . strtoupper($input['fk']);
		$fileData = new ${"model"};
		// qqfile: name do input file q estao carregados os arquivos
		$uploadResponse = \System\Upload::sendInputFile('qqfile', $input['qquuid']);
		// Se retornar um array deu certo, se retornar string, já é a msg de erro
		$success = gettype($uploadResponse) == 'array';

		if($success) {
			$fileData->$setFKMethodName($input['id']);
			$fileData->setName($input['qqfilename']);
			$fileData->setUuid($input['qquuid']);

			$fileData->setCaminho_arquivo($dirUploads . $uploadResponse['file_name']);
			$fileData->setInsertionDate(date('Y-m-d H:i:s', time()));

			if(isset($input['singleFile']) && $input['singleFile']) {
				// Salvando arquivo ÚNICO (singleFile)
				$fileData->setTabela($input['parentTable']);
				$fileData->setId_registro($input['id']);
				// Arquivo antigo caso existir
				$oldFile = current($this->db->get_where(
					'uploaded_single_files',
					['id_registro', $input['id']]
				)->result());

				if($oldFile) {
					unlink($oldFile->caminho_arquivo);
				}
				// Atualiza o caminho do arquivo no registro da tabela pai
				$this->db->query("
					update ".$this->db->escape_str($input['parentTable'])." set ".$this->db->escape_str($input['fieldDir'])." = '".$fileData->getCaminho_arquivo()."' where " . $this->db->escape_str($input['parentPK']) . " = " . (int) $input['id']
				);
				// Deleta arquivo antigo
				$this->db->query("
					delete from uploaded_single_files where id_registro = " . (int) $input['id']
				);
			}

			$savedFile = ${"dao"}::inserir($fileData);
			$response = ['success' => true, 'savedFile' => $savedFile];
		} else {
			$response = ['success' => false, 'error' => "Falha no upload. " . $uploadResponse];
		}

		header('Content-Type: application/json');
		echo json_encode($response);
	}

	public function deleteFile() {
		return \System\Upload::deleteFile($this->input->post());
	}

	public function singleFile() {
		$get = $this->input->get();

		$file = \DAOs\Uploaded_single_files::buscar(
			['wheres' => [
				['field' => 'tabela =', 'value' => '"'.$get['table'].'"'],
				['field' => 'id_registro =', 'value' => $get['filterID']]
			]]
		);

		header('Content-Type: application/json');

		if(count($file)) {
			$file = current($file);
			$fieldDir = $get['fieldDir'];
			if(isset($file->${"fieldDir"}))
				$file->thumbnailUrl = $file->${"fieldDir"};
			else
				$file->thumbnailUrl = 'uploads/' . $file->uuid;

			echo json_encode([$file]);
		} else {
			echo json_encode([]);
		}
	}

	public function saveData() {
		$data = $this->input->post();
		$dao = '\\DAOs\\' . strtoupper($data['table']);
		$model = '\\Models\\' . strtoupper($data['table']);

		if(isset($data['id'])) {
			// Salvando edição
			$dao::update($data['id'], $data['data']);
			$return = ['updated' => true];
		} else {
			// Salvando novo
			if(isset($data['fk'])) {
				$data['data'][$data['fk']] = $data['filterID'];
			}
			$return = $dao::inserir($data['data']);
		}

		header('Content-Type: application/json');
		echo json_encode($return);
	}

	public function removeData() {
		$dataInfo = $this->input->post();
		$dao = '\\DAOs\\' . $dataInfo['table'];

		foreach ($dataInfo['ids'] as $id) {
			$dao::deletar($id);
		}

		header('Content-Type: application/json');
		echo json_encode(['finished' => true]);
	}

	public function addOrder() {
		$data = $this->input->post();
		$dao = '\\DAOs\\' . strtoupper($data['table']);
		$model = '\\Models\\' . strtoupper($data['table']);

		$oldData = $dao::buscarPorID($data['id']);
		$data['data']['ordem'] = $oldData->ordem + 1;
		$return = $dao::update($data['id'], $data['data']);

		header('Content-Type: application/json');
		echo json_encode($return);
	}

	public function subOrder() {
		$data = $this->input->post();
		$dao = '\\DAOs\\' . strtoupper($data['table']);
		$model = '\\Models\\' . strtoupper($data['table']);

		$oldData = $dao::buscarPorID($data['id']);
		$data['data']['ordem'] = $oldData->ordem - 1;
		$return = $dao::update($data['id'], $data['data']);

		header('Content-Type: application/json');
		echo json_encode($return);
	}

	public function setOrder() {
		$data = $this->input->post();
		$dao = '\\DAOs\\' . strtoupper($data['table']);
		$model = '\\Models\\' . strtoupper($data['table']);

		$oldData = $dao::buscarPorID($data['id']);
		$data['data']['ordem'] = $data['ordem'];
		$return = $dao::update($data['id'], $data['data']);

		header('Content-Type: application/json');
		echo json_encode($return);
	}
}