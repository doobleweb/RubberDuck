(function ($) {
    var _envtree, _envcode, _sqltree, _sqlcode, _envlayout, _saveButton, _runButton, _loaded;
	
    $.envController = function (settings) {
        $.envController.ENV_ID = Math.floor((Math.random() * 1000000000) + 1);
        $.envController.ROOT_PATH = '/Sites';
        $.envController.ROOT_NAME = 'Sites';
	
        // init:
        _envtree = settings.envtree;
        _envcode = settings.envcode;
        _sqltree = settings.sqlmanager;
		_sqlcode = settings.sqlcode;
		_saveButton = settings.saveButton;
		_runButton = settings.runButton;
	
		$.envsettings();
        _envtree.envtree({ loadUrl: "/api/FileManager/getdir" });
		_envcode.envcode({tabsContainer: settings.tabsContainer});
		
        _envlayout = $('<div></div>')
        $(_envlayout).envlayout({ envresults: settings.envresults });
        $.envtrans({ transTextbox: settings.transTextbox, transArea: settings.transArea });
        $.envstats();
		
		if (_sqltree){
			_sqltree.envsql({ loadUrl: "/rubberduck/sql?type=gettables" });
			$.sqlTableDesign({ envcode: _envcode });
			$.sqlquery({ });
		}
        
        $(window).bind('beforeunload', function () {
            if (_envcode.envcode.anyTabDirty())
                return "There are unsaved changes"
        });

        $(window).bind('unload', function () {
            $.envtrans.hide({ sync: true }); // stop stats tracking cookie
			_saveOpenTabs();
        });

        // Public Methods
        // **************
        $.envController.findFilesUrl = function () {
            return '/api/FileManager/findfiles'; // 'term' will be passed to server
        }
        $.envController.uploadFileUrl = function () {
            return '/api/FileManager/uploadfile';
        }
        $.envController.uploadArchiveUrl = function () {
            return '/api/FileManager/uploadarchive';
        }

        $.envController.save = function (options) {	
            var file, content;
            if (!options)
                options = new Object();
			var tabs = [];
			if (options.saveAll)
				tabs = _envcode.envcode.getAllTabs();
			else
				tabs[0] = _envcode.envcode.getActiveTab();
			$(tabs).each(function(i, activeTab){
				activeTab = $(activeTab)
				if (activeTab) {
					var activeTabData = _envcode.envcode.getTabData(activeTab);
					if (activeTabData) {
						if (!activeTabData.noSave) {
							file = activeTabData.file;
							if (file) {
								content = activeTabData.aceEditor.getSession().getValue();
							}
						} else if (activeTabData.type === 'sql') {
							try {
								$(".sql-tabledesign input, .sql-tabledesign select").blur();
								
								if (typeof activeTabData.actions !== 'undefined' && 
								 	activeTabData.actions !== []) {
									var createtable = activeTabData.createtable;
									if (activeTabData.createtable) {
										// activeTabData.tableName = prompt('Table Name?', '');
										activeTabData.createtable = false;
										// $(activeTab).find('span').text(activeTabData.tableName);																	
									}	

									$.post('/rubberduck/sql?type=save&tableName=' + activeTabData.tableName, { 'queue': escape(JSON.stringify(activeTabData.actions)) }, function (data) {
										// alert(data);
										activeTabData.actions = [];
										_envcode.envcode.clearDirty(activeTab);	
										_sqltree.jstree("refresh").jstree("open_all");
										
										/*if (createtable) {
											var k = activeTabData.tableName;
											_envcode.envcode.closeTab();
											$.envController.loadTableDesign({ name: k, createtable: false });
										}*/
									});
								} else {
									_envcode.envcode.clearDirty(activeTab);	
								}
							} catch (e) { }		
						}
					}
				}
				
				if (file) { // save in server + preview
					$.post('/api/FileManager/savefile', {file: file, content: content }, function (result) {
						if (result.content != 'ok' && result.content.indexOf('"ok"') != 0)
							alert(result)
						else {
							_envcode.envcode.clearDirty(activeTab);
							activeTabData.saveTime = new Date();
							$(_saveButton).val('Saved (' + activeTabData.saveTime.toString('HH:mm:ss') + ')')
							$(_saveButton).attr('disabled', true)
							if (options.showPreview)
								$.envtrans.show();
						}
					})
				}
				else { // preview only
					if (options.showPreview)
						$.envtrans.show();
				}
			});
			
        }

        $.envController.updateLayout = function () {
            
        }
        $.envController.showPreview = function (options) {
            if (options && options.cont)
                $.envtrans.show({ cont: true }); // preview only
            else
                $.envController.save({ showPreview: true });
        }
        $.envController.showCode = function (options) {
            $.envtrans.hide(options);
        }
		$.envController.closeTabs = function (){
			var tabs = _envcode.envcode.getAllTabs();
			if (!tabs) return;
			$(tabs).each(function(i, tab){
				_envcode.envcode.closeTab(tab);
			});
		}
        $.envController.findInFiles = function (options) {
            var exp = options.exp;
            var types = options.types;
            var sites = options.sites;
            var path = ''
            if (sites == 'this') {
                var pathArr = _envtree.envtree.getSelectedPath();
                if (pathArr && (pathArr.length >= 2)) {
                    path += '/' + pathArr[0] + '/' + pathArr[1]; // site name
                }
            }
            else if (sites == 'master') {
                path = '/sites/master';
            }
            if (!path)
                path = $.envController.ROOT_PATH;
            $.post('/api/FileManager/findinfiles', { exp: exp ,path: path, types: types }, function (result) {
                _envlayout.envlayout.showResults({ content: result.content, contentLoading: options.exp });
            });
            _envlayout.envlayout.showResults({ loading: options.exp });
        }
        $.envController.showStats = function () {
            $.envstats.show({ callback: function (result) {
                var tabdata = { file: 'Statistics', noSave: true, noEditor: true, type: 'stats' }
                _envcode.envcode.add('Stats', result, tabdata)
            }});
        }
        $.envController.loadCodeFile = function (data) {
            var file = data.href;
            var fileTitle = data.title;
            $.post('/api/FileManager/getfile',{file : file}, function (result) {
                //tabID = tabID.replace(/[^\w|^\+|^-]*/g, "_"); // replace non-alphanumeric
                console.log(file)
                var tabdata = { file: file }
                _envcode.envcode.add(fileTitle, result.content, tabdata)
                if (data.line) {
                    var pos = { line: data.line, ch: data.ch }
                    _envcode.envcode.setCursor(pos);
                }
            });
        };
		
        $.envController.loadTableDesign = function (data) {
            $.sqlTableDesign.show({ tableName: data.name, createtable: data.createtable, callback: function (result) {
             	var tabdata = { file: data.name, noSave: true, createtable: data.createtable, noEditor: true, type: 'sql', tableName: data.name };
                _envcode.envcode.add(data.name, result, tabdata);
            }});
        }

        $.envController.loadNewQuery = function (tableName) {
            $.sqlquery.show({ tableName: tableName, callback: function (result) {
                var tabdata = { file: 'Query: ' + tableName, noSave: true, noEditor: true, type: 'query', tableName: tableName };
                _envcode.envcode.add('Query: ' + tableName, result, tabdata);
            }});
        }
		
		
        // Buttons
        // *******
        _saveButton.attr('disabled', true);

        $(_saveButton).click(function () {
            $.envController.save();
        })

        // Tree FTP Events
        // ************
        _envtree.bind('selectfile', function (e, data) {
            $.envController.loadCodeFile(data);
        });

        _envtree.bind('renamefile', function (e, data) {
            var file = data.href;
            var fileTitle = data.title;
            $.get('/api/FileManager/renamefile/' + file + '/' + fileTitle, function (result) {
                _envtree.envtree.rename(result);
            });
        })
        _envtree.bind('removefile', function (e, data) {
            var file = data.href;
            var fileTitle = data.title;
            $.get('/api/FileManager/removefile/' + file, function (result) {
            });
        })
        _envtree.bind('create', function (e, data) {
            var type = data.type;
            var parent = data.node;
            var dir = $(parent).attr('href');
            $.get('/api/FileManager/create/' + dir + '' + type, function (result) {
                _envtree.envtree.create(result);
            });
        })
		_envtree.bind('createForFile', function (e, data) {
            var fileType = data.fileType; // item
            var file = data.file;
			var parent = data.parent;
            var dir = $(parent).attr('href');
            $.get('/api/FileManager/create/' + dir + '/file/' + fileType + '/' + file, function (result) {
				var skipRename = false;
				if (fileType)
					skipRename = true;
                _envtree.envtree.create(result, skipRename);
            });
        })
        _envtree.bind('download', function (e, data) {
            var iframe = $('#downloadIFrame');
            if (!iframe.length) {
                $('body').append('<iframe id="downloadIFrame" style="display:none"></iframe>');
                iframe = $('#downloadIFrame');
            }
            iframe.attr('src', '/api/FileManager/download/' + data.href + '/' + data.type);
        });
		_envtree.bind('createSite', function (e, data) {
            $.get('/api/FileManager/createsite/' + data.name + '/' + data.domain, function(){
				_envtree.envtree.refresh();
			});
        });
        // End FTP Events
        // ****************

        // Tree SQL Events
        // ************
		if (_sqltree){
			_sqltree.bind('selectfile', function (e, data) {
				$.envController.loadNewQuery(data.name);
			});
			
			_sqltree.bind('designtable', function (e, data) {
				$.envController.loadTableDesign(data);
			});
			
			_sqltree.bind('deletetable', function (e, data) {
				if (window.confirm('Are you sure?')) {
					$.post('/rubberduck/sql?type=delete_table&tableName=' + data.name, function (data) {
						_sqltree.jstree("refresh").jstree("open_all");
					});
				}
			});	
			
			_sqltree.bind('renametable', function (e, data) {
				$.post('/rubberduck/sql?type=rename_table&tableName=' + data.name + '&newTableName=' + prompt('New table name?'), function (data) {
					_sqltree.jstree("refresh").jstree("open_all");
				});
			});
		}
		
        /*_envtree.bind('renamefile', function (e, data) {
            var file = data.href;
            var fileTitle = data.title;
            $.get('/api/FileManager/renamefile&value=' + file + '&value2=' + fileTitle, function (result) {
                _envtree.envtree.rename(result);
            });
        })
        _envtree.bind('removefile', function (e, data) {
            var file = data.href;
            var fileTitle = data.title;
            $.get('/api/FileManager/removefile&value=' + file, function (result) {
            });
        })
        _envtree.bind('create', function (e, data) {
            var type = data.type;
            var parent = data.node;
            var dir = $(parent).attr('href');
            $.get('/api/FileManager/create&value=' + dir + '&value2=' + type, function (result) {
                _envtree.envtree.create(result);
            });
        })
        _envtree.bind('download', function (e, data) {
            var iframe = $('#downloadIFrame');
            if (!iframe.length) {
                $('body').append('<iframe id="downloadIFrame" style="display:none"></iframe>');
                iframe = $('#downloadIFrame');
            }
            iframe.attr('src', '/api/FileManager/download&value=' + data.href + '&type=' + data.type);
        });*/
        // End SQL Events
        // ****************
		
        // Env Code Events
        // ****************
        _envcode.bind('tabadded', function () {
        });

        _envcode.bind('changetab', function (e, args) {
            var data = args.data;
            _saveButton.attr('disabled', !data.dirty)
            if (data.saveTime)
                $(_saveButton).val('Saved (' + data.saveTime.toString('HH:mm:ss') + ')')
            else
                $(_saveButton).val('Save Now')

            var file = data.file;
            _envtree.envtree.select(file);
            //$.envtrans.setActiveFile(file);
        })

        _envcode.bind('changecontent', function () {
            $(_saveButton).removeAttr('disabled');
            $(_saveButton).val('Save Now');
        });
		
        // End Code Events
        // ****************

		_envlayout.bind('selectresult', function (e, data) {
            $.envController.loadCodeFile(data);
        });
		
		shortcut.add("Ctrl+S", function() {
			/*if (_saveButton.is(':disabled'))
            	return;*/
            $.envController.save();
		});
		shortcut.add("Ctrl+Q", function(){
			_envcode.envcode.closeTab()
		})
		shortcut.add("Ctrl+.", function(){
			_envcode.envcode.tabLeftRight(false)
		})
		shortcut.add("Ctrl+,", function(){
			_envcode.envcode.tabLeftRight(true)
		})
		shortcut.add("Ctrl+Enter", function(){
			$(_runButton).click()
		})
		shortcut.add("Ctrl+Shift+S", function(){
			$.envController.save({saveAll:true});
		})
        /*_envcode.bind('request_save', function () {
            if (_saveButton.is(':disabled'))
                return;
            $.envController.save();
        });*/
		
		// Open Tabs Save+Load
		// ********************
		_saveOpenTabs = function(){
			if (!_loaded) return;
			if (!$.envsettings.keepTabs()){
				$.cookie('_openTabs', '');
				return;
			}
			
			var arr = [];
			var tabs = _envcode.envcode.getAllTabs();
			$(tabs).each(function(i, tab){
				var data = _envcode.envcode.getTabData($(tab));
				arr.push({file:data.file, title:data.title});
			});
			
			$.cookie('_openTabs', JSON.stringify(arr), { expires: 30 });
		};
		
		// load open tabs from prev session
        if ($.envsettings.keepTabs()){
			var arr = $.parseJSON($.cookie('_openTabs'));
			if (arr){
				$(arr).each(function(i, tabData){
					$.envController.loadCodeFile({ href: tabData.file, title: tabData.title })
				});
			}
		}
		// End Of Tabs Save+Load
		// **********************
		
		_loaded = true;
    };

})(jQuery);