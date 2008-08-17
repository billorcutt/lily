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

var LilyServices={};

/**
*	Construct a new flickr service
*/
LilyServices._flickrService=function(parent,service,number)
{
	var thisPtr=this;
	
	var api=LilyAPIKeyManager.getKey("flickrAPIkey");
	
	if(!api) {
		throw new Error("Couldn't create the flickr service.");
	}
	
	var rowsToFetch=number||1;
	var service=service||"";
	var flickrBaseUrl="http://api.flickr.com/services/rest/";
	var apiKey=(api)?("&api_key="+api):"";
	var url=flickrBaseUrl+"?method=flickr."+service+apiKey+"&per_page="+rowsToFetch+"&extras=geo";
	
//	LilyDebugWindow.print(this.url)
	
	//need a sanity check here to see if we have everything we need.
	
	//callbacks
	this.outputData=null; //callback attach here
	this.outputError=null; //error/complete cb attaches here
	
	this.xhr=new LilyComponents._xhr(handleResponse,'xml',this);
	
	//loads the default url
	this.loadDefaultURL=function() {
		thisPtr.xhr.loadXMLDoc(url);
	}
	
	function formatDate(unixDate) {
		var dateObj=new Date(+unixDate);
		var dateYear=dateObj.getFullYear();
		var dateMonth=((((+dateObj.getMonth())+1).toString()).length<2)?("0"+((+dateObj.getMonth())+1).toString()):(((+dateObj.getMonth())+1).toString());
		var dateDay=(((dateObj.getDate()).toString()).length<2)?("0"+(dateObj.getDate()).toString()):((dateObj.getDate()).toString());
		var formatted = dateYear+"-"+dateMonth+"-"+dateDay;
		return formatted;
	}
	
	//doInterestingness
	this.doInterestingness=function(page,num,date) {
		var pageNum = (page)?("&page="+page):"";
		var numRows = (num)?("&per_page="+num):"";
		var dateStr = (date)?("&date="+formatDate(date)):"";
		
		thisPtr.xhr.loadXMLDoc(flickrBaseUrl+"?method=flickr."+service+apiKey+"&extras=geo"+pageNum+numRows+dateStr);
	}
	
	//geo.getLocation
	this.doGetLocation=function(str) {
		thisPtr.xhr.loadXMLDoc(url+"&photo_id="+str)
	}
	
	//photos.search
	//page,num,search,searchType,groupID,userID,bbox,geoTagged
	this.doSearch=function(page,num,searchStr,type,group,user,box) {
		
		var groupID = (group)?"&group_id="+group:"";
		var userID = (user)?"&user_id="+user:"";
		var BBox = (box)?"&bbox="+box:"";				
		var pageNum = (page)?("&page="+page):"";
		var numRows = (num)?("&per_page="+num):"";

		thisPtr.xhr.loadXMLDoc(flickrBaseUrl+"?method=flickr."+service+apiKey+"&extras=geo"+pageNum+numRows+"&"+type+"="+escape(searchStr)+groupID+userID+BBox); //search param
	
	}
	
	//get recent pics
	this.doGetRecent=function(page,num) {
		var pageNum = (page)?("&page="+page):"";
		var numRows = (num)?("&per_page="+num):"";
		thisPtr.xhr.loadXMLDoc(flickrBaseUrl+"?method=flickr."+service+apiKey+"&extras=geo"+pageNum+numRows); //search param
	
	}
	
	//load specific url- entire url must be supplied as an arg
	this.loadURL=function(URL){thisPtr.xhr.loadXMLDoc(URL);}	
		
	//maps the correct response handler depending on service	
	function handleResponse(xmlDoc) {
		thisPtr.supportedServices[service](xmlDoc);
	}
	
	this.parsePhotoLocationList=function(xmlDoc) {
		
		if(!xmlDoc) {	//bail if its an error
			thisPtr.outputError("bang");
			return;		
		}					
		netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		var locationList=xmlDoc.getElementsByTagName("location");
		
		if(locationList.length) {
			for(var i=0;i<locationList.length;i++) {
				var loc={
					longitude:locationList[i].attributes["longitude"].value,
					latitude:locationList[i].attributes["latitude"].value
				};
				with({thisLoc:loc}) {
					setTimeout(function(){thisPtr.outputData(thisLoc)},1);
				}
			}
			thisPtr.outputError("bang");	//done
		} else {
			//thisPtr.outlet1.doOutlet("bang");	//error
			thisPtr.outputError("bang");	//done
		}
	}

	//private
	this.parsePhotoList=function(xmlDoc) {
		
		if(!xmlDoc) {	//bail if its an error
			thisPtr.outputError("bang"); //return an error
			return;		
		}					
		netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		var photoList=xmlDoc.getElementsByTagName("photo");		
		
		for(var i=0;i<photoList.length;i++) {
			var pic={
					ispublic:photoList[i].attributes["ispublic"].value,
					id:photoList[i].attributes["id"].value,
					title:LilyUtils.string2HTML(photoList[i].attributes["title"].value),
					owner:photoList[i].attributes["owner"].value,
					url:"http://static.flickr.com/"+photoList[i].attributes["server"].value+"/"+photoList[i].attributes["id"].value+"_"+photoList[i].attributes["secret"].value+".jpg",
					latitude:photoList[i].attributes["latitude"].value,
					longitude:photoList[i].attributes["longitude"].value
			};
			thisPtr.outputData(pic);
		}
		thisPtr.outputError("bang");	//done
	}
	
	this.supportedServices={
		"interestingness.getList":thisPtr.parsePhotoList,
		"photos.getRecent":thisPtr.parsePhotoList,
		"photos.search":thisPtr.parsePhotoList,
		"photos.geo.getLocation":thisPtr.parsePhotoLocationList
	}	

	function checkSupported() {
		
		if(!service) //no service specified
			return true;
		
		//do check for supported service here- return false if not supported.
		for(var x in thisPtr.supportedServices)
			if(x==service)
				return true;
			
		return false;
	}
			
	//need to fix the infrastructure so returning null causes the object to fail
	if(checkSupported())
		return this;
	else
		return null;
}


/**
*	Construct a new digg service
*/
LilyServices._diggService=function(parent,service,number)
{
	var thisPtr=this;
	var api="http://www.lilyapp.org";//
	var service=service||"";
	var diggBaseUrl="http://services.digg.com";
	var apiKey="appkey="+escape(api);
	var rowCount = number;
	var responseType = "&type=json";
	
	//endpoints for stories api
	var storyEP={};
	storyEP["story"]="/stories";
	storyEP["storyID"]="/stories/{REPLACE}";
	storyEP["storyTitle"]="/story/{REPLACE}";
	storyEP["popular"]="/stories/popular";
	storyEP["upcoming"]="/stories/upcoming";
	storyEP["container"]="/stories/container/{REPLACE}";
	storyEP["popularContainer"]="/stories/container/{REPLACE}/popular";
	storyEP["upcomingContainer"]="/stories/container/{REPLACE}/upcoming";
	storyEP["topic"]="/stories/topic/{REPLACE}";
	storyEP["popularTopic"]="/stories/topic/{REPLACE}/popular";
	storyEP["upcomingTopic"]="/stories/topic/{REPLACE}/upcoming";
	
	//endpoints for lists apis
	var eventEP={};
	eventEP["story"]="/stories/diggs";
	eventEP["storyID"]="/stories/{REPLACE}/diggs";
	eventEP["popular"]="/stories/popular/diggs";
	eventEP["upcoming"]="/stories/upcoming/diggs";
										
	//need a sanity check here to see if we have everything we need.
	
	//callbacks
	this.outputData=null; //callback attach here
	this.outputError=null; //error/complete cb attaches here
	
	this.xhr=new LilyComponents._xhr(handleResponse,'text',this);
	
	function formatDate(unixTime) {
		return Math.round((+unixTime)/1000.00);
	}
		
	//listStories
	this.listStories=function(endpoint,argsToEndPoint,page,num,startSubmitDate,endSubmitDate,startPromoteDate,endPromoteDate,sortBy,site,url) {
		
		var ep = (argsToEndPoint)?getEndpoint(storyEP[endpoint],argsToEndPoint):storyEP[endpoint];
		var count = (num)?("&count="+num):("&count="+rowCount);
		var offset = (page)?("&offset="+getOffset(page,num)):("&offset="+0);		
		var startSubmit = (startSubmitDate)?("&min_submit_date="+formatDate(startSubmitDate)):"";
		var endSubmit = (endSubmitDate)?("&max_submit_date="+formatDate(endSubmitDate)):"";
		var startPromote = (startPromoteDate)?("&min_promote_date="+formatDate(startPromoteDate)):"";
		var endPromote = (endPromoteDate)?("&max_promote_date="+formatDate(endPromoteDate)):"";
		var sort = (sortBy)?("&sort="+sortBy):"";
		var domain = (site)?("&domain="+site):"";
		var link = (url)?("&link="+url):"";	
		
		var diggURL	= diggBaseUrl+ep+"?"+apiKey+count+offset+startSubmit+endSubmit+startPromote+endPromote+sort+domain+link+responseType;
		
//		LilyDebugWindow.print(diggURL)		
		
		thisPtr.xhr.loadXMLDoc(diggURL);
		
	}
	
	//listEvents
	this.listEvents=function(endpoint,argsToEndPoint,page,num,startEventDate,endEventDate,sortBy) {
		
		var ep = (argsToEndPoint)?getEndpoint(eventEP[endpoint],argsToEndPoint):eventEP[endpoint];
		var count = (num)?("&count="+num):("&count="+rowCount);
		var offset = (page)?("&offset="+getOffset(page,num)):("&offset="+0);		
		var startEvent = (startEventDate)?("&min_date="+formatDate(startEventDate)):"";
		var endEvent = (endEventDate)?("&max_date="+formatDate(endEventDate)):"";
		var sort = (sortBy)?("&sort="+sortBy):"";
		
		var diggURL	= diggBaseUrl+ep+"?"+apiKey+count+offset+startEvent+endEvent+sort+responseType;
		
		LilyDebugWindow.print(diggURL)		
		
		thisPtr.xhr.loadXMLDoc(diggURL);
		
	}	
	
	//calculate the offset from page number.
	function getOffset(page,rows) {
		var count=(rows)?(rows):rowCount;
		return ((count*page)-count);
	}
	
	//insert the argument for endpoints that 'em
	function getEndpoint(endpoint,argument) {
		return endpoint.replace(/\{REPLACE\}/,argument);
	}
	
	//load specific url- entire url must be supplied as an arg
	this.loadURL=function(URL){thisPtr.xhr.loadXMLDoc(URL);}	
		
	//maps the correct response handler depending on service	
	function handleResponse(jsonDoc) {
		supportedServices[service](jsonDoc);
	}
	
	//parse the response and pass it back to the external.
	function storyList(jsonDoc) {
		
		if(!jsonDoc) {	//bail if its an error
			thisPtr.outputError("bang");
			return;		
		} else {
			eval('var responseJSON='+jsonDoc);
		}	
		
		for(var i=0;i<responseJSON.stories.length;i++)
			thisPtr.outputData({"title":responseJSON.stories[i].title,"link":responseJSON.stories[i].link,"description":responseJSON.stories[i].description,"submit_date":responseJSON.stories[i].submit_date,"diggs":responseJSON.stories[i].diggs,"id":responseJSON.stories[i].id,"topic":responseJSON.stories[i].topic,"container":responseJSON.stories[i].container});
	
		thisPtr.outputError("bang");	//done
	}
	
	
	//parse the response and pass it back to the external.
	function eventList(jsonDoc) {
		
		if(!jsonDoc) {	//bail if its an error
			thisPtr.outputError("bang");
			return;		
		} else {
			eval('var responseJSON='+jsonDoc);
		}	
		
		for(var i=0;i<responseJSON.diggs.length;i++)
			thisPtr.outputData({"date":responseJSON.diggs[i].date,"story":responseJSON.diggs[i].story,"id":responseJSON.diggs[i].id,"user":responseJSON.diggs[i].user,"status":responseJSON.diggs[i].status});
	
		thisPtr.outputError("bang");	//done
	}	
	
	//map services to their response handlers.
	var supportedServices={
		"listStories":storyList,
		"listEvents":eventList		
	}	

	//
	function checkSupported() {
		
		if(!thisPtr.service) //no service specified
			return true;
		
		//do check for supported service here- return false if not supported.
		for(var x in supportedServices)
			if(x==thisPtr.service)
				return true;
			
		return false;
	}
			
	//need to fix the infrastructure so returning null causes the object to fail
	if(checkSupported())
		return this;
	else
		return null;
}

/***
*
*	rss to json.
*	lifted verbatim from http://www.xml.com/2006/09/13/examples/rssajax.js
*
***/

LilyServices._rssService=function() {
	//objects inside the RSS2Item object
	function RSS2Enclosure(encElement)
	{
		if (encElement == null)
		{
			this.url = null;
			this.length = null;
			this.type = null;
		}
		else
		{
			this.url = encElement.getAttribute("url");
			this.length = encElement.getAttribute("length");
			this.type = encElement.getAttribute("type");
		}
	}

	function RSS2Guid(guidElement)
	{
		if (guidElement == null)
		{
			this.isPermaLink = null;
			this.value = null;
		}
		else
		{
			this.isPermaLink = guidElement.getAttribute("isPermaLink");
			this.value = guidElement.childNodes[0].nodeValue;
		}
	}

	function RSS2Source(souElement)
	{
		if (souElement == null)
		{
			this.url = null;
			this.value = null;
		}
		else
		{
			this.url = souElement.getAttribute("url");
			this.value = souElement.childNodes[0].nodeValue;
		}
	}

	//object containing the RSS 2.0 item
	function RSS2Item(itemxml)
	{
		//required
		this.title;
		this.link;
		this.description;

		//optional vars
		this.author;
		this.comments;
		this.pubDate;

		//optional objects
		this.category;
		this.enclosure;
		this.guid;
		this.source;

		var properties = new Array("title", "link", "description", "author", "comments", "pubDate");
		var tmpElement = null;
		for (var i=0; i<properties.length; i++)
		{
			tmpElement = itemxml.getElementsByTagName(properties[i])[0];
			if (tmpElement != null && tmpElement.childNodes && tmpElement.childNodes[0])
				eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
		}

		this.category = new RSS2Category(itemxml.getElementsByTagName("category")[0]);
		this.enclosure = new RSS2Enclosure(itemxml.getElementsByTagName("enclosure")[0]);
		this.guid = new RSS2Guid(itemxml.getElementsByTagName("guid")[0]);
		this.source = new RSS2Source(itemxml.getElementsByTagName("source")[0]);
	}

	//objects inside the RSS2Channel object
	function RSS2Category(catElement)
	{
		if (catElement == null)
		{
			this.domain = null;
			this.value = null;
		}
		else
		{
			this.domain = catElement.getAttribute("domain");
			this.value = catElement.childNodes[0].nodeValue;
		}
	}

	//object containing RSS image tag info
	function RSS2Image(imgElement)
	{
		if (imgElement == null)
		{
		this.url = null;
		this.link = null;
		this.width = null;
		this.height = null;
		this.description = null;
		}
		else
		{
			imgAttribs = new Array("url","title","link","width","height","description");
			for (var i=0; i<imgAttribs.length; i++)
				if (imgElement.getAttribute(imgAttribs[i]) != null)
					eval("this."+imgAttribs[i]+"=imgElement.getAttribute("+imgAttribs[i]+")");
		}
	}

	//object containing the parsed RSS 2.0 channel
	this.RSS2Channel=function(rssxml)
	{
		//required
		this.title;
		this.link;
		this.description;

		//array of RSS2Item objects
		this.items = new Array();

		//optional vars
		this.language;
		this.copyright;
		this.managingEditor;
		this.webMaster;
		this.pubDate;
		this.lastBuildDate;
		this.generator;
		this.docs;
		this.ttl;
		this.rating;

		//optional objects
		this.category;
		this.image;

		var chanElement = rssxml.getElementsByTagName("channel")[0];
		var itemElements = rssxml.getElementsByTagName("item");

		for (var i=0; i<itemElements.length; i++)
		{
			Item = new RSS2Item(itemElements[i]);
			this.items.push(Item);
			//chanElement.removeChild(itemElements[i]);
		}

		var properties = new Array("title", "link", "description", "language", "copyright", "managingEditor", "webMaster", "pubDate", "lastBuildDate", "generator", "docs", "ttl", "rating");
		var tmpElement = null;
		for (var i=0; i<properties.length; i++)
		{
			tmpElement = chanElement.getElementsByTagName(properties[i])[0];
			if (tmpElement!= null && tmpElement.childNodes && tmpElement.childNodes[0])
				eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
		}

		this.category = new RSS2Category(chanElement.getElementsByTagName("category")[0]);
		this.image = new RSS2Image(chanElement.getElementsByTagName("image")[0]);
	}
}

