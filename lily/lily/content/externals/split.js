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
*	Construct a new split object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $split(delim)
{
	var thisPtr=this;
	var delimiter=delim||" "; 
		
	this.inlet1=new this.inletClass("inlet1",this,"list to split at delimiter");
	this.outlet1 = new this.outletClass("outlet1",this,"resulting array");		
	
	this.inlet1["anything"]=function(str) {
		str=str+"";
		thisPtr.outlet1.doOutlet(str.split(LilyUtils.unescape(delimiter)));
	}
							
	return this;
}

var $splitMetaData = {
	textName:"split",
	htmlName:"split",
	objectCategory:"Strings",
	objectSummary:"Split a string into a array.",
	objectArguments:"delimiter to split on [\" \"]"
}