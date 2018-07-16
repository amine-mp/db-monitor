<?php
namespace Monitor\Classes;

class Env {

  protected static $instance;

  public static function get() {
    if (!self::$instance)
      self::$instance = new self;
    return self::$instance;
  }

  public function wp($name) {
    $args = func_get_args();
    $name = array_shift($args);
    return call_user_func_array($name, $args);
  }

  public function db() {
    global $wpdb;
    return $wpdb;
  }

  public function req() {
    return $_POST;
  }

  public function json($data) {
    echo json_encode($data);
    wp_die();
  }

  public function html($text) {
    echo $text;
  }

  public function config() {
    return (object) [
      'upgradePath' => ABSPATH . 'wp-admin/includes/upgrade.php',
      'appScriptURL' => plugins_url('/public/app.js', __FILE__),
      'pageSize' => 50,
      'dataSeparator' => '=@+@=',
      'changesTable' => $this->db()->prefix . 'db_monitor_changes',
      'triggersPrefix' => 'dbmt'
    ];
  }

}
