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
*	Construct a new check object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $check()
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"bang toggles checkbox");	
	this.outlet1 = new this.outletClass("outlet1",this,"checked state as boolean");
	var checkEl=null;

	this.resize=false; //not resizable

	this.allowFont=false; //dont allow font changes	

	function clickFunc()	{
			if(checkEl.checked)
				thisPtr.outlet1.doOutlet(true);
			else
				thisPtr.outlet1.doOutlet(false);			
	}
	
	this.inlet1["bang"]=function() {
		if(checkEl.checked) {
			checkEl.removeAttribute("checked");
			thisPtr.outlet1.doOutlet(false);
		} else {
			checkEl.setAttribute("checked","checked");
			thisPtr.outlet1.doOutlet(true);
		}	
	}
	
	this.inlet1["bool"]=function(msg) {
		if(msg) {
			checkEl.setAttribute("checked","checked");
			thisPtr.outlet1.doOutlet(true);
		} else {
			checkEl.removeAttribute("checked");
			thisPtr.outlet1.doOutlet(false);
		}
	}
	
	this.inlet1["num"]=function(val) {
		if(val) {
			checkEl.setAttribute("checked","checked");
			thisPtr.outlet1.doOutlet(true);
		} else {
			checkEl.removeAttribute("checked");
			thisPtr.outlet1.doOutlet(false);
		}
	}
		
	//custom html
	this.ui=new LilyObjectView(this,"<input style=\"width:10px;height:10px\" id=\""+ this.createElID("checkbox") +"\" type=\"checkbox\"/>");
	this.ui.draw();
	checkEl=this.ui.getElByID(thisPtr.createElID("checkbox"));	
	this.controller.attachObserver(this.createElID("checkbox"),"click",clickFunc,"performance");
	this.controller.attachObserver(this.createElID("checkbox"),"click",LilyUtils.preventDefault,"edit");
	
	//element to be resized
	this.resizeElement=checkEl;
		
	//hack to set initial size- will be overwritten if there's a saved size.
	this.height=10;
	this.width=10;	
		
	return this;
}

var $checkMetaData = {
	textName:"check",
	htmlName:"check",
	objectCategory:"Interaction",
	objectSummary:"Output true & false messages by clicking a checkbox.",
	objectArguments:""
}