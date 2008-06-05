if(typeof Lily == "undefined") {
	var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

	var url_array = [
		"chrome://global/content/nsDragAndDrop.js",
		"chrome://global/content/nsTransferable.js",
		"chrome://lily/content/lib.js",
		"chrome://lily/content/utils.js",
		"chrome://lily/content/externals.js",
		"chrome://lily/content/debug.js",
		"chrome://lily/content/inspector.js",
		"chrome://lily/content/model.js",
		"chrome://lily/content/patch.js",
		"chrome://lily/content/object.js",
		"chrome://lily/content/services.js",
		"chrome://lily/content/lily.js",
		"chrome://lily/content/menus.js",
		"chrome://lily/content/exporter.js"
	]

	for(var i=0;i<url_array.length;i++) {
		jsLoader.loadSubScript(url_array[i], this);
	}
}