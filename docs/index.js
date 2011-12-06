
$(function()
{
	$('h1').click(function(){
		location.href = 'https://github.com/extensible/follow.js';
	});

	// Fix extra spaces in the <code>
	$('code').each(function()
	{
		var 
			code  = $(this).text().replace(/^\n*|\s*$/g, ''), // prepare code text
			extra = code.match(/^\s*/g).toString().length,
			code  = code
				  .replace(/\r/g, "\n") // fix for ie
				  .replace(/^.*$/gm, function( line ){
						return '<li><span>'+ line.substr(extra) +'</span></li>'; // remove prefix spaces (not all!)
				  });

		// simple highlighter
		code = code
				.replace(/('|")(.*?)\1/g, '<span class="code-string">$&</span>')
				.replace(/\bfunction\b/g, '<b class="code-function">$&</b>')
				.replace(/\bthis\b/g, '<span class="code-this">$&</span>')
				.replace(/\b(return|true|false|new|null|var)\b/g, '<span class="code-keyword">$&</span>')
				.replace(/\/\/.*?$/gm, '<span class="code-comment">$&</span>')
				;

		$('<ol class="code" />')
			.html( code.replace(/\t/g, Array(8).join('&nbsp;')) )
			.replaceAll( this )
			.find('li:even').addClass('colored');
	});
	
});