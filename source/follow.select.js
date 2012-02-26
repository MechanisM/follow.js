/*!
 * Follow.js
 * Helper to easy find and update data in the model
 */
 
Follow.extend(
{
	select: function( actor, ctx_chain )
	{
		var 
			stack = [],
			model = this,
			data = ctx_chain ? model( ctx_chain ) : model(),
			utils = model.constructor.utils,
			type = utils.type(actor),
			mode = {
				pathmask: type == 'regexp',
				selector: type == 'string'
			};
		
		// Using simple CSS-selectors and their analog in XPath (if possible)
		if( mode.selector )
		{
			var
				root = ctx_chain ? 'slice' : 'model',
				selector = utils.css2xpath( actor, root ),
				xmlstr = utils.json_to_xml( data, ctx_chain ),
				xml = utils.parse_xml( xmlstr ),
				ctx = xml.documentElement;
			
			// CSS selectors (note: ie9 doesn't understand XPath, but can use query selectors)
			if( ctx.querySelectorAll ) {
				var expr = selector.css;
				stack = utils.array(ctx.querySelectorAll( expr ));
			}
			// Try to use XPath
			else {
				var expr = selector.xpath;
				if( document.evaluate ){
					// W3C-browsers
					var result = ctx.evaluate(expr, ctx, null, XPathResult.ANY_TYPE, null );
					while( node = result.iterateNext() ) {
						stack.push(node);
					}
				}
				else {
					// IE (6?-7-8)
					var result = ctx.selectNodes( expr );
					for( var i = 0; i < result.length; i++ ) {
						stack.push(result[i]);
					}
				}
			}
			
			stack = stack.map(function( node ){
				return {
					node: node.nodeName,
					name: node.getAttribute('name'),
					type: node.getAttribute('type'),
					path: node.getAttribute('path'),
					value: node.getAttribute('value')
				};
			});
			
			// save for debug
			stack.selector = expr;
		}
		
		// Using regular expression mask to check all possible chain for update their values after
		if( mode.pathmask )
		{
			var prefix = ctx_chain ? ctx_chain + '.' : '';
			utils.extend(true, {}, data, function( path, value, name )
			{
				actor.test(path) && stack.push({
					name: name,
					type: utils.type(value),
					path: prefix + path,
					value: value
				});
			});
		}
			
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

// A converter of simple CSS-queries to analog in XPath-expressions
// You can find samples in the "tests/test.select.js"
Follow.utils.css2xpath = function( expr, root )
{
	var 
		root = root || 'root',
		expr = expr.trim(),
		css = expr.replace(/(^:root)|((,\s*):root)/g, '$3'+ root),
		xpath = expr
			// merge conditions
			// fix attribute prefix with @ and value quotes (if not exists)
			.replace(/(\*?)((?:\[.+?\])+)/g, function( $0, node, conditions )
			{
				var 
					prefix = !node ? '*' : node,
					conditions = conditions
						.replace(
							/\[(\w+)(?:\s*=\s*("?)([^"]+)\2)?\]/g, 
							function( $0, attr, has_quote, value, offset ) {
								return '@' + attr + (value ? ' = "'+ value +'"' : '')+ ' and ';
							}
						)
						.replace(/ and $/, '');
				return prefix + '['+ conditions +']';
			})
			// selectors " ", ">" and union ","
			.replace(/((?:\[.+?\])|\*)([\s,>]+)(:root)?/g, function( $0, cond_before, selector, is_root )
			{
				var s = selector.trim();
				return cond_before + (
					(s == '' && '//') ||
					(s == '>' && '/') || 
					(s == ',' && ' | '+ (is_root ? is_root : './/')) ||
					''
				);
			})
			.replace(/:root([\s>]*)/, function( $0, selector ){
				var s = selector.trim();
				return selector ? (s == '' ? './/' : './') : '';
			})
			.replace(/^\*/, './/*')
		
	return {
		css: css,
		xpath: xpath
	};
};
