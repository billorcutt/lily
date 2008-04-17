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
*	Construct a new metro object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $metro(tempo)
{
	var thisPtr=this;
	
	var tempo=parseInt(tempo)||1000;
	var intervalID=null;
	var running=false;	
	
	this.outlet1 = new this.outletClass("outlet1",this, "bangs at a given tempo");
	this.inlet1=new this.inletClass("inlet1",this,"true starts, false stops");
	this.inlet2=new this.inletClass("inlet2",this,"number of milliseconds between bangs.");	
	
	this.inlet1["bang"]=function() {
		if(!running)
			start();
		else
			stop();
	}		
	
	this.inlet1["bool"]=function(msg) {
		if(msg && !running)
			start();
		else
			stop();
	}
	
	this.inlet1["num"]=function(val) {
		if(val && !running)
			start();
		else
			stop();
	}
	
	this.inlet2["num"]=function(val) {
				
		if(val)
			tempo=parseInt(val);
			
		if(running) {
			stop();			
			start();		
		}			

	}
	
	function start() {
		intervalID = window.setInterval(pulse, tempo);
		running=true;		
	}
	
	function stop() {
		clearInterval(intervalID);
		running=false;		
	}	
	
	function pulse() {
		thisPtr.outlet1.doOutlet("bang");
	}
	
	return this;
}

var $metroMetaData = {
	textName:"metro",
	htmlName:"metro",
	objectCategory:"Time",
	objectSummary:"Output bang messages at regular intervals.",
	objectArguments:"tempo [1000]"
}