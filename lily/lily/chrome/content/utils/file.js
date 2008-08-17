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
	Script: file.js
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
		Utility Methods.
*/

/*
	Method: openDir
		opens a directory.

	Arguments: 
		path - path to directory.
*/	
LilyUtils.openDir = function(path) {
	var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	dir.initWithPath(this.stripLTQuotes(path));
	dir.launch();
}

/*
	Method: getTempFile
		returns a temp file.
	
	Returns: 
		returns file- hold on to it, you're responsible for removing it when you're done.
*/
LilyUtils.getTempFile = function(ext) {
	var extension = ext||"tmp";	
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
	                     .getService(Components.interfaces.nsIProperties)
	                     .get("TmpD", Components.interfaces.nsIFile);
	file.append("file."+extension);
	file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
	return file;
}

/*
	Method: chromeURLToFile
		return a nsiFile for a chrome url.

	Arguments: 
		chrome url.
	
	Returns: 
		returns nsiFile.
*/
LilyUtils.chromeURLToFile = function(aPath) {
	
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
			
}

/*
	Method: readFile
		returns the contents of a file.

	Arguments: 
		file - file handle.
	
	Returns: 
		returns file contents as a string.
*/	
LilyUtils.readFile = function(file) {
	
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
}

/*
	Method: readFileFromPath
		returns the contents of a file.

	Arguments: 
		filepath - path to file to read.
		usePicker - boolean- use filepicker
	
	Returns: 
		returns an object containing file contents as a string and the file handle.
*/	
LilyUtils.readFileFromPath = function(filepath,usePicker) {
	
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
}

/*
	Method: readAsyncFromURL
		returns the contents of a file.

	Arguments: 
		url - url to file to read.
*/	
LilyUtils.readAsyncFromURL = function(url,func) {
	
	var data ="";
		
	if(url) {
		var xhr=new LilyComponents._xhr(function(str) {
			func(str);
		},"text",this);		
		xhr.loadXMLDoc(url);	
	}				
}

/*
	Method: readSyncFromURL
		returns the contents of a file.

	Arguments: 
		url - url to file to read.		
		
*/	
LilyUtils.readSyncFromURL = function(url,func) {
	
	var data ="";
		
	if(url) {
		var xhr=new LilyComponents._xhr(function(str) {
			func(str);
		},"text",this,"GET",false,null);		
		xhr.loadXMLDoc(url);	
	}				
}		

/*
	Method: writeDataToFile
		writes a string to a file.

	Arguments: 
		file - file handle (optional).
		data - data string to write
	
	Returns: 
		returns file handle.
*/
LilyUtils.writeDataToFile = function(file,data) {
	
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
}

/*
	Method: writeBinaryFile
		writes a string to a file.

	Arguments: 
		file - file handle.
		data - data string to write

	Returns: 
		returns file handle.
*/
LilyUtils.writeBinaryFile = function(aFile, data) {

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
	
}	

/*
	Method: writeFile
		writes a string to a file.

	Arguments: 
		file - file handle.
		data - data string to write
	
	Returns: 
		returns file handle.
*/
LilyUtils.writeFile = function(file, data) {
	
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
		
}

/*
	Method: getFileHandle
		returns a file handle if it exists.

	Arguments: 
		name -  path to file.
	
	Returns: 
		returns file handle if its exists, otherwise returns null.
*/
LilyUtils.getFileHandle = function(filepath) {
	if(filepath) {
		file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		try {	
			file.initWithPath(this.stripLTQuotes(filepath));
			return file;		
		} catch(e){ 
			return null;
		}
	}	
}

/*
	Method: getDirSeparator
		returns the platform appropriate separator.
	
	Returns: 
		returns "/" on mac/linux, "\" on windows.
*/
LilyUtils.getDirSeparator = function() {
	return (this.navigatorPlatform()=='windows') ? "\\" : "/";
}	

/*
	Method: getFilePath
		returns the path to a file if the supplied path is correct or if the file is in 
		the parent patch directory or the search patch.

	Arguments: 
		name - patch file name.
	
	Returns: 
		returns file path if its exists, otherwise returns an empty string.
*/	
LilyUtils.getFilePath = function(filepath) {
	
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
				var parentDir=Lily.getCurrentPatch().getFirstParentPatch().getPatchDir(); //get the parent dir
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
		
}

/*
	Method: directorySearch
		recursive directory search

	Arguments: 
		dir - nsiFile directory.
		callback - function to call for each entry
	
	Returns: 
		returns array of file handles.
*/	
LilyUtils.directorySearch = function(dir,callback) {
	
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

}	

/*
	Method: getPatchPath
		returns the path to a patch if its in the search patch.

	Arguments: 
		name - patch file name.
	
	Returns: 
		returns file path if its exists, otherwise returns an empty string.
*/	
LilyUtils.getPatchPath = function(name,url) {
	
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
}

/*
	Method: getInstallDir
		get the installation directory.

*/
LilyUtils.getInstallDir = function(extID) {
	
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
			
}