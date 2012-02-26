
module('follow.toxml.js');

	test('XML-utils', function()
	{
		var json = {
			a: 1,
			b: "1",
			c: true,
			d: null,
			e: [1,"two",3,false],
			f: {
				1: 1,
				2: 2
			},
			g: 'end'
		};

		var xmlstr = Follow.utils.json_to_xml( json );
		var xmlstr_root = xmlstr.match(/<model type="object">(?:[\s\S]+)<\/model>/);
		var xmlstr_nodes = xmlstr.match(/<p name="(.*?)" type="(.*?)" path="(.*?)"( value="")?(\/)?>/g);
		ok(
			typeof xmlstr == 'string' &&
			xmlstr_root && 
			xmlstr_nodes && 
			xmlstr_nodes.length == 13
			,
			'Метод Follow.utils.json_to_xml(json, [ctx_chain]) возвращает строковое XML-представление JSON-данных'
		);
		
		var xml = Follow.utils.parse_xml( xmlstr );
		var root = xml.documentElement;
		var elems = root.getElementsByTagName('*');
		ok(
			root.nodeName == 'model' &&
			elems.length == 13 &&
			elems[0].nodeName == 'p' &&
			elems[0].getAttribute('name') == 'a' &&
			elems[0].getAttribute('path') == 'a' &&
			elems[0].getAttribute('type') == 'number' &&
			elems[0].getAttribute('value') == '1'
			,
			'Метод Follow.utils.parse_xml( xmlstr ) формирует верное объектное XML-представление JSON-данных'
		);
	});
	
module('follow.select.js');

	test('CSS-selectors to XPath', function()
	{
		var selector = function(){
			return Follow.utils.css2xpath.apply(this, arguments).xpath;
		};
		
		// simple combinations
		equal(
			selector(':root > *', 'model'),
			'./*'
		);
		equal(
			selector(':root [x="1"]'),
			'.//*[@x = "1"]'
		);
		equal(
			selector('[a = b], :root > [x]'),
			'.//*[@a = "b"] | ./*[@x]'
		);
		equal(
			selector('*'),
			'.//*' 
		);
		equal(
			selector('[value]'),
			'.//*[@value]'
		);
		equal(
			selector('[value = "1"]'), 
			'.//*[@value = "1"]'
		);
		equal(
			selector('[value = 1][type = "number"]'), 
			'.//*[@value = "1" and @type = "number"]'
		);
		equal(
			selector('[name="z"] [name="x"]'), 
			'.//*[@name = "z"]//*[@name = "x"]'
		);
		equal(
			selector('[name="z"] > [name="x"], [name=x] > [name=y] [name=z]'),
			'.//*[@name = "z"]/*[@name = "x"] | .//*[@name = "x"]/*[@name = "y"]//*[@name = "z"]'
		);
		equal(
			selector('*[x = "1"] > [name = test]'),
			'.//*[@x = "1"]/*[@name = "test"]' 
		);
		equal(
			selector('* > *[z= "2"] *[z ="3"] > *'),
			'.//*/*[@z = "2"]//*[@z = "3"]/*' 
		);
	});
	
	
	test('model.select(selector|regexp, [ctx_chain])', function()
	{
		var model = Follow('[model.select]');
		var data = {
			a: 1,
			b: "1",
			c: null,
			d: true,
			e: false,
			f: ['one', 'two', 3, 4, 5],
			g: {
				1: 1,
				two: {},
				3: "1",
				4: ['inner']
			},
			h: "hello world"
		};
		model(data);
		
		equal(
			model.select('*').length, 
			model.sizeof(data, true), 
			'*'
		);
		equal(
			model.select(':root *').length, 
			model.sizeof(data, true), 
			':root *'
		);
		equal(
			model.select(':root > *, [path = g] *').length, 
			model.sizeof(data) + model.sizeof('g', true), 
			':root > *, [name = g] *'
		);

		ok(
			model.select('[value = "1"][type = number]').length == 2, 
			'[value = "1"][type = number]'
		);
		ok(
			model.select('[name = "4"] *, :root > [type = boolean]').length == 3,
			'[name = "4"] *, :root > [type = boolean]'
		);
		
		var stack = model.select('*');
		ok(
			model.gettype(stack) == 'array' &&
			stack.update && 
			stack.remove,
			'Метод возвращает массив найденных объектов с 2-мя дополнительными методами для обновления: update и remove'
		);
		
		ok(
			model.select('*', 'f').length == model.sizeof('f', true) &&
			model.select(':root > *', 'g').length == model.sizeof('g')
			,
			'Вторым аргументом можно задать цепочку в указания контекста поиска'
		);
		
		ok(
			model.select(/^\w+$/).length == model.sizeof() && 
			model.select(/^[a-z]+$/i, 'g')[0].path == 'g.two'
			,
			'В качестве первого аргумента можно использовать регулярное выражение для поиска по цепочкам модели'
		);
	});
	
	
