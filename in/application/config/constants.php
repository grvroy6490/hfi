<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| Display Debug backtrace
|--------------------------------------------------------------------------
|
| If set to TRUE, a backtrace will be displayed along with php errors. If
| error_reporting is disabled, the backtrace will not display, regardless
| of this setting
|
*/
defined('SHOW_DEBUG_BACKTRACE') OR define('SHOW_DEBUG_BACKTRACE', TRUE);

/*
|--------------------------------------------------------------------------
| File and Directory Modes
|--------------------------------------------------------------------------
|
| These prefs are used when checking and setting modes when working
| with the file system.  The defaults are fine on servers with proper
| security, but you may wish (or even need) to change the values in
| certain environments (Apache running a separate process for each
| user, PHP under CGI with Apache suEXEC, etc.).  Octal values should
| always be used to set the mode correctly.
|
*/
defined('FILE_READ_MODE')  OR define('FILE_READ_MODE', 0644);
defined('FILE_WRITE_MODE') OR define('FILE_WRITE_MODE', 0666);
defined('DIR_READ_MODE')   OR define('DIR_READ_MODE', 0755);
defined('DIR_WRITE_MODE')  OR define('DIR_WRITE_MODE', 0755);

/*
|--------------------------------------------------------------------------
| File Stream Modes
|--------------------------------------------------------------------------
|
| These modes are used when working with fopen()/popen()
|
*/
defined('FOPEN_READ')                           OR define('FOPEN_READ', 'rb');
defined('FOPEN_READ_WRITE')                     OR define('FOPEN_READ_WRITE', 'r+b');
defined('FOPEN_WRITE_CREATE_DESTRUCTIVE')       OR define('FOPEN_WRITE_CREATE_DESTRUCTIVE', 'wb'); // truncates existing file data, use with care
defined('FOPEN_READ_WRITE_CREATE_DESTRUCTIVE')  OR define('FOPEN_READ_WRITE_CREATE_DESTRUCTIVE', 'w+b'); // truncates existing file data, use with care
defined('FOPEN_WRITE_CREATE')                   OR define('FOPEN_WRITE_CREATE', 'ab');
defined('FOPEN_READ_WRITE_CREATE')              OR define('FOPEN_READ_WRITE_CREATE', 'a+b');
defined('FOPEN_WRITE_CREATE_STRICT')            OR define('FOPEN_WRITE_CREATE_STRICT', 'xb');
defined('FOPEN_READ_WRITE_CREATE_STRICT')       OR define('FOPEN_READ_WRITE_CREATE_STRICT', 'x+b');

/*
|--------------------------------------------------------------------------
| Exit Status Codes
|--------------------------------------------------------------------------
|
| Used to indicate the conditions under which the script is exit()ing.
| While there is no universal standard for error codes, there are some
| broad conventions.  Three such conventions are mentioned below, for
| those who wish to make use of them.  The CodeIgniter defaults were
| chosen for the least overlap with these conventions, while still
| leaving room for others to be defined in future versions and user
| applications.
|
| The three main conventions used for determining exit status codes
| are as follows:
|
|    Standard C/C++ Library (stdlibc):
|       http://www.gnu.org/software/libc/manual/html_node/Exit-Status.html
|       (This link also contains other GNU-specific conventions)
|    BSD sysexits.h:
|       http://www.gsp.com/cgi-bin/man.cgi?section=3&topic=sysexits
|    Bash scripting:
|       http://tldp.org/LDP/abs/html/exitcodes.html
|
*/
defined('EXIT_SUCCESS')        OR define('EXIT_SUCCESS', 0); // no errors
defined('EXIT_ERROR')          OR define('EXIT_ERROR', 1); // generic error
defined('EXIT_CONFIG')         OR define('EXIT_CONFIG', 3); // configuration error
defined('EXIT_UNKNOWN_FILE')   OR define('EXIT_UNKNOWN_FILE', 4); // file not found
defined('EXIT_UNKNOWN_CLASS')  OR define('EXIT_UNKNOWN_CLASS', 5); // unknown class
defined('EXIT_UNKNOWN_METHOD') OR define('EXIT_UNKNOWN_METHOD', 6); // unknown class member
defined('EXIT_USER_INPUT')     OR define('EXIT_USER_INPUT', 7); // invalid user input
defined('EXIT_DATABASE')       OR define('EXIT_DATABASE', 8); // database error
defined('EXIT__AUTO_MIN')      OR define('EXIT__AUTO_MIN', 9); // lowest automatically-assigned error code
defined('EXIT__AUTO_MAX')      OR define('EXIT__AUTO_MAX', 125); // highest automatically-assigned error code


define('TIME_ZONE',                             'Asia/Calcutta'); #'Asia/Singapore'

if (defined('TIME_ZONE')) {
    date_default_timezone_set(TIME_ZONE);
    
    /*$now = new DateTime();
    $mins = $now->getOffset() / 60;
    
    $sgn = ($mins < 0 ? -1 : 1);
    $mins = abs($mins);
    $hrs = floor($mins / 60);
    $mins -= $hrs * 60;
    
    define( 'ZONE_DIFF' , sprintf('%+d:%02d', $hrs*$sgn, $mins) );*/
    
}

define('UPLOADS',                               'uploads/');
define('DIR_IMAGES',                     		'assets/images/');
define('NO_IMG',                                'assets/images/layout/noImage.jpeg');
define('PAGE_TITLE_PREFIX',                     'HFI Institute'); // Only for login page.
define('TBL_PREFIX',                            'hfi_');
define('ORD_PREFIX',                            'HFI');

/* Table names */
define('TBL_CNT',                    TBL_PREFIX . 'countries');
define('TBL_INST',                   TBL_PREFIX . 'institution');
define('TBL_CAT',                    TBL_PREFIX . 'category');
define('TBL_BRN',                    TBL_PREFIX . 'branch');
define('TBL_CRS',                    TBL_PREFIX . 'courses');
define('TBL_CRB',                    TBL_PREFIX . 'course_batch');
define('TBL_CBC',                    TBL_PREFIX . 'course_batch_classes');
define('TBL_ORD',                    TBL_PREFIX . 'order');
define('TBL_PRT',                    TBL_PREFIX . 'participants');
define('TBL_PAY',                    TBL_PREFIX . 'payment');
define('TBL_CTU',                    TBL_PREFIX . 'contactus');
define('TBL_LDS',                    TBL_PREFIX . 'leads');
define('TBL_EL',                     TBL_PREFIX . 'email_log');

//Leadsquare Access Id && Secret Key Details   
define('ACCESS_KEY',                            'u$r72d48aea338ffe523b5234d2fa4790ec');
define('SECRET_KEY',                            'c27ef8ea5718e88a479a4f974ae1208dc42e503b');
define('LS_URL',                                'https://api-in21.leadsquared.com/v2/LeadManagement.svc/');

//Region Details
define('REGION', 'in');