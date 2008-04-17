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
*	Construct a new navigator object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $navigator()
{
	var thisPtr=this;	
	
	this.outlet1 = new this.outletClass("outlet1",this,"messages about the operating system and the browser");
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\", \"platform\", \"os\", \"language\"");	
	
	this.inlet1["platform"]=function(msg) {
		thisPtr.outlet1.doOutlet(window.navigator.platform);
	}
	
	this.inlet1["os"]=function(msg) {
		thisPtr.outlet1.doOutlet(window.navigator.oscpu);
	}	
	
	this.inlet1["language"]=function(msg) {
		thisPtr.outlet1.doOutlet(window.navigator.language);
	}

	//custom method
	this.inlet1["bang"]=function(msg) {
		thisPtr.outlet1.doOutlet(window.navigator.userAgent); 		 		
	}
		
	return this;
}

var $navigatorMetaData = {
	textName:"navigator",
	htmlName:"navigator",
	objectCategory:"System",
	objectSummary:"Output messages about the operating system and the browser."
}