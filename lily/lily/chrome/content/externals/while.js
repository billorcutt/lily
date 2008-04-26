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
*	Construct a new while object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//need to expand this example with various typed messages
function $while()
{
	var thisPtr=this;
	var looping=false;
	var value=0;

	//inputs starts recursion- output results of each loop
	this.outlet1 = new this.outletClass("outlet1",this,"result of each loop");
	this.inlet1=new this.inletClass("inlet1",this,"initial value begins loop");	

	//conditional check
	this.outlet2 = new this.outletClass("outlet2",this,"pass to boolean test");
	this.inlet2=new this.inletClass("inlet2",this,"result of boolean test");
	
	//function to call
	this.outlet3 = new this.outletClass("outlet3",this,"pass to method");
	this.inlet3=new this.inletClass("inlet3",this,"result of method");	
		
	//intial input
	this.inlet1["anything"]=function(msg) {
		looping=true;
		thisPtr.outlet3.doOutlet(msg); //run the function
	}
	
	//anything else
	this.inlet2["bool"]=function(b) {
		if(b && looping) {
			thisPtr.outlet1.doOutlet(value); //output result			
			thisPtr.outlet3.doOutlet(value); //run the function again
		} else {
			looping=false;
		}	
	}
	
	//anything else
	this.inlet3["anything"]=function(msg) {
		value = msg; //result of the function
		thisPtr.outlet2.doOutlet(msg); //output to test it
	}			
	
	return this;
}

var $whileMetaData = {
	textName:"while",
	htmlName:"while",
	objectCategory:"Control",
	objectSummary:"Call a function until a condition is met.",
	objectArguments:""
}