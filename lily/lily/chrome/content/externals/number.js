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
	var outValue=0;
	var isFloat=0;
	var y=0;
	var isSelected=false;
	var typein_buffer="";
	
	this.outlet1 = new this.outletClass("outlet1",this,"number");
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs value, number sets and outputs, \"set\" sets value without output");	
	
	this.args=args;	
	this.minValue=(!isNaN(parseFloat(args.split(" ")[0])))?parseFloat(args.split(" ")[0]):""; //min value
	this.maxValue=(!isNaN(parseFloat(args.split(" ")[1])))?parseFloat(args.split(" ")[1]):""; //max value
	this.precVal=(!isNaN(parseInt(args.split(" ")[2])))?parseInt(args.split(" ")[2]):0; //precision value
	
	this.setInspectorConfig([
		{name:"minValue",value:thisPtr.minValue,label:"Minimum Value",type:"string",input:"text"},
		{name:"maxValue",value:thisPtr.maxValue,label:"Maximum Value",type:"string",input:"text"},
		{name:"precVal",value:thisPtr.precVal,label:"Precision",type:"string",input:"text"}
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		draw(); //reflect new precision.	
			
		//update the arg str
		this.args=""+vals["minValue"]+" "+vals["maxValue"]+" "+vals["precVal"];

	}
	
	this.inlet1["num"]=function(val) {
		isFloat = (Math.abs(val-parseInt(val))>0);
		updateValue(parseFloat(val));
		draw();
		thisPtr.outlet1.doOutlet(outValue);		
	}
	
	this.inlet1["set"]=function(val) {
		isFloat = (Math.abs(val-parseInt(val))>0);		
		updateValue(parseFloat(val));
		draw();		
	}
	
	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet(outValue);		
	}
	
	function updateValue(num) {
				
		if(thisPtr.maxValue!="" && num > parseFloat(thisPtr.maxValue))
			value = parseFloat(thisPtr.maxValue);
		else if(thisPtr.minValue!="" && num < parseFloat(thisPtr.minValue))
			value = parseFloat(thisPtr.minValue);
		else
			value = num;
			
	}			
	
	function mouseMoveFunc(e) {		
		updateValue(value+(y-parseFloat(e.clientY))/(isFloat?Math.pow(10,thisPtr.precVal):1)); //delta
		y=parseFloat(e.clientY);		
		draw();
		thisPtr.outlet1.doOutlet(value.toFixed(thisPtr.precVal));
	}	
		
	function mouseUpFunc(e) {	
		thisPtr.controller.patchController.removePatchObserver(thisPtr.objID,"mousemove",mouseMoveFunc,"performance");		
		thisPtr.controller.patchController.removePatchObserver(thisPtr.objID,"mouseup",mouseUpFunc,"performance");
	}
	
	function mouseDownFunc(e) {
		y=parseFloat(e.clientY);
		thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"mousemove",mouseMoveFunc,"performance");
		thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"mouseup",mouseUpFunc,"performance");
		thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"mousedown",numberDeselected,"performance");		
		numberSelected();
	}
	
	function numberSelected() {
		isSelected=true;		
		thisPtr.ui.contentContainer.style.borderLeft="4px solid black";				
		thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"keypress",keyPressFunc,"performance");
	}	
	
	function numberDeselected(e) {
		if(e.target.id.indexOf(thisPtr.objID)==-1 && isSelected) {		
			thisPtr.ui.contentContainer.style.borderLeft="4px double black";								
			thisPtr.controller.patchController.removePatchObserver(thisPtr.objID,"mousedown",numberDeselected,"performance");
			thisPtr.controller.patchController.removePatchObserver(thisPtr.objID,"keypress",keyPressFunc,"performance");
			if(typein_buffer) updateValue(+typein_buffer);			
			typein_buffer="";
			isSelected=false;										
		}
	}
	
	function keyPressFunc(e) {
		if(isSelected) {
			typein_buffer+=(/[0-9]|\.|-/.test(String.fromCharCode(e.charCode)))?String.fromCharCode(e.charCode):"";
			draw(+typein_buffer);
			updateValue(+typein_buffer);
		} else {
			thisPtr.controller.patchController.removePatchObserver(thisPtr.objID,"keypress",keyPressFunc,"performance");
			updateValue(+typein_buffer);
			typein_buffer="";
		}
	}	
	
	function draw(val) {
		
		var display_value = val||value;
		
		var zip = (floatDisplay.innerHTML!="") ? 0 : +floatDisplay.innerHTML;
		if(thisPtr.precVal > 0) {
			var tmp = display_value.toFixed(thisPtr.precVal).toString().match(/(-*\d+)(\.\d+)/);		
			var intVal = tmp[1];
			var floVal = tmp[2];	
		} else {
			var intVal = parseInt(display_value);
			var floVal = "";
		}
				
		intDisplay.innerHTML=intVal;
		
		if(isFloat || thisPtr.precVal==0 || floatDisplay.innerHTML!="") {
			floatDisplay.innerHTML=floVal;
		} else {
			floatDisplay.innerHTML= zip.toFixed(thisPtr.precVal).toString().match(/(-*\d+)(\.\d+)/)[2];
		}
		
		outValue = (intDisplay.innerHTML+floatDisplay.innerHTML);
	}
	
	function toggleEditabilityFunc() {
		if(isSelected) {
			numberDeselected({target:{id:"edit_state_change"}});
		} else {
			updateValue(+(intDisplay.innerHTML+floatDisplay.innerHTML));
		}
	}
	
	//custom html
	var html = "<div id=\""+ this.createElID("number") +"\" style=\"padding-left:5px;padding-right:5px;padding-top:2px;padding-bottom:2px;white-space:nowrap\"><span id=\""+ this.createElID("int_num") +"\"></span><span id=\""+ this.createElID("flo_num") +"\"></span></div>"
	this.ui=new LilyObjectView(this,html);
	this.ui.draw();
	
	var numberDisplay=this.ui.getElByID(thisPtr.createElID("number"));
	var intDisplay = this.ui.getElByID(thisPtr.createElID("int_num"));
	var floatDisplay = this.ui.getElByID(thisPtr.createElID("flo_num"));	
		
	this.controller.attachObserver(this.createElID("number"),"mousedown",mouseDownFunc,"performance");
	this.controller.attachObserver(this.createElID("number"),"mousedown",LilyUtils.preventDefault,"performance");
	
	this.controller.attachObserver(this.createElID("int_num"),"mousedown",function(){isFloat=false;},"performance");
	this.controller.attachObserver(this.createElID("flo_num"),"mousedown",function(){isFloat=true;},"performance");		
	
	this.displayElement=numberDisplay;
	
	thisPtr.ui.contentContainer.style.borderLeftWidth="4px";
	thisPtr.ui.contentContainer.style.borderLeftStyle="double";
	
	//add listeners to handle changes in patch editability
	this.controller.patchController.attachPatchObserver(thisPtr.objID,"editabilityChange",toggleEditabilityFunc,"all");	
		
	updateValue(+(value));	
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