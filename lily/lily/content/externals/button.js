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
*	Construct a new button object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $button(args)
{
	var thisPtr=this;
	this.outlet1 = new this.outletClass("outlet1",this,"click outputs bang");

	function clickFunc(){thisPtr.outlet1.doOutlet("bang");}
	
	this.args=args;	
	this.buttonText=(args.length)?args:""; //label text
	
	this.setInspectorConfig([
		{name:"buttonText",value:thisPtr.buttonText,label:"Button Text",type:"string",input:"textarea"}
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+vals["buttonText"];

		this.controller.objResizeControl.clearSize();
		this.displayElement.value=makeValue(vals["buttonText"])
		this.controller.objResizeControl.resetSize();
			
	}
	
	function makeValue(str) {
	
		if((str && !str.match(/>|<|"|&/gi))||!str) {
			return str;
		} else {
			LilyDebugWindow.error('< > & and " are not permitted in button.');
			return str.replace(/>|<|"|&/gi,'');
		}
	}	

	//custom html
	this.ui=new LilyObjectView(this,"<input style=\"min-height:24px;height:24px;margin:0px\" value=\""+ makeValue(this.args) +"\" id=\""+ this.createElID("button") +"\" type=\"button\"/>");
	this.ui.draw();
	this.controller.attachObserver(this.createElID("button"),"click",clickFunc,"performance");
	this.displayElement=thisPtr.ui.getElByID(thisPtr.createElID("button"));
	this.resizeElement=thisPtr.ui.getElByID(thisPtr.createElID("button"));//this.displayElement;
	
//	this.controller.objResizeControl.clearSize();
//	this.displayElement.value=this.args;
//	this.controller.objResizeControl.resetSize();
	
	if(!this.args)
		this.displayElement.style.width="width:20px";
	
	return this;
}

var $buttonMetaData = {
	textName:"button",
	htmlName:"button",
	objectCategory:"Interaction",
	objectSummary:"Output a \"bang\" message by clicking an HTML button.",
	objectArguments:"label text"
}