/*!
 * Follow.js
 * ECMA-262 compatibility
 */

!Array.prototype.forEach && (
	Array.prototype.forEach = function( callback, context )
	{
		if( typeof callback != "function" ){
			throw new Error('callback is not a function');
		}
		for( var i = 0, len = this.length; i < len; i++ ){
			callback.call(context, this[i], i, this);
		}
	}
);

!Array.prototype.map && (
	Array.prototype.map = function( callback, context )
	{
		var map = [];
		this.forEach(function(){
			map.push(callback.apply(context, arguments));
		});
		return map;
	}
);

!Array.prototype.filter && (
	Array.prototype.filter = function( callback, context )
	{
		var filter = [];
		this.forEach(function( value ){
			callback.apply(context, arguments) && 
			filter.push( value );
		});
		return filter;
	}
);

!Array.prototype.some && (
	Array.prototype.some = function( callback, context )
	{
		if( typeof callback != "function" ){
			throw new Error('callback is not a function');
		}
		for( var i = 0, len = this.length; i < len; i++ ){
			if( callback.call(context, this[i], i, this) ){
				return true;
			}
		}
		return false;
	}
);

!Array.prototype.every && (
	Array.prototype.every = function( callback, context ){
		return this.length == this.filter(callback, context).length;
	}
);

!Array.prototype.indexOf && (
	Array.prototype.indexOf = function( searchElement, fromIndex )
	{
		var 
			fromIndex = Number(fromIndex) || 0,
			length = this.length;
		if( fromIndex < length - 1 )
		{
			fromIndex < 0 && (fromIndex += length);
			for( var i = fromIndex; i < length; i++ ){
				if( this[i] === searchElement ){
					return i;
				}
			}
		}
		return -1;
	}
);

!String.prototype.trim && (
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	}
);
