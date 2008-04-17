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
*	Construct a new pwd object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $pwd()
{
	var thisPtr=this;
	var currNode = null;	
	
	this.outlet1 = new this.outletClass("outlet1",this,"outputs a unix style path with all parent nodes");
	this.inlet1=new this.inletClass("inlet1",this,"current dom node is stored, bang outputs the path to root");	
	
	this.inlet1["obj"]=function(o) {
		currNode = o;
	}
	
	//bang method
	this.inlet1["bang"]=function() {
		
		var tmp = "";
		
		while(currNode && currNode.parentNode && currNode.tagName) {
			tmp = "/" + currNode.tagName + tmp;
			currNode = currNode.parentNode; //move up a step
		}
			
		thisPtr.outlet1.doOutlet(tmp);
	}
	
	
	return this;
}

var $pwdMetaData = {
	textName:"pwd",
	htmlName:"pwd",
	objectCategory:"Custom",
	objectSummary:"pwd command for the command line dom inspector demo",
	objectArguments:""	
	
}