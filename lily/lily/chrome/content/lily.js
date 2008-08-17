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
	Script: lily.js
		Contains the Lily application class.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/

/*		
	Class: Lily
		 Top-level Lily application object.		
*/

var Lily = 
{	
	
	/*
		Group: Properties
	*/
	
	/*
		Property: debug
			boolean- true if debug is enabled.
	*/	
	debug:true,	
	
	/*
		Property: trace
			boolean- true if tracing is enabled.
	*/	
	trace:false,	
	
	/*
		Property: version
			version string
	*/	
	version: "0.1-public_beta-2",
	
	/*
		Property: nameSpace
			name space
	*/	
	nameSpace: "lily",	
	
	/*
		Property: currPatch
			active patch id
	*/
	currPatch: null,

	/*
		Property: initialized
			initialized state
	*/
	initialized: false,
	
	/*
		Property: clipboard
			application clipboard
	*/
	clipboard: null,

	/*
		Property: sharedValue
			shared variable used by externals that need to share data across patches.
	*/
	sharedValue:{},

	/*
		Property: receiveObjects
			shared object with receive objects in all patches hashed by id.
	*/
	receiveObjects:{},	
	
	/*
		Property: patchObj
		array of open patches hashed by patch id
	*/
	patchObj: {},
	
	/*
		Property: patchCount
		open patch count
	*/	
	patchCount: 0,
	
	/*
		Property: patchCount
		open patch count
	*/	
	firstTimeHelpDisplayed: false,
	
	/*
		Property: appQuitListener
		app quit observer
	*/
	appQuitListener: {
		observe: function(subject, topic, data) {
			var cancelQuit = subject.QueryInterface(Ci.nsISupportsPRBool);
			cancelQuit.data = true;
			Lily.shutdown(true);
		},
		register: function() {
		  var observerService = Components.classes["@mozilla.org/observer-service;1"]
		                        .getService(Components.interfaces.nsIObserverService);
		  observerService.addObserver(this, "quit-application-requested", false);
		},
		unregister: function() {
		  var observerService = Components.classes["@mozilla.org/observer-service;1"]
		                          .getService(Components.interfaces.nsIObserverService);
		  observerService.removeObserver(this, "quit-application-requested");
		}	
	},
			
	
	/******************************************
		Group: Methods
	******************************************/	
	
	/*
		Method: makePatchCurrent
			makes a patch current.

		Arguments: 
			pID - patch id.
	*/
	makePatchCurrent: function(pID) {
		this.currPatch=pID;
	},

	/*
		Method: getCurrentPatch
			returns the current patch object.

		Returns: 
			the current patch object.	
	*/
	getCurrentPatch: function() {
		if(this.patchObj[this.currPatch])
			return this.patchObj[this.currPatch].obj;
		else
			return null;
	},
		
	/*
		Method: incPatchCount
			increments the patch count.

		Returns: 
			the incremented patch count.
	*/
	incPatchCount: function() {
		this.patchCount++;
		return this.patchCount;		
	},
	
	/*
		Method: generatePatchID
			Simple method for generating a patch ID.

		Returns: 
			the new patch ID.
	*/
	generatePatchID: function() {
		return this.incPatchCount();
	},
	
	/*
		Method: shutdown
			App shutdown and clean up.
	*/	
	shutdown: function(quitApp) {
		
		try {
			
			if(typeof this.closeAllPatches=="function" && this.closeAllPatches()) {

				//close the debug window
				try {
					if(typeof LilyDebugWindow.close=="function")
						LilyDebugWindow.close();	
				} catch(e) {
					if(quitApp) 
						this.quit();
					else
						window.close();
				}

				//close the inspector window
				try {
					if(typeof LilyInspectorWindow.close=="function")	
						LilyInspectorWindow.close();
				} catch(e) {
					if(quitApp) 
						this.quit();
					else
						window.close();
				}
				
				//set the init flag and unregister app listeners		
				try {
					this.initialized=false;
					this.appQuitListener.unregister();	
				} catch(e) {
					if(quitApp) 
						this.quit();
					else
						window.close();
				}

				//quit the app
				if(quitApp) 
					this.quit();
				else
					window.close();
			}
			
		} catch(e) {
			
			//just bail
			if(quitApp) 
				this.quit();
			else
				window.close();
				
		}
				
	},

	/*
		Method: quit
			Quit a xulrunner application
			
		Arguments: 
			aForceQuit - boolean flag determines if we force quit.	
	*/
	quit:function(aForceQuit) {
		
		//close the windows
		//this.shutdown();
		
		var appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].
		  getService(Components.interfaces.nsIAppStartup);

		// eAttemptQuit will try to close each XUL window, but the XUL window can cancel the quit
		// process if there is unsaved data. eForceQuit will quit no matter what.
		var quitSeverity = aForceQuit ? Components.interfaces.nsIAppStartup.eForceQuit :
		                                Components.interfaces.nsIAppStartup.eAttemptQuit;
//		LilyDebugWindow.print(appStartup+" "+quitSeverity)
		
		appStartup.quit(quitSeverity);
		
	},

	/*
		Method: displayInitMessage
			Display a loading indicator to show we are starting up.
	*/
	//FIXME - 
	displayInitMessage: function() {
		//win,str,width,color
		if(!this.initialized)
			LilyUtils.displayMessageDialog(content,"<img src='chrome://lily/content/images/activity-medium.png'/>",200);	
	},
				
	/*
		Method: init
			App init- read prefs, build list of directory pathhs, extensions, API Keys, etc.
	*/	
	init: function() {
		
		if(this.initialized)
			return;

		var openDebugWin = LilyUtils.getConfigProperty("openDebugWin"); //read id from external config file.
		
		if(openDebugWin) { LilyDebugWindow.open(); }
		
		this.appQuitListener.register();
		
		//turn on debugging for catching errors
		var jsds = Components.classes["@mozilla.org/js/jsd/debugger-service;1"].getService(Components.interfaces.jsdIDebuggerService);
		jsds.on();
		jsds.errorHook = { 
				
			onError: function(message, fileName, line, pos, flags, exception){
				var type = (flags & Components.interfaces.jsdIErrorHook.REPORT_WARNING) ? "warning" : "error";
				if (type=="error" && Lily.debug) {
					LilyDebugWindow.error("ERROR : '"+message+"' FILE : "+fileName+" LINE : "+line);	
				}
			}
				
		};
		
		//LilyDebugWindow.print("starting up...");			
		
		try {
			this.searchPath = LilyUtils.getStringPref("extensions.lily.searchPath"); //this.prefs.getCharPref("extensions.lily.searchPath");
			this.accelKey = LilyUtils.getIntPref("ui.key.accelKey");//this.prefs.getIntPref("ui.key.accelKey");
		} catch(e) {
			LilyDebugWindow.error("init failed: couldn't get the preferences");
		}
				
		try {
			const extID = LilyUtils.getConfigProperty("extID"); //read id from external config file.
		} catch(e) {
			LilyDebugWindow.error("init failed: couldn't get the ext id");
		}				
					
		try {
			this.installDir = LilyUtils.getInstallDir(extID);
			this.installPath=this.installDir.path;

			var contentDir = this.installDir.clone();
			contentDir.append("chrome");	
			contentDir.append("content");
			this.contentPath=contentDir.path;

			var externalsDir = this.installDir.clone();
			externalsDir.append("chrome");			
			externalsDir.append("content");
			externalsDir.append("externals");
			this.externalsPath=externalsDir.path;

			var libDir=this.installDir.clone();
			libDir.append("chrome");			
			libDir.append("content");
			libDir.append("lib");
			this.libPath=libDir.path;

			this.helpDir=this.installDir.clone();
			this.helpDir.append("chrome");			
			this.helpDir.append("content");
			this.helpDir.append("help-patches");
			this.helpPath=this.helpDir.path;

			this.resourceDir=this.installDir.clone();
			this.resourceDir.append("chrome");			
			this.resourceDir.append("content");
			this.resourceDir.append("resources");

			//delete the old resource directory if we're not an app or xpi
			if(this.nameSpace=="lily") {
				if(this.resourceDir.exists())
					this.resourceDir.remove(true);

				//create a new directory
				this.resourceDir=this.installDir.clone();
				this.resourceDir.append("chrome");					
				this.resourceDir.append("content");
				this.resourceDir.append("resources");

				if( !this.resourceDir.exists() || !this.resourceDir.isDirectory() ) {   // if it doesn't exist, create
					this.resourceDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
				}	
			}			
				
		} catch(e) {
			LilyDebugWindow.error("init failed: couldn't find the install path or some internal resource");
		}	
			
		try {
			this.loadObjectList();
		} catch(e) {
			LilyDebugWindow.error("init failed: couldn't load the external object library");
		}											
				
		try {
			LilyMenuBar.initFonts(); //load the fonts into the menu object.		
		} catch(e) {
			LilyDebugWindow.error("init failed: couldn't init fonts");
		}			

		try {
			LilyAPIKeyManager.initKeys();
		} catch(e) {
			LilyDebugWindow.error("init failed: couldn't get the api keys");
		}
			
		//do a shutdown if the main window is closed		
		window.addEventListener("close",function(e) {
			e.preventDefault();
			Lily.shutdown(false);
		},true);
				
		this.initialized=true;
		
//		LilyDebugWindow.print("...done")		
		
	},

	/*
		Property: objectsLoaded
			Objects loaded flag- boolean.
	*/
	objectsLoaded: false,	
	
	/*
		Method: loadObjectList
			Part of app init- load objects into memory.
	*/	
	loadObjectList: function() {
			
//		LilyDebugWindow.print("this.externalsPath " +  this.externalsPath);
		
		if(this.objectsLoaded)
			return;
				
		//load the builtin objects
		this.loadObjectDir(this.externalsPath);
		
		//need to fix this to handle multiple search paths
		if(this.searchPath)
			this.loadObjectDir(this.searchPath);
					
		//load them into memory on the page
		LilyObjectList.includeAll();
		
		this.objectsLoaded=true;
		
	},
		
	/*
		Method: loadObjectDir
			Part of app init- open object directory, read objects from disk and add them to LilyObjectList.
			
		Arguments: 
			pathToDir - Path to object directory.	
	*/
	loadObjectDir: function(pathToDir) {

		var dir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		
		//open the search directory- needs to expanded to work with multiple directories
		dir.initWithPath(LilyUtils.stripLTQuotes(pathToDir));	
		
		if(!dir.exists()) { 
			//need error stuff here
			LilyDebugWindow.error("error- directory "+ pathToDir +" not found.");
			return;
		} else {
			//recurse thru the directories calling this function
			LilyUtils.directorySearch(dir,function(entry){
				if(LilyObjectList.isLoadable(entry.leafName)&&!LilyUtils.isResource(entry.leafName))
				 	LilyObjectList.add(entry.leafName,entry.path); //add entry to the object list
				else if(LilyUtils.isResource(entry.leafName))
					LilyObjectList.load(entry.path);
			});	
		}
					
	},
	
	/*
		Method: newPatchFromMenu
			Dispatch command from menu item.	
	*/	
	newPatchFromMenu: function() {
		if(!this.initialized) LilyDebugWindow.open();
		setTimeout(function(){Lily.newPatch();},100); //give the debug window a chance to open, in the event there are errors
	},

	/*
		Method: _newPatch
			Open a new, empty patch, add it to the patchObj array and make it current.
			
		Arguments: 
			width 	- 	width
			height 	- 	height
			locked 	- 	read-only?
			
		Returns: 
			the new patch ID.	
	*/	
	newPatch: function(width,height,locked,hide) {
		
		if(!this.initialized)
			this.init();		
		
		var w=width||null;
		var h=height||null;
		var pID="patch"+this.generatePatchID();
		var readonly = locked||false;
		var hidden = hide||false;	
		
		this.patchObj[pID]={obj:new LilyPatch(pID,this,w,h,readonly,null,hidden),id:pID,file:null,json:null}; //object, id, file
		setTimeout(function(){Lily.patchObj[pID].obj.updatePatchData();},1000); //save a copy of the patch string	
		this.makePatchCurrent(pID);
		
		//this will be overwritten if this is called as part of openpatch();
		//FIXME - reenable this when i have some content
		//this.patchObj[pID].obj.callback=function(){Lily.openFirstTimeMessage();}
		
		return pID;
		
	},
	
	/*
		Method: openAppPatch
			Open the patch window for an application.
			
		Arguments: 
			name - patch name.
													
	*/
	openAppPatch: function(name,hidden) {

		if(!this.initialized)
			this.init();

		var patchFile = this.installDir.clone();
		patchFile.append("chrome");		
		patchFile.append("content");
		patchFile.append(name+".json");
		this.openPatchFromFile(patchFile,true,hidden);
		
	},	
	
	/*
		Method: openAddOnPatch
			Open the patch window for an addon.
			
		Arguments: 
			name - patch name.
													
	*/
	openAddOnPatch: function(name,item,hidden) {
		
		if(!this.initialized)
			this.init();
			
		if(item.getAttribute("checked")=="true") {
			var openDebugWin = LilyUtils.getConfigProperty("openDebugWin"); //read id from external config file.
			var chromeURL = "chrome://"+name+"/content/"+name+".json";
			var patchFile = LilyUtils.chromeURLToFile(chromeURL);
			if(patchFile) {
				this.openPatchFromFile(patchFile,true,hidden);
				if(openDebugWin && !LilyDebugWindow.isOpen()) { LilyDebugWindow.open(); }	
			}
		} else {
			var pid = LilyUtils.getPIDFromPackage(name);
			this.close(pid);
			LilyDebugWindow.close();
			//FIXME *** 
			//need to do a proper shutdown here...
		}
		
	},

	/*
		Method: openPatchFromFile
			Open an existing patch from a file, add it to the patchObj array and make it current.
			
		Arguments: 
			file - nsiFile.
			
		Returns: 
			The patch object.										
	*/
	openPatchFromFile: function(file,protect,hide) {
		var self=this;
		var data=LilyUtils.readFile(file); //read the data...
		var readonly=protect||false;
		var hidden=hide||false;
		
		var sizeArr=LilyUtils.extractPatchSize(data); //get the patch size w/o having to eval the json.
		var patchID=this.newPatch(sizeArr[0],sizeArr[1],readonly,hidden); //patch constructor- opens blank window.
		var parentDir=(file.parent.isDirectory())?file.parent:null; //patch's parent dir.

		this.patchObj[patchID].file=file; //save a ref to the file		
		this.patchObj[patchID].obj.callback=function(){
			self.patchObj[patchID].obj.openPatch(data,null,null,LilyUtils.stripExtension(file.leafName),parentDir); //create the patch in the new window.
			//self.patchObj[patchID].json=self.patchObj[patchID].obj.patchModel.serializeDom(); //save a copy of the patch string
			if(readonly) self.patchObj[patchID].obj.patchController.setEditable("performance"); //if readonly, go to perf mode.
			if(hidden) self.patchObj[patchID].obj.blurWin();			
		}
		this.makePatchCurrent(patchID);//make this the current patch.
		return this.patchObj[patchID];
	},
	
	/*
		Method: openPatchFromMenu
			Dispatch command from menu item.	
	*/	
	openPatchFromMenu: function() {
		if(!this.initialized) LilyDebugWindow.open();
		setTimeout(function(){Lily.openPatch();},100); //give the debug window a chance to open, in the event there are errors
	},	
		
	/*
		Method: openPatch
			Open an existing patch, add it to the patchObj array and make it current.
			
		Arguments: 
			str - JSON patch string (optional).
			
		Returns: 
			The patch object.										
	*/
	openPatch: function(str,title,locked,hidden) {
		
		if(!this.initialized)
			this.init();
			
		var data = str||null;	
		var patchTitle = title||"Untitled";
		var readonly = locked||false;
		var hide = hidden||false;
		var self = this;
			
		if(!data) {
			var tmp = LilyUtils.readFileFromPath(null,true);		
			if(tmp.file) {
				this.openPatchFromFile(tmp.file,readonly,hide);
			}
		} else {
			
			var sizeArr=LilyUtils.extractPatchSize(data);
			var patchID=this.newPatch(sizeArr[0],sizeArr[1],readonly,false);
						
			this.patchObj[patchID].obj.callback=function(){
					self.patchObj[patchID].obj.openPatch(data,null,null,patchTitle);
					//self.patchObj[patchID].json=self.patchObj[patchID].obj.patchModel.serializeDom(); //save a copy of the patch string
					if(readonly) self.patchObj[patchID].obj.patchController.setEditable("performance");	//if readonly, go to perf mode.						
			}		
			this.makePatchCurrent(patchID);
		}
		if(this.patchObj[patchID])
			return this.patchObj[patchID].obj; //returns the patch object- need this for scripting
	},
		
	/*
		Method: openPatchFromNet
			Open a Lily patch from a web URL.

		Arguments: 
			url - The url string ending in ".json".										
	*/	
	openPatchFromNet: function(url) {
		
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);		
//		var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
		
		//show warning or not based on user set pref.
		var hideWarning = LilyUtils.getBoolPref("extensions.lily.showOpenPatchWarning");		//prefs.getBoolPref("extensions.lily.showOpenPatchWarning")||false; // get a pref
		var check = {value: false};                   // default the checkbox to false	
		
		var name = LilyUtils.stripExtension(url.substring((url.lastIndexOf("/")+1))); //extract the file name from the url
		
		//xhr callback
		function outputResponse(data) {		
			if(data) {
				this.openPatch(data,name,false);
			}
		}		
		
		//only open if the user confirms
		if(hideWarning||prompts.confirmCheck(null, "", "It appears that you're opening a Lily program located at "+url+". Malicious Lily programs can damage your privacy and data. You should only open Lily programs from sources you trust.", "Don't warn again", check)) {
			var xhr=new LilyUtils._xhr(outputResponse,"text",this);
			xhr.loadXMLDoc(url); 			
		}
		
		//if the check is true, save it here so the user doesn't see the nag
		if(check.value)
			LilyUtils.setBoolPref("extensions.lily.showOpenPatchWarning",check.value);		//prefs.setBoolPref("extensions.lily.showOpenPatchWarning", check.value); // set a pref		
					
	},
	
	/*
		Method: openPatchInSidebar
			Open a Lily patch in a sidebar.

		Arguments: 
			path - path to patch.										
	*/	
	openPatchInSidebar: function(path) {
		
		if(!this.initialized)
			this.init();		
		
		var fp = path||null;
		var self = this;
		var patchID="patchSidebar";		
		
		var fileObj = LilyUtils.readFileFromPath(fp,true); //open a picker and get the file if we need to.
		var file=fileObj.file;
		var data=fileObj.data;
		
		var sizeArr=LilyUtils.extractPatchSize(data); //get the patch size w/o having to eval the json.
		
		document.getElementById("lilyContentSplitter").setAttribute("collapsed",false);
		document.getElementById("lilyContentBox").setAttribute("collapsed",false);		
		
		this.patchObj[patchID]={obj:new LilyPatch(patchID,this,sizeArr[0],sizeArr[1],true,{type:"sidebar",win:document.getElementById("lilyHorizontalSideBar"),parent:window}),id:"patchSidebar",file:file,json:data}; //object, id, file
		var parentDir=(file.parent.isDirectory())?file.parent:null; //patch's parent dir.

		this.patchObj[patchID].obj.callback=function(){				
			self.patchObj[patchID].obj.openPatch(data,null,null,LilyUtils.stripExtension(file.leafName),parentDir); //create the patch in the new window.
			self.patchObj[patchID].json=self.patchObj[patchID].obj.patchModel.serializeDom(); //save a copy of the patch string
			self.patchObj[patchID].obj.patchController.setEditable("performance"); //go to perf mode.				
		}
		this.makePatchCurrent(patchID);	
		this.patchObj[patchID].obj.patchWindowType="sidebar";	
	},

	/*
		Method: closeSideBarPatch
			Close a Lily sidebar.

		Arguments: 
			path - path to patch.										
	*/
	closeSideBarPatch: function() {
		
		var patchID="patchSidebar";			
		this.patchObj[patchID].obj.close(); //clean up the patch & close the window.
		this.closePatch("patchSidebar"); //cleanup at the app level.	
		document.getElementById("lilyHorizontalSideBar").reload(true);
		document.getElementById("lilyContentSplitter").setAttribute("collapsed",true);
		document.getElementById("lilyContentBox").setAttribute("collapsed",true);
			
	},	
	
	/*
		Method: openSelectedHelp
			open a help patch of selected objects.								
	*/
	openSelectedHelp: function() {
		var name = this.patchObj[this.currPatch].obj.patchController.getSelectedObjectsProperty("className");
		if(name) this.openHelpPatch(name);
	},	
	
	/*
		Method: openHelpPatch
			open a help patch.
			
		Arguments: 
			name - object classname.								
	*/
	openHelpPatch: function(name) {
			
		var self = this;		
		
		var file = Components.classes["@mozilla.org/file/local;1"]
		                     .createInstance(Components.interfaces.nsILocalFile);
		
		var helpFile = this.helpDir.clone();
		helpFile.append(name +"-help.json");
		this.helpFilePath=helpFile.path;		
		file.initWithPath(this.helpFilePath);
		
		if(!file.exists()) { //if its not in the help directory, look else where...
			
			//search the search-path
			var searchDir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);			
			searchDir.initWithPath(this.searchPath);
			
			LilyUtils.directorySearch(searchDir,function(entry){
				if(entry.leafName==(name +"-help.json")) {
					self.helpFilePath=entry.path;
				}
			})
			
			file.initWithPath(this.helpFilePath);
			
			if(!file.exists()) { //not in the search path...
							
				//search the patch directory
				var patchDir = this.patchObj[this.currPatch].obj.getPatchDir();

				LilyUtils.directorySearch(patchDir,function(entry){
					if(entry.leafName==(name +"-help.json")) {
						self.helpFilePath=entry.path;
					}
				})

				file.initWithPath(this.helpFilePath);
				
				if(!file.exists()) { //can't find it, give up...
					LilyDebugWindow.error("error- help patch for "+ name +" not found")
					return;	
				}
				
			}
		}
				
		var data=LilyUtils.readFile(file);
		
		var sizeArr=LilyUtils.extractPatchSize(data);
		var patchID=this.newPatch(sizeArr[0],sizeArr[1],false,false);
		
//		LilyDebugWindow.print(data);
							
		this.patchObj[patchID].obj.callback=function(){
				self.makePatchCurrent(patchID); //make this current as we execute the callback
				self.patchObj[patchID].obj.openPatch(data,null,null,LilyUtils.stripExtension(file.leafName)); //open the patch
				self.patchObj[patchID].obj.patchController.setEditable("performance"); //toggle to performance mode
				self.patchObj[patchID].json=self.patchObj[patchID].obj.patchModel.serializeDom(); //save a copy of the patch string									
		}
		
		this.patchObj[patchID].file=file; //save a ref to the file
				
	},
		
	/*
		Method: savePatch
			save a patch to disk.
			
		Arguments: 
			pID - patch ID.								
	*/	
	savePatch: function(pID) {
		var id=pID||this.currPatch;		
		LilyDebugWindow.print(this.patchObj[id].obj.patchModel.serializeDom()); //debug
		if(!this.patchObj[id].file) {//if we dont have a file yet 
			this.writeNewPatch(id);
		} else {
			this.writePatch(id); //patch has been saved at least once
		}
	},
	
	/*
		Method: saveAsPatch
			save a patch to disk with a different name.
			
		Arguments: 
			pID - patch ID.								
	*/
	saveAsPatch: function(pID) {
		var id=pID||this.currPatch;		
		this.writeNewPatch(id);
	},
	
	/*
		Method: savePatchAndClose
			save a patch to disk before closing.								
	*/	
	savePatchAndClose: function(pID) {	
		this.savePatch(pID);
		this.close();
	},	
	
	/*
		Method: savePatchAsAddOn
			save a patch as an XPI.								
	*/
	savePatchAsAddOn: function(pID) {

		var patchID=pID||this.currPatch;
		var exportParams = {id:patchID,type:"addon",platform:LilyUtils.navigatorPlatform()};	

		//show a dialog to get the export details
    	Lily.getCurrentPatch().patchView.xulWin.openDialog("chrome://lily/content/exportDialog.xul", "lilyExportDialog", "chrome,titlebar,toolbar,centerscreen,modal",exportParams);		

		Lily.getCurrentPatch().patchView.showWindowStatusActivity(true);
		Lily.getCurrentPatch().patchView.setWindowStatusText("Saving as addon...")

		if(exportParams.saved) {
			LilyUtils.runInBackGround(function(){
				LilyPatchExporter.savePatchAsAddOn(exportParams);	
			},function(){
				Lily.getCurrentPatch().patchView.showWindowStatusActivity(false);
				Lily.getCurrentPatch().patchView.clearWindowStatusText();				
			})
		}
		
	},
	
	/*
		Method: savePatchAsApp
			save a patch as a xulrunner application.								
	*/
	savePatchAsApp: function(pID) {
		
		var patchID=pID||this.currPatch;		
		
		var exportParams = {id:patchID,type:"app",platform:LilyUtils.navigatorPlatform()};			

		//show a dialog to get the export details
    	Lily.getCurrentPatch().patchView.xulWin.openDialog("chrome://lily/content/exportDialog.xul", "lilyExportDialog", "chrome,titlebar,toolbar,centerscreen,modal",exportParams);			
		
		Lily.getCurrentPatch().patchView.showWindowStatusActivity(true);
		Lily.getCurrentPatch().patchView.setWindowStatusText("Saving as app...")

		if(exportParams.saved) {
			LilyUtils.runInBackGround(function(){
				LilyPatchExporter.savePatchAsApp(exportParams);	
			},function(){
				Lily.getCurrentPatch().patchView.showWindowStatusActivity(false);
				Lily.getCurrentPatch().patchView.clearWindowStatusText();				
			})
		}		
		
	},	

	/*
		Method: writePatch
			write a patch to disk, called by savePatch.
			
		Arguments: 
			pID - patch ID.											
	*/	
	writePatch: function(pID,fileHandle) {
					
		var file=fileHandle||this.patchObj[pID].file;
		
		if(file) {
			var data=this.patchObj[pID].obj.patchModel.serializeDom();
			this.patchObj[pID].json=data; //update the patch string.			
			file=LilyUtils.writeFile(file,data);			
		} else {
			LilyDebugWindow.error("COULD NOT FIND THE FILE- DO SOME ERROR STUFF HERE")
		}
		
	},

	/*
		Method: writeNewPatch
			write a patch to disk for the first time, prompts user to name file. Called by savePatch.
			
		Arguments: 
			pID - patch ID.
			
		Returns: 
			The patch file name is successeful otherwise returns null.											
	*/
	writeNewPatch: function(pID) {
		
		const nsIFilePicker = Components.interfaces.nsIFilePicker;

		var fp = Components.classes["@mozilla.org/filepicker;1"]
		                   .createInstance(nsIFilePicker);
		
		fp.init(window, "Choose a location to save in", nsIFilePicker.modeSave);
		fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
		fp.defaultString="Untitled.json";

		var rv = fp.show();
		if(LilyUtils.navigatorPlatform()!="apple") window.blur();		
		if (rv == nsIFilePicker.returnOK||rv == nsIFilePicker.returnReplace) {
			var file = fp.file;

			//update the patch name before we serialize
			//yes, this is a mess
			if(this.patchObj[pID].obj.title == "Untitled") {
				this.patchObj[pID].obj.title=LilyUtils.stripExtension(file.leafName);
				this.patchObj[pID].obj.patchView.setPatchTitle(LilyUtils.stripExtension(file.leafName));				
			}
			
			//now we've updated the patch title, so serialize
			var data=this.patchObj[pID].obj.patchModel.serializeDom();

			file = LilyUtils.writeFile(file,data);

			this.patchObj[pID].file=file;
			this.patchObj[pID].json=data; //save a copy of patch data		
			
			return file.leafName
		}
		return null;			
	},
	
	/*
		Method: closePatch
			cleanup reference to the patch at the application level.
			
		Arguments: 
			pID - patch ID.											
	*/
	closePatch: function(pID) {
		var id=pID||this.currPatch;
		this.patchObj[id].file=null;
		this.patchObj[id]=null;
		delete this.patchObj[id];
		LilyDebugWindow.print("cleaning up...")
	},
	
	/*
		Method: closeAllPatches
			close all patches.											
	*/
	closeAllPatches: function() {
		for(var x in this.patchObj) {
			if(typeof this.close=="function" && this.close(x))
				;
			else
				return false;
		}
		return true;
	},
		
	/*
		Method: close
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/
	close: function(pID) {
		
		var id=pID||this.currPatch;
				
		//the second condition tests to see if we're in the middle of tearing down the patch
		if(typeof this.patchObj[id] != "undefined" && this.patchObj[id].obj.patchID) {
			
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			                        .getService(Components.interfaces.nsIPromptService);

			var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_SAVE +
			            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL  + 
			            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_DONT_SAVE;	

			if(this.patchObj[id].obj.getPatchData()!=this.patchObj[id].obj.patchModel.serializeDom() && !this.patchObj[id].obj.readonly) {

				var button=prompts.confirmEx(this.patchObj[id].obj.patchView.xulWin, "", "Save changes to patch?", flags, "", "", "", null, {value: false});

				if(button==0) { //save
					this.savePatch(id);
					this.patchObj[id].obj.close(); //clean up the patch & close the window.
					this.closePatch(id); //cleanup at the app level.
				} else if(button==1) { //cancel
					return false;
				} else if(button==2) { //dont save
					this.patchObj[id].obj.close(); //clean up the patch & close the window.
					this.closePatch(id); //cleanup at the app level.
				}
				
			} else {
				this.patchObj[id].obj.close(); //clean up the patch & close the window.
				this.closePatch(id); //cleanup at the app level.	
			}						
		}
		return true;				
	},
		
	/*
		Method: zoomIn
			dispatch zoom window command.
			
		Arguments: 
			pID - patch ID.											
	*/
	zoomIn: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id]) {
			this.patchObj[id].obj.incZoom();
		}
	},
	
	/*
		Method: zoomOut
			dispatch zoom window command.
			
		Arguments: 
			pID - patch ID.											
	*/
	zoomOut: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id]) {
			this.patchObj[id].obj.decZoom();
		}
	},
	
	/*
		Method: zoomReset
			dispatch zoom window command.
			
		Arguments: 
			pID - patch ID.											
	*/
	zoomReset: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id]) {
			this.patchObj[id].obj.resetZoom();
		}
	},			
	
	/*
		Method: dumpListeners
			dispatch menu command. For debug.
			
		Arguments: 
			pID - patch ID.											
	*/
	dumpListeners: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id])
			this.patchObj[id].obj.dumpListeners();
	},
	
	/*
		Method: newObject
			dispatch menu command.
			
		Arguments: 
			className - classname of the object to create 
			pID - id of the patch to create it in.											
	*/
	newObject: function(className,pID,context) {
		var id=pID||this.currPatch;
		var contextMenu=context||false;
		if(this.patchObj[id]&&this.patchObj[id].obj.patchController.getEditable()=="edit") {
			var tmp=(context)?this.patchObj[id].obj.patchController.getLastMouseDown():[50,50];
			this.patchObj[id].obj.createObject(className,false,tmp[1],tmp[0],null,null);			
		}
	},
	
	/*
		Method: copy
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/	
	copy: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id]&&this.patchObj[id].obj.patchController.getEditable()=="edit")
			this.patchObj[id].obj.copy();
	},

	/*
		Method: paste
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/
	paste: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id]&&this.patchObj[id].obj.patchController.getEditable()=="edit")		
			this.patchObj[id].obj.paste();	
	},
	
	/*
		Method: cut
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/	
	cut: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id]&&this.patchObj[id].obj.patchController.getEditable()=="edit")		
			this.patchObj[id].obj.cut();
	},

	/*
		Method: clear
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/
	clear: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id]&&this.patchObj[id].obj.patchController.getEditable()=="edit")		
			this.patchObj[id].obj.clear();
	},

	/*
		Method: selectAll
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/
	selectAll: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id]&&this.patchObj[id].obj.patchController.getEditable()=="edit")		
			this.patchObj[id].obj.patchController.selectAll();
	},

	/*
		Method: openPatchProperties
			dispatch menu command.
	*/
	openPatchProperties: function() {
		var p = this.patchObj[this.currPatch].obj;
		var win = p.patchView.xulWin;
		
		var initVals = { 
			title:  p.title||"Untitled",
			category:  p.category||"",			
			height: p.heightInSubPatch||"0", 
			width:  p.widthInSubPatch||"0",
			desc:   LilyUtils.unescape(p.description)||""	
		};
		
		var tmp = LilyUtils.getOpenDialogCoords(450,450);		
		
		win.openDialog("chrome://lily/content/patch-properties.xul", "cWin","width=450,height=450,left="+tmp[0]+",top="+tmp[1]+",close=no,scrollbars=no,dialog=yes,resizable=no,toolbar=no,menubar=no,location=no,status=no,chrome=yes,alwaysRaised=yes",function(val){
			for(var x in val) {
				switch(x) {
					case "title":
						p.patchView.setPatchTitle(val[x]);
					case "category":
						p.category=LilyUtils.escape(val[x]);
					case "height":
						p.heightInSubPatch=val[x];
					case "width":
						p.widthInSubPatch=val[x];
					case "desc":
						p.description=LilyUtils.escape(val[x]);
				}				
			}
		},initVals);
			
	},

	/*
		Method: openColorPicker
			dispatch menu command.
			
		Arguments: 
			type - color type
	*/
	openColorPicker: function(type) {
		
		var win = this.patchObj[this.currPatch].obj.patchView.xulWin;
		var height = 400;
		
		if(type=="patch") {
			var color = this.patchObj[this.currPatch].obj.color;
			height = 350;
		} else if(type=="font") {
			var color = this.patchObj[this.currPatch].obj.patchController.getSelectedObjectsProperty("fontColor");
			height = 350;
		} else {
			var color = this.patchObj[this.currPatch].obj.patchController.getSelectedObjectsProperty("color");
		}
		
		var tmp = LilyUtils.getOpenDialogCoords(250,height);
		
		var initVals = { color: color, type: type };
		
		win.openDialog("chrome://lily/content/color.xul", "cWin","width=250,height="+height+",left="+tmp[0]+",top="+tmp[1]+",close=no,scrollbars=no,dialog=yes,resizable=no,toolbar=no,menubar=no,location=no,status=no,chrome=yes,alwaysRaised=yes",function (val) {
			if(type=="patch")
				Lily.setPatchColor(val);
			else if(type=="font") {
				Lily.setFont("fontColor",val,null);
			} else {
				Lily.setColor(val,null,true);	
			}	
		},initVals);

	},

	/*
		Method: toggleEdit
			dispatch menu command.
			
		Arguments: 
			menuitem - menuitem
			pID - patch ID.											
	*/
	toggleEdit: function(pID) {
		
//		LilyDebugWindow.print("up in the toggle edit ");
		
		var id=pID||this.currPatch;
		if(this.patchObj[id]) {

			if(this.patchObj[id].obj.patchController.getEditable()=="performance") {
				this.patchObj[id].obj.patchController.setEditable("edit");
				this.patchObj[id].obj.patchView.setWindowStatusIcon("unlocked");
				this.patchObj[id].obj.patchView.setTempWindowStatus("Patch Unlocked.",1000);
				this.patchObj[id].obj.patchView.setWindowStatusTooltip("Patch is unlocked for editing. Click to lock.");								
			} else {
				this.patchObj[id].obj.patchController.setEditable("performance");
				this.patchObj[id].obj.patchView.setWindowStatusIcon("locked");
				this.patchObj[id].obj.patchView.setTempWindowStatus("Patch Locked.",1000);
				this.patchObj[id].obj.patchView.setWindowStatusTooltip("Patch is locked for performance. Click to unlock.");											
			}
		}					
	},

	/*
		Method: hideInPerf
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/
	hideInPerf: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id])		
			this.patchObj[id].obj.hideInPerf();
	},

	/*
		Method: showInPerf
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/
	showInPerf: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id])		
			this.patchObj[id].obj.showInPerf();
	},
	
	/*
		Method: getInfo
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/	
	getInfo: function(pID) {
		var id=pID||this.currPatch;
		if(this.patchObj[id])		
			this.patchObj[id].obj.getInfo();
	},
	
	/*
		Method: setColor
			dispatch menu command.
			
		Arguments: 
			color - color to set
			pID - patch ID.	
			perm - bool- save color with patch.										
	*/	
	setColor: function(color,pID,perm) {
		var id=pID||this.currPatch;		
		if(this.patchObj[id]) {
			this.patchObj[id].obj.patchController.setSelectedColor([color,perm]); //color	
			this.patchObj[id].obj.patchController.setColor(); //color	
		}	
	},	
	
	/*
		Method: setPatchColor
			dispatch menu command.
			
		Arguments: 
			color - color to set
			pID - patch ID.											
	*/	
	setPatchColor: function(color,pID) {
		var id=pID||this.currPatch;		
		if(this.patchObj[id]) {
			this.patchObj[id].obj.patchView.setPatchColor(color); //color	
		}	
	},	
	
	/*
		Method: bringForward
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/	
	bringForward: function(pID) {
		var id=pID||this.currPatch;		
		if(this.patchObj[id]) {
			this.patchObj[id].obj.patchController.bringForward(); //zindex	
		}	
	},

	/*
		Method: sendBack
			dispatch menu command.
			
		Arguments: 
			pID - patch ID.											
	*/
	sendBack: function(pID) {
		var id=pID||this.currPatch;		
		if(this.patchObj[id]) {			
			this.patchObj[id].obj.patchController.sendBack(); //zindex	
		}	
	},		

	/*
		Method: setFont
			dispatch menu command.
			
		Arguments: 
			name - font name, 
			value - font size, 
			pID - patch ID.											
	*/
	setFont: function(name, value, pID) {
		var id=pID||this.currPatch;		
		if(this.patchObj[id]) {
			this.patchObj[id].obj.patchController.setSelectedFont(name,value); //store the updated value in the current patch	
			this.patchObj[id].obj.patchController.setFont(); //notify patch listeners that the font has changed.
		}
	},
	
	/*
		Method: setSharedValue
			set shared value.
			
		Arguments: 
			name - key
			val - value.											
	*/
	setSharedValue: function(name,val) {
		this.sharedValue[name]=val;
	},
	
	/*
		Method: getSharedValue
			get shared value.
			
		Arguments: 
			name - key.
			
		Returns: 
			value.												
	*/
	getSharedValue: function(name) {	
		return this.sharedValue[name];
	},	
		
	/*
		Method: openExtFile
			opens an external's javascript file in the default application (hopefully a text editor).
			
		Arguments: 
			name - classname of the external.														
	*/
	openExtFile: function(name) {
		
		var filepath=LilyObjectList.getPath(name);
		
		if(filepath) {
				
			//init
			var file = Components.classes["@mozilla.org/file/local;1"]
			                     .createInstance(Components.interfaces.nsILocalFile);

			try {	
				file.initWithPath(LilyUtils.stripLTQuotes(filepath));	//try it as an absolute path	
			} catch(e){
				LilyDebugWindow.error("error- file not found"); //not found
				return;
			}		
			
			file.launch(); //equivalent to doubleclicking file. hopefully this opens a text editor.
			
		}
		
	},

	/*
		Method: openPrefs
			opens the preferences dialog.																	
	*/
	openPrefs: function() {		
    	Lily.getCurrentPatch().patchView.xulWin.openDialog("chrome://lily/content/prefs.xul", "lilyPrefsDialog", "chrome,titlebar,toolbar,centerscreen,modal",LilyAPIKeyManager,LilyDebugWindow);
	},

	/*
		Method: openHelpMessage
			opens the help message.																	
	*/
	openHelpMessage: function() {		
    	Lily.getCurrentPatch().patchView.displayHelpDialog();		
	},

	/*
		Method: toggleDebug
			toggles the debug flag.																	
	*/
	toggleDebug: function(item) {
		Lily.debug=(item.getAttribute("checked")=="true")?true:false;
	},

	/*
		Method: toggleTrace
			toggles the trace flag.																		
	*/
	toggleTrace: function(item) {
		Lily.trace=(item.getAttribute("checked")=="true")?true:false;
	},
	
	/*
		Method: reload
		reload selected externals															
	*/
	reload: function() {
		
		//get the classnames of all selected objects
		var names = this.patchObj[this.currPatch].obj.patchController.getSelectedObjectsPropertyArray("className");
		for(var i=0;i<names.length;i++) {
			LilyObjectList.load(LilyObjectList.getPath(names[i])); //reload the extern js
		} 
		
		//replace all instances
		var ids = this.patchObj[this.currPatch].obj.patchController.getSelectedObjectsPropertyArray("id");
		for(var i=0;i<ids.length;i++) {
			var obj = this.patchObj[this.currPatch].obj.getObj(ids[i]);
			this.patchObj[this.currPatch].obj.replaceObject(obj,LilyUtils.getObjectMetaData(obj.name).textName,obj.args); //reload the extern js
		}
	},		

	/*
		Method: openFirstTimeMessage
			opens the first time message.																	
	*/
	openFirstTimeMessage: function() {
		if(!Lily.firstTimeHelpDisplayed) {
	    	Lily.getCurrentPatch().patchView.displayFirstTimeScreen();	
			Lily.firstTimeHelpDisplayed=true; //set the flag	
		}		
	},
	
	/*
		Method: revealPatchDir
			opens the directory containing the patch.
			
		Arguments: 
			pID - patch ID.														
	*/	
	revealPatchDir: function(pID) {
		var id=pID||this.currPatch;	
		var patchDir=this.patchObj[id].obj.getPatchDir();	
		if(this.patchObj[id]&&patchDir) {						
			LilyUtils.openDir(patchDir.path); //directory to patch	
		} else if(patchDir==null) {
			LilyDebugWindow.error("patch not saved");
		}
	}
}