// Sample

Follow.link({
	location: '#world',
	trigger: function( elem, value )
	{
		elem
			.val(value)
			.css('border', '1px solid red');
		return false;
	}
});

$(function()
{
	var test = Follow();
	test({
		'hello.world': 'New value',
		test: ['test', 1]
	});
});

window.ondblclick = function(){
	alert(Follow())
}