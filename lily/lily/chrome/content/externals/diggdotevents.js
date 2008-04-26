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
*	Construct a new digg.events object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $diggdotevents(num)
{
	
	var thisPtr=this;	
	var rowsToFetch=parseInt(num)||1;
	
	//instantiate a new flickr
	var diggService=new LilyServices._diggService(this,"listEvents",rowsToFetch);	

	this.inlet1=new this.inletClass("inlet1",this,"methods: \"story\", \"storyID\", \"popular\", \"upcoming\"");		
	this.outlet1 = new this.outletClass("outlet1",this,"each result as hash {date, story, id, user, status}");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete or error");

	
	//define methods for output & error/completion
	diggService.outputData=function(digg) {
		thisPtr.outlet1.doOutlet(digg);
	}
	diggService.outputError=function() {
		thisPtr.outlet2.doOutlet("bang");
	}		
	
	function doAction(method,methodArgs,args) {
		
		var page = args.split(" ")[0]||null;
		var num = args.split(" ")[1]||null;
		var start = args.split(" ")[2]||null;
		var end = args.split(" ")[3]||null;	
		var sort = args.split(" ")[4]||null;

		diggService.listEvents(method,methodArgs,page,num,start,end,sort);

	}
	
	//helper- extract the method arguments
	function getMethodArg(str) {
		
		var arr = str.split(" ");
		var methodArg = arr.shift();
		var args = arr.join(" ");
		return [methodArg,args];
	
	}
	
	this.inlet1["story"]=function(str) {
		
		/*
			GET /stories/diggs
			All diggs.
		*/
		
		doAction("story",null,str);
		
	}	
		
	this.inlet1["storyID"]=function(msg) {
		
		//takes a comma seperated list of story ids to fetch- required.
		
		/*
		All diggs for a given story.
		404 Not Found response if the story does not exist.
		
		GET /stories/{comma-separated list of story ids}/diggs
		All diggs for a list of stories with the given ids. (E.g., GET /stories/984,1489,8575,174/diggs)
		*/
		
		var tmp = getMethodArg(msg);		
		doAction("storyID",tmp[0],tmp[1]);
		
	}
		
	this.inlet1["popular"]=function(msg) {

		/*
		GET /stories/popular/diggs
		All diggs on popular stories.		
		*/

		doAction("popular",null,msg);
	}		

	this.inlet1["upcoming"]=function(msg) {

		/*
		GET /stories/upcoming/diggs
		All diggs on upcoming stories.		
		*/

		doAction("upcoming",null,msg);
	}	
	
	return this;

}

var $diggdoteventsMetaData = {
	textName:"digg.events",
	htmlName:"digg.events",
	objectCategory:"Web Service",
	objectSummary:"Get digg data using the Digg Web API.",
	objectArguments:"number of rows to fetch [1]"
}