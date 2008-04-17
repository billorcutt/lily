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
*	Construct a new buffer object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $buffer()
{
	var thisPtr=this;
	var arr=[];

	this.inlet1=new this.inletClass("inlet1",this,"messages to buffer, \"bang\" outputs & removes the oldest message in the buffer, \"clear\" resets buffer");		
	this.inlet2=new this.inletClass("inlet2",this,"input array is set as the buffer");		
	this.outlet1 = new this.outletClass("outlet1",this, "buffered messages");
	this.outlet2 = new this.outletClass("outlet2",this, "buffer length, bang when buffer empty");	

	var currIdx = -1;
	
	this.inlet1["anything"]=function(lastIn) {
		arr.push(lastIn);
	}
	
	this.inlet1["push"]=function(lastIn) {
		arr.push(lastIn);
	}
	
	this.inlet1["dump"]=function() {
		
		if(arr.length)
			thisPtr.outlet1.doOutlet(arr);
			
		arr=[];
		currIdx=-1;		
		thisPtr.outlet2.doOutlet("bang");		
	}	
	
	this.inlet1["clear"]=function() {
		arr=[];
		currIdx=-1;		
	}
	
	this.inlet2["obj"]=function(a) {
		arr=a;
		currIdx=-1;		
	}	
	
	this.inlet1["reverse"]=function() {
		if(arr.length)
			arr.reverse();
	}	
	
	this.inlet1["pop"]=function() {
		var el=arr.pop();
		if(el && typeof el!="undefined")
			thisPtr.outlet1.doOutlet(el);
		else
			thisPtr.outlet1.doOutlet("bang");	
	}
	
	this.inlet1["splice"]=function(len) {
		if(len<=arr.length) {
			var a=arr.splice(0,len);
			thisPtr.outlet1.doOutlet(a);			
		} 
	}	
	
	this.inlet1["shift"]=function() {
		var el=arr.shift();
		if(el && typeof el!="undefined")
			thisPtr.outlet1.doOutlet(el);
		else
			thisPtr.outlet1.doOutlet("bang");	
	}
	
	this.inlet1["join"]=function(str) {
		var delim = str||" ";
		if(arr.join(delim))
			thisPtr.outlet1.doOutlet(arr.join(delim));
	}
	
	this.inlet1["next"]=function() {
		currIdx = ((currIdx+1)<arr.length)?(currIdx+1):0;
		if(typeof arr[currIdx]!="undefined")		
			thisPtr.outlet1.doOutlet(arr[currIdx]);
	}
	
	this.inlet1["prev"]=function(str) {
		currIdx = ((currIdx-1)<0)?(arr.length-1):(currIdx-1);
		if(typeof arr[currIdx]!="undefined")		
			thisPtr.outlet1.doOutlet(arr[currIdx]);
	}
	
	this.inlet1["reset"]=function() {
		currIdx=-1;
	}						
	
	this.inlet1["bang"]=function() {
		var el=arr.shift();
		if(el && typeof el!="undefined")
			thisPtr.outlet1.doOutlet(el);
		else if(!arr.length)
			thisPtr.outlet2.doOutlet("bang");
	}
	
	this.inlet1["index"]=function(i) {
		if(typeof arr[i]!="undefined")
			thisPtr.outlet1.doOutlet(arr[i]);	
	}
	
	this.inlet1["length"]=function() {
		if(typeof arr.length!="undefined")
			thisPtr.outlet2.doOutlet(arr.length);
		else
			thisPtr.outlet2.doOutlet(0);
	}	
	
	return this;
}

var $bufferMetaData = {
	textName:"buffer",
	htmlName:"buffer",
	objectCategory:"Lists",
	objectSummary:"Buffer, manipulate and output messages.",
	objectArguments:""
}