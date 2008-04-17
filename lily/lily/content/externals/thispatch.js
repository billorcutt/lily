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
*	Construct a new thispatch object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//sample command- params to createObject- [classname,subpatchID,top,left,id,args]
//createObject("print",null,100,250,"myPrint",null);
//patchView.setPatchColor(#FF0000)
function $thispatch() 
{
	var thisPtr=this;
	
	this.inlet1=new this.inletClass("inlet1",this,"patch commands to execute");
	this.outlet1=new this.outletClass("outlet1",this,"result if any or \"bang\"");
			
	//exec commands
	this.inlet1["create"]=function(str) { //name,pID,t,l,id,args
		var tmp=LilyUtils.splitArgs(str);
		var className=tmp.shift();
		var top=tmp.shift();
		var left=tmp.shift();	
		var objectID=tmp.shift();
		var args=tmp.join(" ");
		var obj=thisPtr.parent.createObject(className,null,top,left,objectID,args); //create object
		thisPtr.outlet1.doOutlet(obj); 
	}
	
	//make a connection
	this.inlet1["connect"]=function(str) { //elIDIn,elIDOut,segmentArray,pID
		var tmp=LilyUtils.splitArgs(str);
		var inlet=tmp.shift();
		var outlet=tmp.shift();
		thisPtr.parent.createConnection(inlet,outlet,null,null);
	}
	
	//replace the object.
	this.inlet1["replace"]=function(str) { //objID,newObjName,newArgs
		var tmp=str.split(" ");
		var className=tmp.shift();
		var args=tmp.join(" ");
		var oldObj = thisPtr.parent.getObj(objID);
		var obj=thisPtr.parent.replaceObject(oldObj,className,args);
		thisPtr.outlet1.doOutlet(obj);		
	}			
	
	//delete the object.
	this.inlet1["delete"]=function(str) {	
		var id=str;					
		thisPtr.parent.deleteObject(id); //name,pID,t,l,id,args
	}	
		
	this.inlet1["anything"]=function(cmdStr) {
		var result=doCommand(cmdStr); //execute
		if(typeof result!="undefined") {
			thisPtr.outlet1.doOutlet(result);
		} else {
			thisPtr.outlet1.doOutlet("bang"); //bang when execution completes
		}	
	}

	this.inlet1["path"]=function() {
		var file = doCommand("getPatchFile()");
		if(file.exists()) {
			thisPtr.outlet1.doOutlet(file.path);	
		}
	}

	this.inlet1["parentPath"]=function() {
		var file = doCommand("getPatchDir()");
		if(file.exists()) {
			thisPtr.outlet1.doOutlet(file.path);	
		}
	}

	function doCommand(str) {
		try {
			return eval("thisPtr.parent."+str); //execute	
		} catch(e) {
			LilyDebugWindow.error(e.name + ": " + e.message);
		}
	}
	
	return this;
}

var $thispatchMetaData = {
	textName:"thispatch",
	htmlName:"thispatch",
	objectCategory:"System",
	objectSummary:"Send messages to a patch to interact with it.",
	objectArguments:""
}