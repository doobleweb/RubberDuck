(function ($) {

    $.envstats = function (settings) {
        // Public Methods
        // **************
        $.envstats.show = function (options) {
            var callback = options.callback;

            $.get('/api/FileManager/getstats/' + $.envController.ENV_ID, function (result) {
                if (!result.requests || !result.requests.length)
                    return;

                var container = $('<div class="stats-container"></div>');
                // must call callback to add to DOM. cannot add to DOM and then remove, coz .data() doesn't work if you do so.
                callback(container[0].outerHTML);
                container = $('.stats-container').html(''); // reset html
                // Create main container with right+left panels
                var containerLeft = $('<div class="left"></div>');
                var containerRight = $('<div class="right"></div>');
                container.append(containerLeft);
                container.append(containerRight);

                // create Requests UL
                var requestUL = $('<ul class="stats-request stats-list" style="display: block"></ul>');
				containerLeft.html('<h2>Requests:</h2>');
                containerLeft.append(requestUL);

                $.each(result.requests, function (iReq, req) {
                    // request li
                    var requestLI = $('<li class="stats-item"></li>');
                    requestUL.append(requestLI);
                    requestLI.append('<span class="stats-toggle stats-chupchic">+</span>');
                    var itemName = $('<div class="stats-toggle-double stats-item-name">' +
                        '<span class="stats-request-url" title="' + req.url + '">' + req.url + '</span>' +
                        '<span class="stats-item-reqtype">' + req.type + '</span>' +
                        '<span class="stats-item-duration">' + req.duration + 'ms</span>' +
                        '</div>');
                    requestLI.append(itemName);
                    itemName.data(req);
                    itemName.attr('itemtype', 'request');

                    if (req.template) {
                        var ul = $('<ul class="stats-templates stats-list"></ul>');
                        requestLI.append(ul);
                        _appendTemplate(ul, req.template, true);
                    }
                    if (req.actions && req.actions.length) {
                        var ul = $('<ul class="stats-actions stats-list"></ul>');
                        requestLI.append(ul);
                        _appendActions(ul, req.actions);
                    }
                });
            });
        }

        // tree toggle + active selection
        var togglefunc = function () {
            $(this).siblings('ul').toggle();
            var chup = $(this).parent().children('.stats-chupchic:first');
            if (chup.html() == '+')
                chup.html('-');
            else
                chup.html('+');
        }

        $('.stats-toggle').on('click', togglefunc);
        $('.stats-toggle-double').on('dblclick', togglefunc);
        $('.stats-toggle-double').on('click', function () {
            if ($(this).hasClass('stats-item-name')) {
                $('.stats-container .stats-item-name').removeClass('active')
                $(this).addClass('active')
                _showDetails($(this));
            }
        });

        // Private Methods
        // ***************
        // Recursively add templates to tree
        _appendTemplate = function (templateUL, template, isTopLevel) {
            var templateLI = $('<li class="stats-item"></li>');
            templateUL.append(templateLI);

            if (template.children && template.children.length)
                templateLI.append('<span class="stats-toggle stats-chupchic">+</span>');
            else
                templateLI.append('<span>&nbsp;</span>');

            var topLevelSpan = '';
            if (isTopLevel)
                topLevelSpan = '<span class="stats-item-type">Template: </span>';
            var itemName = $('<div class="stats-toggle-double stats-item-name">' + topLevelSpan +
                        '<span class="stats-template-path" title="' + template.path + '">' + template.name + '</span>' +
                        '<span class="stats-item-duration">' + template.duration + 'ms</span>' +
                        '</div>');
            templateLI.append(itemName);
            if (template.error)
                itemName.addClass('stats-error');
            itemName.data(template);
            itemName.attr('itemtype', 'template');

            if (template.children && template.children.length) {
                var childUL = $('<ul class="stats-templates stats-list"></ul>');
                templateLI.append(childUL);

                $.each(template.children, function (iChild, child) {
                    _appendTemplate(childUL, child);
                });
            }
        }

        _appendActions = function (actionsUL, actions) {
            $(actions).each(function (iAction, action) {
                var li = $('<li class="stats-item"></li>');
                actionsUL.append(li);
                var itemName = $('<div class="stats-toggle-double stats-item-name">' +
                        '<span class="stats-item-type">Action: </span>' +
                        '<span class="stats-action-name">' + action.name + '</span>' +
                        '<span class="stats-item-duration">' + action.duration + 'ms</span>' +
                        '</div>');
                li.append(itemName);
                if (action.error)
                    itemName.addClass('stats-error');
                itemName.data(action);
                itemName.attr('itemtype', 'action');
            });
        }

        _showDetails = function (activeElement) {
            var type = activeElement.attr('itemtype');
            var data = activeElement.data();
            if (!type)
                return;

            var fPrm = function (data, el) {
                el.html('<ul class="stats-prm"></ul>');
                if (data && data.length) {
                    var ul = el.find('ul');
                    $(data).each(function (iPRM, prm) {
                        ul.append('<li></li>');
                        ul.find('li:last').text(prm.name + ' = \'' + prm.value + '\'');
                    });
                }
            }

            var fSQL = function (data) {
                var sqlTab = _getTab('SQL');
                sqlTab.html('<ul class="stats-sql"></ul>');
                if (data.sqlList && data.sqlList.length) {
                    var ul = sqlTab.find('ul');
                    $(data.sqlList).each(function (iSQL, sql) {
                        ul.append('<li></li>');
                        ul.find('li:last').text(sql.sql);
                    });
                }
            }

            var fSJS = function (data) {
                var sjsTab = _getTab('SJS');
                sjsTab.html('<ul class="stats-sjs"></ul>');
                if (data.sjsList && data.sjsList.length) {
                    var ul = sjsTab.find('ul');
                    $(data.sjsList).each(function (iSJS, sjs) {
                        ul.append('<li></li>');
                        var li = ul.find('li:last');
						if (sjs.sjs){
							li.text(sjs.sjs);
							li.html(li.html().replace(/\t/g, '&nbsp;&nbsp;&nbsp;'))
						}
                        li.html(li.html().replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;'))
                    });
                }
            }

            var fTree = function (dataset, ul) {
                if (!dataset)
                    return;
                for (var table in dataset) {
                    ul.append('<li></li>');
                    var li = ul.find('li:last');
                    li.html('<span class="stats-table">' + table + '</span><ul></ul>');
                    var rowUL = li.find('ul');
                    $(data.dataset[table]).each(function (iRow, row) {
                        rowUL.append('<li></li>');
                        var rowLI = rowUL.find('li:last');
                        rowLI.html('<span class="stats-row">[' + iRow + ']</span><ul></ul>');
                        var cellUL = rowLI.find('ul:last');
                        for (var cell in row) {
                            cellUL.append('<li></li>');
                            var cellLI = cellUL.find('li:last');
                            var cellContent = '';
                            if (row[cell])
                                cellContent = $('<span></span>').text(row[cell]).html();
                            cellLI.html('<span class="stats-cell">' + cell + ': ' + cellContent + '</span><ul></ul>');
                        }
                    });
                }
            }

            var fPreview = function (data) {
                var prevTab = _getTab('Preview');
                prevTab.html('')
                var req = activeElement.parents('.stats-request li').find('[itemtype=request]:first');
                if (req && req.data() && req.data().htmlHead) {
                    var head = req.data().htmlHead;
                    var iframe = document.createElement("iframe");

                    iframe.className = 'stats-preview';
                    prevTab[0].appendChild(iframe);
                    idoc = iframe.contentWindow.document;
                    $(iframe).load(function () { $(iframe).height($(idoc).height()); $(iframe).width($(idoc).width()); });
                    idoc.write("<html><head>" + head + "</head><body>" + data.content + "</body></html>");
                    idoc.close();

                    //$(iframe).width('100%');
                    //$(iframe).attr('scrolling', 'no');
                }
            }

            switch (type) {
                case 'request':
                    _buildDetailsTabs(type, ['Preview', 'QueryString', 'Globals', 'Form', 'Form Tree', 'Cookies']);
                    fPrm(data.qsList, _getTab('QueryString'));
                    fPrm(data.globalList, _getTab('Globals'));
                    fPrm(data.formList, _getTab('Form'));
					var cookieTab = _getTab('Cookies');
					cookieTab.html('');
					cookieTab.append('<h3>Cookies-Recieved</h3><div></div>');
                    fPrm(data.reqCookieList, cookieTab.find('div:last'));
					cookieTab.append('<h3>Cookies-Sent</h3><div></div>');
                    fPrm(data.resCookieList, cookieTab.find('div:last'));
                    
					if (data.template)
                        fPreview(data.template);

                    var ftreeTab = _getTab('Form Tree');
                    ftreeTab.html('<ul class="stats-frmtree"></ul>');
                    fTree(data.dataset, ftreeTab.find('ul'));

                    break;
                case 'action':
                    _buildDetailsTabs(type, ['Form Tree', 'Database Save', 'Parameters', 'SJS', 'SQL']);

                    var frmTab = _getTab('Form Tree');
                    frmTab.html('<ul class="stats-frmtree"></ul>');
                    var ul = frmTab.find('ul');
                    fTree(data.dataset, ul);

                    var saveTab = _getTab('Database Save');
                    saveTab.html('<ul class="stats-dbsave"></ul>');
                    var ul = saveTab.find('ul');
                    $(data.saveList).each(function (iSave, save) {
                        ul.append('<li>Save #' + (iSave + 1) + '</li>');
                        var li = ul.find('li:last');
                        li.append('<ul></ul>');
                        fTree(save, li.find('ul:last'));
                    });

                    fPrm(data.prmList, _getTab('Parameters'));
                    fSQL(data);
                    fSJS(data);

                    break;
                case 'template':
                    _buildDetailsTabs(type, ['Preview', 'Source', 'Parameters', 'SJS', 'SQL']);

                    var srcTab = _getTab('Source');
                    if (!data.error) {
                        if (!data.content)
                            data.content = '';
                        srcTab.text(data.content);
                        srcTab.html(srcTab.html().replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;'))
                    }
                    else {
                        srcTab.html('<div class="stats-error">' + data.error + '</div>');
                    }

                    fPreview(data);

                    fPrm(data.prmList, _getTab('Parameters'));
                    fSQL(data);
                    fSJS(data);

                    break;
            }
        }

        _buildDetailsTabs = function (itemType, tabsArray) {
            var containerRight = $('.stats-container .right');
            if (!containerRight.find('.stats-details-tabs').length)
                containerRight.append('<ul class="stats-details-tabs"></ul><div stlye="clear:both"></div>');

            var tabs = containerRight.find('.stats-details-tabs');
            // build tabs (header)
            if (tabs.attr('itemtype') != itemType) {
                tabs.html('');
                containerRight.find('.stats-tab').remove();
                tabs.attr('itemtype', itemType);

                $.each(tabsArray, function (iTab, tab) {
                    tabs.append('<li>' + tab + '</li>');
                    containerRight.append('<div class="stats-tab stats-tab-' + tab.replace(/ /g, '-').toLowerCase() + '"></div>');
                });

                tabs.children('li').click(function () {
                    $(this).siblings().removeClass('active');
                    $(this).addClass('active');
                    containerRight.find('.stats-tab').hide();
                    containerRight.find('.stats-tab-' + $(this).text().replace(/ /g, '-').toLowerCase()).show();
                });

                tabs.children(':first').click();
            }
        }

        _getTab = function (tabName) {
            var containerRight = $('.stats-container .right');
            return containerRight.find('.stats-tab-' + tabName.replace(/ /g, '-').toLowerCase());
        }
    };

})(jQuery);