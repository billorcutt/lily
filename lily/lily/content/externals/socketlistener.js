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
*	Construct a new socketlistener object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $socketlistener(port)
{
	var thisPtr=this;	
	var listener_port=parseInt(port)||9001;

	var outstream = null;
	var instream = null;	
	var serverSocket = null;
	var busy = false;
	var running = false;
	
	this.outlet1 = new this.outletClass("outlet1",this,"message to write to socket");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on connect");	
	this.inlet1=new this.inletClass("inlet1",this,"message to read from socket");
	
	function server_start() {
		
		if(running) {
			LilyDebugWindow.error("socketlistener on port " + listener_port + " is already started.");
			return;
		} else {
			running=true;
		}
		
		var listener = {
			onSocketAccepted : function(socket, transport) {
				
				//this doesn't work...
				if(busy) {
					LilyDebugWindow.error("socketlistener on port " + listener_port + " busy");
					return;
				} else {
					busy=true;
				}
				
				try {
					outstream = transport.openOutputStream(0,0,0);
					var stream = transport.openInputStream(0,0,0);
					instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
					instream.init(stream);
					thisPtr.outlet2.doOutlet("bang");				
				} catch(ex2) { 
					LilyDebugWindow.error("::"+ex2); 
				}

				var dataListener = {
					data : "",
					onStartRequest: function(request, context){},
					onStopRequest: function(request, context, status) {},
					onDataAvailable: function(request, context, inputStream, offset, count) {
						this.data = instream.read(count);
						//LilyDebugWindow.print("data received is \""+this.data+"\"");
						thisPtr.outlet1.doOutlet(this.data); //
					}
				}; //close dataListener

				var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
				pump.init(stream, -1, -1, 0, 0, false);
				pump.asyncRead(dataListener,null);

			},
			onStopListening : function(socket, status){
				busy=false;
			}
		}; //close listener 

		try {
			serverSocket = Components.classes["@mozilla.org/network/server-socket;1"].createInstance(Components.interfaces.nsIServerSocket);
			serverSocket.init(listener_port,false,-1);
			serverSocket.asyncListen(listener);
		} catch(ex) { 
			LilyDebugWindow.error(ex); 
		}
	}

	function server_stop() {
		if(serverSocket) {
			serverSocket.close();
			serverSocket=null;
			running=false;
		}
		
		if(instream) {
			instream.close();
			instream=null;	
		}
		
		if(outstream) {
			outstream.close();
			outstream=null;
		}		
			
	}

	//clean up
	this.destructor=function() {
		server_stop();		
	}			
	
	//write to socket
	this.inlet1["anything"]=function(msg) {
		if(running&&outstream) 
			outstream.write(msg,msg.length);
		else
			LilyDebugWindow.error("socketlistener: no sockets connected.")
	}	
	
	server_start(); //start on it.
	
	return this;
}

var $socketlistenerMetaData = {
	textName:"socketlistener",
	htmlName:"socketlistener",
	objectCategory:"Network",
	objectSummary:"Network Socket Listener.",
	objectArguments:"port [9001]"	
	
}