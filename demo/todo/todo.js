/*!
 * Follow.js
 * Sample: TODO list
 */ 

!window.localStorage && (localStorage = {}); // fallback

// jQuery DOM ready
$(function()
{
	todo.init({
		init: true, // must be first (in this sample)
		list: [],
		completed: 0,
		left: 0
	});
});

// в качестве объекта для хранения данных (JSON) можно указать любой объект JS
// в данном примере мы будем сохранять данные в HTML 5 data storage под свойством "todo"
var todo = Follow('todo', localStorage, true);

todo.follow('init', function()
{
	var model = this;
	
	this.ui = {
		completed: {
			block: $('#todo_completed'),
			count: $('#todo_completed .completed-count'),
			suffix: $('#todo_completed .suffix'),
			clear: $('#todo_completed a.clear')
		},
		left: {
			block: $('#todo_left'),
			count: $('#todo_left .left-count'),
			suffix: $('#todo_left .suffix')
		},
		input: $('#new-entry'),
		list: {
			block: $('#todo_list'),
			elem: function()
			{
				var tmpl = $('#todo_list li').first();
				tmpl.parent().empty(); // clear once
				return tmpl;
			}()
		}
	};
	
	this.ui.list.block
		.delegate(':checkbox', 'click', function( evt )
		{
			var index = $(this).closest('li').index();
			model(['list', index, 'completed'], function( value ){
				return !value;
			});
		})
		.delegate('.delete', 'click', function( evt )
		{
			var index = $(this).closest('li').index();
			model('list').splice(index, 1);
		});
	
	this.ui.completed.clear
		.click(function()
		{
			model.select('list', 'completed[=true]').remove(true);
			return false;
		});

	this.ui.input
		.focus(function() {
			if( this.value == this.defaultValue ){
				this.value = '';
			}
		})
		.blur(function() {
			if( this.value.match(/^\s*$/) ){
				this.value = this.defaultValue;
			}
		})
		.keypress(function( evt )
		{
			if( this.value && evt.which == 13 )
			{
				model('list').unshift({
					title: this.value,
					completed: false
				});
				this.value = '';
			}
		});
	
}, 'once');

// обновляем информационные блоки
todo.follow('completed left', function( value, params )
{
	var info = this.ui[ params.prop ];
	
	info.block.toggle( !!value );
	info.suffix.toggle( !(value == 1) );
	info.count.text( value );
});

// колбэк для первоначальной отрисовки элементов
todo.follow('list', function( items, params )
{
	items.forEach(function( item, index )
	{
		var 
			chain = [params.chain, index].join('.'),
			completed = [chain, 'completed'].join('.');
		this.dispatch(chain);
		this.dispatch(completed);
	}, this);
}, 'once');

// триггер на любое изменение внутри list
todo.follow('list', function( items )
{
	var
		left = this.select('list', 'completed[=false]').length,
		completed = items.length - left;
	this('left', left);
	this('completed', completed);
}, 'sensible');

// триггер на изменения элементов массива, т.е флаг "children" просто шорткат для /list\.\d+/
todo.follow('list', function( item, params )
{
	var 
		items = this.ui.list,
		index = params.match[1];
	if( item )
	{
		var 
			prev = items.block[0].childNodes[index],
			elem = items.elem
				.find('.text').text(item.title).end()
				.clone(true);
		prev 
			? elem.insertBefore(prev) 
			: elem.appendTo(items.block);
		elem.slideDown('fast');
	}
	else {
		items.block
			.find('li:eq('+ index +')')
			.slideUp('fast', function(){
				$(this).remove();
			});
	}
}, 'children');

// отмечаем задачу выполненной (зачеркнутой линией)
todo.follow(/list\.(\d+)\.completed/, function( value, params )
{
	var index = params.match[1];
	this.ui.list.block
		.find('li:eq('+ index +')')
		.find('.text').toggleClass('completed', value).end()
		.find(':checkbox').attr('checked', value);
});


