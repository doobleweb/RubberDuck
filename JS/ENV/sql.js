(function ($) {
    $.fn.envsql = function (settings) {
        var _this = this;
        var _lastActionNode;
        var _inSelection = false; // if selection is called through API, then prevent raising an event. NOTICE: if switching quickly between 2 nodes a few times, an endless loop will occurr without this

        // Init
        // ****
        $(this).jstree({
            core: { "animation": 0 },
            "plugins": ["themes", "json_data", "ui", "crrm", "search", "types", "contextmenu"],
            "json_data": {
                // This tree is ajax enabled - as this is most common, and maybe a bit more complex
                // All the options are almost the same as jQuery's AJAX (read the docs)
                "ajax": {
                    // the URL to fetch the data
                    "url": settings.loadUrl
                },

                "data": [
                    {   "data": "Database",
                        "state": "closed",
                        "attr": { "href" : $.envController.ROOT_PATH, "rel": "database" }
                    }
                ]
            },
            "types": {
                "types": {
                    // The default type
                    "default": {
                        // If we specify an icon for the default type it WILL OVERRIDE the theme icons
                        "icon": {
                            // "image": "/sites/dev/content/images/table.png"
                        }
                    },
 
                    "database": {
                        "icon": {
                            // "image" : "/sites/dev/content/images/database.png"
                        }
                    }
                }
            },
            "contextmenu": {
                "items": _getItemMenu
            },
            "ui": {
                "select_limit": 1
            }
        });

        
        // Public Methods	
        $.fn.envsql.create = function (data) {
            var node = $(_this).jstree('create', _lastActionNode, 'first', data);
            _lastActionNode = node;
        };

        $.fn.envsql.rename = function (data) {
            $(_lastActionNode).data(data.data);
            if (data.attr) {
                for (var attr in data.attr) {
                    $(_lastActionNode).attr(attr, data.attr[attr]);
                };
            }
        };

        $.fn.envsql.select = function (path) {
            if (!path)
                return;
            $(_this).jstree('deselect_all');
            _inSelection = true; // see def.
            var pathL = path.toLowerCase();
            $(_this).jstree('select_node', $(_this).find('li').filter(function () { return $(this).attr('href') != null && ($(this).attr('href').toLowerCase() == pathL) }));
            _inSelection = false;
        };

        // returns an array
        $.fn.envsql.getSelectedPath = function () {
            var tree = jQuery.jstree._reference($(_this));
            return tree.get_path(tree.get_selected())
        };

        // Context menu / Tree Events
        // **************************
        $(this).bind('loaded.jstree', function(){
             $(_this).jstree('open_node', $(_this).find('li:first'));
        });

        $(this).bind("select_node.jstree", function (e, data) {
            if (_inSelection) // see def.
                return;
   	
            $(this).trigger('selectfile', { name: $.trim(data.rslt.obj.text()) });
        });

        $(this).bind("rename_node.jstree", function (e, data) {
            var href = data.rslt.obj.attr('href');
            var title = data.rslt.name;
            if (!href)
                return
            $(this).trigger('renamefile', { href: href, title: title });
        })

        $(this).bind("delete_node.jstree", function (e, data) {
            var href = data.rslt.obj.attr('href');
            var title = data.rslt.name;
            if (!href)
                return
            $(this).trigger('removefile', { href: href });
        })

        $(this).bind("create_node.jstree", function (e, data) {
            if (data.args[1] == 'file') {
                //$(this).trigger('createfile', {href: href});
            }
        })

        $(this).on('dblclick', 'li[rel=database]', function (ev) {
            // Close/Open Folder on DBL-Click
            var el = ev.target;
            var curEl = ev.currentTarget;

            // NOTICE: click func is called a few times coz its li inside li inside li...
            // so we need to get the 2 li's involved and see they are the same
            if (el.tagName.toLowerCase() != 'li')
                el = $(el).parents('li:first')[0]; 
            if (curEl.tagName.toLowerCase() != 'li')
                curEl = $(curEl).parents('li:first')[0]; 
            if (!el || !ev.currentTarget || (el != ev.currentTarget))
                return;
            
            if ($(el).attr('rel') != 'database')
                return;
            
            if ($(_this).jstree('is_open', $(el)))
            	$(_this).jstree('close_node', $(el));
            else
                $(_this).jstree('open_node', $(el));
        });
        // End Tree Events
        // ***************

        // Events
        // ******
        $('.jstree-upload').on('hover', function(){
            if (this.uploader)
                return;
            
            var isArchive = $(this).hasClass('jstree-upload-archive');
            if (isArchive)
                var url = $.envController.uploadArchiveUrl();
            else
                var url = $.envController.uploadFileUrl();

            // based on internal context menu structure(seen on jquery.jstree.js -> under $.vakata.context = {...} )
            var contextNode = $($.vakata.context.par);
            this.uploader = new qq.FileUploader({
                element: this,
                action: url + '&folder=' + contextNode.attr('href'),
                template: '<div class="qq-uploader">' + 
                    '<div class="qq-upload-drop-area" style="display:none"></div>' +
                    '<div class="qq-upload-button" style="padding-bottom:1px">' + $(this).html() + '</div>' +
                    '<ul class="qq-upload-list" style="display:none"></ul>' + 
                 '</div>',
                onSubmit: function(id, fileName){
                    // this is a global function to hide the context menu (seen on jquery.jstree.js)
                    $.vakata.context.hide();
                    contextNode.find('a:first').addClass('jstree-loading');
                },
                onProgress: function(id, fileName, loaded, total){
                    // if multiple files are uploaded, onComplete will be fired for each one. we want to keep showing the loading sign..
                    contextNode.find('a:first').addClass('jstree-loading');
                },
                onComplete: function(id, fileName, responseJSON){
                    contextNode.find('a:first').removeClass('jstree-loading');
                    $(_this).jstree('refresh', contextNode);
                },
                
            });
            
            // the upload element is on top and transparent. but we need the hover event to be recieved on the menu's li
            // so background will be applied
            $(this).find('.qq-uploader').hover(
                function(){ $(this).find('.qq-upload-button').addClass('vakata-hover') },
                function(){ $(this).find('.qq-upload-button').removeClass('vakata-hover') }
            );

            // need to set 'title' otherwise chrome adds its own 'No file chosen' title
            if (isArchive)
                $(this).find('input[type=file]').removeAttr('multiple').attr('title', 'Extract a Zip/RAR archive');
            else
                $(this).find('input[type=file]').attr('title', 'Upload Files');
        });

        // Private Methods
        // ***************
		
        // Context Menu:
        function _getItemMenu(node) {
			return {
				newTableItem: { 
					label: "New Table...",
					action: function (node) {
						$(_this).trigger('designtable', { name: prompt('Table Name?'), createtable: true });
						_lastActionNode = node;
					}
				},
				refreshItem: { 
					label: "Refresh",
					action: function (node) {
						$(_this).jstree("refresh").jstree("open_all");
						_lastActionNode = node;
					},
					separator_after: true
				},				
				designItem: { 
					label: "Design",
					action: function (node) {
						$(_this).trigger('designtable', { name: $.trim(node.children("a").text()), createtable: false });
						_lastActionNode = node;
					}
				},
				editItem: { 
					label: "Edit",
					action: function (node) {
						$(_this).trigger('selectfile', { name: $.trim(node.children("a").text()) });
						_lastActionNode = node;
					},
                    separator_after: true
				},
				renameItem: { 
					label: "Rename",
					action: function (node) {
						$(_this).trigger('renametable', { name: $.trim(node.children("a").text()) });
						_lastActionNode = node;
					}
				}, 
				deleteItem: { 
					label: "Delete",
					action: function (node) {
						$(_this).trigger('deletetable', { name: $.trim(node.children("a").text()) });
						_lastActionNode = node;
					}
				}				
			};
        }
    }
})(jQuery);