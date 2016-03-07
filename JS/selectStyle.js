// The Select element ignore CSS, this is a workaround to make it work.
$.fn.selectStyle = function(){
	return this.each(function(){
		var self = $(this), selfMask;
			
		self.wrap('<div class="selectWrap" />');
		
		$('<span class="selectMask" /><em class="icon icon_select" />').insertAfter(self);
		
		selfMask = self.next('.selectMask');
		
		self.css({ 'opacity' : 0, 'z-index' : 10 });
		
		self.change(function(){
			selfMask.text(self.find('option:selected').text())
		}).change();
	});
}

