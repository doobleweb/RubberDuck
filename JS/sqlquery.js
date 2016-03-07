(function ($) {	
	function escapeHTML() {
    	return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}
	
    $.sqlquery = function (settings) {
		function queryAddRow(table, row) {
			var tr = $("<tr>").appendTo(table);
			table.find('th').each(function () {
				tr.append($("<td></td>").text(row[$(this).text()]));
			});
		}
		
		$.sqlquery.show = function (options) {
			var containerId = "#sqlquery-" + Math.floor((Math.random() * 1000000000) + 1);
			
            var callback = options.callback;
            var container = $('<div></div>').attr("id", containerId.substring(1)).addClass("sqlquery");
  
            callback(container[0].outerHTML);
		  	container = container.html(''); // reset html

			$.getJSON('/go/sql', { type: 'getcolumns', tableName: options.tableName }, function (columns) {  
				var colModel = [];
				$.each(columns, function () {
					colModel.push({ name: this.name, display: this.name, width: 200 });
				});
				
				$(containerId).empty().css('overflow', 'hidden').flexigrid({
					url: '/go/sql?type=query&tableName=' + options.tableName,
					dataType: 'json',
					colModel: colModel,
					usepager: false,
					title: options.tableName,
					useRp: false,
					rp: 15,
					showTableToggleBtn: true,
					width: $(containerId).width(),
					height: 500,
					preProcess: function(data) { 
						for (var i = 0; i < data.rows.length; i++) {
							for (var cell in data.rows[i].cell) {
								if (typeof data.rows[i].cell[cell] === 'string') {
									data.rows[i].cell[cell] = data.rows[i].cell[cell].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
								}
							}
						}
						
						return data;
						//return data.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
					}
				});
			});
		}
	};
})(jQuery);