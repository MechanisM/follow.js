/*!
 * Follow.js
 * Helper to easy find and update data in the model
 */
 
Follow.extend(
{
	select: function( css, xpath )
	{
		var 
			model = this,
			stack = [],
			doc = Follow.utils.json_to_xml( model() ),
			ctx = doc.documentElement;
		
		// CSS selectors (needed to use it for the fucking IE9 that because it doesn't understand XPath)
		if( css && doc.querySelectorAll ){
			stack = [].slice.call(ctx.querySelectorAll(css));
		}
		// Try to use XPath
		else if( xpath )
		{
			if( document.evaluate ){
				// W3C-browsers
				var result = doc.evaluate( xpath, ctx, null, XPathResult.ANY_TYPE, null );
				while( node = result.iterateNext() ) {
					stack.push(node);
				}
			}
			else {
				// IE
				var result = ctx.selectNodes(xpath);
				for( var i = 0; i < result.length; i++ ) {
					stack.push(result[i]);
				}
			}
		}
		
		stack = stack.map(function( node ){
			return {
				name: node.getAttribute('name'),
				type: node.getAttribute('type'),
				path: node.getAttribute('path'),
				value: node.getAttribute('value')
			};
		});
		
		this.extend(stack, {
			update: function( value ){
				this.forEach(function( node ) {
					model(node.path, value);
				});
			},
			remove: function(){
				this.update(undefined);
			}
		});
		
		return stack;
	}
});
