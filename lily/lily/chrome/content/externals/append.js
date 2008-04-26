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
*	Construct a new append object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $append(appendStr)
{
	var thisPtr=this;
	var appendStr=(appendStr+"")||"";
	
	this.inlet1=new this.inletClass("inlet1",this,"message to append to");
	this.inlet2=new this.inletClass("inlet2",this,"message to append");		
	this.outlet1 = new this.outletClass("outlet1",this,"appended string");	
	
	this.inlet1["anything"]=function(msg) {
		var newStr=msg+" "+appendStr;
		thisPtr.outlet1.doOutlet(newStr);
	}
	
	this.inlet2["anything"]=function(msg) {
		appendStr=(msg+"");
	}		
	
	return this;
}

var $appendMetaData = {
	textName:"append",
	htmlName:"append",
	objectCategory:"Messages",
	objectSummary:"Append text to a message.",
	objectArguments:"text to append"
}