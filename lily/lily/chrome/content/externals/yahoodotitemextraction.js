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
*	Construct a new yahoo.itemextraction object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $yahoodotitemextraction()
{
	var thisPtr=this;
	
	var appid=LilyAPIKeyManager.getKey("yahooAPIkey");	
	if(!appid) return null; //fail if no key	
		
	var url="http://search.yahooapis.com/ContentAnalysisService/V1/termExtraction";	
	var context = "";
		
	this.inlet1=new this.inletClass("inlet1",this,"query to run against the content, \"bang\" to analyze the content alone.");
	this.inlet2=new this.inletClass("inlet2",this,"content to analyze");

	this.outlet1 = new this.outletClass("outlet1",this,"results");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete or error");	
		
	this.xhr=new LilyUtils._xhr(outputResponse,"xml",this,"POST",null,[{name:"Content-Type",value:"application/x-www-form-urlencoded"}]);
	
	this.inlet1["anything"]=function(msg)	{
		thisPtr.xhr.loadXMLDoc(url,"appid=" + appid + "&context=" + context + "&query=" + msg); 
	}
	
	this.inlet1["bang"]=function(msg)	{
		thisPtr.xhr.loadXMLDoc(url,"appid=LilyAppAlpha" + "&context=" + context); 
	}	
	
	this.inlet2["anything"]=function(msg)	{
		context = msg;
	}	
	
	function outputResponse(xmlDoc) {
				
		if(!xmlDoc)
			return;	
		
		var resultList=xmlDoc.getElementsByTagName("Result");
		
		for(var i=0;i<resultList.length;i++) {
			thisPtr.outlet1.doOutlet(resultList[i].firstChild.nodeValue.valueOf());
		}		
		
		this.outlet2.doOutlet("bang");
	}
	
	return this;
}

var $yahoodotitemextractionMetaData = {
	textName:"yahoo.itemextraction",
	htmlName:"yahoo.itemextraction",
	objectCategory:"Web Service",
	objectSummary:"Content analysis using Yahoo Web API.",
	objectArguments:""
}