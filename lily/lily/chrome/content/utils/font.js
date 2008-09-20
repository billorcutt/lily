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
	Script: font.js
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
	Method: getDefaultFont
		get the default font preference.

	Returns: 
		array - default font face & size.
*/
LilyUtils.getDefaultFont = function() {
	return [LilyUtils.getStringPref("extensions.lily.defaultFontFace"),LilyUtils.getStringPref("extensions.lily.defaultFontSize")];
}

/*
	Method: sizeFontForPlatform
		size the font for the platform.
		
		Arguments: 
			number - size.			

	Returns: 
		number - sized font.
*/
LilyUtils.sizeFontForPlatform = function(font_size) {
	if(LilyUtils.navigatorPlatform()!='apple') { //if not apple opened elsewhere
		var tmp = parseInt(font_size)-1;
		return (tmp); //reduce the font size by 1.
	} else {
		return font_size; //just return the font
	}
}	

/*
	Method: getCompatibleFont
		get compatible fonts.
		
		Arguments: 
			sring - font family name.			

	Returns: 
		string - list of cross platform font equivalents.
*/
LilyUtils.getCompatibleFont = function(font) {
	
	if(!LilyApp["font-compat-table"]) {	
		LilyUtils.readSyncFromURL("chrome://lily/content/config/font-compat.txt",function(txt){
			LilyApp["font-compat-table"]=eval("("+txt+")");
		});
	}
			
	var tmp = LilyApp["font-compat-table"][font.toLowerCase()];
	if(tmp) {
		return tmp;
	} else {
		return font;
	}
	
}

/*
	Method: setDefaultFont
		set the default font preference.

	Arguments: 
		array - default font face & size.
*/
LilyUtils.setDefaultFont = function(face,size) {
	
	if(face)
		LilyUtils.setStringPref("extensions.lily.defaultFontFace",face);
		
	if(size)
		LilyUtils.setStringPref("extensions.lily.defaultFontSize",size);	

}

/*
	Method: getTextSize
		width of the supplied string.

	Arguments:
		win- window
		str - string to measure
	
	Returns: 
		returns width in px.
*/
LilyUtils.getTextSize = function(win,str) {
	var d = win.document.createElement("div");
	var ad = win.document.getElementsByTagName("body")[0].appendChild(d);
	ad.innerHTML = LilyUtils.string2HTML(str);
	ad.style.position="absolute";
	ad.style.left="0px";
	ad.style.top="0px";		
	var arr = [ad.offsetWidth,ad.offsetHeight];
	ad.parentNode.removeChild(ad);
	return arr;
}

/*
	Method: getAverageCharSize
		get the average size of an alpha-numeric charactor given the default font in a window.

	Arguments:
		win- window
	
	Returns: 
		returns width in px.
*/
LilyUtils.getAverageCharSize = function(win) {
	var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
	var size=this.getTextSize(win,str);
	return Math.floor(size[0]/str.length);
}	

/*
	Method: getInstalledFonts
		get a list of the installed fonts.
	
	Returns: 
		returns an array of available fonts.
*/
LilyUtils.getInstalledFonts = function() {
						
	var langgroup = ["x-western","ja","ko","th","tr","x-baltic","x-central-euro","x-cyrillic","zh-CN","zh-TW"];		
	var fonttype = ["serif","sans-serif","cursive","fantasy","monospace"];		
	
	//var fontListObj = Components.classes["@mozilla.org/gfx/fontlist;1"].createInstance(Components.interfaces.nsIFontList);
	
	var fontListObj = Components.classes["@mozilla.org/gfx/fontenumerator;1"].getService(Components.interfaces.nsIFontEnumerator);		
	
       var tmpArr = [];
	var tmpObj = {};

	for(var i=0;i<langgroup.length;i++) {
		
		for(var j=0;j<fonttype.length;j++) {
			
			var fontArray = fontListObj.EnumerateFonts(langgroup[i],fonttype[j],{});
			for(var k=0;k<fontArray.length;k++)
			{					
				//hack to avoid dupes
				if(typeof tmpObj[fontArray[k]]=="undefined") {
					tmpArr.push(fontArray[k]);
					tmpObj[fontArray[k]]=fontArray[k];
				}	
			}
		}
	}
			
	return tmpArr;
}