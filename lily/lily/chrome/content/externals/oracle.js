//http://rss.brainydictionary.com/link/wordoftheday.rss

/**
*	Construct a new oracle object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $oracle()
{
	var thisPtr=this;
	var url="http://wordie.org/random";
	
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs the word of the day");
	this.outlet1 = new this.outletClass("outlet1",this,"word of the day");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete or error");		
	
	var xhr=new LilyComponents._xhr(outputResponse,"text",this);
	
	this.inlet1["bang"]=function(){ xhr.loadXMLDoc(url); }
	
	function outputResponse(txt) {

		if(txt) {
			var wordMatch = txt.match(/<h1>(\w+)<\/h1>/i)
			if(wordMatch && wordMatch.length==2) this.outlet1.doOutlet(wordMatch[1]);
		}
		this.outlet2.doOutlet("bang");	//done
	}
	
	return this;
}

var $oracleMetaData = {
	textName:"oracle",
	htmlName:"oracle",
	objectCategory:"Web Service",
	objectSummary:"Word a day web service.",
	objectArguments:""
}
