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
*	Construct a new beep object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $beep()
{
	var thisPtr=this;

	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" triggers default system sound, \"load\" loads sound, \"play\" plays loaded sound");	

	var gSound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
	var gURL = null;
	
	this.inlet1["bang"]=function() {
		gSound.beep();
	}	
	
	this.inlet1["play"]=function() {
		if(gURL) {
			gSound.play(gURL);			
		}
	}
	
	this.inlet1["load"]=function(url) {
		
		// the IO service
		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
		                          .getService(Components.interfaces.nsIIOService);

		// create an nsIURI
		try {
			gURL = ioService.newURI(url, null, null);
		} catch(e) {
			LilyDebugWindow.error("Couldn't create the url")
		}
			

	}	
	
	
/*	//not working...
	//anything method
	this.inlet1["play"]=function(msg) {
		gSound.playSystemSound(msg);
	}
*/	
	
	gSound.init();	
	
	return this;
}

var $beepMetaData = {
	textName:"beep",
	htmlName:"beep",
	objectCategory:"System",
	objectSummary:"Play a system alert sound.",
	objectArguments:""
}