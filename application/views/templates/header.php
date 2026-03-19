<!DOCTYPE html>
<html lang="en">
<?php 
$controller = (isset($this->uri->segments[1]) && !empty($this->uri->segments[1])) ? $this->uri->segments[1] : ''; 
$method =  (isset($this->uri->segments[2]) && $this->uri->segments[2]) ? $this->uri->segments[2] : '';
if(!empty($method)) {
	$canonical_url = base_url().$controller.'/'.$method;
} else {
	$canonical_url = base_url().$controller;
}
//Set Country Name based on IP
//get_country_name();
?>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description"
        content="HFI Institute builds on the global legacy of Human Factors International. We develop Experience Architects through globally recognized certifications, structured mentorship, and leadership development, while partnering with organizations to scale human-centered capability. We architect leaders for the Experience Economy.">
    <meta name="keywords"
        content="HFI Institute, Human Factors International, Experience Architects, Certifications, Mentorship, Leadership Development, Enterprise Capability, Experience Economy">
    <link rel="icon" href="<?php echo base_url(); ?>assets/images/favicon.svg" type="image/x-icon">
    <title>HFI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Sans+Tamil:wght@100..900&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="<?php echo base_url(); ?>assets/vendor/bootstrap.css">
    <link rel="stylesheet" href="<?php echo base_url(); ?>assets/vendor/swiper.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css">
    <link rel="stylesheet" href="<?php echo base_url(); ?>assets/css/main.css">
</head>
<script> 
    //var base_STRAPI_END_POINT =  '<?php //echo STRAPI_END_POINT; ?>';
	//var base_IMG_URL = '<?php //echo IMG_URL; ?>';
	var base_url    = baseURL = '<?php echo base_url();?>';
	var controller  = '<?php echo (isset($this->uri->segments[1]) && !empty($this->uri->segments[1])) ? $this->uri->segments[1] : ''; ?>'; 
	var method      = '<?php echo (isset($this->uri->segments[2]) && $this->uri->segments[2]) ? $this->uri->segments[2] : ''; ?>';
</script>

<!-- Body Section -->
<body>

<!-- Google Tag Manager (noscript) -->

<!-- End Google Tag Manager (noscript) -->

<?php 	
	$path = $_SERVER['REQUEST_URI'];
	$path = $_SERVER['PHP_SELF'];  
 ?>
<!-- Header Section -->
<?php $this->load->view('templates/menu'); ?>

<!-- Body Start -->
<body>