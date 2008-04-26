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
*	Construct a new explode object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $explode(keys)
{
	var thisPtr=this;
	
	
	if(!keys.length) {
		LilyDebugWindow.error("the explode object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("explode");		
		return;
	}
	
	var keysArr=LilyUtils.splitArgs(keys); //args arrive as a string
	this.inlet1=new this.inletClass("inlet1",this,"hash to be exploded");
	
	//create outlets for each argument.	
	for(var i=0;i<keysArr.length;i++)
		this["outlet"+(i+1)] = new this.outletClass(("outlet"+(i+1)),this,"value bound to key "+keysArr[i]);
		
	this.inlet1["obj"]=function(data) {
		for(var i=(keysArr.length-1);i>=0;i--) {		
			if(data[keysArr[i]])
				thisPtr["outlet"+(i+1)].doOutlet(data[keysArr[i]]);
		}
	}
	return this;	
}

var $explodeMetaData = {
	textName:"explode",
	htmlName:"explode",
	objectCategory:"Objects",
	objectSummary:"Output values for any keys in a hash message.",
	objectArguments:"[hash keys]"
}