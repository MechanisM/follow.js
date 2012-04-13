/*!
 * Follow.js
 * Helper for automatic sync the model-data with DOM-element's data via attribute "data-follow="a.special.path.in.the.model"
 * Dependencies: jQuery
 */
 
this.jQuery && (function($)
{
	var DOM = {
		links: [],
		
		getModelByElemAttrs: function( elem ){
			var M = elem.data('follow-model') || '';
			var S = elem.data('follow-storage') || 'undefined';
			return Function('return Follow("'+ M +'", '+ S +')')();
		}
	};
	
	Follow.link = function( config ) {
		DOM.links.push(config);
		return DOM.links;
	};
	
	// Sync direction: DOM to model (form-elements with data-follow attribute)
	// also we can use attributes data-follow-model="" and data-follow-storage="" to update chains in non-default models
	$(document).delegate('input[data-follow], select[data-follow], textarea[data-follow]', 'change', function()
	{
		var 
			elem = $(this),
			chain = elem.data('follow'),
			model = DOM.getModelByElemAttrs(elem);
		
		if( elem.is(':checkbox') ){
			model(chain, elem.prop('checked'));
		}
		else {
			model(chain, elem.val());
		}
	});
	
	// Sync direction: model to DOM
	Follow.sync = function( params )
	{
		var 
			model = this,
			chain = params.chain,
			value = params.value;
		
		$('*[data-follow="'+ chain +'"]').each(function()
		{
            var 
				elem = $(this),
				prev_default = false,
				is_the_same_model = DOM.getModelByElemAttrs(elem) === model,
				apply_defaults = function()
				{
					if( is_the_same_model )
					{
						if( elem.is(':checkbox') || elem.is(':radio') )
						{
							(elem.is(':checkbox') || (elem.is(':radio') && elem.val() == value))
							&& elem.attr('checked', !!value)
						}
						else if( elem.is('input') || elem.is('select') || elem.is('textarea') )
						{
							elem.is('select[multiple]') 
							&& model.gettype(value) != 'array'
							&& (value = model.map(value, function(v){ return v}));
							
							elem.val( value );
						}
						else if( elem.is('img') ){
							elem.attr('src', value)
						}
						else {
							elem.html(value);
						}
					}
				};
			
			$.each(DOM.links, function()
			{
				return (
					is_the_same_model
						&& elem.is( this.match ) // 1
						&& (prev_default = true)
					? this.trigger(elem, value, apply_defaults) // 2
					: true
				);
			});

			// default behavior
			!prev_default && apply_defaults();
        });
	};
	
	Follow.extend(
	{
		// Getting DOM-elements by chain
		getElementsByChain: function( chain )
		{
			var model = this;
			return $('[data-follow="'+ chain +'"]').filter(function()
			{
				var elem = $(this);
                return DOM.getModelByElemAttrs(elem) === model;
            });
		},
		
		// Special methods to import/export data-model
		importDataFromDOM: function()
		{
			var 
				model = this,
				imported = {};
			
			$('[data-follow]').each(function()
			{
				var 
					elem = $(this),
					chain = elem.data('follow'),
					current = DOM.getModelByElemAttrs(elem);
					
                if( model === current && !imported[chain] )
				{
					var value;
					
					if( elem.is(':checkbox') ){
						value = elem.prop('checked')
					}
					else if( elem.is(':radio') && elem.attr('name') ) {
						value = $(':radio[name = "'+ elem.attr('name') +'"]').val()
					}
					else if( elem.is('input') || elem.is('select') || elem.is('textarea') ){
						value = elem.val()
					}
					else {
						value = elem.text();
					}
					
					imported[chain] = true;
					model(chain, value);
				}
            });
		},
		
		exportDataToDOM: function( chain )
		{
			var 
				model = this,
				chain = chain || '',
				stack = chain ? this(chain) : this(),
				sync = this.constructor.sync;
			
			// export current chain
			chain && sync.call(model, {
				chain: chain,
				value: stack
			});
			
			// export sub-chains if exists (for objects and arrays)
			this.extend(true, {}, stack, function( path, value ){
				sync.call(model, {
					chain: (chain ? chain + '.' : '') + path,
					value: value
				});
			});
		}
	});
	
}(this.jQuery));
