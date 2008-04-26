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


/**
*	Construct a new filepicker object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $filepicker()
{
	var thisPtr=this;
		
	this.inlet1=new this.inletClass("inlet1",this, "\"save\" opens file save dialog, \"open\" opens file open dialog, \"folder\" opens folder select dialog");
	this.outlet1 = new this.outletClass("outlet1",this,"file path for opened/saved file");
	this.outlet2 = new this.outletClass("outlet2",this, "bang after dialog is closed");	
		
	//write to disk
	this.inlet1["save"]=function() {
		var rv = getWritePath();
		if(rv) {
			thisPtr.outlet1.doOutlet(rv);	
		}
		thisPtr.outlet2.doOutlet("bang");
	}

	//read in a new file
	this.inlet1["open"]=function() {
		var rv = getOpenPath();
		if(rv) {
			thisPtr.outlet1.doOutlet(rv);	
		}
		thisPtr.outlet2.doOutlet("bang");
	}

	//select a folder
	this.inlet1["folder"]=function() {
		var rv = getFolder();
		if(rv) {
			thisPtr.outlet1.doOutlet(rv);	
		}
		thisPtr.outlet2.doOutlet("bang");
	}	
	
	function getFolder() {
		
		var file=null;
		const nsIFilePicker = Components.interfaces.nsIFilePicker;

		var fp = Components.classes["@mozilla.org/filepicker;1"]
		                   .createInstance(nsIFilePicker);

		fp.init(window, "Find file to open", nsIFilePicker.modeGetFolder);
		fp.appendFilters(nsIFilePicker.filterAll);

		var rv = fp.show();
		//window.blur(); //crashes FF3	
		if (rv == nsIFilePicker.returnOK) {
			file = fp.file;
	 		return file.path;			
		} else {
			return "";
		}		

	}
		
	function getOpenPath() {
		
		var file=null;
		const nsIFilePicker = Components.interfaces.nsIFilePicker;

		var fp = Components.classes["@mozilla.org/filepicker;1"]
		                   .createInstance(nsIFilePicker);

		fp.init(window, "Find file to open", nsIFilePicker.modeOpen);
		fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

		var rv = fp.show();
		//window.blur(); //crashes FF3			
		if (rv == nsIFilePicker.returnOK) {
			file = fp.file;
	 		return file.path;			
		} else {
			return "";
		}
	}
	
	function getWritePath() {
		
		var file=null;
		const nsIFilePicker = Components.interfaces.nsIFilePicker;

		var fp = Components.classes["@mozilla.org/filepicker;1"]
		                   .createInstance(nsIFilePicker);

		fp.init(window, "Choose a location to save in", nsIFilePicker.modeSave);
		fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

		var rv = fp.show();
		//window.blur(); //crashes FF3	
		if (rv == nsIFilePicker.returnOK) {
			file = fp.file;
	 		return file.path;
		} else {
			return "";
		}		
	}
		
	return this;
}

var $filepickerMetaData = {
	textName:"filepicker",
	htmlName:"filepicker",
	objectCategory:"System",
	objectSummary:"Create a filepicker dialog to save or open a file.",
	objectArguments:""
}