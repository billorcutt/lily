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
*	Construct a new striptags object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//regexp lifted from prototype.js (c) 2005-2007 Sam Stephenson - http://www.prototypejs.org 
function $striptags()
{	
	var thisPtr=this;
	
	this.inlet1=new this.inletClass("inlet1",this,"text to be stripped of tags");
	this.outlet1 = new this.outletClass("outlet1",this,"stripped text");	
	
		
	//anything else
	this.inlet1["anything"]=function(msg) {	
		thisPtr.outlet1.doOutlet(LilyUtils.stripTags(msg));
	}	
	
	return this;
}

var $striptagsMetaData = {
	textName:"striptags",
	htmlName:"striptags",
	objectCategory:"Strings",
	objectSummary:"Strip tags from HTML text.",
	objectArguments:""
}