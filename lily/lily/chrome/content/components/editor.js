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
	Script: editor.js
		Contains LilyComponents.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/

if(!LilyComponents) {
	var LilyComponents = {};
}

/*
	Constructor: _editor
		create a new editor instance.

	Arguments: 
		context - parent context.
		parEl - parent element to display text.
		defaultContent - default content
		saveFunc - callback.
	
	Returns: 
		returns editor instance.
*/
LilyComponents._editor=function(context,container,content,setFunc,getFunc,renderHTML) {
	
	var thisPtr=this;
	var parent=context; //pass in object context
	var containerEl=container; //parent element whose content we are editing
	var defaultContent=content||""; //default content to use when there is no content.
	var editEnd = setFunc||null; //set parent args after editing
	var editStart = getFunc||null; //get parent args to edit
	var displayHTML = (typeof renderHTML == "undefined")?true:renderHTML; //display html
	var win=parent.controller.win; //window where this is taking place.
	var charSize = LilyUtils.getAverageCharSize(win);
	var containerWidth=null;
	this.editState=false;
		
	var editHTML="<textarea cols=\"10\" rows=\"1\" style=\"border-width:0px;padding:0px;margin:0px;font-family:" + parent.parent.fontFamily + ";font-size:" + parent.parent.fontSize + "px\" autocomplete=\"off\" id=\""+ parent.createElID("_editor") +"\"></textarea>";
	
	this.startEdit=function() {
		if(!thisPtr.editState) { //if we're not already editing
			
			containerWidth=parent.ui.getActualWidth(); //give it a little padding...
			var charsInLine = Math.ceil(containerWidth/charSize);
			
			parent.controller.patchController.removePatchObserver(parent.objID,"deleteKey",function(){parent.parent.deleteObject(parent.objID)},"select");		

			parent.controller.objResizeControl.clearSize();						

			containerEl.innerHTML=editHTML;
			parent.ui.getElByID(parent.createElID("_editor")).cols = charsInLine;
			
			parent.ui.getElByID(parent.createElID("_editor")).value=thisPtr.html2String(editStart());
			parent.controller.attachObserver(parent.objID,"keyup",resizeTextArea,"edit");
			parent.controller.attachObserver(parent.objID,"click",resizeTextArea,"edit");
			resizeTextArea();		
			parent.ui.getElByID(parent.createElID("_editor")).focus();
			parent.ui.getElByID(parent.createElID("_editor")).select();
			parent.controller.removeObserver(parent.objID,"mousedown",LilyUtils.preventDefault,"edit");
			thisPtr.editState=true;
			parent.controller.patchController.setPatchEdit(true);
		}
	}
	
	this.endEdit=function() {
		
		if(parent.ui.getElByID(parent.createElID("_editor"))) {

			parent.controller.removeObserver(parent.objID,"keyup",resizeTextArea,"edit");
			parent.controller.removeObserver(parent.objID,"click",resizeTextArea,"edit");						
			
			var txt=parent.ui.getElByID(parent.createElID("_editor")).value;

			if(txt) //if there's text
				containerEl.innerHTML=(displayHTML)?thisPtr.makeSafe(txt):thisPtr.string2HTML(txt);
			else
				containerEl.innerHTML=defaultContent;	//parent.ui.getElByID(parent.createElID("_editor")).blur();

			//constrain the width to the original size
			if(containerWidth>=100)		
				parent.setWidth(containerWidth);
				
			parent.controller.attachObserver(parent.objID,"mousedown",LilyUtils.preventDefault,"edit");				

			//update the object dimensions
			parent.ui.updateObjSize();
			parent.controller.objResizeControl.resetSize();						

			editEnd(txt);
			thisPtr.editState=false;
			parent.controller.patchController.setPatchEdit(false);			
		}
	}

	//replace <br> with new lines
	this.html2String=function(string) {
		return LilyUtils.html2String(string);
	}

	//replace new lines with <br>
	this.string2HTML=function(string) {
		return LilyUtils.string2HTML(string);
	}
	
	//make safe for insertion into dom
	this.makeSafe=function(string) {
		return LilyUtils.makeSafe(string);
	}
	
	//onchange/onclick handler
	function resizeTextArea() {

		var textArea=parent.ui.getElByID(parent.createElID("_editor"));
		var valueArr=textArea.value.split("\n");
		var wordArr=textArea.value.split(" ");
		var tmp=0;
		
		//exapnd horizontally
		for(var j=0;j<wordArr.length;j++)
			if(wordArr[j].length>textArea.cols)
				textArea.cols=wordArr[j].length;

		//expand vertically
		for (var i=0;i<valueArr.length;i++) {
		 	if (valueArr[i].length >= textArea.cols)
				tmp+= Math.floor(valueArr[i].length/textArea.cols);
		}

		tmp+= valueArr.length;

		if (tmp>textArea.rows)
			parent.ui.getElByID(parent.createElID("_editor")).rows = tmp-1;

//		thisPtr.controller.cleanupOutletConnections();			
	}
}