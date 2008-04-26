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
*	Construct a new evaluate object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $eval(filepath)
{
	var thisPtr=this;
	var path = filepath||"";
	var funcStr = "";
	var jsContainer = {
		self:thisPtr
	};
	
	this.inlet1=new this.inletClass("inlet1",this,"javascript expression to be evaluated");
	this.outlet1 = new this.outletClass("outlet1",this,"result of evaluation");
	this.outlet2 = new this.outletClass("outlet2",this,"bang after eval");
	
	path = LilyUtils.getFilePath(path);	//get the complete path if we don't have it	
	
	if(path) {
		jsContainer = {
			self:thisPtr
		};		
		LilyUtils.loadScript("file://"+path,jsContainer);
	}

	this.inlet1["anything"]=function(js) {
		var argArr = (typeof js=="string")?LilyUtils.splitArgs(js):[];		
		if(typeof jsContainer[argArr[0]] == "function") {
			try {
				var method = argArr.shift();
				var result = jsContainer[method].apply(thisPtr,argArr);
				thisPtr.outlet1.doOutlet(result);
				thisPtr.outlet2.doOutlet("bang");
			} catch(e) {
				LilyDebugWindow.error("Eval: " + e.name + ": " + e.message);
			}	
		} else {
			try {
				var result=thisPtr.parent.patchView.oWin.eval(js.toString());
				thisPtr.outlet1.doOutlet(result);
				thisPtr.outlet2.doOutlet("bang");
			} catch(e) {
				LilyDebugWindow.error("Eval: " + e.name + ": " + e.message);	
			}
		}
	}
	
	return this;	
}

var $evalMetaData = {
	textName:"eval",
	htmlName:"eval",
	objectCategory:"System",
	objectSummary:"Apply a Javascript eval() to any message.",
	objectArguments:""
}