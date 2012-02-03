/*!
 * Follow.js
 * A simple unpacker for raw-data of "follow.collector.xsl"
 * Dependencies: jQuery or yepnope.js for loading external JS-files
 */

(function($, window)
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
		models.forEach(function(M)
		{
			var 
				model = Follow(M.name, M.storage),
				externals = M.dependency,
				is_module = M.isModule;
			
			// save extra data for init-module
			Follow.module.params = Follow.module.params || {};
			Follow.module.params[ model.modelName ] = path;
			
			// insert data to the model
			M.chains.forEach(function(C) {
				model(C.chain, C.json);
			});
			
			// loading modules & externals
			if( is_module )
			{
				var inject = function() {
					loader(path.modules + model.modelName + '.js');
				};
				
				if( externals )
				{
					var files = externals.split(' ').map(function( name ){
						return path.external + name + '.js';
					});
					loader(files, inject);
				}
				else {
					inject();
				}
			}
		});
	};
    
    Follow.module = function( conf )
    {
		var 
			model = Follow(conf.model, conf.storage),
			params = this.module.params[ model.modelName ];
		
		conf.init(model, params);
    };
}( window.jQuery, window ));
