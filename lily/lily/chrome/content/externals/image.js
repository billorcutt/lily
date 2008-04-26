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
*	Construct a new image object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $image(src)
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"number sets object size, methods: \"top\", \"left\", \"opacity\", \"rotate\"");
	this.outlet1=new this.outletClass("outlet1",this,"list \"[event type] [bang]\" on click, mouseover and mouseout");	
	this.imageElement=null;

	var gWidth = 0;
	var gHeight = 0;
	
	var imageSrc=src||"chrome://lily/content/images/glass.gif";
	this.src = imageSrc;
	
	this.setInspectorConfig([
		{name:"src",value:thisPtr.src,label:"Image Src",type:"string",input:"text"}		
	]);
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+vals["src"];

		//update the image
		if(vals["src"]) setSrc(vals["src"]);
					
	}
	
	//set image
	function setSrc(src) {		
		if(thisPtr.imageElement) thisPtr.imageElement.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",src);
	}	
	
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
		var cx = (parseInt(thisPtr.imageCanvas.getAttribute("width"))/2);
		var cy = (parseInt(thisPtr.imageCanvas.getAttribute("height"))/2);
		transforms["rotate"]=""+0+","+cx+","+cy;
	}	
	
	this.inlet1["num"]=function(num) {		
		if(parseInt(num)>100||parseInt(num)<1||isNaN(parseInt(num)))
			return;		
								
		var x = (gWidth>=gHeight)?parseInt(num):((gWidth/gHeight)*parseInt(num));
		var y = (gHeight>=gWidth)?parseInt(num):((gHeight/gWidth)*parseInt(num));
		
		var offsetX = parseInt((100-parseInt(x))/2);
		var offsetY = parseInt((100-parseInt(y))/2);		
		
		thisPtr.imageElement.setAttribute("x",parseInt(offsetX)+"%");
		thisPtr.imageElement.setAttribute("y",parseInt(offsetY)+"%");		
				
		thisPtr.imageElement.setAttribute("width",(x)+"%");
		thisPtr.imageElement.setAttribute("height",(y)+"%");
						
	}
	
	this.inlet1["src"]=function(loc) {
		setSrc(loc);		
	}
		
	this.inlet1["left"]=function(num) {		
		thisPtr.imageElement.setAttribute("x",(parseInt(num))+"%");		
	}
	
	this.inlet1["top"]=function(num) {		
		thisPtr.imageElement.setAttribute("y",(parseInt(num))+"%");	
	}	
	
	this.inlet1["height"]=function(num) {		
		gHeight=parseInt(num);
		thisPtr.imageElement.setAttribute("height",parseInt(num)+"%");	
	}
	
	this.inlet1["width"]=function(num) {		
		gWidth=parseInt(num);		
		thisPtr.imageElement.setAttribute("width",parseInt(num)+"%");	
	}
	
	this.inlet1["opacity"]=function(num) {
		if(parseFloat(num)>1||parseFloat(num)<0||isNaN(parseInt(num)))
			return;		
		
		thisPtr.imageElement.setAttribute("opacity",parseFloat(num));	
	}
		
	//transforms
	this.inlet1["rotate"]=function(angle) {
		var cx = (parseInt(thisPtr.imageCanvas.getAttribute("width"))/2);
		var cy = (parseInt(thisPtr.imageCanvas.getAttribute("height"))/2);
		transforms["rotate"]=""+angle+","+cx+","+cy;	
		thisPtr.imageElement.setAttribute("transform",getTransformText());	
	}
	
	this.inlet1["scale"]=function(scaleXY) {
		var tmp = scaleXY.split(" ");
		transforms["scale"]=""+parseFloat(tmp[0])+","+parseFloat(tmp[1]);	
		thisPtr.imageElement.setAttribute("transform",getTransformText());			
	}
	
	this.inlet1["translate"]=function(transformXY) {
		var tmp = transformXY.split(" ");
		transforms["translate"]=""+parseInt(tmp[0])+","+parseInt(tmp[1]);	
		thisPtr.imageElement.setAttribute("transform",getTransformText());			
	}	
	
	this.inlet1["skewX"]=function(x) {			
		transforms["skewX"]=""+parseInt(x);	
		thisPtr.imageElement.setAttribute("transform",getTransformText());	
	}
	
	this.inlet1["skewY"]=function(y) {				
		transforms["skewY"]=""+parseInt(y);	
		thisPtr.imageElement.setAttribute("transform",getTransformText());	
	}					
	
	var svg = "<svg id=\""+ this.createElID("imageCanvas") +"\" xmlns=\"http://www.w3.org/2000/svg\" width=\"150px\" height=\"150px\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">";
	svg += "<image y=\"15%\" x=\"15%\" width=\"70%\" height=\"70%\" id=\""+ this.createElID("imageElement") +"\" xlink:href=\""+imageSrc+"\"/></svg>"


	//custom html
	this.ui=new LilyObjectView(this,svg);
	this.ui.draw();
	
	this.imageElement=thisPtr.ui.getElByID(thisPtr.createElID("imageElement"));
	this.imageCanvas=thisPtr.ui.getElByID(thisPtr.createElID("imageCanvas"));		
		
	function clickFunc() {
		thisPtr.outlet1.doOutlet("click bang");
	}
	
	function mouseOverFunc() {
		thisPtr.outlet1.doOutlet("mouseover bang");
	}
	
	function mouseOutFunc() {
		thisPtr.outlet1.doOutlet("mouseout bang");	
	}		
	
	this.controller.attachObserver(this.createElID("imageElement"),"click",clickFunc,"performance");
	this.controller.attachObserver(this.createElID("imageElement"),"mouseover",mouseOverFunc,"performance");
	this.controller.attachObserver(this.createElID("imageElement"),"mouseout",mouseOutFunc,"performance");	

	this.displayElement=this.imageElement;
	this.resizeElement=this.imageCanvas;
	this.controller.setNoBorders(true);
	
	initTransforms();
	
	//init global variables
	gWidth = parseInt(this.imageElement.getAttribute("width"));
	gHeight = parseInt(this.imageElement.getAttribute("height"));	
	
	return this;
}

var $imageMetaData = {
	textName:"image",
	htmlName:"image",
	objectCategory:"Graphics",
	objectSummary:"SVG image.",
	objectArguments:"image src"
}