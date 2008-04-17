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
*	Construct a new calendar object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $yuidotcalendar()
{
	var thisPtr=this;
	var cal1=null;
	this.outlet1 = new this.outletClass("outlet1",this,"\"bang\" outputs selected date, \"next\", \"previous\" & click selects and outputs date");
	this.inlet1=new this.inletClass("inlet1",this, "date string");
	this.ui={};	
	this.resize=false;
	
	this.today = new Date(); 
	
	var thisMonth = this.today.getMonth();
	var thisDay = this.today.getDate();
	var thisYear = this.today.getFullYear();
			
	function initCal() {
		cal1 = new iframe.objFrame.contentWindow.YAHOO.widget.Calendar("cal1","cal1Container"); 
		cal1.render();
		cal1.selectEvent.subscribe(selectFunc);
	}
	
	function selectFunc(){
		thisPtr.outlet1.doOutlet(cal1.getSelectedDates());
	}
	
	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet(cal1.getSelectedDates());
	}
	
	this.inlet1["next"]=function() {
		var now=new Date(cal1.getSelectedDates()[0]);		
		cal1.select((now.getMonth()+1)+"/"+(now.getDate()+1)+"/"+now.getFullYear());
		cal1.setMonth(now.getMonth());
		cal1.setYear(now.getFullYear());		
		cal1.render(); //need to do a more optimized render
	}
	
	this.inlet1["previous"]=function() {
		var now=new Date(cal1.getSelectedDates()[0]);		
		cal1.select((now.getMonth()+1)+"/"+(now.getDate()-1)+"/"+now.getFullYear());
		cal1.setMonth(now.getMonth());
		cal1.setYear(now.getFullYear());
		cal1.render();
	}
	
	this.inlet1["set"]=function(str) {
		var date_str=(str.indexOf("/")==-1)?parseInt(str):str;
		var now=new Date(date_str);				
		cal1.select((now.getMonth()+1)+"/"+(now.getDate())+"/"+now.getFullYear());
		cal1.setMonth(now.getMonth());
		cal1.setYear(now.getFullYear());		
		cal1.render(); //need to do a more optimized render
	}
	
	this.inlet1["today"]=function() {
		var now=new Date();				
		cal1.select((now.getMonth()+1)+"/"+(now.getDate())+"/"+now.getFullYear());
		cal1.setMonth(now.getMonth());
		cal1.setYear(now.getFullYear());		
		cal1.render(); //need to do a more optimized render
	}		
	
	var iframe=new LilyUtils._iframe(this,"chrome://lily/content/lib/yui.html",185,202,"no",frameInit);
	
	function frameInit() {
		iframe.objFrame.contentDocument.getElementById("bodyElement").innerHTML='<link type="text/css" rel="stylesheet" href="chrome://lily/content/lib/yui/build/calendar/assets/calendar.css">\n<div id="cal1Container"></div>';
		initCal();
	}
	
//	iframe.objFrame.addEventListener("load",frameInit,false);
	this.controller.setNoBorders(true);		

	return this;
}

var $yuidotcalendarMetaData = {
	textName:"yui.calendar",
	htmlName:"yui.calendar",
	objectCategory:"Interaction",
	objectSummary:"Send a date message using a calendar.",
	objectArguments:""
}