<?php

$xml = new DOMDocument;
$xml->load('source.xml');
$xml->xinclude();

$xsl = new DOMDocument;
$xsl->load('source.xsl');

$xslt = new XSLTProcessor;
$xslt->importStylesheet($xsl);

$html = $xslt->transformToDoc($xml);

echo $html->saveXML();