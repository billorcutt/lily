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
*	Construct a new + object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $plus(args) 
{
	var thisPtr=this;
	var val=(+args)||0;	
	this.inlet1=new this.inletClass("inlet1",this,"value to add to");
	this.inlet2=new this.inletClass("inlet2",this,"value to add");	
	this.outlet1=new this.outletClass("outlet1",this,"sum");
	
	this.inlet2["num"]=function(num) {
		if(!isNaN(num))
			val=(+num);
	}
	
	this.inlet1["num"]=function(num) {
		var sum=(+val)+(+num);
		thisPtr.outlet1.doOutlet(sum);
	}
	return this;
}

var $plusMetaData = {
	textName:"+",
	htmlName:"+",
	objectCategory:"Math",
	objectSummary:"Add two numbers.",
	objectArguments:"number to add to [0]"
}