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
				var index, depend = this.dependency;
				
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
				params = this.extend(true, args, data);
			
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
			params = data[1] || {};
		
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
		var 
			regexp = function( wrapper, self_context )
			{
				return function( path )
				{
					var 
						chain = path,
						path = path.replace(/[\[\]\(\)\.\*\+\\\{\}\^\$]/g, '\\$&');
					return {
						path: wrapper.call(this, path),
						callback: function()
						{
							self_context
								? callback.apply(this, arguments)
								: this(chain, function( value, params )
								{
									callback.apply(this, arguments);
									return value;
								});
						}
					}
				}
			},
			wrapper = this.extend({}, this.wrappers, 
			{
				'once': function( path, callback )
				{
					var handler = function(){
						callback.apply(this, arguments);
						this.unfollow(path, handler);
					};
					return {
						path: path,
						callback: handler
					}
				},
				
				// descendants or self + always own context
				'sensible': regexp(function( path ){
					return RegExp('^('+ path +'|'+ path +'\\..*)$');
				}),
				
				'children': regexp(function( path ){
					return RegExp('^'+ path +'\.([^\.]+)$');
				}, true)
			});
		
		return wrapper[mode] 
			? wrapper[mode].apply(this, arguments) 
			: {
				path: path,
				callback: callback
			};
	},
	
	merge: function( model )
	{
		var 
			branch = this.constructor('merge'),
			chains = [];
		
		branch(model);
		this.extend(true, {}, model, function( chain ){
			chains.push(chain);
		});
		
		chains.forEach(function( chain )
		{
			var value = branch(chain);
			typeof value != 'object' && this(chain, value);
		}, this);
		branch.clear();
		
		return this;
	}
});
