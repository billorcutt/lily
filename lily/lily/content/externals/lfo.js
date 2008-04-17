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
*	Construct a new lfo object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $lfo(freq)
{
	var thisPtr=this;
	
	var frequency=(parseFloat(freq)>0)?(parseFloat(freq)):1;	
	var tempo=parseInt(50/frequency);
	var intervalID=null;
	var count=0;
	var countMax=20;
	var direction="up";
	
	var running=false;
	this.outlet1 = new this.outletClass("outlet1",this, "numbers between -1 & 1");
	this.inlet1=new this.inletClass("inlet1",this,"true starts, false stops");
	this.inlet2=new this.inletClass("inlet2",this,"frequency in Hz");		
	
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
		
		if(val) {
			frequency=(parseFloat(val)>0)?(parseInt(val)):1;
			tempo=parseInt(100/frequency); //100 is default 
		}			
		
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
	
	//from musicdsp.org- posted by fumminger[AT]umminger[DOT]com
	function pseudo_sine(x)
	{
	    // Compute 2*(x^2-1.0)^2-1.0
	    x *= x; 
	    x -= 1.0;
	    x *= x;
	    // The following lines modify the range to lie between -1.0 and 1.0.
	   // If a range of between 0.0 and 1.0 is acceptable or preferable
	   // (as in a modulated delay line) then you can save some cycles.
	    x *= 2.0;
	    x -= 1.0;
		return x;
	}		
	
	function pulse() {
		
		if(direction=="up") {
			if((count+1)<countMax) {
				count++;
			} else {
				direction="down";
				count++;				
			}	
		} else {
			if((count-1)>0) {
				count--;
			} else {
				direction="up";
				count--;				
			}	
		}			
		
		thisPtr.outlet1.doOutlet(pseudo_sine((count-(countMax/2))/(countMax/2)));
	}
	
	return this;
}

var $lfoMetaData = {
	textName:"lfo",
	htmlName:"lfo",
	objectCategory:"Time",
	objectSummary:"Low Frequency Oscillator.",
	objectArguments:"frequency hz [1]"
}