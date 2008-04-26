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
*	Construct a new oscreceive object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $oscreceive(param)
{
	var thisPtr=this;		
	var port = param||8989;
		
	this.outlet1 = new this.outletClass("outlet1",this,"received messages");
	this.handler = function(msg) {
		thisPtr.outlet1.doOutlet(parseXML(msg));
	}	
	
	//get the service 
	var oscservice = Components.classes["@components.lilyapp.org/osc-service;1"]
        .getService(Components.interfaces.nsILilyService).wrappedJSObject;

	//initialize- params: obj id, callback, osc-port, debug, namespace, window, debugwindow
	oscservice.initialize(this.objID, this.handler, port, Lily.debug, Lily.nameSpace, window, LilyDebugWindow);
	
	function parseXML(str) {
		var xml_doc = LilyUtils.parseXML(str);
		var parsed_str = "";
		if(xml_doc) {
			var namespace_element = xml_doc.getElementsByTagName("MESSAGE");
			parsed_str = namespace_element[0].getAttribute("NAME") + " ";
			var args = xml_doc.getElementsByTagName("ARGUMENT");
			for(var i=0;i<args.length;i++) {
				parsed_str += args[i].getAttribute("VALUE") + " ";
			}	
		}
		return parsed_str;
	}
	
	//clean up
	this.destructor=function() {
		oscservice.shutdown(this.objID,port,this.handler);
	}			
	
	return this;
}

var $oscreceiveMetaData = {
	textName:"oscreceive",
	htmlName:"oscreceive",
	objectCategory:"Network",
	objectSummary:"Receive Open Sound Control messages.",
	objectArguments:"port [8989], address [/]"
}