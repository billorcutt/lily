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
*	Construct a new cycle object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//need to expand this cycle with various typed messages
function $cycle(num)
{
	var thisPtr=this;
	
	var numOuts=parseInt(num)||2;
	var count = 1;
	
	this.inlet1=new this.inletClass("inlet1",this,"messages to cycle");		
	
	//create outlets.
	for(var i=0;i<numOuts;i++)
		this["outlet"+(i+1)] = new this.outletClass(("outlet"+(i+1)),this,"cycled messages");
		
	//anything else
	this.inlet1["anything"]=function(msg) {	
		if(count<=numOuts) {
			thisPtr["outlet"+count].doOutlet(msg);
			count++;
		} else {
			thisPtr.outlet1.doOutlet(msg);
			count=2;
		}
	}	
	
	//anything else
	this.inlet1["reset"]=function(msg) {	
		count = 1;	
	}	
	
	return this;
}

var $cycleMetaData = {
	textName:"cycle",
	htmlName:"cycle",
	objectCategory:"Control",
	objectSummary:"Output messages from successive outlets.",
	objectArguments:"number of outlets [2]"
}