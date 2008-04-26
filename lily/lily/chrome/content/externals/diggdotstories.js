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
*	Construct a new digg.stories object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $diggdotstories(num)
{
	
	var thisPtr=this;	
	var rowsToFetch=parseInt(num)||1;
	
	//instantiate a new digg service
	var diggService=new LilyServices._diggService(this,"listStories",rowsToFetch);	

	this.inlet1=new this.inletClass("inlet1",this,"methods:\"story\", \"storyID\", \"storyTitle\", \"popular\", \"upcoming\", \"container\", \"popularContainer\", \"upcomingContainer\", \"topic\",  \"popularTopic\", \"upcomingTopic\"");	
	this.outlet1 = new this.outletClass("outlet1",this,"each result as hash {title, link, description, submit_date, diggs, id, topic, container}");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete or error");
	
	//define methods for output & error/completion
	diggService.outputData=function(story) {
		thisPtr.outlet1.doOutlet(story);
	}
	diggService.outputError=function() {
		thisPtr.outlet2.doOutlet("bang");
	}		
	
	function doAction(method,methodArgs,args) {
		var page = args.split(" ")[0]||null;
		var num = args.split(" ")[1]||null;
		var start = args.split(" ")[2]||null;
		var end = args.split(" ")[3]||null;	
		var startPromo = args.split(" ")[4]||null;
		var endPromo = args.split(" ")[5]||null;	
		var sort = args.split(" ")[6]||null;
		var site = args.split(" ")[7]||null;
		var url = args.split(" ")[8]||null;	
		
		//endpoint,argsToEndPoint,num,page,startSubmitDate,endSubmitDate,startPromoteDate,endPromoteDate,sortBy,site,url
		diggService.listStories(method,methodArgs,page,num,start,end,startPromo,endPromo,sort,site,url);
	}
	
	function getMethodArg(str) {
		
		var arr = str.split(" ");
		var methodArg = arr.shift();
		var args = arr.join(" ");
		
		return [methodArg,args];
		
	}
	
	this.inlet1["story"]=function(str) {
		
		/*
			GET /stories
			All stories.
		*/
		
		doAction("story",null,str);
		
	}	
		
	this.inlet1["storyID"]=function(msg) {
		
		//takes a comma seperated list of story ids to fetch- required.
		
		/*
			GET /story/{story id}
			Identified story.
			404 Not Found for non-existent story.

			GET /stories/{comma-separated list of story ids}
			A list of stories with the given ids. (E.g., GET /stories/984,1489,8575,174)
			403 Forbidden with explanatory message for more than 100 ids.
		*/
		
		var tmp = getMethodArg(msg);		
		doAction("storyID",tmp[0],tmp[1]);
		
	}
	
	this.inlet1["storyTitle"]=function(msg) {
		
		//takes a story title- required
			
		/*
			GET /story/{story clean title}
			Identified story.
			The "clean title" is the story's title as it appears in the story's URL on digg.com. The clean title is assigned by digg.com when the story is submitted. It is formed as follows:
			Characters other than A through Z and 0 through 9 are replaced with spaces.
			Leading and trailing spaces are discarded.
			Each instance of one or more spaces is replaced by a single underscore.
			If the resulting clean title is already used by another story, an underscore and a number are appended.
			Generally, this endpoint is used to obtain the details of a story for which the URL on digg.com is known.
			404 Not Found for non-existent story.
		*/
		
		var tmp = getMethodArg(msg);		
		doAction("storyTitle",tmp[0],tmp[1]);
		
	}	
	
	this.inlet1["popular"]=function(msg) {

		//GET /stories/popular
		//Popular stories.

		doAction("popular",null,msg);
	}		

	this.inlet1["upcoming"]=function(msg) {

		//GET /stories/upcoming

		doAction("upcoming",null,msg);
	}	
	
	
	this.inlet1["container"]=function(msg) {
		
		//takes a container name- required		
		
		//GET /stories/container/{container name}
		//All stories from a given container.
		//404 Not Found if the container does not exist.
		
		var tmp = getMethodArg(msg);		
		doAction("container",tmp[0],tmp[1]);
	}
	
	
	this.inlet1["popularContainer"]=function(msg) {
		
		//takes a container name- required			
		
		//GET /stories/container/{container name}/popular
		//Popular stories from a given container.
		//404 Not Found if the container does not exist.
		
		var tmp = getMethodArg(msg);		
		doAction("popularContainer",tmp[0],tmp[1]);
	}
		
	
	this.inlet1["upcomingContainer"]=function(msg) {
		
		//takes a container name- required			
		
		//GET /stories/container/{container name}/upcoming
		//Upcoming stories from a given container.
		//404 Not Found if the container does not exist.
		
		var tmp = getMethodArg(msg);		
		doAction("upcomingContainer",tmp[0],tmp[1]);
	}
	
	
	this.inlet1["topic"]=function(msg) {
		
		//takes a topic name- required			
		
		//GET /stories/topic/{topic name}
		//All stories from a given topic.
		//404 Not Found if the topic does not exist.
		
		var tmp = getMethodArg(msg);		
		doAction("topic",tmp[0],tmp[1]);
	}
	
	
	this.inlet1["popularTopic"]=function(msg) {
		
		//takes a topic name- required			
		
		//GET /stories/topic/{topic name}/popular
		//popular stories from a given topic.
		//404 Not Found if the topic does not exist.
		
		var tmp = getMethodArg(msg);		
		doAction("popularTopic",tmp[0],tmp[1]);
		
	}
		
	
	this.inlet1["upcomingTopic"]=function(msg) {
		
		//takes a topic name- required			
		
		//GET /stories/topic/{topic name}/topic
		//upcoming stories from a given topic.
		//404 Not Found if the topic does not exist.
		
		var tmp = getMethodArg(msg);		
		doAction("upcomingTopic",tmp[0],tmp[1]);
	}	
	
	
	return this;

}

var $diggdotstoriesMetaData = {
	textName:"digg.stories",
	htmlName:"digg.stories",
	objectCategory:"Web Service",
	objectSummary:"Get story data using the Digg Web API.",
	objectArguments:"number of rows to fetch [1]"
}