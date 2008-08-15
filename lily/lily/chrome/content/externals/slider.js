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
*	Construct a new slider object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $slider(args)
{
	
	var thisPtr=this;
	
	//args passed to the constructor to init the slider
	//also editable using the inspector
	var argsArr=LilyUtils.splitArgs(args);
	this.args=args;	
	this.allowFont=false; //dont allow font changes	
			
	var bgcolor=argsArr[0]||"#FF0000";
	var roundness=argsArr[1]||0;
	var bwidth=argsArr[2]||0;
	var bcolor=argsArr[3]||"#000000";
	var bstyle=argsArr[4]||"solid";
	this.orientation=(argsArr.length>=6&&typeof argsArr[5]!="undefined")?argsArr[5]:"horizontal"; //slider orientation	
	this.rangeStart=(argsArr.length>=7&&typeof argsArr[6]!="undefined")?parseInt(argsArr[6]):1; //slider range
	this.rangeEnd=(argsArr.length>=8&&typeof argsArr[7]!="undefined")?parseInt(argsArr[7]):20; //slider range
	
	this.handleColor=bgcolor;
	this.cornerRoundness=roundness;
	this.borderWidth=bwidth;
	this.borderColor=bcolor;
	this.borderStyle=bstyle;
	
	//default size
	var default_height = 50;
	var default_width = 300;
	
	//default handle dimensions
	var handle = null; //dom node will go here...
	var handleHeight = "80%";
	var handleWidth = "10%";			
			
	//used for determining the slider boundries.
	var minX = 0;
	var maxX = 0;
	var minY = 0;
	var maxY = 0;
	
	//initialize onchange
	var on_change_value = 0;	
	
	this.inlet1 = new this.inletClass("inlet1",this,"\"set\" sets & positions slider");		
	this.outlet1 = new this.outletClass("outlet1",this,"slider value during slide");
	this.outlet2 = new this.outletClass("outlet2",this,"slider value after slide");	
	
	this.setInspectorConfig([
		{name:"handleColor",value:thisPtr.handleColor,label:"Handle Color",type:"text",input:"text"},
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
		],input:"select"},
		{name:"orientation",value:thisPtr.orientation,label:"Orientation",type:"string",options:[{label:"Vertical",value:"vertical"},{label:"Horizontal",value:"horizontal"}],input:"radio"},
		{name:"rangeStart",value:thisPtr.rangeStart,label:"Range Start",type:"number",input:"text"},
		{name:"rangeEnd",value:thisPtr.rangeEnd,label:"Range End",type:"number",input:"text"}			
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=vals["handleColor"]+" "+vals["cornerRoundness"]+" "+vals["borderWidth"]+" "+vals["borderColor"]+" "+vals["borderStyle"]+" "+vals["orientation"]+" "+vals["rangeStart"]+" "+vals["rangeEnd"];

		handle.style.background=vals["handleColor"];
		handle.style.MozBorderRadius=vals["cornerRoundness"]+"%";
		handle.style.borderWidth=vals["borderWidth"]+"px";
		handle.style.borderColor=vals["borderColor"];
		handle.style.borderStyle=vals["borderStyle"];
		
		thisPtr.init();
			
	}
		
	//custom html
	var slider_html = "<div style=\"width:"+default_width+"px;height:"+default_height+"px\" id=\""+ this.createElID("slider") +"\">"+
	"<div id=\""+ this.createElID("sliderHandle") +"\" style=\"-moz-border-radius:"+roundness+"%;border:"+bwidth+"px "+bcolor+" "+bstyle+";position:relative;height:"+handleHeight+";width:"+handleWidth+";background:"+bgcolor+"\"></div>" +
	"</div>";
		
	this.ui=new LilyObjectView(this,slider_html);
	this.ui.draw();
	
	this.resizeElement=this.ui.getElByID(this.createElID("slider"));
	this.displayElement=this.ui.getElByID(this.createElID("slider"));
	
	//set up some handle dimnensions 
	handle = this.ui.getElByID(this.createElID("sliderHandle"));
	var handleOffset = (this.orientation == "vertical")?Math.ceil(this.height*.10):Math.ceil(this.width*.10);
	var horizOffset = (this.orientation == "vertical")?0:(parseInt(thisPtr.width/2)-parseInt(handleOffset/2));			
	
	this.controller.objResizeControl.cb=function() {
		thisPtr.init();
	}
	
	//calculate the boundries
	function setBounds() {
		minX = 0;
		minY = 0;
		maxX = parseInt(thisPtr.width);
		maxY = parseInt(thisPtr.height);
	}
	
	function handleMouseMove(e) {
					
		if(thisPtr.orientation == "vertical") {
			var val = (parseInt(e.clientY)-parseInt(thisPtr.top))-parseInt(handleOffset);
			if(val<=0) {
				handle.style.top = (0)+"px";	
			} else if(val+handleOffset>=maxY) {
				handle.style.top = (maxY-handleOffset)+"px";
			} else {
				handle.style.top = val+"px";
			}
			doOutput(val);
		} else {
			var val = (parseInt(e.clientX)-parseInt(thisPtr.left))-parseInt(handleOffset);
			if(val<=0) {
				handle.style.left = (0-horizOffset)+"px";	
			} else if(val+handleOffset>=maxX) {
				handle.style.left = (maxX-handleOffset-horizOffset)+"px";
			} else {
				handle.style.left = (val-horizOffset)+"px";
			}
			doOutput(val); 
		}
		
		on_change_value = val;
		
	}
	
	function handleMouseUpFunc(e) {
		thisPtr.controller.patchController.removePatchObserver(thisPtr.createElID("slider"),"mouseup",handleMouseUpFunc,"performance");		
		thisPtr.controller.patchController.removePatchObserver(thisPtr.createElID("slider"),"mousemove",handleMouseMove,"performance");			
		doOutputOnComplete(on_change_value);
	}
	
	function handleMouseDownFunc(e) {
		setBounds();
		handleMouseMove(e);
		thisPtr.controller.patchController.attachPatchObserver(thisPtr.createElID("slider"),"mouseup",handleMouseUpFunc,"performance");
		thisPtr.controller.patchController.attachPatchObserver(thisPtr.createElID("slider"),"mousemove",handleMouseMove,"performance");
	}
	
	function setValue(val) {
		
		var orgMax = (thisPtr.orientation == "vertical")?parseInt(thisPtr.height):parseInt(thisPtr.width);		
		if(thisPtr.orientation == "vertical") {			
			var tmp = parseInt(LilyUtils.map(thisPtr.rangeStart,thisPtr.rangeEnd,0,orgMax-handleOffset,val));				
			if(tmp<=0) {
				handle.style.top = (0)+"px";
				thisPtr.outlet2.doOutlet(0);					
			} else if(tmp+handleOffset>=maxY) {
				handle.style.top = (maxY-handleOffset)+"px";
				thisPtr.outlet2.doOutlet(thisPtr.rangeEnd);				
			} else {
				handle.style.top = (tmp)+"px";
				thisPtr.outlet2.doOutlet(parseInt(val));				
			}			
		} else {
			var tmp = parseInt(LilyUtils.map(thisPtr.rangeStart,thisPtr.rangeEnd,0,orgMax-handleOffset,val));	
			if(tmp<=0) {
				handle.style.left = (0-horizOffset)+"px";
				thisPtr.outlet2.doOutlet(0);					
			} else if(tmp+handleOffset>=maxX) {
				handle.style.left = (maxX-handleOffset-horizOffset)+"px";
				thisPtr.outlet2.doOutlet(thisPtr.rangeEnd);				
			} else {
				handle.style.left = (tmp-horizOffset)+"px";
				thisPtr.outlet2.doOutlet(parseInt(val));				
			}
		}	
	}
	
	function doOutput(val) {		
		var orgMax = (thisPtr.orientation == "vertical")?parseInt(thisPtr.height):parseInt(thisPtr.width);
		var tmp = LilyUtils.map(0,orgMax-handleOffset,thisPtr.rangeStart,thisPtr.rangeEnd,val);
		thisPtr.outlet1.doOutlet(parseInt(tmp));
	}
	
	function doOutputOnComplete(val) {		
		var orgMax = (thisPtr.orientation == "vertical")?parseInt(thisPtr.height):parseInt(thisPtr.width);
		var tmp = LilyUtils.map(0,orgMax-handleOffset,thisPtr.rangeStart,thisPtr.rangeEnd,val);
		thisPtr.outlet2.doOutlet(parseInt(tmp));
	}
	
	function calculateHandleHeight() {
		if(thisPtr.height) {
			if(thisPtr.orientation == "vertical") {
				var total_height = Math.ceil(thisPtr.height*.10);
			} else {
				var total_height = Math.ceil(thisPtr.height*.80);
			}
			var actual_height = total_height - (thisPtr.borderWidth*2);
			var height_as_percent = parseInt(actual_height/thisPtr.height*100);	
			return height_as_percent+"%";			
		}
		return "80%"; //default		
	}
	
	function calculateHandleWidth() {
		if(thisPtr.width) {
			if(thisPtr.orientation == "vertical") {
				var total_width = Math.ceil(thisPtr.width*.80);
			} else {
				var total_width = Math.ceil(thisPtr.width*.10);
			}
			var actual_width = total_width - (thisPtr.borderWidth*2);
			var width_as_percent = parseInt(actual_width/thisPtr.width*100);			
			return width_as_percent+"%";
		}
		return "10%"; //default				
	}	
			
	//init
	this.init=function() {
		
		//handle dimensions
		handleHeight = calculateHandleHeight();
		handleWidth = calculateHandleWidth();
		
		var height = thisPtr.height||50;
		var width = thisPtr.width||300;		
		
		handleOffset = (thisPtr.orientation == "vertical")?Math.ceil(height*.10):Math.ceil(width*.10);
		horizOffset = (thisPtr.orientation == "vertical")?0:(parseInt(width/2)-parseInt(handleOffset/2));
		setBounds();

		if(thisPtr.orientation == "vertical") {
			handle.style.top = "0px";
			handle.style.left = "0px";			
		} else {
			handle.style.left = (0-horizOffset) + "px";
			handle.style.top = "10%";			
		}
		
		handle.style.height = handleHeight;
		handle.style.width = handleWidth;		
					
	}
	
	this.inlet1["set"]=function(num) {
		setValue(parseInt(num));
	}
	
	this.inlet1["num"]=function(num) {
		setValue(parseInt(num));
	}	
	
	this.controller.setNoBorders(true);	
	this.controller.attachObserver(this.createElID("slider"),"mousedown",handleMouseDownFunc,"performance");
	this.controller.attachObserver(this.createElID("slider"),"mouseup",handleMouseUpFunc,"performance");		

	return this;
}

var $sliderMetaData = {
	textName:"slider",
	htmlName:"slider",
	objectCategory:"UI",
	objectSummary:"Graphical slider.",
	objectArguments:"color [white], roundness [0], border width [0], border color [#000000], border style [solid]"
}