/*!
 * Follow.js
 * Sample: TODO list
 */ 

!window.localStorage && (localStorage = {}); // fallback

$(function()
{
	/*$('.todo').html(
		$('#todo_tmpl').render({})
	);*/
});

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