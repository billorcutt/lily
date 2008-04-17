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
*	Construct a new yahoo.localsearch object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $yahoodotlocalsearch()
{
	var thisPtr=this;
		
	var appid=LilyAPIKeyManager.getKey("yahooAPIkey");	
	if(!appid) return null; //fail if no key
	
	var location = null;
	var latitude = null;
	var longitude = null;
			
	var url="http://local.yahooapis.com/LocalSearchService/V3/localSearch?appid="+appid;
	this.inlet1=new this.inletClass("inlet1",this,"list of 3 required parameters: \"[start page] [number of results] [query]\"");
	this.inlet2=new this.inletClass("inlet2",this,"location as text, coordinates as hash \"{longitude,latitude}\"");	
		
	this.outlet1=new this.outletClass("outlet1",this,"each result as hash {title, url, latitude, longitude, address, city, state, phone}");
	this.outlet2=new this.outletClass("outlet2",this,"bang on complete or error");	
	this.xhr=new LilyUtils._xhr(outputResponse,"xml",this);
	
	this.inlet2["anything"]=function(str) {
		location = str;
		latitude = null;
		longitude = null;		
	}
	
	//coordinates as hash
	this.inlet2["obj"]=function(obj){	
		latitude = obj["latitude"];
		longitude = obj["longitude"];
		location = null;
	}		
	
	//bang method
	this.inlet1["anything"]=function(str){
		
		var arr = str.split(" ");
		var page = arr.shift();
		var num = arr.shift();		
		var query = arr.join(" ");
		
		if(longitude && typeof longitude!="undefined" && latitude && typeof latitude!="undefined") {
			loc = "&longitude=" + longitude + "&latitude=" + latitude;
		} else if(location && typeof location!="undefined") {
			loc = "&location=" + location;
		} else {
			LilyDebugWindow.error("need a location for local search.");
			return;
		}		
		thisPtr.xhr.loadXMLDoc(url + "&start=" + page + "&results=" + num + "&query=" + query + loc); 
	}
	
	function outputResponse(xmlDoc) {
		
		if(!xmlDoc)
			return;	

		var resultList=xmlDoc.getElementsByTagName("Result");
		
		for(var i=0;i<resultList.length;i++) {
			
			var url = (resultList[i].getElementsByTagName("Url")[0].firstChild)?resultList[i].getElementsByTagName("Url")[0].firstChild.nodeValue:"";
			var title = (resultList[i].getElementsByTagName("Title")[0].firstChild)?resultList[i].getElementsByTagName("Title")[0].firstChild.nodeValue:"";
			var latitude = (resultList[i].getElementsByTagName("Latitude")[0].firstChild)?resultList[i].getElementsByTagName("Latitude")[0].firstChild.nodeValue:"";
			var longitude = (resultList[i].getElementsByTagName("Longitude")[0].firstChild)?resultList[i].getElementsByTagName("Longitude")[0].firstChild.nodeValue:"";			
			var address = (resultList[i].getElementsByTagName("Address")[0].firstChild)?resultList[i].getElementsByTagName("Address")[0].firstChild.nodeValue:"";
			var city = (resultList[i].getElementsByTagName("City")[0].firstChild)?resultList[i].getElementsByTagName("City")[0].firstChild.nodeValue:"";
			var state = (resultList[i].getElementsByTagName("State")[0].firstChild)?resultList[i].getElementsByTagName("State")[0].firstChild.nodeValue:"";
			var phone = (resultList[i].getElementsByTagName("Phone")[0].firstChild)?resultList[i].getElementsByTagName("Phone")[0].firstChild.nodeValue:"";									
			
			thisPtr.outlet1.doOutlet({"title":title,"url":url,"latitude":latitude,"longitude":longitude,"address":address,"city":city,"state":state,"phone":phone});
		
		}		
		
		this.outlet2.doOutlet("bang");				

	}	
	
	return this;
}

var $yahoodotlocalsearchMetaData = {
	textName:"yahoo.localsearch",
	htmlName:"yahoo.localsearch",
	objectCategory:"Web Service",
	objectSummary:"Search for locale-specific data using Yahoo Web API.",
	objectArguments:""
}