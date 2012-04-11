// Sample

Follow.link({
	match: '#world input',
	trigger: function( elem, value, apply_defaults ) {
		elem.css('border', '1px solid red');
		apply_defaults();
		//return false; // to prevent handling for the next links
	}
});

Follow.link({
	match: '#world > *',
	trigger: function( elem ) {
		elem.css('color', 'red');
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