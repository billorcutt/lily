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
*	Construct a new dropdown object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $dropdown()
{	
	var thisPtr=this;	
	var selectID=this.createElID("select");
	var node=null;
	var optValue=null
	
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs selected value. other methods: \"set\", \"select\", \"delete\", \"clear\" & \"length\"");
	this.inlet2=new this.inletClass("inlet2",this,"anything to become the value of the next menu item");

	this.outlet1 = new this.outletClass("outlet1",this,"selected value");
	this.outlet2 = new this.outletClass("outlet2",this,"length or selected index");		

	this.inlet1["set"]=function(opt) {
		
		//LilyDebugWindow.print("node len "+node.options.length)	
		
		var len=node.options.length;
		
		if(optValue) {
			var newOpt = thisPtr.document.importNode(new Option(opt,optValue),true);
			node.options[len]=newOpt;
		} else {
			var newOpt = thisPtr.document.importNode(new Option(opt,opt),true);
			node.options[len]=newOpt;			
		}
						
		optValue=null;	//once we've added the value, clear it.
	
	}
	
	this.inlet2["anything"]=function(val) {
		optValue=val;
	}
	
	this.inlet1["bang"]=function() {
		if(node.value) { thisPtr.outlet1.doOutlet(node.value);	}
	}
	
	this.inlet1["select"]=function(index) {
		node.selectedIndex=index;
		if(node.value) { thisPtr.outlet1.doOutlet(node.value); }
	}
	
	this.inlet1["delete"]=function(index) {
		node.options[index]=null;
	}
	
	this.inlet1["clear"]=function(index) {
		node.options.length=0;
	}	
	
	this.inlet1["length"]=function() {
		thisPtr.outlet2.doOutlet(node.options.length);
	}		
	
	function changeFunc() {
		if(node.value) {
			thisPtr.outlet1.doOutlet(node.value);
			thisPtr.outlet2.doOutlet(node.selectedIndex);	
		}
	}
	
	//custom html
	this.ui=new LilyObjectView(this,'<select style="width:100%;height:100%" id="'+ selectID +'"></select>');
	this.ui.draw();
	node=this.ui.getElByID(selectID); //save ref to node
	
	//element to be styled- setFont etc.
	this.displayElement=this.ui.getElByID(selectID);	
	
	//attach event listeners
	this.controller.attachObserver(selectID,"change",changeFunc,"performance");
//	this.controller.attachObserver(selectID,"mousedown",function(event){event.preventDefault();},"edit"); //moz bug prevents this from working
	
	return this;
}

var $dropdownMetaData = {
	textName:"dropdown",
	htmlName:"dropdown",
	objectCategory:"Interaction",
	objectSummary:"Store and send messages using an HTML select.",
	objectArguments:""
}