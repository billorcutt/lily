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
*	Construct a new mouse object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $mouse(param)
{
	var thisPtr=this;
	var listenToContent = (LilyUtils.convertType(param)==true)?LilyUtils.convertType(param):false;
	
	this.outlet1 = new this.outletClass("outlet1",this,"mouse y position");
	this.outlet2 = new this.outletClass("outlet2",this,"mouse x position");
	this.outlet3 = new this.outletClass("outlet3",this,"1 on mousedown, 0 on mouseup");
	this.outlet4 = new this.outletClass("outlet4",this,"bang on click");				
	
	function mouseMoveFunc(e) {
		thisPtr.outlet2.doOutlet(e.clientX);
		thisPtr.outlet1.doOutlet(e.clientY);
	}
	
	function mouseDownFunc(e) {
		thisPtr.outlet3.doOutlet(1);
	}
	
	function mouseUpFunc(e) {
		thisPtr.outlet3.doOutlet(0);
	}
	
	function mouseClickFunc(e) {
		thisPtr.outlet4.doOutlet("bang");
	}
	
	function setContentListeners() {
		
		//click
		window.content.document.removeEventListener("click",mouseClickFunc,false);		
		window.content.document.addEventListener("click",mouseClickFunc,false);	
		
		//mousemove
		window.content.document.removeEventListener("mousemove",mouseMoveFunc,false);		
		window.content.document.addEventListener("mousemove",mouseMoveFunc,false);

		//mousedown
		window.content.document.removeEventListener("mousedown",mouseDownFunc,false);		
		window.content.document.addEventListener("mousedown",mouseDownFunc,false);
		
		//mouseup
		window.content.document.removeEventListener("mouseup",mouseUpFunc,false);		
		window.content.document.addEventListener("mouseup",mouseUpFunc,false);					
		
	}			
	
	if(listenToContent) {
		gBrowser.addEventListener("load",setContentListeners,true);
		setContentListeners();	
	} else {
		this.controller.patchController.attachPatchObserver(thisPtr.objID,"mousemove",mouseMoveFunc,"performance");
		this.controller.patchController.attachPatchObserver(thisPtr.objID,"mousedown",mouseDownFunc,"performance");
		this.controller.patchController.attachPatchObserver(thisPtr.objID,"mouseup",mouseUpFunc,"performance");
		this.controller.patchController.attachPatchObserver(thisPtr.objID,"click",mouseClickFunc,"performance");	
	}
	
	this.destructor=function() {
		gBrowser.removeEventListener("load",setContentListeners,true);
	}	
							
	return this;
}

var $mouseMetaData = {
	textName:"mouse",
	htmlName:"mouse",
	objectCategory:"System",
	objectSummary:"Output mouse event messages.",
	objectArguments:"boolean: listen to host content window. defaults to false."
}