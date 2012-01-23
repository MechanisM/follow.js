
// Sample
Follow.module(
{
	model: "user-data",
	chain: "models.top",
	init: function( value, params )
	{
		alert('Hello world!');
		// this == Follow('user-data')
		// value - this('models.top') - собранные данные из XML-а для цепочки "models.top"
		// params - тот же набор параметров, что поступает в model.follow
	}
});
