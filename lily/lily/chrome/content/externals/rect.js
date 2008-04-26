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
*	Construct a new rect object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $rect(args)
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"number sets object size, methods: \"top\", \"left\", \"radius\", \"color\", \"opacity\", \"strokeColor\", \"strokeWidth\", \"strokeDashArray\", \"rotate\"");
	this.outlet1=new this.outletClass("outlet1",this,"list \"[event type] [bang]\" on click, mouseover and mouseout");	
	this.rectElement=null;

	var argsArr = (args)?args.split(" "):[];
	this.gColor=argsArr[0]||"red"; //default to red
	this.gOpacity=argsArr[1]||1;
	this.gRectWidth=argsArr[2]||70;
	this.gRectHeight=argsArr[3]||70;
	this.gStrokeColor=argsArr[4]||"none";	
	this.gStrokeWidth=argsArr[5]||0;
	this.gStrokeDashArray=argsArr[6]||"";
	
	this.args=args;
	
	//create a config with the params we want to be user editable in the inspector
	//must follow the form- property name, property value, label (for inspector), data type (number,boolean,string)
	this.setInspectorConfig([
		{name:"gColor",value:thisPtr.gColor,label:"Fill Color",type:"text",input:"text"},
		{name:"gOpacity",value:thisPtr.gOpacity,label:"Opacity",type:"number",input:"text"},
		{name:"gRectWidth",value:thisPtr.gRectWidth,label:"Width",type:"number",input:"text"},
		{name:"gRectHeight",value:thisPtr.gRectHeight,label:"Height",type:"number",input:"text"},		
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
		this.args=""+vals["gColor"]+" "+vals["gOpacity"]+" "+vals["gRectWidth"]+" "+vals["gRectHeight"]+" "+vals["gStrokeColor"]+" "+vals["gStrokeWidth"]+" "+vals["gStrokeDashArray"];	
			
		thisPtr.rectElement.setAttribute("width",parseInt(vals["gRectWidth"])+"%");
		thisPtr.rectElement.setAttribute("height",parseInt(vals["gRectHeight"])+"%");		
		thisPtr.rectElement.setAttribute("style","fill:"+vals["gColor"]);
		thisPtr.rectElement.setAttribute("opacity",parseFloat(vals["gOpacity"]));
		thisPtr.rectElement.setAttribute("stroke",vals["gStrokeColor"]);
		thisPtr.rectElement.setAttribute("stroke-width",parseInt(vals["gStrokeWidth"])+"%");
		thisPtr.rectElement.setAttribute("stroke-dasharray",vals["gStrokeDashArray"].split(" "));
		
		setRectPos(); //reset the pos based on changes in the rect size
				
	}

	var rectGradient="none"; //gradient type.
	var gWidth = 0;
	var gHeight = 0;
	
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
		var cx = (parseInt(thisPtr.rectCanvas.getAttribute("width"))/2);
		var cy = (parseInt(thisPtr.rectCanvas.getAttribute("height"))/2);
		transforms["rotate"]=""+0+","+cx+","+cy;
	}
	
	function setRectPos() {
		var x = ((thisPtr.gRectWidth)>100)?0:parseInt((100-(thisPtr.gRectWidth))/2);
		var y = ((thisPtr.gRectHeight)>100)?0:parseInt((100-(thisPtr.gRectHeight))/2);

		thisPtr.rectElement.setAttribute("x",parseInt(x)+"%");
		thisPtr.rectElement.setAttribute("y",parseInt(y)+"%");	
	}	
	
	this.inlet1["num"]=function(num) {		
		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
			return;		
								
		var x = (gWidth>=gHeight)?parseInt(num):((gWidth/gHeight)*parseInt(num));
		var y = (gHeight>=gWidth)?parseInt(num):((gHeight/gWidth)*parseInt(num));
		
		var offsetX = parseInt((100-parseInt(x))/2);
		var offsetY = parseInt((100-parseInt(y))/2);		
		
		thisPtr.rectElement.setAttribute("x",parseInt(offsetX)+"%");
		thisPtr.rectElement.setAttribute("y",parseInt(offsetY)+"%");		
				
		thisPtr.rectElement.setAttribute("width",(x)+"%");
		thisPtr.rectElement.setAttribute("height",(y)+"%");
						
	}
	
	this.inlet1["left"]=function(num) {
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;				
		
		thisPtr.rectElement.setAttribute("x",(parseInt(num))+"%");		
	}
	
	this.inlet1["top"]=function(num) {
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;		
		
		thisPtr.rectElement.setAttribute("y",(parseInt(num))+"%");	
	}	
	
	this.inlet1["height"]=function(num) {
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;				
		
		gHeight=parseInt(num);
		thisPtr.rectElement.setAttribute("height",parseInt(num)+"%");	
	}
	
	this.inlet1["width"]=function(num) {
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;		
		
		gWidth=parseInt(num);		
		thisPtr.rectElement.setAttribute("width",parseInt(num)+"%");	
	}
	
	this.inlet1["color"]=function(color) {
		thisPtr.rectElement.setAttribute("style","fill:"+color);	
	}
	
	this.inlet1["opacity"]=function(num) {
		if(parseFloat(num)>1||parseFloat(num)<0||isNaN(parseInt(num)))
			return;		
		
		thisPtr.rectElement.setAttribute("opacity",parseFloat(num));	
	}
	
	this.inlet1["strokeColor"]=function(color) {
		thisPtr.rectElement.setAttribute("stroke",color);	
	}
	
	this.inlet1["strokeWidth"]=function(num) {
		thisPtr.rectElement.setAttribute("stroke-width",parseInt(num)+"%");	
	}
	
	this.inlet1["strokeDashArray"]=function(arr) {
		thisPtr.rectElement.setAttribute("stroke-dasharray",arr.split(" "));	
	}
	
	//transforms
	this.inlet1["rotate"]=function(angle) {
		var cx = (parseInt(thisPtr.rectCanvas.getAttribute("width"))/2);
		var cy = (parseInt(thisPtr.rectCanvas.getAttribute("height"))/2);
		transforms["rotate"]=""+angle+","+cx+","+cy;	
		thisPtr.rectElement.setAttribute("transform",getTransformText());	
	}
	
	this.inlet1["scale"]=function(scaleXY) {
		var tmp = scaleXY.split(" ");
		transforms["scale"]=""+parseFloat(tmp[0])+","+parseFloat(tmp[1]);	
		thisPtr.rectElement.setAttribute("transform",getTransformText());			
	}
	
	this.inlet1["translate"]=function(transformXY) {
		var tmp = transformXY.split(" ");
		transforms["translate"]=""+parseInt(tmp[0])+","+parseInt(tmp[1]);	
		thisPtr.rectElement.setAttribute("transform",getTransformText());			
	}	
	
	this.inlet1["skewX"]=function(x) {			
		transforms["skewX"]=""+parseInt(x);	
		thisPtr.rectElement.setAttribute("transform",getTransformText());	
	}
	
	this.inlet1["skewY"]=function(y) {				
		transforms["skewY"]=""+parseInt(y);	
		thisPtr.rectElement.setAttribute("transform",getTransformText());	
	}					
	
	//gradients
	this.inlet1["gradient"]=function(type) {
		if(type=="horizontal") {
			rectGradient="horizontal";
			linearGradient.setAttribute("x2","100%");
			linearGradient.setAttribute("y2","0%");	
			linearGradient.setAttribute("y1","0%");	
			linearGradient.setAttribute("x1","0%");			
			thisPtr.rectElement.setAttribute("style","fill:url(#"+thisPtr.createElID("linear_gradient")+")");
		} else if(type=="vertical") {
			rectGradient="vertical";			
			linearGradient.setAttribute("x2","0%");
			linearGradient.setAttribute("y2","100%");
			linearGradient.setAttribute("y1","0%");	
			linearGradient.setAttribute("x1","0%");						
			thisPtr.rectElement.setAttribute("style","fill:url(#"+thisPtr.createElID("linear_gradient")+")");
		} else if(type=="radial") {
			rectGradient="radial";			
			thisPtr.rectElement.setAttribute("style","fill:url(#"+thisPtr.createElID("radial_gradient")+")");
		} else {
			rectGradient="none";		
			thisPtr.rectElement.setAttribute("style","fill:"+this.gColor); 
		}			
	}
	
	this.inlet1["gradientStart"]=function(num) {
		
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;
		
		linearStart.setAttribute("offset",parseInt(num)+"%"); 
		
		if(rectGradient=="horizontal"){
			linearGradient.setAttribute("x1",parseInt(num)+"%");
			linearGradient.setAttribute("y1","0%"); 
		}else if(rectGradient=="vertical"){
			linearGradient.setAttribute("y1",parseInt(num)+"%");
			linearGradient.setAttribute("x1","0%"); 			
		}
	}
	
	this.inlet1["gradientEnd"]=function(num) {
		
//		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
//			return;		
		
		linearStop.setAttribute("offset",parseInt(num)+"%");

		if(rectGradient=="horizontal"){
			linearGradient.setAttribute("x2",parseInt(num)+"%");
			linearGradient.setAttribute("y2","0%"); 
		}else if(rectGradient=="vertical"){
			linearGradient.setAttribute("y2",parseInt(num)+"%");
			linearGradient.setAttribute("x2","0%"); 			
		}	

	}
	
	this.inlet1["gradientCircle"]=function(circleXY) {
		var tmp = circleXY.split(" ");
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
//		if(parseFloat(radius)>100||parseFloat(radius)<1||isNaN(parseInt(radius)))
//			return;		
		
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
	
	var svg = "<svg id=\""+ this.createElID("rectCanvas") +"\" xmlns=\"http://www.w3.org/2000/svg\" width=\"150px\" height=\"150px\">";
	svg += "<defs><linearGradient spreadMethod=\"reflect\" id=\""+ this.createElID("linear_gradient") +"\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">";
	svg += "<stop id=\""+ this.createElID("linear_start") +"\" offset=\"0%\" style=\"stop-color:rgb(255,255,255);stop-opacity:1\"/>";
	svg += "<stop id=\""+ this.createElID("linear_stop") +"\" offset=\"100%\" style=\"stop-color:rgb(0,0,0);stop-opacity:1\"/></linearGradient>";
	svg += "<radialGradient spreadMethod=\"reflect\" id=\""+ this.createElID("radial_gradient") +"\" cx=\"50%\" cy=\"50%\" r=\"50%\" fx=\"50%\" fy=\"50%\">";
	svg += "<stop id=\""+ this.createElID("radial_start") +"\" offset=\"0%\" style=\"stop-color:rgb(255,255,255);stop-opacity:0\"/>";
	svg += "<stop id=\""+ this.createElID("radial_stop") +"\" offset=\"100%\" style=\"stop-color:rgb(0,0,0);stop-opacity:1\"/></radialGradient>";
	svg += "</defs><rect stroke-dasharray=\"" + this.gStrokeDashArray.split(",") + "\" stroke=\"" + this.gStrokeColor + "\" stroke-width=\"" + this.gStrokeWidth + "%\" opacity=\"" + this.gOpacity + "\" y=\"15%\" x=\"15%\" width=\""+this.gRectWidth+"%\" height=\""+this.gRectHeight+"%\" id=\""+ this.createElID("rectElement") +"\" style=\"fill:"+this.gColor+";\"/></svg>"

	//custom html
	this.ui=new LilyObjectView(this,svg);
	this.ui.draw();
	
	this.rectElement=thisPtr.ui.getElByID(thisPtr.createElID("rectElement"));
	this.rectCanvas=thisPtr.ui.getElByID(thisPtr.createElID("rectCanvas"));
	
	var linearStart = thisPtr.ui.getElByID(thisPtr.createElID("linear_start"));
	var linearStop = thisPtr.ui.getElByID(thisPtr.createElID("linear_stop"));
	var linearGradient = thisPtr.ui.getElByID(thisPtr.createElID("linear_gradient"));
	
	var radialStart = thisPtr.ui.getElByID(thisPtr.createElID("radial_start"));
	var radialStop = thisPtr.ui.getElByID(thisPtr.createElID("radial_stop"));
	var radialGradient = thisPtr.ui.getElByID(thisPtr.createElID("radial_gradient"));		
		
	function clickFunc() {
		thisPtr.outlet1.doOutlet("click bang");
	}
	
	function mouseOverFunc() {
		thisPtr.outlet1.doOutlet("mouseover bang");
	}
	
	function mouseOutFunc() {
		thisPtr.outlet1.doOutlet("mouseout bang");	
	}		
	
	this.controller.attachObserver(this.createElID("rectElement"),"click",clickFunc,"performance");
	this.controller.attachObserver(this.createElID("rectElement"),"mouseover",mouseOverFunc,"performance");
	this.controller.attachObserver(this.createElID("rectElement"),"mouseout",mouseOutFunc,"performance");	

	this.displayElement=this.rectElement;
	this.resizeElement=this.rectCanvas;
	this.controller.setNoBorders(true);
	
	initTransforms();
	setRectPos();
	
	//init global variables
	gWidth = parseInt(this.rectElement.getAttribute("width"));
	gHeight = parseInt(this.rectElement.getAttribute("height"));	
	

	return this;
}

var $rectMetaData = {
	textName:"rect",
	htmlName:"rect",
	objectCategory:"Graphics",
	objectSummary:"SVG rectangle.",
	objectArguments:"fill [red], opacity, width, height, strokeColor, strokeWidth, strokeDashArray"
}