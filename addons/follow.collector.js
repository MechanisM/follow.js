/*!
 * Follow.js
 * A simple unpacker of data, collected by follow.collector.xsl
 * Dependencies: jQuery or other library for downloading files using AJAX
 */

(function($)
{
    Follow.extend(
    {
        load: function( json, params )
        {
            json.forEach(function( obj )
            {
                if( obj.module )
                {
                    $.ajax({
                        url: params.modules_path + obj.module + '.js',
                        context: this,
                        dataType: 'script',
                        complete: function(){
                            this(obj.chain, obj.json);
                        }
                    });
                }
                else {
                    this(obj.chain, obj.json);
                }
            }, this);
        }
    });
    
    Follow.module = function( opt )
    {
        Follow(opt.model, opt.storage)
            .follow(opt.chain, opt.init, 'once');
    };
}(window.jQuery));
