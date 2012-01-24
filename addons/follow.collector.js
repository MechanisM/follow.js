/*!
 * Follow.js
 * A simple unpacker for raw-data of "follow.collector.xsl"
 * Dependencies: jQuery or other library for downloading files using AJAX
 */

(function($)
{
	Follow.load = function( models, modules_path )
	{
		var common = {};
		
		models.forEach(function(M)
		{
			var model = Follow(M.name, M.storage);
			M.chains.forEach(function( obj )
			{
				var chain = common[obj.chain] || (common[obj.chain] = {
					model: model,
					chain: obj.chain,
					module: obj.module
				});
				chain.json 
					= chain.json instanceof Array
					? chain.json.concat(obj.json)
					: obj.json;
			});
		});
		
		for(var chain in common) {
			common.hasOwnProperty(chain) && function( obj )
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
			}( common[chain] );
		}
	};
    
    Follow.module = function( opt )
    {
        Follow(opt.model, opt.storage)
            .follow(opt.chain, opt.init, 'once');
    };
}(window.jQuery));
