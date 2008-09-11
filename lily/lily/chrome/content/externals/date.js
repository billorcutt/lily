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
*	Construct a new date object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $date()
{
	var thisPtr=this;

	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs the current time/date. an input date is parsed and output.");

	this.outlet1 = new this.outletClass("outlet1",this,"UTC Date/Time String");
	this.outlet2 = new this.outletClass("outlet2",this,"Local Date/Time String");
	this.outlet3 = new this.outletClass("outlet3",this,"Time in ms since 1970");
	this.outlet4 = new this.outletClass("outlet4",this,"Year");
	this.outlet5 = new this.outletClass("outlet5",this,"Month");
	this.outlet6 = new this.outletClass("outlet6",this,"Date");	
	this.outlet7 = new this.outletClass("outlet7",this,"Day");
	this.outlet8 = new this.outletClass("outlet8",this,"Hours");	
	this.outlet9 = new this.outletClass("outlet9",this,"Minutes");
	this.outlet10 = new this.outletClass("outlet10",this,"Seconds");
	this.outlet11 = new this.outletClass("outlet11",this,"Milliseconds");
	this.outlet12 = new this.outletClass("outlet12",this,"Timezone offeset from GMT");					
	
	this.inlet1["bang"]=function() {
		output_date(new Date(Date.now()));																	
	}
			
	this.inlet1["anything"]=function(dateStr) {	
		if(typeof dateStr == "string") {
			output_date(new Date(dateStr));
		} else if(typeof dateStr == "number") {
			output_date(new Date(dateStr));
		}
	}
	
	function output_date(date) {
		thisPtr.outlet12.doOutlet(date.getTimezoneOffset()); //offset		
		thisPtr.outlet11.doOutlet(date.getMilliseconds()); //ms
		thisPtr.outlet10.doOutlet(date.getSeconds()); //seconds
		thisPtr.outlet9.doOutlet(date.getMinutes()); //minutes
		thisPtr.outlet8.doOutlet(date.getHours()); //hours
		thisPtr.outlet7.doOutlet(date.getDay()); //day
		thisPtr.outlet6.doOutlet(date.getDate()); //date
		thisPtr.outlet5.doOutlet(date.getMonth()); //month
		thisPtr.outlet4.doOutlet(date.getFullYear()); //year
		thisPtr.outlet3.doOutlet(date.getTime()); //ms since 1970
		thisPtr.outlet2.doOutlet(date.toLocaleString()); //locale string
		thisPtr.outlet1.doOutlet(date.toUTCString()); //utc date string
	}
		
	return this;
}

var $dateMetaData = {
	textName:"date",
	htmlName:"date",
	objectCategory:"System",
	objectSummary:"Output a message with the current date.",
	objectArguments:""
}