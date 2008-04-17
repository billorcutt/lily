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
*	Construct a new average object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $average()
{
	var thisPtr=this;	
	var counter=0;
	var total=0;
				
	this.inlet1=new this.inletClass("inlet1",this,"number to average, \"bang\" outputs the average, \"reset\" clears the average");
	this.outlet1 = new this.outletClass("outlet1",this,"current average");
	
	this.inlet1["reset"]=function() {
		counter=0;
		total=0;
	}
	
	this.inlet1["bang"]=function() {
		if(counter!=0)
			thisPtr.outlet1.doOutlet(total/counter);
		else
			thisPtr.outlet1.doOutlet(0);	
	}				
	
	this.inlet1["num"]=function(num) {
		counter++;
		total+=parseInt(num);
	}
	
	return this;	
}

var $averageMetaData = {
	textName:"average",
	htmlName:"average",
	objectCategory:"Math",
	objectSummary:"Average numbers.",
	objectArguments:""
}