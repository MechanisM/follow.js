/*!
 * Follow.js
 * Sample: TODO list
 */ 

!window.localStorage && (localStorage = {});

$(function()
{
	// jQuery-part
	var
		$todo = {
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
					tmpl
						.parent().empty().end() // clear once
						.show();
					return tmpl;
				}()
			}
		};
	
	$('#new-entry')
		.focus(function()
		{
			if( this.value == this.defaultValue ){
				this.value = '';
			}
		})
		.blur(function()
		{
			if( this.value.match(/^\s*$/) ){
				this.value = this.defaultValue;
			}
		})
		.keypress(function( evt )
		{
			if( this.value && evt.which == 13 /* Enter */ )
			{
				todo('list').push({
					title: this.value,
					completed: false
				});
				this.value = '';
			}
		});

	// Follow.js-part
	var todo = Follow('todo');
	
	todo.follow('completed left', function( value, params )
	{
		var ui = $todo[ params.prop ];
		ui.block.toggle( !!value );
		ui.suffix.toggle( !(value == 1) );
		ui.count.text( value );
	});

	todo.follow('list', function( item, params )
	{
		// alert( item )
	}, 'children');
	
	todo({
		list: [],
		completed: 0,
		left: 0
	}, true);

});

