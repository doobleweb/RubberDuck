;(function ($, window, document, undefined) {

	// Create the defaults once
	var pluginName = 'appTabs',
		defaults = {
			generateNewTabs: false,
			container: null,
			allowDuplicate: false,
			tooManytabsMode : false
		};

	// The actual plugin constructor
	function Plugin(element, options) {
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;

		this.tabsHolder = element;
		this.$tabsHolder = $(this.tabsHolder);
		this.$container = $(this.options.container).eq(0);


		this.init();
	}

	Plugin.prototype.init = function () {
		var i = this;

		i.tabs = this.$tabsHolder.find('li'), i.contents = $();


		if (i.options.generateNewTabs && !i.options.container) {
			if (console) console.warn('container must be specified for allowing new tabs to be created. bye bye :(');
			return false;
		}

		i.hasTabs = (i.tabs.length) ? true : false;

		if (i.hasTabs) {
			// loop over hardcoded tabs and initialize them
			i.initExistingTabs();
		}

		// if generateNewTabs is true, create new tabs button
		if (i.options.generateNewTabs) {
			i.createNewTabButton();
		}

		/*
		if (i.options.tooManytabsMode) {
			i.createManyTabsNav();
		}
		*/

		i.focusOnfirst();
		i.setOutsideEvents();
	};

	Plugin.prototype.initExistingTabs = function () {
		var i = this;
		i.tabs.each(function () {
			var tab = $(this),
				content = $(tab.attr('data-uniq'));

			// set Events to each Tab
			i.attachEvents(tab, content);

			// add tab's content to contents Collection
			i.contents = i.contents.add(content);

		}).first().trigger('mousedown.activeTab')
	};

	/*
	Plugin.prototype.createManyTabsNav = function () {
		var i = this,
				parent = i.$tabsHolder.parent();

				function scrollEnd() {
					if(i.tabsHolder.scrollLeft == 0 && !parent.hasClass('manyTabs_begin')) {
						parent.addClass('manyTabs_begin');
					} else if (i.tabsHolder.scrollLeft != 0 && parent.hasClass('manyTabs_begin')) {
						parent.removeClass('manyTabs_begin');
					}
				}


		$('<a href="#" class="manyTabs_left" />').click(function(){ 
			i.$tabsHolder.animate({scrollLeft: '-=150px'}, {complete : scrollEnd, duration : 150}) 
		}).insertAfter(i.tabsHolder)

		$('<a href="#" class="manyTabs_right" />').click(function(){ 
			i.$tabsHolder.animate({scrollLeft: '+=150px'}, {complete : scrollEnd, duration : 150}) 
		}).insertAfter(i.tabsHolder)
		
	}
	*/
	
	Plugin.prototype.attachEvents = function (tab, content) {
		var i = this;

		// event: click on tab to activate it
		tab.on('mousedown.activeTab',function (ev) {
		    // middle-button close
        	if (ev.which != 2)
                i.setActive(tab, content);
		});

		// using mouseup coz FF can't catch Mid button on 'click', and 'mousedown' causes the tooltip to remain
		tab.on('mousedown',function (ev) {
			if (ev && ev.which == 2) {
				//ev.preventDefault();
    	}
		});

		tab.on('mouseup',function (ev) {
		    // middle-button close
      	if (ev && ev.which == 2) {
          tab.find('.icon_close').click();

          if (i.options.tooManytabsMode) {
			i.tooManyTabsCheck()
		  }
      	}
		});
		
		// event: click on close button to close tab
		tab.find('.icon_close').click(function (e) {
			var closeArgs= {cancel:false}
			$(i.tabsHolder).trigger('beforeCloseTab', closeArgs);
			if (!closeArgs.cancel)
				i.closeTab(tab, content);
			e.stopPropagation();
		});
	};

	Plugin.prototype.setActive = function (tab, content) {
		var i = this;

		if (typeof(tab) == 'string'){ // find by uniq id
			content = i.getTabContent(tab)
			tab = i.getTab(tab)
		}
		
		// set Active Tab
		i.tabs.filter('.active').removeClass('active');
		tab.addClass('active');

		// set Active Content
		i.contents.filter('.active').removeClass('active');
		content.addClass('active');
		
		$(content).focus()
		i.$tabsHolder.trigger('tabSelect')
	};

	Plugin.prototype.getTab = function (uniq){
		var str = uniq.replace(/([ ;&,.+*~\':"!^$[\]()=>|\/@])/g, '_');
		if (str.indexOf('#') != 0) str = '#' + str;
		return this.$tabsHolder.find('[data-uniq=' + str + ']')
	}
	
	Plugin.prototype.getTabContent = function (uniq){
		var str = uniq.replace(/([ ;&,.+*~\':"!^$[\]()=>|\/@])/g, '_');
		if (str.indexOf('#') != 0) str = '#' + str;
		return this.$container.find($(str));
	}
	
	Plugin.prototype.getActiveTab = function(){
		return this.$tabsHolder.find('.tab_menu_item.active')
	}
	
	Plugin.prototype.closeTab = function (tab, content) {
		var i = this;

		// by using .detach() (instead of remove) jQuery keeps all data associated with the removed element,
		// this would be useful if we want to restore a tab.
		if (tab.hasClass('active')) {
			
			if (tab.next('.tab_menu_item').length) {
				tab.next('.tab_menu_item').mousedown();
				
			} else {
				tab.prev().mousedown();
				
			}
		}

		tab.remove();
		content.remove();

		i.tabs = i.tabs.not(tab);
		i.contents = i.contents.not(content);
		i.hasTabs = i.tabs.length > 0;

		if (i.options.tooManytabsMode) {
			i.tooManyTabsCheck()
		}
	};


	Plugin.prototype.createNewTabButton = function () {
		var i = this,
			newTabBtn = $('<li class="newTab_button">+</li>');

		if (i.hasTabs) {
			newTabBtn.insertAfter(i.tabs.last());
		} else {
			newTabBtn.appendTo(i.tabsHolder);
		}

		newTabBtn.click(function (e) {
			i.generateNewTab({
				focus: true
			});
			e.preventDefault();
		});
	};

	Plugin.prototype.generateNewTab = function (dataObj) {
		var i = this,
			options, tabTemplate, contentTemplate, newTab, newContent;

		/* 
		Params : 
			tabTitle : [string] the title of the tab
			content : [string] the content that will be inject into the tab's content
			uniq  : [string] unique indenifier of the tab. will be use to determen if the same tab is already open
			focus : [boolean] on true, tab will be focused on creation
			index : [number]  An integer indicating the position of the element, 
			negative integer will counting backwards from the last element in the set.
			onCreate : [function(tab,content)] function that will be triggered on tab creation.
		*/

		options = $.extend({}, {
			tabTitle: 'new Tab',
			content: '',
			uniq: 'unsaved',
			focus: false,
			index: -1,
			data: null
		}, dataObj);

		// remove unWanted characters that can interfere with matching the selector
		var orgUniq = options.uniq;
		options.uniq = options.uniq.replace(/([ #;&,.+*~\':"!^$[\]()=>|\/@])/g, '_');
		// debugger;
		if (options.uniq !== 'unsaved' && $('#' + options.uniq).length) {
			if (i.options.allowDuplicate) {
				// if there is already element with this ID, 
				// generate the same id with Random number after it. 
				options.uniq = options.uniq + (Math.round(Math.random() * 10000));
			} else {
				// if duplication is not allowed - kill tab generating
				if (console) console.warn('Tab generating aborted, samilar tab already existed', options);
				i.setActive(options.uniq);
				dataObj.success = false;
				return false;
			}
		}

		// NOTE : I hardcoded the <textarea/>, my be better to add it manually at options.content?
		tabTemplate = '<li class="tab_menu_item" data-uniq="#' + options.uniq + '"><span>' + options.tabTitle + '</span><em class="icon icon_close">X</em></li>';
		contentTemplate = '<div class="editorContainer tab_content fit" id="' + options.uniq + '">' + options.content + '<div class="clear"></div> </div>';

		if (i.hasTabs) {
			newTab = $(tabTemplate).insertAfter(i.tabs.eq(options.index));
			newContent = $(contentTemplate).insertAfter(i.contents.eq(options.index));
		} else {
			newTab = $(tabTemplate).prependTo(i.tabsHolder);
			newContent = $(contentTemplate).prependTo(i.$container);
		}

		newTab.data('data', options.data);
		i.tabs = i.tabs.add(newTab);
		i.contents = i.contents.add(newContent);


		// attach event listeners to the new tab
		i.attachEvents(newTab, newContent);


		// if defined, trigger onCreate(tab,content)
		if (i.options.onCreate) {
			i.options.onCreate(newTab, newContent);
		}

		if (i.options.tooManytabsMode) {
			i.tooManyTabsCheck()
		}


		// if true, focus on tab  
		// else, make shore that at list one tab is active
		//if (options.focus) newTab.click();
		//else i.focusOnfirst();

		if (orgUniq){
			newTab.attr('title', orgUniq).tooltip({
				delay: 0, showURL: false
			}); //title+tooltip plugin
		}
		
		i.hasTabs = true;
		dataObj.success = true;
		
		i.setActive(newTab, newContent);
	};

	Plugin.prototype.tooManyTabsCheck = function () {
		/*
		var i = this,
				parent = i.$tabsHolder.parent();

		i.isTooManyTabs = i.tabsHolder.scrollWidth > i.tabsHolder.clientWidth;

		if(i.isTooManyTabs && !parent.hasClass('hasTooManyTabs')) {
			parent.addClass('hasTooManyTabs manyTabs_begin');
		} else if (!i.isTooManyTabs && parent.hasClass('hasTooManyTabs')) {
			parent.removeClass('hasTooManyTabs');
		}
		console.log('tooManyTabsCheck', i.isTooManyTabs)
		*/
		var i = this;
		// console.log('holderHeight', i.$tabsHolder.outerHeight(true))
		
		i.holderHeight = i.$tabsHolder.outerHeight(true)
		if(i.holderHeight < 26) {
			i.holderHeight = 26;
		}
		
		i.holderHeight += 2;
		
		i.$tabsHolder.parent().css({
			height : i.holderHeight  + 'px'
		})
		.siblings('.content').css({
			marginTop : i.holderHeight + 'px'
		})
	};

	Plugin.prototype.focusOnfirst = function () {
		var i = this;
		if (!i.options.focus && i.tabs.length && !i.tabs.is('.active')) {
			i.tabs.first().trigger('mousedown.activeTab')
		}
	};

	Plugin.prototype.setOutsideEvents = function () {
		var i = this;

		$(i.tabsHolder).on('newTab', function (event, dataObj) {
			i.generateNewTab.call(i, dataObj);
		});
		$(i.tabsHolder).on('getTab', function (event, dataObj) {
			dataObj.result = i.getTab.call(i, dataObj.uniq);
		});
		$(i.tabsHolder).on('getTabContent', function (event, dataObj) {
			dataObj.result = i.getTabContent.call(i, dataObj.uniq);
		});
		$(i.tabsHolder).on('getActiveTab', function (event, dataObj) {
			dataObj.result = i.getActiveTab.call(i);
		});
		$(i.tabsHolder).on('setActiveTab', function (event, dataObj) {
			dataObj.result = i.setActive.call(i, dataObj);
		});
		$(i.tabsHolder).on('tooManyTabsCheck', function (event, dataObj) {
			i.tooManyTabsCheck.call(i);
		});
	};

	// A really lightweight plugin wrapper around the constructor, 
	// preventing against multiple instantiations
	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};

})(jQuery, window, document);