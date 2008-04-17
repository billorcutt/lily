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
*	Construct a new counter object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $counter(param)
{
	var thisPtr=this;
	var startCount=0;
	var maxValue=(+param)||9007199254740992; //largest possible js integer
	var cycleCount=0;
	
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" increments counter and outputs the new count");
	this.inlet2=new this.inletClass("inlet2",this,"\"bang\" resets counter");
	this.outlet1 = new this.outletClass("outlet1",this,"count");
	this.outlet2 = new this.outletClass("outlet2",this,"cycle count");				
	
	//increment counter
	this.inlet1["bang"]=function() {
		
		if(startCount==maxValue) {
			startCount=0;
			cycleCount++;
			thisPtr.outlet2.doOutlet(cycleCount);			
		}
	
		startCount++;
		thisPtr.outlet1.doOutlet(startCount);
	}
	
	//reset counter
	this.inlet2["bang"]=function() {
		startCount=0;
		cycleCount=0;					
	}
	
	//reset counter
	this.inlet2["num"]=function(i) {
		maxValue=parseInt(i);
		cycleCount=0;					
	}	
	
	return this;
}

var $counterMetaData = {
	textName:"counter",
	htmlName:"counter",
	objectCategory:"Control",
	objectSummary:"Count bang messages.",
	objectArguments:"count maximum [9007199254740992]"
}