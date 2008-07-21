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
	Script: externals.js
		Contains LilyObjectList
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/


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
		var stripped = LilyUtils.stripExtension(leafName);
		if(typeof this.objLeaf["_"+stripped]=="undefined") { //no dupes
			if(LilyUtils.isLegalID(stripped)) {
				this.objArray.push({name:leafName,path:filePath});
				this.objLeaf["_"+stripped]=leafName;	
			} else {
				LilyDebugWindow.error("Couldn't load the patch or external "+stripped+" because the name contains illegal characters.");
			}		
		} else {
			LilyDebugWindow.error("Couldn't load the patch or external "+stripped+". An object with that name is already exists.");
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
			if(this.isLoadable(this.objArray[i].name) && this.objArray[i].path) {
				var extName = LilyUtils.stripExtension(this.objArray[i].name);
				try {
					this.objArray[i].sourceCode=this.load(this.objArray[i].path); //save the source for later...
					var objName = LilyUtils.stripExtension(this.objArray[i].name);	
					this.objArray[i].displayName=LilyUtils.getObjectMetaData(objName).htmlName;
					this.objArray[i].menuName=LilyUtils.getObjectMetaData(objName).textName;
					this.objArray[i].catName=LilyUtils.getObjectMetaData(objName).objectCategory;
					this.objArray[i].objSummary=(LilyUtils.getObjectMetaData(objName).objectSummary?LilyUtils.getObjectMetaData(objName).objectSummary:LilyUtils.extractPatchDesc(this.objArray[i].sourceCode));
					this.objArray[i].objArguments=LilyUtils.getObjectMetaData(objName).objectArguments;								
					this.objDisplay[((this.objArray[i].menuName)?this.objArray[i].menuName:"tmp")]=objName;
					this.objDisplay[objName]=objName;
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
		if(o && this.isLoadable(o.name) && o.path) {
			o.sourceCode=this.load(o.path);			
			var objName = LilyUtils.stripExtension(o.name);	
			o.displayName=LilyUtils.getObjectMetaData(objName).htmlName;
			o.menuName=LilyUtils.getObjectMetaData(objName).textName;
			o.catName=LilyUtils.getObjectMetaData(objName).objectCategory;
			o.objSummary=LilyUtils.getObjectMetaData(objName).objectSummary;
			o.objArguments=LilyUtils.getObjectMetaData(objName).objectArguments;								
			this.objDisplay[((o.menuName)?o.menuName:"tmp")]=objName;
			this.objDisplay[objName]=objName;			
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
				
		source = LilyUtils.readFileFromPath(path,false).data;		
		if(!/\.json/.test(path)) LilyUtils.loadScript("file://"+path,Lily); //only load externs, not patches
		
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
		return str.match(/\.js$|\.zip$|\.rsrc$|.json$/);
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