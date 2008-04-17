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
*	Construct a new routeall object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $routeall(values)
{
	var thisPtr=this;
	var valuesArr=LilyUtils.splitArgs(values); //args arrive as a string	
	
	if(!valuesArr.length) {
		LilyDebugWindow.error("the routeall object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("routeall");		
		return;
	}	
		
	this.inlet1=new this.inletClass("inlet1",this,"array or list to route");		
	
	//create outlets for each argument.
	for(var i=0;i<valuesArr.length;i++)
		this["outlet"+(i+1)] = new this.outletClass(("outlet"+(i+1)),this,"items matching "+valuesArr[i]);
	
	this["outlet"+(valuesArr.length+1)] = new this.outletClass(("outlet"+(valuesArr.length+1)),this,"no match");	
		
	//
	this.inlet1["anything"]=function(data) {
		
		var dataArr=LilyUtils.splitArgs(data);
		var cmd=dataArr.shift();
		
		for(var i=0;i<valuesArr.length;i++) {			
			if(cmd==valuesArr[i]) {
				thisPtr["outlet"+(i+1)].doOutlet(data);
				return;
			}	
		}
		thisPtr["outlet"+(valuesArr.length+1)].doOutlet(data);
	}
	return this;	
}

var $routeallMetaData = {
	textName:"routeall",
	htmlName:"routeall",
	objectCategory:"Control",
	objectSummary:"Route an entire list by the first element.",
	objectArguments:"[values to route to]"
}