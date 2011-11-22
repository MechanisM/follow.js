/*!
 * Follow.js - small javascript library for tracking dependencies
 * A main part of the library.
 */
 
Follow.extend(
{
	follow: function( path, callback, mode )
	{
		var follower = this.wrap.apply(this, arguments);
		
		String(path).trim().split(/\s+/).forEach(function( path )
		{
			!this.followers[path] && (this.followers[path] = []);
			this.followers[path].push(follower);
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
					(index = depend.on[chain].indexOf(path)) > -1 &&
					depend.on[chain].splice(index, 1);
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
		else this.model(null);
		
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
			this.model(JSON.parse(data.model)),
			this.followers = data.followers,
			this.dependency = data.dependency
		);
		
		return this;
	},
	
	composite: function( dependent, callback )
	{
		var 
			self = this,
			depend = this.dependency,
			handler = depend.composite[ dependent ];
		
		if( typeof callback == 'function' )
		{
			callback.call(function(chain)
			{
				depend.on[chain] = depend.on[chain] || [];
				depend.on[chain].indexOf(dependent) == -1 && depend.on[chain].push(dependent);
				return self.apply(null, arguments);
			});
			
			this(dependent, function( value, params )
			{
				return (depend.composite[ dependent ] = function(){
					return callback.call(self, params);
				})();
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
					var index = depend.on[chain].indexOf( dependent );
					depend.on[chain].splice(index, 1);
				}
			}
			delete depend.composite[ dependent ];
		}
		
		return handler;
	},
	
	tracking: function( chain )
	{
		(this.dependency.on[chain] || []).forEach(function( dependent ) {
			this(dependent, this.dependency.composite[dependent]());
		}, this);
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
			
			value !== undefined &&
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
		var followers = this.followers;
		
		for(var p in followers)
		{
			followers.hasOwnProperty(p) &&
			followers[p]
				.filter(filter || function(){ return true })
				.forEach(function( follower )
				{
					var path = follower.path;
					(path == chain || (
						path instanceof RegExp && chain.match(path)
					)) &&
					follower.callback.apply(this, data);
				}, this)
		};
	},
	
	wrap: function( path, callback, mode )
	{
		var 
			wrapper = this.extend({}, this.wrappers, 
			{
				'once': function()
				{
					return {
						path: path,
						callback: function __(){
							callback.apply(this, arguments);
							this.unfollow(path, __);
						}
					}
				},
				'sensible': function( path )
				{
					var 
						chain = path,
						path = path.replace(/[\[\]\(\)\.\*\+\\\{\}\^\$]/g, '\\$&');
					return {
						path: RegExp('^('+ path +'|'+ path +'\\..*)$', 'i'),
						callback: function()
						{
							this(chain, function( value, params )
							{
								callback.apply(this, arguments);
								return value;
							});
						}
					}
				}
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

