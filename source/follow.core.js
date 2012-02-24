/*!
 * Follow.js
 * Core of the library.
 */
 
(function( undefined )
{
	var 
		models = {},
		instances = {};
	
	function Follow( modelName, storage, make_clean )
	{
		var 
			storage = storage || models,
			modelName = modelName || 'default',
			json = storage[modelName],
			instance = instances[modelName];
		
		// we can restore default-json through "model.init", when we need
		make_clean && (storage[modelName] = '');
		
		if( instance && storage == instance.storage ){
			return instance.model;
		}
		
		var observable = function( chain, value, mode )
		{
			var 
				__ = observable,
				args = array(arguments),
				model = JSON.parse(__.toJSON()),
				chain = chain instanceof Array ? chain.join('.') : chain,
				path = typeof chain == 'object' ? {} : String(chain).split('.'),
				prop, parent = model,
				mode = {
					if_not_defined: mode == 'safe',
					is_forced: mode == 'force'
				};
			
			function getter()
			{
				while( prop = path.shift() )
				{
					if( prop && parent[prop] !== undefined ){
						parent = parent[prop];
					}
					else {
						parent = null;
						break;
					}
				}
				
				var type = gettype(parent);
				if( __.__get[type] ){
					parent = __.get[type].apply(__, [parent, args]);
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
							not_defined = current === undefined,
							params = {
								chain: chain,
								prop: prop,
								parent: parent
							},
							new_value = typeof value == 'function' 
								? value.apply(__, [
									typeof current != 'object' ? current : __.clone(current),
									extend({ value: current }, params)
								])
								: value,
							type = gettype(value),
							deleting = new_value === undefined;
						
						// preparation for different types
						__.__set[type] && (new_value = __.__set[type].apply(__, [new_value, args]));
						
						// conditions
						( !mode.if_not_defined || not_defined ) &&
						(( deleting && !not_defined ) || !deleting) &&
						(
							( __.toJSON(chain) !== serialize(new_value) ) ||
							( new_value === null && not_defined ) || 
							( mode.is_forced )
						) &&
						
						// actions
						function()
						{
							(new_value === undefined && parent instanceof Array)
								? parent.splice(prop, 1)
								: (parent[prop] = new_value);
							
							storage[modelName] = serialize( model );
							
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
							
						}();
					}
					else {
						!parent[prop] && (parent[prop] = {});
						parent = parent[prop];
					}
				}
			}
			
			// apply hook, if exists (it needs for dependent observable)
			__.__hook && __.__hook.apply(__, args);

			// behavior
			if( typeof chain == 'object' ){
				for(var i in chain){
					chain.hasOwnProperty(i) && __(i, chain[i], args[1]);
				}
				return __;
			}
			else if( args.length == 1 ) {
				return getter();
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
			
			followers: {},
			dependency: {
				composite: {},
				on: {}
			},
			backups: [],
			wrappers: [],
			
			__set: {},
			__get: {},
			
			extend: extend,
			serialize: serialize,
			clone: clone,
			gettype: gettype,
			
			init: function( defaults ) {
				this(json ? JSON.parse(json) : defaults || {});
				return this;
			},
			
			toString: function( path )
			{
				return path
					? serialize( this(path) )
					: storage[modelName] || '{}';
			}
		}, Follow.prototype);
		
		instances[modelName] = {
			model: observable,
			storage: storage
		};
		
		return observable;
	}

	function serialize( obj ){ return JSON.stringify( obj, null, "\t") }
	function array( obj ){ return [].slice.call(obj) }
	function clone( obj ){ return JSON.parse( JSON.stringify(obj) ); }
	function gettype( obj )
	{
		if( obj === null ) return 'null';
		else if( obj === undefined ) return 'undefined';
		else if( isNaN(obj) && obj.toString() == 'NaN' ) return 'NaN';
		else return String(
			(Object.prototype.toString.call( obj ).match(/\[object (\w+)\]/) || [])[1]
		).toLowerCase();
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
						current = source[i],
						value = obj[i],
						is_empty = current == null,
						simple = ['array', 'object'].indexOf(gettype(value)) == -1,
						copycat = [true, source[i], value]
						;
					
					if( callback ) {
						var path = chain ? chain +'.'+ i : String(i);
						callback(path, value, i);
						copycat.push(callback, path)
					}
					
					if( simple || !is_deep ) source[i] = value;
					else if( is_deep )
					{
						if( is_empty || typeof current != 'object' ){
							copycat[1] = value instanceof Array ? [] : {};
							source[i] = extend.apply(this, copycat);
						}
						else {
							extend.apply(this, copycat)
						}
					}
				}
			}
		});
		
		return source;
	}

	Follow.utils = {
		extend: extend,
		serialize: serialize,
		clone: clone,
		type: gettype,
		array: array
	};
	
	Follow.extend = function() {
		extend.apply(this, [true].concat(this.prototype, array(arguments)));
	};
	
	// export to the global scope
	this.Follow = Follow;
}());

