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
*	Construct a new array object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//need to expand this example with various typed messages
function $array(param)
{

	var paramArr=LilyUtils.splitArgs(param); //args arrive as a string

	if(!paramArr.length) {
		LilyDebugWindow.error("the array object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("array");			
		return;
	}
	
	var thisPtr=this;
	var cmd=paramArr[0]||null;
	var arg=paramArr[1]||null;
	var mapFlag = false;
	var mapLen = 0;
	var mapArr = [];
	this.inlet1=new this.inletClass("inlet1",this,"array or list to modify");	
	this.inlet2=new this.inletClass("inlet2",this,"mapped array element");		
	this.outlet1 = new this.outletClass("outlet1",this,"result");
	this.outlet2 = new this.outletClass("outlet2",this,"modified original array");	
	this.outlet3 = new this.outletClass("outlet3",this,"element to map");
	
	function typeCheck(arr) {
		
		if(LilyUtils.typeOf(arr)=="string"||LilyUtils.typeOf(arr)=="array") {
			return LilyUtils.splitArgs(arr);
		} else {
			LilyDebugWindow.error("wrong type- requires a string or array.");
			return null;
		}
				
	}
	
	//anything else
	this.inlet1["anything"]=function(arr) {
		
		arr=typeCheck(arr);		
		if(arr && cmd && typeof thisPtr[cmd]=="function")
			thisPtr[cmd]((arr));
		else
			LilyDebugWindow.error("no command found.");		

	}
	
	this.inlet2["anything"]=function(val) {
		if(mapFlag) {
			mapArr.push(val);
			if(mapArr.length==mapLen) {
				thisPtr.outlet1.doOutlet(mapArr);
				mapFlag = false;
				mapArr=[];
			}	
		}	
	}
	
	this.chunk=function(arr) {
		thisPtr.outlet2.doOutlet(arr);		
		var tmp=[];
		for(var i=0;i<arr.length;i++) {
			tmp.push(arr[i]);
			if((tmp.length==(arg))||(i==(arr.length))) {
				thisPtr.outlet1.doOutlet(tmp);
				tmp=[];	
			}
		}
		if(tmp.length) { thisPtr.outlet1.doOutlet(tmp); }		
	}
	
	//array methods
	this.length=function(arr) {
		thisPtr.outlet2.doOutlet(arr);
		thisPtr.outlet1.doOutlet(arr.length);				
	}	
	
	this.pop=function(arr) {
		var el = arr.pop();
		thisPtr.outlet2.doOutlet(arr);
		thisPtr.outlet1.doOutlet(el);				
	}
	
	this.index=function(arr) {	
		if(arg && typeof arr[arg]!="undefined") {
			thisPtr.outlet2.doOutlet(arr);
			thisPtr.outlet1.doOutlet(arr[arg]);			
		}				
	}	
		
	this.shift=function(arr) {
		var el = arr.shift();
		thisPtr.outlet2.doOutlet(arr);
		thisPtr.outlet1.doOutlet(el);		
	}
	
	this.reverse=function(arr) {
		thisPtr.outlet2.doOutlet(arr);			
		thisPtr.outlet1.doOutlet(arr.reverse());
	}
	
	this.truncate=function(arr) {	
		if(arg)	{
			var result = arr.splice(0,arg);
			thisPtr.outlet2.doOutlet(arr);			
			thisPtr.outlet1.doOutlet(result);
		}	
	}
	
	this.unique=function(arr) {
		thisPtr.outlet2.doOutlet(arr);			
		thisPtr.outlet1.doOutlet(unique(arr));
	}	
	
	this.count=function(arr) {
		thisPtr.outlet2.doOutlet(arr);				
		thisPtr.outlet1.doOutlet(count(arr));
	}
	
	this.sort=function(arr) {
		thisPtr.outlet2.doOutlet(arr);		
		thisPtr.outlet1.doOutlet(arr.sort());
	}
	
	this.join=function(arr) {
		thisPtr.outlet2.doOutlet(arr);		
		thisPtr.outlet1.doOutlet(arr.join(" "));
	}
	
	this.map=function(arr) {
		mapFlag=true;
		mapLen=arr.length;
		for(var i=0;i<arr.length;i++)
			thisPtr.outlet3.doOutlet(arr[i]);
	}
	
	this.shuffle=function(arr) {
		thisPtr.outlet2.doOutlet(arr);		
		thisPtr.outlet1.doOutlet(LilyUtils.shuffle(arr));
	}	
	
	//hijacked from http://4umi.com/web/javascript/array.htm
	function unique(arr) {
		var a = [];
		for(var i=0; i<arr.length; i++ ) {
			if( a.indexOf( arr[i], 0 ) < 0 ) { a.push( arr[i] ); }
		}
		return a;
	}	
	
	function count(arr) {
		var a = [];
		var array = [];
		for(var i=0; i<arr.length; i++ ) {
			var w = LilyUtils.strip(arr[i]).replace(/^\W$/,'');
			var b = a.indexOf(w,0);
			if(b < 0 && w) {
				a.push(w);
				array.push({"word":w,"count":1}); 
			} else if(w) {
				array[b]["count"]++;	
			}	
		}		
		return array;
	}	
						
	return this;
}

var $arrayMetaData = {
	textName:"array",
	htmlName:"array",
	objectCategory:"Lists",
	objectSummary:"Manipulate lists.",
	objectArguments:"[method name], method arguments"
}