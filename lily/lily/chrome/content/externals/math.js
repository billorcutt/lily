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
*	Construct a new math object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $math(param)
{
	var thisPtr=this;
	var cmd=param||null;
	this.outlet1 = new this.outletClass("outlet1",this,"result");
	this.inlet1=new this.inletClass("inlet1",this,"methods: \"PI\", \"abs\", \"acos\", \"asin\", \"atan\", \"atan2\", \"ceil\", \"cos\", \"floor\", \"log\", \"max\", \"pow\", \"round\", \"sin\", \"sqrt\", \"tan\"");	
	
	//anything else
	this.inlet1["anything"]=function(msg) {
		if(cmd && typeof thisPtr.inlet1[cmd]=="function")
			thisPtr.inlet1[cmd]((msg));
		else
			thisPtr.outlet1.doOutlet((msg));	
	}
	
	//properties
	this.inlet1["PI"]=function() {
		thisPtr.outlet1.doOutlet(Math.PI);
	}

	//static methods of math
	this.inlet1["abs"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.abs(num));
	}

	this.inlet1["toDegrees"]=function(num) {		
		thisPtr.outlet1.doOutlet(parseInt(num * (180/Math.PI)));
	}

	this.inlet1["toRadians"]=function(num) {
		thisPtr.outlet1.doOutlet(parseFloat(num * (Math.PI/180)));
	}						

	this.inlet1["acos"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.acos(num));
	}		

	this.inlet1["asin"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.asin(num));
	}		

	this.inlet1["atan"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.atan(num));
	}		

	this.inlet1["atan2"]=function(num) {
		var arr = LilyUtils.splitArgs(num);		
		thisPtr.outlet1.doOutlet(Math.atan2(arr[0],arr[1]));
	}		

	this.inlet1["ceil"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.ceil(num));
	}
	
	this.inlet1["cos"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.cos(num));
	}		

	this.inlet1["exp"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.exp(num));
	}		

	this.inlet1["floor"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.floor(num));
	}		

	this.inlet1["log"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.log(num));
	}		

	this.inlet1["max"]=function(num) {
		var arr = LilyUtils.splitArgs(num);
		thisPtr.outlet1.doOutlet(Math.max.apply(this,arr));
	}
	
	this.inlet1["min"]=function(num) {
		var arr = LilyUtils.splitArgs(num);
		thisPtr.outlet1.doOutlet(Math.min.apply(this,arr));
	}	
	
	this.inlet1["pow"]=function(num) {
		var arr = LilyUtils.splitArgs(num);		
		thisPtr.outlet1.doOutlet(Math.pow(arr[0],arr[1]));
	}			

	this.inlet1["round"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.round(num));
	}		

	this.inlet1["sin"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.sin(num));
	}	
	
	this.inlet1["sqrt"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.sqrt(num));
	}
	
	this.inlet1["tan"]=function(num) {
		thisPtr.outlet1.doOutlet(Math.tan(num));
	}			
								
	this.inlet1["E"]=function() {
		thisPtr.outlet1.doOutlet(Math.E);
	}

	return this;
}

var $mathMetaData = {
	textName:"math",
	htmlName:"math",
	objectCategory:"Math",
	objectSummary:"Call methods using the Javascript Math object.",
	objectArguments:""
}