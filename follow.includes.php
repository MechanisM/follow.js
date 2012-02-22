<?php

header('Cache-Control: must-revalidate');
header('Pragma: no-cache');
header('Content-type: text/javascript');

$path = dirname(__FILE__). '/source/';

$files = array(
	'external/json2.js',
	'follow.ecma.js',
	'follow.core.js',
	'follow.extend.js',
	'follow.wrappers.js',
	'follow.wrappers.js',
	
	'follow.mapper.js',
	'follow.helper.js',
	
	'addons/follow.collector.js'
);

foreach( $files as $file ){
	readfile($path . $file);
}