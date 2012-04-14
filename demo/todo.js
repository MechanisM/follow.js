/*!
 * Follow.js
 * Sample: TODO list
 */ 

!window.localStorage && (localStorage = {}); // fallback

var todo = Follow('todo', localStorage, true);

// init
$(function()
{
	todo.init({
		list: [],
		completed: 0,
		left: 0,
		all: 0
	});
	
	// prepare data
	var data = todo();
	data.list = todo.map('list', function( item, index, chain ) {
		item.chain = chain;
		return item;
	});
	
	// render
	$('#todo').html(
		$('#todo_tmpl').render( data )
	);
	
	// bind dom-events
	todo.dispatch('domready');
});

// jsrender custom features
$.views.tags({
	// для генерации follow-аттрибутов
	follow: function(){
		return [
			'data-follow="'+ this.props.chain +'"',
			'data-follow-model="todo"',
			'data-follow-storage="localStorage"'
		].join(' ');
	}
});

// data-triggers
todo.follow('left completed all', function( value, params )
{
	$('#todo_'+ params.chain)
		.find('.suffix').toggle(value > 1).end()
		.toggle( !!value );
}, 'lazy');

todo.follow('list', function( item, params )
{
	var 
		elem, html,
		chain = params.chain;

	// update info
	this.dispatch(chain + '.completed');
	
	// add
	if( item )
	{
		html = $('#todo_tmpl_item').render(
			$.extend({chain: chain}, item)
		);
		$(html)
			.hide()
			.appendTo('#todo_list')
			.slideDown('fast');
	}
	
	// remove
	else {
		elem = this.getElementsByChain(chain);
		elem.slideUp('fast', function(){
			elem.remove();
		});
	}
}, 'children');

todo.follow(/^list\.\d+\.completed$/, function()
{
	var 
		list = this.map('list', function(i){ return i }),
		all = list.length,
		completed = list.filter(function(i){ return i.completed }).length,
		left = all - completed;
	
	this({
		completed: completed,
		left: left,
		all: all
	});
});

// DOM-events
todo.follow('domready', function()
{
	$('#todo')
		// completed
		.delegate('.clear', 'click', function()
		{
			todo.map(
				'list',
				function(item, index, chain){ this.clear(chain) },
				function(item){ return item.completed }
			);
			return false;
		})
		// all
		.delegate('.clear_all', 'click', function()
		{
			confirm('Are you sure want to clear all entries?') &&
			todo.select(/^list\.(\d+)$/).remove();
			return false;
		})
		// one
		.delegate('.delete', 'click', function()
		{
			var 
				item = $(this).closest('li'),
				chain = todo.getChainByElement(item)
			todo.clear(chain);
		})
	
	$('#new-entry')
		.focus(function() {
			this.value == this.defaultValue && (this.value = '');
		})
		.blur(function() {
			this.value.match(/^\s*$/) && (this.value = this.defaultValue);
		})
		.keypress(function( evt )
		{
			var KEY_ENTER = evt.which == 13;
			if( this.value && KEY_ENTER )
			{
				var 
					last = todo.map('list').pop() || {key: 0},
					index = parseInt(last.key) + 1,
					title = this.value;
					
				this.value = ''; // reset of the field
				
				todo('list.' + index, {
					title: title,
					completed: false
				});
			}
		});
}, 'once');

// Custom DOM-sync
Follow.link({
	match: '#todo :checkbox',
	trigger: function( elem, params ){
		elem
			.parent().find('.text')
			.toggleClass('completed', !!params.value)
	}
});

