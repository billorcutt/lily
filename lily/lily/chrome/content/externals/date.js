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

	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs ms since 1970, \"now\" outputs GMT date, \"date\" outputs local date, \"time\" outputs local time.");
	this.outlet1 = new this.outletClass("outlet1",this,"date");	
	
	this.inlet1["bang"]=function() {
			thisPtr.outlet1.doOutlet(Date.now());
	}
	
	this.inlet1["now"]=function() {
			thisPtr.outlet1.doOutlet(new Date(Date.now()).toString());
	}
	
	this.inlet1["date"]=function() {
			thisPtr.outlet1.doOutlet(new Date(Date.now()).toLocaleDateString());
	}
	
	this.inlet1["set"]=function(dateStr) {		
			var date_value = (isNaN(parseInt(dateStr)) || dateStr.match(/\D/g))?dateStr:parseInt(dateStr)  //find correct regexp here...
			thisPtr.outlet1.doOutlet(new Date(date_value).toLocaleDateString());
	}	
	
	this.inlet1["time"]=function() {
			thisPtr.outlet1.doOutlet(new Date(Date.now()).toLocaleTimeString());
	}
	
	this.inlet1["parse"]=function(date) {
			thisPtr.outlet1.doOutlet(Date.parse(date));
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