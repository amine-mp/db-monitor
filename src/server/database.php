<?php
namespace Monitor\Functions;

use Tarsana\Functional as F;

function db_set_settings($data) {
  $data = F\Stream::of($data)
    ->toPairs()
    ->filter(function($pair) {
      return !empty((array) $pair[1]);
    })
    ->fromPairs()
    ->result();
  _env()->wp('update_option', 'db_monitor_settings', json_encode($data));
}

function db_get_settings() {
  return json_decode(_env()->wp('get_option', 'db_monitor_settings', "{}"));
}

function db_remove_settings() {
  _env()->wp('delete_option', 'db_monitor_settings');
}

function db_has_log_table() {
  return F\contains(_env()->config()->changesTable, all_table_names());
}

function db_table_names() {
  $changesTable = _env()->config()->changesTable;
  return F\filter(function($name) use($changesTable) {
    return $name !== $changesTable;
  }, all_table_names());
}

function db_tables() {
  return F\Stream::of(db_table_names())     //=> ['foo', 'bar', ...]
    ->map(function($name) {                 //=> [
      return [                              //     {name: 'foo', fields: ['foo_field1', ...]},
        'name' => $name,                    //     {name: 'bar', fields: ['bar_field1', ...]},
        'fields' => table_cols($name)       //     ...,
      ];                                    //   ]
    })
    ->result();
}


function db_create_log_table() {
  require_once(_env()->config()->upgradePath);
  $name = _env()->config()->changesTable;
  return _env()->wp('dbDelta', "CREATE TABLE IF NOT EXISTS {$name}(
    id INT auto_increment primary key,
    table_name varchar(200),
    action varchar(50),
    data text,
    at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );");
}

function db_remove_log_table() {
  $changesTable = _env()->config()->changesTable;
  _env()->db()->query("DROP TABLE IF EXISTS {$changesTable}");
}

function db_create_triggers() {
  $queries = F\Stream::of(db_get_settings())  //=> {foo: {fieldA: true, fieldB: true}, ...}
    ->toPairs()                           //=> [['foo', {fieldA: true, fieldB: true}], ...]
    ->chain(function($pair) {
      $name = F\head($pair);
      $fields = F\keys(F\get(1, $pair));
      if (count($fields) == 0)
        return [];
      return [
        get_insert_trigger($name, $fields),
        get_update_trigger($name, $fields)
      ];
    })
    ->result();
  foreach ($queries as $query) {
    _env()->db()->query($query);
  }
}

function db_remove_triggers() {
  $prefix = _env()->config()->triggersPrefix;
  $queries = F\Stream::of(all_table_names())
    ->chain(function($name) use($prefix) {
      return [
        "DROP TRIGGER IF EXISTS `{$prefix}_{$name}_i`",
        "DROP TRIGGER IF EXISTS `{$prefix}_{$name}_u`"
      ];
    })
    ->result();
  foreach ($queries as $query) {
    _env()->db()->query($query);
  }
}

function db_get_changes($params) {
  $rows = _env()->db()->get_results("SELECT * " . get_changes_query($params));
  foreach ($rows as &$row) {
    $row->data = decode_data($row->data);
  }
  return $rows;
}

function db_get_changes_pages($params) {
  $pageSize = _env()->config()->pageSize;
  $query = "SELECT COUNT(*) as count " . get_changes_query($params, 'count');
  $result = _env()->db()->get_results($query);
  $count = (int) $result[0]->count;
  return (int) ($count / $pageSize) + ($count % $pageSize == 0 ? 0 : 1);
}

function escape_items($items) {
  return F\map(function($item) {
    return "'"._env()->wp('esc_sql', $item)."'";
  }, $items);
}

function get_changes_query($params, $stmnt = 'select') {
  $config = _env()->config();
  $pageSize = $config->pageSize;
  $changesTable = $config->changesTable;

  if (empty($params->tables))
    $params->tables = array_keys((array) db_get_settings());
  if (empty($params->actions))
    $params->actions = ['INSERT', 'UPDATE'];

  $where = [
    "action IN (" . F\join(',', escape_items($params->actions)) . ")",
    "table_name IN (" . F\join(',', escape_items($params->tables)) . ")"
  ];
  $where = 'WHERE ' . F\join(' AND ', $where);

  if ($stmnt != 'select')
    return "FROM {$changesTable} {$where}";

  $limit = "LIMIT " . (($params->page - 1) * $pageSize) . "," . $pageSize;

  return "FROM {$changesTable} {$where} ORDER BY `at` DESC {$limit}";
}

function db_remove_change($id) {
  $changesTable = _env()->config()->changesTable;
  return _env()->db()->query("DELETE FROM {$changesTable} WHERE id={$id}");
}

function db_remove_changes($params) {
  return _env()->db()->query("DELETE ". get_changes_query($params, 'delete'));
}

function decode_data($data) {
  $separator = _env()->config()->dataSeparator;
  return F\Stream::of($data)
    ->split($separator)
    ->remove(-1)
    ->slices(2)
    ->fromPairs()
    ->result();
}

function table_cols($name) {
  return _env()->db()->get_col("describe {$name}", 0);
}

function all_table_names() {
  return _env()->db()->get_col("show tables", 0);
}

function get_insert_trigger($table, $fields) {
  $config = _env()->config();
  $changesTable = $config->changesTable;
  $prefix = $config->triggersPrefix;
  $data = get_data_value($fields);
  return "
    CREATE TRIGGER {$prefix}_{$table}_i
    AFTER INSERT ON {$table}
    FOR EACH ROW BEGIN
      INSERT INTO {$changesTable}(action, table_name, data)
      VALUES('INSERT', '${table}', {$data});
    END
  ";
}

function get_update_trigger($table, $fields) {
  $config = _env()->config();
  $changesTable = $config->changesTable;
  $prefix = $config->triggersPrefix;
  $data = get_data_value($fields);
  return "
    CREATE TRIGGER {$prefix}_{$table}_u
    AFTER UPDATE ON {$table}
    FOR EACH ROW BEGIN
      INSERT INTO {$changesTable}(action, table_name, data)
      VALUES('UPDATE', '${table}', {$data});
    END
  ";
}

function get_data_value($fields) {
  $separator = _env()->config()->dataSeparator;
  return F\Stream::of($fields)
    ->map(function($field) use($separator) {
      return "'{$field}{$separator}', COALESCE(new.{$field}, ''), '{$separator}'";
    })
    ->join(', ')
    ->prepend('CONCAT(')
    ->append(')')
    ->result();
}
