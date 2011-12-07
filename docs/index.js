
$(function()
{
	$('h1').click(function(){
		location.href = '.';
	});
	
	$(document)
		.bind('highlight', function(evt, ctx)
		{
			// Fix extra spaces in the <code>
			$('code', ctx || this).each(function()
			{
				var 
					code  = $(this).text().replace(/^\n*|\s*$/g, ''), // prepare code text
					extra = code.match(/^\s*/g).toString().length,
					code  = code
						  .replace(/\r/g, "\n") // fix for ie
						  .replace(/^.*$/gm, function( line ){
								return '<li><span>'+ line.substr(extra) +'</span></li>'; // remove prefix spaces (not all!)
						  }),
					icon_exec = $('<span class="run-code" title="Выполнить код примера"></span>')
						.click(function()
						{
							var 
								code = $(this).parent(),
								dependents = code.attr('dependent-on'),
								expr = [code.text()];
							
							if( dependents )
							{
								var d = dependents.split(' ').reverse();
								$.each(d, function(index, id){
									expr.unshift(
										$('#'+ id).text()
									);
								});
							}
							
							// execute code
							try {
								Function(expr.join('\n'))();
							} catch(e){
								alert(e)
							}
						});
		
				// simple highlighter
				code = code
						.replace(/('|")(.*?)\1/g, '<span class="code-string">$&</span>')
						.replace(/\bfunction|alert\b/g, '<b class="code-function">$&</b>')
						.replace(/\bthis\b/g, '<span class="code-this">$&</span>')
						.replace(/\b(return|true|false|new|null|var)\b/g, '<span class="code-keyword">$&</span>')
						.replace(/\/\/.*?$/gm, '<span class="code-comment">$&</span>')
						;
				
				var ol = $('<ol class="code" />')
					.html( code.replace(/\t/g, Array(8).join('&nbsp;')) )
					.replaceAll( this )
					.find('li:even').addClass('colored').end()
					.append(icon_exec);
				
				// copy attributes
				var attrs = this.attributes;
				for( var i = 0; i < attrs.length; i++ )
				{
					var attr = attrs[i];
					ol.attr(attr.nodeName, attr.nodeValue);
				}
			});
		})
		.bind('loadhtml', function( evt, url )
		{
			var content = $('#content .text');
			$.ajax({
				url: 'pages/' + (url || 'intro') + '.html',
				success: function( text )
				{
					content.html(text);
					$(document).trigger('highlight');
				},
				error: function( xhr, error, thrown ){
					content.html(thrown);
				}
			});
		})
		.delegate('a[href^="#"]', 'click', function( evt )
		{
			var url = $(this).attr('href') == '#'
				? this.innerHTML
				: this.getAttribute('href').substr(1);
				
			location.hash = '#'+ url;
			return false;
		});

	// load default page
	window.addEventListener("hashchange", function __(evt)
	{
		var url = location.hash.substr(1);
		$(document).trigger('loadhtml', [url]);
		return __;
	}(), false);
	
});