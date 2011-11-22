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
		},
		params: ['One', 'Two', 'Three']
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

