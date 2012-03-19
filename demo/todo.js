/*!
 * Follow.js
 * Sample: TODO list
 */ 

!window.localStorage && (localStorage = {}); // fallback

// jQuery DOM ready
$(function()
{
	todo
		.init({
			init: true, // must be first (in this sample)
			list: [],
			completed: 0,
			left: 0
		})
		.dispatch('list');
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
			}(),
			clear: $('#todo_all a.clear_all')
		}
	};
	
	this.ui.list.block
		.delegate(':checkbox', 'click', function( evt )
		{
			var value = $(this).is(':checked');
			var chain = $(this).closest('li').attr('data-follow');
			model
				.select(/completed/, chain)
				.update( value );
		})
		.delegate('.delete', 'click', function( evt )
		{
			var chain = $(this).closest('li').attr('data-follow');
			model.clear(chain);
		});
	
	this.ui.list.clear.click(function()
	{
		confirm('Are you sure want to clear all entries?') &&
		model.select(/^list\.(\d+)$/).remove();
		return false;
	});
	
	this.ui.completed.clear
		.click(function()
		{
			model.map('list', function( item, index, chain ){
				item.completed && model.clear(chain);
			})
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
				var 
					last = model.map('list').pop() || {key: 0},
					index = Number(last.key) + 1,
					title = this.value;
					
				this.value = '';
				// add new one
				model('list.' + index, {
					title: title,
					completed: false
				});
			}
		});
}, 'once');

// колбэк для первоначальной отрисовки элементов
todo.follow('list', function( items, params )
{
	this.map(params.chain, function( item, index, chain )
	{
		this.dispatch( chain ); // добавление объектов в DOM
		this.dispatch( chain +'.completed' ); // отмечаем выполненные задачи
	});

	this.follow('list', function( items )
	{
		var
			left = this.select('[name=completed][value=false]', 'list').length,
			completed = this.sizeof(items) - left;

		// hide "clear-all" if no items
		this.ui.list.clear
			.parent()
			.toggle( !(!left && !completed) );
		
		this({
			left: left,
			completed: completed
		});
	}, 'sensible');
}, 'once');

// добавляем/удаляем элементы из документа
todo.follow('list', function( item, params )
{
	var 
		items = this.ui.list,
		chain = params.chain,
		is_new = ! params.value.prev;

	// add 
	if( item && is_new )
	{
		var 
		elem = items.elem
			.clone(true)
			.attr('data-follow', chain)
			.find('.text').text( item.title ).end()
			.appendTo(items.block)
			.delay(10)
			.slideDown('fast');
		
		// extra ability (just for fun)
		typeof make == 'object' && make
			.editable(elem, params)
			.sortable(elem);
	}
	
	// remove
	else if( !item ) {
		items.block
			.find('[data-follow = "'+ chain +'"]')
			.slideUp('fast', function(){
				$(this).remove();
			});
	}
}, 'children');

// обновляем информационные блоки
todo.follow('completed left', function( value, params )
{
	var info = this.ui[ params.prop ];
	
	info.block.toggle( !!value );
	info.suffix.toggle( !(value == 1) );
	info.count.text( value );
});

// отмечаем задачу выполненной (зачеркнутой линией)
todo.follow(/^(list\.\d+)\.completed$/, function( value, params )
{
	var chain = params.match[1];
	this.ui.list.block
		.find('[data-follow = "'+ chain +'"]')
		.find('.text').toggleClass('completed', value).end()
		.find(':checkbox').attr('checked', value);
});


// usability stuff
var make = {
	editable: function( elem )
	{
		var text = elem.find('.text');

		text[0].contentEditable = true;
		text
			.blur(function( evt ) {
				todo(
					elem.attr('data-follow') + '.title',
					text.text()
				);
			})
			.keypress(function( evt )
			 {
				var code = evt.which || evt.keyCode;
				if( code == 13 /* Enter */ )
				{
					var next = elem[ evt.shiftKey ? 'prev' : 'next' ]();
					text.blur();
					next.find('.text').focus();
					evt.preventDefault();
				}
			});
		
		return this;
	},
	
	sortable: function( elem )
	{
		var data = function( elem ){
			return {
				elem: elem,
				text: elem.find('.text'),
				chain: elem.attr('data-follow')
			}
		};
		
		elem.find('.text').keydown(function( evt )
		{
			var 
				code = evt.which || evt.keyCode,
				key = {
					ctrl: evt.ctrlKey && code != 17,
					arrow: {
						up: code == 38,
						down: code == 40
					}
				};
			
			if( key.ctrl )
			{
				var 
					current 	= data( elem ),
					prev 		= data( elem.prev() ),
					next 		= data( elem.next() ),
					up 			= key.arrow.up && prev.elem.length,
					down 		= key.arrow.down && next.elem.length,
					chain 		= up ? prev.chain : next.chain,
					target 		= up ? prev.elem : next.elem,
					action 		= up ? 'insertBefore' : 'insertAfter',
					replacement = {};
				
				if( up || down )
				{
					evt.preventDefault();
					
					replacement[ current.chain ] = todo(chain);
					replacement[ chain ] = todo(current.chain);
					
					current.elem[ action ]( target );
					current.elem.attr('data-follow', chain);
					target.attr('data-follow', current.chain);
					todo(replacement);
					
					current.text.focus();
				}
			}
		});
	}
};
