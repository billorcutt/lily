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
*	Construct a new ramp object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $ramp(args)
{
	var thisPtr=this;
	
	this.args=args||"";
	var argsArr=args.split(" ");
	
	var startVal=null;
	var endVal=null;
	var time=null;
	var countBy=1;
	var currVal=null;				
	var intervalID=null;
	var tempo=40;
	var minTempo=20;
	var running=false;

	this.inlet1=new this.inletClass("inlet1",this,"list of 3 parameters: \"[start point] [end point] [ramp time]\", \"bang\" repeats last ramp");		
	this.outlet1 = new this.outletClass("outlet1",this,"sequence of numbers");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete");	

	//run with the current params
	this.inlet1["bang"]=function() {
		currVal=startVal;		
		if(tempo!=null && !running) {
			start();
		} else if(running && tempo!=null) {
			stop();
			start();	
		} else {
			stop();
		}
	}
	
	//args as array
	this.inlet1["obj"]=function(arr) {
		initArgs(arr);
		if(tempo!=null && !running) {
			start();
		} else if(running && tempo!=null) {
			stop();
			start();	
		} else {
			stop();
		}
	}
	
	//args as string convert to arr
	this.inlet1["anything"]=function(str) {
		var arr=str.toString().split(" ");
		initArgs(arr);
		if(tempo!=null && !running) {
			start();
		} else if(running && tempo!=null) {
			stop();
			start();	
		} else {
			stop();
		}
	}
	
	//args as string convert to arr
	this.inlet1["stop"]=function() {
		if(intervalID!=null){
			clearInterval(intervalID);
			intervalID=null;	
		}	
//		currVal=startVal;
//		currVal=endVal;		
		running=false;
	}
	
	function initArgs(argsArr) {
		
		//assign start & end points
		if(argsArr.length==3) { //start, end & time
			startVal=parseInt(argsArr[0]);
			endVal=parseInt(argsArr[1]);
			time=parseInt(argsArr[2]);
			currVal=startVal;			
		} else if(argsArr.length==2) { //end & time
			endVal=parseInt(argsArr[0]);
			time=parseInt(argsArr[1]);
			startVal=currVal;
		} else if(argsArr.length==1) { //just output this value immediately			
			startVal=parseInt(argsArr[0]);
			endVal=parseInt(argsArr[0]);
			currVal=parseInt(argsArr[0]);
			countBy=null;
			return;
		}
		
		//LilyDebugWindow.print(startVal+" "+endVal+" "+time)

		//calculate tempo
		if(startVal!=null && endVal!=null && time!=null) {
			tempo=((time/Math.abs((endVal-startVal)))>minTempo)?(time/Math.abs((endVal-startVal))):minTempo;
			countBy=Math.round(Math.abs((endVal-startVal))/(time/tempo));
		} else {
			countBy=null;
			tempo=null;
		}	
	}
	
	function start() {
		
		if(startVal<endVal){
			intervalID = window.setInterval(up, tempo);
		}else if(startVal>endVal){
			intervalID = window.setInterval(down, tempo);
		}else{
			thisPtr.outlet1.doOutlet(endVal);
			stop();
			return;
		}
		running=true;				
	}
	
	function stop() {
		
		if(intervalID!=null){
			clearInterval(intervalID);
			intervalID=null;	
		}	
//		currVal=startVal;
		currVal=endVal;		
		running=false;
		thisPtr.outlet2.doOutlet("bang");
	}	
	
	function up() {
		
		if((currVal+countBy)<endVal) {
			thisPtr.outlet1.doOutlet(currVal);
			currVal+=countBy;			
		} else {
			thisPtr.outlet1.doOutlet(endVal);
			stop();				
		} 
	}
	
	function down() {
		
		if((currVal-countBy)>endVal) {
			thisPtr.outlet1.doOutlet(currVal);
			currVal-=countBy;			
		} else {
			thisPtr.outlet1.doOutlet(endVal);
			stop();				
		}		
	}	
	
	initArgs(argsArr);
	
	return this;
}

var $rampMetaData = {
	textName:"ramp",
	htmlName:"ramp",
	objectCategory:"Time",
	objectSummary:"Output numbers in sequence.",
	objectArguments:"[start value], end value, time to get there "
}