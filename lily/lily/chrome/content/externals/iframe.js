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
*	Construct a new iframe object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $iframe(args)
{
	var thisPtr=this;
	this.allowFont=false; //dont allow font changes	
	
	this.src = LilyUtils.stripLTQuotes(args.split(" ")[0])||"chrome://lily/content/blank.html";
	this.noBorders = (args.split(" ")[1]&&(args.split(" ")[1]=="false"))?false:true;
	
	this.setInspectorConfig([
		{name:"src",value:thisPtr.src,label:"Src",type:"string",input:"text"},
		{name:"noBorders",value:true,label:"No Borders",type:"boolean",input:"checkbox"}		
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+vals["src"]+" "+vals["noBorders"];

		if(iframe)iframe.objFrame.src=processURL(LilyUtils.stripLTQuotes(vals["src"]));
		setBorders(vals["noBorders"]);
			
	}	
	
	this.outlet1 = new this.outletClass("outlet1",this,"data sent from iframe content");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on load");
	this.inlet1=new this.inletClass("inlet1",this,"input sets the frame src, \"write\" writes content to the iframe");

	//_iframe contains the iframe html, ui property is a necessary placeholder, must'nt be null.
	this.ui={};	
	var iframe=new LilyComponents._iframe(this,this.src,null,null,null,frameInit);

	function processURL(url) {
		
		//if there's a protocol, we're done...
		if(LilyUtils.containsProtocol(url))
			return url;	
			
		//otherwise look for it in the file system.
		var path = LilyUtils.getFilePath(url);	
			
		if(path) 
			return encodeURI("file://"+path);
		else
			return "chrome://lily/content/blank.html";
		
	}
	
	//set the src
	this.inlet1["anything"]=function(src) {
		iframe.objFrame.src=processURL(LilyUtils.stripLTQuotes(src));
	}
	
	//set the src
	this.inlet1["resize"]=function(src) {

		var h = iframe.objFrame.contentWindow.innerHeight+iframe.objFrame.contentWindow.scrollMaxY;
		var w = iframe.objFrame.contentWindow.innerWidth+iframe.objFrame.contentWindow.scrollMaxX;		
				
		thisPtr.setHeight(h);
		thisPtr.setWidth(w);		
		
	}	
	
	//set the src
	this.inlet1["write"]=function(str) {
		iframe.objFrame.contentWindow.document.open();
		iframe.objFrame.contentWindow.document.write(str);
		iframe.objFrame.contentWindow.document.close();				
	}
	
	//set the src
	this.inlet1["obj"]=function(obj) {
		if(typeof iframe.objFrame.contentWindow.receiveData=="function") {
			iframe.objFrame.contentWindow.receiveData(obj);
		}	
	}	
	
	function setBorders(b) {
		thisPtr.controller.setNoBorders(b);
	}	
	
	function frameInit() {
		setHandlers();
	}
	
	function setHandlers() {
		iframe.objFrame.contentWindow.sendData=function(id,data) {
			if(id && data) {
				thisPtr.outlet1.doOutlet({target:id,data:data});	
			}	
		}	
	}
	
	//bang on load
	function frameLoad() {
		setHandlers(); //reset the handlers	
		thisPtr.outlet2.doOutlet("bang"); //bang on page load.
	}
	
	iframe.objFrame.addEventListener("load",frameLoad,false);	
	this.controller.setNoBorders(this.noBorders);	
	
	return this;
}

var $iframeMetaData = {
	textName:"iframe",
	htmlName:"iframe",
	objectCategory:"UI",
	objectSummary:"Display a web page or HTML in a patch.",
	objectArguments:""
}