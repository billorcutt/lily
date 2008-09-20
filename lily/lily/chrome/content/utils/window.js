/** 

Copyright (c) 2007 Bill Orcutt (http://lilyapp.org, http://publicbeta.cx)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 

*/

/*
	Script: window.js
		Contains LilyUtils.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/

if(!LilyUtils) {
	var LilyUtils = {};
}	

/*				
	Class: LilyUtils
		Utility Methods.
*/
	
/*
	Method: getWindowEnumerator
		returns a window enumerator.

	Arguments: 
		type- window type. null returns all types

	Returns: 
		returns a window enumerator.
*/
LilyUtils.getWindowEnumerator = function(type) {
	
	var winType=type||null;
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	return wm.getEnumerator(winType);
	
}

/*
	Method: getActiveWindow
		returns a chrome window for the topmost browser window.
	
	Returns: 
		return the topmost browser window.
*/
LilyUtils.getActiveWindow = function() {
	//getMostRecentWindow
	if(LilyApp.getCurrentPatch()) {
		return LilyApp.getCurrentPatch().patchView.oWin;
	} else {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		return wm.getMostRecentWindow(null);
	}	
}

/*
	Method: getActiveXULWindow
		returns a chrome window for the topmost xul window.
	
	Returns: 
		return the topmost xul window.
*/
LilyUtils.getActiveXULWindow = function() {
	//getMostRecentWindow
	if(LilyApp.getCurrentPatch()) {
		return LilyApp.getCurrentPatch().patchView.xulWin;
	} else {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		return wm.getMostRecentWindow(null);
	}	
}

/*
	Method: writeToHostWindow
		write to the host window.

	Arguments: 
		string - string to write to the host window.
*/
LilyUtils.writeToHostWindow = function(text) {
	content.document.open();			
	content.document.write(text);
	content.document.close();	
}	

/*
	Method: appendToHostWindow
		write to the host window.

	Arguments: 
		string - string to append to the host window.
*/
LilyUtils.appendToHostWindow = function(text) {
	content.document.write(text);				
}

/*
	Method: getOpenDialogCoords
		get the coordiates for opening a dialog.

	Returns: 
		an array of x,y coords
*/
LilyUtils.getOpenDialogCoords = function(w,h) {
	var sH = parseInt(window.screen.availHeight)/2;
	var sW = parseInt(window.screen.availWidth)/2;

	var x = (sW-parseInt(w/2));
	var y = (sH-parseInt(h/2));

	return [x,y];
}

/*
	Method: getOpenDialogOffset
		get the coordiates of all open windows and calculate an offset for a new window if any.

	Returns: 
		an array of x,y coords
*/
LilyUtils.getOpenDialogOffset = function(w,h) {
	var tmp = LilyApp.getCurrentPatch();

	if(	tmp &&
		parseInt(tmp.patchView.xulWin.screenX) && 
		parseInt(tmp.patchView.xulWin.screenY)
	) {
		return [
			parseInt(tmp.patchView.xulWin.screenX)+15,
			parseInt(tmp.patchView.xulWin.screenY)+15
		]
	} else {
		var tmp_coords = this.getOpenDialogCoords(w,h);
		return [tmp_coords[0],tmp_coords[1]];
	}
}	

LilyUtils.getBrowser = function() {
 var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
 return wm.getMostRecentWindow("navigator:browser").getBrowser();
}