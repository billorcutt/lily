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
*	Construct a new post object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $post(argStr)
{
	var thisPtr=this;
	
	if(!argStr) {
		LilyDebugWindow.error("The post object takes two arguments- a url (required) and a response type (defaults to text)");
		LilyDebugWindow.insertHelp("post");			
		return;
	}
	
	var url=argStr.split(" ")[0]||""; //url
	var type=argStr.split(" ")[1]||"text"; //return type param to pass to xhr
	
	this.outlet1 = new this.outletClass("outlet1",this,"response from server");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete");		
	this.inlet1=new this.inletClass("inlet1",this,"data to post");	
	this.xhr=new LilyUtils._xhr(outputResponse,type,this,"POST",null,[{name:"Content-Type",value:"application/x-www-form-urlencoded"}]);
	
	this.inlet1["anything"]=function(msg){ thisPtr.xhr.loadXMLDoc(url,msg); }
	
	function outputResponse(data) {		
		if(data)
			this.outlet1.doOutlet(data);
			
		this.outlet2.doOutlet("bang");
	}
	
	return this;
}

var $postMetaData = {
	textName:"post",
	htmlName:"post",
	objectCategory:"Network",
	objectSummary:"Perform an HTTP POST.",
	objectArguments:"[url], type [text]"
}