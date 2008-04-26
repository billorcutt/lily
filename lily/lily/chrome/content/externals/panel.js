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
*	Construct a new panel object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $panel(args)
{
	var thisPtr=this;
	var bgcolor=args.split(" ")[0]||this.color;
	var roundness=args.split(" ")[1]||0;
	var bwidth=args.split(" ")[2]||0;
	var bcolor=args.split(" ")[3]||"#000000";
	var bstyle=args.split(" ")[4]||"solid";
			
	this.color=bgcolor;
	this.cornerRoundness=roundness;
	this.borderWidth=bwidth;
	this.borderColor=bcolor;
	this.borderStyle=bstyle;
	
	this.args=args;	
	this.allowFont=false; //dont allow font changes
	
	this.setInspectorConfig([
		{name:"cornerRoundness",value:thisPtr.cornerRoundness,label:"% Corner Roundness",type:"number",input:"text"},
		{name:"borderWidth",value:thisPtr. borderWidth,label:"Border Width",type:"number",input:"text"},
		{name:"borderColor",value:thisPtr. borderColor,label:"Border Color",type:"text",input:"text"},				
		{name:"borderStyle",value:thisPtr. borderStyle,label:"Border Style",type:"string",options:[
			{label:"None",value:"none"},
			{label:"Dashed",value:"dashed"},
			{label:"Dotted",value:"dotted"},
			{label:"Double",value:"double"},
			{label:"Groove",value:"groove"},
			{label:"Inset",value:"inset"},
			{label:"Outset",value:"outset"},
			{label:"Ridge",value:"ridge"},
			{label:"Solid",value:"solid"}
		],input:"select"}
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=this.color+" "+vals["cornerRoundness"]+" "+vals["borderWidth"]+" "+vals["borderColor"]+" "+vals["borderStyle"];

//		this.controller.objResizeControl.clearSize();
		this.displayElement.style.MozBorderRadius=vals["cornerRoundness"]+"%";
		this.displayElement.style.borderWidth=vals["borderWidth"]+"px";
		this.displayElement.style.borderColor=vals["borderColor"];
		this.displayElement.style.borderStyle=vals["borderStyle"];
//		this.controller.objResizeControl.resetSize();
			
	}	

	//custom html
	this.ui=new LilyObjectView(this,"<div style=\"-moz-border-radius:"+roundness+"%;border:"+bwidth+"px "+bcolor+" "+bstyle+";width:100px;height:100px;background:" + bgcolor + "\" id=\""+ this.createElID("panel") +"\"></div>");
	this.ui.draw();
	
	this.resizeElement=thisPtr.ui.getElByID(thisPtr.createElID("panel"));
	this.displayElement=thisPtr.ui.getElByID(thisPtr.createElID("panel"));
	
	this.controller.setNoBorders(true);	

	return this;
}

var $panelMetaData = {
	textName:"panel",
	htmlName:"panel",
	objectCategory:"UI",
	objectSummary:"Graphical panel.",
	objectArguments:"color [white], roundness [0], border width [0], border color [#000000], border style [solid]"
}