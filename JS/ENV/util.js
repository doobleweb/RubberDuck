(function ($) {
    $.envutil = function () { }
    /*$.envutil.getFilePath = function (file) {
        if (!file)
            return '/';

        var result = '';
        for (var i = 0; i < 100; i++) {
            var sIndex = file.indexOf('/');
            if (sIndex <= 0)
                break;
            result += file.substr(0, sIndex);
            if (file.length <= sIndex + 1)
                break;
            file = file.substr(sIndex + 1);
        }
        return result;
    }*/
})(jQuery);