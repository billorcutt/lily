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
*	Construct a new print object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $typeof()
{
	var thisPtr=this;	
		
	this.inlet1=new this.inletClass("inlet1",this,"messages to route by type");	
	this.outlet1 = new this.outletClass("outlet1",this,"booleans will be routed to this outlet");
	this.outlet2 = new this.outletClass("outlet2",this,"arrays will be routed to this outlet");
	this.outlet3 = new this.outletClass("outlet3",this,"numbers will be routed to this outlet");
	this.outlet4 = new this.outletClass("outlet4",this,"objects will be routed to this outlet");
	this.outlet5 = new this.outletClass("outlet5",this,"strings will be routed to this outlet");
	
	this.inlet1["anything"]=function(msg) {		
		if(typeof msg=='boolean') {
			thisPtr.outlet1.doOutlet(msg);
		} else if(LilyUtils.typeOf(msg)=='array') {
			thisPtr.outlet2.doOutlet(msg);
		} else if(typeof msg=='number') {
			thisPtr.outlet3.doOutlet(msg);
		} else if(typeof msg=='object') {
			thisPtr.outlet4.doOutlet(msg);
		} else if(typeof msg=='string') {
			thisPtr.outlet5.doOutlet(msg);
		}
	}
	
	return this;
}

var $typeofMetaData = {
	textName:"typeof",
	htmlName:"typeof",
	objectCategory:"Control",
	objectSummary:"Route messages based on type.",
	objectArguments:""
}