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
*	Construct a new messagetypes object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $messagetypes()
{
	var thisPtr=this;

	this.inlet1=new this.inletClass("inlet1",this,"help text describing this inlet");	
	this.outlet1 = new this.outletClass("outlet1",this,"help text describing this outlet");
	
	//number method
	this.inlet1["num"]=function(val) {
		thisPtr.outlet1.doOutlet("got a number "+val);
	}
	
	//object method
	this.inlet1["obj"]=function(val) {
		thisPtr.outlet1.doOutlet("got a object "+val.toSource());
	}
	
	//boolean method
	this.inlet1["bool"]=function(val) {
		thisPtr.outlet1.doOutlet("got a boolean "+val);
	}	
	
	//bang method
	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet("responding to a bang...");
	}
	
	//custom method
	this.inlet1["doIt"]=function(val) {
		thisPtr.outlet1.doOutlet("doing it " + msg);
	}	
	
	//anything else
	this.inlet1["anything"]=function(msg) {	
		thisPtr.outlet1.doOutlet(msg);
	}	
	
	return this;
}

var $messagetypesMetaData = {
	textName:"messagetypes",
	htmlName:"messagetypes",
	objectCategory:"Sample",
	objectSummary:"Demonstration of message types",
	objectArguments:""	
	
}