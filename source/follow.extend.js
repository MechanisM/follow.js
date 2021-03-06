/*!
 * Follow.js
 * A main part of the library.
 */
 
Follow.extend(
{
	follow: function( path, callback, mode )
	{
		var regexp = path instanceof RegExp;
		String(path).trim().split(/\s+/).forEach(function( chain )
		{
			var follower = this.wrap.apply(
				this, [
					regexp ? path : chain,
					callback, 
					mode
				]
			);
			!this.followers[chain] && (this.followers[chain] = []);
			this.followers[chain].push(follower);
		}, this);
		
		return this;
	},
	
	unfollow: function( path, callback )
	{
		String(path).trim().split(/\s+/).forEach(function( path )
		{
			var followers = this.followers[path];
			if( followers )
			{
				if( callback ) {
					this.followers[path] = followers.filter(function( follower ){
						return follower.callback != callback;
					});
				}
				if( !this.followers[path].length || !callback ){
					delete this.followers[path];
				}
			}
		}, this);
		
		return this;
	},
	
	toJSON: function(){ return this.toString.apply(this, arguments) },
	
	clear: function( path, all )
	{
		// handlers
		if( all )
		{
			if( path )
			{
				var depend = this.dependency;
				
				delete this.followers[path];
				delete depend.composite[path];
				
				for(var chain in depend.on)
				{
					depend.on.hasOwnProperty(chain) && 
					(depend.on[chain] = depend.on[chain].filter(function( obj ){
						return obj.chain !== path;
					}));
				}
			}
			else {
				this.followers = {};
				this.dependency = {
					composite: {},
					on: {}
				};
			}
		}
		
		// model
		if( path ) this(path, undefined);
		else {
			delete this.storage[ this.modelName ];
		};
		
		return this;
	},
	
	backup: function( name )
	{
		var data = {
			model: this.toJSON(),
			followers: this.extend(true, {}, this.followers),
			dependency: this.extend(true, {}, this.dependency)
		};
		
		name && (this.backups[name] = data);
		this.backups.push(data);
		
		return this;
	},
	
	restore: function( key )
	{
		var 
			key = key == null ? -1 : key,
			data = typeof key == 'string'
				? this.backups[key]
				: this.backups.slice(key)[0];
		
		data && (
			this.storage[ this.modelName ] = data.model,
			this.followers = data.followers,
			this.dependency = data.dependency
		);
		
		return this;
	},
	
	composite: function( dependent, callback, sensible )
	{
		var 
			depend = this.dependency,
			handler = depend.composite[ dependent ];
		
		if( typeof callback == 'function' )
		{
			this.__hook = function( chain )
			{
				if( chain !== dependent )
				{
					depend.on[chain] = depend.on[chain] || [];
					
					! depend.on[chain].some(function( obj ){
						return obj.chain === dependent;
					}) && 
					depend.on[chain].push({
						chain: dependent,
						sensible: sensible
					});
				}
			};
			
			this.follow(dependent, function( value, params )
			{
				delete this.__hook;
				depend.composite[ dependent ] = function()
				{
					return callback.call(this, {
						chain: params.chain,
						prop: params.prop
					});
				};
			}, 'once');
			
			this(dependent, function( value, params ) {
				return callback.call(this, params);
			});
			
			return this;
		}
		
		// remove dependency
		else if( callback === false )
		{
			for(var chain in depend.on)
			{
				if( depend.on.hasOwnProperty(chain) )
				{
					depend.on[chain] = depend.on[chain].filter(function( obj ){
						return obj.chain !== dependent;
					});
				}
			}
			delete depend.composite[ dependent ];
		}
		
		return handler;
	},
	
	tracking: function( chain )
	{
		for(var path in this.dependency.on)
		{
			this.dependency.on.hasOwnProperty(path) &&
			this.dependency.on[path].forEach(function( dependent )
			{
				var 
					cond = [
						chain === path, 
						chain.indexOf( path + '.' ) === 0
					],
					matched = dependent.sensible
						? cond.some(function( expr ){ return expr })
						: cond.shift(),
					callback = this.dependency.composite[ dependent.chain ];
				
				matched && 
				callback && 
				chain !== dependent.chain && 
				this(dependent.chain, callback.call(this));
				
			}, this);
		}
	},
	
	dispatch: function( chain, data, filter )
	{
		this(chain, function( value )
		{
			var
				filter_is = {
					number: typeof filter == 'number',
					func: typeof filter == 'function'
				},
				args = [].slice.call(arguments),
				params = this.extend(true, args, function( model, data )
				{
					if( data[0] !== undefined )
					{
						var 
							val = data.shift(),
							branch = model.constructor('params', {}),
							path = chain.indexOf('.') == -1
								? chain
								: chain.split('.').slice(1).join('.');
						
						branch(data.shift() || {});
						branch('value', val);
						branch('parent.'+ path, val);
						
						return [val, branch()];
					}
					
					return data;
				}( this, data || [] ));
			
			this.broadcast(chain, params, function( follower, index )
			{
				if( filter != null ){
					if( filter_is.number && filter == index ) return true;
					if( filter_is.func && filter == follower.callback ) return true;
				}
				else return true;
			});
			
			return value;
		});
		
		return this;
	},
	
	broadcast: function( chain, data, filter )
	{
		var 
			followers = this.followers,
			params = data[1] || {},
			sync = this.constructor.sync;
		
		sync && sync.call(this, {
			chain: chain,
			value: data[0]
		});
		
		for(var p in followers)
		{
			followers.hasOwnProperty(p) &&
			followers[p]
				.filter(filter || function(){ return true })
				.forEach(function( follower )
				{
					var path = follower.path;
					(path == chain || (
						path instanceof RegExp && (params.match = chain.match(path))
					)) && (
						follower.callback.apply(this, data),
						delete params.match
					)
				}, this)
		};
	},
	
	wrap: function( path, callback, mode )
	{
		var wrapper = this.wrappers;
		return wrapper[mode] 
			? wrapper[mode].apply(this, arguments) 
			: {
				path: path,
				callback: callback
			};
	},
	
	merge: function( data )
	{
		var 
			model = this,
			branch = this.constructor('data', {
				data: this.serialize(data)
			});
		
		this.extend(true, {}, data, function( chain ) {
			var value = branch(chain);
			(typeof value != 'object' || value === null) && model(chain, value);
		});
		
		return this;
	},
	
	sizeof: function( chain, deep )
	{
		var 
			deep = chain === true || deep,
			data = typeof chain == 'object'
				? chain
				: chain && chain !== true ? this(chain) : this(),
			size = 0,
			args = [deep, {}, data, function(){ size++ }];
		
		!deep && args.shift();
		this.extend.apply(this, args);
		
		return size;
	},
	
	map: function( chain, callback, filter )
	{
		var 
			value 
				= typeof chain != 'object' 
				? arguments.length ? this(chain) : this()
				: chain,
			type = this.constructor.utils.type(value),
			is_object = ['array', 'object'].indexOf(type) !== -1,
			result = [];

		if( is_object )
		{
			for(var key in value)
				if( value.hasOwnProperty(key) )
				{
					var 
						item = value[key],
						path = [chain, key].join('.'),
						args = [item, key, path, value],
						add = function(){ result.push(callback.apply(this, args)) }.bind(this);
					
					if( callback ){
						!filter && add();
						filter && filter.apply(this, args) && add();
					}
					else {
						result.push({
							key: key,
							value: item
						});
					}
				}
		}
		else {
			result.push(value);
		}
		return result;
	}
});

