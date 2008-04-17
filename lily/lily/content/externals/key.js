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
*	Construct a new key object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $key(param)
{
	var thisPtr=this;
	var listenToContent = (LilyUtils.convertType(param)==true)?LilyUtils.convertType(param):false;
		
	this.outlet1 = new this.outletClass("outlet1",this,"which key");
	this.outlet2 = new this.outletClass("outlet2",this,"meta key");
	this.outlet3 = new this.outletClass("outlet3",this,"alt key");
	this.outlet4 = new this.outletClass("outlet4",this,"control key");
	this.outlet5 = new this.outletClass("outlet5",this,"shift key");				
					
	function keyPressFunc(e) {
		
		if(thisPtr.controller.patchController.getEditable()=="edit")
			return;
				
		thisPtr.outlet5.doOutlet(e.shiftKey);		
		thisPtr.outlet4.doOutlet(e.ctrlKey);		
		thisPtr.outlet3.doOutlet(e.altKey);
		thisPtr.outlet2.doOutlet(e.metaKey);			
		thisPtr.outlet1.doOutlet(e.which);
	}
	
	function setContentListeners() {				
		window.content.document.removeEventListener("keypress",keyPressFunc,false);		
		window.content.document.addEventListener("keypress",keyPressFunc,false);
	}
					
	if(listenToContent) {
		gBrowser.addEventListener("load",setContentListeners,true);
		setContentListeners();	
	} else {
		this.controller.patchView.xulWin.addEventListener("keypress",keyPressFunc,false);
	}
	
	this.destructor=function() {
		gBrowser.removeEventListener("load",setContentListeners,true);
	}
					
	return this;
}

var $keyMetaData = {
	textName:"key",
	htmlName:"key",
	objectCategory:"Interaction",
	objectSummary:"Send messages about keyboard events.",
	objectArguments:"boolean: listen to host content window. defaults to false."
}