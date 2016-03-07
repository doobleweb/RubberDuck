(function ($) {
    $.envsettings = function (settings) {
        $.envsettings.zen = function(val){
			return _defaultTrue('_envZen', val);
		}
		$.envsettings.keepTabs = function(val){
			return _defaultTrue('_envKeepTabs', val);
		}
		
		_defaultTrue = function(key, val){
			if (val === undefined){ // get
				var rv =  $.cookie(key);
				if (rv == '0') return false;
				return true;
			}
			else{
				if (!val)
					$.cookie(key, '0', { expires: 365 });
				else
					$.cookie(key, '1', { expires: 365 });
			}
		}
    }
})(jQuery);