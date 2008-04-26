/** 

Copyright (c) 2007 Bill Orcutt (http://lilyapp.org, http://publicbeta.cx)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
cartopol
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
*	Construct a new cartopol object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $cartopol()
{
	var thisPtr=this;
	
	var xCoord = 0;
	var yCoord = 0;	
	
	this.inlet1=new this.inletClass("inlet1",this,"x coordinate input");
	this.inlet2=new this.inletClass("inlet2",this,"y coordinate input");		
	
	this.outlet1 = new this.outletClass("outlet1",this,"radius");	
	this.outlet2 = new this.outletClass("outlet2",this,"theta/angle");	
	
	this.inlet1["num"]=function(val) {
		xCoord=(+val);
		var tmp = calculateValues();
		thisPtr.outlet2.doOutlet(tmp[1]);		
		thisPtr.outlet1.doOutlet(tmp[0]);		
	}
	
	this.inlet2["num"]=function(val) {
		yCoord=(+val);
	}
	
	this.inlet1["bang"]=function() {
		var tmp = calculateValues();
		thisPtr.outlet2.doOutlet(tmp[1]);		
		thisPtr.outlet1.doOutlet(tmp[0]);		
	}
	
	function calculateValues() {
		var tmp =[];
		tmp.push(Math.sqrt(((xCoord*xCoord) + (yCoord*yCoord)))); //radius
		tmp.push((Math.atan2(yCoord,xCoord))); //theta
		return tmp;
	}	
	
	return this;
}

var $cartopolMetaData = {
	textName:"cartopol",
	htmlName:"cartopol",
	objectCategory:"Math",
	objectSummary:"Cartesian to Polar coordinate conversion.",
	objectArguments:""	
}