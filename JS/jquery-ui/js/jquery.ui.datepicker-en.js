jQuery(function($){
	$.datepicker.regional['en'] = {
		closeText: 'Close',
		prevText: '&#x3c;'+'הקודם"',
		nextText: "הבא"+'&#x3e;',
		currentText: "היום",
		monthNames: ['January','February','March','April','May','June',
		'July','August','September','October','November','December'],
		monthNamesShort: ['1','2','3','4','5','6',
		'7','8','9','10','11','12'],
		dayNames: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
		dayNamesShort: ['Sun\'','Mon\'','Tue\'','Wed\'','Thu\'','Fri\'','Sat'],
		dayNamesMin: ['Sun\'','Mon\'','Tue\'','Wed\'','Thu\'','Fri\'','Sat'],
		weekHeader: 'Wk',
		dateFormat: 'dd/mm/yy',
		firstDay: 0,
		isRTL: true,
		showMonthAfterYear: false,
		yearSuffix: ''};
	$.datepicker.setDefaults($.datepicker.regional['he'])
});