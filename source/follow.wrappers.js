/*!
 * Follow.js
 * List of shortcuts which extend third argument "mode" in model.follow
 */
 
(function()
{
	var regexp_escape = function( path ){
		return path.replace(/[\[\]\(\)\.\*\+\\\{\}\^\$]/g, '\\$&');
	};
	
	Follow.extend(
	{
		wrappers: 
		{
			// perform just a once (auto-unfollow)
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
			
			// straight descendants only
			'children': function( path, callback )
			{
				return {
					path: RegExp('^'+ regexp_escape(path) +'\.([^\.]+)$'),
					callback: callback
				}
			},
			
			// descendants or self + always own context
			'sensible': function( path, callback )
			{
				var 
					chain = String(path),
					path = regexp_escape(path);
				return {
					path: RegExp('^('+ path +'|'+ path +'\\..*)$'),
					callback: function()
					{
						this(chain, function( value, params ) {
							callback.apply(this, arguments);
							return value;
						});
					}
				};
			}
		}
	});
})();
 
