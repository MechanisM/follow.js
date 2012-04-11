/*!
 * Follow.js
 * Helper for automatic sync the model-data with DOM-element's data via attribute "data-follow="a.special.path.in.the.model"
 * Dependencies: jQuery
 */
 
this.jQuery && (function($)
{
	var DOM = {
		links: []
	};
	
	Follow.link = function( config ) {
		DOM.links.push(config);
		return DOM.links;
	};
	
	// Sync direction: DOM to model (form-elements with data-follow attribute)
	// also we can use attributes data-follow-model="" and data-follow-storage="" to update chains in non-default model
	$(document).delegate('input[data-follow], select[data-follow], textarea[data-follow]', 'change', function()
	{
		var 
			elem = $(this),
			data = {
				chain: elem.data('follow'),
				model: elem.data('follow-model'),
				storage: elem.data('follow-storage')
			},
			model = Follow(data.model, data.storage);
		
		if( elem.is(':checkbox') ){
			model(data.chain, elem.prop('checked'));
		}
		else {
			model(data.chain, elem.val());
		}
	});
	
	// Sync direction: model to DOM
	Follow.sync = function( chain, data )
	{
		var 
			model = this,
			value = data[0];
		
		$('*[data-follow="'+ chain +'"]').each(function()
		{
            var 
				elem = $(this),
				prev_default = false;
			
			$.each(DOM.links, function()
			{
				return (
					((this.model && this.model === model) || true) 
					&& elem.closest( this.location ).length
					&& (prev_default = true)
					&& this.trigger(elem, value)
				);
			});
			
			// default behavior
			if( !prev_default )
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
        });
	};
	
	// Import data from DOM-elements with data-follow="" attribute
	Follow.extend({
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
					data = {
						model: elem.data('follow-model'),
						storage: elem.data('follow-storage')
					},
					current = Follow(data.model, data.storage);
					
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
		}
	});
}(this.jQuery));
