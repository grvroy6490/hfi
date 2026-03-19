<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

#PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

//iTransact
use iTransact\iTransactSDK\CardPayload;
use iTransact\iTransactSDK\AddressPayload;
use iTransact\iTransactSDK\TransactionPayload;
use iTransact\iTransactSDK\iTTransaction;

//Razorpay
use Razorpay\Api\Api;

// require 'vendor/autoload.php';

function _get( $tbl_name, $where = array(), $args = array() ) {
    $ci = get_ci_instance();
    $where['status'] = !empty( $where['status'] ) ? $where['status'] : 1;
    
    if( !empty( $args['order_by'] ) ) :
        $ci->db->order_by( $args['order_by'] );
    endif;
    
    if( !empty( $args['select'] ) ) :
        $ci->db->select( $args['select'] );
    endif;
    
    if( $args['is_single'] ) :
        $args['limit'] = 1;
    endif;
    
    if( !empty( $args['limit'] ) ) :
        $ci->db->limit( $args['limit'] );
    endif;

    $q = $ci->db->get_where( $tbl_name, $where );
    //echo "Q: ". $ci->db->last_query(); die;
    
    if( $args['limit'] == 1 ) :
        return $q->row_array();
    else :
        return $q->result_array();
    endif;
}

function generate_rec_no($tbl_name = '', $wh = array(), $like = ''){
    $ci = get_ci_instance();
    
    $ci->db->select('COUNT(id) AS last_count');
	if($like){
		$ci->db->like('created_on', '2020', 'both');
	}
    $q = $ci->db->get_where( $tbl_name, $wh );
    $last_no = $q->row_array()['last_count'];
    // $receipt_no = (($last_no + 1)  > 9999) ? ($last_no + 1)  : sprintf('0%03d', ($last_no + 1) );
    $receipt_no = (($last_no)  > 9999) ? ($last_no)  : sprintf('0%03d', ($last_no) );
    return $receipt_no;
}

function set_user_data($user_data) {
    $ci = get_ci_instance();
    // $q = $ci->db->get_where( TBL_SETTINGS_DESIGN );
    // $desgn_settings = $q->row_array();
    
    // $gen_settings = get_general_setting();
    // $alt_server   = get_alt_server();  
    
    // $userdata = array(
    //     'learner_id' => $user_data['learner_id'],
    //     'order_id' => $user_data['order_id'],
    //     'schedule_id' => $user_data['schedule_id'],
    //     'country_code' => $user_data['country_code'],
    //     'country_name' => $user_data['country_name'],
    //     'currency_type' => $user_data['currency_type'],
    //     'currency_code' => $user_data['currency_code'],
    //     'time_zone' => $user_data['time_zone'],
    //     'amount' => $user_data['amount']
    // );
    
    if (!empty($ci->input->post('time_zone_offset'))) {
        $userdata['time_zone_offset'] = $ci->input->post('time_zone_offset');
    }
    $ci->session->set_userdata(TBL_PREFIX . 'user_logged_in', $user_data);
}

function get_user_data() {
    $ci = get_ci_instance();
    return $ci->session->userdata(TBL_PREFIX . 'user_logged_in');
}

function get_bill_list_url() {
    $uri = $_SERVER['REQUEST_URI'];
    $ci = get_ci_instance();
    $segs = $ci->uri->segments;
    $service_id = empty( stripos( $uri, '/add/') ) ? $segs[4] : $segs[3];
    return preg_replace('/\/(add|edit|view)\/(.*)/', '/index/'.$service_id, $uri);
}

function get_ci_instance() {
    $ci = &get_instance();
    return $ci;
}

function unserialize_str($string) {
    return (!empty(unserialize($string))) ? unserialize($string) : array();
}

function get_page_title() {
    $ci = get_ci_instance();
    $action = $ci->router->fetch_method();
    $page_title = ucfirst($ci->router->fetch_class());
    switch($action) {
        case 'view':
            $page_title .= ' ' . ucfirst($action);
            break;
        
        case 'add':
            $page_title .= ' ' . ucfirst($action);
            break;
        
        case 'edit':
            $page_title .= ' ' . ucfirst($action);
            break;
        
        default:
            break;
    }
    
    return $page_title;
}

function css_url() {
    $ci = get_ci_instance();
    return $ci->config->item('css_url');
}

function js_url() {
    $ci = get_ci_instance();
    return $ci->config->item('js_url');
}

function images_url($image_name = '', $folder_path = '') {
    $ci = get_ci_instance();
    $images_url = $ci->config->item('images_url');
    if (!empty($image_name)) {
        $file_path = (empty($folder_path)) ? FCPATH . IMG_FOLDER_PATH . $image_name : $folder_path . $image_name;
        if (file_exists($file_path)) {
            $images_url .= $image_name;
        }
        else {
            $images_url .= NO_IMG;
        }
    }
    
    return $images_url;
}

function get_header_data() {
    $ci = get_ci_instance();
    $data = array();
    $data['page_title'] = get_page_title();
    $data['current_controller'] = $ci->router->fetch_class();
    $data['current_method'] = $ci->router->fetch_method();
    #print_r($data);
    return $data;
}

function current_date() {
    return date('d-m-Y');
}

function text($text = '', $empty = 'N/A') {
    return (!empty($text)) ? trim($text) : $empty;
}

function text_date($date = '', $empty = 'N/A') {
    return (!empty($date)) ? date('d-m-Y', strtotime($date)) : $empty;
}

function text_amount($amt = 0, $empty = '0.00') {
    return (!empty($amt)) ? number_format($amt, 2, '.', '') : $empty;
}

function text_limit($text, $link = '', $limit = 50) {
    if (empty($text)) 
        $text = 'N/A';
    else if(strlen($text) > $limit){
        $link = ($link != '') ? $link: '#';
        $text = substr($text, 0, $limit) . "..&nbsp;<a href='$link' title='Read More' style='color: #428bca;'>Read More</a>";
    }
    
    return trim($text);
}

function get_url_key($url_key) {
    $url_key = strtolower(trim(trim($url_key, '-')));
    
    $patterns = array();
    $patterns[0] = '/( (\(|\/|\[|\{|&|\*)?)/';
    $patterns[1] = '/[()\'"\[\]{},*&]|[^a-z0-9\-]/';
    $patterns[2] = '/-+/';
    $replacements = array();
    $replacements[2] = '-';
    $replacements[1] = '';
    $replacements[0] = '-';
    $url_key = preg_replace($patterns, $replacements, $url_key);
    return $url_key;
}

function download_file($file_path = '') {
    if (!empty($file_path)) {
        $file_path_parts = explode('/', $file_path);
        $file_name = array_pop($file_path_parts);
        $file_name = urldecode($file_name);
        
        array_push($file_path_parts, $file_name);
        $file_path = implode('/', $file_path_parts);
        
        ob_clean();
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $file_name . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file_path));
        readfile($file_path);
    }
}

function image_extensions() {   
    return array('jpeg', 'png', 'jpg', 'gif', 'ico');
}

function recursive_conversion($num, $tri) {
    $ones = array('', ' One', ' Two', ' Three', ' Four', ' Five', ' Six', ' Seven', ' Eight', ' Nine', ' Ten', ' Eleven', ' Twelve', ' Thirteen', ' Fourteen', ' Fifteen', ' Sixteen', ' Seventeen', ' Eighteen', ' Nineteen');
    $tens = array('', '', ' Twenty', ' Thirty', ' Forty', ' Fifty', ' Sixty', ' Seventy', ' Eighty', ' Ninety');
    $triplets = array('', ' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion', ' Sextillion', ' Septillion', ' Octillion', ' Nonillion');
    
    // chunk the number, ...rxyy
    $r = (int) ($num / 1000);
    $x = ($num / 100) % 10;
    $y = $num % 100;
    
    // init the output string 
    $str = '';
    
    // do hundreds 
    if ($x > 0) 
        $str = $ones[$x] . ' Hundred ';   
    
    // do ones and tens 
    if ($y < 20) 
        $str .= $ones[$y];
    else
        $str .= $tens[(int) ($y / 10)] . $ones[$y % 10];
    
    
    // add triplet modifier only if there // is some output to be modified... 
    if ($str != '')
        $str .= $triplets[$tri];
    
    // continue recursing?
    if ($r > 0)
        return recursive_conversion($r, $tri + 1) . $str;
    else
        return $str;
}
    
// returns the number as an anglicized string
function convert_amount_to_word($num) {
    $num = (float) $num;
    if ($num == 0)
        return 'zero';
    
    $amounts = explode('.', $num);
    $amount_in_words = recursive_conversion($amounts[0], 0);
    $amount_in_words .= ' Dollars';
    if (!empty($amounts[1])) {
        $amount_in_words .= ' and';
        $amount_in_words .= recursive_conversion($amounts[1], 0);
        $amount_in_words .= ' Cents';
    }
    
    return $amount_in_words . ' Only';
}

function convert_amount_to_word_rupees($num) {
    $num = (float) $num;
    if ($num == 0)
        return 'zero';
    
    $amounts = explode('.', $num);
    $amount_in_words = recursive_conversion($amounts[0], 0);
    $amount_in_words .= ' Rupees';
    if (!empty($amounts[1])) {
        $amount_in_words .= ' and';
        $amount_in_words .= recursive_conversion($amounts[1], 0);
        $amount_in_words .= ' Paise';
    }
    
    return $amount_in_words . ' Only';
}

function breadcrumb_links() {
    $breadcrumb_items = array();
    $url_items = array();
    $url_items = array_filter(explode('/', str_replace(base_url(), '', current_url())));
    $link = '';
    foreach($url_items as $key => $value) {
        if ((is_numeric($value)) || ($value == 'index') || ($value == 'home'))
            continue;
        
        $link .= $value;
        $value_arr = preg_split("/[_,\- ]+/", $value);//explode('_', $value);
        
        $value_arr = array_map(function($word) {
                return ucfirst($word);
            },
            $value_arr
        );
        
        $value = implode(' ', $value_arr);
        $menu = array(
            'menu_name' => $value,
            'link' => base_url() . $link
        );
        
        array_push($breadcrumb_items, $menu);
 
        $link .= '/';
    }
    $training_link = base_url().'training';
    $breadcrumb_hmtl = '<ol class="breadcrumb fs15 clrlightgrey">';
    $breadcrumb_hmtl .= '<li class="breadcrumb-item"><i class="fa fa-home"></i> Home</li>';
    $total_link = count($breadcrumb_items);
    foreach($breadcrumb_items as $key => $value) {
        $con_name = $value['menu_name'];             
        if ($key != ($total_link - 1) && ($key == 0 || $key == 1) && ($con_name == 'Training' || $con_name == 'Consulting')) {
            $breadcrumb_hmtl .= '<li class="breadcrumb-item">' . $con_name . '</li>';
        } else if($key == 0 && $con_name == 'Payment') {
            $breadcrumb_hmtl .= '<li class="breadcrumb-item">Training</li>';
        } else if( $key == 1 && $con_name == 'Thankyou') {
            $breadcrumb_hmtl .= '<li class="breadcrumb-item">' . $con_name . '</li>';
        }
        else {
            $breadcrumb_hmtl .= '<li class="breadcrumb-item active">' . $con_name . '</li>';
        }
    }
    $breadcrumb_hmtl .= '</ol>';
    
    return $breadcrumb_hmtl;
}

function country_list() {
    $countries = array(
    'AF' => 'Afghanistan',
    'AX' => 'Aland Islands',
    'AL' => 'Albania',
    'DZ' => 'Algeria',
    "AS" => "American Samoa",
    "AD" => "Andorra",
    "AO" => "Angola",
    "AI" => "Anguilla",
    "AQ" => "Antarctica",
    "AG" => "Antigua and Barbuda",
    "AR" => "Argentina",
    "AM" => "Armenia",
    "AW" => "Aruba",
    "AU" => "Australia",
    "AT" => "Austria",
    "AZ" => "Azerbaijan",
    "BS" => "Bahamas",
    "BH" => "Bahrain",
    "BD" => "Bangladesh",
    "BB" => "Barbados",
    "BY" => "Belarus",
    "BE" => "Belgium",
    "BZ" => "Belize",
    "BJ" => "Benin",
    "BM" => "Bermuda",
    "BT" => "Bhutan",
    "BO" => "Bolivia",
    "BA" => "Bosnia and Herzegovina",
    "BW" => "Botswana",
    "BV" => "Bouvet Island",
    "BR" => "Brazil",
    "IO" => "British Indian Ocean Territory",
    "BN" => "Brunei Darussalam",
    "BG" => "Bulgaria",
    "BF" => "Burkina Faso",
    "BI" => "Burundi",
    "KH" => "Cambodia",
    "CM" => "Cameroon",
    "CA" => "Canada",
    "CV" => "Cape Verde",
    "KY" => "Cayman Islands",
    "CF" => "Central African Republic",
    "TD" => "Chad",
    "CL" => "Chile",
    "CN" => "China",
    "CX" => "Christmas Island",
    "CC" => "Cocos (Keeling) Islands",
    "CO" => "Colombia",
    "KM" => "Comoros",
    "CG" => "Congo",
    "CD" => "Congo, The Democratic Republic of The",
    "CK" => "Cook Islands",
    "CR" => "Costa Rica",
    "CI" => "Cote D'ivoire",
    "HR" => "Croatia",
    "CU" => "Cuba",
    "CY" => "Cyprus",
    "CZ" => "Czech Republic",
    "DK" => "Denmark",
    "DJ" => "Djibouti",
    "DM" => "Dominica",
    "DO" => "Dominican Republic",
    "EC" => "Ecuador",
    "EG" => "Egypt",
    "SV" => "El Salvador",
    "GQ" => "Equatorial Guinea",
    "ER" => "Eritrea",
    "EE" => "Estonia",
    "ET" => "Ethiopia",
    "FK" => "Falkland Islands (Malvinas)",
    "FO" => "Faroe Islands",
    "FJ" => "Fiji",
    "FI" => "Finland",
    "FR" => "France",
    "GF" => "French Guiana",
    "PF" => "French Polynesia",
    "TF" => "French Southern Territories",
    "GA" => "Gabon",
    "GM" => "Gambia",
    "GE" => "Georgia",
    "DE" => "Germany",
    "GH" => "Ghana",
    "GI" => "Gibraltar",
    "GR" => "Greece",
    "GL" => "Greenland",
    "GD" => "Grenada",
    "GP" => "Guadeloupe",
    "GU" => "Guam",
    "GT" => "Guatemala",
    "GG" => "Guernsey",
    "GN" => "Guinea",
    "GW" => "Guinea-bissau",
    "GY" => "Guyana",
    "HT" => "Haiti",
    "HM" => "Heard Island and Mcdonald Islands",
    "VA" => "Holy See (Vatican City State)",
    "HN" => "Honduras",
    "HK" => "Hong Kong",
    "HU" => "Hungary",
    "IS" => "Iceland",
    "IN" => "India",
    "ID" => "Indonesia",
    "IR" => "Iran, Islamic Republic of",
    "IQ" => "Iraq",
    "IE" => "Ireland",
    "IM" => "Isle of Man",
    "IL" => "Israel",
    "IT" => "Italy",
    "JM" => "Jamaica",
    "JP" => "Japan",
    "JE" => "Jersey",
    "JO" => "Jordan",
    "KZ" => "Kazakhstan",
    "KE" => "Kenya",
    "KI" => "Kiribati",
    "KP" => "Korea, Democratic People's Republic of",
    "KR" => "Korea, Republic of",
    "KW" => "Kuwait",
    "KG" => "Kyrgyzstan",
    "LA" => "Lao People's Democratic Republic",
    "LV" => "Latvia",
    "LB" => "Lebanon",
    "LS" => "Lesotho",
    "LR" => "Liberia",
    "LY" => "Libyan Arab Jamahiriya",
    "LI" => "Liechtenstein",
    "LT" => "Lithuania",
    "LU" => "Luxembourg",
    "MO" => "Macao",
    "MK" => "Macedonia, The Former Yugoslav Republic of",
    "MG" => "Madagascar",
    "MW" => "Malawi",
    "MY" => "Malaysia",
    "MV" => "Maldives",
    "ML" => "Mali",
    "MT" => "Malta",
    "MH" => "Marshall Islands",
    "MQ" => "Martinique",
    "MR" => "Mauritania",
    "MU" => "Mauritius",
    "YT" => "Mayotte",
    "MX" => "Mexico",
    "FM" => "Micronesia, Federated States of",
    "MD" => "Moldova, Republic of",
    "MC" => "Monaco",
    "MN" => "Mongolia",
    "ME" => "Montenegro",
    "MS" => "Montserrat",
    "MA" => "Morocco",
    "MZ" => "Mozambique",
    "MM" => "Myanmar",
    "NA" => "Namibia",
    "NR" => "Nauru",
    "NP" => "Nepal",
    "NL" => "Netherlands",
    "AN" => "Netherlands Antilles",
    "NC" => "New Caledonia",
    "NZ" => "New Zealand",
    "NI" => "Nicaragua",
    "NE" => "Niger",
    "NG" => "Nigeria",
    "NU" => "Niue",
    "NF" => "Norfolk Island",
    "MP" => "Northern Mariana Islands",
    "NO" => "Norway",
    "OM" => "Oman",
    "PK" => "Pakistan",
    "PW" => "Palau",
    "PS" => "Palestinian Territory, Occupied",
    "PA" => "Panama",
    "PG" => "Papua New Guinea",
    "PY" => "Paraguay",
    "PE" => "Peru",
    "PH" => "Philippines",
    "PN" => "Pitcairn",
    "PL" => "Poland",
    "PT" => "Portugal",
    "PR" => "Puerto Rico",
    "QA" => "Qatar",
    "RE" => "Reunion",
    "RO" => "Romania",
    "RU" => "Russian Federation",
    "RW" => "Rwanda",
    "SH" => "Saint Helena",
    "KN" => "Saint Kitts and Nevis",
    "LC" => "Saint Lucia",
    "PM" => "Saint Pierre and Miquelon",
    "VC" => "Saint Vincent and The Grenadines",
    "WS" => "Samoa",
    "SM" => "San Marino",
    "ST" => "Sao Tome and Principe",
    "SA" => "Saudi Arabia",
    "SN" => "Senegal",
    "RS" => "Serbia",
    "SC" => "Seychelles",
    "SL" => "Sierra Leone",
    "SG" => "Singapore",
    "SK" => "Slovakia",
    "SI" => "Slovenia",
    "SB" => "Solomon Islands",
    "SO" => "Somalia",
    "ZA" => "South Africa",
    "GS" => "South Georgia and The South Sandwich Islands",
    "ES" => "Spain",
    "LK" => "Sri Lanka",
    "SD" => "Sudan",
    "SR" => "Suriname",
    "SJ" => "Svalbard and Jan Mayen",
    "SZ" => "Swaziland",
    "SE" => "Sweden",
    "CH" => "Switzerland",
    "SY" => "Syrian Arab Republic",
    "TW" => "Taiwan, Province of China",
    "TJ" => "Tajikistan",
    "TZ" => "Tanzania, United Republic of",
    "TH" => "Thailand",
    "TL" => "Timor-leste",
    "TG" => "Togo",
    "TK" => "Tokelau",
    "TO" => "Tonga",
    "TT" => "Trinidad and Tobago",
    "TN" => "Tunisia",
    "TR" => "Turkey",
    "TM" => "Turkmenistan",
    "TC" => "Turks and Caicos Islands",
    "TV" => "Tuvalu",
    "UG" => "Uganda",
    "UA" => "Ukraine",
    "AE" => "United Arab Emirates",
    "GB" => "United Kingdom",
    "US" => "United States",
    "UM" => "United States Minor Outlying Islands",
    "UY" => "Uruguay",
    "UZ" => "Uzbekistan",
    "VU" => "Vanuatu",
    "VE" => "Venezuela",
    "VN" => "Viet Nam",
    "VG" => "Virgin Islands, British",
    "VI" => "Virgin Islands, U.S.",
    "WF" => "Wallis and Futuna",
    "EH" => "Western Sahara",
    "YE" => "Yemen",
    "ZM" => "Zambia",
    "ZW" => "Zimbabwe");
    return $countries;
}

function form_auto_generation_code($id, $prefix = '') {  
    $code = $prefix;
    $code .= ($id  > 999) ? $id :   sprintf('%03d', $id ) ;
    return $code;
}

function file_extensions() {   
    return array('pdf','odt','xls','xlsx','doc',
       'docx','jpeg', 'png', 'jpg', 'gif');
}

function filter_special_characters($file_name) {
    $filter_file_name = trim($file_name, '-');
    $filter_file_name = strtolower(trim($filter_file_name));
    $patterns = array();
    $patterns[0] = '/( (\(|\/|\[|\{|&|\*)?)/';
    $patterns[1] = '/[()\'"\[\]{},*&]|[^a-z0-9\-\.]/';
    $patterns[2] = '/-+/';
    $replacements = array();
    $replacements[2] = '-';
    $replacements[1] = '';
    $replacements[0] = '-';
    $filter_file_name = preg_replace($patterns, $replacements, $filter_file_name);
    return $filter_file_name;
}

function file_uploads($file_path = '', $temp_path = '') {
    if (!empty($file_path)) {
        $file_path_parts = explode('/', $file_path);
        $file_name = array_pop($file_path_parts);
        $file_name = urldecode($file_name);
        
        $image_name = filter_special_characters($file_name);
        array_push($file_path_parts, $image_name);
        $target_path = implode('/', $file_path_parts);
        move_uploaded_file($temp_path, $target_path);
        return $image_name;
    }
}

$uploaded_fields = array();
function uploads( $config = array() ) {
    $ci = get_ci_instance();
    global $uploaded_fields;
    $errors = 0;

    if( !empty( $config['field'] ) ) :
        // For particular file field.
        $files = array( $config['field'] => $_FILES[$config['field']] );

        //if( strpos( $config['field'], '[' ) < 0 ) :
            // Single
            unset( $_FILES[$config['field']] );
        //endif;

    else :
        $files = $_FILES;
    endif;


    if( !empty( $files ) ) :

        $return = array();
        $user_data  = get_user_data();

        // Load upload library
        if( empty( $ci->upload ) ) :
            $ci->load->library( 'upload' );
        endif;

        $file_name = $config['file_name'];
        $upload_path = trim( str_replace( '\\', '/', $config['upload_path'] ), '/' ) . '/';
        if( empty( $upload_path ) ) :
            $config['upload_path'] = UPLOADS;
        else :
            $config['upload_path'] = $upload_path;
        endif;

        if( !file_exists( $config['upload_path'] ) ) :
            mkdir( $config['upload_path'], TRUE );
            chmod( $config['upload_path'], 0777 );
        endif;

        if( empty( $config['allowed_types'] ) ) :
            $config['allowed_types'] = '*';
        endif;

        foreach( $files as $fk => $file ) : // $fk = file1 

            $upload_clm = $fk;
            if( !is_array( $file['name'] ) ) : 

                $file = $files[$fk] = array( 
                    'name'      => array( $file['name'] ),
                    'type'      => array( $file['type'] ),
                    'tmp_name'  => array( $file['tmp_name'] ),
                    'error'     => array( $file['error'] ),
                    'size'      => array( $file['size'] ),
                );

            elseif( empty( $config['field'] ) ) :
                $upload_clm .= '[]';
            endif;

            //$file_str = $file_path_str = $full_path_str = '';
            foreach( $file['name'] as $k => $name ) : // $k = 0 // $name = Chrysanthemum.jpg

                if( !empty( $name ) ) : 

                    if( array_key_exists( $fk.'_'.$k, $uploaded_fields ) ) :
                        $return[$fk][$k] = $uploaded_fields[$fk.'_'.$k];

                    else :

                        // Do upload
                        if( empty( $file_name ) ) :
                            $config['file_name'] = $user_data['user_id'] .'_' . get_var_name( $name, '_', array('.') );
                        endif;

                        $_FILES[$upload_clm]['name']= $file['name'][$k];
                        $_FILES[$upload_clm]['type']= $file['type'][$k];
                        $_FILES[$upload_clm]['tmp_name']= $file['tmp_name'][$k];
                        $_FILES[$upload_clm]['error']= $file['error'][$k];
                        $_FILES[$upload_clm]['size']= $file['size'][$k];

                        $ci->upload->initialize( $config );
                        $ci->upload->do_upload( $upload_clm );


                        $return[$fk][$k] = $ci->upload->data();

                        if( empty( $return[$fk][$k]['file_size'] ) || !file_exists( $return[$fk][$k]['full_path'] ) ) :
                            // Error while uploading
                            $return[$fk][$k]['error'] = '1';
                            ++$errors;
                        else :
                            $return[$fk][$k]['error'] = '0';

                        endif;

                        $uploaded_fields[$fk.'_'.$k] = $return[$fk][$k];

                    endif;    

                    if( $return[$fk][$k]['error'] === '0' ) :
                        $return[$fk]['file_arr'][$k] = $return[$fk][$k]['file_name'];
                    
                        /*$file_str       .= $return[$fk][$k]['file_name'] . ',';
                        $file_path_str  .= $upload_path . $return[$fk][$k]['file_name'] . ',';
                        $full_path_str  .= $return[$fk][$k]['full_path'] . ',';*/
                    endif;

                endif;    

            endforeach;

            /*$return[$fk]['file_str'][]        = substr( $file_str, 0, -1 );
            $return[$fk]['file_path_str'][]   = substr( $file_path_str, 0, -1 );
            $return[$fk]['full_path_str'][]   = substr( $full_path_str, 0, -1 );*/

        endforeach;

    endif;

    //echo "<pre>fles: "; print_r( $_FILES );
    $return['error'] = $errors;
    return $return;
}

function convert_time_12_to_24($time) {
    $time_arr = explode(':', $time);
    $time_period = explode(' ', array_pop($time_arr));
    $hr = array_shift($time_arr);
    $min = array_shift($time_period);
    if (end($time_period) == 'PM') {
        if ($hr != 12) 
            $hr = $hr + 12;
        
        $hr = $hr;
    }
    else if ($hr == 12) 
        $hr = 0;
    else 
        $hr = $hr;
    
    return $hr . ':' . $min;
}

function fill_digits( $value, $fill_count = '5' ) {
                
        if( empty( $value ) ) :
                return $value;
        endif;

        $fill_digits = pow(10, $fill_count);
        if( $value < $fill_digits ) :
                $digits = '';
                for( $i = 0; $i < ( $fill_count - strlen( $value ) ); $i++ ) :
                        $digits .= '0';
                endfor;

                $digits .= $value;
        else :
                return $value;
        endif; 

        return $digits;
}

function inr_format( $str, $digits = 2, $sepr = ',' ) {
        $return = '';
        $str = number_format( $str, $digits, '.', '' );
        if( empty( $str ) ) :
            return $str;
        endif;

        $e = explode( '.', $str );
        $len = strlen( $e[0] );
        $lst = substr( $e[0], -3 );
        $str = substr( $str, 0, $len-3 );
        for( $i = ($len-4); $i >= 0; $i -= 2 ) :
            $return = ( $str[$i-1] !== NULL ? $str[$i-1] : '' ).( $str[$i] != '-' ? $str[$i].$sepr : $str[$i] ).$return;
        endfor;

        return $return.$lst.'.'.$e[1];
    }
    
    function get_var_name( $str, $replace_with = '-', $allows = '' ) {
        if( empty( $str ) ) :
            return '';
        endif;
        
        $ignores = array(' ',',','\\','`','.','*','#','@','[',']','-','!','$','^','%','/','{','}','"','\'','?','(',')');
        
        if( !empty( $allows ) ) :
            $ignores = array_diff( $ignores, $allows );
        endif;
        
        $pattern = '/'.implode( '|\\', $ignores ).'/';
        $replace_with = $replace_with == '' ? '_' : $replace_with;
        
        //$pattern = '/ |,|\\\|`|\.|\*|\#|@|\[|\]|\-|\!|\$|\^|\%|\/|\{|\}|\"|\'|\?|\(|\)/i';
        return strtolower( trim( preg_replace( '/'. $replace_with.$replace_with .'+/', $replace_with, preg_replace( $pattern, $replace_with, $str ) ), $replace_with ) );
    }
    
    function get_file_preview( $url, $style = '', $show_delete = TRUE ) {
        
        $style = empty( $style ) ? 'width: 60px; height: 60px;' : $style;
        $html = '<div class="file-preview" style="'. $style .'">';
        if( !empty( $url ) ) :
            $html .= '<input type="hidden"  name="hidden_file[]" value="'. $url .'"/>';
        
            $ext = explode('.', $url);
            $ext = end( $ext );
            
            $file_url = '';
            if( $ext == 'png' || $ext == 'jpg' || $ext == 'jpeg' || $ext == 'gif' ) :
                $file_url .= $url;
            else:
                
                $file_url .= 'assets/images/file-icons/'; 
                if( !file_exists( $file_url. $ext.'.png' ) ) :
                    $ext = 'other';
                endif;
                
                $file_url .= $ext.'.png';
            endif;
            
            $html .= '<img src="'. BASE_URL . $file_url .'" style="width: 100%; max-height: 100%;" />';
            if( $show_delete ) :
                $html .= '<i class="fa fa-times rm-file-icn" style="position: absolute; cursor: pointer; margin-left: -10px; background: #ccc; color: #fff; padding: 5px; border-radius: 15px; min-width: 24px; text-align: center;"></i>';
            endif;
        endif;
        $html .= '</div>';
        
        return $html;
    }

    function leadsquare_create($data_string) {
        try
        {

            $curl = curl_init(LS_URL.'Lead.Capture?accessKey='.ACCESS_KEY.'&secretKey='.SECRET_KEY);
            curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data_string);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array(
                    "Content-Type:application/json",
                    "Content-Length:".strlen($data_string)
                    ));
            $json_response = curl_exec($curl);
            
            curl_close($curl);
        } catch (Exception $ex) {
            error_log("\n".$crurl."\n".date("d-m-Y h:i:sa")."\nException Error :".$ex, 3, "in.log");
            curl_close($curl);
        }					
        
        if(json_decode($json_response)->Status == "Success"){
            return json_decode($json_response)->Message->RelatedId;
        }
        else{
            return 'error';
        }
    
    }

    function leadsquare_update($data_string_update, $RelatedId) {	
        try {

            $curl = curl_init(LS_URL.'Lead.Update?accessKey='.ACCESS_KEY.'&secretKey='.SECRET_KEY.'&leadId='.$RelatedId);
            curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data_string_update);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array(
                    "Content-Type:application/json",
                    "Content-Length:".strlen($data_string_update)
                    ));
            $json_response = curl_exec($curl);
            // $data['lead_details'] = json_decode($json_response);		
            curl_close($curl);
        } catch (Exception $ex) {
            curl_close($curl);
        }
		
        if(json_decode($json_response)->Status == "Success"){
            return $RelatedId;
        }
        else{
            return 'error';
        }
    
    }

    function check_lead_exist($email_id = 'vivek.t@newgendigital.com') {
        $ch = curl_init();
        $headers = array(
        'Accept: application/json',
        'Content-Type: application/json',
    
        );
        curl_setopt($ch, CURLOPT_URL, LS_URL.'Leads.GetByEmailaddress?accessKey='.ACCESS_KEY.'&secretKey='.SECRET_KEY.'&emailaddress='.$email_id);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $body = '{}';
    
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET"); 
        curl_setopt($ch, CURLOPT_POSTFIELDS,$body);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
        // Timeout in seconds
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
        $res = curl_exec($ch);
        if(count(json_decode($res, true)) > 0) {
            return json_decode($res, true)[0]['ProspectID'];
        } else {
            return 0;
        }
    }

    function send_mail_customer($to, $subject, $body, $order_id = '') {

        $mail = new PHPMailer();

        $configurationSet = 'ConfigSet';
        
        $mail->isSMTP();
        $mail->SMTPAuth = true;
        $mail->SMTPSecure = "tls";
        $mail->Host = SES_HOST;
        $mail->Port = SES_PORT;
    
        $mail->Username = SES_USER;
        $mail->Password = SES_PASSWORD;
        $mail->addCustomHeader('X-SES-CONFIGURATION-SET', $configurationSet);
    
        $mail->setFrom(FROM_MAIL, FROM_NAME);

        $toemail = $to;//'vivek.t@newgendigital.com';

        $addresses = explode(',',$toemail);
        foreach ($addresses as $address) {
                $mail->AddAddress($address);
            }

        // $bccemail = 'programadvisor@humanfactors.com,senthil@newgendigital.com,debduttaray@newgendigital.com';
        // $bccaddresses = explode(',',$bccemail);
    
        // foreach ($bccaddresses as $bccaddress) {
        //     $mail->addBCC($bccaddress);
        // }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;

        if($mail->Send()){
            //Email Log Success
            insert_email_log(TBL_EL, FROM_MAIL, $toemail, $subject, 'Success', $body, $order_id);
            // echo 'Message has been sent';
            return 1;
        }else {
            //Email Log Error
            insert_email_log(TBL_EL, FROM_MAIL, $toemail, $subject, $mail->ErrorInfo, $body, $order_id);

            return 0;
        }
    }

    function send_mail_admin($from, $subject, $body, $to, $cc='', $order_id = '') {

        $mail = new PHPMailer();

        $configurationSet = 'ConfigSet';
        
        $mail->isSMTP();
        $mail->SMTPAuth = true;
        $mail->SMTPSecure = "tls";
        $mail->Host = SES_HOST;
        $mail->Port = SES_PORT;
    
        $mail->Username = SES_USER;
        $mail->Password = SES_PASSWORD;
        $mail->addCustomHeader('X-SES-CONFIGURATION-SET', $configurationSet);
    
        // $mail->setFrom($from);
        $mail->setFrom(FROM_MAIL, FROM_NAME);

        if($_SERVER['SERVER_NAME'] == "127.0.0.1" || $_SERVER['SERVER_NAME'] == "localhost" || $_SERVER['SERVER_NAME'] == 'dev.hfi.training' || $_SERVER['SERVER_NAME'] == '3.6.208.6') {
            $toemail = 'vivek.t@newgendigital.com';
        } else {
            if(empty($to)) {
                $toemail = ADMIN_TO;
                // $email->addTo(ADMIN_TO);
            } else {
                $toemail = $to;
            }
        }

        $addresses = explode(',',$toemail);
        foreach ($addresses as $address) {
                $mail->AddAddress($address);
            }

        if($_SERVER['SERVER_NAME'] == "127.0.0.1" || $_SERVER['SERVER_NAME'] == "localhost" || $_SERVER['SERVER_NAME'] == 'dev.hfi.training' || $_SERVER['SERVER_NAME'] == '3.6.208.6') {
            $bccemail = 'vivek.t@newgendigital.com';
            $bccaddresses = explode(',',$bccemail);
        
            foreach ($bccaddresses as $bccaddress) {
                $mail->addBCC($bccaddress);
            }
        } else {
            if(!empty($cc)) {
                $ccemail = $cc;
                $ccaddresses = $cc;//explode(',',$ccemail);
            
                foreach ($ccaddresses as $cc_mail => $ccaddress) {
                    $mail->addCC($cc_mail);
                }
            }

            $bccemail = 'vivek.t@newgendigital.com';
            $bccaddresses = explode(',',$bccemail);
        
            foreach ($bccaddresses as $bccaddress) {
                $mail->addBCC($bccaddress);
            }
        }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;

        if($mail->Send()){
            //Email Log Success
            insert_email_log(TBL_EL, FROM_MAIL, $toemail, $subject, 'Success', $body, $order_id);
            return 1;
        }else {
            //Email Log Error
            insert_email_log(TBL_EL, FROM_MAIL, $toemail, $subject, $mail->ErrorInfo, $body, $order_id);
            return 0;
        }
    }
	

    function insert_email_log($table_name, $from, $to, $subject, $mail_status, $body, $order_id) {
        $ci = get_ci_instance();

        $args = array(
            'order_id'               => $order_id,
            'from_email'             => $from,
            'to_email'               => $to,
            'subject'                => $subject,
            'body'                   => $body,
            'mail_status'            => $mail_status,   
            'region'                 => REGION_ID,  
            'created_on'             => date('Y-m-d H:i:s'),
            'ip_address'             => $_SERVER['REMOTE_ADDR']
        ) ;

        $ci->db->insert( $table_name, $args );
        $db_id = $ci->db->insert_id();
    }

    function get_client_ip() {
        $ipaddress = '';
        if ($_SERVER['REMOTE_ADDR'] != '127.0.0.1' && $_SERVER['REMOTE_ADDR'] != '::1')
            $ipaddress = $_SERVER['REMOTE_ADDR'];
        else
            $ipaddress = '121.243.33.212'; //NA'192.199.248.75';

        return $ipaddress;
    }

    function get_country_name() {
        $ip = get_client_ip();  
        $country_ip_list = country_ip_list();
        if(empty($_SESSION['country_name'])) {

            $loc = file_get_contents('https://ipapi.co/'.$ip.'/json/?key='.IPAPI_KEY);
            $record = json_decode($loc);
            $_SESSION['ip'] = $ip;
            $_SESSION['country_code'] = $record->country_code;
            $_SESSION['city'] = $record->city;
            $_SESSION['country'] = $record->country_name;
            $_SESSION['country_name'] = $record->country_name.'-'.$record->city;
            $_SESSION['region'] = $country_ip_list[$record->country_name];
        
        } else if(isset($_SESSION['country_code']) && !empty($_SESSION['country_code']) && ($_SESSION['ip'] != $ip)) {
            $loc = file_get_contents('https://ipapi.co/'.$ip.'/json/?key='.IPAPI_KEY);
            $record = json_decode($loc);
            $_SESSION['ip'] = $ip;
            $_SESSION['country_code'] = $record->country_code;
            $_SESSION['city'] = $record->city;
            $_SESSION['country'] = $record->country_name;
            $_SESSION['country_name'] = $record->country_name.'-'.$record->city;
            $_SESSION['region'] = $country_ip_list[$record->country_name];
        }
    }

    function country_ip_list() {
        $country_ip = array(
            "India" => "India",
            "North America" => "North America",
            "United States" => "North America",
            "Mexico" => "North America",
            "Canada" => "North America",
            "Guatemala" => "North America",
            "Cuba" => "North America",
            "Haiti" => "North America",
            "Dominican Republic" => "North America",
            "Honduras" => "North America",
            "Nicaragua" => "North America",
            "El Salvador" => "North America",
            "Costa Rica" => "North America",
            "Panama" => "North America",
            "Jamaica" => "North America",
            "Trinidad and Tobago" => "North America",
            "Belize" => "North America",
            "Bahamas, The" => "North America",
            "Barbados" => "North America",
            "Saint Lucia" => "North America",
            "Grenada" => "North America",
            "Saint Vincent and the Grenadines" => "North America",
            "Antigua and Barbuda" => "North America",
            "Dominica" => "North America",
            "Saint Kitts and Nevis" => "North America",
            "Brazil" => "North America",
            "Chile" => "North America",
            "Argentina" => "North America",
            "Bolivia" => "North America",
            "Colombia" => "North America",
            "Ecuador" => "North America",
            "Guyana" => "North America",
            "Paraguay" => "North America",
            "Peru" => "North America",
            "Suriname" => "North America",
            "Uruguay" => "North America",
            "Venezuela" => "North America",
            "Albania" => "Europe",
            "Andorra" => "Europe",
            "Austria" => "Europe",
            "Belarus" => "Europe",
            "Belgium" => "Europe",
            "Bosnia and Herzegovina" => "Europe",
            "Bulgaria" => "Europe",
            "Croatia" => "Europe",
            "Cyprus" => "Europe",
            "Czech Republic" => "Europe",
            "Czechia/Czech Republic" => "Europe",
            "Denmark" => "Europe",
            "Estonia" => "Europe",
            "Finland" => "Europe",
            "France" => "Europe",
            "Germany" => "Europe",
            "Greece" => "Europe",
            "Holy See" => "Europe",
            "Hungary" => "Europe",
            "Iceland" => "Europe",
            "Ireland" => "Europe",
            "Italy" => "Europe",
            "Kosovo" => "Europe",
            "Latvia" => "Europe",
            "Liechtenstein" => "Europe",
            "Lithuania" => "Europe",
            "Luxembourg" => "Europe",
            "Malta" => "Europe",
            "Macedonia" => "Europe",
            "Moldova" => "Europe",
            "Monaco" => "Europe",
            "Montenegro" => "Europe",
            "Netherlands" => "Europe",
            "Netherlands Antilles" => "Europe",
            "North Macedonia" => "Europe",
            "Norway" => "Europe",
            "Poland" => "Europe",
            "Portugal" => "Europe",
            "Romania" => "Europe",
            "Russia" => "Europe",
            "San Marino" => "Europe",
            "Serbia" => "Europe",
            "Slovakia" => "Europe",
            "Slovenia" => "Europe",
            "Spain" => "Europe",
            "Sweden" => "Europe",
            "Switzerland" => "Europe",
            "Ukraine" => "Europe",
            "United Kingdom" => "Europe",
            "Vatican City" => "Europe",
            "Australia" => "APAC",
            "Bangladesh" => "APAC",
            "Bhutan" => "APAC",
            "British Indian Ocean Territory" => "APAC",
            "Brunei" => "APAC",
            "Burma" => "APAC",
            "Cambodia" => "APAC",
            "China" => "APAC",
            "East Timor (see Timor-Leste)" => "APAC",
            "Cyprus" => "APAC",
            "Egypt" => "APAC",
            "Fiji" => "APAC",
            "Hong Kong" => "APAC",
            "Indonesia" => "APAC",
            "Japan" => "APAC",
            "Kiribati" => "APAC",
            "Korea, North" => "APAC",
            "Korea, South" => "APAC",
            "Laos" => "APAC",
            "Macau" => "APAC",
            "Malaysia" => "APAC",
            "Marshall Islands" => "APAC",
            "Micronesia" => "APAC",
            "Maldives" => "APAC",
            "Mongolia" => "APAC",
            "Myanmar" => "APAC",
            "New Zealand" => "APAC",
            "Nepal" => "APAC",
            "North Korea" => "APAC",
            "Palau" => "APAC",
            "Papua New Guinea" => "APAC",
            "Pakistan" => "APAC",
            "Philippines" => "APAC",
            "Samoa" => "APAC", 
            "Singapore" => "APAC",
            "Solomon Islands" => "APAC",
            "South Korea" => "APAC",
            "Sri Lanka" => "APAC",
            "Taiwan" => "APAC",
            "Thailand" => "APAC",
            "Timor-Leste" => "APAC",
            "Tonga" => "APAC",
            "Tuvalu" => "APAC",
            "East Timor" => "APAC",
            "Uganda" => "APAC",
            "Vanuatu" => "APAC",
            "Vietnam" => "APAC",
            "Algeria" => "Africa",
            "Angola" => "Africa",
            "Benin" => "Africa",
            "Botswana" => "Africa",
            "Burkina Faso" => "Africa",
            "Burundi" => "Africa",
            "Cabo Verde" => "Africa",
            "Cape Verde" => "Africa",
            "Cameroon" => "Africa",
            "Central African Republic" => "Africa",
            "Chad" => "Africa",
            "Comoros" => "Africa",
            "Congo" => "Africa",
            "Republic of the Congo" => "Africa",
            "Democratic Republic of the Congo" => "Africa",
            "Djibouti" => "Africa",
            "Egypt" => "Africa",
            "Equatorial Guinea" => "Africa",
            "Eritrea" => "Africa",
            "Eswatini" => "Africa",
            "Ethiopia" => "Africa",
            "Gabon" => "Africa",
            "Gambia" => "Africa",
            "Gambia, The" => "Africa",
            "The" => "Africa",
            "Ghana" => "Africa",
            "Guinea" => "Africa",
            "Guinea-Bissau" => "Africa",
            "Ivory Coast" => "Africa",
            "Republic of Côte d'Ivoire" => "Africa",
            "Kenya" => "Africa",
            "Lesotho" => "Africa",
            "Liberia" => "Africa",
            "Libya" => "Africa",
            "Madagascar" => "Africa",
            "Malawi" => "Africa",
            "Mali" => "Africa",
            "Mauritania" => "Africa",
            "Mauritius" => "Africa",
            "Morocco" => "Africa",
            "Mozambique" => "Africa",
            "Namibia" => "Africa",
            "Nauru" => "Africa",
            "Niger" => "Africa",
            "Nigeria" => "Africa",
            "Rwanda" => "Africa",
            "Sao Tome and Principe" => "Africa",
            "Senegal" => "Africa",
            "Seychelles" => "Africa",
            "Sierra Leone" => "Africa",
            "Somalia" => "Africa",
            "South Africa" => "Africa",
            "South Sudan" => "Africa",
            "Sudan" => "Africa",
            "Swaziland" => "Africa", 
            "Tanzania" => "Africa",
            "Togo" => "Africa",
            "Tunisia" => "Africa",
            "Zambia" => "Africa",
            "Zimbabwe" => "Africa",
            "Afghanistan" => "Middle East",
            "Armenia" => "Middle East",
            "Azerbaijan" => "Middle East",
            "Bahrain" => "Middle East",
            "Georgia" => "Middle East",
            "Iran" => "Middle East",
            "Iraq" => "Middle East",
            "Israel" => "Middle East",
            "Jordan" => "Middle East",
            "Kazakhstan" => "Middle East",
            "Kuwait" => "Middle East",
            "Lebanon" => "Middle East",
            "Oman" => "Middle East",
            "Palestinian Territories" => "Middle East",
            "Palestine" => "Middle East",
            "Qatar" => "Middle East",
            "Saudi Arabia" => "Middle East",
            "Syria" => "Middle East",
            "Turkey" => "Middle East",
            "United Arab Emirates" => "Middle East",
            "Yemen" => "Middle East",
            "Egypt" => "Middle East",
            "Akrotiri and Dhekelia" => "Middle East",
            "Cyprus" => "Middle East",
            "Kyrgyzstan" => "Middle East",
            "Libya" => "Middle East",
            "Sudan" => "Middle East",
            "Tajikistan" => "Middle East",
            "Turkmenistan" => "Middle East",
            "Uzbekistan" => "Middle East"
        );
        return $country_ip;
    }

    function iTransact_payment($post, $order_id, $amount, $learner) {

        $apiUsername = IT_API_USERNAME;
        $apiKey = IT_APIKEY;

        $transactionAmount = $amount;
        $name = $learner->name;
        $email = $learner->email;
        $card_number = str_replace(' ', '',$post['cardNumber']);
        $cvv = $post['cvv'];
        $month = $post['month'];
        $year = $post['year'];

        //Learner Address
        $address1 = $learner->unit_building.', '.$learner->street.', '.$learner->locality;
        $city = $learner->city;
        $state = $learner->state;
        $country = $learner->country;
        $zipcode = $learner->zipcode;

        // Create new instances of the SDK, and if you would like you can also use the payload.
        // $card = new CardPayload('Srinath',5329616300113251,148,8,2025); //Live
        $card = new CardPayload($name,$card_number,$cvv,$month,$year);
        $address = new AddressPayload($address1, $city, $state, $country, $zipcode); // Address is optional unless you are using a Loopback / Sandbox / Demo account
        $payload = new TransactionPayload($transactionAmount, $card, $address);
        $payload->addMetadata('email', $email); // Optional
        $payload->setSendCustomerReceipt(true); // Optional - default: false
        $sdk = new iTTransaction();

        // Use the following to get payload signature, and submit the transaction.
        // POST request to server
        $postResult = $sdk->postCardTransaction($apiUsername, $apiKey, $payload);
        return $postResult;
        // echo '<pre>'; print "\n\nPosted payload result\n";
        // print_r($postResult);

        /**
         * Other useful stuff
         **/

        // To compare a payload HMAC string
        // $signResult = $sdk->signPayload($apiKey, $payload);
        // print "\nSigned payload result\n";
        // print_r($signResult);
    }

    function curl_request($url) {
        //  Initiate curl
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);
        $result=curl_exec($ch);
        curl_close($ch);
        $res = json_decode($result, true);
        return $res;
    }

    function curl_post($request, $url, $orgid) {

        //Login API
        $login_res = login_request();
        //Header
        $apikey = $login_res->user->apikey;
        // $orgid = 4842;

        $headers = array(
            "apikey:  $apikey",
            "ORGID: $orgid"
        );

        $ch = curl_init($url);
    
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT,20);
        curl_setopt($ch, CURLOPT_TIMEOUT,20);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        // curl_setopt($ch, CURLOPT_HTTPHEADER, array(json_encode($header_data)));
        // curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "JSONString=".json_encode($request, true));
    
        $result = curl_exec($ch);
    
        //close cURL resource
        curl_close($ch);
    
        return json_decode($result);
    }

    function  curl_post_req($url, $postdata) {
        $ch = curl_init();
        $headers  = [
            'Content-Type: application/json'
        ];
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);          
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        // Receive server response ...
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $result = curl_exec($ch);
    
        //close cURL resource
        curl_close($ch);
    
        return json_decode($result);
    }

    function  curl_put_req($url, $postdata) {
        $ch = curl_init();
        $headers  = [
            'Content-Type: application/json'
        ];
        curl_setopt($ch, CURLOPT_URL, $url);
        
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata); // Include this line if sending JSON data

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        // Receive server response ...
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $result = curl_exec($ch);
    
        //close cURL resource
        curl_close($ch);
    
        return json_decode($result);
    }

    //Edmingle login API
    function login_request() {

        $login_data = array(
            'username'         => EDMINGLE_USERNAME,
            'password'         => EDMINGLE_PWD,
            'persistent_login' => true
        );

        //Login
        $url= EDMINGLE_HOST.'tutor/login';
        $ch = curl_init($url);
    
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
        // curl_setopt($ch, CURLOPT_HTTPHEADER, array("JSONString: " . json_encode($login_data, true)));
        // curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "JSONString=".json_encode($login_data, true));
    
        $result = curl_exec($ch);
    
        //close cURL resource
        curl_close($ch);
    
        return json_decode($result);
    }

    function gupshup_integration($mthd, $input) {
		$method = 'method='.$mthd;
        $url = API_ENDPOINT."?".$method."&format=json&userid=".USERID."&password=".PWD."&".$input."&v=1.1&auth_scheme=plain&channel=WHATSAPP";
		$res = curl_request($url);
		return $res;
		// echo '<pre>'; print_r($res); exit;
	}

    //*********** CCAvenue HDFC Payment Gateway *********************
    function encrypt($plainText,$key) {
		$key = hextobin(md5($key));
		$initVector = pack("C*", 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f);
		$openMode = openssl_encrypt($plainText, 'AES-128-CBC', $key, OPENSSL_RAW_DATA, $initVector);
		$encryptedText = bin2hex($openMode);
		return $encryptedText;
	}

	function decrypt($encryptedText,$key) {
		$key = hextobin(md5($key));
		$initVector = pack("C*", 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f);
		$encryptedText = hextobin($encryptedText);
		$decryptedText = openssl_decrypt($encryptedText, 'AES-128-CBC', $key, OPENSSL_RAW_DATA, $initVector);
		return $decryptedText;
	}

	//*********** Padding Function *********************
	function pkcs5_pad ($plainText, $blockSize) {
	    $pad = $blockSize - (strlen($plainText) % $blockSize);
	    return $plainText . str_repeat(chr($pad), $pad);
	}

	//********** Hexadecimal to Binary function for php 4.0 version ********
	function hextobin($hexString)  { 
        $length = strlen($hexString); 
        $binString="";   
        $count=0; 
        while($count<$length) {       
            $subString =substr($hexString,$count,2);           
            $packedString = pack("H*",$subString); 
            if ($count==0) {
                $binString=$packedString;
            } else {
                $binString.=$packedString;
            }  
            $count+=2; 
        } 
        return $binString; 
    } 

    function orderStatusTracker($order_id, $reference_no) {
        $working_key = WORKING_KEY; //Shared by CCAVENUES
        $access_code = ACCESS_CODE;

        $merchant_json_data =
        array(
            'order_no' => $order_id,
            'reference_no' => $reference_no
        );

        $merchant_data = json_encode($merchant_json_data);
        $encrypted_data = encrypt($merchant_data, $working_key);
        $final_data = 'enc_request='.$encrypted_data.'&access_code='.$access_code.'&command=orderStatusTracker&request_type=JSON&response_type=JSON';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, ORDERSTATRACK_API);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER,'Content-Type: application/json') ;
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $final_data);
        // Get server response ...
        $result = curl_exec($ch);
        curl_close($ch);


        $status = '';
        $information = explode('&', $result);

        $dataSize = sizeof($information);
        for ($i = 0; $i < $dataSize; $i++) {
            $info_value = explode('=', $information[$i]);
            if ($info_value[0] == 'enc_response') {
                $status = decrypt(trim($info_value[1]), $working_key);
                
            }
        }

        // echo 'Status revert is: ' . $status.'<pre>';
        $obj = json_decode($status);
        // print_r($obj);
        return $obj;

    }

    function redirect_homepage() {
        redirect('/', 'refresh');
    }

    function gst_calculation($gst_percentage, $amount) {
        $gst_amount = 0;
        if(!empty($gst_percentage) && !empty($amount)) {
            $gst_amount = (($gst_percentage / 100) * $amount);
        }
        return $gst_amount;
    }

    function get_total_amount($amount, $gst_amount) {
        $total_amount = 0;
        if(!empty($gst_amount) && !empty($amount)) {
            $total_amount = ($gst_amount + $amount);
        }
        return $total_amount;
    }

    function parsedown_wrapper($text) {
        //HTML Parsedown
        $Parsedown = new Parsedown();
        $response = $Parsedown->text($text);
        return $response;
    }

    function location() {
        $location = array(
            'Mumbai' => 'Mumbai',
            'Bangalore' => 'Bangalore',
            'Delhi' => 'Delhi',
            'Pune' => 'Pune'
        );
        return $location;
    }

    function getCourseIds($type='Online Live') {
        $CourseIds = array(
            'Online Live' => array(
                'cua' => 27641,
                'cxa' => 32348,
                'cdpa' => 32349,
                'ExpertUXReview' => 34876,
                'PortfolioBuildingWorkshop' => 34877,
                'QualitativeResearchMethodsWorkshop' => 34878,
                'DesignThinkingWorkshop' => 34879,
                'UXforMobile' => 35722,
                'ServiceDesignThinking' => 35723,
                'UXEssentials' => 35724,
                'UXCrashCourse' => 35725,
                'PersuasiveDesign' => 35726,
                'DigitalCommunicationDesign' => 28961,
                'UXforProductManagers' => 35727,
                'UXforDevelopers' => 35729,
                'ProductDesignUsability' => 35730,
                'uxf' => 36280,
                'ucacd' => 36281,
                'ScienceArtDesign' => 36293,
                'put' => 36294,
                'PetDesign' => 36295,
                'PetArchitect' => 36296,
                'OmniChannel' => 36297,
                'SupportInstitutionalization ' => 36299
            ),
            'Self paced' => array(
                'cua' => 32122
            )
        );
        return $CourseIds[$type];
    }

    function strapi_create($url, $data) {
		$post_arg = array();
		$post_arg['data'] = $data;
        $postdata = json_encode($post_arg, true);
		$res = curl_post_req($url, $postdata);
		return $res;
    }

    function strapi_update($url, $data) {
		$post_arg = array();
		$post_arg['data'] = $data;
        $postdata = json_encode($post_arg, true);
		$res = curl_put_req($url, $postdata);
		return $res;
    }

    function branch_setting() {
        $branch = array(
            '₹' => array(
                "currency" => "INR",
                "gst_type" => "GST",
                "gst_percentage" => "18",
                "currency_svg" => '<svg xmlns="http://www.w3.org/2000/svg" height="12" fill="currentColor" viewBox="0 0 320 512"><path d="M0 64C0 46.3 14.3 32 32 32H96h16H288c17.7 0 32 14.3 32 32s-14.3 32-32 32H231.8c9.6 14.4 16.7 30.6 20.7 48H288c17.7 0 32 14.3 32 32s-14.3 32-32 32H252.4c-13.2 58.3-61.9 103.2-122.2 110.9L274.6 422c14.4 10.3 17.7 30.3 7.4 44.6s-30.3 17.7-44.6 7.4L13.4 314C2.1 306-2.7 291.5 1.5 278.2S18.1 256 32 256h80c32.8 0 61-19.7 73.3-48H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H185.3C173 115.7 144.8 96 112 96H96 32C14.3 96 0 81.7 0 64z"></path></svg>'
            ),
            '$' => array(
                "currency" => "USD",
                "gst_type" => "",
                "gst_percentage" => "",
                "currency_svg" => '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" x="0" y="0" viewBox="0 0 511.613 511.613" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M385.261 311.475c-2.471-8.367-5.469-15.649-8.99-21.833-3.519-6.19-8.559-12.228-15.13-18.134-6.563-5.903-12.467-10.657-17.702-14.271-5.232-3.617-12.419-7.661-21.557-12.137-9.13-4.475-16.364-7.805-21.689-9.995-5.332-2.187-13.045-5.185-23.134-8.992-8.945-3.424-15.605-6.042-19.987-7.849-4.377-1.809-10.133-4.377-17.271-7.71-7.135-3.328-12.465-6.28-15.987-8.848-3.521-2.568-7.279-5.708-11.277-9.419-3.998-3.711-6.805-7.661-8.424-11.848-1.615-4.188-2.425-8.757-2.425-13.706 0-12.94 5.708-23.507 17.128-31.689 11.421-8.182 26.174-12.275 44.257-12.275 7.99 0 16.136 1.093 24.41 3.284s15.365 4.659 21.266 7.421c5.906 2.762 11.471 5.808 16.707 9.137 5.235 3.332 8.945 5.852 11.136 7.565 2.189 1.714 3.576 2.855 4.141 3.427 2.478 1.903 5.041 2.568 7.706 1.999 2.854-.19 5.045-1.715 6.571-4.567l23.13-41.684c2.283-3.805 1.811-7.422-1.427-10.85a97.672 97.672 0 0 0-4.291-3.997c-1.708-1.524-5.421-4.283-11.136-8.282a137.803 137.803 0 0 0-18.124-10.706c-6.379-3.138-14.661-6.328-24.845-9.562-10.178-3.239-20.697-5.426-31.549-6.567V9.136c0-2.663-.855-4.853-2.563-6.567C282.493.859 280.303 0 277.634 0h-38.546c-2.474 0-4.615.903-6.423 2.712s-2.712 3.949-2.712 6.424v51.391c-29.884 5.708-54.152 18.461-72.805 38.256-18.651 19.796-27.98 42.823-27.98 69.092 0 7.803.812 15.226 2.43 22.265 1.616 7.045 3.616 13.374 5.996 18.988 2.378 5.618 5.758 11.136 10.135 16.562 4.377 5.424 8.518 10.088 12.419 13.988 3.903 3.899 8.995 7.945 15.274 12.131 6.283 4.19 11.66 7.571 16.134 10.139 4.475 2.56 10.422 5.52 17.843 8.843 7.423 3.333 13.278 5.852 17.561 7.569 4.283 1.711 10.135 4.093 17.561 7.132 10.277 3.997 17.892 7.091 22.84 9.281 4.952 2.19 11.231 5.235 18.849 9.137 7.611 3.898 13.176 7.468 16.7 10.705 3.521 3.237 6.708 7.234 9.565 11.991s4.288 9.801 4.288 15.133c0 15.037-5.853 26.645-17.562 34.823-11.704 8.187-25.27 12.279-40.685 12.279a99.747 99.747 0 0 1-21.124-2.279c-24.744-4.955-47.869-16.851-69.377-35.693l-.571-.571c-1.714-2.088-3.999-2.946-6.851-2.563-3.046.38-5.236 1.523-6.567 3.43l-29.408 38.54c-2.856 3.806-2.663 7.707.572 11.704.953 1.143 2.618 2.86 4.996 5.14 2.384 2.289 6.81 5.852 13.278 10.715 6.47 4.856 13.513 9.418 21.128 13.706 7.614 4.281 17.272 8.514 28.98 12.703 11.708 4.182 23.839 7.131 36.402 8.843v49.963c0 2.478.905 4.617 2.712 6.427 1.809 1.811 3.949 2.711 6.423 2.711h38.546c2.669 0 4.859-.855 6.57-2.566s2.563-3.901 2.563-6.571v-49.963c30.269-4.948 54.87-17.939 73.806-38.972 18.938-21.033 28.41-46.11 28.41-75.229-.01-9.515-1.245-18.461-3.743-26.841z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>'
            ),
            'R' => array(
                "currency" => "ZAR",
                "gst_type" => "VAT",
                "gst_percentage" => "15",
                "currency_svg" => '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M349.899 313.5v-.3c-7.5-7.8-15.599-15.601-25.199-23.101 65.4-20.7 101.999-70.499 101.999-140.4 0-62.999-33.3-116.1-84.6-135.901C317.501 4.499 280.299 0 228.099 0H35.5v512h124.2V309.899c36.711 0 34.854 5.895 47.999 20.101 15.312 16.735 67.089 98.459 120.901 182h147.9c-60.864-101.473-104.654-174.391-126.601-198.5zM159.7 111.299c26.206-.084 92.305-.437 104.099 1.201 23.701 4.2 35.7 18.6 35.7 43.2 0 21.599-9 36.299-26.1 42.299-19.349 6.912-86.441 4.801-113.699 4.801z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>'
            ),
            '€' => array(
                "currency" => "EURO",
                "gst_type" => "",
                "gst_percentage" => "",
                "currency_svg" => '<svg xmlns="http://www.w3.org/2000/svg"  width="12" height="12" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" fill-rule="evenodd" class=""><g><path d="M7.582 9A8.007 8.007 0 0 1 15 4c1.7 0 3.276.531 4.572 1.436a1 1 0 0 1-1.144 1.64A6 6 0 0 0 9.804 9H15a1 1 0 0 1 0 2H9.083a5.99 5.99 0 0 0 0 2H15a1 1 0 0 1 0 2H9.804a6 6 0 0 0 8.624 1.924 1 1 0 0 1 1.144 1.64A7.958 7.958 0 0 1 15 20a8.007 8.007 0 0 1-7.418-5H5a1 1 0 0 1 0-2h2.062a8.05 8.05 0 0 1 0-2H5a1 1 0 0 1 0-2z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>'
            ),
        );
        return $branch;
    }