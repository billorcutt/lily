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
*	Construct a new gate object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $gate(str)
{
	var thisPtr=this;
	var number=parseInt(str.split(" ")[0])||1;
	var selected=parseInt(str.split(" ")[1])||0;	
	this.inlet1=new this.inletClass("inlet1",this,"number routes messages to that numbered outlet, 0 closes gate");
	this.inlet2=new this.inletClass("inlet2",this, "routed messages");
	
	this.inlet1["num"]=function(val){
		if(!isNaN(parseInt(val))) {
			if(parseInt(val)>number) {
				selected=number; //constrain to max
			} else if(parseInt(val)<0) {
				selected=0; //constrain to min
			} else {
				selected=parseInt(val);
			}
		}	
	}
	
	this.inlet1["bool"]=function(val) {
		if(val)
			selected=1; //constrain to min
		else
			selected=0;			
	}		
	
	this.inlet2["anything"]=function(msg) {
		if(selected)
			thisPtr["outlet"+selected].doOutlet(msg);
	}
	
	//create outlets for each argument.
	for(var i=0;i<number;i++)
		this["outlet"+(i+1)] = new this.outletClass(("outlet"+(i+1)),this,"input routed here when control is "+(i+1));
	
	return this;
}

var $gateMetaData = {
	textName:"gate",
	htmlName:"gate",
	objectCategory:"Control",
	objectSummary:"Control the flow of messages.",
	objectArguments:"number of outlets [1], active outlet [0]"
}