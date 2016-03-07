(function ($) {
    var _envresults, _this;
    
    $.fn.envlayout = function (settings) {
        _this = $(this);
        _envresults = settings.envresults;
        //$(_envresults).find('div:first').click(_toggleResults);

        $(_envresults).on('click', '.envresult-file', function () {
            var href = $(this).attr('path');
            var title = $(this).attr('filename');
            var line = $(this).attr('line');
            var ch = $(this).attr('ch');
            $(_this).trigger('selectresult', { href: href, title: title, line: line, ch: ch });
        }); ;
    }

    $.fn.envlayout.showResults = function (options) {
	    var contentDiv = $(_envresults);
        if (options.loading) {
            contentDiv.text('searching for \'' + options.loading + '\'...');
            contentDiv.append('<br/>')
        }
        else if (options.content) {
            if (options.contentLoading);
            contentDiv.text('Results for \'' + options.contentLoading + '\':');
            contentDiv.append('<br/>')

            var html = '<ul>';
            for (var i = 0; i < options.content.length; i++) {
                var item = options.content[i];
                html += '<li>';
                html += '<span class="envresult-file" path="' + item.path + '" filename="' + item.filename + '" line="' + item.lineNumber + '" ch="' + item.ch + '">' +
                    item.path + '(' + item.lineNumber + ')</span>'
                html += '<span class="envresult-file-line">' + item.line + '</span>'
                html += '</li>';
            }
            html += '</ul>';
            html += '<div>Total: ' + options.content.length + ' results</div>';
            contentDiv.append(html);
        }

        contentDiv.show();
    }

    // Private Methods
    // ***************
    _toggleResults = function (options) {
        $($(_envresults).find('div')[1]).toggle();
    }
   
})(jQuery);