// Sample

Follow.link({
	match: '#world input',
	trigger: function( elem, params ) {
		elem.css('border', '1px solid red');
		params.applyDefault();
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
	var model = Follow();
	model({
		'hello.world': 'New value',
		test: ['test', 1],
		text: {
			one: 1,
			2: 'two'
		}
	});
	
	// export all sub-chains
	model.exportDataToDOM('text');
	
	var test = Follow('test');
	test('hello.world', Math.random())
});