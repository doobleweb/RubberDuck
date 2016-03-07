/// <reference path="../../../../Scripts/jquery-1.4.4.js" />

$(function () {
    $('.page_editor_template form')
        .append('<input type="button" class="page_editor_cancel" value="ביטול" />' +
        '<input type="submit" name="Action(Save)" value="שמור" />');

    $('.page_editor_item').each(function () {
        var child = $(this).children(':first');
        var position = child.offset();
        var size = $(this).size();
        $(this).before('<div class="page_editor_frame" style="position:absolute; height: ' +
            child.height() + 'px; width: ' + child.width() + 'px;"></div>');

        $(this).next('.page_editor_template:first').css(position).size(size);

        $(this).prev().css(position).prepend('<div class="page_editor_trigger"><a href="#">עריכה</a></div>');
        $(this).hover(function () {
            $(this).prev().addClass('page_editor_frame_show');
        });
        // unhover on FRAME
        $(this).prev().hover(null, function () {
            $(this).removeClass('page_editor_frame_show');

        });
    });

    $('.page_editor_trigger a').click(function () {
        $('._content').hide(300);
        var parent = $(this).parents('.page_editor_frame:first');
        parent.next('.page_editor_item:first').hide().next('.page_editor_template:first').show(300);
        return false;
    });

    $('.page_editor_cancel').click(function () {
        var parent = $(this).parents('.page_editor_template:first');
        parent.hide();
        parent.prev('.page_editor_item:first').show();
        return false;
    });
});