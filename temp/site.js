
Follow.module('sample').bind('beforeload', function( model, params ){
	alert(1);
});

Follow.module('sample').bind('ready', function( model, params ){
	alert(2);
});
