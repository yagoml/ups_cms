CREATE TABLE IF NOT EXISTS `config_site` (
  `idconfig_site` int(11) NOT NULL DEFAULT 1,
  `nome_empresa` varchar(255) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `imagem` varchar(255) DEFAULT 'uploads/',
  `meta_descricao` varchar(255) DEFAULT NULL,
  `maps_pub_key` varchar(255) DEFAULT NULL,
  `maps_priv_key` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idconfig_site`),
  UNIQUE KEY `idconfig_site_UNIQUE` (`idconfig_site`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `config_site` (`idconfig_site`, `nome_empresa`, `titulo`, `autor`, `descricao`, `imagem`, `meta_descricao`, `maps_pub_key`, `maps_priv_key`) VALUES
	(1, 'UpSide Software', 'Título do Site', 'UpSide Software', 'Descrição do Site', 'uploads/', 'Meta Descrição do Site', 'Chave publica google maps', 'Chave privada google maps');

CREATE TABLE IF NOT EXISTS `campos_tabelas` (
  `idCamposTabela` int(11) NOT NULL AUTO_INCREMENT,
  `tabela` varchar(255) NOT NULL,
  `campo` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `dataType` varchar(255) NOT NULL,
  PRIMARY KEY (`idCamposTabela`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

INSERT INTO `campos_tabelas` (`idCamposTabela`, `tabela`, `campo`, `nome`, `dataType`) VALUES
	(1, 'config_site', 'nome_empresa', 'Nome Empresa', 'text'),
	(2, 'config_site', 'titulo', 'Título', 'text'),
	(3, 'config_site', 'autor', 'Autor', 'text'),
	(4, 'config_site', 'descricao', 'Descrição', 'text'),
	(5, 'config_site', 'imagem', 'Imagem', 'file'),
	(6, 'config_site', 'meta_descricao', 'Meta Descrição', 'text'),
	(7, 'config_site', 'maps_pub_key', 'Maps Public Key', 'text'),
	(8, 'config_site', 'maps_priv_key', 'Maps Private Key', 'text');

CREATE TABLE IF NOT EXISTS `uploaded_single_files` (
  `uuid` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `caminho_arquivo` varchar(255) NOT NULL DEFAULT 'uploads/',
  `insertionDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_registro` int(11) NOT NULL DEFAULT 0,
  `tabela` varchar(255) NOT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;