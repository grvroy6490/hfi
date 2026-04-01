<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/userguide3/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/

/* Home Routes */
$route['default_controller'] = 'home';

/* Certification Routes */
$route['certification'] = 'certification/index';
$route['certification/cua'] = 'certification/cua';
$route['certification/cdpa'] = 'certification/cdpa';
$route['certification/cxa'] = 'certification/cxa';
$route['certification/science-of-experience-design'] = 'certification/science_of_experience_design';

/* Courses Routes */
$route['courses'] = 'courses/index';
$route['courses/all-courses'] = 'courses/all_courses';
$route['courses/cua'] = 'courses/cua';
$route['courses/cdpa'] = 'courses/cdpa';
$route['courses/cxa'] = 'courses/cxa';
$route['courses/calendar'] = 'courses/calendar';

/* Checkout Routes */
$route['checkout'] = 'checkout/index';
$route['checkout/program-details'] = 'checkout/program_details';
$route['checkout/account-details'] = 'checkout/account_details';
$route['checkout/payment-details'] = 'checkout/payment_details';
$route['checkout/confirmation'] = 'checkout/confirmation';

/* 404 Route */
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;
