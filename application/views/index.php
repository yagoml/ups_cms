<html lang="pt-br">
	<head>
		<title>YML CMS</title>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">         
		<meta name="description" content="">
		<meta name="keywords" content="">
		<meta name="author" content="Yago ML <yagoskor@gmail.com>">

		<meta property="og:locale" content="pt_BR">
		<meta property="og:url" content="<?php echo base_url() ?>">
		<meta property="og:title" content="">
		<meta property="og:site_name" content="">
		<meta property="og:description" content="">
		<meta property="og:image" content="">
		<meta property="og:image:type" content="image/jpeg">
		<meta property="og:image:width" content="800">
		<meta property="og:image:height" content="600">

		<link rel="shortcut icon" href="<?php echo base_url('lib/images/icon.png') ?>" type="image/gif">

		<!-- Moment está sendo importando aqui pq o require n consegue importa-lo -->
		<script type="text/javascript" src="<?php echo base_url('lib/moment/moment.js') ?>"></script>
		<script type="text/javascript">window.baseUrl = '<?php echo base_url() ?>'</script>
	</head>

	<body>
		<?php $this->load->view('main/header_view') ?>
		<?php $this->load->view((isset($pagina) ? $pagina : 'main/middle_view')) ?>
		<?php $this->load->view('main/footer_view') ?>
	</body>
</html>