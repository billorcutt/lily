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
*	Construct a new processing object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $processing(args) //args width/height
{

	var thisPtr=this;	
	
	//dont allow font changes	
	this.allowFont=false; 	
		
	//user supplied value- object sent to inlet is assigned here
	this.ENV = {};
	
	var proc = null;
	
	//the current script
	var currScriptPath 	= "";	
		
	//svg viewport
	//this overwrites
	this.width 			= 0;
	this.height 		= 0;
	
	function size(w,h) {
		thisPtr.width=parseInt(w);
		thisPtr.height=parseInt(h);
		
		thisPtr.setWidth(w);		
		thisPtr.setHeight(h);
	}	
		
	this.outlet1 = new this.outletClass("outlet1",this,"help text describing this outlet");
	this.inlet1=new this.inletClass("inlet1",this,"help text describing this inlet");
		
	this.sendMess=function(msg) {
		thisPtr.outlet1.doOutlet(msg);
	}
	
	this.set_obj_size=function(w,h) {
		size(w,h);
	}
	
	//store an object
	this.inlet1["obj"]=function(obj) {
		thisPtr.ENV=obj;
	}	
		
	//load a script
	this.inlet1["load"]=function(url) {
		currScriptPath=LilyUtils.getFilePath(url);			
	}
	
	//run a script
	this.inlet1["run"]=function() {
		var obj = LilyUtils.readFileFromPath(currScriptPath);
		proc = Processing(thisPtr.displayElement,obj.data);	
	}
	
	//stop the loop & refresh the object
	this.inlet1["refresh"]=function() {
		thisPtr.parent.replaceObject(thisPtr,"processing",(thisPtr.width+" "+thisPtr.height));
	}
	
	function kill() {
		if(proc) proc.kill_loop(); //added this method to the processing library so we can reload
	}
	
	this.destroy=function destroy() {
		kill();
	}	
			
	//wrap the svg element in a div in order to be able to set the background color
	var canvas = "<div id=\""+ this.createElID("processingCanvasBG") +"\"><canvas id=\""+ this.createElID("processingCanvas") +"\" width=\"150px\" height=\"150px\"></canvas></div>";

	this.controller.setNoBorders(true);	

	//custom html
	this.ui=new LilyObjectView(this,canvas);
	this.ui.draw();	
	
	this.displayElement=thisPtr.ui.getElByID(thisPtr.createElID("processingCanvas"));
	this.resizeElement=thisPtr.ui.getElByID(thisPtr.createElID("processingCanvas"));
	var canvas = this.displayElement;	
	var canvasBackground=thisPtr.ui.getElByID(thisPtr.createElID("processingCanvasBG"));
	var canvasID = thisPtr.createElID("processingCanvas");
	
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
		
		LilyUtils.loadScript("chrome://lily/content/lib/processing.js", this);
		Processing.lily = thisPtr;		
	}

	//object args width & height
	var argsArr = args.split(" ");
	if(argsArr.length==2) size.apply(thisPtr,argsArr);	
		
	return this;
}

var $processingMetaData = {
	textName:"processing",
	htmlName:"processing",
	objectCategory:"Graphics",
	objectSummary:"Display graphics or animation in a patch.",
	objectArguments:""	
}