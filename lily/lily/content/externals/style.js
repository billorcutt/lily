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
*	Construct a new style object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $style(url)
{
	var thisPtr=this;
	var styleURL=url||null;			
	this.inlet1=new this.inletClass("inlet1",this,"url to css file");
	
	this.inlet1["anything"]=function(url) {
		el.href=url;
	}
	
	var el=thisPtr.parent.patchView.addInclude("text/css",styleURL);
	
	return this;	
}

var $styleMetaData = {
	textName:"style",
	htmlName:"style",
	objectCategory:"System",
	objectSummary:"Load a CSS file into a patch.",
	objectArguments:"url"
}