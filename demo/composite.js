// Follow.js: model.composite

$(function()
{
	var model = Follow();
	
	model.importDataFromDOM();
	
	model.follow('fullName', function( name )
	{
		var greetings = name ? ('Hello, '+ name + '!') : '';
		this('greetings', greetings);
	})
	
	model.composite('fullName', function()
	{
		var name = this('name');
		if( name.first && name.second ){
			return [name.first, name.second].join(' ');
		}
	}, true);
});
