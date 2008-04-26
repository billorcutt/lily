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
*	Construct a new filter object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $filter(args)
{
	var thisPtr=this;
	
	//check for args
	if(!args.length) {
		LilyDebugWindow.error("the filter object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("filter");
		return;
	}	
	
	//process the args
	var argsArr=(args)?args.split(" "):[];
	var fobj={};
	for(var z=0;z<argsArr.length;z++)	{
		var tmp=argsArr[z].split(":");
		//load the args
		if(typeof fobj[tmp[0]] == "undefined") {
			fobj[tmp[0]]=[LilyUtils.convertType(tmp[1])];	
		} else {
			fobj[tmp[0]].push(LilyUtils.convertType(tmp[1]));
		}
	}	

	//create outlets for each argument.
	for(var i=0;i<argsArr.length;i++)
		this["outlet"+(i+1)] = new this.outletClass(("outlet"+(i+1)),this,"items matching "+argsArr[i]);

	this["outlet"+(argsArr.length+1)] = new this.outletClass(("outlet"+(argsArr.length+1)),this,"no match");		
	this.inlet1=new this.inletClass("inlet1",this,"hash to filter");		
	
	//anything else
	this.inlet1["obj"]=function(obj) {	
		var i = argsArr.length;
		for(var x in fobj)	{
			if(typeof obj[x]!="undefined") {
				for(i=0;i<fobj[x].length;i++) {
					if(obj[x]==fobj[x][i]) {
						thisPtr["outlet"+(i+1)].doOutlet(obj);
						return;	
					}
				}
			}	
		}
		thisPtr["outlet"+(i+1)].doOutlet(obj);				
	}
	
	//why the hell am i doing this?
	this.inlet1["anything"]=function(str) {
		thisPtr.outlet2.doOutlet(str);
	}			
	
	return this;
}

var $filterMetaData = {
	textName:"filter",
	htmlName:"filter",
	objectCategory:"Control",
	objectSummary:"Filter hash messages by key value.",
	objectArguments:"[keys:values to test for]"
}