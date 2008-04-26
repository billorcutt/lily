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
*	Construct a new var object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $var(val)
{
	var thisPtr=this;
	var value=LilyUtils.convertType(val)||"";
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs stored value");
	this.inlet2=new this.inletClass("inlet2",this,"store value");
	this.outlet1 = new this.outletClass("outlet1",this,"stored value");

	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet(value);
	}
	
	this.inlet2["anything"]=function(newVal){
		value=newVal;
	}
	
	this.inlet1["anything"]=function(newVal){
		value=newVal;
		thisPtr.outlet1.doOutlet(value);		
	}
				
	return this;
}

var $varMetaData = {
	textName:"var",
	htmlName:"var",
	objectCategory:"Control",
	objectSummary:"Store a message and output it with a bang.",
	objectArguments:"initial value"
}