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
*	Construct a new regexp object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $regexp(args)
{
	var thisPtr=this;
		
//	LilyDebugWindow.print(">>> "+args.match(/\w\/[gim]*\s(\S+.*$)/))	
		
	var regxp=(args.match(/(^\/\S?.+\/[gim]*)/))?(args.match(/(^\/\S?.+\/[gim]*)/)[1]):"";
	var sub=(args.match(/\w\/[gim]*\s(\S?.*$)/))?(args.match(/\w\/[gim]*\s(\S?.*$)/)[1]):"";
		
	if(!args.length) {
		LilyDebugWindow.error("the regexp object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("regexp");		
		return;
	}	
		
	this.outlet1 = new this.outletClass("outlet1",this,"result of match");
	this.outlet2 = new this.outletClass("outlet2",this,"result of replace");
	this.outlet3 = new this.outletClass("outlet3",this,"result of test");		
	this.inlet1 = new this.inletClass("inlet1",this,"message to match/replace/test");
	this.inlet2 = new this.inletClass("inlet2",this,"value to substitute");		
	
	this.inlet1["anything"]=function(msg) {
		
		try {
			var re=eval(regxp);
		} catch(e) {
			LilyDebugWindow.error(e.name + ": " + e.message);
			return;
		}

		var result = re.test(msg);
		thisPtr.outlet3.doOutlet(result);
		
//		LilyDebugWindow.print(regxp+" "+sub+" "+msg)
		
		if(sub&&result)
			thisPtr.outlet2.doOutlet(msg.replace(re,sub));				
		
		if(result)	
			thisPtr.outlet1.doOutlet(msg.match(re));				
		
	}
	
	this.inlet2["anything"]=function(msg) {
		sub=msg;
	}
	
	return this;
}

var $regexpMetaData = {
	textName:"regexp",
	htmlName:"regexp",
	objectCategory:"Strings",
	objectSummary:"Apply regular expressions to messages.",
	objectArguments:"[regular expression]"
}