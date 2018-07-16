<?php
namespace Monitor\Functions;

function activate() {
  db_create_log_table();
  if (!db_get_settings())
    db_set_settings((object)[]);
  db_create_triggers();
}

function deactivate() {
  db_remove_triggers();
}

function uninstall() {
  db_remove_triggers();
  db_remove_settings();
  db_remove_log_table();
}

function create_menu() {
  _env()->wp('add_menu_page',
    'Database Monitor', 'Database Monitor',
    'manage_options', 'database_monitor',
    alias('home'), 'dashicons-visibility'
  );
}
