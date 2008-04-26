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
*	Construct a new httpd object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $httpd(args)
{
	var thisPtr=this;

	this.inlet1=new this.inletClass("inlet1",this,"message is sent as http response, \"bang\" sends an empty response");
	this.inlet2=new this.inletClass("inlet2",this,"\"start\" starts the server, \"stop\" stops it");

	this.outlet1 = new this.outletClass("outlet1",this,"http request");
	
	var port = args.split(" ")[0]||6669;
	var ms = args.split(" ")[1];		
	
	var serverSocket=null; //
	var responseTxt=""; //response data
	var delay=parseInt(ms)||5000; //timeout
	var started=false; //server status
	var cb=null; //callback
	var timer=null; //timeout timer id
		
	this.inlet2["start"]=function() {
		start();
	}
	
	this.inlet2["stop"]=function() {
		stop();
	}
	
	//trigger the server response
	this.inlet1["anything"]=function(msg) {
		responseTxt=msg||""; //assign the response data
		clearTimeout(timer); //clear the timeout
		if(cb) cb(); //exec the callback	
	}
	
	this.inlet1["bang"]=function() {
		responseTxt=""; //assign the response data
		clearTimeout(timer); //clear the timeout
		if(cb) cb(); //exec the callback
	}
		
	function stop()	{
		if (serverSocket) {
			serverSocket.close();
			serverSocket=null;
			started=false;
		}
	}	
	
	function start() {
		
		if(started) //bail if we're already up
			return;

		try{

		    LilyDebugWindow.print("Server started...");
			var sock = Components.classes["@mozilla.org/network/server-socket;1"];
		    serverSocket = sock.createInstance();
		    serverSocket = serverSocket.QueryInterface(Components.interfaces.nsIServerSocket);
		    serverSocket.init(port,true,-1);
		    serverSocket.asyncListen(async_listener);
			started=true;
		
		}	catch (e) {
			LilyDebugWindow.error("Ex: "+e);
		}
		
	}
		
	var async_listener = {
		
		onStopListening : function(socket, status){},		

	  	//called after connection established
		onSocketAccepted: function(serv, transport) {

			try {

				var outstream = transport.openOutputStream(0,1000000,0);
				var stream = transport.openInputStream(0,0,0);
				var instream =    Components.classes["@mozilla.org/scriptableinputstream;1"]
				  .createInstance(Components.interfaces.nsIScriptableInputStream);

				instream.init(stream);

			} catch (e) {
				LilyDebugWindow.error("Error "+e);
		    }

		    var dataListener = {

				data : "",
				return_count : 0,
		      	found_get : 0,
		      	onStartRequest: function(request, context){},
		      	onStopRequest: function(request, context, status) {

			        instream.close();
			        outstream.close();
//			        async_listener.finished(this.data);

				},

				// called when there is new data
				onDataAvailable: function(request, context, inputStream, offset, count) {
										
					this.data = instream.read(count);
//					LilyDebugWindow.print("data received is \""+this.data+"\"");

					if(this.data.match(/GET/)) {
						this.found_get++;
					}

					var re = RegExp("[\n\r]{2}");

			        if(this.data.match(re)) {

						var requested_resource = this.data.match(/GET\s(\S+)\s/)[1];
						
//						LilyDebugWindow.print("requested: "+requested_resource);

						this.return_count++;

						if(this.return_count > 0 && this.found_get) {
														
							request.suspend();
							
							cb=function(){
								
								return function(response){
									
									request.resume();
									outstream.write(response, response.length);
									instream.close();
									outstream.close();
									responseTxt="";
									cb=null;
									timer=null;
									
								}(responseTxt);
								
							};
							
							timer=setTimeout(cb,delay); //timeout in case no input
							thisPtr.outlet1.doOutlet(requested_resource); //output the request- need to prevent more than one resource per request.							
																		
						}
						
					}
					
				}

	    	}; //close dataListener

			// pump takes in data in chunks asynchronously
			var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
			pump.init(stream, -1, -1, 0, 0, false);
			pump.asyncRead(dataListener,null);

		} //close onSocketAccepted

	}; //close async_listener

	return this;
}

var $httpdMetaData = {
	textName:"httpd",
	htmlName:"httpd",
	objectCategory:"Network",
	objectSummary:"HTTP Web server.",
	objectArguments:"port [6669], timeout [5000]"
}