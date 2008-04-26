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
*	Construct a new link object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $link(txt) {
	var thisPtr=this;
	var linkID=this.createElID("link");
	
	this.fontColor="blue"; //override the default color
	
	this.linkText=(txt.length)?txt:""; //label text
	
	if(!this.linkText.length) {
		LilyDebugWindow.error("the link object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("link");		
		return;
	}	
	
	this.setInspectorConfig([
		{name:"linkText",value:thisPtr.linkText,label:"Link Text",type:"string",input:"textarea"}
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+vals["linkText"];
		
		this.displayElement.href=vals["linkText"];
		setLinkText(vals["linkText"]);	

	}	
	
	this.controller.setNoBorders(true);

	this.inlet1=new this.inletClass("inlet1",this,"set sets link value");
	this.outlet1 = new this.outletClass("outlet1",this,"outputs value on click");
	
	//define message handler
	this.inlet1["set"]=function(msg) {
		thisPtr.linkText=msg||"link";
		setLinkText(msg);	
	}
	
	this.inlet1["anything"]=function(msg) {
		thisPtr.linkText=msg||"link";
		setLinkText(msg);	
	}	
	
	//helper
	function setLinkText(msg) {
		thisPtr.ui.getElByID(linkID).innerHTML=LilyUtils.makeSafe(msg);
		setTimeout(function(){thisPtr.objectMoved();},100);
	}		
	
	//event handlers
	function mouseDownFunc() {
		thisPtr.ui.getElByID(linkID).style.color="red";	
	}
	
	function mouseUpFunc() {
		thisPtr.ui.getElByID(linkID).style.color="blue";	
	}	
	
	function clickFunc(e) {
		thisPtr.outlet1.doOutlet(thisPtr.linkText);	
		e.preventDefault();	
	}	
		
	//custom html
	this.ui=new LilyObjectView(this,'<div style="padding:3px"><a href="#" style="white-space:nowrap;color:blue;text-decoration:underline;cursor:pointer" onclick="event.preventDefault();" id="'+linkID+'"></a></div>');
	this.ui.draw();
	this.displayElement=thisPtr.ui.getElByID(linkID);
	setLinkText(this.linkText);	
	
	//attach event listeners
	this.controller.attachObserver(linkID,"click",clickFunc,"performance");
	this.controller.attachObserver(linkID,"mousedown",mouseDownFunc,"performance");
	this.controller.attachObserver(linkID,"mouseup",mouseUpFunc,"performance");		
	
	return this;
}

var $linkMetaData = {
	textName:"link",
	htmlName:"link",
	objectCategory:"UI",
	objectSummary:"Output messages using an HTML link.",
	objectArguments:"[text to link]"
}