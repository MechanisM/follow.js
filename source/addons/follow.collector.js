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
			$.when.apply(this, files.map(function( file )
			{
				return $.ajax({
					url: file,
					dataType: 'script'
				});
			})).then(callback);
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
		var common = [];
		
		// preparation
		models.forEach(function(M)
		{
			var model = Follow(M.name, M.storage);
			M.chains.forEach(function( obj )
			{
				var 
					data = obj.json,
					module = obj.module,
					chain = common.filter(function(C) {
						return C.chain == obj.chain && C.model == model;
					}).shift();
				
				// gluing
				if( chain )
				{
					module && !chain.module && (chain.module = module);
					chain.json 
						= chain.json instanceof Array
						? chain.json.concat(data)
						: data;
				}
				else {
					common.push({
						model: model,
						chain: obj.chain,
						module: module,
						external: M.dependency,
						json: data
					});
				}
			});
		});
		
		// loading data to the models
		common.forEach(function( obj )
		{
			var inject = function()
			{
				var model = obj.model;
				obj.module
					? loader(path.modules + obj.module + '.js', function(){
						model(obj.chain, obj.json);
					})
					: model(obj.chain, obj.json);
			}
			// apply data
			if( obj.external )
			{
				var files = obj.external.split(' ').map(function( name ){
					return path.external + name + '.js';
				});
				loader(files, inject);
			}
			else {
				inject();
			}
		});
	};
    
    Follow.module = function( opt )
    {
        Follow(opt.model, opt.storage)
            .follow(opt.chain, opt.init, 'once');
    };
}( window.jQuery, window ));
