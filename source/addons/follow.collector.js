/*!
 * Follow.js
 * A simple unpacker for raw-data of "follow.collector.xsl"
 * Dependencies: jQuery or yepnope.js for loading external JS-files
 */

(function( window )
{
	function loader( files, callback )
	{
		var files = [].concat(files);
		
		if( window.yepnope ) {
			yepnope({
				load: files,
				complete: callback
			});
		}
		else if( window.jQuery )
		{
			files = files.map(function( file ) {
				return $.ajax({
					url: file,
					dataType: 'script'
				});
			});
			$.when.apply(this, files).then(callback);
		}
		// fallback (maybe not works in IE)
		else {
			files.forEach(function( file ){
				document.write('<script type="text/javascript" src="'+ file +'"></script>');
			});
			callback();
		}
	}
	
	Follow.load = function( models, path )
	{
		var modules = [];
		
		// insert data to the models
		models.forEach(function(M)
		{
			var 
				model = Follow(M.name, M.storage),
				module = M.module;
			
			if( module ) {
				this.modules = this.modules || {};
				this.modules[ module.name ] = module;
				module._model = model;
				module._params = path;
				modules.push(module);
			}
			
			M.chains.forEach(function(C) {
				model(C.chain, C.json);
			});
		}, this);
		
		// loading modules & externals
		modules.forEach(function( module )
		{
			var inject = function() {
				var filepath = (module.path || module._params.modules) + module.name + '.js';
				loader(filepath);
			};
			
			// check dependencies on chains for the module
			if( module.depends )
			{
				var model = module._model;
				module.depends.trim().split(' ').every(function( chain )
				{
					var 
						data = model(chain),
						type = model.gettype(data);
					return (
						type == 'array' || type == 'object'
						? model.sizeof(data)
						: type == 'number'
							? String(data)
							: data
					);
				})
				&& inject();
			}
			else {
				inject();
			}
		});
	};
    
    Follow.module = function( conf )
    {
		var 
			module = this.modules[ conf.name ],
			depends_on = conf.depends,
			init = function()
			{
				if( conf.init( module._model, module._params ) === conf ){
					this.modules[ conf.name ]._inited = true;
				}
			}.bind(this);
		
		if( depends_on )
		{
			if( depends_on.modules )
			{
				var modules = depends_on.modules
					.trim().split(' ')
					.filter(function( name ){
						return !( this.modules[name] && this.modules[name]._inited );
					}, this);
				
				if( modules.length )
				{
					window.console && console.error( 
						'Module "'+ module.name +'" initialization error: module(s) "'
						+ modules.join(', ')
						+ '" was not loaded or their init-method not returns this-object.'
					);
					return false;
				}
			}
			
			if( depends_on.external )
			{
				var external = depends_on.external
					.trim().split(' ')
					.map(function( filename ){
						return module._params.external + filename + '.js';
					});
				
				loader(external, init)
			}
			else init();
		}
		else init();
    };
}( this ));
