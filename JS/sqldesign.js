(function ($) {	
    $.sqlTableDesign = function (settings) {
		var _envcode = settings.envcode;
		
		function hasLength(typeName) {
			return (typeName === 'char' ||
					typeName === 'nchar' ||
					typeName === 'nvarchar' ||
					typeName === 'varchar' ||
					typeName === 'sysname');
		}
		
		function isCompatible(oldDataType, newDataType) {
			if ((oldDataType === 'text' || oldDataType === 'ntext') && (newDataType !== 'varchar' && newDataType !== 'nvarchar')) {
				return false;
			}
			if ((newDataType === 'text' || newDataType === 'ntext') && (oldDataType !== 'varchar' && oldDataType !== 'nvarchar')) {
				return false;
			}
			if ((newDataType === 'date' || newDataType === 'datetime') && (oldDataType !== 'varchar' && oldDataType !== 'nvarchar' && oldDataType !== 'date' && oldDataType !== 'datetime')) {
				return false;
			}
			if ((oldDataType === 'date' || oldDataType === 'datetime') && (newDataType !== 'varchar' && newDataType !== 'nvarchar' && newDataType !== 'date' && newDataType !== 'datetime')) {
				return false;
			}
			if (oldDataType === 'geometry' || oldDataType === 'geography') {
				return false;
			}
			if ((newDataType === 'geometry' || newDataType === 'geography') && (oldDataType !== 'varchar' && oldDataType !== 'nvarchar')) {
				return false;
			}			
			return true;
		}
		
		function createList(list, selected) {
			var select = $("<select>");
			
			for (var i = 0; i < list.length; i++) {
				var option = $("<option>").text(list[i]).val(list[i]);
				
				if (list[i] === selected) {
					option.attr("selected", true);
				}
				
				select.append(option);
			}
			
			return select;
		}	
		
		function createRadio(list, name, onChangeCallback) {
			var ul = $('<ul>');
			for (var i = 0; i < list.length; i++) {
				ul.append(
					$('<li>')
						.append($('<input type="radio">').addClass('radio').val(list[i].value).attr('name', name).attr('disabled', list[i].disabled === true).change(onChangeCallback))
						.append($('<span>').addClass('radio_label').append(list[i].text).css('color', list[i].disabled ? 'gray' : '').click(function () { var g = $(this).parent().find('input'); if (!g.attr('disabled')) g.attr('checked', true).change(); })));
			}
			return ul;
		}
		
		function createDataTypeList(selected) { 
			var dataTypes = ['bigint', 'bit', 'char', 'date', 'datetime', 'float', 
							 'geography', 'geometry', 'int', 'money', 'nchar', 'ntext',
							 'nvarchar', 'smallint', 'smallmoney', 'text', 'varchar'];
			
			return createList(dataTypes, selected);
		}
						
		function addAsterisk() {
			var tab = _envcode.envcode.getActiveTab();
 			var data = tab.data('data');
			if (data.dirty)
				return;
			data.dirty = true;
			var tabTitle = tab.find('span:first');
			tabTitle.html(tabTitle.html() + "<span class='tabDirty'>*</span>") // add *
		}
		
		function containsText(list, text) {
			for (var i = 0; i < list.length; i++) {
				if (list[i].toLowerCase() === text.toLowerCase())
					return true;
			}
			
			return false;
		}
		
		function withPrefix(word, upper) {		
			var a = upper ? 'A ' : 'a ';
			var an = upper ? 'An ' : 'an ';
			
			var firstCharacter = word.charAt(0).toLowerCase();
			if (firstCharacter === 'u' || firstCharacter === 'a' || firstCharacter === 'i' || firstCharacter === 'o' || firstCharacter === 'e')
				return an + word;
			
			return a + word;
		}
		
		function createRelations(tableName, withTables) {
			function createNewRelationInterface() {				
				var tableNameSingular = tableName.singularize();
				var wrapper = $('<table>')
					.append($('<tbody>')
						.append($('<tr>')
							.append($('<th>').text('To'))
							.append($('<td>').append(
								createList(['Select Table'].concat(withTables))
									.addClass('relation-to')
									.change(function () {
										changeTableNames();
										changeRelationType($(wrapper).find("input[name='relation-type']:checked").val());
										addOrRemoveAccess();
									}))))
						.append($('<tr>')
							.append($('<th>').text('Type'))
							.append($('<td>').append(createRadio([
								{ value: 'onetomany', text: withPrefix(tableNameSingular, true) + ' can have many <span class="tableNamePlural"></span> (1 - M).' },
								{ value: 'manytoone', text: '<span class="tableNameSingularUpper"></span> can have many ' + tableNameSingular.pluralize() + ' (M - 1).' },
								{ value: 'manytomany', text: withPrefix(tableNameSingular, true) + ' can have many <span class="tableNamePlural"></span>, and <span class="tableNameSingular"></span> can have many ' + tableNameSingular.pluralize() + ' (M - M).' },
								{ value: 'onetoone', text: withPrefix(tableNameSingular, true) + ' can have one <span class="tableNameSingularNoPrefix"></span> (1 - 1).', disabled: true }
							], 'relation-type', function () { changeRelationType($(this).val()); })))))
					.append($('<tfoot>')
						.append($('<tr>')
							.append($('<td>')
								.attr('colspan', 2)
								.attr('align', 'right')
								.append($('<button>')
									.text('Add Relation')
									.click(function () {
										var type = $(wrapper).find("input[name='relation-type']:checked").val();
										
										var action = {
											type: 'add_relation',
											to: $(wrapper).find('.relation-to option:selected').text(),
											relationType: type,
											constraintName: 'FK_' + Math.floor((Math.random() * 10000000000) + 1) + tableName + $(wrapper).find('.relation-to option:selected').text()
										};								
										
										if (type === 'onetomany' || type === 'manytoone') {
											action.fieldName = $(wrapper).find('.extended-property input').val();
											if (action.to === tableName) {
												action.access_parent = $(wrapper).find('.relation-access-parent').val();
												action.access_children = $(wrapper).find('.relation-access-children').val();
												
												addRelation($('#' + tableName + ' .columns table'), 
															action.constraintName,
															action.fieldName, 
															type === 'onetomany' ? $(wrapper).find('.relation-to option:selected').text() : tableName, 
															action.to, 
															'ID', 
															type,
															action.access_parent);
															
												addRelation($('#' + tableName + ' .columns table'), 
															action.constraintName,
															action.fieldName, 
															type === 'onetomany' ? $(wrapper).find('.relation-to option:selected').text() : tableName, 
															action.to, 
															'ID', 
															type,
															action.access_children);														
											} else {
												addRelation($('#' + tableName + ' .columns table'), 
															action.constraintName,
															action.fieldName, 
															type === 'onetomany' ? $(wrapper).find('.relation-to option:selected').text() : tableName, 
															action.to, 
															'ID', 
															type,
															action.to);											
											}
											

										} else if (type === 'manytomany') {
											//(table, constraintName, columnName, columnTable, relationToTable, relatedColumnName, relationType, access) {
											action.relationTable = $(wrapper).find('.extended-property input').val();
											addRelation($('#' + tableName + ' .columns table'),
												'FK_' + Math.floor((Math.random() * 10000000000) + 1) + tableName + action.to,
												action.to,
												tableName + 'ID',
												action.relationTable,
												'ID',
												'manytomany',
												action.to);	
										}
											
										addAsterisk();
										addAction(action);
										
										wrapper.parent().append(createNewRelationInterface());
										wrapper.remove();
									})))));
	
				function changeTableNames() {
					var selectedTableName = $(wrapper).find('.relation-to option:selected').text();
					var singular = selectedTableName.singularize();
					
					$(wrapper).find('.tableNameSingular').text(withPrefix(singular, false));
					$(wrapper).find('.tableNameSingularNoPrefix').text(singular);
					$(wrapper).find('.tableNameSingularUpper').text(withPrefix(singular, true));
					$(wrapper).find('.tableNamePlural').text(selectedTableName.pluralize());					
				}	
				
				function findManyToManyTableName() {
					var t = tableName + '_To_' + $(wrapper).find('.relation-to option:selected').val();
					var i = 1;
					
					while (containsText(withTables, t)) {
						t = t + i;
						i++;
					}
					
					return t;
				}
				
				function changeRelationType(relationType) {
					$(wrapper).find('.extended-property').remove();
					switch (relationType) {
						case 'manytomany':
 							$(wrapper).append($('<tr>')
								.addClass('extended-property')
								.append($('<th>').text('Relation Table'))
								.append($('<td>').append($('<input type="text">').val(findManyToManyTableName()))));
							break;
							
						case 'onetomany':
							$(wrapper).find('tbody').append($('<tr>')
								.addClass('extended-property')
								.append($('<th>').text('Field Name'))
								.append($('<td>').append($('<input type="text">').val(tableName.singularize() + 'ID')).append(' @ ' + $(wrapper).find('.relation-to option:selected').text())));	
								
							break;
							
						case 'manytoone':
							$(wrapper).find('tbody').append($('<tr>')
								.addClass('extended-property')
								.append($('<th>').text('Field Name'))
								.append($('<td>').append($('<input type="text">').val($(wrapper).find('.relation-to option:selected').text().singularize() + 'ID')).append(' @ ' + tableName)));	
								
							break;							
					}
					
					addOrRemoveAccess();
				}
				
				function addOrRemoveAccess() {
					var relationType = $(wrapper).find("input[name='relation-type']:checked").val();
					$(wrapper).find('.relation-access').remove();
					
					if (tableName === $(wrapper).find('.relation-to option:selected').text()) { 
						$(wrapper)
							.find('tbody')
							.append($('<tr>')
								.addClass('relation-access')
								.append($('<th>').text('Access Parent'))
								.append($('<td>').append($('<input type="text">').addClass('relation-access-parent').val('children'))))
							.append($('<tr>')
								.addClass('relation-access')
								.append($('<th>').text('Access Children'))
								.append($('<td>').append($('<input type="text">').addClass('relation-access-children').val('parent'))))								
					}
				}
				
				changeTableNames();
				return wrapper;
			}
			
			var container = $('<div>')
				.addClass('relations')
				.append($('<h1>').text('Relations'))
				.append(createNewRelationInterface());
				
			return container;
		}
		
		function addAction(action) {
			var data = _envcode.envcode.getActiveTab().data('data');
		
			var actions = data.actions || [];
			actions.push(action);
			
			data.actions = actions;

			_envcode.envcode.getActiveTab().data('data', data);
			// alert(JSON.stringify(action));
		}
		
		function addRelation(table, constraintName, columnName, columnTable, relationToTable, relatedColumnName, relationType, access) {
			var tr = $("<tr></tr>")
				.data('columnName', columnName)
				.data('constraintName', constraintName)
				.data('columnTable', columnTable)
				.data('relationType', relationType)
				.addClass('relation')
				.css('background-color', '#D1FFC9')
				.append(
					$("<th></th>")
						.attr("align", "left")
						.width('5px')
						.click(function () {
							$(".current")
								.text($(".current")
									.find("select option:selected")
									.text())
								.removeClass("current")
								.css("padding-left", "5px");
							
							$(this).parent().parent().parent().find("tr.selected-row").each(function () {
								$(this).css('background-color', $(this).hasClass('relation') ? '#D1FFC9' : '')
									.removeClass("selected-row");
							});
							
							tr
								.css("background-color", "#ADB6D6")
								.addClass("selected-row");
						})
				)
				.append(
					$("<td></td>")
						.addClass('columnName')
						.css('padding', '5px')
						.text(access)
				)
				.append(
					$("<td></td>")
						.text('Relation')
						.addClass("datatype")
				)
				.append($('<td>'))
				.append($('<td>'));
		
			table.find('tfoot').prepend(tr);				
		}
		
		function addRow(table, columnName, typeName, maxlength, isNullable) {
			// if (typeName === 'sysname') typeName = 'text';
			if (maxlength === -1) maxlength = 'max';
			
			var tr = $("<tr></tr>")
				.append(
					$("<th></th>")
						.attr("align", "left")
						.width('5px')
						.click(function () {
							$(".current")
								.text($(".current")
									.find("select option:selected")
									.text())
								.removeClass("current")
								.css("padding-left", "5px");
							
							$(this).parent().parent().parent().find("tr.selected-row").each(function () {
								$(this).css('background-color', $(this).hasClass('relation') ? '#D1FFC9' : '')
									.removeClass("selected-row");
							});
							
							tr
								.css("background-color", "#ADB6D6")
								.addClass("selected-row");
						})
				)	
				.append(
					$("<td></td>")
						.addClass('columnName')
						.data('very-dirty', Math.floor((Math.random() * 1000000000) + 1))
						.append(
							$("<input type='text'>")
								.val(columnName)
								.keydown(function () {
									addAsterisk();
								})
								.blur(function () {
									if (columnName !== $(this).val()) {
										var alreadyExists = false;
										
										var td = $(this).parent();
										var newValue = $(this).val();
										
										td.parent().parent().find('.columnName').each(function() {
											// alert($(this).find('input').val().toUpperCase() + ' === ' + newValue.toUpperCase());
											if (td.data('very-dirty') !== $(this).data('very-dirty') && $(this).find('input').val().toUpperCase() === newValue.toUpperCase()) {
												alreadyExists = true;
												return false;
											}
										});
										
										if (!alreadyExists) {
											addAction({
												'type': 'rename_column',
												'oldColumnName': columnName,
												'newColumnName': newValue
											});								
											columnName = newValue;
										} else {
											alert(newValue + ' already exists in this table.');
											$(this).val(columnName);
										}
									}
								})
						)
				)
				.append(
					$("<td></td>")
						.text(typeName)
						.addClass("datatype")
						.click(function () {
							if (!$(this).hasClass("current")) {
								var t = createDataTypeList($(this).text()).change(function () {								
									if (!isCompatible(typeName, $(this).val())) {
										alert('Cannot convert ' + typeName + ' to ' + $(this).val());
										$(this).val(typeName);
									} else {									
										addAsterisk();
										if (typeName !== $(this).val()) {
											var oldDataType = typeName;
											typeName = $(this).val();
											
											addAction({
												'type': 'alter_column',
												'columnName': columnName,
												'columnType': typeName,
												'maxlength': maxlength,
												'isNullable': isNullable
											});
										
											if (hasLength(typeName)) {
												var m = $("<input type='text'>");
														
												if (oldDataType === 'text' || oldDataType === 'ntext') {
													m.attr('disabled', true).val('max');
												} else {
													m.val(maxlength)
													.keydown(function () {
														addAsterisk();
													})
													.blur(function () {
														if (maxlength != $(this).val()) {
															maxlength = $(this).val();
															
															addAction({
																'type': 'alter_column',
																'columnName': columnName,
																'columnType': typeName,
																'maxlength': maxlength,
																'isNullable': isNullable
															});
														}
													});
												}
															
												tr
													.find('.maxlength')
													.empty()
													.css("background", "")	
													.append(m);												
											} else {
												tr
													.find('.maxlength')
													.empty()
													.css("background", "#eee");
											}
										}
									}
								});
								$(this).addClass("current").empty().append(t).css("padding", "0");
								t.focus();
							}
						})
						.focusout(function () {
							$(".current").text($(".current").find("select option:selected").text()).removeClass("current").css("padding-left", "5px");
						})
				);
				
			if (hasLength(typeName)) { 
				tr.append(
					$("<td></td>")
						.addClass("maxlength")
						.append(
							$("<input type='text'>")
								.val(maxlength)
								.keydown(function () {
									addAsterisk();
								})
								.blur(function () {
									if (maxlength != $(this).val()) {
										maxlength = $(this).val();
										
										addAction({
											'type': 'alter_column',
											'columnName': columnName,
											'columnType': typeName,
											'maxlength': maxlength,
											'isNullable': isNullable
										});
									}
								})
						)
				)
			} else {
				tr.append($("<td></td>").addClass("maxlength").css("background", "#eee"));
			}
			
			tr.append(
				$("<td></td>")
					.addClass("allownullscontainer")
					.append(
						$("<input type='checkbox'>")
							.change(function () {
								addAsterisk();
								isNullable = $(this).is(':checked');
								
								addAction({
									'type': 'alter_column',
									'columnName': columnName,
									'columnType': typeName,
									'maxlength': maxlength,
									'isNullable': isNullable
								});
							})
							.attr("checked", isNullable)
					)
			);
			
			table.find('tbody').append(tr);
			return tr;
		}
		
        // Public Methods
        // **************
        $.sqlTableDesign.show = function (options) {
			var containerId = "#sql-tabledesign-" + Math.floor((Math.random() * 1000000000) + 1);
			
            var callback = options.callback;
            var container = $('<div></div>').attr("id", containerId.substring(1)).addClass("sql-tabledesign");
  
            callback(container[0].outerHTML);
		  	container = container.html(''); // reset html
			$('#' + options.tableName).css('overflow', 'scroll');
			
			var table = $("<table></table>").attr("cellspacing", 0).attr("cellpadding", 0);
			
			table.append($('<thead>')
				.append($("<tr></tr>")
					.append($("<th></th>").attr("align", "left").width('7px'))
					.append($("<th></th>").attr("align", "left").text("Column Name").width('135px'))
					.append($("<th></th>").attr("align", "left").text("Data Type").width('110px'))
					.append($("<th></th>").attr("align", "left").text("Max Length").width('110px'))
					.append($("<th></th>").attr("align", "left").text("Allow Nulls").width('60px'))
				)
			);
			
			table.append($('<tbody>'));
			table.append($('<tfoot>'));
			
			function dirtyAddRowTable() {
				var columnName = 'column' + Math.floor((Math.random() * 50) + 1);
				addRow($(this).parent().parent().parent(), columnName, 'varchar', 256, true).find('.columnName input').focus();
				addAsterisk();
				addAction({
					'type': 'add_column',
					'columnName': columnName,
					'columnType': 'varchar',
					'maxlength': 256,
					'isNullable': true
				});				
			}
			
			table.find('tfoot')
				.append($('<tr>')
					.append($('<th>'))
					.append($('<td>').click(dirtyAddRowTable))
					.append($('<td>').click(dirtyAddRowTable))
					.append($('<td>').click(dirtyAddRowTable))
					.append($('<td>').click(dirtyAddRowTable))
					.height(20));
			
			if (options.createtable) {
				addAction({ type: 'create_table' });
				addAsterisk();
				addRow(table, 'ID', 'int', 4, false);
				addAction({
					type: 'add_relation',
					constraintName: 'FK_Sites_' + options.tableName,
					to: 'Sites',
					relationType: 'manytoone',
					fieldName: 'SiteId'
				});				
				addRelation(table, 'FK_Sites_'+options.tableName, 'SiteId', options.tableName, 'Sites', 'ID', 'onetomany', 'Sites');
			} else {
				$.getJSON('/go/sql', { type: 'getcolumns', tableName: options.tableName }, function (columns) {
					$.getJSON('/go/sql', { type: 'getrelations', tableName: options.tableName }, function (relations) {
						// alert(JSON.stringify(relations));
						
						$.each(columns, function () {
							var column = this;
							var isRelation = false;
							$.each(relations, function () {
								if ((options.tableName === this['k_table'] && column.name === this['fk_column']) /*||
									(options.tableName === this['PK_Table'] && column.name === this['PK_Column'])*/) {
									isRelation = true;
									return false;
								}
							});
							
							if (!isRelation) {
								addRow(table, this.name, this.typename, this.maxlength, this["is_nullable"]);					
							}
						});
						
						$.each(relations, function () {
							var metadata = {};
							try { 
								metadata = JSON.parse(this['metadata']);
							} catch (e) {
							
							}
							// alert(JSON.stringify(this));
							if (metadata !== null && typeof metadata.relationType !== 'undefined' && metadata.relationType === 'manytomany') {
								//alert(JSON.stringify(metadata));
								addRelation(table,
											this['constraint_name'],
											table + 'ID',
											metadata['relationTable'],
											this['fk_column'],
											'ID',
											'manytomany',
											metadata['access_' + options.tableName]);
							} else {
								if (this['k_table'] === this['pk_table']) {
									addRelation(table, 
												this['constraint_name'],
												this['fk_column'], 
												options.tableName === this['k_table'] ? this['k_table'] : this['k_table'],
												options.tableName === this['k_table'] ? this['pk_table'] : this['k_table'],
												this['pk_column'],
												options.tableName === this['k_table'] ? 'onetomany' : 'manytoone',
												metadata['access_parent']);									
									
									addRelation(table, 
												this['constraint_name'],
												this['fk_column'], 
												options.tableName === this['k_table'] ? this['k_table'] : this['k_table'],
												options.tableName === this['k_table'] ? this['pk_table'] : this['k_table'],
												this['pk_column'],
												options.tableName === this['k_table'] ? 'onetomany' : 'manytoone',
												metadata['access_children']);											
								} else {
									addRelation(table, 
												this['constraint_name'],
												this['fk_column'], 
												options.tableName === this['k_table'] ? this['k_table'] : this['k_table'],
												options.tableName === this['k_table'] ? this['pk_table'] : this['k_table'],
												this['pk_column'],
												options.tableName === this['k_table'] ? 'onetomany' : 'manytoone',
												metadata['access_' + options.tableName.toLowerCase()]);
								}
							}
						});
					});
				});
			}
			
			shortcut.add("Delete", function() {
				if (!confirm("Are you sure you want to delete this column/relation? This can delete data.")) return;
				var activeTab = _envcode.envcode.getActiveTab();
				if (activeTab.data('data').type === 'sql') {
					var row = $(activeTab.attr('data-uniq')).find('.selected-row');			
					if (row.length > 0) {
						addAsterisk();
						
						var action = { 'type': 'drop_column' };
						var constraintName = row.data('constraintName');
						
						if (row.hasClass('relation')) {
							var relationType = row.data('relationType');
							if (relationType === 'manytomany') {
								addAction({ 
									'type': 'delete_table',
									'tableName': row.data('columnTable')
								});
								
								row.remove();
								return;
							} else {
								addAction({
									'type': 'drop_foreign_key',
									'tableName': row.data('columnTable'),
									'name': constraintName
								});
							}
							
							action.tableName = row.data('columnTable');
							action.columnName = row.data('columnName');
							
							$(activeTab.attr('data-uniq')).find('.relation').each(function () {
								if ($(this).data('constraintName') === constraintName) {
									$(this).remove();
								}	
							});										
						} else {	
							action.columnName = row.find('.columnName input').val();
							row.remove();
						}
						
						addAction(action);			
					}
				}
			});
				
			$(containerId).append($('<div>').addClass('columns').append($('<h1>').text('Columns')).append(table));
			
			$.getJSON('/go/sql?type=gettables', function (tables) {
				$(containerId).append(createRelations(options.tableName, tables));
			});
				
			_envcode.envcode.getActiveTab().data('data').getRelations = function () {
				var relations = [];
				$(_envcode.envcode.getActiveTab().attr('data-uniq')).find('.relation').each(function () {
					relations.push({
						to: $(this).find('select.relation-to option:selected').text(),
						type: $(this).find('select.relation-type option:selected').text()
					});
				});
				
				return relations;
			};				
		}
    };
})(jQuery);