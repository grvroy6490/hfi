<?php

defined('BASEPATH') OR exit('No direct script access allowed');
/* 
 * Author       : Vivek T
 * Purpose      : Controller for Courses
 * Created On   : 2026-03-19
 */

class Courses extends MY_Controller {
	function __construct() {
        parent::__construct();
        // $this->load->model('home_model');
    }
	
	public function index()
	{
		$data = array();
		$data['title'] = 'Courses';	
		$data['description'] = '';

		$data['og_title'] = 'Courses';	
		$data['og_description'] = '';

		$this->render($data, 'pages/courses');
	}

    public function all_courses() {
        $data = array();
        $data['title'] = 'All Courses';	
        $data['description'] = '';

        $data['og_title'] = 'All Courses';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/all-courses');
    }

    public function calendar() {
        $data = array();
        $data['title'] = 'Course Calendar';	
        $data['description'] = '';

        $data['og_title'] = 'Course Calendar';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/courses/calendar');
    }

}
