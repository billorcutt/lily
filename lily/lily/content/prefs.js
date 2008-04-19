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
	Script: prefs.js
		Contains prefs window js
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/


var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);
var fontsFaceInitialized = false;
var fontsSizeInitialized = false;	
var defaultSize = LilyUtils.getDefaultFont()[1];
var defaultFont = LilyUtils.getDefaultFont()[0];
var lilyKeyObject = null;

window.addEventListener("load",function() {

	setFontSizeList(document.getElementById("menu_PrefFontSizePopup"));
	setFontFaceList(document.getElementById("menu_PrefFontFacePopup"));
	LilyInitPrefsWindow();
	
},false);

//search directory preference ui
function selectDirectory(id) {

	var field=document.getElementById(id);

	const nsIFilePicker = Components.interfaces.nsIFilePicker;

	var fp = Components.classes["@mozilla.org/filepicker;1"]
	                   .createInstance(nsIFilePicker);
	fp.init(window, "Dialog Title", nsIFilePicker.modeGetFolder);
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

	var rv = fp.show();
	if(LilyUtils.navigatorPlatform()!="apple") window.blur();	
	if (rv == nsIFilePicker.returnOK)	{

		var file = fp.file;
	
		if(id!="searchField" && id!="helpField")
			field.value="file://"+file.path +"/";
		else
			field.value=file.path+"";
		
//		dump("extensions.lily."+field.id.substring(0,field.id.length-5)+"Path "+field.value)
		
		setSearchDirPref(field);
	
	}
}

function setSearchDirPref(field) {
	prefs.setCharPref("extensions.lily."+field.id.substring(0,field.id.length-5)+"Path",field.value);
}

//font face menu ui
function setFontFaceList(menu) {

	if(fontsFaceInitialized)
		return;
	
	var selectedIndex=-1;			

	var fontArr=LilyUtils.getInstalledFonts();

    // Load the search terms into our menu
    for(var i=0; i < fontArr.length; i++)
    {
       
	    if(defaultFont==fontArr[i])
			selectedIndex=i;	
	
		// For each search term, create a menu item element
        var tempItem = null;
        tempItem = document.createElement("menuitem");

		//set attributes			
        tempItem.setAttribute("label", fontArr[i]);
        tempItem.setAttribute("id", fontArr[i]);	
        tempItem.setAttribute("name", "fontFamily");
        tempItem.setAttribute("type", "radio");
	
        tempItem.setAttribute("oncommand", "LilyUtils.setDefaultFont(\""+fontArr[i]+"\",null)");	

        // Add the item to our menu
        menu.appendChild(tempItem);

    }

	menu.parentNode.selectedIndex=selectedIndex;
	fontsFaceInitialized=true;	
}

//font size menu ui
function setFontSizeList(menu) {

	if(fontsSizeInitialized)
		return;
	
	var selectedIndex=-1;
	var index=0;	

    // Load the search terms into our menu
    for(var i=5; i < 15; i++)
    {
        if(parseInt(defaultSize)==i)
			selectedIndex=index;
		else
			index++;

		// For each search term, create a menu item element
        var tempItem = null;
        tempItem = document.createElement("menuitem");

		//set attributes			
        tempItem.setAttribute("label", i);
        tempItem.setAttribute("name", "fontSize");
        tempItem.setAttribute("id", "fs"+i);	
        tempItem.setAttribute("type", "radio");	
	
        tempItem.setAttribute("oncommand", "LilyUtils.setDefaultFont(null,"+ i +")");	

        // Add the item to our menu
        menu.appendChild(tempItem);
    }		

    // Load the search terms into our menu
    for(var j=15; j < 150; j+=5)
    {
       
	    if(j==parseInt(defaultSize))
			selectedIndex=index;
		else
			index++;

		// For each search term, create a menu item element
        var tempItem = null;
        tempItem = document.createElement("menuitem");

		//set attributes			
        tempItem.setAttribute("label", j);
        tempItem.setAttribute("name", "fontSize");
        tempItem.setAttribute("id", "fs"+j);	
        tempItem.setAttribute("type", "radio");	
	
        tempItem.setAttribute("oncommand", "LilyUtils.setDefaultFont(null,"+ j +")");	

        // Add the item to our menu
        menu.appendChild(tempItem);

		menu.parentNode.selectedIndex=selectedIndex;
	
    }

	fontsSizeInitialized=true;	
}

//generate the api key html
function generateHTML(obj) {
			
	var src = "";
	
	src += "<table border=\"0\" cellpadding=\"5\" >";
						
	for(var x in obj) {
		src += "<tr> <td></td><td><a id=\"link_"+ x +"\" style=\"text-decoration:underline;color:blue;cursor:pointer\" href=\"#\">"+ 
		obj[x].label +"</a></td><td><input id=\""+ x +"\" style=\"width:300px\" type=\"text\" value=\""+ 
		obj[x].key +"\"/></td></tr>";
	}
	
	src += "<tr><td></td><td><input id=\"lilyAddApiKeyButton\" type=\"button\" style=\"font-size:20px;\" value=\"+\"></td><td></td></tr>"
	
	src += "</table>";
	
	return src;			
	
}

//init the prefs window
function LilyInitPrefsWindow() {

	var fontArr=LilyUtils.getDefaultFont();
	
	if(window.arguments && typeof window.arguments[0] == "object") {
		
		var prefbrowser=document.getElementById("browserPrefsElement").contentWindow;
		var lilyKeyObject = window.arguments[0].getKeyObject();			
		prefbrowser.document.open();
		var str = "<html><style>body {background:#E5E5E5;font-family:"+fontArr[0]+";font-size:"+fontArr[1]+"}</style><body>"+generateHTML(lilyKeyObject)+"</body></html>";
		prefbrowser.document.write(str);	
		prefbrowser.document.close();
		
		var links = prefbrowser.document.getElementsByTagName("a");
		
		for(var i=0;i<links.length;i++) {
			
			links[i].addEventListener("click",function() {
				openAPIKeyEdit(this.id);
			},false);
									
		}
		
		prefbrowser.document.getElementById("lilyAddApiKeyButton").addEventListener("click",function() {
			openAPIKeyNew();
		},false);		
		
	} else {
		//this doesn't really disable the window- FF bug.
		document.getElementById("lilyAPIKeyTab").setAttribute("disabled",true);
	}
	
	document.getElementById("lilyPrefButtonOK").addEventListener("click",function() {
		getKeyValues();
		setSearchDirPref(document.getElementById("searchField"));
		window.close();
	},false);						

}

function openAPIKeyEdit(id) {
	
	var obj = window.arguments[0].getKeyObject();
	var keyID = id.replace(/link_/,"");	
	var params = {dataIn:{key:obj[keyID].key, url:obj[keyID].url, name:obj[keyID].label, id:keyID}, dataOut:null};     
	window.openDialog("chrome://lily/content/apikey.xul", "","chrome, dialog, modal, resizable=no", params).focus();

	if (params.dataOut) {				
		window.arguments[0].setKey(params.dataOut.id,params.dataOut.key,params.dataOut.url,params.dataOut.name); //do stuff w/ the data we get back.
		window.arguments[0].saveKeys();
		LilyInitPrefsWindow(); //redraw the prefswindow.
	}
	else {
		// User clicked cancel. Typically, nothing is done here.
	}
	
}

function openAPIKeyNew() {
	
	var params = {dataIn:{key:null, url:null, name:null, id:null}, dataOut:null};     
	window.openDialog("chrome://lily/content/apikey.xul", "","chrome, dialog, modal, resizable=no", params).focus();

	if (params.dataOut) {				
		window.arguments[0].setKey(params.dataOut.id,params.dataOut.key,params.dataOut.url,params.dataOut.name); //do stuff w/ the data we get back.
		window.arguments[0].saveKeys();
		LilyInitPrefsWindow(); //redraw the prefswindow.
	}
	else {
		// User clicked cancel. Typically, nothing is done here.
	}
	
}

function getKeyValues() {
	
	if(!window.arguments)
		return;	
	
	var prefbrowser=document.getElementById("browserPrefsElement").contentWindow;
	var trs = prefbrowser.document.getElementsByTagName("input");
	
	for(var i=0;i<trs.length;i++) {
			
			var input = trs[i];	
			
			if(input.type=="text")	
				window.arguments[0].setKey(input.id,input.value,null,null);
			
	}
	
	window.arguments[0].saveKeys();				
}

