/*!
 * Follow.js
 * Convertor JSON to XML.
 */

Follow.utils.json_to_xml = function( json, return_xml_string )
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
		utils = this,
		xml = {
			str: ['<model type="'+ this.type(json) +'">', '', '\n</model>'],
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
			value = ! is_object ? ' value="'+ String(value).replace(regexp.quote, '\\"') +'"/' : '';
		
		_level > level && xml.prop.close(_level);
		_level = level;
		xml.str[1] += offset + xml.prop.open(name, type, chain, value);
	});
	
	_level > 1 && xml.prop.close(_level);
	xml.str = xml.str.join('');
	
	return (
		return_xml_string ? xml.str : this.parse_xml(xml.str)
	);
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
