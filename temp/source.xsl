<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:import href="../source/addons/follow.collector.xsl"/>

<xsl:output 
	method="xml" encoding="utf-8" indent="yes"
    doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"
    doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"
	/>

<xsl:template match="/">
	<html>
    	<head>
        	<script type="text/javascript" src="../demo/common/jquery.min.js"></script>
        	<script type="text/javascript" src="../follow.inc.php"></script>
        	<!-- <script type="text/javascript" src="site.js"></script> -->
    	</head>
	    <body>
            <p>A main content of the page</p>
            <xsl:call-template name="follow"/>
            <!-- debug -->
            <xmp style="word-wrap:break-word; width:80%">
                <xsl:call-template name="follow"/>
            </xmp>
	    </body>
	</html>
</xsl:template>

<xsl:template name="follow">
    <xsl:call-template name="follow.js">
        <xsl:with-param name="modules">/follow.js/temp/</xsl:with-param>
        <xsl:with-param name="external">/follow.js/source/external/</xsl:with-param>
    </xsl:call-template>
</xsl:template>

</xsl:stylesheet>