/*----------------------------------------------------------------------
 * This file implements the OSCModule component that exposes the nsILilyService
 * interface. The implementation consists of 2 parts: the component
 * module (acting like an instance factory) and a function that creates
 * instances actually implementing the nsILilyService interface.
 *----------------------------------------------------------------------
 */
  
function _printToJSConsole(msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
}

/*----------------------------------------------------------------------
 * The Module (instance factory)
 *----------------------------------------------------------------------
 */

var OSCModule = {
    /*
     *  VERY IMPORTANT: Modify these first 3 fields to make them unique
     *  to your components. Note that these fields have nothing to
     *  do with the extension ID, nor the IDL interface IDs that the
     *  component implements. A component can implement several interfaces.
     */
    _myComponentID : Components.ID("{b5e11f32-1cc7-4444-aed4-6a2cc0ab765d}"),
    _myName :        "JS Component for Lily OSC externals",
    _myContractID :  "@components.lilyapp.org/osc-service;1",
    
    /*
     *  This flag specifies whether this factory will create only a
     *  single instance of the component.
     */
    _singleton :     true,
    _myFactory : {
        createInstance : function(outer, iid) {
            if (outer != null) {
                throw Components.results.NS_ERROR_NO_AGGREGATION;
            }
            
            var instance = null;
            
            if (this._singleton) {
                instance = this.theInstance;
            }
            
            if (!(instance)) {
                instance = new OSCComponent(); // OSCComponent is declared below
            }
            
            if (this._singleton) {
                this.theInstance = instance;
            }

            return instance.QueryInterface(iid);
        }
    },
    
    registerSelf : function(compMgr, fileSpec, location, type) {
        compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        compMgr.registerFactoryLocation(
            this._myComponentID,
            this._myName,
            this._myContractID,
            fileSpec,
            location,
            type
        );
    },

    unregisterSelf : function(compMgr, fileSpec, location) {
        compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        compMgr.unregisterFactoryLocation(this._myComponentID, fileSpec);
    },

    getClassObject : function(compMgr, cid, iid) {
        if (cid.equals(this._myComponentID)) {
            return this._myFactory;
        } else if (!iid.equals(Components.interfaces.nsIFactory)) {
            throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
        }

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    canUnload : function(compMgr) {
        /*
         *  Do any unloading task you want here
         */
        return true;
    }
}

/*
 *  This function NSGetModule will be called by Firefox to retrieve the
 *  module object. This function has to have that name and it has to be
 *  specified for every single .JS file in the components directory of
 *  your extension.
 */
function NSGetModule(compMgr, fileSpec) {
    return OSCModule;
}




/*----------------------------------------------------------------------
 * The OSC Component, implemented as a Javascript function.
 *----------------------------------------------------------------------
 */

function OSCComponent() {
	
    /*
     *  This is a XPCOM-in-Javascript trick: Clients using an XPCOM
     *  implemented in Javascript can access its wrappedJSObject field
     *  and then from there, access its Javascript methods that are
     *  not declared in any of the IDL interfaces that it implements.
     *
     *  Being able to call directly the methods of a Javascript-based
     *  XPCOM allows clients to pass to it and receive from it
     *  objects of types not supported by IDL.
     */
    this.wrappedJSObject = this;
    this.listener = null;
//    this._initialized = false;
    this._packages = null;
	this.socketCount = 0;
	this.socketRange = [46152,46652]; //port range we'll use internally.
	this.OSCPort = 0;
	this.procs = {}; //
	this.extensionPath = "";
	this.waitBeforeTCPStart = 12000;
	this._platform = "";
		
}

/*
 *  nsISupports.QueryInterface
 */
OSCComponent.prototype.QueryInterface = function(iid) {
    /*
     *  This code specifies that the component supports 2 interfaces:
     *  nsILilyService and nsISupports.
     */
    if (!iid.equals(Components.interfaces.nsILilyService) &&
        !iid.equals(Components.interfaces.nsISupports)) {
        throw Components.results.NS_ERROR_NO_INTERFACE;
    }
    return this;
};

/*
 *  return a new port number.
 */
OSCComponent.prototype._getSocketPort = function(osc_port) {
	
	if(this._portIsAvailable(osc_port)) {
		if((this.socketRange[0]+this.socketCount)<this.socketRange[1]) {
			var count = this.socketCount;
			this.socketCount++;				
			return this.socketRange[0]+count;
		} else {
			var count=this.socketCount=0;
			this.socketCount++;				
			return this.socketRange[0]+count;			
		}	
	} else {
		return this.procs["_"+osc_port]["tcp_port"];
	}
	
};

/*
 *  Create a new socket server that we'll use to talk to the osc proxy
 */
OSCComponent.prototype.socket = function(portNumber, debug) {
	
	var thisPtr=this;
	
	var gHost = "127.0.0.1";
	var gPort = portNumber;
	var gConnected = false;
	
	var gOutstream = null;
	var gInstream = null;
	var gTransport = null;
	
	var LilyDebugWindow = debug;
	
	this._cb = [];	
	
	//listener for a response
	var dataListener = {
		onStartRequest: function(request, context){},
      	onStopRequest: function(request, context, status) {},
      	onDataAvailable: function(request, context, inputStream, offset, count) {
			var data = gInstream.read(count);
			for(var i=0;i<thisPtr._cb.length;i++) {
				if(typeof thisPtr._cb[i] == "function") {
					thisPtr._cb[i](data);	
				}
			}
      	}
    }	
		
	this.start=function() {
		start();
	}
	
	this.stop=function() {
		stop();
	}
	
	this.getPort=function() {
		return gPort;
	}
	
	this.send=function(mess) {
		mess = mess + "\0";
		try {
			gOutstream.write(mess,mess.length);
		} catch(e) { /* do nothing */ }
	}
			
	function stop()	{
		if(gInstream) gInstream.close();
		if(gOutstream) gOutstream.close();
		gTransport=null;
	}	
	
	function start() {
		
		if(gConnected) //bail if we're already up
			return;

		try {
			var transportService =
			  Components.classes["@mozilla.org/network/socket-transport-service;1"]
			    .getService(Components.interfaces.nsISocketTransportService);

			gTransport = transportService.createTransport(null,0,gHost,gPort,null);

			gOutstream = gTransport.openOutputStream(0,0,0);

			var stream = gTransport.openInputStream(0,0,0);
			gInstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
			  .createInstance(Components.interfaces.nsIScriptableInputStream);
			gInstream.init(stream);

			var pump = Components.
			  classes["@mozilla.org/network/input-stream-pump;1"].
			    createInstance(Components.interfaces.nsIInputStreamPump);
			pump.init(stream, -1, -1, 0, 0, false);
			pump.asyncRead(dataListener,null);

			gConnected=true;

		} catch (ex) {
			LilyDebugWindow.error("couldn't create a socket")
			return null;
		}
		return null;	
	}	
};

/*
 *  Initializes this component and starts the OSC proxy.
 */
OSCComponent.prototype.initialize = function (id, listener, osc_port, trace, nameSpace, win, debug) {
	
	var thisPtr=this;
	this._platform = (win.navigator.platform.toLowerCase().indexOf("win") != -1) ? "windows" : "mac-linux" ;
	nameSpace = (nameSpace=="default")?"lily":nameSpace;
    
    this._traceFlag = (trace);
    this._trace("OSCComponent.initialize {");

    try {
	
		var tcp_port = this._getSocketPort(osc_port);
		var wait = (
				typeof thisPtr.procs["_"+osc_port] == "undefined" || 
				thisPtr.procs["_"+osc_port]["socket"]==null
			) ? thisPtr.waitBeforeTCPStart : 10;		
			
		if(this._portIsAvailable(osc_port)) {
						
			this.procs["_"+osc_port] = {
				proc:null,
				pid:0, //not impl
				socket:null,
				clients:[],
				tcp_port:0,
				running:false
			};
						
		    this.extensionPath = this._getExtensionPath(nameSpace);

			this.procs["_"+osc_port]["proc"] = this.startOSCProxy(osc_port,tcp_port,this._platform);
			
			win.setTimeout(function() {
				thisPtr.procs["_"+osc_port]["socket"] = thisPtr._startServer(tcp_port,debug);
				if(listener) thisPtr.procs["_"+osc_port]["socket"]._cb.push(listener);
				thisPtr.procs["_"+osc_port]["running"] = true;
				debug.print("OSC Started");
			},wait);					
							
		} else {
			win.setTimeout(function() {
				if(listener) thisPtr.procs["_"+osc_port]["socket"]._cb.push(listener);
				debug.print("OSC Started");				
			},wait);			
		}
		
		this.procs["_"+osc_port]["tcp_port"]=tcp_port;		
		this.procs["_"+osc_port]["clients"].push(id);
				
    } catch (e) {
        this._fail(e);
        this._trace(this.error);
		return null;
    }

    this._trace("} OSCComponent.initialize");
    
    return true;
};

/*
 *  return bool indicating if a port is in use.
 */
OSCComponent.prototype._portIsAvailable = function(osc_port) {
	return (typeof this.procs["_"+osc_port]=="undefined");
};

/*
 *	Shutdown the OSC service
 */
OSCComponent.prototype.shutdown = function(id,port,listener) {
	
	if(this.procs["_"+port].clients.length==1) {
		if(this.procs["_"+port].proc) {
			this.procs["_"+port].socket.stop();
			this.procs["_"+port].proc.kill(); //not implemented, noop
			this.stopOSCProxy(port);
			delete this.procs["_"+port];
		}		
	} else {
		
		for(var i=0;i<this.procs["_"+port].clients.length;i++) {
			if(this.procs["_"+port].clients[i]==id) {
				this.procs["_"+port].clients.splice(i,1);
			}
		}
		
		for(var i=0;i<this.procs["_"+port].socket._cb.length;i++) {
			if(this.procs["_"+port].socket._cb[i]==listener) {
				this.procs["_"+port].socket._cb.splice(i,1);
			}
		}
	}
	
};

/*
 *	Start the OSC proxy
 */
OSCComponent.prototype.startOSCProxy=function(osc_port, tcp_port) {
	
	try {
		
		var extension = (this._platform!="windows")?".sh":".bat"
	
		var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService); 
		var uri = ios.newURI(this.extensionPath, "", null); 
		var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
		
		file.append("flosc");

		var flosc_dir = file.clone();	
		file.append("flosc"+extension);

		// create an nsIProcess
		var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
		process.init(file);

		// Run the process.
		var args = [flosc_dir.path, osc_port, tcp_port];
		var pid = process.run(false, args, args.length);

		return process;	
		
	} catch(e) {
		
        this._fail(e);
        this._trace(this.error);		
		return null;
		
	}
}

/*
 *	Stop the socket server
 */
OSCComponent.prototype.stopOSCProxy=function(port) {
	
	try {
		
		var extension = (this._platform!="windows")?".sh":".bat"		

		// create an nsILocalFile for the executable
		var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService); 
		var uri = ios.newURI(this.extensionPath, "", null); 
		var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;

		file.append("flosc");	
		file.append("flosc-kill"+extension);

		// create an nsIProcess
		var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
		process.init(file);

		// Run the script to kill the osc proxy
		var args = [port];
		process.run(false, args, args.length);

		return true;	
		
	} catch(e) {
		
        this._fail(e);
        this._trace(this.error);		
		return false;
		
	}
}

/*
 *	Start up the socket server to talk to the osc/tcp proxy
 */
OSCComponent.prototype._startServer = function(port,debug) {
	
	var server = new this.socket(port,debug);
	server.start();
	return server;
	
}

/*
 *	Send a message to the OSC Proxy
 */
OSCComponent.prototype.sendOSC = function(port,msg) {
	
	var tcp_socket = this.procs["_"+port].socket;
	if(tcp_socket) tcp_socket.send(msg);
	
}

/*
	Utils
*/
OSCComponent.prototype._fail = function(e) {
    if (e.getMessage) {
        this.error = e + ": " + e.getMessage() + "\n";
        while (e.getCause() != null) {
            e = e.getCause();
            this.error += "caused by " + e + ": " + e.getMessage() + "\n";
        }
    } else {
        this.error = e;
    }
};

OSCComponent.prototype._trace = function (msg) {
    if (this._traceFlag) {
        _printToJSConsole(msg);
    }
}

/*
 *  Get the file path to the installation directory of this 
 *  extension.
 */
OSCComponent.prototype._getExtensionPath = function(extensionName) {
    var chromeRegistry =
        Components.classes["@mozilla.org/chrome/chrome-registry;1"]
            .getService(Components.interfaces.nsIChromeRegistry);
            
    var uri =
        Components.classes["@mozilla.org/network/standard-url;1"]
            .createInstance(Components.interfaces.nsIURI);
    
    uri.spec = "chrome://" + extensionName + "/content/";

    this._trace(uri.spec);
    
    var path = chromeRegistry.convertChromeURL(uri);
    if (typeof(path) == "object") {
        path = path.spec;
    }
    
    path = path.substring(0, path.indexOf("/chrome/content/") + 1);
    this._trace(uri.spec+" path="+path);
    
    return path;
};
