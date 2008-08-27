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
			replaceWithSame - true if we're deleting as part of a replace operation
	*/		
	//delete object
	this.deleteObject=function(objID,replaceWithSame) { 
		
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
			
			/*
				FIXME: because i'm doing a string compare on the json to see if a patch has changed (because i _think_ its 
				faster), i want to reuse the reference in the model if i'm just replacing an object so it won't affect the way 
				the patch serializes...
			*/
			if(!replaceWithSame) this.patchModel.removeNode(objID);  //remove ref to node from model
			
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
			name			- external name. (required)
			pID 			- subpatch ID.  (optional) //FIXME this should go away.
			t 				- top in pixels. (optional)
			l 				- left in pixels (optional)
			id				- object id (optional)
			args			- object args as a string (optional)
			resizeFlag		- true if the object has been resized
			replaceWithSame	- true if we're replacing with the same extern.
		
		Returns: 
			returns the created object instance.
	*/			
	//create object- args: className, top, left, objID, variable_length_arguments_to_obj //only the first arg is required.
	this.createObject=function(name,pID,t,l,id,args,resizeFlag,replaceWithSame) {
				
		if(this.getObj(id) && !replaceWithSame)
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
			
			//call this only if we're not part of patch creation. if we'll opening a patch we'll call init there.
			if(this.createObject.caller.name!="openPatch") o.init(); //generic- user defined
			
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
		var replaceWithSame=(oldObj.controller.objView.display==newObjName);		
		var newID=replaceWithSame?id:null;
		
		//if we're just modifying the args, grab the old connections
		if(saveConnections)
			var savedConnections=this.saveConnections(id);
		
		//delete object we're replacing
		this.deleteObject(id,replaceWithSame);
		
		//create new object
		var o=this.createObject(newObjName,null,y,x,newID,args,null,replaceWithSame);
				
		//if we're recreating the same extern
		if(replaceWithSame) {
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
		Method: openHidden
			open an existing patch as hidden.
	
		Arguments: 
			path	- path to patch (required)
			
		Returns: 
			returns the newly created patch object.		
	*/
	//open an existing patch window.
	this.openHidden=function(path) {
		
		var fPath=LilyUtils.getFilePath(path);
		var file=(fPath)?LilyUtils.getFileHandle(fPath):null;
		
		if(file)
			return Lily.openPatchFromFile(file,true,true);
		else
			LilyDebugWindow.error("error- patch not found.");
	}	
	
	/*
		Method: openReadOnly
			open an existing patch as readonly.
	
		Arguments: 
			path	- path to patch (required)
			
		Returns: 
			returns the newly created patch object.		
	*/
	//open an existing patch window.
	this.openReadOnly=function(path) {
		
		var fPath=LilyUtils.getFilePath(path);
		var file=(fPath)?LilyUtils.getFileHandle(fPath):null;
		
		if(file)
			return Lily.openPatchFromFile(file,true,false);
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
	this.openPatch=function openPatch(patchStr,id,pID,fileName,patchDir) {
		
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

					if(opID) {
						o.isPaste=true; //set the flag so this doesn't get deselected.
					}

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
					
					if(opID && !this.patchController.isMouseDown) {
						o.controller.select({type:"paste"}); //if we're pasting, select the object after we create it.
					}
					
					o.init(); //generic- user defined- call this again...
					
				}
			}
		
			for(var a in oArray) {//2nd pass- make connections		
				if(oArray[a].type=="connection") {
					var c=this.createConnection(this.updateObjID(oArray[a].inlet,opID),this.updateObjID(oArray[a].outlet,opID),oArray[a].segmentArray,subPatchID);

					if(c && typeof oArray[a].hiddenInPerf!="undefined"){
						c.controller.setHiddenInPerf(oArray[a].hiddenInPerf);
					}
					
					if(opID && !this.patchController.isMouseDown) {
						c.controller.select({type:"paste"});
					}						
					
				}
			}
		
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
			if(!thisPtr.patchController.isMouseDown)thisPtr.patchController.deselectAll()
			var id=this.generateUID(); //new id
			thisPtr.openPatch(Lily.clipboard,id);
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