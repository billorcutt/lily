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
*	Construct a new text object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $comment(args)
{
	var thisPtr=this;
	this.args=args||""; //text to be displayed/output
	this.commentText=args||"";
	
	this.color="transparent";
	
	function setArgs(str) {
		thisPtr.args=str; 
		thisPtr.commentText=str;
		thisPtr.updateInspectorConfig({commentText:thisPtr.commentText});
	}
	
	function getArgs(str) {
		return thisPtr.commentText;	
	}	
	
	function spacer() {
		var arr = LilyUtils.getDefaultFont();
		return html = "<img width=\"48\" height=\""+arr[1]+"\" src=\"chrome://lily/content/images/glass.gif\"/>";
	}
	
	function insertContent(txt) {
		thisPtr.ui.getElByID(thisPtr.createElID("comment")).innerHTML=(txt)?LilyUtils.makeSafe(txt):spacer(); //set the value here	
	}
	
	//set the comment value
	this.setComment=function(msg) {
		setArgs(msg);//new message
		insertContent(thisPtr.commentText);		
	}			
		
	//html strings
	var messageHTML="<div style=\"text-align:left;padding:0px\" id=\""+ this.createElID("comment") +"\" ></div>";

	this.ui=new LilyObjectView(this,messageHTML);
	this.ui.draw();
	insertContent(this.commentText);

	thisPtr.ui.contentWrapper.style.width="100%";	
	thisPtr.ui.contentWrapper.style.padding="3px";
	thisPtr.ui.contentWrapper.style.margin="0px"; 
	this.displayElement=thisPtr.ui.contentWrapper

	var editor=new LilyComponents._editor(this,this.ui.getElByID(thisPtr.createElID("comment")),spacer(),setArgs,getArgs,true); //widget that will handle editing...

	this.controller.attachObserver(this.createElID("comment"),"dblclick",editor.startEdit,"edit");	
	this.controller.attachObserver(this.objID,"deselect",editor.endEdit,"edit");
	this.controller.setNoBorders(true);
	
//	LilyDebugWindow.print(_thisObjectSourceCode);
	
	this.setInspectorConfig([
		{name:"commentText",value:thisPtr.commentText,label:"Comment Text",type:"string",input:"textarea"},		
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		thisPtr.args=""+vals["commentText"];
		thisPtr.commentText=vals["commentText"];
		insertContent(vals["commentText"]);

	}
	
	return this; //return the instance
}

var $commentMetaData = {
	textName:"comment",
	htmlName:"comment",
	objectCategory:"UI",
	objectSummary:"Display text in a patch.",
	objectArguments:"comment to display"
}