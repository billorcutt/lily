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
*	Construct a new http object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $http()
{
	var thisPtr=this;
	
	this.outlet1 = new this.outletClass("outlet1",this,"request data as a hash with keys: url, referrer, method");
	this.outlet2 = new this.outletClass("outlet2",this,"response data as a hash with keys: url, referrer, method, date, content-type, content-length");	
	
	var HTTPChannel = { 

	    //This is called when the window has finished loading 
	    onLoad : function() { 
	        var observerService = Components.classes["@mozilla.org/observer-service;1"] 
	                                .getService(Components.interfaces.nsIObserverService); 
	        observerService.addObserver(this, "http-on-modify-request", false); 
			observerService.addObserver(this, "http-on-examine-response", false); 
	    }, 

	    //Called when this Mozilla window is closed 
	    onUnload : function() { 
	        var observerService = Components.classes["@mozilla.org/observer-service;1"] 
	                                .getService(Components.interfaces.nsIObserverService); 
	        observerService.removeObserver(httpRequestObserver, "http-on-modify-request"); 
	        observerService.removeObserver(httpRequestObserver, "http-on-examine-response"); 	
	    }, 

	    //This function implements the nsIObserver interface 
	    observe : function(aSubject, aTopic, aData) { 
	        if (aTopic == "http-on-modify-request") { 
	            var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
				thisPtr.outlet1.doOutlet({
					url:httpChannel.originalURI.spec,
					referrer:(httpChannel.referrer)?httpChannel.referrer.spec:null,
					method:httpChannel.requestMethod
				});
	        } else if (aTopic == "http-on-examine-response") { 
		            var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel); 
					thisPtr.outlet2.doOutlet({
						url:httpChannel.originalURI.spec,
						referrer:(httpChannel.referrer)?httpChannel.referrer.spec:null,
						method:httpChannel.requestMethod,
			            date:httpChannel.getResponseHeader('date'),
			            contentType:httpChannel.getResponseHeader('content-type'),
			            contentLength:httpChannel.getResponseHeader('content-length')				
					});		
					
			}
	    } 
	};		
	
	HTTPChannel.onLoad(); 
	window.addEventListener("unload", function(event) { HTTPChannel.onUnload(); }, false);	
	
	this.destructor=function() {
		HTTPChannel.onUnload();
	}	
	
	return this;
}

var $httpMetaData = {
	textName:"http",
	htmlName:"http",
	objectCategory:"System",
	objectSummary:"Output the details of host window's http activity.",
	objectArguments:""	
	
}