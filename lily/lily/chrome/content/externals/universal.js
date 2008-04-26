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
*	Construct a new universal object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $universal()
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"message to send to matching objects");
		
	//send
	this.inlet1["anything"]=function(msg) {	
		var msgArr=LilyUtils.splitArgs(msg);
		if(msg.indexOf("inlet")!=-1) { //message is addressed to a specific inlet
			var className=msgArr.shift();			
			var inlet=msgArr.shift();
			var cmd=msgArr.shift();
			var cmdArgs=msgArr.join(" "); //args		
			var tmp=thisPtr.parent.patchModel.getObjectsByClass(className);	
			for(var i=0;i<tmp.length;i++) {
				if(tmp[i][inlet] && typeof tmp[i][inlet][cmd]=="function")
					tmp[i][inlet][cmd](cmdArgs); //exec the command
			}									
		} else { //addressed to the object
			var className=msgArr.shift();			
			var cmd=msgArr.shift();
			var cmdArgs=msgArr.join(" "); //args		
			var tmp=thisPtr.parent.patchModel.getObjectsByClass(className);	
			for(var i=0;i<tmp.length;i++) {
				if(typeof tmp[i][cmd]=="function")
					tmp[i][cmd](cmdArgs); //exec the command
			}	
		}
	}		
	
	return this;
}

var $universalMetaData = {
	textName:"universal",
	htmlName:"universal",
	objectCategory:"Messages",
	objectSummary:"Send messages to all objects of a certain type.",
	objectArguments:""
}