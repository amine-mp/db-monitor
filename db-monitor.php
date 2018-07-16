<?php
/**
 * Plugin Name: Database Monitor
 * Description: Monitor changes on your database.
 * Version: 1.0.0-beta
 * License: MIT
 */
if (!defined('ABSPATH')) exit;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/Env.php';

use Monitor\Functions as M;
use Monitor\Classes\Env;

/**
 * This is the only global function called from within the plugin
 * functions, which makes it easy to mock it during tests.
 */
function _env() {
  return Env::get();
}

register_activation_hook(__FILE__, M\alias('activate'));
register_deactivation_hook(__FILE__, M\alias('deactivate'));
add_action('wp_ajax_db_monitor', M\alias('api'));
add_action('admin_menu', M\alias('create_menu'));
