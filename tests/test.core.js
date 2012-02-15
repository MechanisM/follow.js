
module('follow.core.js');

	test('Common', function()
	{
		equal(
			Follow().modelName, 'default', 
			'Название модели по-умолчанию Follow().modelName'
		);
		
		var model = Follow( Math.random() );
		var data = {a: Math.random()};
		model(data);
		ok(
			JSON.parse(model.storage[ model.modelName ]).a === data.a
			,
			'Модель хранится в объекте-хранилище в виде JSON и доступна через свойство этого объекта по названию модели'
		);
		
		var storage = {};
		ok(
			Follow() 				=== Follow() && 
			Follow('one') 			=== Follow('one') &&
			Follow('two', storage) 	=== Follow('two', storage) &&
			Follow(Math.random()) 	!== Follow(Math.random()) &&
			Follow('three', {}) 	!== Follow('three', {})
			,
			'Вызов конструктора Follow с одинаковыми аргументами должен возвращать всегда одинаковый экзепляр объекта модели'
		);
		
		var storage = {x: Math.random()};
		ok(
			Follow('name', storage).storage === storage
			,
			'Ссылка на объект, где хранится JSON-модели всегда доступна через Follow().storage'
		);
	});
	
	test('model.serialize(obj)', function()
	{
		var model = Follow();
		var data = {x: 1, y: Math.random()};
		model(data);
		
		ok(
			model.toString() == model.serialize(data)
			,
			'Метод model.serialize сериализует простой JS-объект при помощи JSON.stringify в соответствии с отступами, использующимися при хранении модели'
		);
	});
	
	test('model.extend([deep], object, source1[, source2, sourceN])', function()
	{
		var 
			model = Follow(),
			x = {
				a: 1,
				b: [2,3],
				c: { 'four': 4 } // object
			},
			y = {
				d: 'test',
				b: ['two'],
				c: ['hello'] // array
			},
			clone = {
				one: model.clone(x),
				two: model.clone(x)
			};
		
		clone.one.d = y.d;
		clone.one.b = y.b;
		clone.one.c = y.c;
		equal(
			model.serialize( model.extend({}, x, y) ),
			model.serialize( clone.one )
			,
			'Метод model.extend, по аналогии с jQuery.extend, копирует значения свойств и ссылки у свойств верхнего уровня'
		);
		
		clone.two.d = y.d;
		clone.two.b[0] = y.b[0];
		clone.two.c[0] = y.c[0]; // тип объекта (от x.c) имеет больший приоритет, т.к копирование идет по цепочке {} -< x -< y
		equal(
			model.serialize( model.extend(true, {}, x, y) ),
			model.serialize( clone.two )
			,
			'Аргумент deep=true создает "глубокое" копирование свойств из одного объекта в другой'
		);
	});
	
	test('model.clone(obj)', function()
	{
		var data = {x: Math.random(), y: 'Hello world', z: [1,2,3]};
		var model = Follow();
		var clone = model.clone(data);
		ok(
			data !== clone &&
			model.serialize(data) == model.serialize(clone)
			,
			'Метод model.clone всего лишь обертка из JSON.stringify + JSON.parse'
		);
	});
	
	test('model.init([defaults])', function()
	{
		var storage = { model: '{"x": 1, "y": '+ Math.random() +'}' };
		var model = Follow('model', storage, true);
		
		ok(model.toString() == '{}', 'При вызове конструктора Follow с третьим аргументом clean=true JSON модели равен {}');
		
		model.init();
		
		ok(
			model.serialize(JSON.parse(storage.model)) == model.toString()
			,
			'При вызове model.init восстанавливает данные модели (если они уже хранились в storage[modelName]'
		);
	});
	
	test('model.toString([path])', function()
	{
		var model = Follow();
		var data = {
			title: 'Just great!',
			numbers: [1, "2", Math.random(), null]
		};
		model(data);
		
		ok(
			model == model.toString() && 
			model !== model.toString() &&
			model == model.storage['default']
			,
			'Метод model.toString() с вызовом без аргументов возвращает строковое представление модели, хранящееся в Follow().storage'
		);
		
		equal(
			model.toString('numbers'),
			model.serialize(data.numbers)
			,
			'Первым аргументом [path] можно задать путь в модели (через dot-notation) и получить соответствующее строковое представление её части'
		);
		
		equal(
			model.toString('unknown.path'),
			'null'
			,
			'Сериализации пути, который не существует в модели должен быть равен строке "null"'
		);
	});
	
	test('Get/Set API', function()
	{
	});
	
