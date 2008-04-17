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
*	Construct a new yahoo.geocoding object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $yahoodotgeocoding()
{
	var thisPtr=this;	
	
	var appid=LilyAPIKeyManager.getKey("yahooAPIkey");
	if(!appid) return null; //fail if no key

	var url="http://api.local.yahoo.com/MapsService/V1/geocode?appid="+appid;
	
	this.inlet1=new this.inletClass("inlet1",this,"location to geocode");	
	this.outlet1=new this.outletClass("outlet1",this,"coordinates as hash {latitude, longitude}");
	this.outlet2=new this.outletClass("outlet2",this,"bang on complete or error");
		
	this.xhr=new LilyUtils._xhr(outputResponse,"xml",this);
	
	//bang method
	this.inlet1["anything"]=function(str){ 
		thisPtr.xhr.loadXMLDoc(url + "&location=" + str); 
	}
	
	function outputResponse(xmlDoc) {
		
		if(!xmlDoc)
			return;	
		
		var lat=xmlDoc.getElementsByTagName("Latitude")[0].firstChild.nodeValue;		
		var lon=xmlDoc.getElementsByTagName("Longitude")[0].firstChild.nodeValue;
		
		var add=(xmlDoc.getElementsByTagName("Address")[0].firstChild)?xmlDoc.getElementsByTagName("Address")[0].firstChild.nodeValue:"";		
		var city=(xmlDoc.getElementsByTagName("City")[0].firstChild)?xmlDoc.getElementsByTagName("City")[0].firstChild.nodeValue:"";
		var state=(xmlDoc.getElementsByTagName("State")[0].firstChild)?xmlDoc.getElementsByTagName("State")[0].firstChild.nodeValue:"";		
		var zip=(xmlDoc.getElementsByTagName("Zip")[0].firstChild)?xmlDoc.getElementsByTagName("Zip")[0].firstChild.nodeValue:"";
		var co=(xmlDoc.getElementsByTagName("Country")[0].firstChild)?xmlDoc.getElementsByTagName("Country")[0].firstChild.nodeValue:"";							
			
		this.outlet1.doOutlet({"latitude":lat,"longitude":lon,"address":add,"city":city,"state":state,"zip":zip,"country":co});	
		this.outlet2.doOutlet("bang");				

	}	
	
	return this;
}

var $yahoodotgeocodingMetaData = {
	textName:"yahoo.geocoding",
	htmlName:"yahoo.geocoding",
	objectCategory:"Web Service",
	objectSummary:"Get geolocation data using Yahoo Web API.",
	objectArguments:""
}