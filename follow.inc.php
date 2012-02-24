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
	'follow.hooks.js',
	'follow.wrappers.js',
	
	'follow.toxml.js',
	'follow.select.js',
	
	'addons/follow.collector.js'
);

foreach( $files as $file ){
	readfile($path . $file);
}
