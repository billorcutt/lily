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
*	Construct a new screen object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $screen()
{
	var thisPtr=this;
	this.inlet1 = new this.inletClass("inlet1",this,"\"bang\" outputs screen info");
	this.outlet1 = new this.outletClass("outlet1",this,"available width");
	this.outlet2 = new this.outletClass("outlet2",this,"available height");
	this.outlet3 = new this.outletClass("outlet3",this,"available left");
	this.outlet4 = new this.outletClass("outlet4",this,"available top");
	this.outlet5 = new this.outletClass("outlet5",this,"color depth");					
	
	var screenObj=window.screen;
	
	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet(screenObj.availWidth);		
		thisPtr.outlet2.doOutlet(screenObj.availHeight);
		thisPtr.outlet3.doOutlet(screenObj.availLeft);
		thisPtr.outlet4.doOutlet(screenObj.availTop);
		thisPtr.outlet5.doOutlet(screenObj.colorDepth);		
	}

	return this;
}

var $screenMetaData = {
	textName:"screen",
	htmlName:"screen",
	objectCategory:"System",
	objectSummary:"Output screen info.",
	objectArguments:""
}