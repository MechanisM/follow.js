/*!
 * Follow.js
 * Core of the library.
 */
 
(function()
{
	var models = {};
	
	function Follow( modelName, storage )
	{
		var 
			storage = storage || models,
			modelName = modelName || 'default';
		
		var observable = function( chain, value, if_not_defined )
		{
			var 
				__ = observable,
				args = array(arguments),
				model = JSON.parse(__.toJSON()),
				chain = chain instanceof Array ? chain.join('.') : chain,
				path = typeof chain == 'object' ? {} : String(chain).split('.'),
				prop, parent = model;
			
			function getter()
			{
				while( prop = path.shift() )
				{
					if( prop && parent[prop] !== undefined ){
						parent = parent[prop];
					}
					else return null;
				}
				return parent;
			}
		
			function setter()
			{
				while( prop = path.shift() )
				{
					if( path.length == 0 )
					{
						var 
							current = parent[prop],
							params = {
								chain: chain,
								prop: prop,
								parent: parent,
								model: model
							},
							new_value = typeof value == 'function' 
								? value.apply(__, 
								[
									typeof current != 'object' 
										? current 
										: __.clone(current),
									extend({ value: current }, params)
								])
								: value;
						
						if( __.toJSON(chain) != __.stringify(new_value) )
						{
							if( !if_not_defined || current === undefined )
							{
								parent[prop] = new_value;
								storage[modelName] = __.stringify( model );
								
								__.tracking(chain);
								__.broadcast(chain, [
									new_value,
									extend({
										value: {
											prev: current,
											current: new_value
										}
									}, params)
								]);
							}
						}
					}
					else {
						!parent[prop] && (parent[prop] = {});
						parent = parent[prop];
					}
				}
			}
			
			// apply hook, if exists
			__.__hook && __.__hook.apply(__, args);

			// behavior
			if( typeof chain == 'object' ){
				for(var i in chain){
					chain.hasOwnProperty(i) && __(i, chain[i], args[1]);
				}
			}
			else if( args.length == 1 ) {
				return __.__get(getter(), args);
			}
			else if( args.length >= 2 ) {
				setter();
				return __;
			}
			
			return model;
		};
		
		extend(observable, 
		{
			constructor: Follow,
			
			modelName: modelName,
			storage: storage,
			extend: extend,
			
			followers: {},
			dependency: {
				composite: {},
				on: {}
			},
			backups: [],
			wrappers: [],
			
			__hook: null,
			__get: function( value ){ return value },
			clone: function( obj ){
				return JSON.parse( this.stringify(obj) );
			},
			stringify: function( obj, replacer, space ){
				return JSON.stringify( obj, replacer, space || '\t' );
			},
			toString: function( path )
			{
				return path
					? this.stringify( observable(path) )
					: storage[modelName] || '{}';
			}
		}, Follow.prototype);
		
		return observable;
	}
	
	function array( obj ){
		return [].slice.call(obj);
	}
	function extend( deep, source )
	{
		var 
			args = array(arguments),
			is_deep = deep === true && args.shift(),
			source = args.shift(),
			last = function(){ return args[args.length - 1] },
			callback, chain;
		
		typeof last() == 'string' && (chain = args.pop());
		typeof last() == 'function' && (callback = args.pop());
		
		args.forEach(function( obj )
		{
			for(var i in obj)
			{
				if( obj.hasOwnProperty(i) )
				{
					var 
						struct = null, 
						prop = obj[i];
					is_deep && typeof prop == 'object' && prop !== null && (
						struct = 
							prop.constructor == Array ? [] :
							prop.constructor == Object ? {} :
						''
					);

					var path, params = [true, struct, source[i], prop];
					callback && (
						path = chain ? chain +'.'+ i : String(i),
						callback(path),
						params.push(callback, path)
					);
					
					source[i] = struct 
						? extend.apply(this, params)
						: prop;
				}
			}
		});
		
		return source;
	}
	
	Follow.extend = function() {
		extend.apply(null, [true].concat(this.prototype, array(arguments)));
	};
	
	// export to global
	window.Follow = Follow;
}());

