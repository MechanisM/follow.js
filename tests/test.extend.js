
module('follow.extend.js');

	test('model.follow(chain, callback, [mode])', function()
	{
		var model = Follow('[model.follow]');
		var temp = {};
		model({
			   name: {
					  first: "John",
					  last: "Smith",
					  other: {
						  mother: "Alisa Smith", 
						  father: "Garold Smith"
					}
			   },
			   hobbies: ["Computer Games", "Extreme Sports", "Fishing"],
			   greeting: "Hello world!"
		});
		
		var times = 0;
		model.follow('name.first', function( value, params )
		{
			times++;
			if( times == 1 )
			{
				ok(
					this === model,
					'Ключевое слово this внутри колбэка ссылается на объект модели'
				);
				ok(
					value === "Alex",
					'Получение нового значения цепочки первым аргументом value'
				);
				ok(
					typeof params == 'object',
					'Второй аргумент params - объект'
				);
				ok(
					params.value.current === "Alex" &&
					params.value.prev === "John" &&
					params.chain == "name.first" &&
					params.prop == "first" &&
					model.serialize( params.parent ) == model.toString('name') &&
					params.parent.last == "Smith"
					,
					'В объекте params передаются корректные значения'
				);
			}
		}, 'once');
		
		model('name.first', 'Alex');
		model('name.first', 'Melony');
		model('name.first', 'Helen');
		ok(
			times == 1,
			'Третий аргумент mode в значении "once" работает корректно'
		);
		
		
		var name = [];
		model.follow('name hobbies', function( value, params )
		{
			params.chain == 'name.first' && name.unshift(value);
			params.chain == 'name.last' && name.push(value);
			params.chain == 'hobbies.0' && ok(
				value === "Reading", 
				'Передача нескольких цепочек в первом аргументе, разделенных пробелом, работает корректно'
			);
		}, 'children');
		
		model('hobbies.0', 'Reading');
		model('name.first', "John");
		model('name.last', "Lord");
		
		equal(
			name.join(" "),
			model('name.first') +" "+ model('name.last')
			,
			'Отслеживание изменений прямых потомков работает корректно (mode=children)'
		);
		
		model('test', {
			one: 1,
			two: 2,
			three: 3
		});
		model.follow('test.one', function() {
			ok(false, "Попытка обновления значения цепочки в модели тем-же значением");
		}, 'once');
		model('test.one', 1);

		model.follow('test.two', function() {
			ok(true, "Изменение значение цепочки с одинаковым строковым значением, но разным типом");
		}, 'once');
		model('test.two', "2");

		model.follow('test.three', function() {
			ok(true, "Использование третьего аргумента mode=force при присвоении нового значения, позволяет оповещать слушателей даже тогда, когда значение цепочки не изменилось");
		}, 'once');
		model('test.three', 3, 'force');
		
		
		var sensible = 0;
		model.follow('name', function( value, params )
		{
			sensible++;
			if( sensible == 1 )
			{
				ok(
					model.serialize(value) == model.toString('name') &&
					params.chain == 'name' && 
					params.prop == 'name' &&
					model('name.other.blabla') === 123
					,
					'Третий аргумент mode=sensible отслеживает изменения себя и всех потомков, при этом выполняет колбэки в контексте своей цепочки'
				);
			}
		}, 'sensible');
		
		model('name.other.blabla', 123);
		model('name', undefined);
		ok(
			sensible == 2 &&
			model('name') === null
			,
			'Третий аргумент mode=sensible работает корректно'
		);
		
		
		model.follow(/^test\.(\d+)\.(\w+)$/i, function( value, params )
		{
			ok(
				value === "world" &&
				params.chain == 'test.1.hello' &&
				params.prop == 'hello'
				,
				'В качестве первого аргумента chain можно использовать регулярные выражения для отслеживания множества цепочек'
			);
			ok(
				params.match[0] == params.chain &&
				params.match[1] == 1 &&
				params.match[2] == "hello"
				,
				'При использовании регулярных выражений с круглыми скобками, можно "отловить" части цепочки в params.match'
			);
		});
		model('test.1.hello', 'world');
		
		ok(
			model.follow('test', function(){}) === model,
			'Метод должен возвращать ссылку на объект модели, возвращаемый классом Follow'
		);
		
		var test = [];
		model
			.follow('xxx', function(v){ test.push(2) })
			.follow('xxx', function(v){ test.push(1) })
			;
		model('xxx', 'test');
		ok(
			test[0] === 2 && test[1] === 1,
			'Последовательность срабатывания колбэков работает корректно'
		);
	});
	
	
	test('model.unfollow(chain, [callback])', function()
	{
		var model = Follow('[model.unfollow]');
		var callback = function( value ){ test.push(value) };
		var callback2 = function( value ){ test.push(value + value) };
		var callback3 = function( value ){ test2.push(value) };
		var test = [];
		var test2 = [];
		var matcher = /x\.\d+/;
		
		model
			.follow('my.data hello', callback)
			.follow('hello', callback)
			.follow('my.data', callback2)
			.follow(matcher, callback3)
			;
		
		model.unfollow('hello');
		model('hello', 'test');
		ok(
			test.length == 0,
			'Удаление всех колбэков для указанной цепочки работает корректно'
		);
		
		model.unfollow('my.data', callback);
		model('my.data', 10);
		ok(
			test[0] === 20 
			&& test.length == 1
			,
			'Выборочное удаление коллбэков работает корректно'
		);
		
		model('x.1', 1);
		model.unfollow('/x\\.\\d+/');
		model('x.1', 2);
		
		ok(
			test2[0] === 1 &&
			test2.length == 1
			,
			'Чтобы удалить слушателей для множества цепочек, указанного в виде регулярного выражения, необходимо передать аналогичное выражение или строку первым аргументом'
		);

		ok(
			model.unfollow('my.chain') === model,
			'Метод должен возвращать ссылку на объект модели, возвращаемый классом Follow'
		);
	});
	
	
	test('model.toJSON([chain])', function()
	{
		var model = Follow('[model.toJSON]');
		model({
			x: Math.random(),
			y: [1, 2, "3", null, {z: true}, false, ['test']]
		});
		
		ok(
			model.toString() == model.toJSON() &&
			model.toString('y') == model.toJSON('y')
			,
			'Метод model.toJSON является алиасом для model.toString, следовательно, поведение этих методов должно быть идентично'
		);
	});
	
	
	test('model.dispatch(chain, [data], [filter])', function()
	{
		var model = Follow('[model.dispatch]');
		var test = [];
		var callbacks = {
			1: function(){ test.push('one') },
			2: function(){ test.push('two') }
		};
		
		model({ 
			x: ['one', 'two', 3],
			y: 'test'
		});
		
		model
			.follow('x.0', function( value, params )
			{
				ok(
					value === 'one' &&
					params.chain === 'x.0' && 
					params.prop === '0' &&
					this.serialize(params.parent) == this.toJSON('x')
					,
					'Ручной вызов колбэков без перегрузки параметров работает корректно'
				);
			})
			.dispatch('x.0');
		
		model
			.follow('x.1', function( value, params )
			{
				ok(
					value === 'test' &&
					params.chain === 'test' && 
					params.prop === '1' &&
					params.parent[1] === 'test'
					,
					'Ручной вызов слушателей с перегрузкой параметров работает корректно'
				);
			})
			.dispatch('x.1', ['test', {chain: 'test'}]);
		
		
		model
			.follow('y', callbacks[1])
			.follow('y', callbacks[2]);
		
		model.dispatch('y', [], 3); // callback with index "3" not exists
		model.dispatch('y', [], 1); // second callback, gives "two"
		model.dispatch('y', [], callbacks[1]);
		model.dispatch('y');
		
		ok(
			test.join(' ') == 'two one one two',
			'Возможность фильтрации колбэков по ссылкам на колбэки или порядковым индексам работает корректно'
		);

		ok(
			model.dispatch('my.chain') === model,
			'Метод должен возвращать ссылку на объект модели, возвращаемый классом Follow'
		);
	});
	
	
	test('model.composite(chain, callback, [sensible])', function()
	{
		var model = Follow('[model.composite]');
		model({
			name: {
				first: 'Alex',
				last: 'Wilson'
			}
		});
		
		var times = 0;
		model.composite('fullName', function( params ) {
			times++;
			return this('name.first') +" "+ this('name.last');
		});
		
		model('name.first', 'Joe');
		model('name.last', 'Black');
		
		ok(
			times === 3 &&
			model('fullName') == 'Joe Black'
			,
			'Простые составные свойства модели обновляются корректно, при изменении зависимых частей'
		);
		
		model.composite('fullName', false);
		model('name.first', 'Alice');
		ok(
			model('fullName') == 'Joe Black' &&
			model('name.first') == 'Alice'
			,
			'Удаление отслеживания зависимостей для составных цепочек модели работает корректно'
		);
		
		model('numbers', [1,2,3]);
		model.composite('summ', function()
		{
			var 
				summ = 0,
				numbers = this('numbers') || [];
			numbers.forEach(function( num ){ summ += num });
			return summ;
		}, true);
		
		model('numbers.3', 4);
		ok(
			model('summ') === 10,
			'Сложные составные свойства с использованием третьего аргумента sensible=true, работают корректно'
		);

		ok(
			model.composite('my.chain', function(){ return 'test' }) === model,
			'Метод должен возвращать ссылку на объект модели, возвращаемый классом Follow'
		);
	});


