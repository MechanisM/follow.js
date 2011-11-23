// Follow.js (demo, tests, etc.)

try {
	var model = Follow();
	
	// model sample
	model({
		lang: {
			from: 'en',
			to: 'it'
		},
		name: {
			first: 'John',
			last: 'Norum'
		},
		user: {
			css: 'color: red;',
			theme: 'Default',
			custom: {
				one: 1,
				two: 2
			}
		}
	});
	
	var path = /lang\..*/;
	model.follow(path, function( value, params ) {
		alert( [value, params.chain, this.toJSON(params.chain)].join('\n') );
	});
	
	model.composite('fullName', function( params ){
		return this('name.first') +' '+ this('name.last');
	});
	
	model.follow('fullName', function( name ){
		alert(name);
	});
	
	model.follow('user', function( value, params ){
		alert( [value, this.toJSON(params.chain), params.chain, params.prop, params.parent.user].join('\n') );
	}, 'sensible');

	model('collection', [
		{x: 1, y: 1, color: 'blue', b: true},
		{x: 0, y: 2, color: 'red', b: "true", test: [1,0,2]},
		{x: 1, y: 3, color: 'red'},
		{x: 0, y: 4, values: [0,1]},
		{z: 1, y: 5, children: {count: 3, list: ['one', 'two', 'three']}, x: null }
	]);
	
	alert([
		model.map('collection', "x[=y] || z"),					// [object Object],[object Object]
		model.map('collection', "x[=values.0]"),				// [object Object]
		model.map('collection', "y[>=3] && children", 'y'),		// 5
		model.map('collection', "x[=1]", 'color') 				// blue,red
	].join('\n'));

	document.onclick = function()
	{
		//model('user.test', Math.random());
		//model('name.first', 'Zeta');
		//alert( model );

		model.merge({
			user: {
				rand: Math.random()
			},
			lang: {
				local: 'ru'
			},
			test: 'Bla bla'
		});
		
		/*model
			('lang.local', 'ru')
			.unfollow(path)
			('lang.from', 'af')
			;*/
	}
}
catch(e){
	alert(e)
}

