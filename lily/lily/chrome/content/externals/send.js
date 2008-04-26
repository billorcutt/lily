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
*	Construct a new send object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $send(args)
{
	var thisPtr=this;
	var sendName=args||null; //XXX fixme - only takes a single group argument for the moment- extend to handle multiple group arguments.	
	
	if(!sendName) {
		LilyDebugWindow.error("the send object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("send");		
		return;
	}
	
	var oArr=[];	
	this.inlet1=new this.inletClass("inlet1",this,"message to send to matching receive objects");
	
	function getObjectArray(name) {
		if(typeof Lily.receiveObjects[name] == "object")
			return Lily.receiveObjects[name];
		else
			return [];
	}
	
	//send
	this.inlet1["anything"]=function(msg) {
		var oArr = getObjectArray(sendName);
		for(var i=0;i<oArr.length;i++) {
			oArr[i].receiveSentData(msg); //exec the command
		}
	}
	
	//send
	this.inlet1["send"]=function(msg) {
		var msgArr=LilyUtils.splitArgs(msg);
		var receive=msgArr.shift();
		var args=msgArr.join(" "); //args
		var tmp=getObjectArray(receive);	
		for(var i=0;i<tmp.length;i++) {
			tmp[i].receiveSentData(args); //exec the command
		}
	}		
	
	return this;
}

var $sendMetaData = {
	textName:"send",
	htmlName:"send",
	objectCategory:"Messages",
	objectSummary:"Send messages to named receivers without using connections.",
	objectArguments:"[receivers to send to]"
}