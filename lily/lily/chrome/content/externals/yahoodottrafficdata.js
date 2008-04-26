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
*	Construct a new yahoo.trafficdata object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $yahoodottrafficdata()
{
	var thisPtr=this;

	var appid=LilyAPIKeyManager.getKey("yahooAPIkey");	
	if(!appid) return null; //fail if no key
	
	var url="http://local.yahooapis.com/MapsService/V1/trafficData?appid="+appid;
	this.inlet1=new this.inletClass("inlet1",this,"location as text, coordinates as hash \"{longitude,latitude}\"");
	this.outlet1=new this.outletClass("outlet1",this,"each result as hash {title, description, latitude, longitude, direction, severity}");
	this.outlet2=new this.outletClass("outlet2",this,"bang on complete or error");	
	this.xhr=new LilyUtils._xhr(outputResponse,"xml",this);
	
	
	this.inlet1["anything"]=function(str){		
		thisPtr.xhr.loadXMLDoc(url + "&location=" + str); 
	}
	
	//coordinates as hash
	this.inlet1["obj"]=function(obj){	
		thisPtr.xhr.loadXMLDoc(url + "&latitude=" + obj["latitude"] + "&longitude=" + obj["longitude"]); 
	}	
	
	function outputResponse(xmlDoc) {
		
		if(!xmlDoc)
			return;	

		var resultList=xmlDoc.getElementsByTagName("Result");
		
		for(var i=0;i<resultList.length;i++) {
			
			var title = resultList[i].getElementsByTagName("Title")[0].firstChild.nodeValue;
			var description = resultList[i].getElementsByTagName("Description")[0].firstChild.nodeValue;
			var latitude = resultList[i].getElementsByTagName("Latitude")[0].firstChild.nodeValue;
			var longitude = resultList[i].getElementsByTagName("Longitude")[0].firstChild.nodeValue;			
			var direction = resultList[i].getElementsByTagName("Direction")[0].firstChild.nodeValue;
			var severity = resultList[i].getElementsByTagName("Severity")[0].firstChild.nodeValue;
			
			thisPtr.outlet1.doOutlet({"title":title,"description":description,"latitude":latitude,"longitude":longitude,"direction":direction,"severity":severity});
		
		}		
		
		this.outlet2.doOutlet("bang");				

	}	
	
	return this;
}

var $yahoodottrafficdataMetaData = {
	textName:"yahoo.trafficdata",
	htmlName:"yahoo.trafficdata",
	objectCategory:"Web Service",
	objectSummary:"Search for traffic data using the Yahoo Web API.",
	objectArguments:""
}