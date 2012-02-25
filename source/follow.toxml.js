/*!
 * Follow.js
 * Convertor JSON to XML.
 */

Follow.utils.json_to_xml = function( json, prefix_chain )
{
	if( typeof json == "string" ){
		try {
			json = JSON.parse(json);
		}
		catch(e){
			json = Function('return '+ json)();
		}
	}
	
	var 
		prefix_chain = prefix_chain || '',
		xml_content = ['<model type="'+ this.type(json) +'">', '', '\n', '</model>'];

	if( prefix_chain )
	{
		var branch = Follow('slice', {});
		branch( json );
		json = branch( prefix_chain );
		
		xml_content[0] = '<slice context="'+ prefix_chain +'">';
		xml_content[xml_content.length - 1] = '</slice>';
	}
	
	var 
		utils = this,
		xml = {
			str: xml_content,
			prop: {
				open: function( name, type, chain, value ){
					return '<p name="'+ name +'" type="'+ type +'" path="'+ chain +'"'+ value +'>'
				},
				close: function( level ){
					while( --level > 1 ) xml.str[1] += this.offset( level ) + '</p>';
				},
				offset: function( level ){
					return '\n' + Array( level ).join('\t');
				}
			},
			doc: null
		},
		regexp = {
			level: /\./g,
			quote: /"/g
		};
	
	var _level = 1;
	this.extend(true, {}, json, function( chain, value, name )
	{
		var 
			type = utils.type( value ),
			level = (chain.match(regexp.level) || []).length + 2,
			offset	= xml.prop.offset(level),
			is_object = ['array', 'object'].indexOf( type ) !== -1,
			chain = prefix_chain ? prefix_chain +'.'+ chain : chain;
			
		if( is_object ){
			var empty = true;
			for(var i in value) {
				if( value.hasOwnProperty(i) ) {
					empty = false;
					break;
				}
			}
			value = empty ? '/' : '';
		}
		else {
			value = ' value="'+ String(value).replace(regexp.quote, '&quot;') +'"/';
		}
		
		_level > level && xml.prop.close(_level);
		_level = level;
		xml.str[1] += offset + xml.prop.open(name, type, chain, value);
	});
	
	_level > 1 && xml.prop.close(_level);
	xml.str = xml.str.join('');
	xml.doc = this.parse_xml(xml.str);
	
	return {
		str: xml.str,
		doc: xml.doc,
		toString: function(){ return this.str }
	};
};

Follow.utils.parse_xml = function( text )
{
	if (typeof DOMParser != "undefined") {
		return (new DOMParser()).parseFromString(text, "text/xml");
	}
	else if(document.implementation || typeof ActiveXObject != "undefined")
	{
		var doc;
		try { doc = document.implementation.createDocument(); }
		catch(e){
			doc = new ActiveXObject("MSXML2.DOMDocument");
		}
		doc.loadXML(text);
		return doc;
	}
	else {
		var url = "data:text/xml;charset=utf8," + encodeURIComponent(text);
		var request = new XMLHttpRequest();
		request.open("GET", url, false);
		request.send(null);
		return request.responseXML;
	}
};
