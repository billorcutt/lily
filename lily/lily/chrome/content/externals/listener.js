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
*	Construct a new listener object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $listener(args)
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"event types to listen for");
	this.outlet1=new this.outletClass("outlet1",this,"list \"[event type] [object id]\"");	
	
	var argsArr=(args)?args.split(" "):[];
	var groups=argsArr.shift();	//if null this will get all objects in the patch
	var oArr=[];
	var listeners=[];
	
	//create the array of objects with this group name
	function initObjectArray() {
		oArr=thisPtr.parent.patchModel.getObjectsByGroupName(groups);				
	}
	
	function initEventListeners() {
		if(argsArr && argsArr.length) {
			for(var i=0;i<oArr.length;i++) {
				for(var j=0;j<argsArr.length;j++) {
					if(listeners.indexOf(oArr[i].objID+"_"+argsArr[j])==-1) {	
						thisPtr.controller.patchController.attachObserver(oArr[i].objID,argsArr[j],function(id,mess){return function(){thisPtr.outlet1.doOutlet(mess+" "+id)}}(oArr[i].objID,argsArr[j]),"performance");
						listeners.push(oArr[i].objID+"_"+argsArr[j]);
					}
				}
			}
		}	
	}
		
	//add a listener
	this.inlet1["anything"]=function(msg) {
				
		for(var i=0;i<oArr.length;i++) {		
			if(listeners.indexOf(oArr[i].objID+"_"+msg)==-1) {
				thisPtr.controller.patchController.attachObserver(oArr[i].objID,msg,function(id,mess){return function(){thisPtr.outlet1.doOutlet(mess+" "+id)}}(oArr[i].objID,msg),"performance")
				listeners.push(oArr[i].objID+"_"+msg);
			}
		}						
	}	
	
	this.inlet1["init"]=function() {
		initObjectArray();
		initEventListeners();	
	}

	//init list
	initObjectArray();
	initEventListeners();
	
	//register for patch Modified event so we can rebuild the list of broadcast receivers
	thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"patchModified",function(){initObjectArray();initEventListeners();},"edit");
	
	return this;
}

var $listenerMetaData = {
	textName:"listener",
	htmlName:"listener",
	objectCategory:"System",
	objectSummary:"Listen for events on named objects.",
	objectArguments:"Names to listen to"
}
