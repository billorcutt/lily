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
*	Construct a new iter object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $iter()
{
	var thisPtr=this;
	var currArray=null;
	
	this.inlet1=new this.inletClass("inlet1",this,"array/list to output as individual elements, \"bang\" outputs the last input list");
	this.outlet1 = new this.outletClass("outlet1",this,"individual elements");	
	this.outlet2 = new this.outletClass("outlet2",this,"bang when complete.");		
	
	//output array
	this.inlet1["anything"]=function(arr) {
		outputArray(LilyUtils.splitArgs(arr));
	}
	
	//output last input array
	this.inlet1["bang"]=function() {
		if(currArray)
			outputArray(currArray);
	}
	
	function outputArray(arr) {
		currArray=arr;		
		for(var i=0;i<currArray.length;i++)
			thisPtr.outlet1.doOutlet(currArray[i]);
				
		thisPtr.outlet2.doOutlet("bang");			
	}	
			
	return this;
}

var $iterMetaData = {
	textName:"iter",
	htmlName:"iter",
	objectCategory:"Lists",
	objectSummary:"Break a list into a series of messages.",
	objectArguments:""
}