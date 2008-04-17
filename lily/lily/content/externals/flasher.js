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
*	Construct a new button object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $flasher(args)
{
	var thisPtr=this;
	this.allowFont=false; //dont allow font changes	

	this.inlet1=new this.inletClass("inlet1",this,"any input flashes indicator, number lights indicator for that period, \"set\" changes color, boolean toggles indicator");
	this.outlet1 = new this.outletClass("outlet1",this,"bang on mousedown");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on mouseup");
	var indicator=null;
	var on=false;	
	
	this.interval=(!isNaN(parseInt(args.split(" ")[0])))?parseInt(args.split(" ")[0]):100;	
	this.indicatorBg=(args.split(" ")[1]!=undefined)?args.split(" ")[1]:"#FF0000";
	this.indicatorOffBg=(args.split(" ")[2]!=undefined)?args.split(" ")[2]:"#EEEEEE";
	
	this.setInspectorConfig([
		{name:"interval",value:thisPtr.interval,label:"Interval",type:"number",input:"text"},
		{name:"indicatorBg",value:thisPtr.indicatorBg,label:"On Color",type:"string",input:"text"},
		{name:"indicatorOffBg",value:thisPtr.indicatorOffBg,label:"Off Color",type:"string",input:"text"}
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+vals["interval"]+" "+vals["indicatorBg"]+" "+vals["indicatorOffBg"];
		
	}		

	this.inlet1["anything"]=function() {
		if(!on) {
			turnOn();
			setTimeout(function(){turnOff();},thisPtr.interval);
		}
	}
	
	this.inlet1["set"]=function(c) {
		thisPtr.indicatorBg=c;
		if(on)
			indicator.style.background=thisPtr.indicatorBg
	}
	
	this.inlet1["num"]=function(num) {
		if(!on) {
			turnOn();
			setTimeout(function(){turnOff();},num);
		}
	}	
	
	this.inlet1["bool"]=function(b) {
		if(b) {
			turnOn();
		} else {
			turnOff();
		}
	}
	
	function turnOn() {
		indicator.style.background=thisPtr.indicatorBg;
		on=true;		
		thisPtr.outlet1.doOutlet("bang");		
	}
	
	function turnOff() {
		indicator.style.background=thisPtr.indicatorOffBg;
		on=false;		
		thisPtr.outlet2.doOutlet("bang");		
	}
	
	//custom html
	this.ui=new LilyObjectView(this,"<div id=\""+ this.createElID("indicator") +"\" style=\"width:50px;height:50px;background:"+this.indicatorOffBg+"\"></div>");
	this.ui.draw();
	indicator=thisPtr.ui.getElByID(thisPtr.createElID("indicator"));
	
	this.controller.attachObserver(thisPtr.createElID("indicator"),"mousedown",turnOn,"performance");	
	this.controller.attachObserver(thisPtr.createElID("indicator"),"mouseup",turnOff,"performance");	

	//element to be resized
	this.resizeElement=indicator;
	
	return this;
}

var $flasherMetaData = {
	textName:"flasher",
	htmlName:"flasher",
	objectCategory:"UI",
	objectSummary:"Indicate when receiving a message.",
	objectArguments:"flash length [100], flash color [#FF0000]], background [#EEEEEE]"
}