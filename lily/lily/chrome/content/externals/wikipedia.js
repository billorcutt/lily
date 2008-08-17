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
*	Construct a new wikipedia object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $wikipedia()
{
	var thisPtr=this;	
	var appid=LilyAPIKeyManager.getKey("wikipediaAPIkey");	
	var url="http://api.futef.com/api/v1?appid="+appid;
	
	this.inlet1=new this.inletClass("inlet1",this,"list of 3 required parameters: \"[start page] [number of results] [query]");	
	this.outlet1 = new this.outletClass("outlet1",this,"location as text, coordinates as hash \"{title, url, text, cats}\"");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete or error");	
	
	this.xhr=new LilyComponents._xhr(outputResponse,"text",this);
		
	this.inlet1["anything"]=function(str){
		
		var arr = str.split(" ");
		var page = parseInt(arr.shift());
		var results = parseInt(arr.shift());		
		var query = arr.join(" ");
	
		var end = page*results;
		var begin = end-results;		
				
//		LilyDebugWindow.print(url + "&query=" + query + "&begin=" + begin + "&end=" + end)
		thisPtr.xhr.loadXMLDoc(url + "&query=" + query + "&begin=" + begin + "&end=" + end); 
	}	
	
	function outputResponse(data) {	
			
		if(data) {
			try {
				eval('var responseJSON='+data);	
			} catch(e) {
				LilyDebugWindow.error(e.name + ": " + e.message);
				return;
			}
		} else {
			return;
		}
		
		for(var i=0;i<responseJSON.records.length;i++)
			this.outlet1.doOutlet({"title":responseJSON.records[i].title,"url":responseJSON.records[i].url,"text":LilyUtils.string2HTML(responseJSON.records[i].text),"cats":responseJSON.records[i].cats});
		
		
		this.outlet2.doOutlet("bang");		
	}
	
	return this;
}

var $wikipediaMetaData = {
	textName:"wikipedia",
	htmlName:"wikipedia",
	objectCategory:"Web Service",
	objectSummary:"Search the Wikipedia using the Web API.",
	objectArguments:""
}