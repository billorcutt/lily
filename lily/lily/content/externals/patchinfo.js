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
*	Construct a new patchinfo object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $patchinfo()
{
	var thisPtr=this;	
	var win = this.parent.patchView.xulWin;
	var timer = 0;
	
	this.inlet1=new this.inletClass("inlet1",this,"bang outputs patch size and position info");
	this.outlet1 = new this.outletClass("outlet1",this,"patch position in pixels from left");
	this.outlet2 = new this.outletClass("outlet2",this,"patch position in pixels from top");
	this.outlet3 = new this.outletClass("outlet3",this,"patch width in pixels");
	this.outlet4 = new this.outletClass("outlet4",this,"patch height in pixels");
	this.outlet5 = new this.outletClass("outlet5",this,"bang when patch is resized");	
	
	this.inlet1["bang"]=function() {
		thisPtr.outlet4.doOutlet(win.innerHeight);
		thisPtr.outlet3.doOutlet(win.innerWidth);
		thisPtr.outlet2.doOutlet(win.screenY);
		thisPtr.outlet1.doOutlet(win.screenX);						
	}
	
	function resizeFunc() {
		clearTimeout(timer);
		timer = setTimeout(function doIt() {
			thisPtr.outlet5.doOutlet("bang");	
		},50);	
	}
	
	this.controller.patchView.xulWin.addEventListener("resize",resizeFunc,false);				
	
	return this;
}

var $patchinfoMetaData = {
	textName:"patchinfo",
	htmlName:"patchinfo",
	objectCategory:"System",
	objectSummary:"Information about the size & location of the patcher window.",
	objectArguments:""	
	
}