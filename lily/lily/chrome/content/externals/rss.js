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
*	Construct a new rss object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $rss(argStr)
{
	var thisPtr=this;
	var url=argStr.split(" ")[0]; //url
	
	this.outlet1 = new this.outletClass("outlet1",this,"each item as hash with keys {title, link, description, language, pubDate, category, image}");
	this.outlet2 = new this.outletClass("outlet2",this,"channel info");
	this.outlet3 = new this.outletClass("outlet3",this,"bang on complete or error");	
	this.inlet1=new this.inletClass("inlet1",this,"feed url, \"bang\" uses url supplied in object argument");	
	
	this.xhr=new LilyComponents._xhr(outputResponse,"xml",this); //gets xml
	this.rssparser=new LilyServices._rssService(); //converts to js object
	
	this.inlet1["bang"]=function(){ 
		thisPtr.xhr.loadXMLDoc(url); 
	}
	
	this.inlet1["anything"]=function(loc){ 
		thisPtr.xhr.loadXMLDoc(loc); 
	}	
	
	function outputResponse(data) {		
		if(data) {
			var responseObj = new this.rssparser.RSS2Channel(data);
		}
		
		this.outlet2.doOutlet({"title":responseObj.title,"link":responseObj.link,"description":responseObj.description,"language":responseObj.language,"pubDate":responseObj.pubDate,"category":responseObj.category,"image":responseObj.image});
		
		for(var i=0;i<responseObj.items.length;i++)
			this.outlet1.doOutlet(responseObj.items[i]);
			
		this.outlet3.doOutlet("bang"); //all done
		
	}
	
	return this;
}

var $rssMetaData = {
	textName:"rss",
	htmlName:"rss",
	objectCategory:"Web Service",
	objectSummary:"Output a parsed RSS feed.",
	objectArguments:"url"
}