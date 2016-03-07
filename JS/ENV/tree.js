(function ($) {
    $.fn.envtree = function (settings) {
        var _this = this;
        var _lastActionNode;
        var _inSelection = false; // if selection is called through API, then prevent raising an event. NOTICE: if switching quickly between 2 nodes a few times, an endless loop will occurr without this
		var SITES_DIR = "/Sites"
		
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
                    'type': 'POST',
                    "url": settings.loadUrl,
                    "data": function (n) {
                        // the result is fed to the AJAX request `data` option
                        return {
                            "dir": n.attr ? n.attr("href") : SITES_DIR
                        };
                    }
                },

                "data": [
                    {   "data": $.envController.ROOT_NAME,
                        "state": "closed",
                        "attr": { "href" : $.envController.ROOT_PATH, "rel": "folder" }
                    }
                ]
            },
            "types": {
                "types": {
                    // The default type
                    "file": {
                        // If we specify an icon for the default type it WILL OVERRIDE the theme icons
                        "icon": {
                            "image": "/Admin/Masters/Js/jstree_pre1.0_stable/file.png"
                        }
                    },
                    // The `folder` type
                    "folder": {
                        "icon": {
                            //"image" : "http://static.jstree.com/v.1.0rc/_docs/_drive.png"
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
        // **************
        $.fn.envtree.create = function (data, skipRename) {
			var node = $(_this).jstree('create', _lastActionNode, 'first', data, null, skipRename);
            _lastActionNode = node;
        };

        $.fn.envtree.rename = function (data) {
            $(_lastActionNode).data(data.data);
            if (data.attr) {
                for (var attr in data.attr) {
                    $(_lastActionNode).attr(attr, data.attr[attr]);
                };
            }
        };

        $.fn.envtree.select = function (path) {
            if (!path)
                return;
            $(_this).jstree('deselect_all');
            _inSelection = true; // see def.
            var pathL = path.toLowerCase();
            $(_this).jstree('select_node', $(_this).find('li').filter(function () { return $(this).attr('href') != null && ($(this).attr('href').toLowerCase() == pathL) }));
            _inSelection = false;
        };

        // returns an array
        $.fn.envtree.getSelectedPath = function () {
            var tree = jQuery.jstree._reference($(_this));
            return tree.get_path(tree.get_selected())
        };

		$.fn.envtree.refresh = function(node) {			
			$(_this).jstree('refresh', null);	
			if (!node)
				node = $(_this).find('[rel=folder][href=' + SITES_DIR + ']');
			$(_this).jstree('open_node', node)			
		};
		
        // Context menu / Tree Events
        // **************************
        $(this).bind('loaded.jstree', function(){
             $(_this).jstree('open_node', $(_this).find('li:first'));
        });

        $(this).bind("select_node.jstree", function (e, data) {
            if (_inSelection) // see def.
                return;
            if (data.rslt.obj.attr('rel') != 'file')
                return;
            var href = data.rslt.obj.attr('href');
            var title = data.rslt.obj.attr('title');
            if (!href)
                return
            $(this).trigger('selectfile', { href: href, title: title });
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

        $(this).on('dblclick', 'li', function (ev) {
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
            
            //if ($(el).attr('rel') != 'folder')
            //    return;
            
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
        
            if ($(node).attr("rel") != "file") { // folder menu
                var items = {
                   
                    createFile: { // The "create file" menu item
                        label: "New File",
                        action: function (node) {
							_lastActionNode = node;
                            $(_this).trigger('create', { node: node, type: 'file' })
                        }
                    },
                    createFolder: { // The "create folder" menu item
                        label: "New Folder",
                        action: function (node) {
                            _lastActionNode = node;
                            $(_this).trigger('create', { node: node, type: 'folder' })
                        },
                    },
                    upload : {
                        separator_before: true,
                        label: "Upload",
                        submenu: {
                            uploadFile: { label: "Upload...", _class: "jstree-upload", separator_after: true },
                            extractFile: { label: "Extract Zip/RAR...", _class: "jstree-upload jstree-upload-archive" },
                        },
                    },
                    download : {
                        label: "Download",
                        action: function (node) {
                            $(_this).trigger('download', { href: $(node).attr('href'), type: $(node).attr("rel") })
                        },
                        separator_after: true
                    },
                    renameItem: { // The "rename" menu item
                        label: "Rename",
                        action: function (node) {
                            _lastActionNode = node;
                            this.rename(node)
                        }
                    },
                    deleteItem: { // The "delete" menu item
                        label: "Delete",
                        action: function (node) {
                            if (confirm('sure?'))
                                this.remove(node);
                        },
                        separator_after: true
                    },
                    refreshFolder: { // The "refresh" menu item
                        label: "Refresh",
                        action: function (node) {
                            $(_this).jstree('refresh', node);
                        },
                    },
                };
            }
            else { // file menu
				var addItemName = getAddName(node, 'item');
				var addConfigName = getAddName(node, 'config');
                var items = {
					createFile: { // The "create file" menu item
                        label: "Add",
						separator_after:true,
						submenu: {
                            newItemFile: { label: addItemName, 
								action: function (node){
									_lastActionNode = node;
                           			var file = node.find('a:first').text()
									$(_this).trigger('createForFile', { node: node, type: 'file', fileType: 'item', file: file, parent: node.parents('[rel=folder]:first') })
								}
							},
                            newConfigFile: { label: addConfigName, 
								action: function (node){
									_lastActionNode = node;
                           			var file = node.find('a:first').text()
									$(_this).trigger('createForFile', { node: node, type: 'file', fileType: 'config', file: file, parent: node.parents('[rel=folder]:first') })
								}
							}
                        },
                    },
                    renameItem: { // The "rename" menu item
                        label: "Rename",
                        action: function (node) {
                            _lastActionNode = node;
                            this.rename(node)
                        }
                    },
                    download : {
                        label: "Download",
                        action: function (node) {
                            $(_this).trigger('download', { href: $(node).attr('href'), type: $(node).attr("rel") })
                        },
                        separator_after: true
                    },
                     deleteItem: { // The "delete" menu item
                        label: "Delete",
                        action: function (node) {
                            if (confirm('sure?'))
                                this.remove(node);
                        },
                        separator_after: true
                    },
                };
            }

			if (node.attr('href') == SITES_DIR){
				items.createSite = {
					 label: "Create Site",
					 separator_before: true,
							action: function (node) {
								var siteName = prompt('Site Name:');
								if (!siteName) return;
								var domain = prompt('Site Domain (e.g. mysite.com):');
								if (!domain) return;
								$(_this).trigger('createSite', {name: siteName, domain: domain});
							},
				};
			}
            return items;
        }
		
		function getAddName(node, type){
			var text = node.find('a:first').text();
			if (!text) return type;
			var lastDot = text.lastIndexOf('.');
			if (lastDot <= 0) return type;
			return text.substr(0, lastDot) + "." + type + text.substr(lastDot);
		}
    }
})(jQuery);