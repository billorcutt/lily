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
*	Construct a new broadcast object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $broadcast(args)
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"message to broadcast");
	
	var groups=args||null;	//if null this will get all objects in the patch
	var oArr=[];
	
	//create the array of objects with this group name
	function initObjectArray() {
		oArr=thisPtr.parent.patchModel.getObjectsByGroupName(groups);				
	}
	
	//broadcast
	this.inlet1["anything"]=function(msg) {
		var msgArr=LilyUtils.splitArgs(msg);
		if(msg.indexOf("inlet")!=-1) { //message is addressed to a specific inlet
			var inlet=msgArr.shift();
			var cmd=msgArr.shift();
			var cmdArgs=msgArr.join(" "); //args
			for(var i=0;i<oArr.length;i++) {
				if(oArr[i][inlet] && typeof oArr[i][inlet][cmd]=="function")
					oArr[i][inlet][cmd](cmdArgs); //exec the command
			}						
		} else { //addressed to the object
			var cmd=msgArr.shift();
			var cmdArgs=msgArr.join(" "); //args			
			for(var i=0;i<oArr.length;i++) {
				if(typeof oArr[i][cmd]=="function")
					oArr[i][cmd](cmdArgs); //exec the command
			}	
		}
	}	

	//init list
	initObjectArray();
	//register for patch Modified event so we can rebuild the list of broadcast receivers
	thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"patchModified",initObjectArray,"edit");
	
	return this;
}

var $broadcastMetaData = {
	textName:"broadcast",
	htmlName:"broadcast",
	objectCategory:"Messages",
	objectSummary:"Broadcast messages to objects without making connections.",
	objectArguments:"name to broadcast to"
}
