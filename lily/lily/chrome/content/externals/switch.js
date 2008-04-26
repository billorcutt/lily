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
*	Construct a new switch object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $switch(str)
{
	var thisPtr=this;
	var number=parseInt(str.split(" ")[0])||1;
	var selected=parseInt(str.split(" ")[1])||0;	

	this.inlet1=new this.inletClass("inlet1",this,"number switches active inlet");
	this.outlet1=new this.outletClass("outlet1",this,"messages routed from inlets");
	
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
	
	//create inlets for arguments.
	for(var i=0;i<number;i++) {
		this["inlet"+(i+2)] = new this.inletClass(("inlet"+(i+2)),this,"messages are routed to output when number in the left inlet is "+(i+1));
		this["inlet"+(i+2)]["anything"]=function() {
			
			var index=(i+1);
			return function(msg) {
				if(selected==index)
					thisPtr.outlet1.doOutlet(msg);
			}
			
		}();
	}	
	
	return this;
}

var $switchMetaData = {
	textName:"switch",
	htmlName:"switch",
	objectCategory:"Control",
	objectSummary:"Route various inputs to a single output.",
	objectArguments:"number of inlets [1], active inlet [0]"
}