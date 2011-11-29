/*!
 * Follow.js
 * Helper for collections (arrays) in the model.
 */
 
Follow.extend(
{
	__get: function( value, args )
	{
		if( value instanceof Array )
		{
			var
				model =  this,
				chain = args.shift();
			
			this.extend(value, 
			{
				splice: function( start, count )
				{
					var 
						items = [].slice.call(arguments, 2),
						end = start + Math.max(count, items.length);
					
					[].splice.apply(this, arguments);
					model(chain, this);
					
					while( start < end )
					{
						var 
							path = [chain, start++].join('.'),
							value = items.shift();
						model.dispatch(path, [value]);
					}
				},
				
				push: function() {
					var args = [].slice.call(arguments);
					this.splice.apply(this, [this.length, 0].concat(args));
				},
				
				unshift: function() {
					var args = [].slice.call(arguments);
					this.splice.apply(this, [0, 0].concat(args));
				},
				
				shift: function() {
					this.splice.apply(this, [0, 1]);
				},
				
				pop: function() {
					this.splice.apply(this, [this.length - 1, 1]);
				}
			});
		}
		
		return value;
	}
});

