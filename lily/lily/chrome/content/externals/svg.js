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
*	Construct a new svg object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $svg(args) //args width/height
{

	var thisPtr=this;	
	
	//dont allow font changes	
	this.allowFont=false; 	
	
	//name space
	var SVGNS = "http://www.w3.org/2000/svg";
	
	//user supplied value- object sent to inlet is assigned here
	this.ENV = {};
	
	//the last created element
	var currElement 	= null;
	
	//the current script
	var currScriptPath 	= [];	
	
	//variable we'll use to build up the current path string
	var currPath		= "";
	
	//flag to indicate we're drawing a path...
	var drawingPath		= false;
	
	//the current font
	var currFont		= null;
	
	//start time
	var startTime 		= null;
	
	//loop draw function
	var looping 		= true;
	
	//rate to call the draw function
	var frame_rate 		= 30;
	
	//draw loop id
	var loopID 			= null;
		
	//ellipseMode
	var ellipse_mode 	= "CENTER";
	//rectMode
	var rect_mode 		= "CORNER";	
	
	//svg viewport
	//this overwrites
	this.width 			= 0;
	this.height 		= 0;
	
	/* start various mouse stuff */
	
	//the raw mouse data, updated on mousemove event
	var _mouseX			= 0;
	var _mouseY			= 0;
	
	//these are updated each frame	
	this.mouseX			= 0;
	this.mouseY			= 0;
	
	//these relect the previous frames value
	this.pmouseX			= 0;
	this.pmouseY			= 0;
	
	//name changed from mousePressed because js can't tell the difference between a function & a variable
	//true when mouse is down	
	this.isMousePressed	= false;
	
	/* end various mouse stuff */
	
	//keyboard
	this.isKeyPressed		= false;
	this.key				= null;
	this.keyCode			= null;		
	
	//color 
	var fillColor 		= "#FFFFFF"; //color
	var strokeColor 	= "none"; //color
	var strokeWidth 	= 1; //size in px
	var fillOpacity		= 1; //fill opacity
	var _strokeOpacity	= 1; //stroke opacity
	var strokeLineCap 	= "round"; //stroke cap
	var strokeLineJoin  = "miter"; //stroke line join	
		
	this.outlet1 = new this.outletClass("outlet1",this,"help text describing this outlet");
	this.inlet1=new this.inletClass("inlet1",this,"help text describing this inlet");
		
	this.sendMess=function(msg) {
		thisPtr.outlet1.doOutlet(msg);
	}
	
	this.println=function(str) {
		LilyDebugWindow.print(str);
	}
	
	//store an object
	this.inlet1["obj"]=function(obj) {
		thisPtr.ENV=obj;
	}	
		
	//load a script
	this.inlet1["load"]=function(url) {
		currScriptPath.push(LilyUtils.getFilePath(url));			
	}
	
	//call the setup method
	this.inlet1["setup"]=function(params) {
		//call setup if it exists
		if(typeof thisPtr.setup == "function") thisPtr.setup(params);
	}
	
	//call the draw method
	this.inlet1["draw"]=function(params) {
		//call draw if it exists
		if(typeof thisPtr.draw == "function") thisPtr.draw(params);
	}
	
	//call the exec method- custom method for interacting with a sketch
	this.inlet1["exec"]=function(params) {
		//call exec if it exists
		if(typeof thisPtr.exec == "function") thisPtr.exec(params);
	}		
	
	//run a script
	this.inlet1["run"]=function() {
		
		//stop any run scripts
		clearInterval(loopID);
		loopID=null;	
		
		//clear the dom
		_clear();
		
		//load the script into memory
		_eval();		
		
		//call setup it exists
		if(typeof thisPtr.setup == "function") thisPtr.setup(); 
				
		//if looping ok, do it, else just call the draw function once.
		if(looping)
			thisPtr.loop();
		else
			if(typeof thisPtr.draw == "function") thisPtr.draw();
			
	}
	
	//eval a script
	this.inlet1["eval"]=function(str) {
		_eval(str);
	}
	
	function _eval() {		
		try {
			for(var i=0;i<currScriptPath.length;i++) {
				LilyUtils.loadScript("file://"+currScriptPath[i],thisPtr);	
			}
		} catch(e) {
			LilyDebugWindow.error(e.name + ": " + e.message + " " + e.lineNumber);
		}		
	}	
	
	//clear the dom
	this.inlet1["clear"]=function() {
		_clear();
	}
	
	function _clear() {
		var tmp=thisPtr.displayElement.childNodes;		
		for(var i=0;i<tmp.length;i++) {
			thisPtr.displayElement.removeChild(tmp[i]);
			i--;
		}
	}
	
	//start the looping on the draw function
	this.loop=function() {
		if(typeof thisPtr.draw == "function") {
			var tmp = (1000/frame_rate);
			loopID = setInterval(_draw,tmp);
			looping=true;
		}
	}
	
	function _draw() {
		thisPtr.resetMatrix(); //reset the transformation matrix
		updateMouseData(); //update various mouse vars
		thisPtr.draw(); //call the draw function
	}
	
	this.noLoop=function() {
		clearInterval(loopID);
		looping=false;
	}
	
	//kill the loop
	this.inlet1["kill"]=function() {
		_kill();
	}	
	
	function _kill() {
		clearInterval(loopID);						
		loopID=null;
	}
	
	//stop the loop & refresh the object
	this.inlet1["refresh"]=function() {
		_refresh();
	}
	
	function _refresh() {
		_kill();
		releaseObservers();		
		thisPtr.parent.replaceObject(thisPtr,"svg",(thisPtr.width+" "+thisPtr.height));
	}
	
	this.destructor=function() {
		_kill();
		releaseObservers();
	}		
	
	this.redraw=function() {
		if(typeof thisPtr.draw == "function") thisPtr.draw();
	}
	
	this.smooth=function() {
		//no svg equiv that i'm aware of...
	}
	
	this.frameRate=function(rate) {
		frame_rate=rate;
	}	

	//call draw method if it exists
	this.inlet1["draw"]=function(args) {
		if(typeof thisPtr.draw == "function") thisPtr.draw(args);
	}
	
	//size the viewport
	this.inlet1["size"]=function(args) {
		var w = args.split(" ")[0]||null;
		var h = args.split(" ")[1]||null;
		
		if(w && h)		
			thisPtr.size(w,h);
	}
	
	this.size=function(w,h) {
		thisPtr.width=parseInt(w);
		thisPtr.height=parseInt(h);
		
		thisPtr.setWidth(w);		
		thisPtr.setHeight(h);
	}
	
	//update mouse data on every frame
	function updateMouseData() {
		thisPtr.pmouseX = thisPtr.mouseX;
		thisPtr.pmouseY = thisPtr.mouseY;
		thisPtr.mouseX = _mouseX;
		thisPtr.mouseY = _mouseY;
	}	
	
	//mouse event callback
	function _mouseDown(evt) {
		thisPtr.isMousePressed = true;		
		if(typeof thisPtr.mousePressed == "function") thisPtr.mousePressed(evt);
	}

	//mouse event callback
	function _mouseUp(evt) {
		thisPtr.isMousePressed = false;
		if(typeof thisPtr.mouseReleased == "function") thisPtr.mouseReleased(evt);
	}

	//mouse event callbacks	
	function _mouseMoved(evt) {
		
		var offsetX = parseInt(thisPtr.left);
		var offsetY = parseInt(thisPtr.top);		
		
		_mouseX = parseInt(evt.clientX) - offsetX;
		_mouseY = parseInt(evt.clientY) - offsetY;
		
		if(thisPtr.isMousePressed && typeof thisPtr.mouseDragged=="function") {
			thisPtr.mouseDragged();
		} else if(!thisPtr.isMousePressed && typeof thisPtr.mouseMoved=="function") {
			thisPtr.mouseMoved();
		}
	}
	
	//keyboard event callbacks
	function _keyPressed(evt) {
		
		if(thisPtr.controller.patchController.getEditable()=="edit")
			return;	
			
		thisPtr.keyCode = evt.charCode;
		thisPtr.key = String.fromCharCode(evt.charCode);				
		
		thisPtr.isKeyPressed = true;	
		if(typeof thisPtr.keyPressed == "function") thisPtr.keyPressed(evt);
	}
	
	//keyboard event callbacks
	function _keyReleased(evt) {
		
		if(thisPtr.controller.patchController.getEditable()=="edit")
			return;		
		
		thisPtr.isKeyPressed = false;		
		if(typeof thisPtr.keyReleased == "function") thisPtr.keyReleased(evt);
	}
	
	
	
	/*
		START TRANSFORM METHODS
	*/
	
	//matrix class	
	function Matrix() {
		this.ctm="";
	}	
	
	//stack o' matrices
	var matrixStack={
		
		stack:[],
		
		clone: function() {
			
			var newMatrix = new Matrix();
			var currMatrix = this.getCurr();
			newMatrix.ctm=currMatrix.ctm;
			return newMatrix;
			
		},
		
		print: function() {
			LilyDebugWindow.print(this.getCurr().ctm);
		},
				
		push:function() {
			this.stack.push(this.clone(this.getCurr()));
		},
		
		pop: function() {
			if(this.stack.length>1)
				this.stack.pop();
		},
		
		//set a value
		set: function(key,val) {
			//this.getCurr().params[key]=(+val);
			this.getCurr().ctm += key+"("+val+") ";
		},
		
		//get the current matrix
		getCurr: function() {
			return this.stack[this.stack.length-1];
		},
		
		init: function() {
			this.stack=[new Matrix()]; //push an initial matrix on the stack		
		},
		
		getTransformText: function() {			
			return this.getCurr().ctm;
		}
		
	}
			
	//push a fresh matrix onto the stack
	this.inlet1["pushMatrix"]=function() {
		matrixStack.push();
	}
	
	this.pushMatrix=function() {
		matrixStack.push();
	}
	
	//pop current matrix off the stack, restore previous
	this.inlet1["popMatrix"]=function() {
		popMatrix();
	}
	
	this.popMatrix=function() {
		matrixStack.pop();
	}
	
	//replace the current matrix with the identity matrix
	this.inlet1["resetMatrix"]=function() {
		resetMatrix();
	}
	
	this.resetMatrix=function() {
		matrixStack.init();
	}
	
	//not formatted- just a raw dump
	this.printMatrix=function() {
		matrixStack.print();
	}
	
	//convert radians to degrees
	this.degrees=function(radians) {
		return (radians*(180.0/Math.PI));
	}	
	
	//convert degrees to radians
	this.radians=function(degrees) {
		return (degrees*(Math.PI/180));
	}			
	
	//set rotate
	this.inlet1["rotate"]=function(angle) {
		matrixStack.set("rotate",thisPtr.degrees(angle));
	}
	
	this.rotate=function(angle) {
		matrixStack.set("rotate",thisPtr.degrees(angle));
	}	
	
	//set scale
	this.inlet1["scale"]=function(args) {
		var x = args.split(" ")[0];
		var y = args.split(" ")[1]||x;		
		thisPtr.scale(x,y);
	}
	
	this.scale=function(x,y) {
		var y = y||x;
		matrixStack.set("scale",(x+","+y));	
	}
	
	//set translate
	this.inlet1["translate"]=function(args) {
		var x = args.split(" ")[0];
		var y = args.split(" ")[1]||0;		
		thisPtr.translate(x,y);
	}
	
	this.translate=function(x,y) {
		matrixStack.set("translate",(x+","+y));	
	}
	
	//set skew
	this.inlet1["skew"]=function(args) {
		var x = args.split(" ")[0];
		var y = args.split(" ")[1]||0;		
		thisPtr.skew(x,y);
	}
	
	this.skew=function(x,y) {
		var y = y||x;		
		matrixStack.set("skewX",x);
		matrixStack.set("skewY",y);		
	}
	
	/*
		END TRANSFORM METHODS
	*/	
	
	/*
		START COLOR METHODS
	*/
	
	//we'll store color mode info here
	var colorState = {
		
		mode: "RGB",
		range1: 255,
		range2: 255,
		range3: 255,
		range4: 255
		
	}
	
	//set the color mode
	this.colorMode=function(mode,range1,range2,range3,range4) {
		
		//only supporting RGB now...
		if(mode=="RGB") {
			
			colorState.mode=mode;
			colorState.range1=range1||255; //Red
			colorState.range2=range2||colorState.range1; //Green
			colorState.range3=range3||colorState.range1; //Blue
			colorState.range4=range4||255; //Alpha
					
		}
		
	}
	
	
	
	//pack color args into a single object
	//changing name from color
	this.makeColor=function() {

		var color = "";
		var opacity = null; //optional arg so give it a default value
		var args = [];

		//for convenience, copy arguments into a real array
		for(var i=0;i<arguments.length;i++)
			args.push(arguments[i])

//		LilyDebugWindow.print("_applyColorMode args:"+args.toSource());	

		//we have an alpha channel argument
		if(args.length==2||args.length==4) {
			opacity = (args[(args.length-1)]>1)?LilyUtils.map(0,(+colorState.range4),0,1,args[(args.length-1)]):args[(args.length-1)]; //map to the defined range & then map to 0-1 for svg
			args.pop(); //drop this arg
		} 

		//if hex
		if(typeof args[0]=="string" && args[0].charAt(0)=="#") {
			color = args[0]; //no mapping...
		//if grey
		} else if (args.length == 1 && typeof args[0]=="number") {
			color = "" + args[0] + " " + args[0] + " " + args[0];
		//if rgb
		} else if (args.length == 3 && typeof args[0]=="number") {
			color = "" + args[0] + " " + args[1] + " " + args[2];
		}

		return { "type":"color","color":color,"opacity":opacity };

	}	
	
	//maps the supplied color value to something usable by SVG
	function _mapColor(color,type) {
		//type- red=1, green=2, blue=3		
		return parseInt(LilyUtils.map(0,colorState["range"+type],0,255,(+color)));
	}
	
	function _applyColorMode() {
		
		//get ready to process variable length args
		
		var color = "";
		var opacity = null; //optional arg so give it the default value we want
		var args = [];
		
		//got a color object
		if(arguments.length==1&&arguments[0]=="none") {
			return ["none",1];
		} else if(arguments.length==1&&typeof arguments[0]=="object"&&arguments[0].type=="color") {
			args.push(arguments[0].color); //add color
			if(arguments[0].opacity) { args.push(arguments[0].opacity); }
		} else {
			//for convenience, copy arguments into a real array
			for(var i=0;i<arguments.length;i++)
				args.push(arguments[i])
		}
		
//		LilyDebugWindow.print("_applyColorMode args:"+args.toSource());	
		
		//we have an alpha channel argument
		if(args.length==2||args.length==4) {
			opacity = (args[(args.length-1)]>1)?LilyUtils.map(0.0,(+colorState.range4),0.0,1.0,args[(args.length-1)]):args[(args.length-1)]; //map to the defined range & then map to 0-1 for svg
			args.pop(); //drop this arg
		} 
		
		//if hex- 	FIXME *** map color doesn't handle hex ***
		if(typeof args[0]=="string" && args[0].charAt(0)=="#") {
			color = args[0]; //no mapping...
		//if rgb as space delimited string- eg called from lily message
		} else if (args.length == 1 && typeof args[0]=="string") {
			
			var tmp=args[0].split(" ");
			//all 3 args are present so join it.
			if(tmp.length==3) {
				color = "rgb("+_mapColor(tmp[0],1)+","+_mapColor(tmp[1],2)+","+_mapColor(tmp[2],3)+")";
			//less then 3 so we need to pad it out
			} else if(tmp.length<3) {
				color = "rgb("+_mapColor(tmp[0],1)+","+_mapColor(tmp[0],2)+","+_mapColor(tmp[0],3)+")";
			}
			
		//if rgb as a single number- eg called from script
		} else if (args.length == 1 && typeof args[0]=="number") {
			color = "rgb("+_mapColor(args[0],1)+","+_mapColor(args[0],2)+","+_mapColor(args[0],3)+")";
		//got all 3 arguments separately
		} else if (args.length == 3 && typeof args[0]=="number") {
			color = "rgb("+_mapColor(args[0],1)+","+_mapColor(args[1],2)+","+_mapColor(args[2],3)+")";
		}
		
//		LilyDebugWindow.print("color: "+color+" opacity: "+opacity);
		
		return [color,opacity];
		
	}
	
	//set background
	this.inlet1["background"]=function(color) {
		thisPtr.background(color);
	}
	
	this.background=function() {
		_clear();
		if(typeof arguments[0]=="object")
			canvasBackground.style.backgroundImage = "url("+arguments[0].src+")";
		else
			canvasBackground.style.backgroundColor = _applyColorMode.apply(thisPtr,arguments)[0];
	}			
	
	//set fill
	this.inlet1["fill"]=function(color) {
		thisPtr.fill(color);
	}
	
	this.fill=function() {
		var tmp = _applyColorMode.apply(thisPtr,arguments); //fill
		fillColor = tmp[0];
		fillOpacity = (tmp[1])?tmp[1]:fillOpacity; //update the value if we have one.
	}
	
	//set no fill
	this.inlet1["noFill"]=function() {
		thisPtr.noFill();
	}
	
	this.noFill=function() {
		fillColor = "none";	
	}
	
	//set stroke
	this.inlet1["stroke"]=function(color) {
		stroke(color);
	}
	
	this.stroke=function() {
		var tmp = _applyColorMode.apply(thisPtr,arguments);	
		strokeColor = tmp[0];
		_strokeOpacity = (tmp[1])?tmp[1]:_strokeOpacity; //update the value if we have one.
	}
	
	//set no stroke
	this.inlet1["noStroke"]=function() {
		thisPtr.noStroke();
	}
	
	this.noStroke=function() {
		strokeColor = "none";	
	}
	
	this.strokeCap=function(val) {
		if( val == "SQUARE" )
			strokeLineCap = "butt";
		else if( val == "PROJECT" )
			strokeLineCap = "square";
		else
			strokeLineCap = "round";	
	}
	
	this.strokeJoin=function(val) {
		if( val == "ROUND" )
			strokeLineJoin = "round";
		else if( val == "BEVEL" )
			strokeLineJoin = "bevel";
		else
			strokeLineJoin = "miter";	
	}	
	
	//set stroke weight
	this.inlet1["strokeWeight"]=function(size) {
		thisPtr.strokeWeight(size);
	}
	
	this.strokeWeight=function(size) {
		strokeWidth = size;	
	}
	
	this.strokeOpacity=function(size) {
		_strokeOpacity = size;	
	}	
	
	/*
		END COLOR METHODS
	*/
	
	/*
		START SHAPE METHODS
	*/	
	
	//right now this just applies the shape mode.
	function _applyRules(x,y,w,h,type)	{		
		return _applyShapeMode(x,y,w,h,type); //apply the shape mode	
	}
		
	function _applyShapeMode(x,y,w,h,type) {
		
		if(type=="RECT"&&rect_mode=="CENTER")
			return [(x-w/2),(y-h/2),w,h];
		else if(type=="RECT"&&rect_mode=="CORNER")
			return [x,y,w,h];
		else if(type=="RECT"&&rect_mode=="CORNERS")
			return [x,y,(w-x),(h-y)];			
		else if(type=="RECT"&&rect_mode=="RADIUS")
			return [(x-w),(y-h),(w*2),(h*2)];
		else if(type=="ELLIPSE"&&ellipse_mode=="CENTER")
			return [x,y,w/2,h/2];
		else if(type=="ELLIPSE"&&ellipse_mode=="CORNER")
			return [(x+w/2),(y+h/2),w/2,h/2];
		else if(type=="ELLIPSE"&&ellipse_mode=="RADIUS")
			return [x,y,(w),(h)];
			
	}
	
	//make a rect with a max message
	this.inlet1["rect"]=function(params) {

		var x = params.split(" ")[0]; //left
		var y = params.split(" ")[1]; //top
		var w = params.split(" ")[2]; //height
		var h = params.split(" ")[3]; //length
		
		rect(x,y,w,h);
		
	}
	
	//set the rect mode
	this.rectMode=function(mode) {
		if(mode=="CENTER"||mode=="CORNER"||mode=="RADIUS"||mode=="CORNERS")
			rect_mode=mode;
	}
	
	//make a rect
	this.rect=function(x,y,w,h) {
		
		//create the rect
		var rect = thisPtr.document.createElementNS(SVGNS,"rect");
		
		//apply the rect mode to our params
		var tmp = _applyRules(x,y,w,h,"RECT");
		
		//set size & position
		rect.setAttributeNS(null,"x",tmp[0]);
		rect.setAttributeNS(null,"y",tmp[1]);
		rect.setAttributeNS(null,"width",tmp[2]);
		rect.setAttributeNS(null,"height",tmp[3]);
		
		//set the transform values						
		rect.setAttributeNS(null,"transform",matrixStack.getTransformText());
		
//		LilyDebugWindow.print("rect "+matrixStack.getTransformText())
			
		//fill		
		rect.setAttributeNS(null,"fill",fillColor);
		rect.setAttributeNS(null,"fill-opacity",fillOpacity);		
		
		//stroke
		rect.setAttributeNS(null,"stroke",strokeColor);
		rect.setAttributeNS(null,"stroke-width",strokeWidth);
		rect.setAttributeNS(null,"stroke-opacity",_strokeOpacity);	
		
		return canvas.appendChild(rect);
			
	}	
	
	//make an ellipse with a lily message
	this.inlet1["ellipse"]=function(params) {

		var cx = params.split(" ")[0]; //left
		var cy = params.split(" ")[1]; //top
		var rx = params.split(" ")[2]; //height
		var ry = params.split(" ")[3]; //length
		
		ellipse(cx,cy,rx,ry);
		
	}
	
	//set the ellipse mode
	this.ellipseMode=function(mode) {
		if(mode=="CENTER"||mode=="CORNER"||mode=="RADIUS")
			ellipse_mode=mode;
	}	
	
	//make an ellipse
	this.ellipse=function(cx,cy,rx,ry) {
		
		var ellipse = thisPtr.document.createElementNS(SVGNS,"ellipse");
		
		var tmp = _applyRules(cx,cy,rx,ry,"ELLIPSE");
		
		ellipse.setAttributeNS(null,"cx",tmp[0]);
		ellipse.setAttributeNS(null,"cy",tmp[1]);
		ellipse.setAttributeNS(null,"rx",tmp[2]); 
		ellipse.setAttributeNS(null,"ry",tmp[3]);
						
		ellipse.setAttributeNS(null,"transform",matrixStack.getTransformText());
		
//		LilyDebugWindow.print("ellipse "+matrixStack.getTransformText())
					
		ellipse.setAttributeNS(null,"fill",fillColor);
		ellipse.setAttributeNS(null,"fill-opacity",fillOpacity);	
				
		ellipse.setAttributeNS(null,"stroke",strokeColor);
		ellipse.setAttributeNS(null,"stroke-width",strokeWidth);
		ellipse.setAttributeNS(null,"stroke-opacity",_strokeOpacity);			
		
		return canvas.appendChild(ellipse);
			
	}
		
	//make a line
	this.inlet1["line"]=function(params) {

		var x1 = params.split(" ")[0]; //left
		var y1 = params.split(" ")[1]; //height
		var x2 = params.split(" ")[2]; //top		
		var y2 = params.split(" ")[3]; //length
		
		line(x1,y1,x2,y2);
		
	}
	
	//
	this.line=function(x1,y1,x2,y2) {
		
		var line = thisPtr.document.createElementNS(SVGNS, "line");
		
		line.setAttributeNS(null,"x1",x1);
		line.setAttributeNS(null,"y1",y1);
		line.setAttributeNS(null,"x2",x2);
		line.setAttributeNS(null,"y2",y2);
				
		line.setAttributeNS(null,"transform",matrixStack.getTransformText());
		
//		LilyDebugWindow.print("line "+matrixStack.getTransformText())				
		
		line.setAttributeNS(null,"stroke",strokeColor);
		line.setAttributeNS(null,"stroke-width",strokeWidth);
		line.setAttributeNS(null,"stroke-opacity",_strokeOpacity);
		line.setAttributeNS(null,"stroke-linecap","round");
		
		return canvas.appendChild(line);
			
	}
	
	//start font functions
	
	this.loadFont=function(font) {
		return {name:font};
	}
	
	this.textFont=function(pFont,fSize) {
		currFont={font:pFont.name,size:fSize};
	}
	
	//make text with lily message
	this.inlet1["text"]=function(params) {

		var str = params.split(" ")[0]; //src
		var x 	= params.split(" ")[1]; //left
		var y 	= params.split(" ")[2]; //top		
		
		text(str,x,y);
		
	}	
	
	//not implementing height & width
	this.text=function(str,x,y) {
		
		var msg = thisPtr.document.createTextNode(str);
		var text = thisPtr.document.createElementNS(SVGNS, "text");

		text.setAttributeNS(null,"x",x);
		text.setAttributeNS(null,"y",y);
		text.setAttributeNS(null,"font-family",currFont.font);
		text.setAttributeNS(null,"font-size",currFont.size);

		text.setAttributeNS(null,"transform",matrixStack.getTransformText());

		text.setAttributeNS(null,"fill",fillColor);
		text.setAttributeNS(null,"fill-opacity",fillOpacity);		

		text.setAttributeNS(null,"stroke",strokeColor);
		text.setAttributeNS(null,"stroke-width",strokeWidth);
		text.setAttributeNS(null,"stroke-opacity",_strokeOpacity);
		
		text.appendChild(msg);

		return canvas.appendChild(text);
		
	}
	
	//end font
	
	//make an image with lily message
	this.inlet1["image"]=function(params) {

		var src = params.split(" ")[0]; //src
		var x 	= params.split(" ")[1]; //left
		var y 	= params.split(" ")[2]; //top
		var w 	= params.split(" ")[3]||null; //top			
		var h 	= params.split(" ")[4]||null; //left			
		
		thisPtr.image(src,x,y,w,h);
		
	}
	
	//display an image
	this.image=function(img, x, y, w, h) {
		
		var image = thisPtr.document.createElementNS(SVGNS, "image");
		
		image.setAttributeNS(null,"x",x);
		image.setAttributeNS(null,"y",y);
		image.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",img.src);
		
		if(w && typeof w!="undefined") {
			image.setAttributeNS(null,"width",w);
		} else {
			image.setAttributeNS(null,"width",img.width);
		}
		
		if(h && typeof h!="undefined") {
			image.setAttributeNS(null,"height",h);
		} else {
			image.setAttributeNS(null,"height",img.height);
		}
					
		image.setAttributeNS(null,"transform",matrixStack.getTransformText());				
		
		return canvas.appendChild(image);	
		
	}
	
	this.loadImage=function(href,cb) {
		
		var pImage = {
			img:null,
			src:href,
			init:function() {
				var self = this;
				this.img = new Image();
				this.img.src=this.src;
				this.img.addEventListener("load",function(){
					self.width=self.img.width;
					self.height=self.img.height;
					if(typeof cb == "function"){cb(self);}
				},false);
			},
			height:0,
			width:0
		}
		
		pImage.init();
		
		return pImage;
		
	}
	
	//make an arc with lily message
	this.inlet1["arc"]=function(params) {

		var x 		= params.split(" ")[0]; //left
		var y 		= params.split(" ")[1]; //top
		var w 		= params.split(" ")[2]||null; //top			
		var h 		= params.split(" ")[3]||null; //left
		var start 	= params.split(" ")[4]||null; //top			
		var stop 	= params.split(" ")[5]||null; //left					
		
		thisPtr.arc(x, y, w, h, start, stop);
		
	}	
	
    this.arc=function(x, y, w, h, start, stop) {
	
		var radiusx = w/2; //get radius from w
		var radiusy = h/2; //get radius from h
		var centerx = x;   //The screen x-origin: 
		var centery = y;   //The screen y-origin:
		 
		//p2c
		var startx = (thisPtr.cos(start) * radiusx + centerx);	//arc begins here
		var starty = (thisPtr.sin(start) * radiusy + centery);	//arc begins here

		//calculate flags
		var arc = (stop-start>thisPtr.PI)?1:0; //calculate the large-arc-flag
		var flag = ((stop-start)>0)?1:0; //calculate the sweep-flag
		
		//p2c
	    var endx = (thisPtr.cos(stop) * radiusx + centerx); //calculate the end point
	    var endy = (thisPtr.sin(stop) * radiusy + centery); //calculate the end point
	
		//put it together...
		if(fillColor!="none")
			var path = 'M'+ centerx + ',' + centery +  ' L' + (startx)+','+ (starty) +' A' + (radiusx) + ',' + (radiusy) + ' ' + 0 + ' ' + arc + ',' + flag + ' ' + (endx)+','+(endy) +" z";	
		else
			var path = 'M'+ (startx) + ',' + (starty) +' A' + (radiusx) + ',' + (radiusy) + ' ' + 0 + ' ' + arc + ',' + flag + ' ' + (endx)+','+(endy);
	
		//println(path);
	
		//build the element
		var arc = thisPtr.document.createElementNS(SVGNS, "path");
		
		arc.setAttributeNS(null,"d",path);				
		arc.setAttributeNS(null,"transform",matrixStack.getTransformText());
		
		arc.setAttributeNS(null,"fill",fillColor);
		arc.setAttributeNS(null,"fill-opacity",fillOpacity);		

		arc.setAttributeNS(null,"stroke",strokeColor);
		arc.setAttributeNS(null,"stroke-width",strokeWidth);
		arc.setAttributeNS(null,"stroke-opacity",_strokeOpacity);			
		
		return canvas.appendChild(arc);	
	
	}
	
	//make an bezier curve with lily message
	this.inlet1["bezier"]=function(params) {

		var x1 	= params.split(" ")[0]; //1st anchor x
		var y1 	= params.split(" ")[1]; //1st anchor y
		var cx1 = params.split(" ")[2]; //1st control x
		var cy1 = params.split(" ")[3]||null; //1st control y			
		var cx2 = params.split(" ")[0]; //2nd control x
		var cy2 = params.split(" ")[1]; //2nd control y
		var x2 	= params.split(" ")[2]; //2nd anchor x
		var y2 	= params.split(" ")[3]||null; //2nd anchor x			
			
		thisPtr.bezier(x1,y1,cx1,cy1,cx2,cy2,x2,y2);
		
	}	
	
	this.bezier=function(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {

		var bezier = thisPtr.document.createElementNS(SVGNS, "path");
		
		bezier.setAttributeNS(null,"d",("M "+x1+","+y1+" "+"C "+cx1+","+cy1+" "+cx2+","+cy2+" "+x2+","+y2));				
		bezier.setAttributeNS(null,"transform",matrixStack.getTransformText());
		
		bezier.setAttributeNS(null,"fill",fillColor);
		bezier.setAttributeNS(null,"fill-opacity",fillOpacity);		

		bezier.setAttributeNS(null,"stroke",strokeColor);
		bezier.setAttributeNS(null,"stroke-width",strokeWidth);
		bezier.setAttributeNS(null,"stroke-opacity",_strokeOpacity);			
		
		return canvas.appendChild(bezier);

	}
	
	//note- Catmull-Rom based curveVertex() & curve() not implemented.
	
	//begin vertex functions

	this.beginShape=function() { 
		drawingPath=true;
	}
	
	this.vertex=function(x,y) {
		var cmd = (!currPath)?"M ":"L ";
		if(drawingPath) {
			currPath += cmd+x+","+y+" ";
		} 
	}
	
	this.bezierVertex=function(cx1,cy1,cx2,cy2,x,y) {
		if(drawingPath) {
			currPath += "C "+cx1+","+cy1+","+cx2+","+cy2+","+x+","+y+" ";
		} 
	}	
	
	this.endShape=function(close) {
		var mode = close||null;
		_createVertex(mode);
		drawingPath=false;			
	}
	
	function _processPathAttributes(close) {
		var attr = currPath;		
		var closed = (close=="CLOSE"||fillColor!="none")?" Z":"";
		var str = currPath+closed;
		currPath = "";
		return str;
	}
	
	function _createVertex(close) {
		
		var vertex = thisPtr.document.createElementNS(SVGNS,"path");
		
		vertex.setAttributeNS(null,"d",_processPathAttributes(close));
				
		vertex.setAttributeNS(null,"transform",matrixStack.getTransformText());

		vertex.setAttributeNS(null,"fill",fillColor);
		vertex.setAttributeNS(null,"fill-opacity",fillOpacity);	

		vertex.setAttributeNS(null,"stroke",strokeColor);
		vertex.setAttributeNS(null,"stroke-width",strokeWidth);
		vertex.setAttributeNS(null,"stroke-opacity",_strokeOpacity);			

		return canvas.appendChild(vertex);
		
	}
		
	//end vertex functions
		
	//make a point
	this.inlet1["point"]=function(params) {

		var x = params.split(" ")[0]; //left
		var y = params.split(" ")[1]; //top
		
		thisPtr.point(x,y);
		
	}
	
	//
	this.point=function(x,y) {
		
		//using rect to create the 1X1 pixel point
		var point = thisPtr.document.createElementNS(SVGNS, "rect");
		point.setAttributeNS(null,"x",x);
		point.setAttributeNS(null,"y",y);
		point.setAttributeNS(null,"width",1);
		point.setAttributeNS(null,"height",1);
		
		matrixStack.set("rotateX",x);
		matrixStack.set("rotateY",y);				
		point.setAttributeNS(null,"transform",matrixStack.getTransformText());		
		
		point.setAttributeNS(null,"stroke",strokeColor);
		point.setAttributeNS(null,"stroke-width",strokeWidth);
		point.setAttributeNS(null,"stroke-opacity",_strokeOpacity);			
		
		return canvas.appendChild(point);
			
	}
	
	//make a triangle
	this.inlet1["triangle"]=function(params) {

		var x1 = params.split(" ")[0]; //point1
		var y1 = params.split(" ")[1]; //point1
		var x2 = params.split(" ")[2]; //point2		
		var y2 = params.split(" ")[3]; //point2
		var x3 = params.split(" ")[4]; //point3		
		var y3 = params.split(" ")[5]; //point3		
		
		thisPtr.triangle(x1,y1,x2,y2,x3,y3);
		
	}
	
	//
	this.triangle=function(x1,y1,x2,y2,x3,y3) {
		
		var triangle = thisPtr.document.createElementNS(SVGNS, "polygon");
		
		var points = x1+" "+y1+","+x2+" "+y2+","+x3+" "+y3;	
		triangle.setAttributeNS(null,"points",points);
					
		triangle.setAttributeNS(null,"transform",matrixStack.getTransformText());				
		
		triangle.setAttributeNS(null,"fill",fillColor);
		triangle.setAttributeNS(null,"fill-opacity",fillOpacity);			
		
		triangle.setAttributeNS(null,"stroke",strokeColor);
		triangle.setAttributeNS(null,"stroke-opacity",_strokeOpacity);
		
		return canvas.appendChild(triangle);
			
	}
	
	//make a quad
	this.inlet1["quad"]=function(params) {

		var x1 = params.split(" ")[0]; //point1
		var y1 = params.split(" ")[1]; //point1
		var x2 = params.split(" ")[2]; //point2		
		var y2 = params.split(" ")[3]; //point2
		var x3 = params.split(" ")[4]; //point3		
		var y3 = params.split(" ")[5]; //point3
		var x4 = params.split(" ")[6]; //point4		
		var y4 = params.split(" ")[7]; //point4				
		
		thisPtr.quad(x1,y1,x2,y2,x3,y3,x4,y4);
		
	}
	
	//
	this.quad=function(x1,y1,x2,y2,x3,y3,x4,y4) {
		
		var quad = thisPtr.document.createElementNS(SVGNS, "polygon");
		
		var points = x1+" "+y1+","+x2+" "+y2+","+x3+" "+y3+","+x4+" "+y4;	
		quad.setAttributeNS(null,"points",points);
		
		matrixStack.set("rotateX",x1);
		matrixStack.set("rotateY",y1);				
		quad.setAttributeNS(null,"transform",matrixStack.getTransformText());				
		
		quad.setAttributeNS(null,"fill",fillColor);
		quad.setAttributeNS(null,"fill-opacity",fillOpacity);		
		
		quad.setAttributeNS(null,"stroke",strokeColor);
		quad.setAttributeNS(null,"stroke-opacity",_strokeOpacity);
		
		return canvas.appendChild(quad);
			
	}
	
	//make a circle
	this.inlet1["circle"]=function(params) {

		var x = params.split(" ")[0]; //center left
		var y = params.split(" ")[1]; //center top
		var r = params.split(" ")[2]; //radius
		
		currElement = thisPtr.circle(x,y,r);
	}
	
	//not in the processing api
	this.circle=function(x,y,r) {
		
		var circ = thisPtr.document.createElementNS(SVGNS, "circle");
		circ.setAttributeNS(null,"cx",x);
		circ.setAttributeNS(null,"cy",y);
		circ.setAttributeNS(null,"r",r);
							
		circ.setAttributeNS(null,"transform",matrixStack.getTransformText());		
		
		circ.setAttributeNS(null,"fill",fillColor);
		circ.setAttributeNS(null,"fill-opacity",fillOpacity);		
		
		circ.setAttributeNS(null,"stroke",strokeColor);
		circ.setAttributeNS(null,"stroke-width",strokeWidth);
		circ.setAttributeNS(null,"stroke-opacity",_strokeOpacity);
		
		return canvas.appendChild(circ);
							
	}	
	
	/*
		END SHAPE METHODS
	*/	
	
	/* START UTILITIES */
	
	this.TWO_PI = 6.28318530717958647693;
	this.HALF_PI = 1.57079632679489661923;
	this.PI = 3.14159265358979323846;
	
	this.map=function(val,min,max,newMin,newMax) {
		return LilyUtils.map(min,max,newMin,newMax,val);
	}
	
	this.random=function(num1,num2) {
		
		var max=(num2)?num2:num1;
		var min=(num2)?num1:0;
		var ran = Math.random();
		return LilyUtils.map(0,1,min,max,ran);
		
	}
	
	this.constrain=function(value,min,max) {
		if(value>max)
			return max;
		else if(value<min)
			return min;
		else
			return value;
	}
	
	this.int=function(num) {
		return parseInt(num);
	}
	
	this.float=function(num) {
		return parseFloat(num);
	}	
	
	this.tan=function(angle) {
		return Math.tan(angle);
	}
	
	this.atan2=function(y,x) {
	   return Math.atan2(y,x);
	}
	
	this.cos=function(angle) {
		return Math.cos(angle);
	}
	
	this.sin=function(angle) {
		return Math.sin(angle);
	}
	
	this.abs=function(num) {
		return Math.abs(num);
	}
	
	this.sqrt=function(num) {
		return Math.sqrt(num);
	}
	
	this.sq=function(num) {
		return (num*num);
	}
	
	this.min=function() {
		if(arguments.length==1 && typeof arguments[0]=="object") {
			return arguments[0].sort(function(a, b){return a - b;})[0];	
		} else if(arguments.length==2) {
			return (arguments[0]<arguments[1])?arguments[0]:arguments[1];
		} else if(arguments.length==3) {
			return arr.sort(function(a, b){return a - b;})[0];
		}	
	}
	
	this.max=function() {
		if(arguments.length==1 && typeof arguments[0]=="object") {
			return arguments[0].sort(function(a, b){return a - b;})[arguments[0].length-1];	
		} else if(arguments.length==2) {
			return (arguments[0]>arguments[1])?arguments[0]:arguments[1];
		} else if(arguments.length==3) {
			var arr = [arguments[0],arguments[1],arguments[2]];
			return arr.sort(function(a, b){return a - b;})[arr.length-1];
		}
	}
	
	this.round=function(num) {
		return Math.round(num);
	}
	
	this.floor=function(num) {
		return Math.floor(num);
	}
	
	this.ceil=function(num) {
		return Math.ceil(num);
	}		
	
	this.dist=function(x1,y1,x2,y2) {
		return LilyUtils.distance(x1,y1,x2,y2);
	}
	
	this.second=function() {
		return new Date().getSeconds();
	}
	
	this.minute=function() {
		return new Date().getMinutes();
	}
	
	this.hour=function() {
		return new Date().getHours();
	}	
	
	//get ms since object created
	this.millis=function() {
		return Date.now() - startTime;
	}	
	
	//from Java- including it here as a convenience
	this.Point=function(xCoord,yCoord) {
		this.x=xCoord;
		this.y=yCoord;
	}
	
	this.HashMap=function() {
		var hash = {};

		this.put=function(key,value) {
			hash[key]=value;
		}

		this.get=function(key) {
			return hash[key];
		}

		this.remove=function(key) {
			delete hash[key];
		}
	}

	this.ArrayList=function() {
		var arr = [];

		this.size=function() {
			return arr.length;
		}

		this.clear=function() {
			arr=[];
		}

		this.get=function(index) {
			if(typeof arr[index] != "undefined") return arr[index];
		}

		this.set=function(index, element) {
			if(arr.length > index) arr.splice(index,1,element);
		}

		this.add=function(element) {
			arr.push(element);
		}

		this.remove=function(index) {
			if(arr.length > index) arr.splice(index,1);	
		}
		
		this.toArray=function() {
			return arr;
		}
	}
			
	/* END UTILITIES */	
	
	//wrap the svg element in a div in order to be able to set the background color
	var svg = "<div id=\""+ this.createElID("svgCanvasBG") +"\"><svg style=\"fill:none\" id=\""+ this.createElID("svgCanvas") +"\" xmlns=\"http://www.w3.org/2000/svg\" width=\"150px\" height=\"150px\"></svg></div>";

	this.controller.setNoBorders(true);	

	//custom html
	this.ui=new LilyObjectView(this,svg);
	this.ui.draw();	
	
	this.displayElement=thisPtr.ui.getElByID(thisPtr.createElID("svgCanvas"));
	this.resizeElement=thisPtr.ui.getElByID(thisPtr.createElID("svgCanvas"));
	var canvas = this.displayElement;	
	var canvasBackground=thisPtr.ui.getElByID(thisPtr.createElID("svgCanvasBG"));
	var canvasID = thisPtr.createElID("svgCanvas");
	
	//set the width/height variables on resize.
	this.controller.objResizeControl.cb=function(h,w) {
		thisPtr.height = parseInt(h);
		thisPtr.width = parseInt(w);			
	}
	
	function loadFunc() {
		thisPtr.height = parseInt(thisPtr.height);
		thisPtr.width = parseInt(thisPtr.width);
	}

	this.init=function() {
		//on initial object creation this sets the height & width to the default values defined in the svg element.
		thisPtr.height = parseInt(thisPtr.displayElement.getAttribute("height"));
		thisPtr.width = parseInt(thisPtr.displayElement.getAttribute("width"));
		//when opening a patch this sets the size...
		thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"patchLoaded",loadFunc,"all");
		
		//mouse events
		thisPtr.controller.attachObserver(thisPtr.createElID("svgCanvas"),"mousedown",_mouseDown,"performance");
		thisPtr.controller.attachObserver(thisPtr.createElID("svgCanvas"),"mouseup",_mouseUp,"performance");		
		thisPtr.controller.attachObserver(thisPtr.createElID("svgCanvas"),"mousemove",_mouseMoved,"performance");
		
		//keyboard events
		this.controller.patchView.xulWin.addEventListener("keypress",_keyPressed,false);
		this.controller.patchView.xulWin.addEventListener("keyup",_keyReleased,false);	
		
		//record start time
		startTime = Date.now();			
	}
	
	//remove the listeners
	function releaseObservers() {
		//when opening a patch this sets the size...
		thisPtr.controller.patchController.removePatchObserver(thisPtr.objID,"patchLoaded",loadFunc,"all");
		
		//mouse events
		thisPtr.controller.removeObserver(thisPtr.createElID("svgCanvas"),"mousedown",_mouseDown,"performance");
		thisPtr.controller.removeObserver(thisPtr.createElID("svgCanvas"),"mouseup",_mouseUp,"performance");		
		thisPtr.controller.removeObserver(thisPtr.createElID("svgCanvas"),"mousemove",_mouseMoved,"performance");
		
		//keyboard events
		thisPtr.controller.patchView.xulWin.removeEventListener("keypress",_keyPressed,false);
		thisPtr.controller.patchView.xulWin.removeEventListener("keyup",_keyReleased,false);	
	}

	//create an initial context.
	matrixStack.init();
	
	//object args width & height
	var argsArr = args.split(" ");
	if(argsArr.length==2) thisPtr.size.apply(thisPtr,argsArr);	
		
	return this;
}

var $svgMetaData = {
	textName:"svg",
	htmlName:"svg",
	objectCategory:"Graphics",
	objectSummary:"Display graphics or animation in a patch.",
	objectArguments:""	
}