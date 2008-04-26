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
*	Construct a new dialog object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $dialog()
{
	var thisPtr=this;	
	
	this.outlet1 = new this.outletClass("outlet1",this,"result of dialog if any");
	this.inlet1=new this.inletClass("inlet1",this,"\"alert\",\"confirm\",\"prompt\"");	
	
	this.inlet1["alert"]=function(msg) {
		thisPtr.parent.patchView.oWin.alert(msg);
	}
	
	this.inlet1["confirm"]=function(msg) {
		thisPtr.outlet1.doOutlet(thisPtr.parent.patchView.oWin.confirm(msg));
	}
	
	this.inlet1["prompt"]=function(msg) {
		thisPtr.outlet1.doOutlet(thisPtr.parent.patchView.oWin.prompt(msg));
	}	
	
	return this;
}

var $dialogMetaData = {
	textName:"dialog",
	htmlName:"dialog",
	objectCategory:"System",
	objectSummary:"Display an alert, confirm or prompt dialog.",
	objectArguments:""
}