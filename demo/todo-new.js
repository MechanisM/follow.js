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
		left: 0
	});
	
	var data = todo();
	data.list = todo.map('list', function( item, index, chain ) {
		item.chain = chain;
		return item;
	});
	
	$('.todo').html(
		$('#todo_tmpl').render( data )
	);
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

// follow triggers
todo.follow('left completed', function( value, params )
{
	var elem = this.getElementsByChain(params.chain);
	//alert( elem.get() )
}, 'lazy');

