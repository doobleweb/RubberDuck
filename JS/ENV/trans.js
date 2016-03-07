(function ($) {
    var _transTextbox;
    var _transArea;
    var _runningUrl;

    $.envtrans = function (settings) {
        _transTextbox = settings.transTextbox;
        _transArea = settings.transArea;

        $('body').prepend(
         "<div id='transdiv' style='width:100%; height: 100%; position:absolute;background: ; z-index:9999; top:43px; display:none'>\n" +
            "<iframe style='width:100%; height: 96%; position:absolute; background-color: white' frameborder='0'></iframe> \n" +
        "</div>");

        // Public Methods
        // **************
        $.envtrans.hide = function (options) {
            if (!options || !options.pause) {
                $('#transdiv iframe').attr('src', '')
                // stop stats collection:
                if (_runningUrl) {
                    // on window unload must be sync !
                    var async = true;
                    if (options && options.sync)
                        async = false;
                    jQuery.ajax({ url: _runningUrl + '$stoppp=' + $.envController.ENV_ID, async: async })
                }
            }

            $('body').removeClass('transmode')
            $('#transdiv').hide();
            $(_transArea).css('visibility', '');
        }
        $.envtrans.show = function (options) {
            if (!options || !options.cont) {
                var url = $(_transTextbox).val();
                if (!url)
                    return;

                if (url.toLowerCase().indexOf('http://') < 0 && url.toLowerCase().indexOf('https://') < 0 && url.toLowerCase().indexOf('ftp://') < 0)
                    url = 'http://' + url;

                url = url.replace('#', '?');
				if (url.indexOf('?') < 0)
                    url += '?'
                else
                    url += '&';
                _runningUrl = url;

                url += "$runpp=" + $.envController.ENV_ID
                $('#transdiv iframe').attr('src', url);
            }

            $('body').addClass('transmode')
            $(_transArea).css('visibility', 'hidden');
            $('#transdiv').show();
        }
    };

})(jQuery);