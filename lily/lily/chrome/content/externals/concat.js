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
*	Construct a new concat object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $concat(args)
{
	var thisPtr=this;
	var currArray=[];
	var timeout=parseInt(args.split(" ")[1])||100;
	var padding=(args.split(" ")[0]!=undefined&&args.split(" ")[0]=="nopad")?"":" ";
	var timer=null;	
	
	this.inlet1=new this.inletClass("inlet1",this,"text to concatenate, \"clear\" resets the string, \"dump\" outputs and clears the concatenated string");
	this.outlet1 = new this.outletClass("outlet1",this,"resulting string");	
	
	//add to array
	this.inlet1["add"]=function(msg) {
		currArray.push(msg);
	}
	
	//output & clear array
	this.inlet1["dump"]=function(msg) {
		outputStr();
	}
	
	//output & clear array
	this.inlet1["clear"]=function(msg) {
		currArray=[];
	}	
	
	//output array
	this.inlet1["bang"]=function(msg) {
		if(currArray.length)
			thisPtr.outlet1.doOutlet(currArray.join(padding));
		else
			thisPtr.outlet1.doOutlet("bang");
	}			
	
	//add to array
	this.inlet1["anything"]=function(msg) {
		setTimer();
		currArray.push(msg);
	}
	
	function outputStr() {
		
		if(currArray.length)
			thisPtr.outlet1.doOutlet(currArray.join(padding));
		else
			thisPtr.outlet1.doOutlet("bang");
			
		currArray=[];		
	}	
	
	function setTimer() {
		clearTimeout(timer);
		timer=setTimeout(function(){
			outputStr();
		},timeout);
	}

				
	return this;
}

var $concatMetaData = {
	textName:"concat",
	htmlName:"concat",
	objectCategory:"Strings",
	objectSummary:"Join messages together.",
	objectArguments:"padding [\" \"], threshold [100]"
}