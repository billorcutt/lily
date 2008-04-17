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
*	Construct a new pic object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $pic(args)
{
		
	var thisPtr=this;
	var argsArr=(args)?LilyUtils.splitArgs(args):[];
	this.src = argsArr[0]||"chrome://lily/content/images/glass.gif";
	this.noBorders = (argsArr[1]&&(argsArr[1]=="false"))?false:true;
	this.bgSrc = argsArr[2]||"chrome://lily/content/images/glass.gif";
	this.cornerRoundness = argsArr[3]||0;
		
	this.setInspectorConfig([
		{name:"src",value:thisPtr.src,label:"Image Src",type:"string",input:"file"},
		{name:"noBorders",value:thisPtr.noBorders,label:"No Borders",type:"boolean",input:"checkbox"},
		{name:"bgSrc",value:thisPtr.bgSrc,label:"Background Image",type:"string",input:"file"},
		{name:"cornerRoundness",value:thisPtr.cornerRoundness,label:"% Corner Roundness",type:"number",input:"text"}			
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+LilyUtils.quoteString(vals["src"])+" "+vals["noBorders"]+" "+LilyUtils.quoteString(vals["bgSrc"])+" "+vals["cornerRoundness"];

		if(this.resizeElement){ this.resizeElement.src=processURL(vals["src"]); }
		if(this.resizeElement){ this.resizeElement.style.backgroundImage="url('"+processURL(vals["bgSrc"])+"')"; }
		if(this.resizeElement){ this.resizeElement.style.MozBorderRadius=vals["cornerRoundness"]+"%" }	
		setBorders(vals["noBorders"]);		
	}
	
	function processURL(url) {
		
		//if there's a protocol, we're done...
		if(LilyUtils.containsProtocol(url))
			return url;	
			
		//otherwise look for it in the file system.
		var path = LilyUtils.getFilePath(url);	
			
		if(path) 
			return "file://"+path;
		else
			return "chrome://lily/content/images/glass.gif";
		
	}
	
	//for external scripting
	this.setSrc=function(str) {
		if(thisPtr.resizeElement)thisPtr.resizeElement.src=processURL(str);
	}
	
	this.setBgSrc=function(str) {
		this.resizeElement.style.backgroundImage="url("+processURL(str)+")";
	}	
	
	//don't blow away the size if we're loading the 1 pixel gif.
	function setSize() {
		if(thisPtr.resizeElement.src!="chrome://lily/content/images/glass.gif")	{
			thisPtr.controller.objResizeControl.clearSize();		
			thisPtr.controller.objResizeControl.resetSize();	
		}	
	}
	
	function setBorders(b) {
		thisPtr.controller.setNoBorders(b);
	}
	
	function dndCallBack(data) {
		thisPtr.saveInspectorValues({src:"file://"+data[0],noBorders:thisPtr.noBorders,bgSrc:thisPtr.bgSrc,cornerRoundness:thisPtr.cornerRoundness});
		thisPtr.setInspectorConfig([
			{name:"src",value:thisPtr.src,label:"Image Src",type:"string",input:"file"},
			{name:"noBorders",value:true,label:"No Borders",type:"boolean",input:"checkbox"},
			{name:"bgSrc",value:thisPtr.bgSrc,label:"Background Image",type:"string",input:"text"},
			{name:"cornerRoundness",value:thisPtr.cornerRoundness,label:"% Corner Roundness",type:"number",input:"text"}		
		]);
	}

	var dndhandler = new LilyUtils.dragDropHandler(dndCallBack);

	//goes here dragDropHandler
	function ondrop(e) {
		nsDragAndDrop.drop(e,dndhandler);		
	}

	function onenter(e) {
		thisPtr.ui.selectObjView(e);
	}

	function onexit(e) {
		thisPtr.ui.deSelectObjView(e);	
	}	
	
	//custom html
	this.ui=new LilyObjectView(this,"<img onmousedown=\"return false\" id=\""+ this.createElID("pic") +"\" src=\""+ processURL(LilyUtils.stripLTQuotes(this.src)) +"\" style=\"-moz-border-radius:"+this.cornerRoundness+"%;width:100px;height:100px\;background-image:url(\'"+ processURL(LilyUtils.stripLTQuotes(this.bgSrc)) +"\');background-position: 2px 0px; background-repeat: repeat\"/>");
	this.ui.draw();
	this.controller.attachObserver(this.createElID("pic"),"dblclick",setSize,"edit");
	this.controller.attachObserver(this.createElID("pic"),"load",setSize,"edit");

	//element to be resized
	this.resizeElement=thisPtr.ui.getElByID(thisPtr.createElID("pic"));	
	this.controller.setNoBorders(thisPtr.noBorders);
	
	this.controller.attachObserver(this.createElID("pic"),"dragdrop",ondrop,"edit");
	this.controller.attachObserver(this.createElID("pic"),"dragenter",onenter,"edit");
	this.controller.attachObserver(this.createElID("pic"),"dragexit",onexit,"edit");	

	return this;
}

var $picMetaData = {
	textName:"pic",
	htmlName:"pic",
	objectCategory:"UI",
	objectSummary:"Display an image in a patch.",
	objectArguments:"image src, hide borders [true], background-image src"
}