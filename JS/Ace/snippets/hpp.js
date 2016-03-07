define("ace/snippets/hpp",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.snippetText = "\
## Access Modifiers\n\
snippet @bb\tSJSBlock\n\
	@{\n\t${1:code}\n''}@\n\
snippet @bil\tSJSInLine\n\
	@{${1:code}}@\n\
snippet @form\tForm\n\
	[[\\$Form]]\n\t${1:form}\n[[\\$EndForm]]\n\
snippet @con\tConfig\n\
	[[Config ds:where=\"${1:Field} ='[[${2:Parameter}]]'\" ]]\n\
snippet @if\tBEIf\n\
	@if(${1:Expression})\n\t${2:code}\n@endif\n\
snippet @ifelse\tBEIfElse\n\
	@if(${1:Expression})\n\t${2:code}\n@else\n\t${3:code}\n@endif\n\
snippet @loop\tBEForLoop\n\
	@loop(var ${1:i} = 0;${1:i}<${2:array.length};${1:i}++)\n\t${3:code}\n@endloop\n\
snippet @isjs\tImportSJS\n\
	[[\\$SJS src='/SJS/${1:FileName}.js']]\n\
snippet @icss\tImportCSS\n\
	[[\\$css src='/Content/Styles/${1:FileName}.css']]\n\
snippet @ijs\tImportJS\n\
	[[\\$script src='/content/js/${1:FileName}.js']]\n\
snippet @rc\tRowCount\n\
	[[\\$RowCount]]\n\
snippet @rn\tRowNumber\n\
	[[\\$RowNumber]]\n\
snippet @gd\tGetDate\n\
	[[\\$GetDate]]\n\
snippet @block\tAddTextBlock\n\
	[[Blocks.Text ds:where='ID = ${1:BlockID}']]\n\
snippet @temp\tAddTemplate\n\
	[[template t:file='/content/${1:ModuleName}']]\n\
snippet @res\tAddResource\n\
	[[\\$resource key='${1:key}' text='${2:text}']]\n\
snippet @rep\tRegexReplace\n\
	.replace(${1:/\"/g,\"”\"})\n\
##\n\
snippet @uitext\tUIText\n\
	[[ui/text field='${1:Field}' class='${2:class}']]\n\
snippet @uitextarea\tUITextArea\n\
	[[ui/textarea field='${1:Field}' class='${2:class}']]\n\
snippet @uicheck\tUICheckBox\n\
	<label>[[ui/checkbox field='${1:Field}' class='${2:class}']] ${3:Name} </label>\n\
snippet @uicomboselect\tUIComboFromSelect\n\
	[[ui/combo ds:select='${1:TableName}' field='${2:Field}' emptyText='${3:בחר}']]\n\
snippet @uicombovalue\tUIComboFromValue\n\
	[[ui/combo  field='${1:Field}' values='${2:value1},${3:value2},${4:value3}']]\n\
snippet @uidate\tUIDatePicker\n\
	[[ui/datepicker  field='${1:Field}' format='${2:yyyy/MM/dd}']]\n\
snippet @uisubmit\tUISubmit\n\
	[[ui/submit  action='${1:save}' value='${2:שלח}' class='${3:class}']]\n\
snippet @uihidden\tUIHidden\n\
	[[ui/hidden field='${1:Field}' value='${2:value}']]\n\
snippet @uiupload\tUIUpload\n\
	[[ui/upload field='${1:Field}' types='${2:Type}' Folder='/userContent/${3:Folder}']]\n\
##\n\
snippet @deb\tDebugger\n\
	debugger;\n\
snippet @cl\tConsoleLog\n\
	console.log(${1:object});\n\
snippet @cll\tConsoleLogItem\n\
	console.log(${1:object},${1:object});\n\
snippet @cb\tCommentBlock\n\
	$--[\n\t${1:Comment}\n]--\n\
snippet @qe\tQuery\n\
	[[\\$query sql='SELECT ${1:Field1} FROM ${2:TableName} WHERE ${3:condition}']]\n\
\n\
";
exports.scope = "hpp";

});
