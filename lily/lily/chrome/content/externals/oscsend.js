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
*	Construct a new oscsend object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $oscsend(param)
{
	var thisPtr=this;	
			
	var host = param.split(" ")[0]||"127.0.0.1";
	var port = parseInt(param.split(" ")[1])||8989;
		
	this.inlet1=new this.inletClass("inlet1",this,"messages to send");
	
	//get the service 
	var oscservice = Components.classes["@components.lilyapp.org/osc-service;1"]
        .getService(Components.interfaces.nsILilyService).wrappedJSObject;

	//initialize- params: obj id, callback, osc-port, debug, namespace, window
	oscservice.initialize(this.objID, null, port, LilyApp.debug, LilyApp.nameSpace, window, LilyDebugWindow);
	
	//send the message
	this.inlet1["anything"]=function(msg) {
		oscservice.sendOSC(port,buildPacket(msg));
	}
	
	function getArgType(arg) {
		if(!isNaN(+arg)) {
			if(arg.toString().indexOf(".")!=-1) {
				return "f";
			} else {
				return "i";
			}
		} else {
			return "s";
		}
	}
	
	function buildPacket(msg) {
		
		var msgArr = LilyUtils.splitArgs(msg);
		var msgName = msgArr.shift();
		
		var xml_str = '';
		xml_str += '<OSCPACKET ADDRESS="'+host+'" PORT="'+port+'" TIME="0">';
		xml_str += '	<MESSAGE NAME="'+msgName+'">';
		
		for(var i=0;i<msgArr.length;i++) {
			xml_str += '		<ARGUMENT TYPE="'+getArgType(msgArr[i])+'" VALUE="'+encodeURIComponent(LilyUtils.stripLTQuotes(msgArr[i]))+'" />';
		}
		
		xml_str += '	</MESSAGE>';
		xml_str += '</OSCPACKET>';
		
		return xml_str;
	}
	
	//clean up
	this.destructor=function() {
		oscservice.shutdown(this.objID,port,null);
	}		
	
	return this;
}

var $oscsendMetaData = {
	textName:"oscsend",
	htmlName:"oscsend",
	objectCategory:"Network",
	objectSummary:"Send Open Sound Control messages.",
	objectArguments:"host [127.0.0.1], port [8989]"
}