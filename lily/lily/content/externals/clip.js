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
*	Construct a new clip object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $clip(args)
{
	var thisPtr=this;
	
	if(!args.length) {	
		LilyDebugWindow.error("the clip object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("clip");
		return;
	}
	
	this.inlet1=new this.inletClass("inlet1",this,"number to be clipped");
	this.inlet2=new this.inletClass("inlet2",this,"minimum value");
	this.inlet3=new this.inletClass("inlet3",this,"maximum value");		
	this.outlet1=new this.outletClass("outlet1",this,"clipped number");
	
	//set min/max based on typed-in args
	var argArr = args.split(" ")||[];
	var min=(+argArr[0])||0;
	var max=(+argArr[1])||0;	

	//ouput constrained input
	this.inlet1["num"]=function(msg) {	
		if((+msg)<=min)
			thisPtr.outlet1.doOutlet(min);
		else if((+msg)>=max)
			thisPtr.outlet1.doOutlet(max);
		else
			thisPtr.outlet1.doOutlet((+msg));	
	}
	
	//set minimum
	this.inlet2["num"]=function(val) {
		min=(+val);
	}
	
	//set maximum
	this.inlet3["num"]=function(val) {
		max=(+val);
	}		
	
	return this;
}

var $clipMetaData = {
	textName:"clip",
	htmlName:"clip",
	objectCategory:"Math",
	objectSummary:"Constrain numbers to a range.",
	objectArguments:"[minimum], [maximum]"
}