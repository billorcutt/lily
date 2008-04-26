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
*	Construct a new radio object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $radio(args)
{
	var thisPtr=this;

	this.args=args;	
	var argsArr=args.split(" ")||[];
	
	var radioParent = null;
	
	this.buttons=(argsArr.length&&argsArr[0]&&typeof argsArr[0]!="undefined")?argsArr[0]:2; //number of buttons
	this.orientation=(argsArr.length&&argsArr[1]&&typeof argsArr[1]!="undefined")?argsArr[1]:"horizontal"; //orientation	
	
	function initButtons(num) {
		var orientation = (thisPtr.orientation=="vertical")?"<br/>":"";
		var str = "";
		for(var j=0;j<num;j++) {
			str+="<input name=\""+ thisPtr.createElID("radiogroup") +"\" id=\""+ thisPtr.createElID("radio_"+j) +"\" type=\"radio\"/>" + orientation;
		}
		return str;
	}
	
	function addObservers() {
		//add observers for all  buttons
		for(var i=0;i<thisPtr.buttons;i++)
			thisPtr.controller.attachObserver(thisPtr.createElID("radio_"+i),"click",clickFunc,"performance");
		
	}
		
	this.outlet1 = new this.outletClass("outlet1",this,"onclick output the index number of radio button clicked.");	

	function clickFunc() {
		
		//find the selected button and output its index.
		for(var j=0;j<thisPtr.buttons;j++) {
			if(thisPtr.ui.getElByID(thisPtr.createElID("radio_"+j)).checked)
				thisPtr.outlet1.doOutlet(j);
		}
		
	}
	
	//create a config with the params we want to be user editable in the inspector
	//must follow the form- property name, property value, label (for inspector), data type (number,boolean,string)
	this.setInspectorConfig([
		{name:"buttons",value:thisPtr.buttons,label:"Number of Buttons",type:"number",input:"text"},
		{name:"orientation",value:thisPtr.orientation,label:"Orientation",type:"string",options:[{label:"Vertical",value:"vertical"},{label:"Horizontal",value:"horizontal"}],input:"radio"}
	]);
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			if(x=="orientation")
				this[x]=vals[x];
			else
				this[x]=parseInt(vals[x]);
			
		//update the arg str
		this.args=""+vals["buttons"]+" "+vals["orientation"];
		
		//redraw the buttons
		radioParent.innerHTML = initButtons(thisPtr.buttons);
		
		//add observers
		addObservers();			

	}		
	
	//custom html
	this.ui=new LilyObjectView(this,("<div id=\""+thisPtr.createElID("radio")+"\">"+initButtons(thisPtr.buttons)+"</div>"));
	this.ui.draw();
	
	//attach the listeners
	addObservers();
	//get a ref to parent node.
	radioParent = thisPtr.ui.getElByID(thisPtr.createElID("radio"));	
		
//	this.displayElement=thisPtr.ui.getElByID(thisPtr.createElID("radio"));
//	this.resizeElement=this.displayElement;
	return this;
}

var $radioMetaData = {
	textName:"radio",
	htmlName:"radio",
	objectCategory:"Interaction",
	objectSummary:"Send messages using HTML radio buttons.",
	objectArguments:"number of radio buttons [2], orientation [horizontal]"
}