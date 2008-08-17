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
*	Construct a new yahoo.gettime object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $yahoodotgettime()
{
	var thisPtr=this;	

	var appid=LilyAPIKeyManager.getKey("yahooAPIkey");
	if(!appid) return null; //fail if no key
	
	var url="http://developer.yahooapis.com/TimeService/V1/getTime?appid="+appid+"&format=ms";
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs current time");	
	this.outlet1=new this.outletClass("outlet1",this,"time in ms");
	this.outlet2=new this.outletClass("outlet2",this,"time as a string");
	this.outlet3=new this.outletClass("outlet3",this,"bang on complete or error");	
	this.xhr=new LilyComponents._xhr(outputResponse,"xml",this);
	
	//bang method
	this.inlet1["bang"]=function(){ thisPtr.xhr.loadXMLDoc(url); }
	
	function outputResponse(xmlDoc) {
		
		if(!xmlDoc)
			return;	

		var resultList=xmlDoc.getElementsByTagName("Timestamp");		
		
		for(var i=0;i<resultList.length;i++) {
			this.outlet2.doOutlet(new Date(parseInt(resultList[i].firstChild.nodeValue)).toString());
			this.outlet1.doOutlet(resultList[i].firstChild.nodeValue);
			this.outlet3.doOutlet("bang");
		}
	}	
	
	return this;
}

var $yahoodotgettimeMetaData = {
	textName:"yahoo.gettime",
	htmlName:"yahoo.gettime",
	objectCategory:"Web Service",
	objectSummary:"Get the current time using Yahoo Web API.",
	objectArguments:""
}