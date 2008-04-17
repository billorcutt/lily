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
*	Construct a new slider object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $scriptaculousdotslider(args)
{
	var thisPtr=this;
	var slider=null;
	this.ui={};
		
	//args passed to the constructor to init the slider
	//also editable using the inspector
	var argsArr=LilyUtils.splitArgs(args);
	this.args=args;
		
	//init from args
	this.rangeStart=(argsArr.length>=2&&typeof argsArr[0]!="undefined")?parseInt(argsArr[0]):1; //slider range
	this.rangeEnd=(argsArr.length>=2&&typeof argsArr[1]!="undefined")?parseInt(argsArr[1]):20; //slider range
	this.orientation=(argsArr.length==3&&typeof argsArr[2]!="undefined")?argsArr[2]:"horizontal"; //slider orientation
	
	this.inlet1 = new this.inletClass("inlet1",this,"\"set\" sets & positions slider");	
	this.outlet1 = new this.outletClass("outlet1",this,"float value on slide");
	this.outlet2 = new this.outletClass("outlet2",this,"float value after slide");

	//create a config with the params we want to be user editable in the inspector
	//must follow the form- property name, property value, label (for inspector), data type (number,boolean,string)
	this.setInspectorConfig([
		{name:"rangeStart",value:thisPtr.rangeStart,label:"Range Start",type:"number",input:"text"},
		{name:"rangeEnd",value:thisPtr.rangeEnd,label:"Range End",type:"number",input:"text"},
		{name:"orientation",value:thisPtr.orientation,label:"Orientation",type:"string",options:[{label:"Vertical",value:"vertical"},{label:"Horizontal",value:"horizontal"}],input:"radio"}
	]);
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			if(x=="orientation")
				thisPtr[x]=vals[x];
			else
				thisPtr[x]=parseInt(vals[x]);
			
		//update the arg str
		this.args=""+vals["rangeStart"]+" "+vals["rangeEnd"]+" "+vals["orientation"];	
			
		//reload the frame & start over	with the new values
		slider=null;
		iframe.reload();
		thisPtr.controller.cleanupOutletConnections();
	}
	
	this.inlet1["set"]=function(num) {
		slider.setValue(parseInt(num));
	}
	/*
	this.inlet1["setStart"]=function(num) {
		slider.setValue(parseInt(num));
	}
	
	this.inlet1["setEnd"]=function(num) {
		slider.setValue(parseInt(num));
	}
	*/	
	
	function initSlider() {
		slider=new iframe.objFrame.contentWindow.Control.Slider('handle1','track1',{
			axis:thisPtr.orientation, range:iframe.objFrame.contentWindow.$R(thisPtr.rangeStart,thisPtr.rangeEnd),
		    onSlide:function(v){slide(v)},
		    onChange:function(v){change(v)}
		}
		);
	}
	
	function slide(v){
		thisPtr.outlet1.doOutlet(v);
	}
	
	function change(v){
		thisPtr.outlet2.doOutlet(v);
	}	
	
	function frameInit() {
		
		if(thisPtr.orientation=="horizontal") {
			iframe.objFrame.contentDocument.getElementById("bodyElement").innerHTML='<div id="track1" style="margin-top:5px;width:200px;background-color:#aaa;height:5px;"><div id="handle1" style="width:5px;height:20px;background-color:#f00;cursor:move;"> </div></div>';
			iframe.objFrame.style.width="200px";
			iframe.objFrame.style.height="30px";
			thisPtr.setHeight("30");
			thisPtr.setWidth("200");
			thisPtr.controller.objResizeControl.cb(30,200); //resize the cover div - there must be a better way to do this		
		} else {			
			iframe.objFrame.contentDocument.getElementById("bodyElement").innerHTML='<div id="track1" style="margin-left:5px;width:5px;background-color:#aaa;height:200px;"><div id="handle1" style="width:20px;height:5px;background-color:#f00;cursor:move;"> </div></div>';
			iframe.objFrame.style.height="200px";
			iframe.objFrame.style.width="30px";
			thisPtr.setHeight("200");
			thisPtr.setWidth("30");
			thisPtr.controller.objResizeControl.cb(200,30); //resize the cover div
		}	
			
		initSlider();	
	}

	var iframe=new LilyUtils._iframe(this,"chrome://lily/content/lib/scriptaculous.html",30,200,"no",frameInit);	
	iframe.objFrame.addEventListener("load",frameInit,false);
	this.controller.setNoBorders(true);		

	return this;
}

var $scriptaculousdotsliderMetaData = {
	textName:"scriptaculous.slider",
	htmlName:"scriptaculous.slider",
	objectCategory:"Interaction",
	objectSummary:"Output or display numbers using a slider.",
	objectArguments:"start [1], end [20], orientation [horizontal]"
}