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
*	Construct a new urn object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $urn(max)
{
	var thisPtr=this;	
	var gMaximum=max||1;
	var gArr=[];
	var gIndex=0;
	
	this.outlet1 = new this.outletClass("outlet1",this,"random numbers");
	this.outlet2 = new this.outletClass("outlet2",this,"bang when all numbers have been chosen");	
	this.inlet1=new this.inletClass("inlet1",this,"bang outputs random number, clear resets the list chosen numbers");	
	
	//custom method
	this.inlet1["clear"]=function(msg) {
		//gArr=LilyUtils.shuffle(gArr);
		gIndex=0;
	}
	
	//bang method
	this.inlet1["bang"]=function() {
		
		if(gIndex<gArr.length) {
			thisPtr.outlet1.doOutlet(gArr[gIndex]);
		} else {
			thisPtr.outlet2.doOutlet("bang");
		}	
		gIndex++;
		
	}
	
	//init array
	for(var i=0;i<gMaximum;i++)
		gArr.push(i);
		
	//shuffle array	
	gArr=LilyUtils.shuffle(gArr);
	
	return this;
}

var $urnMetaData = {
	textName:"urn",
	htmlName:"urn",
	objectCategory:"Math",
	objectSummary:"Generate a unique random number.",
	objectArguments:"Maximum random number [1]"	
	
}