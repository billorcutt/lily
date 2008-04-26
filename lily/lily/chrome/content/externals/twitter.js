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
*	Construct a new twitter object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $twitter(login)
{
	
	//new Date().toUTCString().split(" ").join("+") //http formatted date string- might come in handy...

	var thisPtr=this;	
	
	if(!login) {
		var credentials = "";
		LilyDebugWindow.error("No login credentials supplied. Twitter object arguments must be a valid Twitter user/pass in the form username:password");
		return;	
	} else {
		var credentials = login;		
	} 
	
	var url="http://twitter.com/statuses";
	
	//for polling
	var pollingID=null;
	var polling=false;
	var interval=60000;
	var lastCheck=new Date().toUTCString().split(" ").join("+"); //set date onload
	
	this.inlet1=new this.inletClass("inlet1",this,"methods:\"public-timeline\", \"friends-timeline\", \"user-timeline\", \"friends\", \"user\", \"update\", \"message\", \"getmessages\"");	
	this.outlet1=new this.outletClass("outlet1",this,"results as json");
	this.outlet2=new this.outletClass("outlet2",this,"bang on complete");
		
	//get
	this.xhr1=new LilyUtils._xhr(outputResponse1,"text",this,"GET",true,[{name:"Authorization",value:"Basic "+ window.btoa(credentials)}]);
	//post
	this.xhr2=new LilyUtils._xhr(outputResponse2,"text",this,"POST",true,[{name:"Content-Type",value:"application/x-www-form-urlencoded"},{name:"Authorization",value:"Basic "+ window.btoa(credentials)}]);
		
	//public timeline	
	this.inlet1["public-timeline"]=function(){ 
		thisPtr.xhr1.loadXMLDoc(url+"/public_timeline.json?rand="+ran()); 
	}
	
	//your friends timeline or another users friendster timeline
	this.inlet1["friends-timeline"]=function(str){
		if(typeof str=="undefined"||!str)		
			thisPtr.xhr1.loadXMLDoc(url+"/friends_timeline.json?rand="+ran());
		else
			thisPtr.xhr1.loadXMLDoc(url+"/friends_timeline/"+str+".json?rand="+ran()); 	
	}
	
	//your timeline or a specified users timeline- str is a user id.
	this.inlet1["user-timeline"]=function(str){
		if(typeof str=="undefined"||!str)			
			thisPtr.xhr1.loadXMLDoc(url+"/user_timeline.json?rand="+ran());
		else
			thisPtr.xhr1.loadXMLDoc(url+"/user_timeline/"+str+".json?rand="+ran());
	}	
	
	//get your friends or someone elses friends most recent status
	this.inlet1["friends"]=function(str){
		if(typeof str=="undefined"||!str)
			thisPtr.xhr1.loadXMLDoc(url+"/friends.json?rand="+ran());
		else
			thisPtr.xhr1.loadXMLDoc(url+"/friends/"+str+".json?rand="+ran()); 	
	}
	
	//get your or some one elses most recent status
	this.inlet1["user"]=function(str){ 
		if(typeof str=="undefined"||!str)			
			thisPtr.xhr1.loadXMLDoc(url+"/user_timeline.json?count=1&rand="+ran());
		else
			thisPtr.xhr1.loadXMLDoc(url+"/user_timeline/"+str+".json?count=1&rand="+ran());
	}
	
	//update status
	this.inlet1["update"]=function(str){ 
		thisPtr.xhr2.loadXMLDoc(url+"/update.json","status="+str); 
	}				
	
	//send a direct message	
	this.inlet1["message"]=function(str){
		var tmp = str.split(" ");
		var id = tmp.shift(); //user id is the first word in the string.
		var mess = tmp.join(" "); //the rest is message.
		thisPtr.xhr2.loadXMLDoc("http://twitter.com/direct_messages/new.json","user="+id+"&text="+mess); 
	}
	
	//retrieve your direct messages	- poll param determines whether or not to poll for the messages.
	this.inlet1["getmessages"]=function(poll){
		
		if(typeof poll=="undefined"||!poll) { //if not polling then just grab it.
			thisPtr.xhr1.loadXMLDoc("http://twitter.com/direct_messages.json?rand="+ran());
			lastCheck=new Date().toUTCString().split(" ").join("+"); //update the clock
		} else if(poll=="start"&&polling==false) { //its time to start
			pollingID=setInterval(pollMessages,interval);
			polling=true;		
		} else if(poll=="stop"&&polling==true) {
			clearInterval(pollingID);
			polling=false;		
		}
		  
	}
	
	function pollMessages() {		
		thisPtr.xhr1.loadXMLDoc("http://twitter.com/direct_messages.json?since="+lastCheck+"rand="+ran());
		lastCheck=new Date().toUTCString().split(" ").join("+"); //update the clock			
	}
			
	//random number.
	function ran() {
		return Date.now();
	}	
	
	function outputResponse1(json) {
			
		if(typeof json!="undefined"&&json) {
			
			try {
				eval("var timeline = ("+json+")");	
			} catch(e) {
				LilyDebugWindow.error(e.name + ": " + e.message);
			}
			
			for(var i=0;i<timeline.length;i++) {
				this.outlet1.doOutlet(timeline[i]);
			}
			
			if(timeline.length)	
				this.outlet2.doOutlet("bang");
		}
						
	}
	
	function outputResponse2(json) {
		//response from post
//		LilyDebugWindow.print(json);
		this.outlet2.doOutlet("bang");
	}		
	
	return this;
}

var $twitterMetaData = {
	textName:"twitter",
	htmlName:"twitter",
	objectCategory:"Web Service",
	objectSummary:"Send SMS and IM messages using the Twitter Web API.",
	objectArguments:"Twitter login credentials in the form \"username:password\""
}