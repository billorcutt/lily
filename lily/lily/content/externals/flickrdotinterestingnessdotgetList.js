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
*	Construct a new flickr.interestingness.getList object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $flickrdotinterestingnessdotgetList(num) {
	
	var thisPtr=this;
	var rowsToFetch=parseInt(num)||1;
	
	//instantiate a new flickr service
	try {
		var flickrService=new LilyServices._flickrService(this,"interestingness.getList",rowsToFetch);	
	} catch(e) {
		LilyDebugWindow.error(e.name + ": " + e.message);
		return; //fail if no key
	}	

	this.inlet1=new this.inletClass("inlet1",this,"list of 3 parameters: \"[page number] [number of rows] [date]\", \"bang\" outputs default results for the current date");
	this.outlet1 = new this.outletClass("outlet1",this,"each result as a hash with keys {id, url, title, isPublic, owner}");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete or error"); //bang when done
	
	//define methods for output & error/completion
	flickrService.outputData=function(pic) {
		thisPtr.outlet1.doOutlet(pic);
	}
	flickrService.outputError=function() {
		thisPtr.outlet2.doOutlet("bang");
	}
		
	//bang method
	this.inlet1["bang"]=function(){ 
		flickrService.loadDefaultURL(); 
	}

	//anything method- params page,number of rows,date in for YYYY-MM-DD
	this.inlet1["anything"]=function(str){
		str=str+"";
		var page = str.split(" ")[0]||null;
		var num = str.split(" ")[1]||null;
		var date = str.split(" ")[2]||null;		
		flickrService.doInterestingness(page,num,date); 
	}	
}

var $flickrdotinterestingnessdotgetListMetaData = {
	textName:"flickr.interestingness.getList",
	htmlName:"flickr.interestingness.getList",
	objectCategory:"Web Service",
	objectSummary:"Get the interestingness list using the Flickr Web API.",
	objectArguments:"rows to fetch [1]"
}