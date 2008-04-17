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
*	Construct a new number object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $number(args)
{
	var thisPtr=this;
	var value=0;
	var y=0;
	this.outlet1 = new this.outletClass("outlet1",this,"number");
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs value, number sets and outputs, \"set\" sets value without output");	
	
	this.args=args;	
	this.minValue=(!isNaN(parseInt(args.split(" ")[0])))?parseInt(args.split(" ")[0]):""; //min value
	this.maxValue=(!isNaN(parseInt(args.split(" ")[1])))?parseInt(args.split(" ")[1]):""; //max value
	
	this.setInspectorConfig([
		{name:"minValue",value:thisPtr.minValue,label:"Minimum Value",type:"string",input:"text"},
		{name:"maxValue",value:thisPtr.maxValue,label:"Maximum Value",type:"string",input:"text"}
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+vals["minValue"]+" "+vals["maxValue"];

	}
	
	this.inlet1["num"]=function(val) {
		updateValue(parseInt(val));
		draw();
		thisPtr.outlet1.doOutlet(value);		
	}
	
	this.inlet1["set"]=function(val) {
		updateValue(parseInt(val));
		draw();		
	}
	
	this.inlet1["bang"]=function(val) {
		thisPtr.outlet1.doOutlet(value);		
	}
	
	function updateValue(num) {
				
		if(thisPtr.maxValue!="" && num > parseInt(thisPtr.maxValue))
			value = parseInt(thisPtr.maxValue);
		else if(thisPtr.minValue!="" && num < parseInt(thisPtr.minValue))
			value = parseInt(thisPtr.minValue);
		else
			value = num;
			
	}			
	
	function mouseMoveFunc(e) {		
		updateValue(value+(y-parseInt(e.clientY))); //delta
		y=parseInt(e.clientY);		
		draw();
		thisPtr.outlet1.doOutlet(value);
	}	
		
	function mouseUpFunc(e) {	
		thisPtr.controller.patchController.removePatchObserver(thisPtr.objID,"mousemove",mouseMoveFunc,"performance");		
		thisPtr.controller.patchController.removePatchObserver(thisPtr.objID,"mouseup",mouseUpFunc,"performance");
	}
	
	function mouseDownFunc(e) {
		y=parseInt(e.clientY);
		thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"mousemove",mouseMoveFunc,"performance");
		thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"mouseup",mouseUpFunc,"performance");
	}	
	
	function draw() {
		thisPtr.numberDisplay.innerHTML=value;
	}
	
	//custom html
	this.ui=new LilyObjectView(this,"<div style=\"padding-left:5px;padding-right:5px;padding-top:2px;padding-bottom:2px;\" id=\""+ this.createElID("number") +"\"></div>");
	this.ui.draw();
	this.numberDisplay=this.ui.getElByID(thisPtr.createElID("number"));	
	this.controller.attachObserver(this.createElID("number"),"mousedown",mouseDownFunc,"performance");
	this.controller.attachObserver(this.createElID("number"),"mousedown",LilyUtils.preventDefault,"performance");
	this.displayElement=this.numberDisplay;
	
	thisPtr.ui.contentContainer.style.borderLeftWidth="4px";
	thisPtr.ui.contentContainer.style.borderLeftStyle="double";
		
	updateValue(parseInt(value));	
	draw();
	
	return this;
}

var $numberMetaData = {
	textName:"number",
	htmlName:"number",
	objectCategory:"UI",
	objectSummary:"Drag to output a sequence of numbers.",
	objectArguments:"minimum, maximum"
}