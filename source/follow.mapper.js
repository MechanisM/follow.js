/*!
 * Follow.js
 * Data-mapper for collections (arrays) in the model.
 */
 
Follow.extend(
{
	select: function( path, condition, returnValue )
	{
		var 
			model = this,
			collection = model(path),
			stack = [],
			chains = [],
			checklist = {},
			value;
		
		if( collection instanceof Array )
		{
			collection.forEach(function( elem, index )
			{
				try {
					var expr = 
					! condition ? true
					: condition.replace(/([A-Z0-9_\$\.]+)(?:\[(>=?|<=?|==?|!=?)(.*?)\])?/gi, function(S, chain, compare, value)
					{
						var prop = chain.split('.').shift();
						if( elem.hasOwnProperty(prop) )
						{
							if( compare && value )
							{
								compare.charAt(0) == '=' && (compare = '===');
								compare.charAt(0) == '!' && (compare = '!==');
								
								!checklist[chain] && (
									checklist[chain] = 
										value.match(/^((["']).*?\2|\d+(?:\.\d+)?|true|false|null)$/) || (
											value.match(/^[A-Z0-9_$\.]+$/i) &&
											{'parse': true}
										)
								);
								
								if( checklist[chain] ) 
								{
									checklist[chain]['parse'] && 
									elem.hasOwnProperty( value.split('.').shift() ) && (
										value = model.toJSON([path, index, value].join('.'))
									);
									return eval('(elem.'+ chain + compare + value +')');
								}
								
								return false;
							}
							
							return chain == prop
								? true
								: model([path, index, chain].join('.')) !== null;
						}
						return false;
					});
					
					var bool = Function('return '+ expr)();
					if( bool )
					{
						var chain = {
							index: index,
							path: [path, index]
						};
						if( returnValue )
						{
							var value, prop = returnValue.split('.').shift();
							
							elem.hasOwnProperty(prop) &&
							(value = eval('(elem.'+ returnValue +')'));
							
							value !== undefined && (
								chain.path.push(returnValue),
								chains.push(chain),
								stack.push(value)
							);
						}
						else {
							stack.push(elem);
							chains.push(chain);
						}
					}
				}
				catch(e){}
			}, this);
		}
		
		stack.update = function( value, every )
		{
			if( arguments.length )
			{
				var branch = model.constructor('merge');
				branch(path, collection);
				
				// remove items from back to front, because Array.splice will make offset
				chains
					.reverse()
					.forEach(function( chain )
					{
						var chain = chain.path.join('.');
						branch(chain, value);
						every && model(chain, value);
					});
				
				!every && model(path, branch(path));
				branch.clear();
			}
			
			return model;
		};
		
		stack.remove = function( every ){
			this.update(undefined, every);
		};
		
		return stack;
	}
});
