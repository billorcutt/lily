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
*	Construct a new fur object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//focus + blur = fur
function $fur()
{
	var thisPtr=this;
	this.outlet1 = new this.outletClass("outlet1",this,"1 when window is active, 0 when inactive");
	var state=0;	

	function onFocus() {
		if(!state) {
			thisPtr.outlet1.doOutlet(1);
			state=1;
		}	
	}
	
	function onBlur() {
		if(state) {		
			thisPtr.outlet1.doOutlet(0);
			state=0;
		}	
	}	
	
	this.init=function() {
		thisPtr.parent.patchView.xulWin.addEventListener("focus",onFocus,false);
		thisPtr.parent.patchView.xulWin.addEventListener("blur",onBlur,false);
	}		
	return this;
}

var $furMetaData = {
	textName:"fur",
	htmlName:"fur",
	objectCategory:"System",
	objectSummary:"Output messages when a patch gains and loses focus.",
	objectArguments:""
}