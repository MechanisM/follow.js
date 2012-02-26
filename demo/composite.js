// Follow.js samples: model.composite

$(function()
{
	var 
		model = Follow('sample'),
		events = {
			update_name: function() {
				model(this.name, this.value);
			}
		};
		
	model.ui = {
		greeting: $('#greeting'),
		name: {
			first: $(':input[name="name.first"]').change( events.update_name ),
			second: $(':input[name="name.second"]').change( events.update_name )
		}
	};
	
	model('name', function(){
		return {
			first: this.ui.name.first.val(),
			second: this.ui.name.second.val()
		}
	});
	
	model.follow('name.full', function( value )
	{
		this.ui.greeting
			.toggle( !!value )
			.text('Hello, '+ value + '!');
	});
	
	model.composite('name.full', function()
	{
		var name = this('name');
		if( name.first && name.second ){
			return [name.first, name.second].join(' ');
		}
	}, true);
});
