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
									var prop = value.split('.').shift();
									
									checklist[chain]['parse'] && 
									elem.hasOwnProperty(prop) && (
										value = model([path, index, value].join('.'))
									);
									
									if( value === null || typeof value != 'object' ){
										return eval('(elem.'+ chain + compare + value +')');
									}
								}
								
								return false;
							}
							
							return model([path, index, chain].join('.')) !== null;
						}
						return false;
					});
					
					var result = Function('return '+ expr)();
					if( result )
					{
						if( returnValue )
						{
							var prop = returnValue.split('.').shift();
							
							elem.hasOwnProperty(prop) &&
							returnValue.match(/^[A-Z0-9_$\.]+$/i) &&
							(value = model([path, index, returnValue].join('.')));
							
							value && stack.push(value);
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
