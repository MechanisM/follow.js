/*!
 * Follow.js
 * Some hooks to change behavior data before set and after get actions.
 */
 
Follow.extend(
{
	__set: {
		'array': function( value, args )
		{
			var result = {};
			value.forEach(function(val, key){ result[key] = val });
			return result;
		}
	}
});

