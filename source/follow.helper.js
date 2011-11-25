/*!
 * Follow.js
 * Helpers for collections (arrays) in the model.
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
					var items = [].slice.call(arguments, 2);
					[].splice.apply(this, arguments);
					
					for(
						var i = start, chains = []; 
						i < start + Math.max(count, items.length); 
						i++
					) chains.push([chain, i].join('.'));
					
					model(chain, this);
					chains.forEach(function( path ){
						model.dispatch( path );
					});
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

