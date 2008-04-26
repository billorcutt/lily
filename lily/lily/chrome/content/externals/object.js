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
*	Construct a new object object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $object()
{
	var thisPtr=this;	
	var gObj={};
	
	this.inlet1=new this.inletClass("inlet1",this,"command to apply to the object");
	this.inlet2=new this.inletClass("inlet2",this,"object to store");
	this.outlet1 = new this.outletClass("outlet1",this,"result if any, otherwise bang on complete");				
		
	//exec commands
	this.inlet1["anything"]=function(str) {
		
		var arr=LilyUtils.splitArgs(str);
		var cmd=arr.shift();
		
		if(gObj && cmd && typeof gObj[cmd]=="function") {
			
			var result = gObj[cmd].apply(gObj,arr);			
			if(typeof result!="undefined")
				thisPtr.outlet1.doOutlet(result);
			else
				thisPtr.outlet1.doOutlet("bang");
		} else if(cmd && typeof gObj[cmd]!="undefined")
			thisPtr.outlet1.doOutlet(gObj[cmd]);
			
	}

	//exec commands
	this.inlet1["clone"]=function(str) {
		//tbd
	}

	//output the stored object
	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet(gObj);
	}

	//output the stored object
	this.inlet1["clear"]=function() {
		gObj={};
	}	
	
	//store properties in the object
	this.inlet1["obj"]=function(o) {
		
		var clone = LilyUtils.cloneObject(o);
		for(var x in clone) {
			gObj[x]=clone[x];
		}
		
	}			
			
	//store object
	this.inlet2["anything"]=function(str) {
		
		var tmp = LilyUtils.convertType(str); //convert to whatever type it appears to be	
		if(LilyUtils.typeOf(tmp)=="object") //if its an object, load it
			gObj=tmp;
		else if(LilyUtils.typeOf(tmp)=="string") //if its a string, assume its an object id.
			gObj=thisPtr.parent.getObj(tmp);
			
	}
	
	//store object
	this.inlet2["obj"]=function(o) {
		gObj=o;		
	}	
	
	return this;
}

var $objectMetaData = {
	textName:"object",
	htmlName:"object",
	objectCategory:"Objects",
	objectSummary:"Call an object's methods and access its properties.",
	objectArguments:""
}