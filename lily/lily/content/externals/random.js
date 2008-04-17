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
*	Construct a new random object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $random(max)
{
	var thisPtr=this;
	var max=parseInt(max)||1024;
	this.outlet1 = new this.outletClass("outlet1",this,"random number");
	this.inlet1=new this.inletClass("inlet1",this,"bang outputs random number");	
	this.inlet2=new this.inletClass("inlet2",this,"new maximum");
	
	function getMaxRandom() {
		return max;
	}
	
	//sets a new max
	this.inlet2["num"]=function(num) {
		max=(parseInt(num)<0||isNaN(parseInt(num)))?0:parseInt(num);
	}
	
	//bang method
	this.inlet1["bang"]=function() {
		if(max==1)
			thisPtr.outlet1.doOutlet(Math.random());
		else
			thisPtr.outlet1.doOutlet(Math.floor(Math.random()*max));	
	}	
	return this;
}

var $randomMetaData = {
	textName:"random",
	htmlName:"random",
	objectCategory:"Math",
	objectSummary:"Output random numbers.",
	objectArguments:"maximum random number [1024]"
}