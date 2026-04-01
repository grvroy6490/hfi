<?php

defined('BASEPATH') OR exit('No direct script access allowed');
/* 
 * Author       : Vivek T
 * Purpose      : Controller for Home
 * Created On   : 2026-02-04
 */

class Home extends MY_Controller {
	function __construct() {
        parent::__construct();
        // $this->load->model('home_model');
    }
	
	public function index()
	{
		$data = array();
		$data['title'] = 'Home';	
		$data['description'] = '';

		$data['og_title'] = 'Home';	
		$data['og_description'] = '';

		$this->render($data, 'pages/home');
	}

	function ajax() {
        $db_id =  $this->home_model->ajax();
        
        echo $db_id;
    }

}
