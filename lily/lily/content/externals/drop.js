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
*	Construct a new drop object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $drop()
{
	var thisPtr=this;
	this.allowFont=false; //dont allow font changes	
	
	this.outlet1 = new this.outletClass("outlet1",this,"path to the dropped file");
	this.outlet2 = new this.outletClass("outlet2",this,"contents of the dropped file");	
	
	function dndCallBack(data) {
		thisPtr.outlet2.doOutlet(data[1]);						
		thisPtr.outlet1.doOutlet(data[0]);
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
	this.ui=new LilyObjectView(this,"<div style=\"width:100px;height:100px;\" id=\""+ this.createElID("drop") +"\"></div>");
	this.ui.draw();
	
	this.controller.attachObserver(this.createElID("drop"),"dragdrop",ondrop,"performance");
	this.controller.attachObserver(this.createElID("drop"),"dragenter",onenter,"performance");
	this.controller.attachObserver(this.createElID("drop"),"dragexit",onexit,"performance");			
	this.displayElement=this.ui.getElByID(thisPtr.createElID("drop"));
	this.setColor("transparent",true);	
	
	return this;
}

var $dropMetaData = {
	textName:"drop",
	htmlName:"drop",
	objectCategory:"System",
	objectSummary:"Get a file\'s path or contents by dropping it."
}