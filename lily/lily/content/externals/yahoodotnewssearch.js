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
*	Construct a new yahoo.newssearch object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $yahoodotnewssearch()
{
	var thisPtr=this;
	
	var appid=LilyAPIKeyManager.getKey("yahooAPIkey");	
	if(!appid) return null; //fail if no key
	
	var url="http://search.yahooapis.com/NewsSearchService/V1/newsSearch?language=en&appid="+appid;
	this.inlet1=new this.inletClass("inlet1",this,"list of 3 required parameters: \"[start page] [number of results] [query]\"");	
	this.outlet1=new this.outletClass("outlet1",this,"each result as hash with keys {title, summary, url}");
	this.outlet2=new this.outletClass("outlet2",this,"bang on complete or error");	
	this.xhr=new LilyUtils._xhr(outputResponse,"xml",this);
	
	//&street=701+First+Street&city=Sunnyvale&state=CA
	
	//bang method
	this.inlet1["anything"]=function(str){
		
		var arr = str.split(" ");
		
		var page = arr.shift();
		var num = arr.shift();
		var query = arr.join(" ");		
		
//		LilyDebugWindow.print(thisPtr.url + "&start=" + page + "&results=" + num + "&query=" + query)
		
		thisPtr.xhr.loadXMLDoc(url + "&start=" + page + "&results=" + num + "&query=" + query); 
	}
	
	function outputResponse(xmlDoc) {
		
		if(!xmlDoc)
			return;	

		var resultList=xmlDoc.getElementsByTagName("Result");
		
		for(var i=0;i<resultList.length;i++) {
			
			var url = resultList[i].getElementsByTagName("Url")[0].firstChild.nodeValue;
			var title = resultList[i].getElementsByTagName("Title")[0].firstChild.nodeValue;
			var summary = resultList[i].getElementsByTagName("Summary")[0].firstChild.nodeValue;
			
			thisPtr.outlet1.doOutlet({"title":title,"summary":summary,"url":url});
		
		}		
		
		this.outlet2.doOutlet("bang");				

	}	
	
	return this;
}

var $yahoodotnewssearchMetaData = {
	textName:"yahoo.newssearch",
	htmlName:"yahoo.newssearch",
	objectCategory:"Web Service",
	objectSummary:"Search for news using Yahoo Web API.",
	objectArguments:""
}