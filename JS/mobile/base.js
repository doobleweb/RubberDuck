var _preventAjaxReload = false;

{
	var _loadAjaxUrl, _refreshAjaxUrl, _curPage;
	var _pages = [];

	$.refreshPage = function(){
		if (!_curPage || !_refreshAjaxUrl)
			return;
		_loadAjaxUrl = _refreshAjaxUrl
		$(_curPage).each(loadAjaxToPage);
	}
	
	$( '[data-role=page]').live('pagebeforecreate', function(){
		// disable jquery-mobile enhancements
		$(this).find('select').attr('data-role', 'none');
		$(this).find('input').attr('data-role', 'none');
	});
	
	$(function(){
		setFormAction($('form'));
	});
	
	// set full urls + ajax-forms
	function setFormAction(form)
	{
		// because mobile html is local, all urls must use a FULL HTTP ADDRESS - setting forms
		$(form).each(function(){
			var action = $(this).attr('action')
			if (!action)
				$(this).attr('action', _url)
			else if (action.indexOf('http') < 0)
				$(this).attr('action', _domain + action);
		
			// set AjaxForm
			$(form).ajaxForm( {
				beforeSubmit: function(formData, frm){
					$(frm).trigger('ajaxFormBeforeSubmit', [{formData:formData, frm:frm}])
				},
				success:function(responseText, statusText, xhr, frm){
					var result = $(frm).triggerHandler('ajaxFormSuccess')
					if (result !== false)
					{
						var redirect = $(frm).attr('data-redirect');
						if (redirect)
							$.mobile.changePage(redirect);
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					var error = $(form).attr('data-error');
					if (error)
						alert(error);
					else
						alert(textStatus + " - " + errorThrown);
				}});	
		});	
	}

	// load the data-loadurl to page (AJAX)
	// ******************************
	$('[data-loadurl]').live('click', function(){
		_loadAjaxUrl = _domain + $(this).attr('data-loadurl')
		if (_loadAjaxUrl.indexOf('?') < 0)
			_loadAjaxUrl += '?';
		else
			_loadAjaxUrl += '&';
		var rnd=Math.floor(Math.random()*999999999)
		_loadAjaxUrl += 'token_unique=' + rnd;
	});
	
	function loadAjaxToPage(event){
		_curPage = this;
		if (_preventAjaxReload){
			_preventAjaxReload = false;
			return;
		}
		
		var pageID = $(this).attr('id');
		
		if (_loadAjaxUrl)
			_pages[pageID] = _loadAjaxUrl;		
		else
			_loadAjaxUrl = _pages[pageID];
			
		if (_loadAjaxUrl){
			$(this).find('[data-role=content]').html('');
			$(this).find('[data-role=content]').html('<img style="margin: 30% auto 0; padding: 5px; background: #000; border-radius: 4px; width: 30px; display: block;" src="/content/images/loader.gif" />');
		
			$(this).find('[data-role=content]').load(_loadAjaxUrl, function(){
				setFormAction($(this).find('form'));
				$(this).parents('[data-role=page]:first').trigger('datashow');
			});
			_refreshAjaxUrl = _loadAjaxUrl;
			_loadAjaxUrl = null;
		}
	};
	
	$( '[data-role=page]').live('pagebeforeshow', loadAjaxToPage);
	
	// "datashow" event for data-loadurl
	$( '[data-role=page]').live('datashow', function(event){
		$(this).find('form').each(function(){
			if (!$(this).attr('action'))
				$(this).attr('action', _loadAjaxUrl);		
		});
		
		var pageID = $(this).attr('id');
		$(this).find('form').ajaxForm( {
		success:function(){
			// reload page (to see form updates)
			$('[data-role=page][id=' + pageID + ']').each(loadAjaxToPage)
		}});
	});
	
	// END OF data-url load
	// ********************
	
}