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
*	Construct a new launchURL object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $launchurl(args)
{
	var thisPtr=this;
	this.args=args||"";	
	var argsArr=args.split(" ");
	
	this.fontColor="blue"; //override the default color
	
	if(!args.length) {
		LilyDebugWindow.error("The object launchurl requires at least one argument- the url to be launched.");
		return;
	}

	this.linkURL=(argsArr[0])?argsArr.shift():""; //label text	
	this.linkText=(argsArr[0])?argsArr.join(" "):""; //label text
	
	this.setInspectorConfig([
		{name:"linkURL",value:thisPtr.linkURL,label:"Link URL",type:"string",input:"textarea"},
		{name:"linkText",value:thisPtr.linkText,label:"Link Text",type:"string",input:"textarea"}		
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+vals["linkURL"]+" "+vals["linkText"];
		
		this.displayElement.href=vals["linkURL"];
		this.displayElement.innerHTML=LilyUtils.makeSafe((vals["linkText"])?vals["linkText"]:vals["linkURL"]);
	}
	
	function clickFunc() {
		
		if(LilyUtils.containsProtocol(thisPtr.linkURL)) {
			window.open(thisPtr.linkURL,null);
		} else if(/\.json$/.test(thisPtr.linkURL)) {
			thisPtr.parent.open(thisPtr.linkURL);
		}
				
	}	
	
	//custom html
	this.ui=new LilyObjectView(this,"<a href=\"#\" style=\"white-space:nowrap;color:blue;text-decoration:underline;cursor:pointer\" onclick=\"event.preventDefault();\" id=\""+ this.createElID("launchURL") +"\"></a>");
	this.ui.draw();
	
	this.displayElement=thisPtr.ui.getElByID(thisPtr.createElID("launchURL"));
	this.displayElement.href=this.linkURL;
	this.displayElement.innerHTML=LilyUtils.makeSafe((this.linkText)?this.linkText:this.linkURL);
	this.controller.attachObserver(thisPtr.createElID("launchURL"),"click",clickFunc,"performance");
	this.controller.setNoBorders(true);	
	
	return this;
}

var $launchurlMetaData = {
	textName:"launchurl",
	htmlName:"launchurl",
	objectCategory:"UI",
	objectSummary:"Open a url in browser.",
	objectArguments:"[url to launch],text to link"
}