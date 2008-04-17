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
*	Construct a new select object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $select(vals)
{
	var thisPtr=this;
	var valuesArr=LilyUtils.splitArgs(vals);
	
	if(!valuesArr.length) {
		LilyDebugWindow.error("the select object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("select");		
		return;
	}
	
	this.inlet1=new this.inletClass("inlet1",this,"message to test");	
	
	//create outlets for each argument.
	for(var i=0;i<valuesArr.length;i++)
		this["outlet"+(i+1)] = new this.outletClass(("outlet"+(i+1)),this,"bang if input matches "+valuesArr[i]);
	
	this["outlet"+(valuesArr.length+1)] = new this.outletClass(("outlet"+(valuesArr.length+1)),this,"no match");	
		
	//
	this.inlet1["anything"]=function(data) {
		
		if(LilyUtils.typeOf(data)=="boolean" && data==true)
			data="true";
		else if(LilyUtils.typeOf(data)=="boolean" && data==false)
			data="false";
		else if(data==null)
			data="null";
			
		for(var i=0;i<valuesArr.length;i++) {			
			if(data==valuesArr[i]) {
				thisPtr["outlet"+(i+1)].doOutlet("bang");
				return;
			}	
		}
		thisPtr["outlet"+(valuesArr.length+1)].doOutlet(data);
	}
	return this;	
}

var $selectMetaData = {
	textName:"select",
	htmlName:"select",
	objectCategory:"Control",
	objectSummary:"Selectively output bangs for matching messages.",
	objectArguments:"[values to select]"
}