/*
 * 2.2012 - CHANGED AT QTECH 
 *
 * Original:
 * Copyright (c) 2010 C. F., Wong (<a href="http://cloudgen.w0ng.hk">Cloudgen Examplet Store</a>)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
(function ($) {
    function Loader(target, p1) {
        if (target) {
            var image;
           /* if (typeof p1 == "string") {
                image = (p1 == "") ? "../images/zoomloader.gif" : p1;
            }
            else image = "../images/zoomloader.gif";*/
            var jNode = $('<div style="-moz-opacity:0.5;opacity:0.5;filter:alpha(opacity=50);color:#999;font-size:12px;font-family:Tahoma;'
            //+'text-align:center;background-image:url('+image+');position:absolute;'
                + 'text-align:center;background-color:#999999;position:absolute;z-index:999;'
                + 'top:' + $(target).offset().top + 'px;width:' + $(target).outerWidth() + 'px;height:' + $(target).outerHeight() + 'px;'
				+ '"></div>').appendTo("body");
            $(jNode).html('<img src="/content/images/ajax-loader.gif" style="position:absolute" />');
            var img = $(jNode).find('img');
            img.css('top', $(target).height() / 2 - img.height()/2).css('left', $(target).width() / 2 - img.width()/2)
            this.target = $(target).data("Loader", this).load(function () {
                jNode.remove();
                $(this).data("Loader").callBack();
            });
            var t = parseInt(this.target.offset().top + (this.target.height() - jNode.height()) / 2);
            var l = parseInt(this.target.offset().left + (this.target.width() - jNode.width()) / 2);
            this.jNode = jNode.css({ top: t, left: l })
        }
    }
    Loader.prototype.callBack = function () {
        if (typeof this.callBack == "function") this.callBack();
    }
    Loader.prototype.load = function (href, callBack) {
        var cb = this.callBack = callBack, jNode = this.jNode;
        if (this.target[0].nodeName.toLowerCase() == "img") this.target.attr("src", href)
        else this.target.load(href, function () {
            jNode.remove();
            if (typeof cb == "function") cb()
        })
    }
    $.fn.addLoader = function (image, callBack) { new Loader(this, image, callBack) }
    $.fn.useLoader = function (href, callBack) { 
		this.addLoader();
		this.data("Loader").load(href, callBack);
	}
})(jQuery);