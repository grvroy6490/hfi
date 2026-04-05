<?php

defined('BASEPATH') OR exit('No direct script access allowed');
/* 
 * Author       : Vivek T
 * Purpose      : Controller for Checkout
 * Created On   : 2026-03-28
 */

class Checkout extends MY_Controller {
	function __construct() {
        parent::__construct();
        // $this->load->model('home_model');
    }
	
	public function index()
	{
		// $data = array();
		// $data['title'] = 'Checkout';	
		// $data['description'] = '';

		// $data['og_title'] = 'Checkout';	
		// $data['og_description'] = '';

		// $this->render($data, 'pages/checkout');

        redirect('checkout/program-details');
	}

    public function program_details() {
        $data = array();
        $data['title'] = 'Program Details';	
        $data['description'] = '';

        $data['og_title'] = 'Program Details';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/checkout/program-details');
    }

    public function account_details() {
        $data = array();
        $data['title'] = 'Account Details';	
        $data['description'] = '';

        $data['og_title'] = 'Account Details';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/checkout/account-details');
    }

    public function payment_details() {
        $data = array();
        $data['title'] = 'Payment Details';	
        $data['description'] = '';

        $data['og_title'] = 'Payment Details';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/checkout/payment-details');
    }

    public function confirmation() {
        $data = array();
        $data['title'] = 'Confirmation';	
        $data['description'] = '';

        $data['og_title'] = 'Confirmation';	
        $data['og_description'] = '';
        
        $this->render($data, 'pages/checkout/confirmation');
    }

}
