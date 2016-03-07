var _fileBrowserUrlObj;

function BrowseFinder(startDir, domElement, isJS) {
    _fileBrowserUrlObj = domElement;
    var url = '/ckfinder/ckfinder.html?startupPath=' + startDir + ':/';
    if (isJS)
        url += '&action=js&func=SetUrl'
	if ( startDir.indexOf('Masters') == 0 || startDir.indexOf('Layouts') == 0)
		url += '&mypath=ml'
	else
		url += '&mypath=user'
		
    OpenServerBrowser(url, screen.width * 0.7, screen.height * 0.7);
}


function BrowseServer(obj) {
    if (typeof (G_SitePath) == 'undefined') { alert('to show netrube, G_SitePath must be defined'); return; };
    _fileBrowserUrlObj = obj;

    OpenServerBrowser(
		G_SitePath + '/Content/JS/CKeditor/plugins/netrube/browser.html?Type=Images&Connector=' + G_SitePath + '/Content/JS/CKeditor/plugins/netrube/connectors/layout/connector.asp',
		screen.width * 0.7,
		screen.height * 0.7);
}
function BrowseVideo(obj) {
    if (typeof (G_SitePath) == 'undefined') { alert('to show netrube, G_SitePath must be defined'); return; };
    _fileBrowserUrlObj = obj;

    OpenServerBrowser(
		G_SitePath + '/Content/JS/CKeditor/plugins/netrube/browser.html?Type=Flash&Connector=' + G_SitePath + '/Content/JS/CKeditor/plugins/netrube/connectors/layout/connector.asp',
		screen.width * 0.7,
		screen.height * 0.7);
}
function BrowseFile(obj) {
    if (typeof (G_SitePath) == 'undefined') { alert('to show netrube, G_SitePath must be defined'); return; };
    _fileBrowserUrlObj = obj;

    OpenServerBrowser(
		G_SitePath + '/Content/JS/CKeditor/plugins/netrube/browser.html?Type=File&Connector=' + G_SitePath + '/Content/JS/CKeditor/plugins/netrube/connectors/layout/connector.asp',
		screen.width * 0.7,
		screen.height * 0.7);
}

function BrowseLayout(obj) {
    if (typeof (G_SitePath) == 'undefined') { alert('to show netrube, G_SitePath must be defined'); return; };
    _fileBrowserUrlObj = obj;

    OpenServerBrowser(
		G_SitePath + '/Content/JS/CKeditor/plugins/netrube/browser.html?Type=Layouts&Connector=' + G_SitePath + '/Content/JS/CKeditor/plugins/netrube/connectors/layout/connector.asp',
		screen.width * 0.7,
		screen.height * 0.7);
}

function BrowseMaster(obj) {
    if (typeof (G_SitePath) == 'undefined') { alert('to show netrube, G_SitePath must be defined'); return; };
    _fileBrowserUrlObj = obj;

    OpenServerBrowser(
		G_SitePath + '/Content/JS/CKeditor/plugins/netrube/browser.html?Type=Masters&Connector=' + G_SitePath + '/Content/JS/CKeditor/plugins/netrube/connectors/layout/connector.asp',
		screen.width * 0.7,
		screen.height * 0.7);
}


function OpenServerBrowser(url, width, height) {
    var iLeft = (screen.width - width) / 2;
    var iTop = (screen.height - height) / 2;

    var sOptions = "toolbar=no,status=no,resizable=yes,dependent=yes";
    sOptions += ",width=" + width;
    sOptions += ",height=" + height;
    sOptions += ",left=" + iLeft;
    sOptions += ",top=" + iTop;

    var oWindow = window.open(url, "_blank", sOptions);
}


function SetUrl(url, width, height, alt) {
    if (!_fileBrowserUrlObj) {
        try { // for images:
            CKEDITOR.dialog.getCurrent().setValueOf('info', 'txtUrl', url);
        } catch (err) { }
        try { // for files:
            CKEDITOR.dialog.getCurrent().setValueOf('info', 'url', url);
        } catch (err) { }
        try { // for flash:
            CKEDITOR.dialog.getCurrent().setValueOf('info', 'src', url);
        } catch (err) { }

        return;
    }
    // cut the sites/../ dir - remarked. saving whole path
    //url = url.substr(G_SitePath.length + 1); // +1 --> remove slash in the beginning

    if (_fileBrowserUrlObj.substring(0, 'xFileName'.length) == 'xFileName')
        document.getElementById(_fileBrowserUrlObj).value = getFileName(url);
    else
        document.getElementById(_fileBrowserUrlObj).value = url;

    oWindow = null;
}
