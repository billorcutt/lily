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
*	Construct a new ellipse object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $ellipse(args)
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"number sets object size, methods: \"top\", \"left\", \"radius\", \"color\", \"opacity\", \"strokeColor\", \"strokeWidth\", \"strokeDashArray\", \"rotate\"");
	this.outlet1=new this.outletClass("outlet1",this,"list \"[event type] [bang]\" on click, mouseover and mouseout");	

	this.ellipseElement=null;
	
	var argsArr = (args)?args.split(" "):[];
	this.gColor=argsArr[0]||"red"; //default to red
	this.gOpacity=argsArr[1]||1;
	this.gEllipseWidth=argsArr[2]||40;
	this.gEllipseHeight=argsArr[3]||30;
	this.gStrokeColor=argsArr[4]||"none";	
	this.gStrokeWidth=argsArr[5]||0;
	this.gStrokeDashArray=argsArr[6]||"";
	
	this.args=args;
	
	//create a config with the params we want to be user editable in the inspector
	//must follow the form- property name, property value, label (for inspector), data type (number,boolean,string)
	this.setInspectorConfig([
		{name:"gColor",value:thisPtr.gColor,label:"Fill Color",type:"text",input:"text"},
		{name:"gOpacity",value:thisPtr.gOpacity,label:"Opacity",type:"number",input:"text"},
		{name:"gEllipseWidth",value:thisPtr.gEllipseWidth,label:"Width",type:"number",input:"text"},
		{name:"gEllipseHeight",value:thisPtr.gEllipseHeight,label:"Height",type:"number",input:"text"},		
		{name:"gStrokeColor",value:thisPtr.gStrokeColor,label:"Stroke Color",type:"text",input:"text"},
		{name:"gStrokeWidth",value:thisPtr.gStrokeWidth,label:"Stroke Width",type:"number",input:"text"},
		{name:"gStrokeDashArray",value:thisPtr.gStrokeDashArray,label:"Stroke Dash Array",type:"text",input:"text"},
	]);
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+vals["gColor"]+" "+vals["gOpacity"]+" "+vals["gEllipseWidth"]+" "+vals["gEllipseHeight"]+" "+vals["gStrokeColor"]+" "+vals["gStrokeWidth"]+" "+vals["gStrokeDashArray"];	
			
		thisPtr.ellipseElement.setAttribute("rx",parseInt(vals["gEllipseWidth"])+"%");
		thisPtr.ellipseElement.setAttribute("ry",parseInt(vals["gEllipseHeight"])+"%");		
		thisPtr.ellipseElement.setAttribute("style","fill:"+vals["gColor"]);
		thisPtr.ellipseElement.setAttribute("opacity",parseFloat(vals["gOpacity"]));
		thisPtr.ellipseElement.setAttribute("stroke",vals["gStrokeColor"]);
		thisPtr.ellipseElement.setAttribute("stroke-width",parseInt(vals["gStrokeWidth"])+"%");
		thisPtr.ellipseElement.setAttribute("stroke-dasharray",vals["gStrokeDashArray"].split(" "));
		
		setEllipsePos(); //reset the pos based on changes in the rect size
				
	}
	
	function setEllipsePos() {
		var x = ((thisPtr.gEllipseWidth)>50)?0:parseInt((50-(thisPtr.gEllipseWidth))/2);
		var y = ((thisPtr.gEllipseHeight)>50)?0:parseInt((50-(thisPtr.gEllipseHeight))/2);

		thisPtr.ellipseElement.setAttribute("x",parseInt(x)+"%");
		thisPtr.ellipseElement.setAttribute("y",parseInt(y)+"%");	
	}		

	var ellipseGradient="none";	
	
	//global variables
	var gRX = 0;
	var gRY = 0;
	
	this.color=this.gColor; //overwrite the default color
	
	var transforms={
		rotate:"0,75,75",
		scale:"1,1",
		translate:"0,0",
		skewX:0,
		skewY:0
	};

	function getTransformText() {
		var str = "";
		for(var x in transforms) {
			str += ""+x+"("+transforms[x]+") ";
		}
		return str;
	}

	//init the center points
	function initTransforms() {
		var cx = (parseInt(thisPtr.ellipseCanvas.getAttribute("width"))/2);
		var cy = (parseInt(thisPtr.ellipseCanvas.getAttribute("height"))/2);
		transforms["rotate"]=""+0+","+cx+","+cy;
	}	
	
	this.inlet1["num"]=function(num) {
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;		
				
		var x = (gRX>=gRY)?parseInt(num):((gRX/gRY)*parseInt(num));
		var y = (gRY>=gRX)?parseInt(num):((gRY/gRX)*parseInt(num));
				
		thisPtr.ellipseElement.setAttribute("cx",parseInt(50)+"%");
		thisPtr.ellipseElement.setAttribute("cy",parseInt(50)+"%");		
				
		thisPtr.ellipseElement.setAttribute("rx",(x*.5)+"%");
		thisPtr.ellipseElement.setAttribute("ry",(y*.5)+"%");		
	}
	
	this.inlet1["left"]=function(num) {
//		if(parseInt(num)>200||parseInt(num)<-100||isNaN(parseInt(num)))
//			return;		
		
		thisPtr.ellipseElement.setAttribute("cx",(parseInt(num))+"%");		
	}
	
	this.inlet1["top"]=function(num) {
//		if(parseInt(num)>200||parseInt(num)<-100||isNaN(parseInt(num)))
//			return;			
		
		thisPtr.ellipseElement.setAttribute("cy",(parseInt(num))+"%");	
	}	
	
	this.inlet1["radiusX"]=function(num) {
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;		
		
		gRX=parseInt(num);
		thisPtr.ellipseElement.setAttribute("rx",parseInt(num)+"%");	
	}
	
	this.inlet1["radiusY"]=function(num) {
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;		
		
		gRY=parseInt(num);		
		thisPtr.ellipseElement.setAttribute("ry",parseInt(num)+"%");	
	}	
	
	this.inlet1["color"]=function(color) {
		thisPtr.ellipseElement.setAttribute("style","fill:"+color);	
	}
	
	this.inlet1["opacity"]=function(num) {
//		if(parseFloat(num)>1||parseFloat(num)<0||isNaN(parseInt(num)))
//			return;		
		
		thisPtr.ellipseElement.setAttribute("opacity",parseFloat(num));	
	}
	
	this.inlet1["strokeColor"]=function(color) {
		thisPtr.ellipseElement.setAttribute("stroke",color);	
	}
	
	this.inlet1["strokeWidth"]=function(num) {
		thisPtr.ellipseElement.setAttribute("stroke-width",parseInt(num)+"%");	
	}
	
	this.inlet1["strokeDashArray"]=function(arr) {
		thisPtr.ellipseElement.setAttribute("stroke-dasharray",arr.split(" "));	
	}	
		
	//transforms
	this.inlet1["rotate"]=function(angle) {
		var cx = (parseInt(thisPtr.ellipseCanvas.getAttribute("width"))/2);
		var cy = (parseInt(thisPtr.ellipseCanvas.getAttribute("height"))/2);
		transforms["rotate"]=""+angle+","+cx+","+cy;	
		thisPtr.ellipseElement.setAttribute("transform",getTransformText());	
	}
	
	this.inlet1["scale"]=function(scaleXY) {
		var tmp = scaleXY.split(" ");
		transforms["scale"]=""+parseFloat(tmp[0])+","+parseFloat(tmp[1]);	
		thisPtr.ellipseElement.setAttribute("transform",getTransformText());			
	}
	
	this.inlet1["translate"]=function(transformXY) {
		var tmp = transformXY.split(" ");
		transforms["translate"]=""+parseInt(tmp[0])+","+parseInt(tmp[1]);	
		thisPtr.ellipseElement.setAttribute("transform",getTransformText());			
	}	
	
	this.inlet1["skewX"]=function(x) {			
		transforms["skewX"]=""+parseInt(x);	
		thisPtr.ellipseElement.setAttribute("transform",getTransformText());	
	}
	
	this.inlet1["skewY"]=function(y) {				
		transforms["skewY"]=""+parseInt(y);	
		thisPtr.ellipseElement.setAttribute("transform",getTransformText());	
	}								

	//gradients
	this.inlet1["gradient"]=function(type) {
		if(type=="horizontal") {
			ellipseGradient="horizontal";
			linearGradient.setAttribute("x2","100%");
			linearGradient.setAttribute("y2","0%");	
			linearGradient.setAttribute("y1","0%");	
			linearGradient.setAttribute("x1","0%");			
			thisPtr.ellipseElement.setAttribute("style","fill:url(#"+thisPtr.createElID("linear_gradient")+")");
		} else if(type=="vertical") {
			ellipseGradient="vertical";			
			linearGradient.setAttribute("x2","0%");
			linearGradient.setAttribute("y2","100%");
			linearGradient.setAttribute("y1","0%");	
			linearGradient.setAttribute("x1","0%");						
			thisPtr.ellipseElement.setAttribute("style","fill:url(#"+thisPtr.createElID("linear_gradient")+")");
		} else if(type=="radial") {
			ellipseGradient="radial";			
			thisPtr.ellipseElement.setAttribute("style","fill:url(#"+thisPtr.createElID("radial_gradient")+")");
		} else {
			ellipseGradient="none";		
			thisPtr.ellipseElement.setAttribute("style","fill:"+this.gColor); 
		}			
	}
	
	this.inlet1["gradientStart"]=function(num) {
		
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;
		
		linearStart.setAttribute("offset",parseInt(num)+"%"); 
		
		if(ellipseGradient=="horizontal"){
			linearGradient.setAttribute("x1",parseInt(num)+"%");
			linearGradient.setAttribute("y1","0%"); 
		}else if(ellipseGradient=="vertical"){
			linearGradient.setAttribute("y1",parseInt(num)+"%");
			linearGradient.setAttribute("x1","0%"); 			
		}
	}
	
	this.inlet1["gradientEnd"]=function(num) {
		
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;		
		
		linearStop.setAttribute("offset",parseInt(num)+"%");

		if(ellipseGradient=="horizontal"){
			linearGradient.setAttribute("x2",parseInt(num)+"%");
			linearGradient.setAttribute("y2","0%"); 
		}else if(ellipseGradient=="vertical"){
			linearGradient.setAttribute("y2",parseInt(num)+"%");
			linearGradient.setAttribute("x2","0%"); 			
		}	

	}
	
	this.inlet1["gradientCircle"]=function(ellipseXY) {
		var tmp = ellipseXY.split(" ");
		radialGradient.setAttribute("cx",parseInt(tmp[0])+"%");
		radialGradient.setAttribute("cy",parseInt(tmp[1])+"%");		
	}
	
	this.inlet1["gradientFocus"]=function(focusXY) {
		var tmp = focusXY.split(" ");
		radialGradient.setAttribute("fx",parseInt(tmp[0])+"%");
		radialGradient.setAttribute("fy",parseInt(tmp[1])+"%");				
	}
	
	this.inlet1["gradientSpread"]=function(type) {
		
		if(type!="pad"&&type!="reflect"&&type!="repeat") {
			LilyDebugWindow.error("Incorrect spreadMethod parameter")
			return;
		}	
		linearGradient.setAttribute("spreadMethod",type);
		radialGradient.setAttribute("spreadMethod",type);				
	}	
	
	this.inlet1["gradientRadius"]=function(radius) {
		radialGradient.setAttribute("r",parseInt(radius)+"%");			
	}	
	
	this.inlet1["gradientStartColor"]=function(color) {
		radialStart.setAttribute("style","stop-color:"+color+";stop-opacity:1");
		linearStart.setAttribute("style","stop-color:"+color+";stop-opacity:1");		
	}
	
	this.inlet1["gradientEndColor"]=function(color) {
		radialStop.setAttribute("style","stop-color:"+color+";stop-opacity:1");		
		linearStop.setAttribute("style","stop-color:"+color+";stop-opacity:1");			
	}	
	
	var svg = "<svg id=\""+ this.createElID("ellipseCanvas") +"\" xmlns=\"http://www.w3.org/2000/svg\" width=\"150px\" height=\"150px\">";
	svg += "<defs><linearGradient spreadMethod=\"reflect\" id=\""+ this.createElID("linear_gradient") +"\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">";
	svg += "<stop id=\""+ this.createElID("linear_start") +"\" offset=\"0%\" style=\"stop-color:rgb(255,255,255);stop-opacity:1\"/>";
	svg += "<stop id=\""+ this.createElID("linear_stop") +"\" offset=\"100%\" style=\"stop-color:rgb(0,0,0);stop-opacity:1\"/></linearGradient>";
	svg += "<radialGradient spreadMethod=\"reflect\" id=\""+ this.createElID("radial_gradient") +"\" cx=\"50%\" cy=\"50%\" r=\"50%\" fx=\"50%\" fy=\"50%\">";
	svg += "<stop id=\""+ this.createElID("radial_start") +"\" offset=\"0%\" style=\"stop-color:rgb(255,255,255);stop-opacity:0\"/>";
	svg += "<stop id=\""+ this.createElID("radial_stop") +"\" offset=\"100%\" style=\"stop-color:rgb(0,0,0);stop-opacity:1\"/></radialGradient>";
	svg += "</defs><ellipse stroke-dasharray=\"" + this.gStrokeDashArray.split(",") + "\" stroke=\"" + this.gStrokeColor + "\" stroke-width=\"" + this.gStrokeWidth + "%\" opacity=\"" + this.gOpacity + "\" cx=\"50%\" cy=\"50%\" ry=\""+this.gEllipseHeight+"%\" rx=\""+this.gEllipseWidth+"%\" id=\""+ this.createElID("ellipseElement") +"\" style=\"fill:"+this.gColor+";\"/></svg>"


	//custom html
	this.ui=new LilyObjectView(this,svg);
	this.ui.draw();	
	this.ellipseElement=thisPtr.ui.getElByID(thisPtr.createElID("ellipseElement"));
	this.ellipseCanvas=thisPtr.ui.getElByID(thisPtr.createElID("ellipseCanvas"));
	
	var linearStart = thisPtr.ui.getElByID(thisPtr.createElID("linear_start"));
	var linearStop = thisPtr.ui.getElByID(thisPtr.createElID("linear_stop"));
	var linearGradient = thisPtr.ui.getElByID(thisPtr.createElID("linear_gradient"));
	
	var radialStart = thisPtr.ui.getElByID(thisPtr.createElID("radial_start"));
	var radialStop = thisPtr.ui.getElByID(thisPtr.createElID("radial_stop"));
	var radialGradient = thisPtr.ui.getElByID(thisPtr.createElID("radial_gradient"));	
	
	this.displayElement=this.ellipseElement;
	this.resizeElement=this.ellipseCanvas;
	this.controller.setNoBorders(true);	
	
	gRX = parseInt(this.ellipseElement.getAttribute("rx"));
	gRY = parseInt(this.ellipseElement.getAttribute("ry"));	
	
	function clickFunc() {
		thisPtr.outlet1.doOutlet("click bang");
	}
	
	function mouseOverFunc() {
		thisPtr.outlet1.doOutlet("mouseover bang");
	}
	
	
	function mouseOutFunc() {
		thisPtr.outlet1.doOutlet("mouseout bang");	
	}		
	
	this.controller.attachObserver(this.createElID("ellipseElement"),"click",clickFunc,"performance");
	this.controller.attachObserver(this.createElID("ellipseElement"),"mouseover",mouseOverFunc,"performance");
	this.controller.attachObserver(this.createElID("ellipseElement"),"mouseout",mouseOutFunc,"performance");
	
	initTransforms();				

	return this;
}

var $ellipseMetaData = {
	textName:"ellipse",
	htmlName:"ellipse",
	objectCategory:"Graphics",
	objectSummary:"SVG ellipse.",
	objectArguments:"fill [red], opacity, radius x, radius y, strokeColor, strokeWidth, strokeDashArray"
}