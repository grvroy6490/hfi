<?php

defined('BASEPATH') OR exit('No direct script access allowed');
/* 
 * Author       : Vivek T
 * Purpose      : Controller for Certification
 * Created On   : 2026-03-19
 */

class Certification extends MY_Controller {
	function __construct() {
        parent::__construct();
        // $this->load->model('home_model');
    }
	
	public function index()
	{
		$data = array();
		$data['title'] = 'Certification';	
		$data['description'] = '';

		$data['og_title'] = 'Certification';	
		$data['og_description'] = '';

		$this->render($data, 'pages/certification');
	}

    public function cua() {
        $data = array();
        $data['title'] = 'CUA';	
        $data['description'] = '';

        $data['og_title'] = 'CUA';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/certifications/cua');
    }

    public function cdpa() {
        $data = array();
        $data['title'] = 'CDPA';	
        $data['description'] = '';

        $data['og_title'] = 'CDPA';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/certifications/cdpa');
    }

    public function cxa() {
        $data = array();
        $data['title'] = 'CXA';	
        $data['description'] = '';

        $data['og_title'] = 'CXA';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/certifications/cxa');
    }

    public function science_of_experience_design() {
        $data = array();
        $data['title'] = 'Science of Experience Design';	
        $data['description'] = '';

        $data['og_title'] = 'Science of Experience Design';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/certifications/science-of-experience-design');
    }

}
