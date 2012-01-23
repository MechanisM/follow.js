<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	
    xmlns:js="https://github.com/extensible/follow.js"
    xmlns:exsl="http://exslt.org/common"
    xmlns:dyn="http://exslt.org/dynamic"
    xmlns:func="http://exslt.org/functions"
    extension-element-prefixes="func"
    
    xmlns:mx="https://market.yandex.ru/xmlns"
    xmlns:x="http://www.yandex.ru/xscript"
    xmlns:ya="urn:yandex-functions"
    
    exclude-result-prefixes="js exsl dyn func mx x ya"
>

<xsl:template name="follow.js">
    <xsl:param name="name"/>
    <xsl:param name="modules">/js/modules/</xsl:param>
    
    <script type="text/javascript">
        <xsl:choose>
        	<xsl:when test="$name">
                <xsl:apply-templates select="/*//js:model[@name = $name]">
                	<xsl:with-param name="modules_path" select="$modules" />
        		</xsl:apply-templates>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates select="/*//js:model">
                	<xsl:with-param name="modules_path" select="$modules" />
                </xsl:apply-templates>
            </xsl:otherwise>
        </xsl:choose>
    </script>
</xsl:template>

<xsl:template match="js:model">
    <xsl:param name="modules_path"/>
    
    <xsl:variable name="context" select="@context" />
    <xsl:variable name="name">
        <xsl:if test="@name">
            <xsl:value-of select="concat('&quot;', @name, '&quot;')"/>
        </xsl:if>
    </xsl:variable>
    <xsl:variable name="storage">
        <xsl:if test="@storage">
            <xsl:value-of select="concat(', ', @storage)"/>
        </xsl:if>
    </xsl:variable>
    
    <xsl:value-of select="concat('Follow(', $name, $storage, ').load([')" />
    
    <xsl:for-each select="js:*[@chain]">
        <xsl:apply-templates select=".">
            <xsl:with-param name="context" select="$context" />
        </xsl:apply-templates>
        <xsl:value-of select="js:comma()" />
    </xsl:for-each>
    
    <xsl:text>], {</xsl:text>
        "modules_path": "<xsl:value-of select="$modules_path"/>",
        "model_args": "<xsl:value-of select="js:escape(concat($name, $storage))"/>"
    <xsl:text>});</xsl:text>
</xsl:template>

<!-- TOP-level items: map, obj -->
<xsl:template match="js:model/js:*[ @chain ]">
    <xsl:param name="context"/>
    
    <xsl:variable name="name" select="local-name()" />
    <xsl:variable name="self"><xsl:copy-of select="*" /></xsl:variable>
    <xsl:variable name="tmpl" select="exsl:node-set($self)"/>
    <xsl:variable name="path" select="concat($context, js:addslash(@context))"/>
    <xsl:variable name="node" select="dyn:evaluate($path)"/>
    <xsl:text>{</xsl:text>
    	
        <xsl:text>"chain": "</xsl:text>
        <xsl:value-of select="@chain"/>
        <xsl:text>",</xsl:text>
        
        <xsl:text>"json":</xsl:text>
        <xsl:if test="$name = 'obj'">{</xsl:if>
        <xsl:if test="$name = 'map'">[</xsl:if>
        	
            <xsl:for-each select="$node">
                <xsl:choose>
                	<xsl:when test="$name = 'obj'">
                    	<xsl:for-each select="$tmpl/js:prop">
                        
                            <xsl:apply-templates select=".">
                                <xsl:with-param name="node" select="$node"/>
                                <xsl:with-param name="parent" select="$name"/>
                            </xsl:apply-templates>
                            <xsl:value-of select="js:comma()"/>
                            
                        </xsl:for-each>
                    </xsl:when>
                    
                    <xsl:otherwise>
                        <xsl:apply-templates select="$tmpl/*">
                            <xsl:with-param name="node" select="."/>
                            <xsl:with-param name="parent" select="$name"/>
                        </xsl:apply-templates>
                    </xsl:otherwise>
                </xsl:choose>
                
                <xsl:value-of select="js:comma()"/>
            </xsl:for-each>

        <xsl:if test="$name = 'obj'">}</xsl:if>
        <xsl:if test="$name = 'map'">]</xsl:if>
            
        <xsl:if test="@module">
        	<xsl:text>, "module": "</xsl:text>
        	<xsl:value-of select="@module" />
        	<xsl:text>"</xsl:text>
        </xsl:if>
        
    <xsl:text>}</xsl:text>
</xsl:template>

<!-- Third-level data structures -->
<xsl:template match="js:obj | js:map">
	<xsl:param name="node"/>
    <xsl:variable name="context" select="@context" />
    <xsl:variable name="name" select="local-name()" />
    
    <xsl:if test="$name = 'obj'">{</xsl:if>
    <xsl:if test="$name = 'map'">[</xsl:if>
    
    <xsl:for-each select="js:prop">
        <xsl:variable name="prop" select="." />
        <xsl:choose>
            <xsl:when test="$context">
                <xsl:for-each select="$node">
                    <xsl:variable name="node" select="dyn:evaluate($context)" />
                    <xsl:apply-templates select="$prop">
                        <xsl:with-param name="node" select="$node" />
                    </xsl:apply-templates>
                </xsl:for-each>
            </xsl:when>
            
            <xsl:otherwise>
                <xsl:apply-templates select="$prop">
                    <xsl:with-param name="node" select="$node" />
                </xsl:apply-templates>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:value-of select="js:comma()" />
    </xsl:for-each>

    <xsl:if test="$name = 'obj'">}</xsl:if>
    <xsl:if test="$name = 'map'">]</xsl:if>
</xsl:template>

<xsl:template match="js:prop">
	<xsl:param name="node"/>
	<xsl:param name="parent" select="local-name(..)"/>
    
	<xsl:variable name="prop" select="."/>
	<xsl:variable name="type" select="@type"/>
    <xsl:variable name="value">
    	<!-- getting context -->
    	<xsl:for-each select="$node">
        	
            <!-- simple types -->
        	<xsl:if test="$prop/@value">
            	<xsl:variable name="value" select="dyn:evaluate($prop/@value)" />
                <xsl:choose>
                    <xsl:when test="$type = 'number'">
                        <xsl:value-of select="number($value)" />
                    </xsl:when>
                    <xsl:when test="$type = 'boolean'">
                        <xsl:value-of select="boolean($value)" />
                    </xsl:when>
                    <xsl:otherwise>
                    	<xsl:text>"</xsl:text>
                    	<xsl:value-of select="js:escape($value)" />
                    	<xsl:text>"</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
        	
            <!-- inner objects and arrays -->
        	<xsl:if test="count($prop/*) > 0 and not($prop/@value)">
            	<xsl:apply-templates select="$prop/js:*">
                    <xsl:with-param name="node" select="$node" />
                </xsl:apply-templates>
            </xsl:if>
        
        </xsl:for-each>
    </xsl:variable>
    
    <xsl:if test="$parent = 'obj'">
        <xsl:text>"</xsl:text>
        <xsl:value-of select="@name" />
        <xsl:text>": </xsl:text>
    </xsl:if>
    <xsl:value-of select="$value" />
</xsl:template>

<!-- Custom functions -->
<func:function name="js:addslash">
	<xsl:param name="path"/>
    <func:result>
    	<xsl:if test="not(starts-with($path, '/')) and $path != ''">/</xsl:if>
    	<xsl:value-of select="$path" />
    </func:result>
</func:function>

<func:function name="js:comma">
    <func:result>
    	<xsl:if test="position() != last()">, </xsl:if>
    </func:result>
</func:function>

<func:function name="js:escape">
	<xsl:param name="text"/>
    <func:result>
    	<xsl:value-of select="js:replace(
        	'&quot;', '\&quot;', js:replace(
            	'&#10;', '\&#10;', string($text)
            )
        )"/>
    </func:result>
</func:function>

<func:function name="js:replace">
	<xsl:param name="search"/>
	<xsl:param name="replace"/>
	<xsl:param name="subject"/>
    <func:result>
        <xsl:choose>
            <xsl:when test="contains($subject, $search)">
                <xsl:variable name="b" select="substring-before($subject, $search)" />
                <xsl:variable name="a" select="js:replace($search, $replace, substring-after($subject, $search))" />
                <xsl:value-of select="concat($b, $replace, $a)" />
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$subject" />
            </xsl:otherwise>
        </xsl:choose>
    </func:result>
</func:function>

</xsl:stylesheet>