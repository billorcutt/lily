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
	Script: utils.js
		Contains LilyUtils, LilyObjectList & LilyAPIKeyManager.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/	

/*				
	Class: LilyUtils
		Utility Methods.
*/

var LilyUtils = {
		
	/*
		Method: jsDump
			write to the js console.
	
		Arguments: 
			string - string to write to the message window.
	*/
	jsDump: function(str) {
		  Components.classes['@mozilla.org/consoleservice;1']
		            .getService(Components.interfaces.nsIConsoleService)
		            .logStringMessage(str);
	},	
		
	/*
		Method: getObjectMetaData
			get the meta data object for a given external
	
		Arguments: 
			objName - classname of the object metadata to retrieve.
		
		Returns: 
			returns object meta data.
	*/
	getObjectMetaData: function(objName) {
		return Lily["$"+objName+"MetaData"];		
	},
	
	/*
		Method: getDefaultFont
			get the default font preference.
	
		Returns: 
			array - default font face & size.
	*/
	getDefaultFont: function() {
		return [LilyUtils.getStringPref("extensions.lily.defaultFontFace"),LilyUtils.getStringPref("extensions.lily.defaultFontSize")];
	},
	
	/*
		Method: setDefaultFont
			set the default font preference.
	
		Arguments: 
			array - default font face & size.
	*/
	setDefaultFont: function(face,size) {
		
		if(face)
			LilyUtils.setStringPref("extensions.lily.defaultFontFace",face);
			
		if(size)
			LilyUtils.setStringPref("extensions.lily.defaultFontSize",size);	
	
	},
	
	/*
		Method: writeToHostWindow
			write to the host window.
	
		Arguments: 
			string - string to write to the host window.
	*/
	writeToHostWindow: function(text) {
		content.document.open();			
		content.document.write(text);
		content.document.close();	
	},	
	
	/*
		Method: appendToHostWindow
			write to the host window.
	
		Arguments: 
			string - string to append to the host window.
	*/
	appendToHostWindow: function(text) {
		content.document.write(text);				
	},
		
	/*
		Method: getStringPref
			get a string pref.
	
		Arguments: 
			prefName - name of the pref.
		
		Returns: 
			returns a string.
	*/
	getStringPref: function(prefName) {
		var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
		return prefs.getCharPref(prefName)||false; // get a pref		
	},
	
	/*
		Method: setStringPref
			get a string pref.
	
		Arguments: 
			prefName - name of the pref.
			value - value to set.
	*/
	setStringPref: function(prefName,value) {
		var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
		prefs.setCharPref((prefName),value); // set a pref			
	},	
	
	/*
		Method: getBoolPref
			get a bool pref.
	
		Arguments: 
			prefName - name of the pref.
		
		Returns: 
			returns a bool.
	*/
	getBoolPref: function(prefName) {
		var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
		return prefs.getBoolPref(prefName)||false; // get a pref		
	},
	
	/*
		Method: setBoolPref
			get a bool pref.
	
		Arguments: 
			prefName - name of the pref.
			state - state of the pref to set.
	*/
	setBoolPref: function(prefName,state) {
		var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
		prefs.setBoolPref((prefName),state); // set a pref			
	},
	
	/*
		Method: getIntPref
			get an int pref.
	
		Arguments: 
			prefName - name of the pref.
		
		Returns: 
			returns a number.
	*/
	getIntPref: function(prefName) {
		var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
		return prefs.getIntPref(prefName)||false; // get a pref		
	},
	
	/*
		Method: setIntPref
			get an int pref.
	
		Arguments: 
			prefName - name of the pref.
			state - state of the pref to set.
	*/
	setIntPref: function(prefName,state) {
		var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
		prefs.setIntPref((prefName),state); // set a pref			
	},	
	
	/*
		Method: getInstallDir
			get the installation directory.
	
	*/
	getInstallDir: function(extID) {
		
		try {
			//get install directory for an extension			
			var installDir = Components.classes["@mozilla.org/extensions/manager;1"]
			                    .getService(Components.interfaces.nsIExtensionManager)
			                    .getInstallLocation(extID)
			                    .getItemLocation(extID);

			if(installDir.exists()&&installDir.isDirectory) {
				return installDir;
			}	
		} catch(e) {
			//get install directory for app
			var installDir = Components.classes["@mozilla.org/file/directory_service;1"]
	                    .getService(Components.interfaces.nsIProperties)
	                    .get("resource:app", Components.interfaces.nsIFile);

			if(installDir.exists()&&installDir.isDirectory) {
				return installDir;
			}	
		}
		
		return null;
				
	},
		
	/*
		Method: selectionModifyingKeyDown
			returns true when the accel key is pressed.
	
		Arguments: 
			e - keypress event.
		
		Returns: 
			true when accel is depressed, otherwise false.
	*/	
	selectionModifyingKeyDown:function(e) {
		var accel=this.controlOrCommand(e);
		var shift=e.shiftKey;
		
		if(accel || shift)
			return true;
		else
			return false;
	},

	/*
		Method: getWindowEnumerator
			returns a window enumerator.

		Arguments: 
			type- window type. null returns all types

		Returns: 
			returns a window enumerator.
	*/
	getWindowEnumerator: function(type) {
		
		var winType=type||null;
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		return wm.getEnumerator(winType);
		
	},
	
	/*
		Method: getActiveWindow
			returns a chrome window for the topmost browser window.
		
		Returns: 
			return the topmost browser window.
	*/
	getActiveWindow: function() {
		//getMostRecentWindow
		if(Lily.getCurrentPatch()) {
			return Lily.getCurrentPatch().patchView.oWin;
		} else {
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			return wm.getMostRecentWindow(null);
		}	
	},
	
	/*
		Method: getActiveXULWindow
			returns a chrome window for the topmost xul window.
		
		Returns: 
			return the topmost xul window.
	*/
	getActiveXULWindow: function() {
		//getMostRecentWindow
		if(Lily.getCurrentPatch()) {
			return Lily.getCurrentPatch().patchView.xulWin;
		} else {
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			return wm.getMostRecentWindow(null);
		}	
	},	
	
	/*
		Method: openDir
			opens a directory.
	
		Arguments: 
			path - path to directory.
	*/	
	openDir: function(path) {
		var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		dir.initWithPath(this.stripLTQuotes(path));
		dir.launch();
	},
		
	/*
		Method: splitArgs
			split strings: split on spaces, unless the string is quoted.
	
		Arguments: 
			args - text string.
		
		Returns: 
			array of split text.
	*/	
	splitArgs:function(args) {
		var type=LilyUtils.typeOf(args);		
		if(type=="string"&&args.length) {
			var arr=args.match(/(["'])(?:\\\1|.)*?\1|(\S+,)|(\S+)/g);
			return arr;
		} else if(type=="array") {
			return this.cloneArray(args);
		} else if(type=="number") {
			return [args];
		} else {
			return [];
		}
	},
	
	/*
		Method: strip
			strip white space.
	
		Arguments: 
			string.
		
		Returns: 
			returns stripped string.
	*/
	strip:function(str) {
	    return str.replace(/^\s+/, '').replace(/\s+$/, '');
	},
	
	/*
		Method: stripQuotes
			strip quotes.
	
		Arguments: 
			string.
		
		Returns: 
			returns stripped string.
	*/
	stripQuotes:function(str) {
	    return str.replace(/"/g, '').replace(/'/g, '');
	},
	
	/*
		Method: stripLTQuotes
			strip leading & trailing quotes.
	
		Arguments: 
			str - string to strip
		
		Returns: 
			returns stripped string.
	*/
	stripLTQuotes: function(str) {
		return str.replace(/^['"]|['"]$/ig, '');
	},
	
	/*
		Method: quoteString
			add leading & trailing quotes if they're missing.
	
		Arguments: 
			str - string to quote
		
		Returns: 
			returns quoted string.
	*/
	quoteString: function(str) {
		
		if(!str.match(/^['"]/)) {
			str = '"'+str;
		}
		
		if(!str.match(/['"]$/)) {
			str = str+'"';
		}
		
		return str; //return leading trailing quotes
	},
	
	/*
		Method: titleCase
			upper case the first letter.
	
		Arguments: 
			str - string to case
		
		Returns: 
			returns cased string.
	*/
	titleCase: function(str) {
		str = str.replace(/(^.)/,function($1){return $1.toUpperCase();})
		return str;	
	},	
	
	/*
		Method: stripTags
			strip HTML tags from text.
	
		Arguments: 
			str - string to strip of tags
		
		Returns: 
			returns stripped string.
	*/
	stripTags: function(str) {
		str = str.replace(new RegExp('(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)', 'img'), '');
		str = (str&&str.replace) ? str.replace(/<\/?[^>]+>/gi, '') : str;
		return str;	
	},			
	
	/*
		Method: cloneArray
			clone an array.
	
		Arguments: 
			array to be cloned.
		
		Returns: 
			returns cloned array.
	*/
	cloneArray: function(arr) {
	    return [].concat(arr);
	},
	
	/*
		Method: cloneObject
			clone an object.
	
		Arguments: 
			array to be cloned.
		
		Returns: 
			returns cloned array.
	*/
	cloneObject: function(obj) {
	    var objDeepCopy = eval("(" + (obj.toSource()) + ")");
		return objDeepCopy;
	},
		
	/*
		Method: convertType
			convert string to the type it appears to be.
	
		Arguments: 
			string to be converted.
		
		Returns: 
			returns an object of some type.
	*/
	convertType: function(val) {
		
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
	},			
	
	/*
		Method: typeOf
			a more detailed typeof.
	
		Arguments: 
			args - object to test.
		
		Returns: 
			returns the type as a string.
	*/
	typeOf:function(args) {
		
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
	},
	
	/*
		Method: getTempFile
			returns a temp file.
		
		Returns: 
			returns file- hold on to it, you're responsible for removing it when you're done.
	*/
	getTempFile: function(ext) {
		var extension = ext||"tmp";	
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
		                     .getService(Components.interfaces.nsIProperties)
		                     .get("TmpD", Components.interfaces.nsIFile);
		file.append("file."+extension);
		file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
		return file;
	},

	/*
		Method: chromeURLToFile
			return a nsiFile for a chrome url.
	
		Arguments: 
			chrome url.
		
		Returns: 
			returns nsiFile.
	*/
	chromeURLToFile: function(aPath) {
		
		if(!/^chrome/.test(aPath))
			return null;
		
		var rv=null;

		var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var uri = ios.newURI(aPath, "UTF-8", null);        
		var cr = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService(Components.interfaces.nsIChromeRegistry);

		rv = cr.convertChromeURL(uri);

		var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"].createInstance(Components.interfaces.nsIFileProtocolHandler);;
		rv = ph.getFileFromURLSpec(rv.spec);
		
		return rv;
				
	},
	
	/*
		Method: readFile
			returns the contents of a file.
	
		Arguments: 
			file - file handle.
		
		Returns: 
			returns file contents as a string.
	*/	
	readFile: function(file) {
		
		var data = "";
		var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		fstream.init(file, -1, -1, 0);
		
		// reading the stream with non-textual data 
		var charset = "UTF-8"; 
		const replacementChar = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER ; 

		var sstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(Components.interfaces.nsIConverterInputStream);
		sstream.init(fstream, charset, 1024, replacementChar); 
		
		var str = {};
		while (sstream.readString(4096,str)!= 0) {
			data += str.value;
		}
		
		sstream.close();
		fstream.close();

		return data;			
	},
	
	/*
		Method: readFileFromPath
			returns the contents of a file.
	
		Arguments: 
			filepath - path to file to read.
			usePicker - boolean- use filepicker
		
		Returns: 
			returns an object containing file contents as a string and the file handle.
	*/	
	readFileFromPath: function(filepath,usePicker) {
		
		var data ="";
		var file=null;
			
		if(filepath) {
			
			//init
			try {
				file = Components.classes["@mozilla.org/file/local;1"]
				                     .createInstance(Components.interfaces.nsILocalFile);
			} catch(e) {
				
			}
			
			//get the path
			try {				
				file.initWithPath(LilyUtils.getFilePath(this.stripLTQuotes(filepath)));
				
				//found the file so read it.
				if(file.exists())	
					data=LilyUtils.readFile(file);	//read the file
				else
					LilyDebugWindow.error("error- file not found"); //not found				
				
			} catch(e) {
				LilyDebugWindow.error(e.name + ": " + e.message); 
			}			
				
		} else if(usePicker) {
			
			const nsIFilePicker = Components.interfaces.nsIFilePicker;

			var fp = Components.classes["@mozilla.org/filepicker;1"]
			                   .createInstance(nsIFilePicker);

			fp.init(window, "Find file to open", nsIFilePicker.modeOpen);
			fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

			var rv = fp.show();
			if(LilyUtils.navigatorPlatform()!="apple") window.blur();		
			if (rv == nsIFilePicker.returnOK) {
				 file = fp.file;

				if(file.exists())	
					data=LilyUtils.readFile(file);	//read the file
				else
					LilyDebugWindow.error("error- file not found"); //not found
			}
		}
		return {"data":data,"file":file};				
	},
	
	/*
		Method: readAsyncFromURL
			returns the contents of a file.
	
		Arguments: 
			url - url to file to read.
	*/	
	readAsyncFromURL: function(url,func) {
		
		var data ="";
			
		if(url) {
			var xhr=new LilyUtils._xhr(function(str) {
				func(str);
			},"text",this);		
			xhr.loadXMLDoc(url);	
		}				
	},
	
	/*
		Method: readSyncFromURL
			returns the contents of a file.
	
		Arguments: 
			url - url to file to read.		
			
	*/	
	readSyncFromURL: function(url,func) {
		
		var data ="";
			
		if(url) {
			var xhr=new LilyUtils._xhr(function(str) {
				func(str);
			},"text",this,"GET",false,null);		
			xhr.loadXMLDoc(url);	
		}				
	},		

	/*
		Method: writeDataToFile
			writes a string to a file.
	
		Arguments: 
			file - file handle (optional).
			data - data string to write
		
		Returns: 
			returns file handle.
	*/
	writeDataToFile: function(file,data) {
		
		if(file) {	//if file exists		
			file = LilyUtils.writeFile(file,data);
		} else { //no file so open a file picker to prompt for a save location
			const nsIFilePicker = Components.interfaces.nsIFilePicker;

			var fp = Components.classes["@mozilla.org/filepicker;1"]
			                   .createInstance(nsIFilePicker);

			fp.init(window, "Choose a location to save in", nsIFilePicker.modeSave);
			fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

			var rv = fp.show();
			if(LilyUtils.navigatorPlatform()!="apple") window.blur();		
			if (rv == nsIFilePicker.returnOK) {
				file = fp.file;
				file = LilyUtils.writeFile(file,data);
			}
		}
		return file;		
	},
	
	/*
		Method: writeBinaryFile
			writes a string to a file.

		Arguments: 
			file - file handle.
			data - data string to write
	
		Returns: 
			returns file handle.
	*/
	writeBinaryFile: function(aFile, data) {
	
		// file is nsIFile, data is a string
		var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"]
		                       .createInstance(Components.interfaces.nsIFileOutputStream);
		stream.init(aFile, 0x04 | 0x08 | 0x20, 0600, 0); // write, create, truncate

		stream.write(data, data.length);
		if (stream instanceof Components.interfaces.nsISafeOutputStream) {
		    stream.finish();
		} else {
		    stream.close();
		}
	
		return file;
		
	},	
	

	/*
		Method: writeFile
			writes a string to a file.
	
		Arguments: 
			file - file handle.
			data - data string to write
		
		Returns: 
			returns file handle.
	*/
	writeFile: function(file, data) {
		
		// file is nsIFile, data is a string
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
								.createInstance(Components.interfaces.nsIFileOutputStream);
		
		var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
								.createInstance(Components.interfaces.nsIConverterOutputStream);

		// use 0x02 | 0x10 to open file for appending.
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
		os.init(foStream,"UTF-8",4096,0x0000); 
		
		os.writeString(data); 
		os.close(); 
		foStream.close();
		
		return file;
			
	},

	/*
		Method: getFileHandle
			returns a file handle if it exists.
	
		Arguments: 
			name -  path to file.
		
		Returns: 
			returns file handle if its exists, otherwise returns null.
	*/
	getFileHandle: function(filepath) {
		if(filepath) {
			file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			try {	
				file.initWithPath(this.stripLTQuotes(filepath));
				return file;		
			} catch(e){ 
				return null;
			}
		}	
	},

	/*
		Method: getDirSeparator
			returns the platform appropriate separator.
		
		Returns: 
			returns "/" on mac/linux, "\" on windows.
	*/
	getDirSeparator: function() {
		return (this.navigatorPlatform()=='windows') ? "\\" : "/";
	},	

	/*
		Method: getFilePath
			returns the path to a file if the supplied path is correct or its in 
			the parent patch directory or if it is in  the search patch.
	
		Arguments: 
			name - patch file name.
		
		Returns: 
			returns file path if its exists, otherwise returns an empty string.
	*/	
	getFilePath: function(filepath) {
		
		//if this has a protocol, assume we already have the right path.
		if(LilyUtils.containsProtocol(filepath))
			return filepath;		
		
		var file=null;
				
		if(filepath) {
			
			filepath = this.stripLTQuotes(filepath);
			
			//init
			file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

			//try it as an absolute path
			try {	
				file.initWithPath(filepath);		
			} catch(e) {
				//didn't work so try it as an relative path
				if(Lily.getCurrentPatch()) {				
					var parentDir=Lily.getCurrentPatch().getPatchDir(); //get the parent dir	
					if(parentDir) { //got it
						try {
							file.initWithPath((parentDir.path+this.getDirSeparator()+filepath));	//try it			
						} catch(e) { 
							//failed so look in the search path		
							try {
								file.initWithPath(LilyUtils.getPatchPath(filepath));	//try it
							} catch(e) { 
								return ""; //no more options so just bail...
							}
						}	
					}
				}
			}		
		}
		
		try {
			if(file && file.exists()) return file.path; //made it here so we probably have something...
		} catch(e) {
			return "";
		}
			
	},
	
	/*
		Method: directorySearch
			recursive directory search
	
		Arguments: 
			dir - nsiFile directory.
			callback - function to call for each entry
		
		Returns: 
			returns array of file handles.
	*/	
	directorySearch: function(dir,callback) {
		
		if(!dir) return; //bail
			
		var entries = dir.directoryEntries;
		
		while(entries.hasMoreElements()) {

			var entry = entries.getNext();
			entry.QueryInterface(Components.interfaces.nsIFile);

			if(!entry.isDirectory()&&entry.leafName.charAt(0)!=".") {				
				callback(entry);
			} else if(entry.isDirectory()&&entry.leafName.charAt(0)!=".") {
				this.directorySearch(entry,callback);
			}

		}		

	},	
	
	/*
		Method: getPatchPath
			returns the path to a patch if its in the search patch.
	
		Arguments: 
			name - patch file name.
		
		Returns: 
			returns file path if its exists, otherwise returns an empty string.
	*/	
	getPatchPath: function(name,url) {
		
		//if I have a protocol assume its valid
		if(this.containsProtocol(url))
			return name;
		
		var obj=LilyObjectList.search(name);
		if(obj) {
			return obj.path;
		} else {
			//error handling
			LilyDebugWindow.error("patch not found");
			return "";
		}
	},
	
	/*
		Method: getPIDFromPackage
			returns the patch id based on the package name.
	
		Arguments: 
			name - patch package name.
		
		Returns: 
			returns the patch id from a patch package name.
	*/	
	getPIDFromPackage: function(name) {
		var package_id = name+"\.id@"+name+"\.com";
		for(var x in Lily.patchObj) {
			if(Lily.patchObj[x].file && Lily.patchObj[x].file.path.indexOf(package_id)!=-1) {
				return x;
			}
		}
	},		
	
	/*
		Method: toggleMessageDialog
			toggles a translucent message in a patch window- disappears when the window is clicked or key is pressed.

		Arguments: 
			win = window object to display the message in
			str = html string to display
			width = patch id
			color = message background color
	*/
	toggleMessageDialog:function(win,str,width,color) {
										
		if(win&&!win.document.getElementById("lilyMessageDialog")) {
			return LilyUtils.displayMessageDialog(win,str,width,color);
		} else {
			win.document.getElementById("lilyMessageDialog").parentNode.removeChild(win.document.getElementById("lilyMessageDialog"));
			return null;
		}
	},	
	
	/*
		Method: displayMessageDialog
			display a translucent message in a patch window- disappears when the window is clicked or keys is pressed.

		Arguments: 
			str = html string to display
			pID = patch id
			color = message background color
			
		Returns:
			object that contains the outer message node & the a method to remove it.
	*/
	displayMessageDialog:function(win,str,width,color) {
										
		if(win.document.getElementById("lilyMessageDialog"))
			return;
		
		var body = win.document.getElementsByTagName("body")[0];						
		var d1=win.document.createElement("div");
		var d2=win.document.createElement("div");		
		
		//outer div
		d1.id="lilyMessageDialog";
		d1.style.position="absolute";
		d1.style.left="0px";
		d1.style.top="0px";					
		d1.style.width="100%";
		d1.style.height="100%";
		d1.style.textAlign="center";
		d1.style.zIndex=1000;
							
		//inner div
		d2.style.width=width+"px";		
		d2.style.margin="50px auto";						
		d2.style.border="1px solid #000";		
		d2.style.padding="15px";
		if(!color) {
			d2.style.color="white";				
			d2.style.backgroundImage="url(chrome://lily/content/images/overlay.png)";
			d2.style.backgroundColor="#333";
			d2.style.backgroundColor="transparent";
		} else {
			d2.style.backgroundColor=color;
			d2.style.color="black";			
		}

		var outerDiv = body.appendChild(d1);
		var innerDiv = outerDiv.appendChild(d2);
		innerDiv.innerHTML=str;
		
		outerDiv.addEventListener("click",function(e){
			if(e.target.tagName != "input") this.parentNode.removeChild(this);
		},false);
		
		//XXX - FIXME - DOESN'T WORK THE FIRST TIME IF THE PATCH IS UNEDITED
//		win.addEventListener("keydown",function(){outerDiv.parentNode.removeChild(outerDiv);},false);		
		
		return {message:outerDiv,close:function(){outerDiv.parentNode.removeChild(outerDiv)}};
	},
	
	
	/*
		Method: displayIframeOnContent
			display a translucent message in a patch window- disappears when the window is clicked or keys is pressed.

		Arguments: 
			str = html string to display
			pID = patch id
			color = message background color

		Returns:
			object that contains the outer message node & the a method to remove it.
	*/
	displayIframeOnContent:function() {
		var body = content.document.getElementsByTagName("body")[0];						
		var tmp=content.document.createElement("iframe");
		tmp.style.position="absolute";
		tmp.style.left="0px";
		tmp.style.top="0px";
		tmp.style.padding="0px";
		tmp.style.margin="0px";
		tmp.style.borderWidth="0px";							
		tmp.style.width="100%";
		tmp.style.height="100%";
		tmp.style.backgroundColor="transparent";
		var _iframe = body.appendChild(tmp);
		//_iframe.setAttribute("src","chrome://lily/content/blank.html");			
		return _iframe;
	},
	
	/*
		Method: controlOrCommand
			returns true if the accel key is depressed.
	
		Arguments: 
			e - keypress event
		
		Returns: 
			returns boolean- true if accelkey is depressed, otherwise returns false.
	*/
	controlOrCommand:function(e) {
		var bool=(this.navigatorPlatform()=='apple') ? e.metaKey : e.ctrlKey;
//		LilyDebugWindow.print("controlOrCommand result "+bool);		
		return bool;
	},
	
	/*
		Method: getAccelText
			returns correct accel text for platform.

		Returns: 
			returns accel text.
	*/
	getAccelText:function() {
		var text=(this.navigatorPlatform()=='apple') ? "Cmd" : "Ctrl";		
		return text;
	},	
	
	/*
		Method: navigatorPlatform
			returns the navigator platform.
		
		Returns: 
			returns "apple", "linux" or "windows".
	*/	
	navigatorPlatform:function() { //fix this
		if(navigator.platform.indexOf("Mac")!=-1)
			return "apple";
		else if(navigator.platform.indexOf("Linux")!=-1)
			return "linux";
		else
			return "windows";
	},
	
	/*
		Method: preventDefault
			cancel the event.
	
		Arguments: 
			e - an event
	*/
	preventDefault:function(e) {
		e.preventDefault();
	},
	
	/*
		Method: isText
			determines if a file name contains a known (ie one we can handle) text extension.
	
		Arguments: 
			str - string to test.
		
		Returns: 
			boolean.
	*/
	isText: function(str) {
		return str.match(/\.txt$|\.xul$|\.js$|\.css$|\.html$|\.xhtml$|\.json$|\.xml$/);	
	},
	
	/*
		Method: isResource
			determines if a file name contains a rsrc extension.
	
		Arguments: 
			str - string to test.
		
		Returns: 
			boolean.
	*/
	isResource: function(str) {
		return str.match(/\.rsrc$/);	
	},			
	
	/*
		Method: isCompressed
			determines if a file name contains a known (ie one we can handle) compression extension.
	
		Arguments: 
			str - string to test.
		
		Returns: 
			boolean.
	*/
	isCompressed: function(str) {
		return str.match(/\.zip$|\.jar$|\.rsrc$/);	
	},	
	
	/*
		Method: containsProtocol
			determines if a string contains a known protocol.
	
		Arguments: 
			str - string to test.
		
		Returns: 
			boolean.
	*/
	containsProtocol: function(str) {
		if(str&&str.length) {
			return !(str.indexOf("http://")==-1 && str.indexOf("chrome://")==-1 && str.indexOf("file://")==-1)		
		} else {
			return false;
		}
	},	
	
	/*
		Method: hasExtension
			determine if a string has an extension.
	
		Arguments: 
			str - string to test
		
		Returns: 
			bool- true if extension is found.
	*/
	hasExtension: function(str) {
		return str.match(/\.\S{2,4}$/, '');
	},	
	
	/*
		Method: stripExtension
			strip file extension if it exists.
	
		Arguments: 
			str - string to strip
		
		Returns: 
			returns stripped string.
	*/
	stripExtension: function(str) {
		return str.replace(/\.\S{2,4}$/, ''); //only works with 2-4 char exts
	},
	
	/*
		Method: getObjectPos
			get the position of an object.
	
		Arguments:
			dom element
		
		Returns: 
			returns array of left & top
	*/
	getObjectPos: function(obj)	{
		var curleft = curtop = 0;
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
	},

	/*
		Method: getTextSize
			width of the supplied string.
	
		Arguments:
			win- window
			str - string to measure
		
		Returns: 
			returns width in px.
	*/
	getTextSize: function(win,str) {
		var d = win.document.createElement("div");
		var ad = win.document.getElementsByTagName("body")[0].appendChild(d);
		ad.innerHTML = LilyUtils.string2HTML(str);
		ad.style.position="absolute";
		ad.style.left="0px";
		ad.style.top="0px";		
		var arr = [ad.offsetWidth,ad.offsetHeight];
		ad.parentNode.removeChild(ad);
		return arr;
	},
	
	/*
		Method: getAverageCharSize
			get the average size of an alpha-numeric charactor given the default font in a window.
	
		Arguments:
			win- window
		
		Returns: 
			returns width in px.
	*/
	getAverageCharSize: function(win) {
		var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
		var size=this.getTextSize(win,str);
		return Math.floor(size[0]/str.length);
	},	

	/*
		Method: isPatchString
			evaluates if a string is a lily patch string.
	
		Arguments: 
			str - string to evaluate
		
		Returns: 
			returns boolean- true if patch string.
	*/
	isPatchString: function(str) {
		return (/var patch={/.test(str));
	},	
	
	/*
		Method: escape
			backslash escape single quotes.
	
		Arguments: 
			str - string to escape
		
		Returns: 
			returns escaped string.
	*/	
	escape:function(str) {

//		LilyDebugWindow.print(LilyUtils.typeOf(str))

		if(LilyUtils.typeOf(str)=="string") {
			return sub(str);
		} else if(LilyUtils.typeOf(str)=="array") {
			var tmp=[];			
			for(var i=0;i<str.length;i++)
				if(LilyUtils.typeOf(str[i])=="string")
					tmp.push(sub(str[i]));
				else
					tmp.push(str[i]);
			return tmp;
		} else {
			return str;
		}
		
		function sub(ss) {
			var s = ss.replace(/\\/g,'\\\\');			
			s = s.replace(/\'/g,"\\'");
			s = s.replace(/\n/g,'\\n');			
			return s.replace(/\"/g,'\\"');
		}
		
	},
	
	/*
		Method: unescape
			backslash unescape single quotes.
	
		Arguments: 
			str - string to unescape
		
		Returns: 
			returns unescaped string.
	*/	
	unescape:function(str) {
		
		if(LilyUtils.typeOf(str)=="string") {
			return sub(str);
		} else if(LilyUtils.typeOf(str)=="array") {
			var tmp=[];			
			for(var i=0;i<str.length;i++)
				if(LilyUtils.typeOf(str[i])=="string")
					tmp.push(sub(str[i]));
				else
					tmp.push(str[i]);
			return tmp;
		} else {
			return str;
		}
		
		function sub(ss) {
			var s = ss.replace(/\\'/g,"\'");
			s = s.replace(/\\n/g,'\n');			
			return s.replace(/\\"/g,'\"');
		}
	},	

	/*
		Method: html2String
			converts html to a string.
	
		Arguments: 
			string - html string.
		
		Returns: 
			string.
	*/
	html2String: function(str) {
		
		if(LilyUtils.typeOf(str)=="string") {
			return sub(str);
		} else if(LilyUtils.typeOf(str)=="array") {
			var tmp=[];			
			for(var i=0;i<str.length;i++)
				if(LilyUtils.typeOf(str[i])=="string")
					tmp.push(sub(str[i]));
				else
					tmp.push(str[i]);
			return tmp;
		} else {
			return str;
		}
		
		function sub(string) {
			string=string.replace(/<br\/>/g,"\n");
			string=string.replace(/&amp;/g,"&");		
			string=string.replace(/&lt;/g,"<");
			string=string.replace(/&gt;/g,">");
//			string=string.replace(/&commat;/g,"@");				
			return string;	
		}		
	},

	/*
		Method: string2HTML
			escape string to make XHTML-ready.
	
		Arguments: 
			string - text string.
		
		Returns: 
			encoded HTML string.
	*/
	string2HTML: function(str) {
		
		if(LilyUtils.typeOf(str)=="string") {
			return sub(str);
		} else if(LilyUtils.typeOf(str)=="array") {
			var tmp=[];			
			for(var i=0;i<str.length;i++)
				if(LilyUtils.typeOf(str[i])=="string")
					tmp.push(sub(str[i]));
				else
					tmp.push(str[i]);
			return tmp;
		} else {
			return str;
		}
		
		function sub(string) {
			
			//dont double escape...
			if(string.indexOf("&amp;")!=-1||string.indexOf("&lt;")!=-1||string.indexOf("&gt;")!=-1)
				return string;
										
			string=string.replace(/&/g,"&amp;");		
			string=string.replace(/</g,"&lt;");
			string=string.replace(/>/g,"&gt;");	
			string=string.replace(/\n/g,"<br/>");
//			string=string.replace(/@/g,"&commat;");
			return string;	
		}		
	},

	/*
		Method: getInstalledFonts
			get a list of the installed fonts.
		
		Returns: 
			returns an array of available fonts.
	*/
	getInstalledFonts: function() {
							
		var langgroup = ["x-western","ja","ko","th","tr","x-baltic","x-central-euro","x-cyrillic","zh-CN","zh-TW"];		
		var fonttype = ["serif","sans-serif","cursive","fantasy","monospace"];		
		
		//var fontListObj = Components.classes["@mozilla.org/gfx/fontlist;1"].createInstance(Components.interfaces.nsIFontList);
		
		var fontListObj = Components.classes["@mozilla.org/gfx/fontenumerator;1"].getService(Components.interfaces.nsIFontEnumerator);		
		
        var tmpArr = [];
		var tmpObj = {};

		for(var i=0;i<langgroup.length;i++) {
			
			for(var j=0;j<fonttype.length;j++) {
				
				var fontArray = fontListObj.EnumerateFonts(langgroup[i],fonttype[j],{});
				for(var i=0;i<fontArray.length;i++)
				{
					/*
					var fontName = fontEnumerator.getNext();
					fontName = fontName.QueryInterface(Components.interfaces.nsISupportsString);
					var fontStr = fontName.toString();
					*/
					
					//hack to avoid dupes
					if(typeof tmpObj[fontArray[i]]=="undefined") {
						tmpArr.push(fontArray[i]);
						tmpObj[fontArray[i]]=fontArray[i];
					}	
				}
			}
		}
				
		return tmpArr;
	},
	
	/*
		Method: getConfigProperty
			get a property from the config file.
			
		Arguments:
			prop - the property to get.
		
		Returns: 
			returns the property if it exists otherwise undefined.
	*/
	getConfigProperty: function(prop) {
		
		var tmp = null;		
		LilyUtils.readSyncFromURL("chrome://lily/content/config.txt",function(txt){
			tmp=txt;
		});
		var config = eval("("+tmp+")");	
		return config[prop];
		
	},

	/*
		Method: parseJSON
			parses JSON string into an object.
	
		Arguments: 
			json - string to evaluate
		
		Returns: 
			returns the parsed object or null.
	*/
	parseJSON: function(json) {
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
	},
	
	/*
		Method: parseXML
			parses XML string into an object.
	
		Arguments: 
			aStr - string to evaluate
		
		Returns: 
			returns the parsed object or null.
	*/
	parseXML: function(aStr) {
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
	},		
	
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
	parseHTML: function(win,html,cb) {

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

	},

	/*
		Method: makeSafe
			make a string "safe" to insert into an xhtml document.
			checks for well-formedness. if not well-formed, appropriate 
			entity substitutions are performed.
	
		Arguments: 
			aStr - string to evaluate
		
		Returns: 
			returns the parsed object or null.
	*/
	makeSafe: function(aStr) {
		
		//strip wrapping quotes if its html, so html will render
		if(aStr && aStr.match && aStr.match(/^'<|^"</g)&&aStr.match(/>'$|>"$/)) {
			aStr = LilyUtils.stripLTQuotes(aStr);
		}
		
		if(aStr && !LilyUtils.parseXML(aStr)) {
			return LilyUtils.string2HTML(aStr); //escape everything
		}
		return aStr; 
	},

	/*
		Method: loadScript
			loads script from url in a given context.
	
		Arguments: 
			url - the script url
			context - the object context where script will be evaluated
	*/
	loadScript: function(url, context) {

		const jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
		                           .getService(Components.interfaces.mozIJSSubScriptLoader);

		return jsLoader.loadSubScript(url, context);	
	},

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
	distance: function(x1,y1,x2,y2) {
		
		var x = Math.abs(x1-x2);
		var y = Math.abs(y1-y2);
		
		return Math.sqrt((x*x)+(y*y));
				
	},
	
	/*
		Method: shuffle
			shuffles the supplied array and returns it.
	
		Arguments: 
			arr - array to shuffle
					
		Returns: 
			returns the shuffled array.
	*/	
	shuffle: function shuffle(arr) { 
		
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
	},

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
	map: function(originalMin, originalMax, newMin, newMax, currentValue) {

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

	},
	
	//drag code from https://addons.mozilla.org/en-US/seamonkey/addon/2190/ by Emanuele Ruffaldi- http://www.teslacore.it
	dragDropHandler: function(cb) {

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
	},
	
	getBrowser: function() {
	 var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	 return wm.getMostRecentWindow("navigator:browser").getBrowser();
	}	
				
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
	Constructor: _editor
		create a new editor instance.

	Arguments: 
		context - parent context.
		parEl - parent element to display text.
		defaultContent - default content
		saveFunc - callback.
	
	Returns: 
		returns editor instance.
*/
LilyUtils._editor=function(context,container,content,setFunc,getFunc,renderHTML) {
	
	var thisPtr=this;
	var parent=context; //pass in object context
	var containerEl=container; //parent element whose content we are editing
	var defaultContent=content||""; //default content to use when there is no content.
	var editEnd = setFunc||null; //set parent args after editing
	var editStart = getFunc||null; //get parent args to edit
	var displayHTML = (typeof renderHTML == "undefined")?true:renderHTML; //display html
	var win=parent.controller.win; //window where this is taking place.
	var charSize = LilyUtils.getAverageCharSize(win);
	var containerWidth=null;
	this.editState=false;
		
	var editHTML="<textarea cols=\"10\" rows=\"1\" style=\"border-width:0px;padding:0px;margin:0px;font-family:" + parent.parent.fontFamily + ";font-size:" + parent.parent.fontSize + "px\" autocomplete=\"off\" id=\""+ parent.createElID("_editor") +"\"></textarea>";
	
	this.startEdit=function() {
		if(!thisPtr.editState) { //if we're not already editing
			
			containerWidth=parent.ui.getActualWidth(); //give it a little padding...
			var charsInLine = Math.ceil(containerWidth/charSize);
			
			parent.controller.patchController.removePatchObserver(parent.objID,"deleteKey",function(){parent.parent.deleteObject(parent.objID)},"select");		
			parent.controller.patchController.removePatchObserver(parent.objID,"mousedown",parent.controller.objDrag.mousedown,"select");
			parent.controller.patchController.removePatchObserver(parent.objID,"mouseup",parent.controller.objDrag.mouseup,"select");

			parent.controller.objResizeControl.clearSize();						

			containerEl.innerHTML=editHTML;
			parent.ui.getElByID(parent.createElID("_editor")).cols = charsInLine;
			
			parent.ui.getElByID(parent.createElID("_editor")).value=thisPtr.html2String(editStart());
			parent.controller.attachObserver(parent.objID,"keyup",resizeTextArea,"edit");
			parent.controller.attachObserver(parent.objID,"click",resizeTextArea,"edit");
			resizeTextArea();		
			parent.ui.getElByID(parent.createElID("_editor")).focus();
			parent.ui.getElByID(parent.createElID("_editor")).select();
			parent.controller.removeObserver(parent.objID,"mousedown",LilyUtils.preventDefault,"edit");
			thisPtr.editState=true;
			parent.controller.patchController.setPatchEdit(true);
		}
	}
	
	this.endEdit=function() {
		
		if(parent.ui.getElByID(parent.createElID("_editor"))) {

			parent.controller.removeObserver(parent.objID,"keyup",resizeTextArea,"edit");
			parent.controller.removeObserver(parent.objID,"click",resizeTextArea,"edit");						

			parent.controller.patchController.attachPatchObserver(parent.objID,"deleteKey",function(){parent.parent.deleteObject(parent.objID)},"select");
			parent.controller.patchController.attachPatchObserver(parent.objID,"mousedown",parent.controller.objDrag.mousedown,"select");
			parent.controller.patchController.attachPatchObserver(parent.objID,"mouseup",parent.controller.objDrag.mouseup,"select");

			var txt=parent.ui.getElByID(parent.createElID("_editor")).value;

			if(txt) //if there's text
				containerEl.innerHTML=(displayHTML)?thisPtr.makeSafe(txt):thisPtr.string2HTML(txt);
			else
				containerEl.innerHTML=defaultContent;	//parent.ui.getElByID(parent.createElID("_editor")).blur();

			//constrain the width to the original size
			if(containerWidth>=100)		
				parent.setWidth(containerWidth);
				
			parent.controller.attachObserver(parent.objID,"mousedown",LilyUtils.preventDefault,"edit");				

			//update the object dimensions
			parent.ui.updateObjSize();
			parent.controller.objResizeControl.resetSize();						

			editEnd(txt);
			thisPtr.editState=false;
			parent.controller.patchController.setPatchEdit(false);			
		}
	}

	//replace <br> with new lines
	this.html2String=function(string) {
		return LilyUtils.html2String(string);
	}

	//replace new lines with <br>
	this.string2HTML=function(string) {
		return LilyUtils.string2HTML(string);
	}
	
	//make safe for insertion into dom
	this.makeSafe=function(string) {
		return LilyUtils.makeSafe(string);
	}
	
	//onchange/onclick handler
	function resizeTextArea() {

		var textArea=parent.ui.getElByID(parent.createElID("_editor"));
		var valueArr=textArea.value.split("\n");
		var wordArr=textArea.value.split(" ");
		var tmp=0;
		
		//exapnd horizontally
		for(var j=0;j<wordArr.length;j++)
			if(wordArr[j].length>textArea.cols)
				textArea.cols=wordArr[j].length;

		//expand vertically
		for (var i=0;i<valueArr.length;i++) {
		 	if (valueArr[i].length >= textArea.cols)
				tmp+= Math.floor(valueArr[i].length/textArea.cols);
		}

		tmp+= valueArr.length;

		if (tmp>textArea.rows)
			parent.ui.getElByID(parent.createElID("_editor")).rows = tmp-1;

//		thisPtr.controller.cleanupOutletConnections();			
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
LilyUtils._xhr=function(callback,returnType,context,method,async,reqHeader) {

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/*
	Constructor: _iframe
		create a new iframe instance.

	Arguments: 
		context - execution context (required)
		source - html source. (optional)
		height - iframe height (optional)
		width - iframe width (optional)
		scrolling - "yes"/"no"/"auto" - scrolling. (optional)
		function - onload callback (optional)
	
	Returns: 
		returns iframe instance.
*/
LilyUtils._iframe=function(context,source,height,width,scrolling,callback)
{
	var parent=context;
	var thisPtr=this;
	var h=height||200;
	var w=width||200;
	var scroll=scrolling||"auto";
	var cb=callback||null;
	
	//public handle for the html node
	this.objFrame=null;
	
	//need a div over the iframe to capture mouse events
	var frameCover=null;	
	
	//src for the iframe
	var src=source||"chrome://lily/content/blank.html";
	
	//pass the calling context a ref to the view
	parent.ui=new LilyObjectView(parent,'<iframe src="'+src+'" scrolling="'+ scroll +'" id="'+parent.createElID("iframe")+'" style="height:100%;width:100%;margin:0px;border:0px;padding:0px;visibility:hidden"></iframe>');
	parent.ui.draw();
				
	//bang on load
	function frameInit() {
		thisPtr.objFrame.removeEventListener("load",frameInit,true);
		thisPtr.objFrame.style.visibility="visible"; //for the initial load
		frameCover.style.height=(parent.height+5)+"px"; //size the cover to fit
		frameCover.style.width=(parent.width+5)+"px";
		if(typeof cb == "function") { cb(); } //do the callback
	}
	
	//pass thru clicks to the object
	function select(e) {
		e.preventDefault();
		parent.controller.select(e);
		return false;
	}
	
	function click(e) {
		parent.openHelpWindow(e);
		return false;		
	}
	
	function toggleEditabilityFunc() {
		var editMode=parent.controller.patchController.getEditable();
		if(editMode=="performance")	{
			frameCover.style.visibility="hidden";
			frameCover.style.zIndex=-9999;
		} else {
			frameCover.style.visibility="visible";
//			frameCover.style.backgroundColor='red';				
			//frameCover.style.zIndex=9999;
			frameCover.style.zIndex=parent.zIndex+1;
		}
	}
	
	//clean up when the object is deleted
	function destroy() {
		parent.parent.patchView.removeElement(frameCover);
	}
	
	//callback to object drag
	parent.controller.objDrag.cb=function(x,y) {
		frameCover.style.left=x+"px";
		frameCover.style.top=(y+5)+"px";
	}	
	
	//callback to resize
	parent.controller.objResizeControl.cb=function(height,width) {
		frameCover.style.height=(height+5)+"px";
		frameCover.style.width=(width+5)+"px";
	}	
	
	this.objFrame=parent.ui.getElByID(parent.createElID("iframe"));
	this.objFrame.addEventListener("load",frameInit,true);	
	
	this.reload=function() {
		this.objFrame.addEventListener("load",frameInit,true);
		thisPtr.objFrame.src=src;		
	}
	
	//set the object size
	if(h)
		parent.setHeight(h);
	
	if(w)
		parent.setWidth(w);	
	
	//init the div over the iframe
	frameCover=parent.parent.patchView.displayHTML("");
	frameCover.id=parent.createElID("frameCover");
//	frameCover.style.backgroundColor='red';	
	frameCover.style.position='absolute';
	frameCover.style.left=(parent.left)+"px";
	frameCover.style.top=(parent.top+5)+"px";
	frameCover.style.zIndex=parent.zIndex+1; //this is a problem- needs to be tied to the zindex of the object
	
	//try to set this
	parent["frameCover"]=frameCover;
	
	//capture mousedowns over the iframe
	parent.controller.attachObserver(parent.createElID("frameCover"),"mousedown",select,"edit");

	//capture mousedowns over the iframe
	parent.controller.attachObserver(parent.createElID("frameCover"),"click",click,"edit");
	
	//cleanup when object is deleted.	
	parent.controller.attachObserver(parent.objID,"destroy",destroy,"edit");	
	
	//add listeners to handle changes in patch editability
	parent.controller.patchController.attachPatchObserver(parent.objID,"editabilityChange",toggleEditabilityFunc,"all");
	
	//a hack to return focus to the window
	//FIXME *** commenting this out, since it suddenly started causing problems
	//uncommenting this out now to see if it works in FF3
	parent.parent.patchView.oWin.addEventListener("blur",function(event){setTimeout(function(){ if((parent.parent.patchController&&!parent.parent.patchController.editing) && Lily.getCurrentPatch().patchID==parent.parent.patchID){thisPtr.objFrame.blur();}},0);},false);
	
	return this;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//LilyObjectList

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*				
	Class: LilyObjectList
		Maintains a global list of available objects and methods for working with them.
*/
var LilyObjectList = {

	/*
		Property: objArray
			external object array.
	*/
	objArray:[],

	/*
		Property: objDisplay
			hash table of all external objects display names.
	*/
	objDisplay:{},
	
	/*
		Property: objLeaf
			hash table of all external objects leaf names.
	*/
	objLeaf:{},	

	/*
		Method: add
			add object name & path to the object array.
	
		Arguments: 
			leafName - file name
			filePath - file path
	*/
	add:function(leafName,filePath) {
		if(typeof this.objLeaf[leafName]=="undefined") { //no dupes
			this.objArray.push({name:leafName,path:filePath});	
		}	
	},

	/*
		Method: search
			search the object array.
	
		Arguments: 
			name - object classname name, display name or leafname
		
		Returns: 
			returns the object if its found, otherwise return null.
	*/
	search:function(name) {
		for(var i=0;i<this.objArray.length;i++) {
			if(this.objArray[i].name==name||LilyUtils.stripExtension(this.objArray[i].name)==name||this.objArray[i].displayName==name)
				return this.objArray[i];
		}
		return null;
	},

	/*
		Method: searchDirectory
			search a folder and its subdirectories for a specific object.
	
		Arguments: 
			dir - top level directory to search.
			name - object leafname name (including ".js").
		
		Returns: 
			returns true if successful, otherwise return false.
	*/
	searchDirectory:function(dir,name) {
		
		//recurse starting at the specific directory looking for this object.
		LilyUtils.directorySearch(dir,function(entry){
			if(entry.leafName==name) {
			 	LilyObjectList.add(entry.leafName,entry.path); //add entry to the object list
//				return false; need a way to break the loop
			}
		});
		
		//load the object in memory & return true if it worked.
		if(this.include(name))
			return true;
		else
			return false;
	},

	/*
		Method: includeAll
			load all external objects in the array into memory & add their metadata
	*/
	includeAll:function() {
		for(var i=0;i<this.objArray.length;i++) { //don't load patches
			if(this.isLoadable(this.objArray[i].name) && this.objArray[i].path && typeof this.objLeaf[this.objArray[i].name]=="undefined") {
				//log(this.objArray[i].name)
				var extName = LilyUtils.stripExtension(this.objArray[i].name);
				try {
					this.objArray[i].sourceCode=this.load(this.objArray[i].path); //save the source for later...
					var objName = LilyUtils.stripExtension(this.objArray[i].name);	
					this.objArray[i].displayName=LilyUtils.getObjectMetaData(objName).htmlName;
					this.objArray[i].menuName=LilyUtils.getObjectMetaData(objName).textName;
					this.objArray[i].catName=LilyUtils.getObjectMetaData(objName).objectCategory;
					this.objArray[i].objSummary=LilyUtils.getObjectMetaData(objName).objectSummary;
					this.objArray[i].objArguments=LilyUtils.getObjectMetaData(objName).objectArguments;								
					this.objDisplay[((this.objArray[i].menuName)?this.objArray[i].menuName:"tmp")]=objName;
					this.objDisplay[objName]=objName;
					this.objLeaf[this.objArray[i].name]=this.objArray[i].name;	
				} catch(e) {
					LilyDebugWindow.error("External object "+extName.toUpperCase()+" couldn't be loaded: "+e.name + ": " + e.message+" "+e.fileName+",  line: "+e.lineNumber)
				}				
			}	
		}	
	},

	/*
		Method: include
			include a specific object in an array.
	
		Arguments: 
			name - object leafname name
	*/
	include:function(name) {
		var o=this.search(name);
		if(o && this.isLoadable(o.name) && o.path && typeof this.objLeaf[o.name]=="undefined") {
			o.sourceCode=this.load(o.path);			
			var objName = LilyUtils.stripExtension(o.name);	
			o.displayName=LilyUtils.getObjectMetaData(objName).htmlName;
			o.menuName=LilyUtils.getObjectMetaData(objName).textName;
			o.catName=LilyUtils.getObjectMetaData(objName).objectCategory;
			o.objSummary=LilyUtils.getObjectMetaData(objName).objectSummary;
			o.objArguments=LilyUtils.getObjectMetaData(objName).objectArguments;								
			this.objDisplay[((o.menuName)?o.menuName:"tmp")]=objName;
			this.objDisplay[objName]=objName;
			this.objLeaf[o.name]=o.name;			
			return o;
		}
		return null;
	},

	/*
		Method: load
			get an external object & load it into memory.
	
		Arguments: 
			path - external object path
	*/
	load:function(path) {
		
		var source = null;
		
		///add code here to load zipped files.
		//ultimately we need to be able to handle libraries...
		//what about handling non-file protocols?
		//specify a search path that includes web directory- get all objects from the directory, etc
		//vis a vis install- wouldn't work since upgrade would blow away private objects.
		//need to keep them outside the install directory
		
		if(LilyUtils.isCompressed(path)) {
			
//			LilyUtils.jsDump(path)

			var zipFile = LilyUtils.getFileHandle(path);			
			var objName = LilyUtils.stripExtension(zipFile.leafName);
			
			var targetDir = Lily.resourceDir.clone();
			targetDir.append(objName);
			
			if( !targetDir.exists() || !targetDir.isDirectory() ) {   // if it doesn't exist, create
				targetDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
			}
			
			var zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"].createInstance(Components.interfaces.nsIZipReader);
			//zipReader.init(zipFile);			
			zipReader.open(zipFile);
			
			var entries = zipReader.findEntries(null); 
			while (entries.hasMore()) { 
				
				var entryName = entries.getNext(); 
				
				//var entry = zipReader.getEntry(entryName);	//entry.QueryInterface(Components.interfaces.nsIZipEntry); 
				
				var fileName = entryName.substring(entryName.lastIndexOf("/")+1,entryName.length);
									
				if(!fileName.match(/$\/|$\\|^\.|^\_/,"")&&fileName.length) {
					
					var targetFile = targetDir.clone();
//					LilyUtils.jsDump("copying "+fileName);
					targetFile.append(fileName)
					zipReader.extract(entryName,targetFile);
				}
								
			}				
			
			var objFile=targetDir.clone();
			objFile.append(objName+".js");
			
			//bail if there's no js.
			if(!objFile.exists())
				return "";			
			
			path=objFile.path;
			
			//extract archive and copy it to resources dir comme ca -> chrome/content/resources/foo.
			//overwrite any existing directory that might be there.
			//if save as app, then the resource directory will be copied over and any lily urls will be rewritten
			//we now have a chrome url to load the external using xhr...
			//and the extern can load resources using chrome://lily/content/resources/foo/myresource.png
			//on shutdown we might need a cleanup...
			//now the question is how does a _patch_ include an external resource?
		}
			
		//******* removing this due to changes in FF3 ********			
		//faster to use nsiFile methods or xmlhttp		
		//var xhr=new LilyUtils._xhr(handleResponse,'text',this,"GET",false); //,"GET",false
		//xhr.loadXMLDoc("file://"+path);
		
		//function handleResponse(_thisObjectSourceCode) { //_thisObjectSourceCode is available in the object context and contains the source code for the object.
		//	source=_thisObjectSourceCode;
		//	eval.apply(Lily,[_thisObjectSourceCode]); //eval in the context of the window 
		//}
		
		source = LilyUtils.readFileFromPath(path,false).data;		
		LilyUtils.loadScript("file://"+path,Lily);
		
		return source; //return the source	
	},
	
	/*
		Method: isLoaded
			determine if an external object is loaded.
	
		Arguments: 
			name - object classname
			
		Returns:
			boolean- object load state
	*/
	isLoaded:function(name) {
		
		var objName = (LilyUtils.hasExtension(name))?"$"+(LilyUtils.stripExtension(name)):"$"+name;
			
		//look to see if the name is defined
		if(typeof Lily[objName] != "undefined") 
			return true;
		else
			return false;
	},
	
	/*
		Method: isLoadable
			test to see if this a file type we can load.
			
		Arguments: 
			str - file leafName	
	
		Returns: 
			returns bool- true if loadable
	*/
	isLoadable: function(str) {							
		return str.match(/\.js$|\.zip$|\.rsrc$/);
	},	

	/*
		Method: get
			get the object array.
	
		Returns: 
			returns the object array
	*/
	get:function() {
		return this.objArray;
	},
	
	/*
		Method: getNames
			get all object display names.
	
		Returns: 
			returns a alphabetically sorted array of names.
	*/	
	getNames:function() {
		var tmp=[];
		for(var i=0;i<this.objArray.length;i++) {			
			if(this.objArray[i].name.indexOf(".json")==-1)
				tmp.push(this.objArray[i]);
		}
		tmp.sort(function(a,b) {
						
			   if (a["menuName"] < b["menuName"])
			      return -1;
			   if (a["menuName"] > b["menuName"])
			      return 1;
			   // a must be equal to b
			   return 0;			
			
		});
		return tmp;
	},
	
	/*
		Method: getNamesByCategory
			get all object display names.
	
		Returns: 
			returns an array of names sorted by category.
	*/
	getNamesByCategory:function() {
		var tmp=[];
		for(var i=0;i<this.objArray.length;i++) {			
			if((this.objArray[i].name.indexOf(".json")==-1)&&(this.objArray[i].catName!=undefined))
				tmp.push(this.objArray[i]);
		}
		tmp.sort(function(a,b) {
						
			   if (a["catName"] < b["catName"])
			      return -1;
			   if (a["catName"] > b["catName"])
			      return 1;
			   if (a["menuName"] < b["menuName"])
			      return -1;
			   if (a["menuName"] > b["menuName"])
			      return 1;			
			
			   // a must be equal to b
			   return 0;			
			
		});
		
		for(var j=0;j<tmp.length;j++) {
			
		}
		
		return tmp;		
	},
	
	/*
		Method: genExternListDocs
			create some HTML docs.
	
		Returns: 
			HTML string of external object documentation for the wiki.
	*/
	genExternListDocs:function() {
		var tmp = this.getNamesByCategory();
		var str = "";
		
		str += "<table border=\"1\" cellpadding=\"5\" width=\"100%\">\n";
		str += "<tr><td width=\"20%\">'''Object Name'''</td><td width=\"20%\">'''Category'''</td><td width=\"60%\">'''Description'''</td></tr>";
				
		for(var i=0;i<tmp.length;i++) {
			str += "<tr><td>[["+tmp[i]["menuName"]+"]]</td><td>"+tmp[i]["catName"]+"</td><td>"+tmp[i]["objSummary"]+"</td></tr>\n";
		}
		
		str += "</table>";
		
		//we could write this to disk, but for my purposes its easier to copy & paste it from the debug window.
		LilyDebugWindow.print(str);
		
	},
	

	/*
		Method: genExternDetailDocs
			create some HTML docs.
	
		Returns: 
			HTML string of external object documentation for the wiki.
	*/
	genExternDetailDocs:function() {
		
		var patch = Lily.getCurrentPatch();		
		var tmp = this.getNamesByCategory();
		var i = 0;
		var str = "";
		
		function processObject() {
			
			try {				
				var object = patch.createObject(tmp[i]["menuName"],null,null,null,null);
				var name = object.name;
				var meta_data = LilyUtils.getObjectMetaData(name);
				var inArr = object.getInlets();
				var outArr = object.getOutlets();
				
				//LilyDebugWindow.print(name + " " + meta_data.objectCategory + " " + meta_data.objectSummary);
				
				str += "\n\n\n<table border=\"0\" width=\"100%\" cellpadding=\"0\">\n";				
				str += "<tr><td><h1>" + meta_data.htmlName + "</h1><i>" + meta_data.objectSummary + "</i></td></tr>\n";	
				str += "<tr><td>&nbsp;</td></tr>";			
				str += "<tr><td><h2>Inlets</h2></td></tr>\n";							
				
				for(var j=0;j<inArr.length;j++) {
					
					//LilyDebugWindow.print("\tinlets "+object[inArr[j]].id+" "+object[inArr[j]].helpText);
					
					str += "<tr><td><b>" + object[inArr[j]].id + "</b> <i>" + object[inArr[j]].helpText + "</i></td></tr>\n";
					
					var inObj = object[inArr[j]];
					for(var x in inObj) {
						if(
							typeof inObj[x] == "function" && 
							x != "processInput" &&
							x != "getConnected" &&
							x != "getObjectType" &&
							x != "connect" &&
							x != "deconnect" &&
							x != "removeConnection" &&							
							x != "removeConnections" &&
							x != "doOutlet"																																									
						) {
							//LilyDebugWindow.print("method "+x);
							str += "<tr><td><pre>&lt;" + x + "&gt;</pre></td></tr>\n";
						}
					}
						
				}

				str += "<tr><td>&nbsp;</td></tr>";
				str += "<tr><td><h2>Outlets</h2></td></tr>";					
				
				for(var j=0;j<outArr.length;j++) {
					
					//LilyDebugWindow.print("\toutlets "+object[outArr[j]].id+" "+object[outArr[j]].helpText);
					str += "<tr><td><b>" + object[outArr[j]].id + "</b> <i>" + object[outArr[j]].helpText + "</i></td></tr>\n";
					
				}
				
			} catch(e) {
				//LilyDebugWindow.error("oops "+tmp[i]["menuName"]);
			}
			
			//LilyDebugWindow.print("object args "+meta_data.objectArguments)
			
			str += "<tr><td>&nbsp;</td></tr>";			
			str += "<tr><td><h2>Arguments</h2>" + meta_data.objectArguments + "</td></tr>\n";
			str += "<tr><td>&nbsp;</td></tr>";						
			str += "<tr><td><h2>Notes</h2></td></tr>\n";
			str += "<tr><td>&nbsp;</td></tr>";			
			str += "</table>\n\n\n";						
			
			i++;
			
			if(typeof tmp[i] != "undefined") {
				setTimeout(function(){processObject();},100);
			} else {
				//LilyDebugWindow.print(str);
				LilyUtils.writeDataToFile(null,str);
			}
			
			//LilyDebugWindow.print("----------------------------------------------------------");			
				
		}		
		
		setTimeout(function(){processObject();},100);
		
	},	

	/*
		Method: getPath
			get the file path for a given object.
			
		Arguments: 
			name - external object className	
	
		Returns: 
			returns file path if found else return null.
	*/
	getPath:function(name) {

		for(var i=0;i<this.objArray.length;i++) {			
			if(this.objArray[i].menuName==name)
				return this.objArray[i].path;
		}
		return null;
	},
	
	/*
		Method: getDisplayName
			get the display name for a given object name.
			
		Arguments: 
			name - external object className	
	
		Returns: 
			returns the display name if found else return null.
	*/
	getDisplayName:function(objName) {

		for(var i=0;i<this.objArray.length;i++) {												
			if(this.objArray[i].name==(objName+".js"))
				return this.objArray[i].menuName;
		}
		return null;
	}		
	
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//LilyAPIKeyManager

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*				
	Class: LilyAPIKeyManager
		Manage API Keys for objects that require them.
*/
var LilyAPIKeyManager= {
	
	keys:null,
	keysObj:null,
	keyPath:null,

	/*
		Method: initKeys
			load the key file from disk and into memory.
	*/
	initKeys:function() {
		var pathToKeys = Lily.installDir.clone();
		pathToKeys.append("content");
		pathToKeys.append("keys.txt");
		this.keyPath=pathToKeys.path;
		this.keys=LilyUtils.readFileFromPath(pathToKeys.path);
		this.keysObj=eval("("+this.keys.data+")");
	},
	
	/*
		Method: saveKeys
			save the key file to disk.
	*/
	saveKeys:function() {		
		var file = LilyUtils.getFileHandle(this.keyPath);
		LilyUtils.writeDataToFile(file,this.keysObj.toSource());
	},	

	/*
		Method: getKey
			get a key.
			
		Arguments: 
			keyType - the api key name	
	
		Returns: 
			returns key if found else return null.
	*/
	getKey:function(keyType) {
		
		var keyValue = this.keysObj[keyType].key;

		if(keyValue!=undefined&&keyValue!="") {
			return keyValue;
		} else {
			this.keyNotFound(keyType);
			return null;
		}
		
	},
	
	/*
		Method: getKeyObject
			return the key hash.
	
		Returns: 
			returns the key object.
	*/
	getKeyObject:function() {		
		return this.keysObj;
	},	

	/*
		Method: keyNotFound
			print an key manager error message.
			
		Arguments: 
			keyType - the api key name
	*/
	keyNotFound:function(keyType) {
		LilyDebugWindow.error(keyType + " not found.");
	},	

	/*
		Method: setKey
			set a key value.
			
		Arguments: 
			keyType - the api key hash key
			keyValue - the api key value
			keyURL - the api key url
			keyLabel - the api key label
	*/
	setKey:function(keyType,keyValue,keyURL,keyLabel) {
			
		if(keyType) {
			
			if(typeof this.keysObj[keyType]=="undefined") {
				this.keysObj[keyType]={};
			}
			
			if(keyValue)
				this.keysObj[keyType].key=keyValue;
				
			if(keyURL)
				this.keysObj[keyType].url=keyURL;	
				
			if(keyLabel)
				this.keysObj[keyType].label=keyLabel;							
				
		}	
	},

	/*
		Method: addNewKeyType
			print an key manager error message.
			
		Arguments: 
			type - the api key name
			val - the api key value			
	*/
	addNewKeyType:function() {
		//do stuff
	}	
	
}

//redefining this fixes a very obscure bug (in FF3b5), that i can reproduce but not understand...
Array.prototype.toString = function() {
	var str = "";
	for(var i=0; i < this.length; i++) {
		str += this[i].toString()
		str += (i<this.length-1) ? ", " : "";
	}
	return str;
}
