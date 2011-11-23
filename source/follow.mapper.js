/*!
 * Follow.js - small javascript library for tracking dependencies
 * Data-mapper for collections (arrays) in the model.
 */
 
Follow.extend(
{
	map: function( path, condition, returnValue )
	{
		var 
			model = this,
			collection = model(path),
			stack = [],
			checklist = {},
			value;
		
		if( collection instanceof Array )
		{
			collection.forEach(function( elem, index )
			{
				try {
					var expr = condition.replace(/([A-Z0-9_\$\.]+)(?:\[(>=?|<=?|==?|!=?)(.*?)\])?/gi, function(S, chain, compare, value)
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
					
					var result = Function('return '+ expr)();
					if( result )
					{
						if( returnValue )
						{
							elem.hasOwnProperty( returnValue.split('.').shift() ) &&
							(value = model([path, index, returnValue].join('.')));
							
							value !== null && stack.push(value);
						}
						else {
							stack.push(elem);
						}
					}
				}
				catch(e){}
			}, this);
			
			return stack;
		}
		
		return collection;
	}
});
