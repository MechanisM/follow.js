/*!
 * Follow.js
 * Convertor JSON to XML.
 */
// Sample:
//
//	{
//		a: 1,
//		b: "2",
//		c: null,
//		d: true,
//		e: [
//			"first", 
//			2, 
//			"third"
//		],
//		f: {
//			1: {1:1, 2:2},
//			2: "test"
//		}
//	}
//	
//	<model type="object">
//		<p name="a" type="number" value="1" path="a"/>
//		<p name="b" type="string" value="2" path="b"/>
//		<p name="c" type="null" value="null" path="c"/>
//		<p name="d" type="boolean" value="true" path="d"/>
//		<p name="e" type="array" path="e">
//			<p name="0" type="string" value="first" path="e.0"/>
//			<p name="1" type="number" value="2" path="e.1"/>
//			<p name="2" type="string" value="third" path="e.2"/>
//		</p>
//		<p name="f" type="object" path="f">
//			<p name="1" type="object" path="f.1">
//				<p name="1" type="number" value="1" path="f.1.1"/>
//				<p name="2" type="number" value="2" path="f.1.2"/>
//			</p>
//			<p name="2" type="string" value="test" path="f.2"/>
//		</p>
//	</model>

Follow.JSON_to_XML = function( json, return_xml_string )
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
		type = this.utils.type,
		xml = {
			str: ['<model type="'+ type(json) +'">', '', '\n</model>'],
			doc: null
		},
		regexp = {
			level: /\./g,
			quote: /"/g
		};
	
	var level = 1;
	this.utils.extend(true, {}, json, function( chain, value, name )
	{
		var 
			_type = type( value ),
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
	
	//alert( xml.str.join('') )
};


Follow.JSON_to_XML(
{
    a: 1,
    b: "2",
    c: null,
    d: true,
    e: [
        "first", 
        2, 
        "third"
    ],
    f: {
        1: {1:1, 2:2},
        2: "test"
    },
	g: 'last value'
});


