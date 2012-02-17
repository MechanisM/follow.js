
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
			model = Follow('[model.extend]'),
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
		var model = Follow('[model.clone]');
		var data = {x: Math.random(), y: 'Hello world', z: [1,2,3]};
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
		var storage = { "model_json": '{"x": 1, "y": '+ Math.random() +'}' };
		var model = Follow("model_json", storage, true);
		
		ok(model.toString() == '{}', 'При вызове конструктора Follow с третьим аргументом clean=true JSON модели равен {}');
		
		model.init();
		
		equal(
			model.toString(),
			storage["model_json"]
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
	
	test('Getter API: model(), model("chain"), model(["parts", "of", "path"])', function()
	{
		var model = Follow('Getter API');
		var data = {
			x: 1,
			y: Math.random(),
			z: null,
			tree: {one: {two: 2}}
		};
		model(data);
		
		equal(
			model.serialize( model() ),
			model.serialize( data )
			,
			'Текущее представление модели в виде объекта (JSON.parse) можно получить при вызове объекта модели без аргументов, т.е model()'
		);
		
		ok(
			model('unknown.path.in.model') === null &&
			model('x') === data.x &&
			model('y') === data.y &&
			model('z') === data.z
			,
			'Попытка получить несуществующую цепочку в модели должна возвращать значение null'
		);
		
		ok(
			model() != model() &&
			model.serialize( model() ) == model.serialize( model() )
			,
			'Объект модели, возвращаемый при помощи model() всегда возвращает новый объект, созданный на основе JSON-а модели'
		);
		
		ok(
			model(['tree', 'one', 'two']) === data.tree.one.two
			,
			'Если передать в качестве первого аргумента не строку, а массив со строками (частями пути), то в последствии части будут склеены через .join(".")'
		);
	});
	
	test('Setter API: model("chain", value|callback, "mode"), model(object, "mode")', function()
	{
		var model = Follow('Setter API');
		var obj = { x: 0, y: 0 };
		var arr = [Math.random(), 1, "2", true, false, null, {zzz: 'Yo!'}, ['Hello world']];
		var data = { hello: Math.random(), world: obj, test: 'hello world' };
		var test = "just a string";
		
		model('num', 1);
		model('obj', obj);
		model('arr', arr);
		model('bool', true);
		model('null', null);
		
		ok(
			model('num') === 1 &&
			model('bool') === true &&
			model('null') === null && 
			model.toString('obj') == model.serialize(obj) &&
			model.toString('arr') == model.serialize(arr) && 
			model == model.serialize({num: 1, obj: obj, arr: arr, bool: true, "null": null}) // важен порядок, как при сохранении в модель
			,
			'Проверка на присваивание значений разных типов при помощи model("chain", value)'
		);
		
		model('test', test)
		model(data, 'safe');
		ok(
			model('hello') === data.hello &&
			model.toString('world') === model.serialize(data.world) &&
			model('test') === test // old value was not affected
			,
			'Передача объекта со списком свойств заменяет несколько вызовов model("chain", value), при этом третий аргумент mode смещается на вторую позицию'
		);
		
		model('obj.x', function( value, params )
		{
			ok(
				this == model &&
				value == params.value && // для простых типов
				params.prop == 'x' &&
				params.chain == 'obj.x' &&
				model.serialize(params.parent) == model.toString('obj') &&
				model.serialize(value) == model.toString(params.chain)
				,
				'При использовании callback-функции в качестве значения цепочки в модели, первым аргументом внутри неё будет текущее значение цепочки, второй аргумент - набор параметров'
			);
			return Math.random();
		});
		
		model('hello', undefined);
		ok(
			model('hello') === null &&
			model().hello === undefined
			,
			'Удалить цепочку из модели можно путем присвоения ей значения undefined'
		);
	});






