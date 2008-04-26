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
*	Construct a new value object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $value(args)
{
	var thisPtr=this;

	var objName=args||"LilyUniqueGlobalValue";
	this.outlet1 = new this.outletClass("outlet1",this,"shared value");	
	this.inlet1=new this.inletClass("inlet1",this,"value to share, \"bang\" outputs value, \"send\" forwards message to receive objects");		
	
	this.inlet1["anything"]=function(val) {
		Lily.setSharedValue(objName,val);
	}
	
	this.inlet1["bang"]=function() {
		var val=Lily.getSharedValue(objName);
		if(val!=undefined)
			thisPtr.outlet1.doOutlet(val);
	}
	/*	
	//send
	this.inlet1["send"]=function(msg) {
		var msgArr=LilyUtils.splitArgs(msg);
		var receive=msgArr.shift();
		var args=msgArr.join(" "); //args
		var tmp=thisPtr.parent.patchModel.getReceiveObjectsById(receive);	
		for(var i=0;i<tmp.length;i++) {
			tmp[i].receiveSentData(args); //exec the command
		}
	}
	*/		
		
		
	return this;
}

var $valueMetaData = {
	textName:"value",
	htmlName:"value",
	objectCategory:"Messages",
	objectSummary:"Share data between patches.",
	objectArguments:"shared name"
}