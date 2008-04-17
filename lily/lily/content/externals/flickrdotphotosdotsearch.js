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
*	Construct a new flickr.photos.search object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $flickrdotphotosdotsearch() {
	
	var thisPtr=this;
	
	//bbox=-180,-90,180,90 param to search only geotagged.
	
	//instantiate a new flickr service
	try {
		var flickrService=new LilyServices._flickrService(this,"photos.search");	
	} catch(e) {
		LilyDebugWindow.error(e.name + ": " + e.message);
		return;
	}
	
	this.inlet1=new this.inletClass("inlet1",this,"list of 3 parameters: \"[page number] [number of rows] [search string]\", \"bang\" outputs default results");
	this.inlet2=new this.inletClass("inlet2",this,"methods: \"group\" (limit to group), \"tags\" (true limits to tags), \"user\" (limit to user), \"geotagged\" (true limits to geotagged photos, coordinates limit to a specifc area)");

	this.outlet1 = new this.outletClass("outlet1",this,"each result as a hash with keys {id, url, title, isPublic, owner}");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete or error"); //bang when done	

	
	//addl searc params
	var groupID=""; //if present limit the search to this group.
	var userID=""; //if present, limit the search to this user.
	var bbox=""; //bounding box =-180,-90,180,90 (ie the world) to search only geotagged;"" to search all photos regardless of geotags; coords search within that box.
	var searchType="text"; //values: text or tags

	//define methods for output & error/completion
	flickrService.outputData=function(pic) {
		thisPtr.outlet1.doOutlet(pic);
	}
	flickrService.outputError=function() {
		thisPtr.outlet2.doOutlet("bang");
	}
	
	//set groupID
	this.inlet2["group"]=function(str) {	
		if(str) {
			groupID=str;
			userID="";
		} else {
			groupID="";	
		}			
	}
	
	//set useID
	this.inlet2["user"]=function(str) {
		if(str) {
			userID=str;
			groupID="";			
		} else {
			userID="";
		}			
	}
	
	//set tagsOnly
	this.inlet2["tags"]=function(bool) {
		if(bool=="true")
			searchType="tags";
		else
			searchType="text";
	}
	
	//set geotagged- if a bool then set the geotagged param.
	this.inlet2["geotagged"]=function(str) {
		if(str=="true") {
			bbox="-180,-90,180,90"; 			
		} else if (str=="false") {
			bbox=""; 
		} else if (str.split(",").length==4) { //minimal check here...
			bbox=str;
		}
	}			
		
	//default search method
	this.inlet1["anything"]=function(str) {
		var tmp = LilyUtils.splitArgs(str);
		var page = tmp.shift();
		var num = tmp.shift();
		var search = tmp.join(" ");		
		flickrService.doSearch(page,num,search,searchType,groupID,userID,bbox); 
	}
}

var $flickrdotphotosdotsearchMetaData = {
	textName:"flickr.photos.search",
	htmlName:"flickr.photos.search",
	objectCategory:"Web Service",
	objectSummary:"Search for photos using the Flickr Web API.",
	objectArguments:""
}