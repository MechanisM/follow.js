/*!
 * Follow.js
 * Sample: TODO list
 */ 

!window.localStorage && (localStorage = {}); // fallback

// jQyery DOM ready
$(function()
{
	todo({
		init: true, // must be first!
		list: [],
		completed: 0,
		left: 0
	}, true);

});

var todo = Follow('todo');

todo.follow('init', function( value )
{
	var model = this;
	
	this.ui = {
		completed: {
			block: $('#todo_completed'),
			count: $('#todo_completed .completed-count'),
			suffix: $('#todo_completed .suffix')
		},
		left: {
			block: $('#todo_left'),
			count: $('#todo_left .left-count'),
			suffix: $('#todo_left .suffix')
		},
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
	
	$('#todo_list')
		.delegate(':checkbox', 'change', function( evt )
		{
			var 
				state = $(this).prop('checked'),
				item = $(this).closest('li'),
				index = item.index();
			item
				.find('span.text')
				.toggleClass('completed');
			
			model(['list', index, 'completed'], state);
		})
		.delegate('.delete', 'click', function( evt )
		{
			/*var 
				item = $(this).closest('li'),
				index = item.index();
			return false;*/
		});

	$('#new-entry')
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
				model('list').push({
					title: this.value,
					completed: false
				});
				this.value = '';
			}
		});
	
}, 'once');

todo.follow('completed left', function( value, params )
{
	var info = this.ui[ params.prop ];
	
	info.block.toggle( !!value );
	info.suffix.toggle( !(value == 1) );
	info.count.text( value );
});

todo.follow('list', function()
{
	this('left', this.select('list', 'completed[=false]').length);
	this('completed', this.select('list', 'completed[=true]').length);
}, 'sensible');


todo.follow('list', function( item, params )
{
	this.ui.list.elem
		.find('.text')
		.text(item.title)
		.end()
	.clone(true)
	.appendTo( this.ui.list.block )
	.slideDown('fast');
}, 'children');
