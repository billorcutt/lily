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

/*
	Script: iframe.js
		Contains LilyComponents.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/	

/*				
	Class: LilyComponents
		Components.
*/

if(!LilyComponents) {
	var LilyComponents = {};
}

/*
	Constructor: _iframe
		create a new iframe instance.

	Arguments: 
		context - execution context (required)
		source - html source. (optional)
		height - iframe height (optional)
		width - iframe width (optional)
		scrolling - "yes"/"no"/"auto" - scrolling. (optional)
		function - onload callback (optional)
	
	Returns: 
		returns iframe instance.
*/
LilyComponents._iframe=function(context,source,height,width,scrolling,callback)
{
	var parent=context;
	var thisPtr=this;
	var h=height||200;
	var w=width||200;
	var scroll=scrolling||"auto";
	var cb=callback||null;
	
	//public handle for the html node
	this.objFrame=null;
	
	//need a div over the iframe to capture mouse events
	var frameCover=null;	
	
	//src for the iframe
	var src=processURL(source);
	
	//pass the calling context a ref to the view
	parent.ui=new LilyObjectView(parent,'<div style="height:100%" id="'+parent.createElID("iframe_wrapper")+'"><iframe src="'+src+'" scrolling="'+ scroll +'" id="'+parent.createElID("iframe")+'" style="height:100%;width:100%;margin:0px;border:0px;padding:0px;visibility:hidden"></iframe></div>');
	parent.ui.draw();
				
	//bang on load
	function frameInit() {
		thisPtr.objFrame.removeEventListener("load",frameInit,true);
		thisPtr.objFrame.style.visibility="visible"; //for the initial load
		frameCover.style.height=(parent.height+5)+"px"; //size the cover to fit
		frameCover.style.width=(parent.width+5)+"px";
		if(typeof cb == "function") { cb(); } //do the callback
	}
	
	//pass thru clicks to the object
	function select(e) {
		e.preventDefault();
		parent.controller.select(e);
		return false;
	}
	
	function click(e) {
		parent.openHelpWindow(e);
		return false;		
	}
	
	function toggleEditabilityFunc() {
		var editMode=parent.controller.patchController.getEditable();
		if(editMode=="performance")	{
			frameCover.style.visibility="hidden";
			frameCover.style.zIndex=-9999;
		} else {
			frameCover.style.visibility="visible";
			//frameCover.style.backgroundColor='red';				
			//frameCover.style.zIndex=9999;
			frameCover.style.zIndex=parent.zIndex+1;
		}
	}
	
	function processURL(url) {
		
		//if there's a protocol, we're done...
		if(LilyUtils.containsProtocol(url))
			return url;	
			
		//otherwise look for it in the file system.
		var path = LilyUtils.getFilePath(url);	
			
		if(path) 
			return encodeURI("file://"+path);
		else
			return "chrome://lily/content/blank.html";
		
	}	
	
	//clean up when the object is deleted
	function destroy() {
		parent.parent.patchView.removeElement(frameCover);
	}
	
	//callback to object drag
	parent.controller.objDrag.cb=function(x,y) {
		frameCover.style.left=x+"px";
		frameCover.style.top=(y+5)+"px";
	}	
	
	//callback to resize
	parent.controller.objResizeControl.cb=function(height,width) {
		frameCover.style.height=(height+5)+"px";
		frameCover.style.width=(width+5)+"px";
	}	
	
	this.objFrame=parent.ui.getElByID(parent.createElID("iframe"));
	this.objFrame.addEventListener("load",frameInit,true);	
	
	this.reload=function() {
		this.objFrame.addEventListener("load",frameInit,true);
		thisPtr.objFrame.src=src;		
	}
	
	this.resize=function(w,h) {
		parent.setHeight(h);
		parent.setWidth(w);
		frameCover.style.height=(h+5)+"px";
		frameCover.style.width=(w+5)+"px";		
	}
	
	//set the object size
	if(h)
		parent.setHeight(h);
	
	if(w)
		parent.setWidth(w);	
	
	//init the div over the iframe
	frameCover=parent.parent.patchView.displayHTML("");
	frameCover.id=parent.createElID("frameCover");
//	frameCover.style.backgroundColor='red';	 //debug
	frameCover.style.position='absolute';
	frameCover.style.left=(parent.left)+"px";
	frameCover.style.top=(parent.top+5)+"px";
	frameCover.style.zIndex=parent.zIndex+1; //this is a problem- needs to be tied to the zindex of the object
	
	this.wrapper = parent.ui.getElByID(parent.createElID("iframe_wrapper"));
	
	//try to set this
	parent["frameCover"]=frameCover;
	
	//capture mousedowns over the iframe
	parent.controller.attachObserver(parent.createElID("frameCover"),"mousedown",select,"edit");

	//capture mousedowns over the iframe
	parent.controller.attachObserver(parent.createElID("frameCover"),"click",click,"edit");
	
	//cleanup when object is deleted.	
	parent.controller.attachObserver(parent.objID,"destroy",destroy,"edit");	
	
	//add listeners to handle changes in patch editability
	parent.controller.patchController.attachPatchObserver(parent.objID,"editabilityChange",toggleEditabilityFunc,"all");
	
	//a hack to return focus to the window
	//FIXME *** commenting this out, since it suddenly started causing problems
	//uncommenting this out now to see if it works in FF3
	parent.parent.patchView.oWin.addEventListener("blur",function(event){setTimeout(function(){ if((parent.parent.patchController&&!parent.parent.patchController.editing) && LilyApp.getCurrentPatch().patchID==parent.parent.patchID){thisPtr.objFrame.blur();}},0);},false);
	
	return this;
}