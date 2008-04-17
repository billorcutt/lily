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
*	Construct a new greaterthanequals object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $greaterthanequals(arg)
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"value to compare");
	this.inlet2=new this.inletClass("inlet2",this,"comparison value");	
	this.outlet1=new this.outletClass("outlet1",this,"true if greater than or equal, otherwise false");
	this.outlet2=new this.outletClass("outlet2",this,"value from input if condition is true");	
	
	var value=arg||0;

	this.inlet1["anything"]=function(msg) {
		if(msg>=value) {
			thisPtr.outlet2.doOutlet(msg);
			thisPtr.outlet1.doOutlet(true);				
		} else {
			thisPtr.outlet1.doOutlet(false);
		}	
	}
	
	this.inlet2["anything"]=function(val) {
		value=val;
	}	
	
	return this;
}

var $greaterthanequalsMetaData = {
	textName:">=",
	htmlName:"&gt;=",
	objectCategory:"Math",
	objectSummary:"Compare two messages.",
	objectArguments:"value to compare [0]"
}