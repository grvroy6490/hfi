<?php

class MY_Controller extends CI_Controller {
    public $user_data;
    public $controller; 
    public function __construct() {
        // To Check session already started or not
        // if (session_status() === PHP_SESSION_NONE) {
        //     session_start();
        // }
        parent::__construct();
        
        $segments = $this->uri->segments;
        $this->controller = (isset($segments) && !empty($segments)) ? strtolower( $segments[1] ) : '';
        
        // $this->user_data = get_user_data();
        // $log_type = !empty( $this->user_data['log_type'] ) ? $this->user_data['log_type'] : $segments[3];
        
        define('IS_LOGGED', !empty($this->user_data) ? TRUE : FALSE );
        if( !defined('BASE_URL') ) define( 'BASE_URL', base_url() );
                
        /* Data initialization for render function */
        $this->data = array();
        if (!empty($_SESSION['success'])) {
            $this->data['success'] = $_SESSION['success'];
            unset($_SESSION['success']);
        }
        else if (!empty($_SESSION['error'])) {
            $this->data['error'] = $_SESSION['error'];
            unset($_SESSION['error']);
        }

        $actions = $this->actions();
        $this->data['list_link']    = $actions['index'];
        $this->data['add_link']     = $actions['add'] . '/';
        $this->data['edit_link']    = $actions['edit'] . '/';
        $this->data['view_link']    = $actions['view'] . '/';
        $this->data['delete_link']  = $actions['delete'] . '/';
        $this->data['add_action']   = $actions['insert'] . '/';
        $this->data['edit_action']  = $actions['update'] . '/';

        $this->config->set_item('css_url', base_url() . 'assets/css/');
        $this->config->set_item('js_url', base_url() . 'assets/js/');
        $this->config->set_item('images_url', base_url() . 'assets/imag/');
        $this->config->set_item('upload_url', base_url() . UPLOADS);
        
    }
    
    public function render($data, $view_file = '') {
        $this->user_data = get_user_data();
        $header = $footer = array();
        $header = get_header_data();
        #$header['permission'] = $this->permission;
        $header['controller'] = $this->controller;
        $header['view_file'] = (!empty($view_file)) ? $view_file : 'home';
        // $data['user_data'] = $header['user_data'] = $footer['user_data'] = $this->user_data;
        
        // To set custom header datas from controllers
        if (!empty($data['header'])) {
            foreach($data['header'] as $key => $value) {
                $header[$key] = $value;
            }
        }
        if(isset($data['title'])) : 
            $header['title'] = $data['title'];
        endif;
		if(isset($data['description'])) : 
            $header['description'] = $data['description'];
        endif;
        if(isset($data['og_title'])) : 
            $header['og_title'] = $data['og_title'];
        endif;
		if(isset($data['og_description'])) : 
            $header['og_description'] = $data['og_description'];
        endif;
        // $head = array();
        // $header['log_type'] = $footer['log_type'] = $data['log_type'];
        // $header['title'] = $header['title'];
        
        // Load Views
        $this->load->view('templates/header', $header);
        // $args = array_merge($header, $data, $footer);
        // $this->load->view('templates/common', $args);
        $this->load->view($view_file, $data);
        $this->load->view('templates/footer', $footer);
        
    }
    
    protected function actions($controller = '') {
        $action = array();
        $controller = (empty($controller)) ? $this->router->fetch_class() : $controller;
        $action['index']  = base_url() . $controller . '/index';
        $action['view']   = base_url() . $controller . '/view';
        $action['add']    = base_url() . $controller . '/add';
        $action['insert'] = base_url() . $controller . '/insert';
        $action['edit']   = base_url() . $controller . '/edit';
        $action['update'] = base_url() . $controller . '/update';
        $action['delete'] = base_url() . $controller . '/delete';
        $action['controller'] = $controller;
        
        return $action;
    }

    protected function auto_generation_code($id, $prefix='') {  
        $code = $prefix;
        return ($id > 999) ? $id : sprintf('%03d', $id);
    }
    
    protected function ajax_response($data) {
        echo json_encode($data, JSON_UNESCAPED_SLASHES);
        exit(0);
    }
}
?>