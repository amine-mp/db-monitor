<?php
namespace Monitor\Functions;

function home() {
  echo '
    <div id="db-monitor-app"></div>
    <script src="'._env()->config()->appScriptURL.'"></script>
  ';
}
