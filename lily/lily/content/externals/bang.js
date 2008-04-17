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
*	Construct a new bang object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $bang(num)
{
	var thisPtr=this;
	var number=parseInt(num)||1;
	this.inlet1=new this.inletClass("inlet1",this,"any input triggers a bang output");
	
	//create outlets for each argument.
	for(var i=0;i<number;i++)
		this["outlet"+(i+1)] = new this.outletClass(("outlet"+(i+1)),this,"triggered bang");
	
	this.inlet1["anything"]=function() { 
		for(var i=number;i>0;i--)
			thisPtr["outlet"+i].doOutlet("bang");
	}
	
	return this;
}

var $bangMetaData = {
	textName:"bang",
	htmlName:"bang",
	objectCategory:"Control",
	objectSummary:"Convert a message to any number of bangs.",
	objectArguments:"number of outlets [1]"
}