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
*	Construct a new amazon.itemlookup object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $amazondotitemlookup()
{
	var thisPtr=this;
	
	var appid=LilyAPIKeyManager.getKey("amazonAPIkey");		
	if(!appid) return null; //fail if no key
		
	var url="http://webservices.amazon.com/onca/xml?Operation=ItemLookup&Service=AWSECommerceService&ResponseGroup=Images,Small&SubscriptionId="+appid;
	this.inlet1=new this.inletClass("inlet1",this,"list of up to 10 item ids to lookup");	
	this.outlet1=new this.outletClass("outlet1",this,"each item as hash with keys {asin, group, title, url, img, author}");
	this.outlet2=new this.outletClass("outlet2",this,"bang on complete");	
	this.xhr=new LilyUtils._xhr(outputResponse,"xml",this);
	
	this.inlet1["anything"]=function(str){
		var ids = str.split(" ").join(",");	
		thisPtr.xhr.loadXMLDoc(url + "&ItemId=" + ids); 
	}
	
	function outputResponse(xmlDoc) {
		
		if(!xmlDoc)
			return;	
			
		var resultList=xmlDoc.getElementsByTagName("Item");
		
//		LilyDebugWindow.print(resultList.length)
		
		for(var i=0;i<resultList.length;i++) {
			
			var asin = resultList[i].getElementsByTagName("ASIN")[0].firstChild.nodeValue;
			var group = resultList[i].getElementsByTagName("ProductGroup")[0].firstChild.nodeValue;
			var title = resultList[i].getElementsByTagName("Title")[0].firstChild.nodeValue;
			var url = resultList[i].getElementsByTagName("DetailPageURL")[0].firstChild.nodeValue;			
			
			if(resultList[i].getElementsByTagName("Author")[0])
				var author = resultList[i].getElementsByTagName("Author")[0].firstChild.nodeValue;
			else if(resultList[i].getElementsByTagName("Artist")[0])
				var author = resultList[i].getElementsByTagName("Artist")[0].firstChild.nodeValue;
//			else if(resultList[i].getElementsByTagName("Creator")[0])
//				var author = resultList[i].getElementsByTagName("Creator")[0].firstChild.nodeValue;				
			else if(resultList[i].getElementsByTagName("Director")[0])
				var author = resultList[i].getElementsByTagName("Director")[0].firstChild.nodeValue;							
			else			
				var author = "";
			
			
			if(resultList[i].getElementsByTagName("LargeImage")[0])
				var img = resultList[i].getElementsByTagName("LargeImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
			else if(resultList[i].getElementsByTagName("MediumImage")[0])
				var img = resultList[i].getElementsByTagName("MediumImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
			else if(resultList[i].getElementsByTagName("SmallImage")[0])
				var img = resultList[i].getElementsByTagName("SmallImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
			else
				var img = "";			
			
			thisPtr.outlet1.doOutlet({"asin":asin,"group":group,"title":title,"url":url,"img":img,"author":author});
		
		}		
		this.outlet2.doOutlet("bang");				
	}
	
	return this;	
}

var $amazondotitemlookupMetaData = {
	textName:"amazon.itemlookup",
	htmlName:"amazon.itemlookup",
	objectCategory:"Web Service",
	objectSummary:"Lookup an item using the Amazon Web API.",
	objectArguments:""	
}