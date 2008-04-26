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

var LilyPatchExporter = {
	
	/*
		Method: validateProjectName
			validate project name								
	*/
	validateProjectName: function(name) {
		if((name.length<3||name.match(/\s|\W/))&&LilyUtils.navigatorPlatform()!="apple") {
			return false;
		} else {
			return true;
		}
	},
	
	/*
		Method: makeSuggestedFileName
			returns a suggested project file name								
	*/
	makeSuggestedFileName: function(name) {
		if(LilyUtils.navigatorPlatform()!="apple")
			return this.conformFileName(name);
		else
			return name;
	},
	
	conformFileName: function(name) {
		return name.replace(/\s|\W/g,"").toLowerCase(); //strip spaces and non-word chars, to lower case
	},	

	/*
		Method: genBuildID
			return a date based id.								
	*/
	genBuildID: function() {
		return Date.now(); 
	},

	/*
		Method: savePatchAsApp
			save a patch as a xulrunner application.								
	*/
	savePatchAsApp: function(obj) {

		var id=obj.id||Lily.currPatch;
		
		var platform = LilyUtils.navigatorPlatform();

		//we'll replace this later...
		var projectName="";

		const nsIFilePicker = Components.interfaces.nsIFilePicker;

		var fp = Components.classes["@mozilla.org/filepicker;1"]
		                   .createInstance(nsIFilePicker);

		fp.init(window, "Choose a location to save in", nsIFilePicker.modeSave);
		fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
		fp.defaultString = this.makeSuggestedFileName(obj.name)||"";

		var rv = fp.show();
		if(LilyUtils.navigatorPlatform()!="apple") window.blur();	
				
		if (rv == nsIFilePicker.returnOK) {

			//project name
			projectName = this.conformFileName(fp.file.leafName);
			obj["patchFileName"]=fp.file.leafName; //store this for later.
			
			//validate name
			if(!this.validateProjectName(projectName)) {
				LilyDebugWindow.error("Invalid project file name: names can't contain spaces or non-alphanumeric characters and must be at least 3 characters long.");
				return;
			}
			
			//par dir	
			var parentDir = fp.file.parent.clone();
			
			if(platform=="apple") {
				
				//copy the folder over
				var tmp = Lily.installDir.clone();
				tmp.append("PROJECTNAME");
				tmp.copyTo(parentDir,(fp.file.leafName+".app"));

				//set up some pointers to the directory structure
				//the root app level
				var parentDir = fp.file.parent.clone();
				parentDir.append(fp.file.leafName+".app");

				//Contents folder
				var contentsDir = parentDir.clone();
				contentsDir.append("Contents");

				//Resources folder
				var resourceDir = contentsDir.clone();
				resourceDir.append("Resources");
				var rootDir = resourceDir.clone();
					
			} else if(platform=="windows"||platform=="linux") {
				
				var rootDir = fp.file.parent.clone();
				rootDir.append(projectName);				

				if( !rootDir.exists() || !rootDir.isDirectory() ) {   // if it doesn't exist, create
					rootDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
				}

			}
			
			//start copying
			if(rootDir.exists()) { //root directory exists...
				
				//copy the cross platform stuff.
				this.copyFilesForApp(rootDir,projectName,id,obj);	
				
				//vars for application.ini replace
				var nameValue = obj.name||projectName;
				var versionValue = obj.version||"0.1";
				var creatorValue = obj.creator||"Lily";
				var emailValue = obj.emailAddress||(projectName+".id@"+projectName+".com");	
				var xulrunnerValue = obj.xulRunnerLocation||"";							
				
				if(platform=="apple") {
					
					//copy the framework
					var tmpOut = contentsDir.clone();
					tmpOut.append("Frameworks");
					var xulrunnerFile = LilyUtils.getFileHandle(xulrunnerValue);
					
					if(!xulrunnerFile || !xulrunnerFile.exists()) { //if null or n'exist pas
						LilyDebugWindow.error("XULRunner not found");
						var parentDir = fp.file.parent.clone();
						parentDir.append(fp.file.leafName+".app");
						parentDir.remove();	//delete the file				
						return;
					}
					
					xulrunnerFile.copyToFollowingLinks(tmpOut,null);
					
					//copy the stub executable
					tmpOut.append("XUL.framework");
					tmpOut.append("Versions");
					tmpOut.append("Current");
					tmpOut.append("xulrunner");
					var macOSDir = contentsDir.clone();
					macOSDir.append("MacOS");
					tmpOut.copyTo(macOSDir,null);
					
					//Info.plist
					var tmpOut = contentsDir.clone();
					tmpOut.append("Info.plist");
					var data = LilyUtils.readFile(tmpOut).replace(/PROJECTNAME/g,nameValue).replace(/PROJECTVERSION/g,versionValue);
					LilyUtils.writeFile(tmpOut,data);
					
					//application.ini
					var tmpOut = rootDir.clone();
					tmpOut.append("application.ini");
					var data = LilyUtils.readFile(tmpOut).replace(/<PROJECT-NAME>/g,nameValue);
					data = data.replace(/<BUILD-ID>/g,this.genBuildID());
					data = data.replace(/<APP-ID>/g,emailValue).replace(/<PROJECT-CREATOR>/g,creatorValue).replace(/<VERSION-NUMBER>/g,versionValue);
					LilyUtils.writeFile(tmpOut,data);					
						
				} else if(platform=="windows"||platform=="linux") {
										
					//copy the framework
					var xulrunnerFile = LilyUtils.getFileHandle(xulrunnerValue);
					
					if(!xulrunnerFile || !xulrunnerFile.exists()) { //if null or n'exist pas, clean up & bail
						LilyDebugWindow.error("XULRunner not found");
						var parentDir = fp.file.parent.clone();
						parentDir.append(fp.file.leafName);
						parentDir.remove();	//delete the file				
						return;
					}
					
					xulrunnerFile.copyToFollowingLinks(rootDir,null); 
					
					if(platform=="windows") {
						//copy the stub executable
						var tmpOut = rootDir.clone();
						tmpOut.append("xulrunner");
						tmpOut.append("xulrunner-stub.exe");						
						tmpOut.copyTo(rootDir,fp.file.leafName+".exe");	
					} else if(platform=="linux") {
						//copy the stub executable
						var tmpOut = rootDir.clone();
						tmpOut.append("xulrunner");
						tmpOut.append("xulrunner-stub");						
						tmpOut.copyTo(rootDir,fp.file.leafName);	
					}
					
					//read application.ini
					var tmpIn = Lily.installDir.clone();
					tmpIn.append("PROJECTNAME");
					tmpIn.append("Contents");
					tmpIn.append("Resources");
					tmpIn.append("application.ini");
					
					//search & replace
					var data = LilyUtils.readFile(tmpIn).replace(/<PROJECT-NAME>/g,(nameValue));
					data = data.replace(/<BUILD-ID>/g,this.genBuildID());
					data = data.replace(/<APP-ID>/g,emailValue).replace(/<PROJECT-CREATOR>/g,creatorValue).replace(/<VERSION-NUMBER>/g,versionValue);
					
					//write
					var tmpOut = rootDir.clone();
					tmpOut.append("application.ini");
					LilyUtils.writeFile(tmpOut,data);				
					
				}
				
			}

		}

	},
	
	copyFilesForApp: function(rootDir,projectName,id,obj) {
		
		var dependencies = Lily.patchObj[id].obj.getPatchDependencies();
		var objArr = dependencies["classes"];									

		//locale
		var tmp = Lily.installDir.clone();
		tmp.append("locale");
		tmp.copyTo(rootDir,null);

		//components if we need 'em
		if(objArr.toSource().indexOf("oscreceive")!=-1||objArr.toSource().indexOf("oscsend")!=-1) {
			var tmp = Lily.installDir.clone();
			tmp.append("components");
			tmp.copyTo(rootDir,null);
		}
		
		//prefs
		var tmp = Lily.installDir.clone();
		tmp.append("platform");
		tmp.copyTo(rootDir,null);
		
		var osArr = ["Darwin","Linux","linux-gnu","WINNT"];
		
		for(var i=0;i<osArr.length;i++) {
			//prefs.js
			var tmpOut = rootDir.clone();
			tmpOut.append("platform");
			tmpOut.append(osArr[i]);
			tmpOut.append("defaults");
			tmpOut.append("preferences");
			tmpOut.append("lily.js");

			var newPrefs = '\n' +
			'pref("toolkit.defaultChromeURI", "chrome://'+projectName+'/content/'+projectName+'.xul");\n' +
			'pref("browser. hiddenWindowChromeURL", "chrome://'+projectName+'/content/'+projectName+'.xul");\n' +					
			'pref("browser.dom.window.dump.enabled", true);\n' +
			'pref("javascript.options.showInConsole", true);\n' +
			'pref("javascript.options.strict", true);\n' +
			'pref("nglayout.debug.disable_xul_cache", true);\n' +
			'pref("nglayout.debug.disable_xul_fastload", true);\n';

			var data = LilyUtils.readFile(tmpOut);
			data += newPrefs;
			LilyUtils.writeFile(tmpOut,data);	
		}

		//content
		/* START CONTENT COPYING */
		//we'll use these variables throughout below...
		var contentIn = Lily.installDir.clone();
		contentIn.append("content");
		var contentOut = rootDir.clone();
		contentOut.append("content");

		if( !contentOut.exists() || !contentOut.isDirectory() ) {   // if it doesn't exist, create
			contentOut.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
		}				

		//apikey
		var tmp = contentIn.clone();
		tmp.append("apikey.xul");
		tmp.copyTo(contentOut,null);

		//blank.html
		var tmp = contentIn.clone();
		tmp.append("blank.html");
		tmp.copyTo(contentOut,null);

		//config.txt- create a config file with an appropriate ext/app id & store the debug win pref
		var config = {};
		config["extID"] = (projectName+".id@"+projectName+".com");
		config["openDebugWin"] = (!obj.hideDebugCbx);
		var tmpOut = contentOut.clone();
		tmpOut.append("config.txt");				
		LilyUtils.writeFile(tmpOut,config.toSource());	

		//connection.js
		var tmp = contentIn.clone();
		tmp.append("connection.js");
		tmp.copyTo(contentOut,null);															

		//debug.js
		var tmpIn = contentIn.clone();
		tmpIn.append("debug.js");
		var tmpOut = contentOut.clone();
		tmpOut.append("debug.js");				
		LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));

		//debug.html
		var tmp = contentIn.clone();
		tmp.append("debug.html");
		tmp.copyTo(contentOut,null);

		//debug.xul
		var tmpIn = contentIn.clone();
		tmpIn.append("debug.xul");
		var tmpOut = contentOut.clone();
		tmpOut.append("debug.xul");			
		LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));

		//externals
		var externalIn = contentIn.clone();
		externalIn.append("externals");
		var externalOut = contentOut.clone();
		externalOut.append("externals");

		if( !externalOut.exists() || !externalOut.isDirectory() ) {   // if it doesn't exist, create
			externalOut.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
		}

		//iterate and copy...
		for(var i=0;i<objArr.length;i++) {

			var data = objArr[i].source.replace(/chrome:\/\/lily/g,("chrome://"+projectName));

			var tmpOut = externalOut.clone();
			tmpOut.append(objArr[i].name+".js");
			LilyUtils.writeFile(tmpOut,data);

		}

		//images
		var tmp = contentIn.clone();
		tmp.append("images");
		tmp.copyTo(contentOut,null);

		//inspector.js
		var tmpIn = contentIn.clone();
		tmpIn.append("inspector.js");
		var tmpOut = contentOut.clone();
		tmpOut.append("inspector.js");				
		LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));

		//keys.txt
		var tmp = contentIn.clone();
		tmp.append("keys.txt");
		tmp.copyTo(contentOut,null);

		//lib
		var tmp = contentIn.clone();
		tmp.append("lib");
		tmp.copyTo(contentOut,null);

		//lib.js
		var tmp = contentIn.clone();
		tmp.append("lib.js");
		tmp.copyTo(contentOut,null);

		//lily.js
		var tmpIn = contentIn.clone();
		tmpIn.append("lily.js");
		var tmpOut = contentOut.clone();
		tmpOut.append("lily.js");
		var data = LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName));
		data = data.replace(/nameSpace: "lily",/,"nameSpace: \""+projectName+"\",");			
		LilyUtils.writeFile(tmpOut,data);				

		//<projectname>.xul
		var tmpIn = contentIn.clone();
		tmpIn.append("export-window.xul");
		var tmpOut = contentOut.clone();
		tmpOut.append(projectName+".xul");		
		LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/<PROJECT-NAME>/g,projectName).replace(/<PATCH-FILE-NAME>/g,obj.patchFileName).replace(/<PATCH-HIDDEN>/g,obj.hideMainCbx)); 

		//lily.css
		var tmp = contentIn.clone();
		tmp.append("lily.css");
		tmp.copyTo(contentOut,null);

		//menus.js
		var tmp = contentIn.clone();
		tmp.append("menus.js");
		tmp.copyTo(contentOut,null);

		//model.js
		var tmp = contentIn.clone();
		tmp.append("model.js");
		tmp.copyTo(contentOut,null);

		//object.js
		var tmp = contentIn.clone();
		tmp.append("object.js");
		tmp.copyTo(contentOut,null);

		//patch.js
		var tmpIn = contentIn.clone();
		tmpIn.append("patch.js");
		var tmpOut = contentOut.clone();
		tmpOut.append("patch.js");				
		LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));

		//patch.xhtml
		var tmp = contentIn.clone();
		tmp.append("patch.xhtml");
		tmp.copyTo(contentOut,null);

		//prefs.js
		var tmpIn = contentIn.clone();
		tmpIn.append("prefs.js");
		var tmpOut = contentOut.clone();
		tmpOut.append("prefs.js");				
		LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));

		//prefs.xul
		var tmpIn = contentIn.clone();
		tmpIn.append("prefs.xul");
		var tmpOut = contentOut.clone();
		tmpOut.append("prefs.xul");				
		LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));

		//readonlypatch.xul
		/*
		var tmpIn = contentIn.clone();
		tmpIn.append("applicationpatch.xul");
		var tmpOut = contentOut.clone();
		tmpOut.append("readonlypatch.xul");				
		LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
		*/
		
		//readonlypatch.xul
		if(!obj.hideMainCbx) {
			var tmpIn = contentIn.clone();
			tmpIn.append("applicationpatch.xul");
			var tmpOut = contentOut.clone();
			tmpOut.append("readonlypatch.xul");				
			LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
		} else {
			var tmpIn = contentIn.clone();
			tmpIn.append("hiddenpatch.xul");
			var tmpOut = contentOut.clone();
			tmpOut.append("hiddenpatch.xul");				
			LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));					
		}		

		//copy the resources dir
		var tmp = contentIn.clone();
		tmp.append("resources");
		tmp.copyTo(contentOut,null);

		//get a handle on the new resources dir
		var resourcesDir = contentOut.clone();
		resourcesDir.append("resources");

		//recurse thru the resources dir converting text files as needed.
		LilyUtils.directorySearch(resourcesDir,function(file){
			if(LilyUtils.isText(file.leafName)) {
				LilyUtils.writeFile(file,LilyUtils.readFile(file).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));							
			}
		})

		//services.js
		var tmp = contentIn.clone();
		tmp.append("services.js");
		tmp.copyTo(contentOut,null);

		//utils.js
		var tmpIn = contentIn.clone();
		tmpIn.append("utils.js");
		var tmpOut = contentOut.clone();
		tmpOut.append("utils.js");
		var data = LilyUtils.readFile(tmpIn);
		data = data.replace(/chrome:\/\/lily/g,("chrome://"+projectName));		
		LilyUtils.writeFile(tmpOut,data);

		//patch
		var tmp = contentOut.clone();
		tmp.append(obj.patchFileName+".json");
		var data=Lily.patchObj[id].obj.patchModel.serializeDom();
		data=data.replace(/chrome:\/\/lily/g,("chrome://"+projectName));
		Lily.patchObj[id].json=data; //update the patch string.			
		tmp=LilyUtils.writeFile(tmp,data);					

		//copy subpatches
		var subPatchArr = dependencies["subPatches"];										
		for(var i=0;i<subPatchArr.length;i++) {
			if(!LilyUtils.containsProtocol(subPatchArr[i])) {
				var tmpIn = LilyUtils.getFileHandle(LilyUtils.getFilePath(subPatchArr[i]));
				var tmpOut = contentOut.clone();
				tmpOut.append(tmpIn.leafName);
//				LilyDebugWindow.print(tmpIn.leafName+" "+LilyUtils.readFile(tmpIn));
				LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn));	
			}
		}																																

		/* END CONTENT COPYING */
		
		//write manifest
		var fileIn = Lily.installDir.clone();
		fileIn.append("chrome.manifest");
		var fileOut = rootDir.clone();
		fileOut.append("chrome.manifest");
		var data = LilyUtils.readFile(fileIn).replace(/lily/g,projectName);
		data = data.replace(/skin.*/,""); //strip out the skin line
		data = data.replace(/overlay.*/,""); //strip out the overlay line
		LilyUtils.writeFile(fileOut,data);
	},
	
	/*
		Method: savePatchAsAddOn
			save a patch as an XPI.								
	*/
	savePatchAsAddOn: function(obj) {	
		var id=obj.id||Lily.currPatch;
		
		//we'll replace this later...
		var projectName="";
		
		const nsIFilePicker = Components.interfaces.nsIFilePicker;

		var fp = Components.classes["@mozilla.org/filepicker;1"]
		                   .createInstance(nsIFilePicker);
		
		fp.init(window, "Choose a location to save in", nsIFilePicker.modeSave);
		fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
		fp.defaultString = this.conformFileName(obj.name)||"";		

		var rv = fp.show();
		if(LilyUtils.navigatorPlatform()!="apple") window.blur();
		if (rv == nsIFilePicker.returnOK) {

			//FIX ME *** STRIP EXTENSION *** //
			var xpiFile = fp.file;
			projectName = this.conformFileName(xpiFile.leafName);
			
			//validate name
			if(!this.validateProjectName(projectName)) {
				LilyDebugWindow.error("Invalid project name: names can't contain spaces or non-alphanumeric characters.");
				return;
			}
			
			//par dir	
			//var parentDir = fp.file.parent.clone();									
			
			var rootDir = fp.file.parent.clone();	//Lily.installDir.clone();
			rootDir.append(projectName+"_tmp");
			
			if( !rootDir.exists() || !rootDir.isDirectory() ) {   // if it doesn't exist, create
				rootDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
			}
			
			//start copying
			if(rootDir.exists()) { //root directory exists...
				
				var dependencies = Lily.patchObj[id].obj.getPatchDependencies();
				var objArr = dependencies["classes"];			
							
				//locale
				var tmp = Lily.installDir.clone();
				tmp.append("locale");
				tmp.copyTo(rootDir,null);
				
				if(objArr.toSource().indexOf("oscreceive")!=-1||objArr.toSource().indexOf("oscsend")!=-1) {
					//components
					var tmp = Lily.installDir.clone();
					tmp.append("components");
					tmp.copyTo(rootDir,null);
				}
				
				//prefs
				var tmp = Lily.installDir.clone();
				tmp.append("platform");
				tmp.copyTo(rootDir,null);
				
				//content
				/* START CONTENT COPYING */
				var contentIn = Lily.installDir.clone();
				contentIn.append("content");
				var contentOut = rootDir.clone();
				contentOut.append("content");
				
				if( !contentOut.exists() || !contentOut.isDirectory() ) {   // if it doesn't exist, create
					contentOut.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
				}				
				
				//apikey
				var tmp = contentIn.clone();
				tmp.append("apikey.xul");
				tmp.copyTo(contentOut,null);
				
				//blank.html
				var tmp = contentIn.clone();
				tmp.append("blank.html");
				tmp.copyTo(contentOut,null);

				//install rdf
				var emailValue = (projectName+".id@"+projectName+".com"); //obj.emailAddress- using this for uniquenes		
				
				//config.txt
				var config = {};
				config["extID"] = emailValue;
				config["openDebugWin"] = (!obj.hideDebugCbx);				
				var tmpOut = contentOut.clone();
				tmpOut.append("config.txt");				
				LilyUtils.writeFile(tmpOut,config.toSource());											
				
				//connection.js
				var tmp = contentIn.clone();
				tmp.append("connection.js");
				tmp.copyTo(contentOut,null);															
							
				//debug.js
				var tmpIn = contentIn.clone();
				tmpIn.append("debug.js");
				var tmpOut = contentOut.clone();
				tmpOut.append("debug.js");				
				LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
				
				//debug.html
				var tmp = contentIn.clone();
				tmp.append("debug.html");
				tmp.copyTo(contentOut,null);
				
				//debug.xul
				var tmpIn = contentIn.clone();
				tmpIn.append("debug.xul");
				var tmpOut = contentOut.clone();
				tmpOut.append("debug.xul");			
				LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
				
				//externals
				var externalIn = contentIn.clone();
				externalIn.append("externals");
				var externalOut = contentOut.clone();
				externalOut.append("externals");

				if( !externalOut.exists() || !externalOut.isDirectory() ) {   // if it doesn't exist, create
					externalOut.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
				}

				//iterate and copy...
				for(var i=0;i<objArr.length;i++) {
					
					//LilyDebugWindow.print(objArr[i].name)
					
					var data = objArr[i].source.replace(/chrome:\/\/lily/g,("chrome://"+projectName));
					
					var tmpOut = externalOut.clone();
					tmpOut.append(objArr[i].name+".js");
					LilyUtils.writeFile(tmpOut,data);
					
				}				
				
				//images
				var tmp = contentIn.clone();
				tmp.append("images");
				tmp.copyTo(contentOut,null);
				
				//inspector.js
				var tmpIn = contentIn.clone();
				tmpIn.append("inspector.js");
				var tmpOut = contentOut.clone();
				tmpOut.append("inspector.js");				
				LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
				
				//keys.txt
				var tmp = contentIn.clone();
				tmp.append("keys.txt");
				tmp.copyTo(contentOut,null);
				
				//lib
				var tmp = contentIn.clone();
				tmp.append("lib");
				tmp.copyTo(contentOut,null);
				
				//lib.js
				var tmp = contentIn.clone();
				tmp.append("lib.js");
				tmp.copyTo(contentOut,null);
				
				//lily.js
				var tmpIn = contentIn.clone();
				tmpIn.append("lily.js");
				var tmpOut = contentOut.clone();
				tmpOut.append("lily.js");
				var data = LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName));
				data = data.replace(/nameSpace: "lily",/,"nameSpace: \""+projectName+"\",");			
				LilyUtils.writeFile(tmpOut,data);								
				
				//<projectname>.xul
				var tmpIn = contentIn.clone();
				tmpIn.append("export.xul");
				var tmpOut = contentOut.clone();
				tmpOut.append(projectName+".xul");		
				LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/<PROJECT-NAME>/g,(projectName)).replace(/<PROJECT-HIDE>/g,obj.hideMainCbx));

				//lily.css
				var tmp = contentIn.clone();
				tmp.append("lily.css");
				tmp.copyTo(contentOut,null);
				
				//menus.js
				var tmp = contentIn.clone();
				tmp.append("menus.js");
				tmp.copyTo(contentOut,null);
				
				//model.js
				var tmp = contentIn.clone();
				tmp.append("model.js");
				tmp.copyTo(contentOut,null);

				//object.js
				var tmp = contentIn.clone();
				tmp.append("object.js");
				tmp.copyTo(contentOut,null);
				
				//patch.js
				var tmpIn = contentIn.clone();
				tmpIn.append("patch.js");
				var tmpOut = contentOut.clone();
				tmpOut.append("patch.js");				
				LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
				
				//patch.xhtml
				var tmp = contentIn.clone();
				tmp.append("patch.xhtml");
				tmp.copyTo(contentOut,null);
				
				//prefs.js
				var tmpIn = contentIn.clone();
				tmpIn.append("prefs.js");
				var tmpOut = contentOut.clone();
				tmpOut.append("prefs.js");				
				LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
				
				//prefs.xul
				var tmpIn = contentIn.clone();
				tmpIn.append("prefs.xul");
				var tmpOut = contentOut.clone();
				tmpOut.append("prefs.xul");				
				LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
				
				//readonlypatch.xul
				if(!obj.hideMainCbx) {
					var tmpIn = contentIn.clone();
					tmpIn.append("readonlypatch.xul");
					var tmpOut = contentOut.clone();
					tmpOut.append("readonlypatch.xul");				
					LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
				} else {
					var tmpIn = contentIn.clone();
					tmpIn.append("hiddenpatch.xul");
					var tmpOut = contentOut.clone();
					tmpOut.append("hiddenpatch.xul");				
					LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));					
				}
								
				//resources dir
				var tmp = contentIn.clone();
				tmp.append("resources");
				tmp.copyTo(contentOut,null);
				
				//services.js
				var tmp = contentIn.clone();
				tmp.append("services.js");
				tmp.copyTo(contentOut,null);
				
				//utils.js
				var tmpIn = contentIn.clone();
				tmpIn.append("utils.js");
				var tmpOut = contentOut.clone();
				tmpOut.append("utils.js");				
				LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn).replace(/chrome:\/\/lily/g,("chrome://"+projectName)));
				
				//patch
				var tmp = contentOut.clone();
				tmp.append(xpiFile.leafName+".json");
				var data=Lily.patchObj[id].obj.patchModel.serializeDom();
				data=data.replace(/chrome:\/\/lily/g,("chrome://"+projectName))
				Lily.patchObj[id].json=data; //update the patch string.			
				tmp=LilyUtils.writeFile(tmp,data);					

				//copy subpatches
				var subPatchArr = dependencies["subPatches"];					
//				LilyDebugWindow.print("sub patches "+subPatchArr);					
				for(var i=0;i<subPatchArr.length;i++) {
					if(!LilyUtils.containsProtocol(subPatchArr[i])) {					
						var tmpIn = LilyUtils.getFileHandle(LilyUtils.getFilePath(subPatchArr[i]));
						var tmpOut = contentOut.clone();
						tmpOut.append(tmpIn.leafName);
	//					LilyDebugWindow.print(tmpIn.leafName+" "+LilyUtils.readFile(tmpIn));
						LilyUtils.writeFile(tmpOut,LilyUtils.readFile(tmpIn));
					}
				}																																
				
				/* END CONTENT COPYING */																	
			
				//write manifest
				var fileIn = Lily.installDir.clone();
				fileIn.append("chrome.manifest");
				var fileOut = rootDir.clone();
				fileOut.append("chrome.manifest");
				LilyUtils.writeFile(fileOut,LilyUtils.readFile(fileIn).replace(/lily/g,projectName));								
				
				//install rdf
				var nameValue = obj.name||projectName;
				var versionValue = obj.version||"0.1";
				var creatorValue = obj.creator||"Lily";
				var descValue = obj.description||"Made with Lily";
				var homepageValue = obj.homepageURL||"http://www.lilyapp.org/";
				var emailValue = (projectName+".id@"+projectName+".com"); //obj.emailAddress- using this instead of user email
				
				var fileIn = Lily.installDir.clone();
				fileIn.append("export.rdf");
				var fileOut = rootDir.clone();
				fileOut.append("install.rdf");
				var data = LilyUtils.readFile(fileIn).replace(/<PROJECT-UID-REPLACE>/g,emailValue).replace(/<PROJECT-NAME>/g,nameValue);				
				data = data.replace(/<PROJECT-VERSION-REPLACE>/,versionValue).replace(/<PROJECT-CREATOR-REPLACE>/,creatorValue).replace(/<PROJECT-DESC-REPLACE>/,descValue).replace(/<PROJECT-HOMEPAGE-REPLACE>/,homepageValue);
				LilyUtils.writeFile(fileOut,data);
				
				//the tmp directory where we've been building our xpi
				var buildDir=rootDir.clone();
														
				// remove existing xpi
				if(xpiFile.exists())
					xpiFile.remove(false);
					
				var zipper = Components.classes["@mozilla.org/zipwriter;1"].createInstance(Components.interfaces.nsIZipWriter);

				var newXPI = LilyUtils.getFileHandle(xpiFile.path+".xpi");
				zipper.open(newXPI,0x04 | 0x08 | 0x20);	
				
				//recursively add files to the zip							
				LilyUtils.directorySearch(buildDir,function(entry){
					zipper.addEntryFile(entry.path.substring((buildDir.path.length+1),entry.path.length),9,entry,false);
				})
			
				zipper.close();							
									
				//FIXME **** on windows this fails in dev due to .svn directories ****
				// now remove build dir
				rootDir.remove(true);
																				
			}

		}

	}	
	
}