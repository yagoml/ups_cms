<?php

namespace System;

class Paginator {
	
	/**
	 * Monta filtro para busca limitada
	 * @param int $page Página atual
	 * @param int $perPage Itens por página
	 * @return array Filtro para limit na busca do DAO
	 */
	public static function filterPagination($page, $perPage) {
		$filters = [];
		$filters['limit']['start'] = $page * $perPage;
		$filters['limit']['qtd'] = $perPage;
		return $filters;
	}

	/**
	 * Monta paginação com itens e links
	 * @param string $dao DAOs/$dao
	 * @param string $function models/$model->$function 
	 * @param int $per_page Itens por páginas
	 * @param string $uri Caminho 1ª página
	 * @return array com itens buscados e links de paginação
	 * @author Yago M. Laignier <yagoskor@gmail.com>
	 */
	public static function ciPaginator($dao, $per_page, $uri) {
		$start = $start = $GLOBALS['CI']->uri->segment(3) ? $start = $GLOBALS['CI']->uri->segment(3) : 0;

		$totalRows = $dao::qtdRegistros();
		$config['base_url'] = base_url($uri);
		$config['total_rows'] = $totalRows;
		$config['per_page'] = $per_page;
		$config['first_link'] = '1';
		$config['last_link'] = $totalRows / $per_page;
		$config['next_link'] = '<i class="glyphicon glyphicon-chevron-right"></i>';
		$config['prev_link'] = '<i class="glyphicon glyphicon-chevron-left"></i>';

		$filtros['limit'] = array('start' => $start, 'end' => $per_page);
		$itens = $dao::buscar($filtros);

		$GLOBALS['CI']->pagination->initialize($config);
		$links = $GLOBALS['CI']->pagination->create_links();

		return array(
			'links' => $links,
			'itens' => $itens
		);
	}

	/**
	 * Monta paginação com itens e links
	 * @param string $dao dao/$dao 
	 * @param string $function models/$model->$function 
	 * @param int $per_page Itens por páginas
	 * @param string $uri Caminho 1ª página
	 * @return array com itens buscados e links de paginação
	 * @author Yago M. Laignier <yagoskor@gmail.com>
	 */
	public static function ciPaginatorFiltered($dao, $wheres, $per_page, $uri, $segment) {
		$start = $GLOBALS['CI']->uri->segment($segment) ? $GLOBALS['CI']->uri->segment($segment) : 0;

		$filtros['wheres'] = $wheres;
		$itens = $dao::buscar($filtros);
		$totalRows = count($itens);
		$config['base_url'] = base_url($uri);
		$config['total_rows'] = $totalRows;
		$config['per_page'] = $per_page;
		$config['first_link'] = '1';
		$config['last_link'] = $totalRows / $per_page;
		$config['next_link'] = '<i class="glyphicon glyphicon-chevron-right"></i>';
		$config['prev_link'] = '<i class="glyphicon glyphicon-chevron-left"></i>';

		$GLOBALS['CI']->pagination->initialize($config);
		$links = $GLOBALS['CI']->pagination->create_links();

		$filtros['limit'] = array('start' => $start, 'end' => $per_page);

		$pagination = array(
			'links' => $links,
			'itens' => $itens
		);
		return $pagination;
	}

	public static function ciPaginatorFilters($dao, $wheres, $per_page, $uri) {
		$start = $GLOBALS['CI']->input->get('per_page') ? $GLOBALS['CI']->input->get('per_page') : 0;

		$config['page_query_string'] = TRUE;
		$totalRows = count($dao::buscar($wheres));
		$config['base_url'] = base_url($uri);
		$config['total_rows'] = $totalRows;
		$config['per_page'] = $per_page;
		$config['first_link'] = '1';
		$config['last_link'] = ceil($totalRows / $per_page);
		$config['next_link'] = '<i class="glyphicon glyphicon-chevron-right"></i>';
		$config['prev_link'] = '<i class="glyphicon glyphicon-chevron-left"></i>';

		$GLOBALS['CI']->pagination->initialize($config);
		$links = $GLOBALS['CI']->pagination->create_links();

		$wheres['limit'] = ['start' => $start, 'end' => $per_page];

		$itens = $dao::buscar($wheres);

		$pagination = array(
			'links' => $links,
			'itens' => $itens
		);
		return $pagination;
	}

}
