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
*	Construct a new trigger object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $trigger(values)
{
	var thisPtr=this;
	var valuesArr=LilyUtils.splitArgs(values)||[];
	var typesArr=[];
	
	this.inlet1=new this.inletClass("inlet1",this,"message to distribute");
	
	if(!valuesArr.length) {
		LilyDebugWindow.error("the trigger object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("trigger");		
		return;			
	}

	
	//create outlets for each argument & build type structure
	for(var i=0;i<valuesArr.length;i++) {
		
		var outType = "";
				
		if(valuesArr[i]=="bang"||valuesArr[i]=="b") {
			outType = "bang";
			typesArr.push({isType:function(type,val){return (val=="bang")},failsafe:"bang",output:function(val){return "bang"}});
		} else if(valuesArr[i]=="list"||valuesArr[i]=="l"||valuesArr[i]=="array"||valuesArr[i]=="a") {
			outType = "array";
			typesArr.push({isType:function(type,val){return (type=="object" && typeof val.join=="function")},failsafe:[],output:function(val){return val}});
		} else if(valuesArr[i]=="float"||valuesArr[i]=="f") {
			outType = "float";
			typesArr.push({isType:function(type,val){return (type=="number")},failsafe:0,output:function(val){return parseFloat(val)}});
		} else if(valuesArr[i]=="integer"||valuesArr[i]=="i"||valuesArr[i]=="int") {
			outType = "integer";
			typesArr.push({isType:function(type,val){return (type=="number")},failsafe:0,output:function(val){return parseInt(val)}});
		} else if(valuesArr[i]=="string"||valuesArr[i]=="s"||valuesArr[i]=="symbol") {
			outType = "string";
			typesArr.push({isType:function(type,val){return type=="string" && val!="bang"},failsafe:"",output:function(val){return val}});
		} else if(valuesArr[i]=="object"||valuesArr[i]=="o") {
			outType = "object";
			typesArr.push({isType:function(type,val){return (type=="object" && typeof val.join=="undefined")},failsafe:{},output:function(val){return val}});
		} else {
			outType = valuesArr[i];
			typesArr.push({isType:function(type,val){return false},failsafe:valuesArr[i]}); //constant
		}
		
		this["outlet"+(i+1)] = new this.outletClass(("outlet"+(i+1)),this,"output "+ outType);

	}
	
	//
	this.inlet1["anything"]=function(data) {
		
		var dataType = typeof data;
		var i=valuesArr.length;
		
		while(i--) {
			if(typesArr[i].isType(dataType,data))
				thisPtr["outlet"+(i+1)].doOutlet(typesArr[i].output(data));
			else
				thisPtr["outlet"+(i+1)].doOutlet(typesArr[i].failsafe);
		}	
	}	
	
	return this;	
}

var $triggerMetaData = {
	textName:"trigger",
	htmlName:"trigger",
	objectCategory:"Control",
	objectSummary:"Output a message as sequence of typed messages.",
	objectArguments:"[values to define outlets]"
}