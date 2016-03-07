(function ($) {
    $.fn.envcode = function (settings) {
        var _this = this;
        
        // init:
        // *****
        $(this).appTabs({
			generateNewTabs : false,
			container : settings.tabsContainer,
			allowDuplicate : false,
			draggable : false,
			tooManytabsMode: true
            //tabTemplate: "<li class='env-tab'><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-closethick env-tab-close'>Remove Tab</span></li>",
            //select: _onSelect
            //    , scrollable: true // from scrollable extension http://jquery.aamirafridi.com/jst/
        })
        .on('tabSelect', _onSelect)
		.on('beforeCloseTab', _beforeCloseTab)
        .dragsort({
            dragSelector: "li", dragBetween: false, placeHolderTemplate: "<li></li>", tolerance: 10,
            dragEnd: function () { } // Need to refresh tabs after drag-sort (same goes for other sortable plugins). 2 hacks in this file. see: http://bugs.jqueryui.com/ticket/4524
        })

        // public methods
        // **************
        $.fn.envcode.add = function (fileTitle, content, data) {
			data.title = fileTitle;
            var createOptions = {
				tabTitle  : fileTitle,
				content : '',
				uniq: data.file,
				data: data
			};
			
			$(_this).trigger('newTab', createOptions)
			if (!createOptions.success)
				return;
			
            //$(_this).tabs('add', tabID, fileTitle);
			var getTabOptions = {uniq: data.file};
			$(_this).trigger('getTabContent', getTabOptions);
			var tabContent = getTabOptions.result;
			
			if (data.file && data.file.length > 4){
				var ext = data.file.substr(data.file.length-4).toLowerCase();
				if (ext == '.gif' || ext == '.png' || ext == '.tif' || ext == '.jpg' || ext == '.jpeg'){
					data.noEditor = true;
					content = '<div class="tab_image_container fit"><img src="' + data.file + '" /></div>'
				}
			}
            $(_this).trigger('tabadded');

            if (data.noEditor) {
                $(tabContent).append(content);
            }
            else {
                var selector = data.file.replace(/([ ;&,.+*~\':"!^$[\]()=>|\/@])/g, '_');
                $('#'+selector).text(content)
                var aceEditor = ace.edit(selector);
                aceEditor.setTheme("ace/theme/monokai");
                // aceEditor.setValue(content, -1);
                aceEditor.setShowPrintMargin(false);//disables the annoying line on the center of the screen.
                aceEditor.$blockScrolling = Infinity
                aceEditor.on('change', function(event) {
                     _setDirtyTab();
                    $(_this).trigger('changecontent');
                });
                aceEditor.setOptions({
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true
                });
                // extra div seems to make typing a bit faster in FF
                // $(tabContent).append('<div><textarea></textarea></div>');
                // var editor = $(tabContent).find('textarea');
                // editor.text(content);

                if (fileTitle.indexOf('.js', fileTitle.length - 3) != -1) //ends with .js ?
                {
                    change_lang_mode('js',aceEditor);
                }
                else if (fileTitle.indexOf('.css', fileTitle.length - 4) != -1) //ends with .css ?
                {
                    change_lang_mode('css',aceEditor);
                }
                else {
                    change_lang_mode(null,aceEditor);
                    if (typeof(_hpp_mode) == 'undefined'){
                        _hpp_mode = true;
                    }
                }

            }

            data.aceEditor = aceEditor;
        }

		$.fn.envcode.closeTab = function(tab){
			if (!tab)
				tab = $(_this).envcode.getActiveTab();
			if (!tab || !$(tab).length)
				return;
			$(tab).find('.icon_close').click();
		}
		
		$.fn.envcode.tabLeftRight = function(left){
			var tab = $(_this).envcode.getActiveTab();
			if (!tab || !tab.length)
				return;
			if (!left)
				var el = tab.next('li');
			else
				var el = tab.prev('li');
			if (!el.length) return;
			$(_this).trigger('setActiveTab', el.attr('data-uniq'));
		}
		
		$.fn.envcode.getAllTabs = function (){
			return $(_this).children('li');
		}

        $.fn.envcode.getActiveTab = function () {
            //TODO: jquery ui hack #1 - dragging tabs causes active tab to be wrong from api
            //var index = $(_this).tabs('option', 'selected');
            //return $($(_this).find('ul:first').find('li')[index]);
			var getTabOptions = {};
			$(_this).trigger('getActiveTab', getTabOptions);
            return getTabOptions.result

        }
        // tab can be tab or index
        $.fn.envcode.getTabData = function (tab) {
            if (!tab.data){
				var getTabOptions = { uniq: tab};
				$(_this).trigger('getTab', getTabOptions);
				tab = getTabOptions.result
			}
            return tab.data('data');
        }
        $.fn.envcode.clearDirty = function (tab) {
            var data = $(_this).envcode.getTabData(tab);
            data.dirty = false;
            data.aceEditor.getSession().getUndoManager().markClean();
            tab.find('span:first .tabDirty').remove();
        }

        $.fn.envcode.anyTabDirty = function () {
            var dirty = false;
            $(_this).find('.tab_menu_item').each(function () {
                var data = $(_this).envcode.getTabData($(this));
                if (data && data.dirty) {
                    dirty = true;
                    return false;
                }
            });
            return dirty;
        }
        $.fn.envcode.setCursor = function (pos) {
            var tab = $(_this).envcode.getActiveTab();
            if (!tab)
                return;
            var data = $(_this).envcode.getTabData(tab);
            if (!data || !data.aceEditor)
                return;
            data.aceEditor.focus();
            data.aceEditor.gotoLine(pos.line,pos.ch, true);

        }

        function change_lang_mode(type,aceEditor) {
            var fileType = "hpp";
            if(type == "js") {
                fileType  = "javascript";
            }
            var mode = "ace/mode/" + fileType;
            console.log('mode', mode);
            // set the language mode in the aceEditor
            aceEditor.getSession().setMode(mode);
        }

        _setDirtyTab = function () {
            var tab = $(_this).envcode.getActiveTab()
            // var data = tab.data('data');
            var data = tab.data('data');
            if (data.dirty)
                return;

            data.dirty = true;
            var tabTitle = tab.find('span:first');
            tabTitle.html(tabTitle.html() + "<span class='tabDirty'>*</span>") // add *
        }
        // Event Handlers
        // **************
        function _onSelect(event, args) {
            //_isSelectedCalled = true;
            var tab = $(_this).envcode.getActiveTab();
			var data = tab.data('data');
      		if (!data) return; // happens sometimes after tab close
			
	  		if (data.aceEditor)
				data.aceEditor.focus();
			
            var obj = { data: data, tab: tab };
            $(_this).trigger('changetab', obj);
        }

		function _beforeCloseTab(event, args){
			 var tab = $(_this).envcode.getActiveTab();
            if (!tab || !tab.data('data') || !tab.data('data').dirty)
                return;
			if (!confirm('Changes will be lost.\nContinue?'))
				args.cancel = true;
		}
    }

})(jQuery);