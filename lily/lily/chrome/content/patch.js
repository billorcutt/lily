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


function LilyPatch(pID,parent,width,height,locked,extWindow,hide)
{	
	var extWin = extWindow||null; //pass straight thru to patchView
	this.patchID=pID; //patch id
	this.callback=null; //called after the patch window is opened.
	this.title="Untitled"; //patch title
	this.width=(width&&!hide)?width:(hide)?0:800; //width	
	this.height=(height&&!hide)?height:(hide)?0:600; //height
	this.heightInSubPatch=0; //height when loaded in a subpatch
	this.widthInSubPatch=0;	 //width when loaded in a subpatch
	this.description="";	//patch description.
	this.category="";	//patch category.	
	this.color="#FFFFFF" //background color
	this.fontSize=LilyUtils.getDefaultFont()[1]; //font size in px
	this.fontFamily=LilyUtils.getDefaultFont()[0]; //font face
	this.readonly = locked||false; //boolean- readonly?
	this.patchWindowType="popup"; //window type- options: popup, iframe, sidebar- defaults to popup.
	this.hidden=hide||false; //
	this.zoomLevel=1;
	this.usesTmpFile=false; //i.e. a temporary patch for editing a patcher.
	
	var thisPtr=this;
	
	/*
		Method: resetZoom
			reset zoom level.
			
		Arguments: 
			zoom - zoom level to set											
	*/	
	this.resetZoom=function() {
		this.zoomLevel=1;
		this.zoomPatch(this.zoomLevel);
	}	
	
	/*
		Method: decZoom
			decrement zoom level.
			
		Arguments: 
			zoom - zoom level to set											
	*/	
	this.decZoom=function() {
		this.zoomLevel=this.zoomLevel-.25;
		this.zoomPatch(this.zoomLevel);		
	}	

	/*
		Method: incZoom
			increment zoom level.											
	*/
	this.incZoom=function() {
		this.zoomLevel=this.zoomLevel+.25;
		this.zoomPatch(this.zoomLevel);		
	}
	
	/*
		Method: zoomPatch
			setZoomLevel.
			
		Arguments: 
			zoom - zoom level to set											
	*/
	this.zoomPatch=function(zoom) {
		var contViewer = this.patchView.chromeWin.docShell.contentViewer;
		var docViewer = contViewer.QueryInterface(Components.interfaces.nsIMarkupDocumentViewer);
		docViewer.fullZoom = parseFloat(zoom);
	}	
	
	/*
		Method: getContainerPatch
			if this is a subpatch, return the parent patch, otherwise return this patch.
		
		Returns: 
			returns patch object.
	*/
	//get the containing patch window
	//subpatch/patcher will override this		
	this.getContainerPatch=function() {
		return this;
	}
	
	/*
		Method: getContainerID
			if this is a subpatch, return the container instance id, otherwise return null.
		
		Returns: 
			returns id.
	*/
	//subpatch/patcher will override this		
	this.getContainerID=function() {
		return this.patchID;
	}	
	
	/*
		Method: getTopPatch
			get the top level patch object.
		
		Returns: 
			returns a patch object.
	*/		
	this.getTopPatch=function() {
		
		var parent=this.getContainerPatch();
				
		while(!parent.isTopLevelPatch()) {
			parent=parent.getContainerPatch();
		}

		return parent;
	}
	
	/*
		Method: getFirstParentPatch
		starting from the current patch, walks up 
		the patch tree and returns the first non 
		temporary/editor patch it finds.
		
		Returns: 
			returns a patch object.
	*/		
	this.getFirstParentPatch=function() {
		
		if(this.usesTmpFile) {
			var parent=this.getContainerPatch();
			while(parent.usesTmpFile) {
				parent=parent.getContainerPatch();
			}
		} else {
			var parent = this;
		}

		return parent;
	}	
	
	/*
		Method: isTopLevelPatch
			returns boolean indicating if this is a top level patch.
		
		Returns: 
			boolean.
	*/	
	//is top level patch
	this.isTopLevelPatch=function() {
		if(this.patchWindowType=="popup")
			return true;
		else
			return false;
	}

	//get patch dependencies- right now just a list of objects & subpatches
	this.getPatchDependencies=function() {
		return this.patchModel.getPatchDependencies();
	}

	/*
		Method: getPatchData
			returns the last saved patch string.
		
		Returns: 
			patch string
	*/
	//returns the last saved patch string
	this.getPatchData=function() {
		if(Lily.patchObj[this.patchID]&&Lily.patchObj[this.patchID].json)
			return Lily.patchObj[this.patchID].json;
		else
			return null;
	}	
	
	/*
		Method: getPatchFile
			if the patch is saved, returns a reference to the patch file, otherwise returns null.
		
		Returns: 
			patch file reference
	*/	
	//returns a handle to this patch file
	this.getPatchFile=function() {
		if(Lily.patchObj[this.patchID]&&Lily.patchObj[this.patchID].file)
			return Lily.patchObj[this.patchID].file;
		else
			return null;
	}
	
	/*
		Method: getPatchDir
			if the patch is saved, returns a reference to the directory containing the patch file, otherwise returns null.
		
		Returns: 
			directory reference
	*/	
	//returns a handle to the parent directory
	this.getPatchDir=function() {
		if(Lily.patchObj[this.patchID]&&Lily.patchObj[this.patchID].file&&Lily.patchObj[this.patchID].file.parent)
			return Lily.patchObj[this.patchID].file.parent;
		else
			return null;
	}
				
	//sync or async messaging
	this.asyncMessaging=true;

	//return the patch font
	this.getPatchFont=function() {
		return [this.fontFamily,this.fontSize];
	}	
				
	/*
		Method: getObj
			returns a reference to an external given an instance id.
	
		Arguments: 
			objID - instance id.
		
		Returns: 
			returns a reference to the object.
	*/	
	this.getObj=function(objID) {
		if(objID)
			return this.patchModel.getNode(objID);
		else
			return null;
	}

	/*
		Method: getAllObj
			returns an array of references to all the external instances in this patch.
		
		Returns: 
			returns an array of references.
	*/
	this.getAllObj=function() {
		return this.patchModel.getAllObjects();
	}

	/*
		Method: getAllObjIDs
			returns an array of ids for all the externals in this patch.
		
		Returns: 
			returns an array of instance ids.
	*/
	this.getAllObjIDs=function() {
		return this.patchModel.getAllObjectIDs();
	}

	/*
		Method: getObjectsByClass
			returns an array of references to all the instances of externals of a given type.
	
		Arguments: 
			name - class name.
		
		Returns: 
			returns an array of references.
	*/
	this.getObjectsByClass=function(name) {
		return this.patchModel.getObjectsByClass(name);
	}

	/*
		Method: getObjectsByGroupName
			returns an array of references to all the instances of externals with a given name.
	
		Arguments: 
			name - group name.
		
		Returns: 
			returns an array of references.
	*/
	this.getObjectsByGroupName=function(name) {
		return this.patchModel.getObjectsByGroupName(name);
	}		

	/*
		Method: setFullScreen
			true sets the patch to full screen. false exits full screen.
	
		Arguments: 
			bool - full screen state.
	*/
	this.setFullScreen=function(bool) {
		this.patchView.xulWin.fullScreen=bool;
	}	

	/*
		Method: sendMessage
			send a message to an object.
	
		Arguments: 
			objID - object id.
			msg - message to send.
			args - arguments.
	*/
	this.sendMessage=function(objID,msg,args) {
		var p=args||"";
		var o=this.getObj(objID);
		
		if(o && msg && typeof o.processInput=="function")
			o.processInput(msg+" "+p);
		else if(o && msg && typeof o[msg]=="function")
			o[msg](p);
	}	
			
	/*
		Method: deleteObject
			delete an external instance.
	
		Arguments: 
			objID - object id.
	*/		
	//delete object
	this.deleteObject=function(objID) { 
		
		var obj=this.getObj(objID); //get the object
		if(obj)	{
			
			if(obj.getObjectType()=="object") //if its an object	
				obj.controller.notifyObjectListeners("destroy"); //notify object listeners			

			this.patchController.removeAllObserversByID(objID); //remove object listeners
			this.patchController.removeAllPatchObserversByID(objID); //remove patch listeners
			this.patchController.unsetSelectedObjects(objID); //remove from selected object list
			
			if(obj.getObjectType()!="connection" && obj.controller.getObjEdit() && !obj.controller.replacing) //if we were editing
				obj.controller.abortEditObj();
				
			this.removeAllConnections(objID); //remove connections- this will destroy a connection w/o a call to the destructor
			
			if(obj.getObjectType()!="connection")
				obj.destroy();	//remove ui & cleanup
			
			obj=null;	//remove this ref
			this.patchModel.removeNode(objID);  //remove ref to node from model
			
			LilyInspectorWindow.clear(); //clear the inspector window
			
			//notify patch listeners that the patch has changed
			thisPtr.patchController.notifyPatchListeners("patchModified");
					
			//return null; //why would i return null here???
		}
	}			
		
	/*
		Method: createObject
			create an instance of an external with a given classname.
	
		Arguments: 
			name	- external name. (required)
			pID 	- subpatch ID.  (optional) //FIXME this should go away.
			t 		- top in pixels. (optional)
			l 		- left in pixels (optional)
			id		- object id (optional)
			args	- object args as a string (optional)
		
		Returns: 
			returns the created object instance.
	*/			
	//create object- args: className, top, left, objID, variable_length_arguments_to_obj //only the first arg is required.
	this.createObject=function(name,pID,t,l,id,args,resizeFlag) {
		
		if(this.getObj(id))
			return null;
		
		//so messy...
		var subPatchID=pID||null; //subpatch ID otherwise null
		var className=(this.getModule(name))?LilyObjectList.objDisplay[name] : "tmp";
		var isValid=(this.getModule(name))?true:false;				
		var top=t || 0;
		var left=l || 0;	
		var objID=id||this.generateObjID(className);
		var argStr=(args)?args:"";
		var space=(args)?" ":""; //dont add a space if there are no args
		var objArgs=argStr.replace(/@@\S*/g,''); //strip group names out of here
		var cmdStr=(className=="tmp" && name!="tmp")?name:space + argStr; //if we have a bad object name, make that the arg. Others use the unmodified name for the cmdSTr 								
		var obj=(this.getModule(name))?this.getModule(name):this.getModule("tmp");
		var count=this.patchModel.getObjectCount()+1; //get the patch object count
		var resize_flag = resizeFlag||false; //has been resized
						
		if(obj && typeof obj == "function") {
			//prototype the base to the class we're creating & then create it.
			obj.prototype=new LilyObjectBase(className,this,subPatchID,top,left,objID,argStr);
			var o=new obj(objArgs);
			
			if(o.displayName==undefined)
				o.displayName=LilyUtils.getObjectMetaData(className).textName;
				
			o.hasBeenResized = resize_flag;	//need to set this here before we draw the UI
						
			if(!o.ui) { //if no custom html defined
				o.ui=new LilyObjectView(o,null,cmdStr); //create the ui
				o.ui.draw();
			}
			
			//go ahead and make the borders visible if that's where we're headed anyway...
			if(!o.controller.noBorders)
				o.ui.contentContainer.style.borderColor="black";
			
			//set font using the patch default values
			o.setFontFamily(o.fontFamily);
			o.setFontSize(o.fontSize);
			o.setFontColor(o.fontColor);			
			
			//set to the default color
			o.setColor(o.color);
			
			//set an incremented zindex
			o.setzIndex(count);
			
			if(o.height)
				o.setHeight(o.height);
				
			if(o.width)
				o.setWidth(o.width);
			
			this.patchModel.addNode(objID,o); //add to model
			this.patchController.notifyPatchListeners("patchModified");
			
			o.init(); //generic- user defined
		} else if(obj && typeof obj == "string") {
			var sizeArr = LilyUtils.extractSizeInSubPatch(LilyUtils.readFileFromPath(obj).data);		
			if(sizeArr[0]||sizeArr[1]) {
				return this.createObject("subpatch",pID,t,l,id,(obj+" "+argStr+" ##"+className+"##"));					
			} else {
				return this.createObject("patcher",pID,t,l,id,(obj+" "+argStr+" ##"+className+"##"));	
			}
			
		}
		
		if(!isValid)
			LilyDebugWindow.error("No external object named "+cmdStr+ " found");
		
		return o;
	}

	//replace object
	this.replaceObject=function(oldObj,newObjName,newArgs) {
	
		var x=oldObj.left;
		var y=oldObj.top;
		var id=oldObj.objID;
		oldObj.controller.replacing=true;		
		var args=newArgs;
						
		var saveConnections=(oldObj.controller.objView.display==newObjName)?true:false;
		var newID=(oldObj.controller.objView.display==newObjName)?id:null;
		
		//if we're just modifying the args, grab the old connections
		if(saveConnections)
			var savedConnections=this.saveConnections(id);
		
		//delete object we're replacing
		this.deleteObject(id);
		
		//create new object
		var o=this.createObject(newObjName,null,y,x,newID,args);
				
		//if we're recreating the same extern
		if(newID) {
			//set some object properties
			if(typeof oldObj.fontSize!="undefined")
				o.setFontSize(oldObj.fontSize);
			if(typeof oldObj.fontFamily!="undefined")
				o.setFontFamily(oldObj.fontFamily);
			if(typeof oldObj.fontColor!="undefined")
				o.setFontColor(oldObj.fontColor);					
			if(typeof oldObj.opacity!="undefined")
				o.setTransparency(oldObj.opacity);
			if(typeof oldObj.zIndex!="undefined")
				o.setzIndex(oldObj.zIndex);
			if(oldObj.visibility && typeof oldObj.visibility!="undefined")
				o.setVisibility(oldObj.visibility);
			if(typeof oldObj.width!="undefined")
				o.setWidth(oldObj.width);
			if(typeof oldObj.height!="undefined")
				o.setHeight(oldObj.height);
			if(typeof oldObj.hiddenInPerf!="undefined")
				o.controller.setHiddenInPerf(oldObj.hiddenInPerf);
			if(typeof oldObj.groupName!="undefined")
				o.setGroupName(oldObj.groupName);
			if(typeof oldObj.cssName!="undefined" && oldObj.cssName)
				o.setCSSName(oldObj.cssName);
			if(typeof oldObj.customColor!="undefined")
				o.setCustomColor(oldObj.customColor);
			if(typeof oldObj.color!="undefined" && o.customColor)
				o.setColor(oldObj.color);																								

			//set name/values from the inspector array
			if(typeof oldObj.inspectorConfig!="undefined") {
				for(var i=0;i<oldObj.inspectorConfig.length;i++) {
					if(oldObj.inspectorConfig[i].type=="number")
						o[oldObj.inspectorConfig[i].name]=(+oldObj.inspectorConfig[i].value);
					else
						o[oldObj.inspectorConfig[i].name]=oldObj.inspectorConfig[i].value;	
				}
			}

			//set copy data from the coll
			if(typeof oldObj.collData!="undefined") {
				o.gColl=LilyUtils.cloneObject(oldObj.collData);
			}
		}
				
		//then recreate the connnections for the new object here
		if(saveConnections)
			this.restoreConnections(savedConnections);
			
		return o;
		
	}
	
	//restore previously saved connections
	this.restoreConnections=function(connections) {
		for(var i=0;i<connections.length;i++) {
			var c = this.createConnection(connections[i].inlet,connections[i].outlet,connections[i].segmentArray,null);
			if(c && typeof connections[i].hiddenInPerf!="undefined")
				c.controller.setHiddenInPerf(connections[i].hiddenInPerf);
		}
	}
	
	//save connections an object being edited
	this.saveConnections=function(id) {
		return this.patchModel.getObjConnections(id);
	}

	/*
		Method: createConnection
			create a connection between two objects.
	
		Arguments: 
			elIDIn			- inlet id. (required)
			elIDOut 		- outlet id. (required)
			segmentArray 	- segment array (optional)
			pID 			- subpatch id (optional)			
		
		Returns: 
			returns the newly created connection instance.
	*/
	//create a connection
	this.createConnection=function(elIDIn,elIDOut,segmentArray,pID) {
		var subPatchID=pID||null; //true if its a subpatch
		if(this.getObj(elIDIn) && this.getObj(elIDOut) && !this.getObj(elIDOut+"_"+elIDIn)) {
			var c=new LilyConnection(this, elIDIn,elIDOut,segmentArray);
			if(segmentArray && segmentArray.length) //if segment array exists
				c.createSavedConnection(subPatchID); //create the saved connection
			else //otherwise
				c.createNewConnection(subPatchID); //generate a connection from scratch
				
			return c;			
		}
		return null;
	}

	/*
		Method: removeConnection
			remove a connection between an inlet & an outlet.
	
		Arguments: 
			elIDIn			- inlet id. (required)
			elIDOut 		- outlet id. (required)			
		
		Returns: 
			returns the newly created connection instance.
	*/
	//remove a connection
	this.removeConnection=function(elIDIn,elIDOut) {
		var cID=elIDOut+"_"+elIDIn;
		var c=this.getObj(cID);
		if(c)
			c.remove();
	}

	/*
		Method: removeAllConnections
			remove all connections an external instance.
	
		Arguments: 
			objID			- object id. (required)			
	*/
	//remove all connections to & from an object
	this.removeAllConnections=function(objID) {
		var obj=this.getObj(objID);
		
		if(obj && obj.getObjectType()=="object")
			obj.removeObjConnections();
		else if(obj && obj.getObjectType()=="connection")
			obj.remove();
	}
	
	//update all patch connections in case something (like font size, etc) has changed and caused them to be misaligned.	
	this.cleanupConnections=function() {

		var oArray=this.patchModel.objArray;
		for(var a in oArray) {	
			if(oArray[a].getObjectType()=="connection") {
				oArray[a].controller.updateOutletConnection();				
				oArray[a].controller.updateInletConnection();					
			}
		}
	}

	/*
		Method: read
			paste patch into the current patch file from path file.
	
		Arguments: 
			path	- path to patch (required)				
	*/
	//paste patch into the current patch file from path file
	this.read=function(path) {
		var str=LilyUtils.readFileFromPath(path);
		if(str)
			this.openPatch(str.data);
		else
			LilyDebugWindow.error("error- patch not found.");
	}

	/*
		Method: open
			open an existing patch window.
	
		Arguments: 
			path	- path to patch (required)
			
		Returns: 
			returns the newly created patch object.		
	*/
	//open an existing patch window.
	this.open=function(path) {
		
		var fPath=LilyUtils.getFilePath(path);
		var file=(fPath)?LilyUtils.getFileHandle(fPath):null;
		
		if(file)
			return Lily.openPatchFromFile(file,false,false);
		else
			LilyDebugWindow.error("error- patch not found.");
	}

	/*
		Method: new
			open an empty patch window.
			
		Returns: 
			returns the newly created patch object.		
	*/
	//open an empty patch window.
	this.newPatch=function() {
		var patchID = Lily.newPatch();
		return Lily.patchObj[patchID].obj;
	}

	/*
		Method: moveTo
			move the patch window to supplied coordinates.
	
		Arguments: 
			x	- position from left in pixels (required)
			y	- position from top in pixels (required)				
	*/
	this.moveTo=function(x,y) {
		this.patchView.xulWin.moveTo(x,y);
	}

	/*
		Method: moveBy
			move the patch window by supplied distance.
	
		Arguments: 
			x	- distance from left in pixels (required)
			y	- distance from top in pixels (required)				
	*/
	this.moveBy=function(x,y) {
		this.patchView.xulWin.moveBy(x,y);
	}	
	
	/*
		Method: blurWin
			blur the patch window				
	*/
	this.blurWin=function() {
		this.patchView.xulWin.blur();
	}

	/*
		Method: focusWin
			focus the patch window				
	*/
	this.focusWin=function() {
		this.patchView.xulWin.focus();
	}	

	/*
		Method: openHelp
			open the help patch for the supplied classname.
	
		Arguments: 
			name	- class name (required)				
	*/
	//alias to open help patch.
	this.openHelp=function(name) {
		Lily.openHelpPatch(name);
	}
	
	this.checkVersion=function(ver) {
		//do something useful here when we need to.
		//LilyDebugWindow.print("patch created with version " + ver);
	}
		
	//open a patch
	this.openPatch=function(patchStr,id,pID,fileName,patchDir) {
		
		var opID=id||""; //operation id- has a value if we're pasting
		var subPatchID=pID||null; //pid if we're opening a sub-patch
		var patchName=fileName||"Untitled";
		var dir=patchDir||null;
		var parent_patch = this.getTopPatch(); //get the top level patch		
	
		try {
			eval(patchStr); //inflate
		} catch(e) {
			LilyDebugWindow.error("couldn't open patch "+e.name+": "+e.message+" line: "+e.lineNumber+" in "+e.fileName);
		}
		
		//
		if(!opID && this.isTopLevelPatch())
			this.patchModel.addSubPatch(this.patchID,false,this);
		
		if(typeof patch != "undefined") {
		
			this.checkVersion(patch.version); //check the patch version- not using this for anything yet...	
			
			var pPlatform = patch.platform||"apple"; //default it to mac
		
			if(typeof patch.title!="undefined" && !subPatchID && !opID && this.patchWindowType=="popup")
				this.patchView.setPatchTitle(patch.title||patchName); //update the patch title - patch.title				
		
			if(typeof patch.color!="undefined" && !subPatchID && !opID)
				this.patchView.setPatchColor(patch.color); //update color
				
			if(typeof patch.description!="undefined" && !subPatchID && !opID)
				this.description=patch.description; //update color
				
			if(typeof patch.category!="undefined" && !subPatchID && !opID)
				this.category=patch.category; //update color				
				
			if(typeof patch.heightInSubPatch!="undefined" && !subPatchID && !opID)
				this.heightInSubPatch=parseInt(patch.heightInSubPatch); //update color	
				
			if(typeof patch.widthInSubPatch!="undefined" && !subPatchID && !opID)
				this.widthInSubPatch=parseInt(patch.widthInSubPatch); //update color							
			
			var oArray=patch.objArray; //top level 'patch' object defined in the patch json
		
			//1st pass- create objects
			for(var x in oArray) { 
				if(oArray[x].type=="object") {
				
					//if the object isn't found- look in the patch directory/subdirectories.
					if(!LilyObjectList.isLoaded(oArray[x].name) && dir) {
						if(!LilyObjectList.searchDirectory(dir,oArray[x].name+".js")) {
							LilyDebugWindow.error("Couldn't find object "+oArray[x].name+".");
							return null;
						}	
					}	
				
					//create the object
					var o=this.createObject(oArray[x].name,subPatchID,oArray[x].top,oArray[x].left,this.updateObjID(oArray[x].objID,opID),oArray[x].args,oArray[x].hasBeenResized);

					//set some object properties
					if(typeof oArray[x].fontSize!="undefined")
						o.setFontSize(oArray[x].fontSize);
					if(typeof oArray[x].fontFamily!="undefined")
						o.setFontFamily(oArray[x].fontFamily);
					if(typeof oArray[x].fontColor!="undefined")
						o.setFontColor(oArray[x].fontColor);					
					if(typeof oArray[x].opacity!="undefined")
						o.setTransparency(oArray[x].opacity);
					if(typeof oArray[x].zIndex!="undefined")
						o.setzIndex(oArray[x].zIndex);
					if(oArray[x].visibility && typeof oArray[x].visibility!="undefined")
						o.setVisibility(oArray[x].visibility);
					if(typeof oArray[x].width!="undefined")
						o.setWidth(oArray[x].width);
					if(typeof oArray[x].height!="undefined")
						o.setHeight(oArray[x].height);
					if(typeof oArray[x].hiddenInPerf!="undefined")
						o.controller.setHiddenInPerf(oArray[x].hiddenInPerf);
					if(typeof oArray[x].groupName!="undefined")
						o.setGroupName(oArray[x].groupName);
					if(typeof oArray[x].cssName!="undefined"&&oArray[x].cssName)
						o.setCSSName(oArray[x].cssName);
					if(typeof oArray[x].customColor!="undefined")
						o.setCustomColor(oArray[x].customColor);
					if(typeof oArray[x].color!="undefined"&&o.customColor)
						o.setColor(oArray[x].color);
											
					//set name/values from the inspector array
					if(typeof oArray[x].inspectorConfig!="undefined") {
						for(var i=0;i<oArray[x].inspectorConfig.length;i++) {
							if(oArray[x].inspectorConfig[i].type=="number")
								o[oArray[x].inspectorConfig[i].name]=(+oArray[x].inspectorConfig[i].value);
							else
								o[oArray[x].inspectorConfig[i].name]=oArray[x].inspectorConfig[i].value;	
						}
					}
					
					//set copy data from the coll
					if(typeof oArray[x].collData!="undefined") {
						o.gColl=LilyUtils.cloneObject(oArray[x].collData);
					}
					
					//add to subpatcharray
					if(oArray[x].name=="subpatch"||oArray[x].name=="patcher"||oArray[x].name=="wow") {
						parent_patch.patchModel.addSubPatch(x,false,null); //add this subpatch to the list
					}
				}
			}
		
			for(var a in oArray) {//2nd pass- make connections		
				if(oArray[a].type=="connection") {
					var c=this.createConnection(this.updateObjID(oArray[a].inlet,opID),this.updateObjID(oArray[a].outlet,opID),oArray[a].segmentArray,subPatchID);
					if(c && typeof oArray[a].hiddenInPerf!="undefined")
						c.controller.setHiddenInPerf(oArray[a].hiddenInPerf);
				}
			}
					
			//FIXME **** commenting this out ***** not sure what it will break...		
			//lots of voodoo logic here- this will probably change.		
			//if(!opID && !subPatchID) //standard patch open
			//	setTimeout(function(){thisPtr.cleanupConnections();},1000);
			//else if(!opID && subPatchID) //if it is a subpatch
			//	thisPtr.cleanupConnections();	
			//if pasting do nothing	
		
			if(typeof patch.mode!="undefined" && !subPatchID && !opID)
				this.patchController.setEditable(patch.mode); //set mode
			
		}
					
		//adjust window to content size	if we're not hidden or iframe
		if(!thisPtr.hidden && !extWindow) {
			setTimeout(function() {
				thisPtr.patchView.xulWin.innerHeight+=(thisPtr.patchView.oWin.scrollMaxY>0)?(thisPtr.patchView.oWin.scrollMaxY+0):0;
				thisPtr.patchView.xulWin.innerWidth+=(thisPtr.patchView.oWin.scrollMaxX>0)?(thisPtr.patchView.oWin.scrollMaxX+0):0;
				setTimeout(function(){ if(typeof thisPtr.updatePatchData == "function") thisPtr.updatePatchData(); },1000); //update the patchdata
			},100);					
		}
		
		if(!opID && this.isTopLevelPatch()) { //top level patch
			thisPtr.patchController.patchLoaded(thisPtr.patchID,this); //			
		}				
										
	}
	
	//update object id for pasting & subpatches where the old id might conflict with whats already there.
	this.updateObjID=function(oldID,newID) {
		if(newID=="") {
			return oldID;
		} else if(oldID.indexOf(".")==-1) { //update object id
			var name=oldID.split("!uid=");
			var updated=name[0]+"!uid="+(parseInt(newID)+parseInt(name[1]));
			return updated;
		} else if(oldID.indexOf(".")!=-1) { //update inlet/outlet id
			var name=oldID.split("!uid=");
			var letID=name[1].split(".");
			var updated=name[0]+"!uid="+(parseInt(newID)+parseInt(name[1]))+"."+letID[1];
			return updated;
		}
		return "";		
	}
	
	/*
		Method: updatePatchData
			update the patch data.		
	*/
	this.updatePatchData=function() {
		Lily.patchObj[this.patchID].json = this.patchModel.serializeDom();
	}

	/*
		Method: savePatch
			save this patch.		
	*/
	//save a patch
	this.savePatch=function() {
		Lily.savePatch(this.patchID);
	}
	
	/*
		Method: copy
			copy any selected objects.	
	*/
	//copy selected objects
	this.copy=function() {
		Lily.clipboard=thisPtr.patchModel.serializeDom(true);
//		LilyDebugWindow.print(thisPtr.app.clipboard);
	}
	
	/*
		Method: cut
			cut any selected objects.	
	*/
	//cut selected objects
	this.cut=function() {
		Lily.clipboard=thisPtr.patchModel.serializeDom(true);
		thisPtr.patchController.notifyPatchListeners("deleteKey");
		thisPtr.patchController.notifyPatchListeners("patchModified");		
	}

	/*
		Method: clear
			clear any selected objects.		
	*/
	//delete selected objects
	this.clear=function() {
		thisPtr.patchController.notifyPatchListeners("deleteKey");
		thisPtr.patchController.notifyPatchListeners("patchModified");
	}

	/*
		Method: paste
			paste contents of clipboard.	
	*/
	//paste contents of clipboard- update the object ids to avoid duplicate ids
	//need to modify this so that this is disabled during editing
	this.paste=function() {
		if(Lily.clipboard) {
			var id=this.generateUID(); //new id
			this.openPatch(Lily.clipboard,id);
			thisPtr.patchController.notifyPatchListeners("patchModified");
		}			
	}
	
	this.getInfo=function() {
		thisPtr.patchController.notifyPatchListeners("inspector");		
	}
	
	this.hideInPerf=function() {
		thisPtr.patchController.notifyPatchListeners("hiddenInPerf");
	}
	
	this.showInPerf=function() {
		thisPtr.patchController.notifyPatchListeners("visibleInPerf");
	}
	
	//FIXME THIS NEEDS TO GO AWAY
	//open a sub-patch off screen
	this.openSubPatch=function(patchStr,id,subPatchID) {
		var subPatchNode=this.patchView.displayHTML("",subPatchID,0,0,true,null) //creates an empty div the subpatch will be a child of
//		subPatchNode.style.display="none"; //hide the div
		this.openPatch(patchStr,id,subPatchID); //open the subpatch
		return subPatchNode; //return a pointer to the parent div
	}


	/*
		Method: closePatch
			close the open patch.	
	*/
	//exposing this here for thispatch...
	this.closePatch=function() {
		Lily.close();
	}
	
	//close a patch
	//need methods to unset listeners?
	this.close=function() {
		//clean up & close window
		this.patchController.notifyPatchListeners("patchClosing");		
		var win=thisPtr.patchView.xulWin; //save a ref to the window.
		var type=this.patchWindowType; //save the window type
		thisPtr.destroyPatch(); //cleanup everything else.
		if(type=="popup") { win.close(); }//close the window.		
	}
	
	//debug
	this.dumpListeners=function() {

		LilyDebugWindow.print("");
		LilyDebugWindow.print("||----------------------------- patchListeners ---------------------------------||");

		for(var i in this.patchController.patchListeners) {	
			if(this.patchController.patchListeners[i].length) {
					LilyDebugWindow.print(i);
				for(var j=0;j<this.patchController.patchListeners[i].length;j++) {
					LilyDebugWindow.print("		"+j+ ": " + this.patchController.patchListeners[i][j].id+" "+this.patchController.patchListeners[i][j].evt)
				} 
			}			
		}

		LilyDebugWindow.print("");
		LilyDebugWindow.print("||----------------------------- patchListenersSelect ---------------------------||");		

		for(var i in this.patchController.patchListenersSelect) {	
			if(this.patchController.patchListenersSelect[i].length) {
				LilyDebugWindow.print(i);
				for(var j=0;j<this.patchController.patchListenersSelect[i].length;j++) {
					LilyDebugWindow.print("		"+j+ ": " + this.patchController.patchListenersSelect[i][j].id+" "+this.patchController.patchListenersSelect[i][j].evt)
				} 
			}			
		}
		
		LilyDebugWindow.print("");
		LilyDebugWindow.print("||----------------------------- objectListeners ---------------------------------||");

		for(var i in this.patchController.objectListeners) {	
			if(this.patchController.objectListeners[i].length) {
				LilyDebugWindow.print(i);
				for(var j=0;j<this.patchController.objectListeners[i].length;j++) {
					LilyDebugWindow.print("		"+j+ ": " + this.patchController.objectListeners[i][j].id+" "+this.patchController.objectListeners[i][j].evt)
				} 
			}			
		}
		
		LilyDebugWindow.print("");
		LilyDebugWindow.print("||----------------------------- objectListenersSelect ---------------------------------||");

		for(var i in this.patchController.objectListenersSelect) {	
			if(this.patchController.objectListenersSelect[i].length) {
				LilyDebugWindow.print(i);
				for(var j=0;j<this.patchController.objectListenersSelect[i].length;j++) {
					LilyDebugWindow.print("		"+j+ ": " + this.patchController.objectListenersSelect[i][j].id+" "+this.patchController.objectListenersSelect[i][j].evt)
				} 
			}			
		}
	}
	
	//clean up & destroy a patch
	this.destroyPatch=function() {

		var oArr=this.patchModel.objArray;
		for(var x in oArr) {
			this.deleteObject(x);
		}
		
		for(var y in this.patchModel) {
			this.patchModel[y]=null;
			delete this.patchModel[y];
		}	
		this.patchModel=null;
		delete this.patchModel;
		
		for(var z in this.patchView) {
			this.patchView[z]=null;
			delete this.patchView[z];
		}	
		this.patchView=null;
		delete this.patchView;
		
		for(var w in this.patchController) {
			this.patchController[w]=null;
			delete this.patchController[w];
		}	
		this.patchController=null;
		delete this.patchController;
		
		for(var v in this) {
			this[v]=null;
			delete this[v];
		}	
					
		//this.resetModel();
		LilyDebugWindow.print("closing patch...")
	}
	
	this.getObjectType=function() {
		return "patch";
	}	

	this.getModule=function(className) {
				
		if(typeof Lily["$"+LilyObjectList.objDisplay[className]] != "undefined") {
			return Lily["$"+LilyObjectList.objDisplay[className]]; //external
		} else if(LilyObjectList.search(className)) {
			return LilyObjectList.search(className).path; //if its a patch, just return the path
		} else {
			//if the object isn't found- look in the patch directory/subdirectories.
			var dir = this.getPatchDir();
			if(!LilyObjectList.isLoaded(className) && dir) { //this loads the extern if found
				if(!LilyObjectList.searchDirectory(dir,className+".js")) {
					if(!LilyObjectList.searchDirectory(dir,className+".json")) { //this loads the patch if found
						LilyDebugWindow.error("Couldn't find external "+oArray[x].name+".");
						return null;
					} else {
						return LilyObjectList.search(className).path; //if its a patch, just return the path
					}
				} else {
					return Lily["$"+LilyObjectList.objDisplay[className]];
				}	
			}
		}
	}
	
	//FIXME *** GOTTA BE A BETTER WAY TO DO THIS *** //
	this.generateUID=function() {
		var id=new Date();
		return id.getTime();
	}
	
	this.generateObjID=function(className) {
		return (className+"!uid="+this.generateUID());
	}	
	
	//export as js/html
	this.compilePatch=function() { /* compile */ }

	//init
	this.patchModel=new LilyModel(this);	
	this.patchView=new LilyPatchView(pID,this,extWin,this.hidden);
	this.patchController=new LilyPatchController(pID,this);
//	this.patchController=null; //to be filled in after the view
}


/**
*	Construct a new PatchController
*	@class top level class for the patch object
*	@constructor
*/
function LilyPatchController(pID,parent)	
{
	
	this.patch=parent;
	this.pID=pID;
	this.patch.patchView.controller=this; //pass the view a ptr;
	this.oWin=null;
	this.xulWin=null;	
	this.document=null;	
	
	this.mouseX=0;
	this.mouseY=0;
	var mouseDownTime=new Date(); //init
	
	this.editable="edit";
	this.currentConnection=null;
	
	//listener arrays
	this.patchListeners={};
	this.patchListenersSelect={};	
	this.objectListeners={};
	this.objectListenersSelect={};
	
	//is user editing?
	this.editing=false;
	
	var okToCreate=true;	
	var thisPtr=this;
	
///////////////////////////////////////////////////////////////////	

	//getter/setter
	this.setPatchEdit=function(b) {
		thisPtr.editing=b;
		LilyMenuBar.setEditCommands(b);
	}
	
	this.getPatchEdit=function() {
		return thisPtr.editing;
	}	

///////////////////////////////////////////////////////////////////	

	//bool are any objects selected?
	this.hasSelection=false;
	
	//hash of selected objects
	this.selectedObjects={};
	
	//this should only be called if a top level patch
	this.patchLoaded=function(id,obj) {
		if(id) {
			if(this.patch.patchModel.addSubPatch(id,true,obj)) //returns true if everything is loaded
				this.notifyAllPatchListeners("patchLoaded"); //everything loaded, so call patch loaded
		}
	}
	
	//setter for selectedObjects
	this.setSelectedObjects=function(obj) {
		this.selectedObjects[obj["id"]]=obj; //hash by id.
		this.hasSelection=(this.getSelectedObjectsLength())?true:false;	//true if one or more selections.
//		LilyDebugWindow.print("this thing "+this.getSelectedObjectsLength())
	}
	
	//unsetter for selectedObjects
	this.unsetSelectedObjects=function(id) {
		if(typeof this.selectedObjects[id] != "undefined") {
			delete this.selectedObjects[id]; //remove the object.
			this.hasSelection=(this.getSelectedObjectsLength())?true:false;	//true if one or more selections.		
//			LilyDebugWindow.print("this thing "+this.getSelectedObjectsLength());
		}
	}
	
	
	this.refreshSelectedObjects=function() {
		var selObj = this.patch.patchModel.getSelectedObjects();
		for(var i=0;i<selObj.length;i++) {
			this.unsetSelectedObjects(selObj[i]);
			this.setSelectedObjects({
					id:selObj[i],
					color:this.patch.getObj(selObj[i]).color,				
					fontSize:this.patch.getObj(selObj[i]).fontSize,
					fontFace:this.patch.getObj(selObj[i]).fontFamily,
					fontColor:this.patch.getObj(selObj[i]).fontColor,					
					className:this.patch.getObj(selObj[i]).name,
					hideInPerf:this.patch.getObj(selObj[i]).hiddenInPerf
			});
		}
	}
	
	//getter for selectedObjects length
	this.getSelectedObjectsLength=function() {
		var i=0;
		for(var x in this.selectedObjects)
			i++;
		return i;
	}
	
	//getter for selectedObjects property
	this.getSelectedObjectsProperty=function(prop) {
		var prev = null;
		for(var x in this.selectedObjects) {
			if(typeof this.selectedObjects[x][prop]!="undefined") {
				//FIXME *** normalize the font names ***
				var value = (prop=="fontFace" && typeof this.selectedObjects[x][prop]=="string")?this.selectedObjects[x][prop].toLowerCase():this.selectedObjects[x][prop];			
				if(prev!=null&&prev!=value) { //return null if the value isn't the same for all objects
					return null;
				} else {
					prev=value;
				}
			}
		}
		return prev;	
	}
	
	//return array of values for property in selectedObjects 
	this.getSelectedObjectsPropertyArray=function(prop) {
		var arr = [];
		for(var x in this.selectedObjects) {
			if(typeof this.selectedObjects[x][prop]!="undefined") {
				//FIXME *** normalize the font names ***
				var value = (prop=="fontFace" && typeof this.selectedObjects[x][prop]=="string")?this.selectedObjects[x][prop].toLowerCase():this.selectedObjects[x][prop];			
				arr.push(value);
			}
		}
		return arr;	
	}		
	
	//getter for selectedObjects
	this.getSelectedObjects=function(id) {
		return this.selectedObjects[id];
	}	

	//change this use selectedObjects rather than patchListenersSelect
	this.getIsSelection=function() {
		for(var i in this.patchListenersSelect) {	
			if(this.patchListenersSelect[i].length)
				return true;
		}	
		return false;
	}
	
	//get the hasSelection property
	this.getHasSelection=function() {
		return this.hasSelection;
	}
	
//////////////////////////////////////////////////////////////////
	
	//where we store updated font info destined for selected objects
	this.selectedFont={fontFamily:null,fontSize:null,fontColor:null};
		
	//notify objects that are registered for the font changed event.
	this.setFont=function() {
		this.notifyPatchListeners("fontChanged");
		this.refreshSelectedObjects();
		setTimeout(function(){thisPtr.revertFontToDefault();},100); //clear the font after we've notified the listeners.
	}
	
	//return the new font info.
	this.getFont=function() {
		return [this.selectedFont["fontFamily"],this.selectedFont["fontSize"]+("px"),this.selectedFont["fontColor"]];
	}	
	
	//store the new font info.
	this.setSelectedFont=function(name,value) {
		this.selectedFont[name]=value;
	}
	
	//clear new font
	this.revertFontToDefault=function() {
		this.selectedFont["fontFamily"]=null;
		this.selectedFont["fontSize"]=null;
		this.selectedFont["fontColor"]=null;		
	}

//////////////////////////////////////////////////////////////////

	this.selectedColor=this.patch.color; //default
	
	this.setColor=function() {
		this.notifyPatchListeners("colorChanged");
		this.refreshSelectedObjects();
	}	
	
	this.getColor=function() {
		return this.selectedColor;
	}	
	
	this.setSelectedColor=function(value) {
		this.selectedColor=value;
	}
	
///////////////////////////////////////////////////////////////////	

	this.bringForward=function() {
		this.notifyPatchListeners("bringForward");
	}

	this.sendBack=function() {
		this.notifyPatchListeners("sendBack");
	}
	
///////////////////////////////////////////////////////////////////		
		
	this.startConnection=function(id,mode) {	

		if(this.currentConnection)
			return;	
			
		var compatibility=mode||false;
		thisPtr.currentConnection=new LilyConnection(thisPtr.patch);
		thisPtr.currentConnection.setCompatibleConnection(compatibility);	
		thisPtr.currentConnection.start(id);
	}
	
	this.endConnection=function(id) {
	
		if(!this.currentConnection)
			return;
								
		thisPtr.currentConnection.end(id);
		thisPtr.currentConnection=null;
	}
	
	//cancel the connection in progress.
	this.abortCurrentConnection=function() {
		
		if(!this.currentConnection)
			return;
					
		thisPtr.currentConnection.abort();
		thisPtr.currentConnection=null;	
	}
	
	this.okToConnect=function(id) {
		
		var obj=this.patch.getObj(id);
		var objType=obj.getObjectType();
		var currConnection=this.currentConnection;
		var connectID=(currConnection)?(currConnection.outlet+"_"+id):currConnection;
		var isDupe=(this.patch.patchModel.getNode(connectID)!=null);
		
		if(isDupe) //if we already have connection between these two
			return false;		
		
		if(objType=="inlet" && !currConnection)
			return false;
			
		if(objType=="outlet" && currConnection)
			return false;
			
		//only allow vertical connections
		if(objType=="inlet" && currConnection.currentSegment.orientation=="horizontal")
			return false;
			
		return true;
	}
	
///////////////////////////////////////////////////////////////////		
	
	this.deselectAll=function(e) {
		
		if((e && (LilyUtils.selectionModifyingKeyDown(e)||e.type=="selectAll"||e.type=="marqueeSelection")))
			return;
			
//		LilyDebugWindow.print("deselect all");	
	
		//dispatch an event
		this.dispatchMouseEvent(this.patch.patchView.getElByID("canvas"),"mousedown");
	}
	
	this.selectAll=function() {
		this.notifyPatchListeners("selectAll");
	}
	
///////////////////////////////////////////////////////////////////	

	function createObjectOnDblClick(e) {
               
		//bail if we've clicked on an object
		if(e.target.id!="canvas"||!okToCreate)
		        return;         

		//create tmp object
		var o=thisPtr.patch.createObject("tmp",false,parseInt(e.clientY+thisPtr.patch.patchView.oWin.scrollY),parseInt(e.clientX+thisPtr.patch.patchView.oWin.scrollX),null,null);
		o.controller.select(e);
		o.controller.startEditObj();

//		thisPtr.patch.createObject("tmp",false,parseInt(e.clientY),parseInt(e.clientX),null,null);              

		//cancel marquee selection
		thisPtr.marqueeSelection.cancel();              
	}
	
///////////////////////////////////////////////////////////////////	

	//move this to utils
	this.getParentID=function(qualifiedID) {
		if(qualifiedID.indexOf(".")!=-1 && qualifiedID.indexOf("_")==-1) {
			return qualifiedID.substring(0,qualifiedID.indexOf("."));
		} else {	
			return qualifiedID;
		}
	}	

///////////////////////////////////////////////////////////////////			
	
	/**
		Attach listener to a specific object with an id
	*/
	this.attachObserver=function(id,evt,func,mode) {
		
		var pID=this.getParentID(id);	
		
		if(mode=="select") {
			
			if(this.objectListenersSelect[pID]===undefined)
				this.objectListenersSelect[pID]=[];
				
			this.objectListenersSelect[pID].push({"id":id,"evt":evt,"func":func,"mode":mode});
			
		} else {
			
			if(this.objectListeners[pID]===undefined)
				this.objectListeners[pID]=[];			
			
			this.objectListeners[pID].push({"id":id,"evt":evt,"func":func,"mode":mode});
		}			
		
//		LilyDebugWindow.print("add>>> "+id+" "+pID);			
						
		if(mode==thisPtr.getEditable()||mode=="all"||mode=="select")
			this.document.getElementById(id).addEventListener(evt,func,false);
	}
	
	/**
		Removes all Observers attached to an id
	*/
	this.removeAllObserversByID=function(id) {
			
		var pID=this.getParentID(id);
		
//		LilyDebugWindow.print("remove all>>> "+id+" "+pID);		
		
		var selectArr=(this.objectListenersSelect[pID])?this.objectListenersSelect[pID]:[];
		for(var i=0;i<selectArr.length;i++) {
			this.document.getElementById(id).removeEventListener(selectArr[i].evt,selectArr[i].func,false);
		}
		this.objectListenersSelect[pID]=[]; //zero out array
		
		var arr=(this.objectListeners[pID])?this.objectListeners[pID]:[];
		for(var j=0;j<arr.length;j++) {
			this.document.getElementById(id).removeEventListener(arr[j].evt,arr[j].func,false);
		}
		this.objectListeners[pID]=[]; //zero out array
		
	}
	
	/**
		Removes a specific observer
	*/
	//FIXME- function comparison fails with anon funcs for obvious reasons
	this.removeObserver=function(id,evt,func,mode) {
		
		var pID=this.getParentID(id);

	//	LilyDebugWindow.print("> "+pID+" "+" "+evt+" "+mode)
	//	debugger;

		if(mode=="select")
			var arr=(this.objectListenersSelect[pID])?this.objectListenersSelect[pID]:[];
		else 
			var arr=(this.objectListeners[pID])?this.objectListeners[pID]:[];

	//	LilyDebugWindow.print("> before "+arr.length)	

		//need to add code to remove event listeners
		for(var i=0;i<arr.length;i++) {
//			LilyDebugWindow.print("try to remove patch listener " + id + " " + evt + " " + func.toSource().substring(0,40));
				//2-13-07. changed the way functions are compared when removing observers- need keep an eye on this as it could break shit...
			if(arr[i].evt==evt && (arr[i].func===func)) {
//				LilyDebugWindow.print("remove patch listener " + id + " " + evt + " " + func.toSource().substring(0,40));			
				this.document.getElementById(id).removeEventListener(arr[i].evt,arr[i].func,false);			
				arr.splice(i,1);
				break;
			}
		}

	//	LilyDebugWindow.print("> after "+arr.length)			

		if(mode=="select")
			this.objectListenersSelect[pID]=arr;
		else
			this.objectListeners[pID]=arr;		
		
	}

//////////////////////////////////////////////////////////////////

	/**
		Attach listener to the patch document.
	*/
	this.attachPatchObserver=function(id,evt,func,mode) {
		
		var pID=this.getParentID(id);	
		
		if(mode=="select") {
			
			if(this.patchListenersSelect[pID]===undefined)
				this.patchListenersSelect[pID]=[];
				
			this.patchListenersSelect[pID].push({"id":id,"evt":evt,"func":func,"mode":mode});
			
		} else {
			
			if(this.patchListeners[pID]===undefined)
				this.patchListeners[pID]=[];			
			
			this.patchListeners[pID].push({"id":id,"evt":evt,"func":func,"mode":mode});
		}
		
//		LilyDebugWindow.print("id >>> "+id +" parent-id >>> "+this.getParentID(id))	

		if(mode==thisPtr.getEditable()||mode=="all"||mode=="select")
			this.document.addEventListener(evt,func,false);
	}
	
	/**
		Removes all patch observers set by an id
	*/
	this.removeAllPatchObserversByID=function(id) {		
		//debugger;
		
		var pID=this.getParentID(id);		
		
		var selectArr=(this.patchListenersSelect[pID])?this.patchListenersSelect[pID]:[];
		for(var i=0;i<selectArr.length;i++) {
			this.document.removeEventListener(selectArr[i].evt,selectArr[i].func,false);
		}
		this.patchListenersSelect[pID]=[];
		
		var arr=(this.patchListeners[pID])?this.patchListeners[pID]:[];
		for(var j=0;j<arr.length;j++) {
			this.document.removeEventListener(arr[j].evt,arr[j].func,false);
		}
		this.patchListeners[pID]=[];
					
	}
	
	/**
		Removes a specific patch observer
	*/
	this.removePatchObserver=function(id,evt,func,mode) {
		
		var pID=this.getParentID(id);
	
//		LilyDebugWindow.print("> "+pID+" "+" "+evt+" "+mode)
//		debugger;
		
		if(mode=="select")
			var arr=(this.patchListenersSelect[pID])?this.patchListenersSelect[pID]:[];
		else 
			var arr=(this.patchListeners[pID])?this.patchListeners[pID]:[];
			
//		LilyDebugWindow.print("> before "+arr.length)	
					
		//need to add code to remove event listeners
		for(var i=0;i<arr.length;i++) {
				//LilyDebugWindow.print("try to remove patch listener " + id + " " + evt);
			if(arr[i].evt==evt && arr[i].func.toSource()==func.toSource()) {
//				LilyDebugWindow.print("remove patch listener " + id + " " + evt);			
				this.document.removeEventListener(arr[i].evt,arr[i].func,false);			
				arr.splice(i,1);
				break;
			}
		}
		
//		LilyDebugWindow.print("> after "+arr.length)			
		
		if(mode=="select")
			this.patchListenersSelect[pID]=arr;
		else
			this.patchListeners[pID]=arr;
			
	}	

///////////////////////////////////////////////////////////////////	

	
	function toggleEditStateOnClick(e) {
		if(LilyUtils.controlOrCommand(e)&&e.target.id=="canvas") {
			Lily.toggleEdit();
		}
	}


	this.toggleEditState=function() {
		var mode=thisPtr.getEditable();
		thisPtr.togglePatchListeners(mode);
		thisPtr.toggleObjectListeners(mode);		
	}

	this.toggleObjectListeners=function(mode) {
		
//		LilyDebugWindow.print("toggleObjectListeners- mode:" + mode)		
		
		for(var i in this.objectListeners) {	
			if(this.objectListeners[i].length) {
				for(var j=0;j<this.objectListeners[i].length;j++) {
					
//					LilyDebugWindow.print("toggleObjectListeners mode:"+ mode + " i:" + i + " length:" + this.objectListeners[i].length + " " + this.objectListeners[i][j].mode);					
					
					if(this.objectListeners[i][j].mode==mode && this.document.getElementById(this.objectListeners[i][j].id))
						this.document.getElementById(this.objectListeners[i][j].id).addEventListener(this.objectListeners[i][j].evt,this.objectListeners[i][j].func,false);//
					else if(this.objectListeners[i][j].mode!="all" && this.document.getElementById(this.objectListeners[i][j].id))
						this.document.getElementById(this.objectListeners[i][j].id).removeEventListener(this.objectListeners[i][j].evt,this.objectListeners[i][j].func,false);//
				
				} 
			}			
		}
	}
	
	this.togglePatchListeners=function(mode) {

//		LilyDebugWindow.print("togglePatchListeners- mode:" + mode)

		for(var i in this.patchListeners) {	
			if(this.patchListeners[i].length) {
				for(var j=0;j<this.patchListeners[i].length;j++) {
					
//					LilyDebugWindow.print("togglePatchListeners mode:"+ mode + " i:" + i + " length:" + this.patchListeners[i].length + " " + this.patchListeners[i][j].mode);
					
					if(this.patchListeners[i][j].mode==mode)
						this.document.addEventListener(this.patchListeners[i][j].evt,this.patchListeners[i][j].func,false);//
					else if(this.patchListeners[i][j].mode!="all")
						this.document.removeEventListener(this.patchListeners[i][j].evt,this.patchListeners[i][j].func,false);//
				
				} 
			}			
		}		
	}	
	
///////////////////////////////////////////////////////////////////	

	this.toggleEditable=function() {
				
		if(thisPtr.getEditable()=="edit") {
			thisPtr.setEditable("performance");
		} else {
			thisPtr.setEditable("edit");
		}	
	}
	
	this.setEditable=function(mode)	{
		
		thisPtr.editable=mode;
		thisPtr.deselectAll(null);
 		thisPtr.notifyPatchListeners("editabilityChange");

		if(mode=="performance") {
			thisPtr.patch.patchView.setWindowStatusIcon("locked");
			thisPtr.patch.patchView.setTempWindowStatus("Patch Locked.",1000);
			if(!thisPtr.patch.readonly)
				thisPtr.patch.patchView.setWindowStatusTooltip("Patch is locked for performance. Click to unlock.");
			else
				thisPtr.patch.patchView.setWindowStatusTooltip("Read only.");		
		} else {
			thisPtr.patch.patchView.setWindowStatusIcon("unlocked");
			thisPtr.patch.patchView.setTempWindowStatus("Patch Unlocked.",1000);
			thisPtr.patch.patchView.setWindowStatusTooltip("Patch is unlocked for editing. Click to lock.");						
		}
	}
	
	this.getEditable=function(){return thisPtr.editable;}		

///////////////////////////////////////////////////////////////////	

	this.notifyAllPatchListeners=function(e) {
		var patchArr = thisPtr.patch.patchModel.subPatchArray;
		for(var x  in patchArr) {
			if(patchArr[x].obj && patchArr[x].obj.patchView) {
				var p = patchArr[x].obj.patchView;			
				try {
					var evt = p.document.createEvent("Event");			
					evt.initEvent(e, true, false);				
					p.document.dispatchEvent(evt);		
				} catch(e) {}	
			}					
		}
	}
	
	this.notifyPatchListeners=function(e) {	
		var evt = thisPtr.document.createEvent("Event");			
		evt.initEvent(e, true, false);
		try {
			thisPtr.document.dispatchEvent(evt);	
		} catch(e) {}
		
	}
	
	this.dispatchMouseEvent=function(obj,e) {
		var evt = document.createEvent("MouseEvents");
		//add a detail of 1
  		evt.initMouseEvent(e,false,true,thisPtr.xulWin,0,0,0,0,0,false,false,false,false,0,obj);
		evt["dispatched"]=true; //add custom prop
  		obj.dispatchEvent(evt);
	}

///////////////////////////////////////////////////////////////////

	/**
		Grab the mouse position for each mousedown- useful for initializing 
		drag operations where we don't have access to the event.
	*/
	this.updateMousePosition=function(e) {
		thisPtr.mouseX=e.clientX;
		thisPtr.mouseY=e.clientY;
		mouseDownTime=new Date();		
	}
	
	/**
		Get the mouse position for the last mousedown.
	*/
	this.getLastMouseDown=function() {
		return [thisPtr.mouseX,thisPtr.mouseY];
	}

	/**
	*/
	this.updateMouseAction=function(e) {
		var mouseUpTime=new Date();
		var diff=mouseUpTime.getTime()-mouseDownTime.getTime();
		if(diff>300) {
			okToCreate=false;
			setTimeout(function(){okToCreate=true;},1000);
		}
	}	
	
///////////////////////////////////////////////////////////////////	

	this.marqueeSelection=new function(parent) {
		
		this.draggable=false;
		this.patchController=parent;
		this.patch=parent.patch;
		this.marquee={};
		this.startX=0;
		this.startY=0;
		this.endX=0;
		this.endY=0;
		this.objArr=[];
		this.marqueeNode=null;
		var thisPtr=this;
		var thisEvent={type:"marqueeSelection",detail:1}; //fake event		

		this.mousemove=function(e) {
							
			var x=thisPtr.marquee["endX"]=parseInt(e.clientX+thisPtr.patch.patchView.oWin.scrollX);
			var y=thisPtr.marquee["endY"]=parseInt(e.clientY+thisPtr.patch.patchView.oWin.scrollY);				
			
			//might need to throttle this somehow
			thisPtr.calculateSelection();
		}
		
		this.calculateSelection=function() {
			
			//set up vars for the marquee boundries
			var mLeft=(thisPtr.marquee.startX<thisPtr.marquee.endX)?thisPtr.marquee.startX:thisPtr.marquee.endX;
			var mTop=(thisPtr.marquee.startY<thisPtr.marquee.endY)?thisPtr.marquee.startY:thisPtr.marquee.endY;		
			var mRight=(thisPtr.marquee.endX>thisPtr.marquee.startX)?thisPtr.marquee.endX:thisPtr.marquee.startX;
			var mBottom=(thisPtr.marquee.endY>thisPtr.marquee.startY)?thisPtr.marquee.endY:thisPtr.marquee.startY;
						
			//iterate thru the objects & select if needed
			for(var i=0;i<thisPtr.objArr.length;i++) {
				
				var obj=thisPtr.patch.getObj(thisPtr.objArr[i].id); //cache 'em
				var objLeft=thisPtr.objArr[i].left;
				var objTop=thisPtr.objArr[i].top;
				var objRight=thisPtr.objArr[i].left+thisPtr.objArr[i].width;
				var objBottom=thisPtr.objArr[i].top+thisPtr.objArr[i].height;
								
				if((((objLeft>mLeft) && (objLeft<mRight)) || ((objRight>mLeft) && (objRight<mRight))) && (((objTop>mTop) && (objTop<mBottom)) || ((objBottom>mTop) && (objBottom<mBottom)))) {
					obj.controller.select(thisEvent); //we have a selection, so select
				} else if(obj.controller.isSelected && !obj.controller.objDrag.isDraggable){
					obj.controller.deselect(); 	//otherwise deselect
				}
			}
			thisPtr.updateMarqueeView(mLeft,mTop,mRight,mBottom);				
		}
		
		this.createMarqueeView=function() {
			
			if(!thisPtr.node) {
				thisPtr.node=thisPtr.patch.patchView.displayHTML("");
				thisPtr.node.style.position="absolute";
				thisPtr.node.style.zIndex=0;
				thisPtr.node.style.left=thisPtr.marquee.startX+"px";
				thisPtr.node.style.top=thisPtr.marquee.startY+"px";
				thisPtr.node.style.height=0+"px";
				thisPtr.node.style.width=0+"px";
				thisPtr.node.style.background="black";
				thisPtr.node.style.opacity=.10;		
			}		
		}
		
		this.updateMarqueeView=function(left,top,right,bottom) {
			if(thisPtr.node) {
				thisPtr.node.style.left=left+"px";
				thisPtr.node.style.top=top+"px";
				thisPtr.node.style.width=(right-left)+"px";
				thisPtr.node.style.height=(bottom-top)+"px";
			}	
		}		
		
		this.removeMarqueeView=function() {
			if(thisPtr.node) {
				thisPtr.patch.patchView.removeElement(thisPtr.node);
				thisPtr.node=null;
			}
		}

		this.cancel=function() {
			thisPtr.mouseup();
		}
		
		this.mousedown=function(e) {
			
			//bail if we've clicked on an object
			if(e.target.id!="canvas"||e.dispatched||thisPtr.draggable)
				return;
					
			var x=thisPtr.marquee["startX"]=parseInt(e.clientX+thisPtr.patch.patchView.oWin.scrollX);
			var y=thisPtr.marquee["startY"]=parseInt(e.clientY+thisPtr.patch.patchView.oWin.scrollY);			
			thisPtr.objArr=thisPtr.patchController.patch.patchModel.getObjectCoords();

			thisPtr.createMarqueeView();							
			thisPtr.patchController.attachPatchObserver(thisPtr.patchController.pID,"mousemove",thisPtr.mousemove,"edit");
			
			thisPtr.draggable=true;		
		}
		
		this.mouseup=function(e) {
			
			if(!thisPtr.draggable)
				return;
			
			thisPtr.marquee={};
			thisPtr.removeMarqueeView();			
			thisPtr.patchController.removePatchObserver(thisPtr.patchController.pID,"mousemove",thisPtr.mousemove,"edit");
			
			thisPtr.draggable=false;								
		}

	}(this);

///////////////////////////////////////////////////////////////////
	
	//this handlers work only for the patch windows- need some keypress handlers for the main window- for new & open commands
/*
	this.patchKeypress=function(e)	{			
		switch(e.which)	{							
			case 101:
				if(LilyUtils.controlOrCommand(e)) {	//if the right modifiers are down...
					e.preventDefault(); //on windows prevent web search window from popping up.					
					thisPtr.toggleEditable(); //toggle the edit state
				}
				break;
		}
	}
*/

	//use the patch id since these are a permanent part of the patch.
	this.addDefaultPatchListeners=function() {			
//		this.attachPatchObserver(this.pID,"keypress",this.patchKeypress,"all");
		//this.attachPatchObserver(this.pID,"mousedown",function(event){event.preventDefault();},"all");
		this.attachPatchObserver(this.pID,"editabilityChange",this.toggleEditState,"all");
		this.attachPatchObserver(this.pID,"mousedown",this.updateMousePosition,"edit");
		this.attachPatchObserver(this.pID,"mouseup",this.updateMouseAction,"edit");		
		this.attachPatchObserver(this.pID,"mousedown",this.marqueeSelection.mousedown,"edit");
		this.attachPatchObserver(this.pID,"mouseup",this.marqueeSelection.mouseup,"edit");		
		this.attachPatchObserver(this.pID,"dblclick",createObjectOnDblClick,"edit");
		this.attachPatchObserver(this.pID,"click",toggleEditStateOnClick,"all");
	}
				
}

/**
*	Construct a new PatchView
*	@class top level class for the patch object
*	@constructor
*/
function LilyPatchView(pID,parent,extWin) 
{			
	this.patch=parent;
	this.controller=null;
	
	var thisPtr=this;		
	
	//some pointers into the patch window that are filled in during inits
	this.xulWin=null;	//chrome xul window
	this.oWin=null; //browser content window
	this.chromeWin=null; //browsers chrome window
	this.statusBar=null; //status bar
	this.statusBarIcon=null; //icon status bar	
	this.document=null;
	this.body=null;
	this.head=null;	
	
	//setup patch width variables
	var winWidth=this.patch.width;
	var winHeight=this.patch.height;
	
	/**
	*	takes an html string & displays it as innerHTML as a div- returns a reference to the parent div.
	*/
	this.displayHTML=function(HTML,id,top,left,mode,nodeID) {
		
		var parentNode=(this.getElByID(nodeID))?this.getElByID(nodeID):this.body
		var divWrapper=this.document.createElement("div");
			
		if(mode) { //true if creating an object
			divWrapper.setAttribute("id",id);
			divWrapper.setAttribute("class","vanillaObj"); 
			divWrapper.style.position='absolute';
			divWrapper.style.left=left+"px";
			divWrapper.style.top=top+"px";
		}
		
		divWrapper.innerHTML=HTML;
		parentNode.appendChild(divWrapper);
		return divWrapper;
	}
	
	/**
	*	Creates a root SVG element in the document- returns a reference to that element.
	*/
	this.createSVG=function(id,nodeID) {
		
		var svgns = "http://www.w3.org/2000/svg";
		var parentNode=(this.getElByID(nodeID))?this.getElByID(nodeID):this.body
		var svgWrapper=this.document.createElementNS(svgns,"svg");
		var svgID=id||null;
		
		if(svgID)
			svgWrapper.setAttributeNS(null,"id",svgID);
		
		parentNode.appendChild(svgWrapper);
		return svgWrapper;
	}
	
	/**
	*	Creates an SVG element as a child of a root SVG element- returns a reference to that element.
	*/	
	this.displaySVG=function(element,attributes,parent) {
		//
	}
	
	this.addInclude=function(type,url) {
		if(type.indexOf("css")!=-1) {
			var includeEl = this.document.createElement("link");
			
			if(url)
				includeEl.setAttribute("href",url);
			
			includeEl.setAttribute("type",type);
			includeEl.setAttribute("rel","StyleSheet");
			this.head.appendChild(includeEl);
			return includeEl;
		} else if(type.indexOf("javascript")!=-1){
			var includeEl = this.document.createElement("script");
			
			if(url)
				includeEl.setAttribute("src",url);
			
			includeEl.setAttribute("type",type);
			this.head.appendChild(includeEl);
			return includeEl;	
		}
		return null;
	}
	
	this.getElByID=function(id) {
		return this.document.getElementById(id);
	}	
	
	this.removeElement=function(el) {
						
		try {
			this.body.removeChild(el);	
		} catch(e) {
			//in space no one can hear you scream...
		}

	}
	
	//return calculated position of an object
	this.findPos=function(obj) {
		return LilyUtils.getObjectPos(obj);
	}
	
	//set the patch title
	this.setPatchTitle=function(title) {
		var patch_title=(/-help/.test(title))?title.replace(/dot/,"."):title; //if its a help patch, replace "dot" with "."
		this.oWin.document.title=patch_title;
		this.xulWin.title=patch_title;
		this.patch.title=patch_title;
	}
	
	//FF doesn't honor this- no effect.
	this.makeWindowResizable=function(bool) {
		this.xulWin.setResizable(LilyUtils.convertType(bool));
	}
	
	//update the patch size properties on resize
	this.updateWinSize=function(e) {
		thisPtr.patch.height=thisPtr.xulWin.outerHeight;
		thisPtr.patch.width=thisPtr.xulWin.outerWidth;
//		LilyDebugWindow.print(thisPtr.patch.height+" "+thisPtr.patch.width)
	}
	
	//wrap resize to
	this.setPatchSize=function(x,y) {
		this.oWin.resizeTo(x,y);
	}
	
	//set the canvas color
	this.setPatchColor=function(color) {
		thisPtr.canvas.style.background=color;
		thisPtr.patch.color=color;
	}
	
	//set the font face
	this.setPatchFontFamily=function(family) {
		this.body.style.fontFamily=LilyUtils.getCompatibleFont(font);
	}
	
	//set the font size
	this.setPatchFontSize=function(size) {
		this.body.style.fontSize=LilyUtils.sizeFontForPlatform(size);
	}
	
	this.setWindowStatusIcon=function(state) {		
		if(state=="locked")
			this.statusBarIcon.setAttribute("src","chrome://lily/content/images/lock.png");
		else
			this.statusBarIcon.setAttribute("src","chrome://lily/content/images/lock_open.png");		
	}
	
	this.setWindowStatusTooltip=function(txt) {		
		this.statusBarIcon.setAttribute("tooltiptext",txt);
	}	
	
	this.setTempWindowStatus=function(txt,time) {
		this.setWindowStatusText(txt);
		setTimeout(function(){thisPtr.clearWindowStatusText();},time);
	}	
		
	this.setWindowStatusText=function(txt) {
		try {
			this.statusBar.setAttribute("label",txt);	
		} catch(e) {}
	}
	
	this.clearWindowStatusText=function() {
		try {
			this.statusBar.setAttribute("label","");
		} catch(e) {}
	}
	
	this.displayPatchDialog=function(str,color) {
		var width=Math.floor(this.patch.width/1.33);	
		return LilyUtils.toggleMessageDialog(thisPtr.oWin,str,width,color);
	}
		
	this.displayHelpDialog=function() {
		LilyUtils.readAsyncFromURL("chrome://lily/content/help-patches/help.html",function(str){
			thisPtr.displayPatchDialog(str.replace(/ACCEL/g,LilyUtils.getAccelText()),null);
		});
	}
	
	this.displayFirstTimeScreen=function() {
		if(LilyUtils.getBoolPref("extensions.lily.showFirstTimeHelp")) {
			LilyUtils.readAsyncFromURL("chrome://lily/content/help-patches/firsttime.html",function(str){
				var tmp = thisPtr.displayPatchDialog(str,null);
				tmp.message.getElementsByTagName("input")[0].addEventListener("click",function(e) {
					if(e && e.target && typeof e.target.checked!="undefined") {
						LilyUtils.setBoolPref("extensions.lily.showFirstTimeHelp",e.target.checked);
						//LilyDebugWindow.print("set pref to "+e.target.checked);
					}
				},false);
			});
		}
	}
	
	function initSidebar(sidebar) {
		
		//LilyDebugWindow.print("init sidebar...")
		
		thisPtr.xulWin=sidebar.parent;		
		
		//setup some pointers into the patch window
		thisPtr.chromeWin=sidebar.win//
		thisPtr.oWin=sidebar.win.contentWindow;

		thisPtr.document=thisPtr.oWin.document;
		thisPtr.body=thisPtr.oWin.document.getElementById("bodyElement");
		thisPtr.head=thisPtr.oWin.document.getElementById("headElement");

		thisPtr.statusBar={setAttribute:function(){}};//
		thisPtr.statusBarIcon={setAttribute:function(){}}; //window.status;//

		//pass the window refs to the controller
		thisPtr.controller.oWin=thisPtr.oWin;
		thisPtr.controller.xulWin=thisPtr.oWin;		
		thisPtr.controller.document=thisPtr.document;

		//add a css include
		thisPtr.addInclude("text/css","chrome://lily/content/lily.css");

		//add the background canvas
		thisPtr.canvas=thisPtr.displayHTML("");
		thisPtr.canvas.setAttribute("class","canvas");
		thisPtr.canvas.setAttribute("name","canvas");
		thisPtr.canvas.setAttribute("id","canvas");	
		thisPtr.canvas.addEventListener("mousedown",LilyUtils.preventDefault,false); //stop contextual menu

		//add patch listeners
		//thisPtr.controller.addDefaultPatchListeners();
		//adding editability mode listener here instead of calling adddefaultlisteners...
		thisPtr.controller.attachPatchObserver(thisPtr.controller.pID,"editabilityChange",thisPtr.controller.toggleEditState,"all");		

		//if theres a callback, do it now
		if(typeof thisPtr.patch.callback=="function")
			thisPtr.patch.callback();
	}
	
	function initIframe() {
		
		extWin.win.removeEventListener("load",initIframe,true);
				
		thisPtr.xulWin=extWin.parent;
		
		//setup some pointers into the patch window
		thisPtr.chromeWin=extWin.win.contentWindow;
		thisPtr.oWin=extWin.win.contentWindow;

		thisPtr.document=thisPtr.oWin.document;
		thisPtr.body=thisPtr.oWin.document.getElementById("bodyElement");
		thisPtr.head=thisPtr.oWin.document.getElementById("headElement");

		thisPtr.statusBar=thisPtr.xulWin.document.getElementById("lilyStatusPanel")||{setAttribute:function(){}};;
		thisPtr.statusBarIcon=thisPtr.xulWin.document.getElementById("lilyIconPanel")||{setAttribute:function(){}};;

		//pass the window refs to the controller
		thisPtr.controller.oWin=thisPtr.oWin;
		thisPtr.controller.xulWin=thisPtr.oWin;		
		thisPtr.controller.document=thisPtr.document;

		//add a css include
		thisPtr.addInclude("text/css","chrome://lily/content/lily.css");

		//add the background canvas
		thisPtr.canvas=thisPtr.displayHTML("");
		thisPtr.canvas.setAttribute("class","canvas");
		thisPtr.canvas.setAttribute("name","canvas");
		thisPtr.canvas.setAttribute("id","canvas");	
		thisPtr.canvas.addEventListener("mousedown",LilyUtils.preventDefault,false); //stop contextual menu

		//add patch listeners
		thisPtr.controller.addDefaultPatchListeners();

		//if theres a callback, do it now
		if(typeof thisPtr.patch.callback=="function")
			thisPtr.patch.callback();

	}
	
	function initReadOnlyWindow() {

		//call the common init functions.
		patchInit();
		
		//adding editability mode listener here instead of calling adddefaultlisteners...
		thisPtr.controller.attachPatchObserver(thisPtr.controller.pID,"editabilityChange",thisPtr.controller.toggleEditState,"all");
				
		//if theres a callback, do it now
		if(typeof thisPtr.patch.callback=="function")
			thisPtr.patch.callback();
			
		//focus
		setTimeout(function(){thisPtr.xulWin.focus();},100);		
	
	}	
				
	function initWindow() {

		//call the common init functions.
		patchInit();
				
		//window listener for contextmenu event
		thisPtr.oWin.addEventListener("contextmenu",LilyMenuBar.onContextMenu,false); //move this function.
		//preload the font menus
		setTimeout(function(){LilyMenuBar.initFontMenus(thisPtr.xulWin)},2000);		
				
		//add patch listeners
		thisPtr.controller.addDefaultPatchListeners();
		
		//set the initial paste cmd
		LilyMenuBar.setEditCommands(false);
		
		//if theres a callback, do it now
		if(typeof thisPtr.patch.callback=="function")
			thisPtr.patch.callback();

		//focus	
		setTimeout(function(){thisPtr.xulWin.focus();},100);
		
	}
	
	function patchInit() {
		
		//setup some pointers into the patch window
		thisPtr.chromeWin=thisPtr.xulWin.document.getElementById("browserElement");
		thisPtr.oWin=thisPtr.xulWin.document.getElementById("browserElement").contentWindow;
		
		thisPtr.document=thisPtr.oWin.document;
		thisPtr.body=thisPtr.oWin.document.getElementById("bodyElement");
		thisPtr.head=thisPtr.oWin.document.getElementById("headElement");
		
		thisPtr.statusBar=thisPtr.xulWin.document.getElementById("lilyStatusPanel");
		thisPtr.statusBarIcon=thisPtr.xulWin.document.getElementById("lilyIconPanel");
								
		//pass the window refs to the controller
		thisPtr.controller.oWin=thisPtr.oWin;
		thisPtr.controller.xulWin=thisPtr.oWin;		
		thisPtr.controller.document=thisPtr.document;

		//add a css include
		thisPtr.addInclude("text/css","chrome://lily/content/lily.css");

		//add the background canvas
		thisPtr.canvas=thisPtr.displayHTML("");
		thisPtr.canvas.setAttribute("class","canvas");
		thisPtr.canvas.setAttribute("name","canvas");
		thisPtr.canvas.setAttribute("id","canvas");	
		thisPtr.canvas.addEventListener("mousedown",LilyUtils.preventDefault,false); //stop contextual menu
		
		//resize window listener for resize event
		thisPtr.oWin.addEventListener("resize",thisPtr.updateWinSize,false);
			
	}	
		
	//standard patch	
	if(!this.patch.hidden && !this.patch.readonly && !extWin)	{
		var tmp_coords = LilyUtils.getOpenDialogOffset(winWidth,winHeight);	
		this.xulWin=window.openDialog("chrome://lily/content/patch.xul", pID,"width="+winWidth+",height="+winHeight+",left="+tmp_coords[0]+",top="+tmp_coords[1]+",menubar=yes,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=yes,chrome=yes",initWindow,pID);	
	//hidden patch
	} else if(this.patch.hidden && !extWin) {
		var iframe = document.getElementById("lilyHiddenIframe");
		extWin = {type:"iframe",win:iframe,parent:iframe.contentWindow};
		extWin.win.addEventListener("load",initIframe,true);
		extWin.win.contentWindow.location.href="chrome://lily/content/patch.xhtml";
		//this.xulWin=window.openDialog("chrome://lily/content/hiddenpatch.xul", pID,"",initReadOnlyWindow,pID);	//hidden patch	
	} else if(this.patch.readonly && !extWin) {
		var tmp_coords = LilyUtils.getOpenDialogOffset(winWidth,winHeight);		
		this.xulWin=window.openDialog("chrome://lily/content/readonlypatch.xul", pID,"width="+winWidth+",height="+winHeight+",left="+tmp_coords[0]+",top="+tmp_coords[1]+",menubar=yes,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=yes,chrome=yes",initReadOnlyWindow,pID);
	//patch in iframe
	} else if(extWin && extWin.type=="iframe") {
		extWin.win.addEventListener("load",initIframe,true);
		extWin.win.contentWindow.location.href="chrome://lily/content/patch.xhtml";
	//patch in sidebar
	} else if(extWin && extWin.type=="sidebar") {			
		document.getElementById("lilyHorizontalSideBar").setAttribute("src","chrome://lily/content/patch.xhtml");
		//FIXME - can't remove the above event listener for some reason- resorting to settimeout.	
		setTimeout(function(){
			initSidebar(extWin); //init when the sidebar is loaded
		},100);
	}
}