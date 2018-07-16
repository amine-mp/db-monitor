<?php
namespace Monitor\Functions;

function api() {
  $req = _env()->req();
  if (empty($req['method']))
    return _env()->json(['error' => "No method specified!"]);

  $handler = alias($req['method']);
  if (!function_exists($handler))
    return _env()->json(['error' => "Unknown method {$req['method']}"]);

  $data = [];
  if (!empty($req['data']))
    $data = json_decode(stripcslashes($req['data']));

  return _env()->json($handler($data));
}

function set_settings($data) {
  db_set_settings($data);
  db_remove_triggers();
  db_create_triggers();
  return ['done' => true];
}

function get_settings($data) {
  return db_get_settings();
}

function get_tables($data) {
  return db_tables();
}

function get_table_names($data) {
  return db_table_names();
}

function get_changes($data) {
  return db_get_changes($data);
}

function get_changes_pages($data) {
  return db_get_changes_pages($data);
}

function remove_change($data) {
  if (empty($data->id))
    return ['error' => 'An id is required here!'];
  return db_remove_change((int) $data->id);
}

function remove_changes($data) {
  return db_remove_changes($data);
}
