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
			doc: null
		},
		regexp = {
			level: /\./g,
			quote: /"/g
		};
	
	var level = 1;
	this.extend(true, {}, json, function( chain, value, name )
	{
		var 
			_type = utils.type( value ),
			_level = (chain.match(regexp.level) || []).length + 2,
			_offset	= '\n' + Array( _level ).join('\t'),
			is_object = ['array', 'object'].indexOf( _type ) !== -1,
			value = ! is_object ? ' value="'+ String(value).replace(regexp.quote, '\\"') +'"/' : '',
			property = {
				opentag: '<p name="'+ name +'" type="'+ _type +'" path="'+ chain +'"'+ value +'>',
				closetag: '</p>'
			};
		
		if( level > _level ) xml.str[1] += _offset + property.closetag;
		xml.str[1] += _offset + property.opentag;
		level = _level;
	});
	
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
