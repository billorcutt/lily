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
*	Construct a new drunk object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $drunk(params)
{
	var thisPtr=this;	

	var maxValue=parseInt(params.split(" ")[0])||1024;
	var stepSize=parseInt(params.split(" ")[1])||2;
	var minValue=0;	
	var currentValue=0;
	var direction=1;
	
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs next random number.");
	this.inlet2=new this.inletClass("inlet2",this,"number sets the maximum random value.");	
	this.inlet3=new this.inletClass("inlet3",this,"number sets the random maximum random step size.");
	this.outlet1 = new this.outletClass("outlet1",this,"random number");				
	
	//coin toss
	function whichDir() {
		var num=Math.random();
		if(num > .5) {
			return 1;
		} else {
			return -1;
		}
	}
	
	function nextStep() {
		
		var step=Math.floor(Math.random() * (stepSize - 0 + 1)) + 0;
		var which=whichDir();
				
		if(((step*which)+currentValue)<maxValue&&((step*which)+currentValue)>minValue) {
			return ((step*which)+currentValue);
		} else if(((step*which)+currentValue)<minValue) {
			return ((step*(1))+currentValue);
		} else {
			return ((step*(-1))+currentValue);
		}
			
	}
	
	//number method- max size
	this.inlet2["num"]=function(val) {
		maxValue=parseInt(val);
	}	
	
	//number method- step size
	this.inlet3["num"]=function(val) {
		stepSize=parseInt(val);
	}	
	
	//bang method
	this.inlet1["bang"]=function() {
		currentValue=nextStep();
		thisPtr.outlet1.doOutlet(currentValue);
	}
	
	//set method- currentValue
	this.inlet1["num"]=function(val) {
		currentValue=parseInt(val);
	}	
		
	return this;
}

var $drunkMetaData = {
	textName:"drunk",
	htmlName:"drunk",
	objectCategory:"Math",
	objectSummary:"Output a sequence of random numbers.",
	objectArguments:"maximum [1024], step size [2]"
}