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
*	Construct a new truncate object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $truncate(arg) 
{
	var thisPtr=this;
	var counter=0;
	var timer=null;
	var timeout=500;
	var reset=true;
	var max=(!isNaN(parseInt(arg)))?parseInt(arg):16;	
	this.inlet1=new this.inletClass("inlet1",this,"message stream to truncate when max count is reached, \"reset\" clears the count");
	this.inlet2=new this.inletClass("inlet2",this,"number sets maximum count");	
	this.outlet1=new this.outletClass("outlet1",this,"truncated messages");
	
	this.inlet1["anything"]=function(msg) {
		
		if(reset){ counter=0; }
		setTimer();
		
		if(counter<max) {
			thisPtr.outlet1.doOutlet(msg);
			counter++;			
		}
		
	}
	
	this.inlet1["reset"]=function() {
 		counter=0;
	}	
	
	this.inlet2["anything"]=function(num) {
		max=!isNaN(parseInt(num))?parseInt(num):max;
	}
	
	function setTimer() {
		reset=false;
		clearTimeout(timer);
		timer=setTimeout(function(){
			reset=true;
		},timeout);
	}		
	
	return this;
}

var $truncateMetaData = {
	textName:"truncate",
	htmlName:"truncate",
	objectCategory:"Control",
	objectSummary:"Truncate a stream of messages.",
	objectArguments:"truncate at [16]"
}