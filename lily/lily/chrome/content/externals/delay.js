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
*	Construct a new delay object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $delay(msToDelay)
{
	var thisPtr=this;
	var msToDelay=parseInt(msToDelay)||1000; //default to 1 second.
	var timeoutID = null

	this.inlet1=new this.inletClass("inlet1",this,"message to delay");	
	this.outlet1 = new this.outletClass("outlet1",this,"delayed message");
	
	this.inlet1["anything"]=function(msg) {
		timeoutID = window.setTimeout(function(){thisPtr.outlet1.doOutlet(msg)},msToDelay);
	}
	
	this.inlet1["clear"]=function(msg) {
		window.clearTimeout(timeoutID);
	}
	
	this.inlet1["set"]=function(msg) {
		msToDelay=parseInt(msg);
	}			
	
	return this;
}

var $delayMetaData = {
	textName:"delay",
	htmlName:"delay",
	objectCategory:"Time",
	objectSummary:"Delay a message by specified amount.",
	objectArguments:"milliseconds to delay [1000]"
}