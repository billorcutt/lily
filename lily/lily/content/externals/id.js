/**
*	Construct a new id object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $id(filter)
{
	var thisPtr=this;
	var filter=filter||"1";
	var url="http://www.dogpile.com/info.dogpl/searchspy/inc/data.xml?qcat=web&filter="+filter;
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs most recent queries");
	this.outlet1 = new this.outletClass("outlet1",this,"most recent queries");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete or error");		
	this.xhr=new LilyUtils._xhr(outputResponse,"xml",this);
	
	this.inlet1["bang"]=function(){ thisPtr.xhr.loadXMLDoc(url+ "&timestamp=" +new Date().getTime()); }
	
	function outputResponse(xmlDoc) {
		
		if(!xmlDoc) {	//bail if its an error
			thisPtr.outlet2.doOutlet("bang");
			return;		
		}					
		
		var queryList=xmlDoc.getElementsByTagName("query");		
		
		for(var i=0;i<queryList.length;i++) {
			this.outlet1.doOutlet(queryList[i].firstChild.nodeValue);
		}
		
		thisPtr.outlet2.doOutlet("bang");	//done
	}	
	
	return this;
}

var $idMetaData = {
	textName:"id",
	htmlName:"id",
	objectCategory:"Web Service",
	objectSummary:"Get the most recent search queries to Dogpile.com",
	objectArguments:"filter queries (0/1) [1]"
}
