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
*	Construct a new unpack object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $unpack(args)
{
	var thisPtr=this;
	var argsArr=LilyUtils.splitArgs(args)||[0];
	this.inlet1=new this.inletClass("inlet1",this,"list to unpack, array to unpack");
	
	//create outlets for each argument.
	for(var i=0;i<argsArr.length;i++)
		this["outlet"+(i+1)] = new this.outletClass(("outlet"+(i+1)),this,"array element "+(i+1));
	
	this.inlet1["anything"]=function(arr) {
		
		if(LilyUtils.typeOf(arr)=="string"||LilyUtils.typeOf(arr)=="array")
			var tmp=LilyUtils.splitArgs(arr);
		else if(typeof arr=="number")
			var tmp=(arr+"").split(" ");
			
		if(tmp) {
			for(var i=argsArr.length;i>0;i--)
				if(typeof tmp[i-1]!="undefined")
					thisPtr["outlet"+i].doOutlet(tmp[i-1]);
				else
					thisPtr["outlet"+i].doOutlet(argsArr[i-1]);
		}
	}
	
	return this;
}

var $unpackMetaData = {
	textName:"unpack",
	htmlName:"unpack",
	objectCategory:"Lists",
	objectSummary:"Output lists elements from separate outlets.",
	objectArguments:"pack arguments [0]"
}