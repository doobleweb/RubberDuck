/**
 * Select2 Hebrew translation
 */
(function ($) {
    "use strict";

    $.extend($.fn.select2.defaults, {
        formatNoMatches: function () { return "לא נמצאו תוצאות"; },
        formatInputTooShort: function (input, min) { var n = min - input.length; return "הוסף " + n + " תווים" + (n == 1? "" : "es"); },
        formatInputTooLong: function (input, max) { var n = input.length - max; return "הסר " + n + " תווים"; },
        formatSelectionTooBig: function (limit) { return (limit == 1 ? "ניתן לבחור פריט אחד בלבד" : ""ניתן לבחור עד " + limit + " פרטים"") },
        formatLoadMore: function (pageNumber) { return "טוען תוצאות נוספות..."; },
        formatSearching: function () { return "מחפש..."; }
    });
})(jQuery);