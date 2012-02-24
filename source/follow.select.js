/*!
 * Follow.js
 * Helper to easy find and update data in the model
 */
 
Follow.extend(
{
	select: function( xpath, css )
	{
		var 
			model = this,
			stack = [],
			doc = Follow.utils.json_to_xml( model() );
		
		// CSS selectors (needed to use it for the fucking IE9 that because it doesn't understand XPath)
		if( css && doc.querySelectorAll ){
			stack = [].slice.call(doc.querySelectorAll(css));
		}
		// Try to use XPath
		else {
			if( document.evaluate ){
				// W3C-browsers
				var result = doc.evaluate( xpath, doc, null, XPathResult.ANY_TYPE, null );
				while( node = result.iterateNext() ) {
					stack.push(node);
				}
			}
			else {
				// IE
				var result = doc.documentElement.selectNodes(xpath);
				for( var i = 0; i < result.length; i++ ) {
					stack.push(result[i]);
				}
			}
		}
		
		this.extend(stack, {
			update: function( value ){
				this.forEach(function( node ) {
					var chain = node.getAttribute('path');
					model(chain, value);
				});
			},
			remove: function(){
				this.update(undefined);
			}
		});
		
		return stack;
	}
});