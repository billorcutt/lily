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
*	Construct a new input object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $input()
{
	var thisPtr=this;
	this.outlet1 = new this.outletClass("outlet1",this,"\"bang\" outputs current value, \"set\" sets the value without output");
	this.inlet1 = new this.inletClass("inlet1",this,"value");

	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet(thisPtr.displayElement.value);
	}
	
	this.inlet1["set"]=function(msg) {
		thisPtr.displayElement.value=msg;
	}
	
	this.inlet1["clear"]=function() {
		thisPtr.displayElement.value="";
	}		

//	this.parent.patchController.attachPatchObserver(thisPtr.objID,"click",function(event){if(!(event.target===thisPtr.displayElement)){thisPtr.displayElement.blur()}},"all");	
	
	//custom html
	this.ui=new LilyObjectView(this,"<input id=\""+ this.createElID("input") +"\" type=\"text\"/>");
	this.ui.draw();
	this.displayElement=thisPtr.ui.getElByID(thisPtr.createElID("input"));
	this.resizeElement=this.displayElement;
	return this;
}

var $inputMetaData = {
	textName:"input",
	htmlName:"input",
	objectCategory:"Interaction",
	objectSummary:"Enter and output messages using an HTML text input.",
	objectArguments:""
}