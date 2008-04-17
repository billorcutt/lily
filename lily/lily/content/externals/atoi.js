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
*	Construct a new atoi object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $atoi()
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"text to convert to keycodes");
	this.outlet1 = new this.outletClass("outlet1",this,"character keycodes as array");
	this.outlet2 = new this.outletClass("outlet2",this,"individual character keycodes");	
		
	this.inlet1["anything"]=function(str) {	
		if(typeof str == "string" && str.length) {
			var arr=[];
			for(var i=0;i<str.length;i++) {
				var num=String.charCodeAt(str.charAt(i)); //output the individual characters
				thisPtr.outlet2.doOutlet(num);
				arr.push(num);
			}
			thisPtr.outlet1.doOutlet(arr);	//output all the characters as an array
		}	
	}		
	return this;
}

var $atoiMetaData = {
	textName:"atoi",
	htmlName:"atoi",
	objectCategory:"Strings",
	objectSummary:"Convert strings to numbers.",
	objectArguments:""
}