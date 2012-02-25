
module('follow.toxml.js');
module('follow.select.js');

test('CSS-selectors to XPath', function()
{
	var selector = function( expr ){
		return Follow.utils.css2xpath( expr ).xpath;
	};
	
	// simple combinations
	equal(
		selector(':root > *'),
		'*'
	);
	equal(
		selector('*'),
		'.//*' 
	);
	equal(
		selector('[value]'),
		'.//*[@value]'
	);
	equal(
		selector('[value = "1"]'), 
		'.//*[@value = "1"]'
	);
	equal(
		selector('[value = 1][type = "number"]'), 
		'.//*[@value = "1" and @type = "number"]'
	);
	equal(
		selector('[name="z"] [name="x"]'), 
		'.//*[@name = "z"]//*[@name = "x"]'
	);
	equal(
		selector('[name="z"] > [name="x"], [name=x] > [name=y] [name=z]'),
		'.//*[@name = "z"]/*[@name = "x"] | .//*[@name = "x"]/*[@name = "y"]//*[@name = "z"]'
	);
	equal(
		selector('*[x=1] > [name=x 123]'),
		'.//*[@x = "1"]/*[@name = "x 123"]' 
	);
	equal(
		selector('* > *[z=2] *[z=3] > *'),
		'.//*/*[@z = "2"]//*[@z = "3"]/*' 
	);
});
