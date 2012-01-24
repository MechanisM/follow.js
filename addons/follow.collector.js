/*!
 * Follow.js
 * A simple unpacker for raw-data of "follow.collector.xsl"
 * Dependencies: jQuery or other library for downloading files using AJAX
 */

(function($)
{
	Follow.load = function( models, modules_path )
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
						json: data
					});
				}
			});
		});
		
		// loading data to the models
		common.forEach(function( obj )
		{
			var model = obj.model;
			if( obj.module )
			{
				$.ajax({
					url: modules_path + obj.module + '.js',
					dataType: 'script',
					complete: function(){
						model(obj.chain, obj.json);
					}
				});
			}
			else {
				model(obj.chain, obj.json);
			}
		});
	};
    
    Follow.module = function( opt )
    {
        Follow(opt.model, opt.storage)
            .follow(opt.chain, opt.init, 'once');
    };
}(window.jQuery));
