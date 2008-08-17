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

/*
	Script: xhr.js
		Contains LilyComponents.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/

if(!LilyComponents) {
	var LilyComponents = {};
}

/*
	Constructor: _xhr
		create a new xhr instance.

	Arguments: 
		callback - callback- function to handle response.
		returnType - return type- xml or text.
		context - execution context.
		method - http method- post, get, etc.
		async - boolean- async.
		reqHeader - request headers.
	
	Returns: 
		returns xhr instance.
*/
LilyComponents._xhr=function(callback,returnType,context,method,async,reqHeader) {

	this.req=null;
	var rType=returnType;
	var thisPtr=this;
	this.method=method||"GET";
	this.async=(typeof async!="undefined")?async:true;
	var requestHeader=reqHeader||null;
	
	function translateToBinaryString(text){
		var out='';
		for(i=0;i<text.length;i++) {
			//*bugfix* by Marcus Granado 2006 [http://mgran.blogspot.com] adapted by Thomas Belot
			out+=String.fromCharCode(text.charCodeAt(i) & 0xff);
		}
		return out;
	}
		
	this.processReqChange=function() {
		//LilyDebugWindow.print(thisPtr.req.readyState);
		// only if req shows "loaded"
		if (thisPtr.req.readyState == 4) {
			// only if "OK"
			if (thisPtr.req.status == 200||thisPtr.req.status==0) {
				if(rType=="text") {	
					callback.apply(context,[thisPtr.req.responseText]);
				} else if(rType=="json") {
					callback.apply(context,[LilyUtils.parseJSON(thisPtr.req.responseText)]);
				} else if(rType=="bin")	{
					callback.apply(context,[translateToBinaryString(thisPtr.req.responseText)]);			
				} else {
					callback.apply(context,[thisPtr.req.responseXML]);
				}	
			} else {
				LilyDebugWindow.error("There was a problem retrieving the data:\n" + thisPtr.req.status + " " + thisPtr.req.statusText);
				LilyDebugWindow.error(thisPtr.req.responseText)				
				callback.apply(context,[null]);
			}
		}
	}

	this.loadXMLDoc=function(url,data) {
				
		var dataToSend=data||"";		

		netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");	
		// branch for native XMLHttpRequest object
		if(window.XMLHttpRequest) {
			try {
				this.req = new XMLHttpRequest();
			} catch(e) {
				LilyDebugWindow.error("Couldn't create XMLHttpRequest "+ e.message)
				this.req = false;
				
			}
		// branch for IE/Windows ActiveX version
		} else if(window.ActiveXObject) {
			try {
				this.req = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				try {
					this.req = new ActiveXObject("Microsoft.XMLHTTP");
				} catch(e) {
					this.req = false;
				}
			}
		}
		if(this.req) {
			
			this.req.onreadystatechange = thisPtr.processReqChange;			
			
			if(this.req.overrideMimeType&&rType=="xml")
				this.req.overrideMimeType('text/xml');
				
			if(this.req.overrideMimeType&&rType=="bin")
				this.req.overrideMimeType('text/plain; charset=x-user-defined');
				//XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com] 	
			
			this.req.open(this.method, LilyUtils.stripLTQuotes(url), this.async);
			
			if(requestHeader)
				for(var i=0;i<requestHeader.length;i++)
					this.req.setRequestHeader(requestHeader[i].name,requestHeader[i].value);
					
			this.req.send(dataToSend);
//			LilyDebugWindow.print(requestHeader);
			//if synchronous apply callback here
			if(!this.async) {
				if(rType=="text") {	
					callback.apply(context,[thisPtr.req.responseText]);
				} else if(rType=="json") {
					callback.apply(context,[LilyUtils.parseJSON(thisPtr.req.responseText)]);
				} else if(rType=="bin") {
					callback.apply(context,[translateToBinaryString(thisPtr.req.responseText)]);			
				} else {
					callback.apply(context,[thisPtr.req.responseXML]);	
				}				
			}
		}
	}
	return this;
}