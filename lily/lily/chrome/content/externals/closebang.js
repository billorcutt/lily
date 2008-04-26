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
*	Construct a new closebang object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $closebang()
{
	var thisPtr=this;
	this.outlet1 = new this.outletClass("outlet1",this,"output bang when patch closes");

	function closeFunc() {
		thisPtr.outlet1.doOutlet("bang");
	}
	
	//add close event listener
	this.init=function() {
		thisPtr.parent.patchController.attachPatchObserver(this.parent.patchID,"patchClosing",closeFunc,"all"); 
	}
			
	return this;
}

var $closebangMetaData = {
	textName:"closebang",
	htmlName:"closebang",
	objectCategory:"System",
	objectSummary:"Output a bang when a patch closes.",
	objectArguments:""
}