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
	Script: core.js
		Contains LilyUtils.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/

if(!LilyUtils) {
	var LilyUtils = {};
}

/*				
	Class: LilyUtils
		Core Utility Methods.
*/
		
/*
	Method: jsDump
		write to the js console.

	Arguments: 
		string - string to write to the message window.
*/
LilyUtils.jsDump = function(str) {
	  Components.classes['@mozilla.org/consoleservice;1']
	            .getService(Components.interfaces.nsIConsoleService)
	            .logStringMessage(str);
}	
	
/*
	Method: getObjectMetaData
		get the meta data object for a given external

	Arguments: 
		objName - classname of the object metadata to retrieve.
	
	Returns: 
		returns object meta data.
*/
LilyUtils.getObjectMetaData = function(objName) {
	if(typeof Lily[LilyApp.nameSpace]["$"+objName+"MetaData"] != "undefined") {
		return Lily[LilyApp.nameSpace]["$"+objName+"MetaData"];			
	} else { //if its not defined then return some barebones value
		return {
			textName:objName,
			htmlName:objName,
			objectCategory:"",
			objectSummary:"",
			objectArguments:""
		}
	}	
}
						
/*
	Method: selectionModifyingKeyDown
		returns true when the accel key is pressed.

	Arguments: 
		e - keypress event.
	
	Returns: 
		true when accel is depressed, otherwise false.
*/	
LilyUtils.selectionModifyingKeyDown = function(e) {
	var accel=this.controlOrCommand(e);
	var shift=e.shiftKey;
	
	if((accel||shift) && !(accel&&shift))
		return true;
	else
		return false;
}
			
/*
	Method: cloneArray
		clone an array.

	Arguments: 
		array to be cloned.
	
	Returns: 
		returns cloned array.
*/
LilyUtils.cloneArray = function(arr) {
    return [].concat(arr);
}

/*
	Method: cloneObject
		clone an object.

	Arguments: 
		array to be cloned.
	
	Returns: 
		returns cloned array.
*/
LilyUtils.cloneObject = function(obj) {
    var objDeepCopy = eval("(" + (obj.toSource()) + ")");
	return objDeepCopy;
}
	
/*
	Method: convertType
		convert string to the type it appears to be.

	Arguments: 
		string to be converted.
	
	Returns: 
		returns an object of some type.
*/
LilyUtils.convertType = function(val) {
	
	if(!isNaN(+(val))) {
		return +(val);
	} else if(val=="true") {
		return true;
	} else if(val=="false") {
		return false;
	} else if(val[0]=="["&&val[val.length-1]=="]") {
		return eval(val);
	} else if(val[0]=="{"&&val[val.length-1]=="}") {
		eval("var o =" + val);
		return o;
	} else if(val=="null") {
		return null;
	} else {
		return val;
	}	
}			

/*
	Method: typeOf
		a more detailed typeof.

	Arguments: 
		args - object to test.
	
	Returns: 
		returns the type as a string.
*/
LilyUtils.typeOf = function(args) {
	
	//FIXME***
	//contributed code
	//adapted from http://snipplr.com/view/1996/typeof--a-more-specific-typeof/

	var is={
		Null:function(a){
			return a===null;
		},
		Undefined:function(a){
			return a===undefined;
		},
		nt:function(a){
			return(a===null||a===undefined);
		},
		Function:function(a){
			return(typeof(a)==='function')?a.constructor.toString().match(/Function/)!==null:false;
		},
		String:function(a){
			return(typeof(a)==='string')?true:(typeof(a)==='object')?a.constructor.toString().match(/string/i)!==null:false;
		},
		Array:function(a){
			return(typeof(a)==='object')?a.constructor.toString().match(/array/i)!==null||a.length!==undefined:false;
		},
		Boolean:function(a){
			return(typeof(a)==='boolean')?true:(typeof(a)==='object')?a.constructor.toString().match(/boolean/i)!==null:false;
		},
		Date:function(a){
			return(typeof(a)==='date')?true:(typeof(a)==='object')?a.constructor.toString().match(/date/i)!==null:false;
		},
		HTML:function(a){
			return(typeof(a)==='object')?a.constructor.toString().match(/html/i)!==null:false;
		},
		Number:function(a){
			return(typeof(a)==='number')?true:(typeof(a)==='object')?a.constructor.toString().match(/Number/)!==null:false;
		},
		Object:function(a){
			return(typeof(a)==='object')?a.constructor.toString().match(/object/i)!==null:false;
		},
		RegExp:function(a){
			return(typeof(a)==='function')?a.constructor.toString().match(/regexp/i)!==null:false;
		}
	};

	for(var i in is){
		if(is[i](args)){
			return i.toLowerCase();
		}
	}
}
			
/*
	Method: controlOrCommand
		returns true if the accel key is depressed.

	Arguments: 
		e - keypress event
	
	Returns: 
		returns boolean- true if accelkey is depressed, otherwise returns false.
*/
LilyUtils.controlOrCommand = function(e) {
	var bool=(this.navigatorPlatform()=='apple') ? e.metaKey : e.ctrlKey;
//	LilyDebugWindow.print("controlOrCommand result "+bool);		
	return bool;
}

/*
	Method: getAccelText
		returns correct accel text for platform.

	Returns: 
		returns accel text.
*/
LilyUtils.getAccelText = function() {
	var text=(this.navigatorPlatform()=='apple') ? "Cmd" : "Ctrl";		
	return text;
}	

/*
	Method: navigatorPlatform
		returns the navigator platform.
	
	Returns: 
		returns "apple", "linux" or "windows".
*/	
LilyUtils.navigatorPlatform = function() { //fix this
	if(navigator.platform.indexOf("Mac")!=-1)
		return "apple";
	else if(navigator.platform.indexOf("Linux")!=-1)
		return "linux";
	else
		return "windows";
}

/*
	Method: preventDefault
		cancel the event.

	Arguments: 
		e - an event
*/
LilyUtils.preventDefault = function(e) {
	e.preventDefault();
}
	
/*
	Method: getObjectPos
		get the position of an object.

	Arguments:
		dom element
	
	Returns: 
		returns array of left & top
*/
LilyUtils.getObjectPos = function(obj)	{
	var curleft = 0;
	var curtop = 0;
	var flag = false;
	if(obj && obj.style.display=="none") {
		obj.style.display="block"; //this is for inlets/outlets in a locked patch
		flag = true;
	}
	
	if (obj.offsetParent) {
		curleft = obj.offsetLeft;
		curtop = obj.offsetTop;
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		}
	}
	if(flag && obj) obj.style.display = "none"; //restore
	return [curleft,curtop];		
}

/*
	Method: getConfigProperty
		get a property from a config file.
		
	Arguments:
		prop - the property to get.
	
	Returns: 
		returns the property if it exists otherwise undefined.
*/
LilyUtils.getConfigProperty = function(prop,url) {
	var config_url = url||"chrome://lily/content/config/config.txt";
	var tmp = null;		
	LilyUtils.readSyncFromURL(config_url,function(txt){
		tmp=txt;
	});
	var config = eval("("+tmp+")");	
	return config[prop];
}

/*
	Method: parseJSON
		parses JSON string into an object.

	Arguments: 
		json - string to evaluate
	
	Returns: 
		returns the parsed object or null.
*/
LilyUtils.parseJSON = function(json) {
	try {
		eval('var jsonDoc='+json);
		//var jsonDoc = JSON.fromString(json);
	} catch(e) {
		LilyDebugWindow.error("Error parsing JSON "+ e.name + ": " + e.message);
	}
	
	if(jsonDoc) {
		return jsonDoc;
	} else {
		return null;
	}
}

/*
	Method: parseXML
		parses XML string into an object.

	Arguments: 
		aStr - string to evaluate
	
	Returns: 
		returns the parsed object or null.
*/
LilyUtils.parseXML = function(aStr) {
	var parser = new DOMParser();
	try {
		var xmlDoc = parser.parseFromString(aStr, "text/xml");
	} catch(e) {
		return null;
	}

	try {
		if(xmlDoc.documentElement.nodeName == "parsererror") {
			return null;
		} else {
			return xmlDoc;
		}
	} catch(e) {}
}	

/*
	Method: parseHTML
		async method to parse an HTML string into a DOM object.

	Arguments: 
		win - the xhtml window where the parsing will happen
		html - the string to parse
		cb - the callback that the will receive the DOM when its parsed
	
	Returns: 
		returns the iframe object used to parse the HTML. the caller must dispose of this.
*/	

//**FIXME**
//contributed code
//lifted from http://youngpup.net/userscripts/htmlparserexample.user.js
LilyUtils.parseHTML = function(win,html,cb) {

	var iframe = win.document.createElement("iframe");
	iframe.style.visibility = "hidden";
	iframe.style.position = "absolute";
	win.document.body.appendChild(iframe);
	
	// give it a URL so that it will create a .contentDocument property. Make
	// the URL be the current page's URL so that we can communicate with it.
	// Otherwise, same-origin policy would prevent us.
	iframe.contentWindow.location.href = location.href;
	
	// wait for the DOM to be available, then do something with the document
	iframe.contentWindow.addEventListener("load", function() {
		if(typeof cb == "function") { cb(iframe.contentDocument); }//do the callback
		//iframe.parentNode.removeChild(iframe); //dump the iframe
	}, false);		
	
	// write the received content into the document
	iframe.contentDocument.open("text/html");
	iframe.contentDocument.write(html);
	iframe.contentDocument.close();
	
	return iframe; //the caller must dispose of the iframe when it's done with it.

}

/*
	Method: loadScript
		loads script from url in a given context.

	Arguments: 
		url - the script url
		context - the object context where script will be evaluated
*/
LilyUtils.loadScript = function(url, context) {

	const jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
	                           .getService(Components.interfaces.mozIJSSubScriptLoader);

	return jsLoader.loadSubScript(url, context);	
}

/*
	Method: distance
		returns the distance between two points.

	Arguments: 
		x1 - x coordinate of the first point
		y1 - y coordinate of the first point
		x2 - x coordinate of the second point
		y2 - y coordinate of the second point
				
	Returns: 
		returns the distance in pixels.
*/
LilyUtils.distance = function(x1,y1,x2,y2) {
	
	var x = Math.abs(x1-x2);
	var y = Math.abs(y1-y2);
	
	return Math.sqrt((x*x)+(y*y));
			
}

/*
	Method: shuffle
		shuffles the supplied array and returns it.

	Arguments: 
		arr - array to shuffle
				
	Returns: 
		returns the shuffled array.
*/	
LilyUtils.shuffle = function shuffle(arr) { 
	
	function Random(max) { 
		return Math.floor(max*(Math.random()));
	}			
	
	var R=0; 
	var T=0;
	var J=0;
	 
	for (J=arr.length-1; J>0; J--) { 
		R=Random(J+1); 
		T=arr[J]; 
		arr[J]=arr[R]; 
		arr[R]=T;
	} 
	
	return arr; 
}

/*
	Method: map
		scale a value from the one range to another.

	Arguments: 
		originalMin - original range minimum
		originalMax - original range maximum
		newMin - new range minimum
		newMax - new range maximum
		currentValue - value to mapped to the new range		
				
	Returns: 
		returns the mapped value.
*/
LilyUtils.map = function(originalMin, originalMax, newMin, newMax, currentValue) {

	var zeroRefOriginalMax =0;
	var zeroRefNewMax = 0;
	var zeroRefCurVal = 0;
	var rangedValue = 0;

	// Check for out of range currentValues
	if (currentValue < originalMin) {
		currentValue = originalMin;
	}
	
	if (currentValue > originalMax) {
		currentValue = originalMax;
	}

	// Zero Refference the values
	zeroRefOriginalMax = originalMax - originalMin;
	zeroRefNewMax = newMax - newMin;
	zeroRefCurVal = currentValue - originalMin;

	rangedValue = ( (zeroRefCurVal * zeroRefNewMax) / zeroRefOriginalMax ) + newMin ;

	return rangedValue;

}

/*
	Method: runInBackGround
		run a method in the background.

	Arguments: 
		f - function to run in the background
		cb - function to call with the result
*/
LilyUtils.runInBackGround = function(f,cb) {
	
	var workingThread = function(threadID,func) {
	  this.threadID = threadID;
	  this.func = func;
      this.result;
	};

	workingThread.prototype = {
	  run: function() {
	    try {
	      // This is where the working thread does its processing work.
		  this.result = this.func();
	      // When it's done, call back to the main thread to let it know
	      // we're finished.
	      main.dispatch(new mainThread(this.threadID, this.result),
	        background.DISPATCH_NORMAL);
	    } catch(e) {
	      Components.utils.reportError(e);
		  LilyDebugWindow.error(e.name+": "+e.message+" line: "+e.lineNumber+" in "+e.fileName);
	    }
	  },

	  QueryInterface: function(iid) {
	    if (iid.equals(Components.interfaces.nsIRunnable) ||
	        iid.equals(Components.interfaces.nsISupports)) {
	            return this;
	    }
	    throw Components.results.NS_ERROR_NO_INTERFACE;
	  }
	};
	
	
	var mainThread = function(threadID,result) {
	  this.threadID = threadID;
	  this.result = result;
	};

	mainThread.prototype = {
	  run: function() {
	    try {
	      // This is where we react to the completion of the working thread.
			cb(this.threadID,this.result);
	    } catch(e) {
	      Components.utils.reportError(e);
		  LilyDebugWindow.error(e.name+": "+e.message+" line: "+e.lineNumber+" in "+e.fileName);			
	    }
	  },

	  QueryInterface: function(iid) {
	    if (iid.equals(Components.interfaces.nsIRunnable) ||
	        iid.equals(Components.interfaces.nsISupports)) {
	            return this;
	    }
	    throw Components.results.NS_ERROR_NO_INTERFACE;
	  }
	};	
	
	var background = Components.classes["@mozilla.org/thread-manager;1"].getService().newThread(0);
	var main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
	background.dispatch(new workingThread(1,f), background.DISPATCH_NORMAL);
	
}

//drag code from https://addons.mozilla.org/en-US/seamonkey/addon/2190/ by Emanuele Ruffaldi- http://www.teslacore.it
LilyUtils.dragDropHandler = function(cb) {

	/// supports the x-moz-file shell object with the interface nsIFile
	/// supports the unicode as lines with file names
	this.canHandleMultipleItems=true;
	this.getSupportedFlavours=function () {
		var flavours = new FlavourSet();
		flavours.appendFlavour("application/x-moz-file","nsIFile");	// real D&D
		return flavours;
	};
	this.onDragStart=function (evt , transferData, action){};
	this.onDragOver=function (evt,flavour,session) {};
	this.onDrop=function (evt, transferData, session) {
		try {		
			// prepare a variable that contains always a single item
			var td = this.canHandleMultipleItems ? transferData.first.first : transferData;
			var multi = (this.canHandleMultipleItems && transferData.dataList.length > 1);

			switch(td.flavour.contentType) {
				case "application/x-moz-file":
				{
					// check if there are multiple files ...
					if(multi)
					{
						// assume all of flavour moz-file
						var filePaths = [];
						var fileData = [];
						for(var i = 0; i < transferData.dataList.length; i++)
						{						
							var td = transferData.dataList[i];
							for(var j = 0; j < td.dataList.length; j++)
							{
								var fd = td.dataList[j];
								if(fd.flavour.contentType == "application/x-moz-file")
								{
									filePaths.push(fd.data.path+"");
									fileData.push(LilyUtils.readFile(td.data));
								}
							}
						}
						if(typeof cb=="function") cb([filePaths,fileData]);				
					}
					else
					{
						if(typeof cb=="function") cb([td.data.path+"",LilyUtils.readFile(td.data)]);												
					}
				}
				break;
			}
		}
		catch(e)
		{
			LilyDebugWindow.error("couldn't get dropped file "+e.message)
			//alert("DragDropUpload onDrop " + e);
		}
	}
}			


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//redefining this fixes a very obscure bug (in FF3b5), that i can reproduce but not understand...
Array.prototype.toString = function() {
	var str = "";
	for(var i=0; i < this.length; i++) {
		str += this[i].toString()
		str += (i<this.length-1) ? ", " : "";
	}
	return str;
}
