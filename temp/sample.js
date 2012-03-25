
Follow.module(
{
	name: "sample",
	
	depends: {
		modules: '',
		external: 'jsrender'
	},
	
	init: function( model, params )
	{
		alert( model );
		return this; // need to mark this module as "inited"
	}
});
