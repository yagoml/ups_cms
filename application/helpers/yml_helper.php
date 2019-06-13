<?php

/**
 * Verifica se um e-mail é válido
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function checkEmail($email) {
    return preg_match("/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/", $email);
//    return preg_match("/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/", $email) && checkdnsrr(explode('@', $email)[1], 'MX');
}

/**
 * Verifica se um telefone é válido
 * Formato1: (xx) xxxx-xxxx
 * Formato2: (xx) xxxxx-xxxx
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function checkPhone($phone) {
    return preg_match('^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$^', $phone);
}

/**
 * Verifica se uma data brasileira é válida.
 * Data: dd/mm/yyyy
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function checkBrData($data) {
    return preg_match('^(0[1-9]|1[0-9]|2[0-9]|3[01])/(0[1-9]|1[012])/[0-9]{4}$^', $data);
}

/**
 * Verifica se uma hora é válida.
 * Formato: 13:00
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function checkTime($time) {
    return preg_match('^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])$^', $time);
}

/**
 * Verifica se o formato de um CPF é válido
 * @return boolean
 * @param string $cpf
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function checkCpf($cpf) {
    return preg_match('^[0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2}$^', $cpf);
}

/**
 * Verifica se o formato de um CNPJ é válido
 * @return boolean
 * @param string $cnpj
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function checkCnpj($cnpj) {
    return preg_match('^[0-9]{2}.[0-9]{3}.[0-9]{3}/[0-9]{4}-[0-9]{2}$^', $cnpj);
}

/**
 * Caracteres Alpha com espaços e acentos.
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function alpha_whitespace($str) {
    return preg_match("/^([a-zà-ú\s])+$/i", $str);
}

/**
 * Caracteres Nome Composto + acentos.
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function nomeComposto($str) {
    return preg_match("/^[a-zà-úA-ZÀ-Ú]{3,50}(\s[a-zà-úA-ZÀ-Ú]{2,50})+$/i", $str);
}

/**
 * Caracteres AlphaNuméricos com espaços e acentos.
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function alpha_numeric_whitespace($str) {
    return preg_match("/^([a-zà-ú0-9\s])+$/i", $str);
}

/**
 * Caracteres AlphaNuméricos e acentos.
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function alpha_numeric($str) {
    return preg_match("/^([a-zà-ú0-9_])+$/i", $str);
}

/**
 * Valida preço em R$
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function validaReal($str) {
    return preg_match("/^[0-9]{0,3}([.]([0-9]{3}))*[,]([.]{0})[0-9]{0,2}$/", $str);
}

/**
 * Valida se é inteiro
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function isNumber($num) {
    return preg_match("/^[0-9]{1,11}$/", $num);
}

/**
 * Valida se é inteiro
 * @return boolean
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function uploadImg($fieldName, $destino) {
// verifica se foi enviado um arquivo
    if (isset($_FILES[$fieldName]['name']) && $_FILES[$fieldName]['error'] == 0) {
//        echo 'Você enviou o arquivo: <strong>' . $_FILES[$fieldName]['name'] . '</strong><br />';
//        echo 'Este arquivo é do tipo: <strong > ' . $_FILES[$fieldName]['type'] . ' </strong ><br />';
//        echo 'Temporáriamente foi salvo em: <strong>' . $_FILES[$fieldName]['tmp_name'] . '</strong><br />';
//        echo 'Seu tamanho é: <strong>' . $_FILES[$fieldName]['size'] . '</strong> Bytes<br /><br />';

        $arquivo_tmp = $_FILES[$fieldName]['tmp_name'];
        $nome = $_FILES[$fieldName]['name'];

// Pega a extensão
        $extensao = pathinfo($nome, PATHINFO_EXTENSION);
// Converte a extensão para minúsculo
        $extensao = strtolower($extensao);

// Somente imagens, .jpg;.jpeg;.gif;.png
// Aqui eu enfileiro as extensões permitidas e separo por ';'
// Isso serve apenas para eu poder pesquisar dentro desta String
        if (strstr('.jpg;.jpeg;.gif;.png', $extensao)) {
// Cria um nome único para esta imagem
// Evita que duplique as imagens no servidor.
// Evita nomes com acentos, espaços e caracteres não alfanuméricos
            $novoNome = uniqid(time()) . '.' . $extensao;

// Concatena a pasta com o nome
            $destino = $destino . '/' . $novoNome;

// tenta mover o arquivo para o destino
            if (@move_uploaded_file($arquivo_tmp, $destino)) {
                return ['moved' => TRUE, 'url' => $destino, 'msg' => 'Arquivo salvo com sucesso em : <b>' . $destino . '</b>'];
            } else {
                return ['moved' => FALSE, 'msg' => 'Erro ao salvar o arquivo. Aparentemente você não tem permissão de escrita.'];
            }
        } else {
            return ['moved' => FALSE, 'msg' => 'Você poderá enviar apenas arquivos "*.jpg;*.jpeg;*.gif;*.png"'];
        }
    } else {
        return ['moved' => FALSE, 'msg' => 'Você não enviou nenhum arquivo ou o arquivo enviado não é suportado!'];
    }
}

function moveUploadedImg($nome, $destino) {
// Concatena a pasta com o nome
    $destino = $destino . '/' . $nome;

    $tempName = '';

// tenta mover o arquivo para o destino
    if (@move_uploaded_file($nome, $destino)) {
        return ['moved' => TRUE, 'url' => $destino, 'msg' => 'Arquivo salvo com sucesso em : <b>' . $destino . '</b>'];
    } else {
        return ['moved' => FALSE, 'msg' => 'Erro ao salvar o arquivo. Aparentemente você não tem permissão de escrita.'];
    }
}

/**
 * Monta paginação com resultado de busca (where) com itens e links
 * @param string $repository = Repósitorio a ser paginado
 * @param array $where = Cláusula where da busca
 * @param int $per_page = Itens por páginas
 * @param string $uri = Caminho 1ª página
 * @return array com itens buscados e links de paginação
 * @author Yago M. Laignier <yagoskor@gmail.com>
 */
function ci_pag_filtered($repository, $where, $per_page, $uri) {
    $totalRows = $repository::buscar($where, array(), array(), array(), true);
    $config['page_query_string'] = TRUE;
    $config['base_url'] = site_url($uri);
    $config['total_rows'] = $totalRows;
    $config['per_page'] = $per_page;
    $config['first_link'] = '1';
    $config['last_link'] = $totalRows / $per_page;
    $config['next_link'] = '>';
    $config['prev_link'] = '<';
    $limit = array('inicio' => isset($_GET['per_page']) ? $_GET['per_page'] : 0, 'fim' => $per_page);
    $pagination['itens'] = $repository::buscar($where, array(), array('field' => 'ordem', 'value' => 'desc'), $limit);
    $ci = & get_instance();
    $ci->load->library('pagination');
    $ci->pagination->initialize($config);
    $pagination['links'] = $ci->pagination->create_links();
    return $pagination;
}

function userStatusOnline() {
    $ci = & get_instance();
    $sessao = session_id();
    $ip = $_SERVER['REMOTE_ADDR'];
    $tempo_on = date('Y-m-d H:i:s');
    $userId = isset($ci->session->userdata['id']) ? $ci->session->userdata['id'] : 0;
    if ($userId) {
        $total = $ci->db->query("SELECT id_usuario FROM usuarios_online WHERE id_usuario='$userId'")->num_rows();
        if ($total) {
            $ci->db->query("UPDATE usuarios_online SET tempo='$tempo_on' WHERE id_usuario='$userId'");
        } else {
            $ci->db->query("INSERT INTO usuarios_online(id_usuario,sessao,tempo,ip)VALUES('$userId','$sessao','$tempo_on','$ip')");
        }
    }
}

function guestStatusOnline() {
    $ci = & get_instance();
    $sessao = session_id();
    $ip = $_SERVER['REMOTE_ADDR'];
    $tempo_on = date('Y-m-d H:i:s');
    $userId = isset($ci->session->userdata['id']) ? $ci->session->userdata['id'] : 0;
    if (!$userId) {
        $total = $ci->db->query("SELECT id FROM visitantes WHERE sessao='$sessao'")->num_rows();

        if ($total) {
            $ci->db->query("UPDATE visitantes SET tempo='$tempo_on' WHERE sessao='$sessao'");
        } else {
            $ci->db->query("INSERT INTO visitantes(sessao,ip,tempo)VALUES('$sessao','$ip','$tempo_on')");
        }
    }
}
