#!/bin/bash

rm db-monitor.zip
rm -rf db-monitor
mkdir -p db-monitor/src
wget https://getcomposer.org/composer.phar
php composer.phar install
npm i
npm run compile
cp -R db-monitor.php Env.php index.php vendor public db-monitor
cp -R src/server db-monitor/src

zip -r db-monitor.zip db-monitor
rm composer.phar
rm -rf db-monitor
