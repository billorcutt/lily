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
*	Construct a new pack object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $pack(args)
{
	var thisPtr=this;
	this.args=args||"0"; //text to be displayed/output
	
	//init array
		var objArray=LilyUtils.splitArgs(this.args.toString());
		var orgArr=LilyUtils.splitArgs(this.args.toString());	
		var arrayLength=objArray.length;

	//data inlets
	for(var i=0;i<arrayLength;i++) {
		var helpStr=(i==0)?("\"bang\" outputs array, input sets element value and outputs array, \"reset\" restores array to default values, default value is "+objArray[i]):("set element value, default value is "+objArray[i]);
		this["inlet"+(i+1)] = new this.inletClass(("inlet"+(i+1)),this,helpStr);
		var index=i;
		with({num:index}) {
			
			//define function to handle data input
			this["inlet"+(i+1)]["anything"]=function(msg) {		
				objArray[num]=msg;	
				if(num==0)
					outputArray();
			}
			
			//addl method for data input
			this["inlet"+(i+1)]["set"]=function(msg) {	
				objArray[num]=msg;	
			}
				
		}	
	}
		
	//reset array to original state
	this.inlet1["reset"]=function() {
		resetArray();
	}
	
	//output last input array
	this.inlet1["bang"]=function() {
		outputArray();				
	}
		
	//output array
	function outputArray() {
		thisPtr.outlet1.doOutlet(objArray);
	}
	
	//reset the array
	function resetArray() {
		for(var i=0;i<orgArr.length;i++)
			objArray[i]=orgArr[i];
	}	
		
	//array output here	
	this.outlet1 = new this.outletClass("outlet1",this,"resulting array");
		
	return this;
}

var $packMetaData = {
	textName:"pack",
	htmlName:"pack",
	objectCategory:"Lists",
	objectSummary:"Construct an array from individual messages.",
	objectArguments:"pack arguments [0]"
}