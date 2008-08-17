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
*	Construct a new get object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $get(rtype)
{
	var thisPtr=this;
	var type=rtype||"text"; //return type param to pass to xhr
	
	this.outlet1 = new this.outletClass("outlet1",this,"data retrieved from url");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete");	
	this.inlet1=new this.inletClass("inlet1",this,"url to get, \"bang\" uses url supplied in object argument");	
	
	this.xhr=new LilyComponents._xhr(outputResponse,type,this);
	
	this.inlet1["anything"]=function(loc){ 
		thisPtr.xhr.loadXMLDoc(loc); 
	}	
	
	function outputResponse(data) {		
		if(data)
			this.outlet1.doOutlet(data);
			
		this.outlet2.doOutlet("bang");
	}
	
	return this;
}

var $getMetaData = {
	textName:"get",
	htmlName:"get",
	objectCategory:"Network",
	objectSummary:"Fetch a URL using an HTTP GET.",
	objectArguments:"type [text] json xml"
}