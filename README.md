## UPSide CMS
_______________________________________________________________________________________________________________
### PT-BR

* CMS que gera CRUDs dinamicamente para administração de dados de tabelas previamente configuradas.

* Versão 1.00

## Documentação Técnica

### Gerenciamento de nomes de campos de tabelas

* Para gerar DAOs e Models: /sistema/genModelDaos. Gera automaticamente para todas as tabelas do BD.
* Os nomes dos campos das tabelas gerenciáveis podem ser definidos na tabela _**campos_tabelas**_.
* O attributo dataType pode conter os valores:
	*text, number, file, date, datetime*
* Ainda não é utilizado, mas pode ser útil no futuro.

### Configuração CMS

* **Arquivo**: /application/config/ups_cms.php
* **$config['ups_config']**: Acesso global na app. às configurações do CMS.
* **accessibleTables**: Array de objetos onde são específicadas as tabelas que serão administráveis pelo CMS:
	* **table** [string]: Nome da tabela no banco de dados.
	* **name** [string] opcional: Nome desejado para tabela.
	* **unique** [boolean] opcional: Se a tabela é de registro único.

### Upload de arquivos

* Upload de arquivo único: Os dados do arquivo são salvos na tabela _**uploaded_single_file**_

* Tabelas de coleções de arquivos devem conter obrigatóriamente com os seguintes colunas:
	- **uuid** char(36): ID do arquivo
	- **name** varchar(255): Nome do arquivo

### Dados Relacionados

* Os dados de uma tabela ligada a outra, aparecem em um link à direita da edição do dado da tabela pai.

## Documentação Admin CMS

Rota: /cms/#admin

### Acesso aos Dados Administráveis

* No menu do ADMIN, clicar no combo **Dados**;
* O menu irá abrir com os links dos dados administráveis.
* Ao clicar sobre um link, será aberto o grid (tabela) com os 40 primeiros registros.

### GRID

O grid é a tabela com os dados.

#### Clique sobre item do grid

* Abre o formulário de edição do item clicado.

#### Seleção de Itens

* Ao lado esquerdo do grid, podem ser selecionados vários itens para exclusão.

#### Ordenação de itens no GRID

* Os itens no grid são ordenados por prioridade, decrescente.
* Para aumentar ou diminuir a prioridade, clicar nas setas pra cima ou pra baixo, os ícones do meio da coluna *Ações* da linha desejada.

#### Expansão de linha

* Para expandir uma linha clicar no primeiro ícone (seta pra baixo);
* Para retrair uma linha clicar no primeiro ícone (seta pra cima).

#### Exclusão de item

* Clicar no ícone da Lixeira (último ícone da coluna de ações) e confirmar a exclusão;
* Para excluir vários, selecionar os itens na tabela, e clicar no botão *Excluir*.

#### Scroll

* O scroll do grid de dados, ao chegar no final, solicita os próximos registros, que são adicionados ao grid.

#### Links de Arquivos

* Campos que representam arquivos, possuem links clicáveis no grid, que ao serem clicados, abrem o arquivo solicitado em nova aba caso sejam reconhecidos pelo navegador, ou fazem download caso não.

### Botões

#### Novo

* Abre um formulário para inserção de um novo dado.

#### Excluir

* Excluir 1 ou vários registros.

#### Voltar p/ grid

* Volta para o grid de dados.

#### Voltar Registro Pai

* Volta ao registro pai relacionado.

### Configurações

* No menu do Admin, Configurações;
* São as configurações do site.


_______________________________________________________________________________________________________________
### EN

* CMS that dynamically generates CRUDs for data management of previously configured tables.

* Version: 1.00

_______________________________________________________________________________________________________________
* Autor: YagoML <yagoskor@gmail.com>