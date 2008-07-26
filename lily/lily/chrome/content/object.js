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
*	Base class for a new Object
*	@class
*	@constructor
*/
function LilyObjectBase(name,parent,pID,top,left,id,args)
{
	this.type="object"; //			
	this.parent=parent; //pointer to patch
	this.name=name; //classname
	this.displayName=LilyUtils.getObjectMetaData(name).textName;
	this.subPatcherID=pID||null //patch id if created as part of a sub-patch
	this.objID=id; //object id
	this.top=top; //position in patch
	this.left=left; //pos
	this.color="#FFFFFF"; //color 
	this.fontSize=this.parent.fontSize; //font size
	this.fontFamily=this.parent.fontFamily; //font family
	this.fontColor="#000000"; //font color- maps to style property "color"	
	this.hiddenInPerf=false;
	this.opacity=1.0; //transparency
	this.zIndex=1; //zindex
	this.visibility="visible"; //visibility
	this.width=null; //width
	this.height=null; //height
	this.args=args||""; //arguments the object was created with
	this.groupName=(args.match(/@@\S*/))?args.match(/@@\S*/).toString().replace(/@@/,''):""; //group id if it exists- otherwise null	
	this.cssName="";
	this.customColor=false; //if true then the color is saved.
	this.resetSize=true; //should we reset the object size and reflow on font size changes, etc
	this.allowFont=true; //allow the font family/size/color changes
	this.allowColor=true; //allow color changes			
	this.resize=true; //should the object be resizable
	this.displayArgs=true; //should we see objects arguments (for non-UI objects only)
	this.loadsSubPatchByName = false; //true when a subpatch is invoked by name
	this.hasBeenResized=false; //true when an extern has resized by hand.
	this.isPaste=false; //true if we're creating this as a paste
	
	this.ui=null; //to filled in when view instantiates
	this.document=null; //ditto
	this.win=null; //ditto
	this.view=null; //ditto

	this.inletArray=[];
	this.outletArray=[];
	
	var thisPtr=this;
	
	this.toString=function() {
		return "[object Lily"+ LilyUtils.titleCase(this.name) +"External]";
	}	
			
	this.getObjectType=function() {
		return this.type;
	}
	
	this.getIsSelected=function() {
		return this.controller.isSelected;
	}
	
	this.setArgs=function(newArgs) {
		this.args=newArgs;
	}
	
	this.init=function() {
		//user should override this if they need it- called after the ui is rendered
	}
	
	this.getPosition=function() {
		return this.view.getCurrentPosition();
	}
	
	//set group name property
	this.setGroupName=function(name) {
		this.groupName=name;
		thisPtr.parent.patchController.notifyPatchListeners("patchModified");		
	}
	
	//set group name property
	this.setCSSName=function(name) {
		if(name.length) {
			this.ui.objViewNode.className=name;
			this.displayElement.className=name;
			this.cssName=name;
		}
	}
	
	//set group name property
	this.setCustomColor=function(val) {
		if(val=="true") {
			this.customColor=true;
		} else {
			this.customColor=false;	
		}
	}
	
	//set the perm color
	this.setPermColor=function(color) {
		this.setColor(color,true);
	}			
	
	//color
	this.setColor=function(color, perm) {
		
		if(color && this.allowColor) {
			
			if(this.ui.inputWrapper && typeof color!="undefined")	
				this.ui.inputWrapper.style.background=color;

			if(this.displayElement) {//update custom ui

				if(this.displayElement.getAttribute("style").indexOf("fill")!=-1)
					this.displayElement.setAttribute("style","fill:"+color)
				else
					this.displayElement.style.backgroundColor=color;

			}

			this.color=color;

			if(perm||false)
				this.customColor=true; //
						
		}
			
	}
	
	//font color
	this.setFontColor=function(color) {
		
		if(color && this.allowColor) {
			var ui=this.controller.objView.getInputWrapper();

			if(ui && typeof color!="undefined")	
				ui.style.color=color;
				
			this.fontColor=color;				

			if(this.displayElement) //update custom ui
				this.displayElement.style.color=color;	

		}
				
	}
			
	//font size
	this.setFontSize=function(size) {
		
		if(size && this.allowFont) {
			var ui=this.controller.objView.getInputWrapper();

			if(this.resetSize) {
				this.controller.objResizeControl.clearSize();
			}		

			if(ui && typeof size!="undefined")	
				ui.style.fontSize=LilyUtils.sizeFontForPlatform(size)+"px";

			this.fontSize=size;

			if(this.displayElement) //update custom ui
				this.displayElement.style.fontSize=LilyUtils.sizeFontForPlatform(size)+"px";
				
			if(this.resetSize) {
				this.controller.objResizeControl.resetSize();	
			}	
								
			this.objectMoved(); //notifiy listeners- make this object moved.
			this.controller.updatePos(); //update model
	//		this.controller.objView.updateObjSize();	

		}
				
	}
	
	//font face
	this.setFontFamily=function(font) {
		
		if(font && this.allowFont) {
			var ui=this.controller.objView.getInputWrapper();

			if(this.resetSize) {
				this.controller.objResizeControl.clearSize();
			}		

			if(ui && typeof font!="undefined")	
				ui.style.fontFamily=LilyUtils.getCompatibleFont(font);

			this.fontFamily=font;

			if(this.displayElement) //update custom ui
				this.displayElement.style.fontFamily=LilyUtils.getCompatibleFont(font);

			if(this.resetSize) {
				this.controller.objResizeControl.resetSize();
			}
															
			this.objectMoved(); //notifiy listeners- make this object moved.
			this.controller.updatePos(); //update model
	//		this.controller.objView.updateObjSize();	
		}
				
	}
	
	//set opacity
	this.setTransparency=function(amt) {
		var ui = this.controller.objView.getObjView();
		if(ui && typeof amt!="undefined")	
			ui.style.opacity=amt;
		this.opacity=amt;
	}
	
	//set the zindex
	this.setzIndex=function(amt) {
		var ui=this.controller.objView.getObjWrapper();
		if(ui && typeof amt!="undefined") {	
			ui.style.zIndex=parseInt(amt);
			this.zIndex=parseInt(amt);
			
			//if there's an iframe- need to set the zindex of the cover also
			if(this.frameCover) {
				this.frameCover.style.zIndex=parseInt(amt+1);
			}
		}
//		LilyDebugWindow.print(ui.style.zIndex+" "+this.zIndex);
	}
		
	//set the width of the object
	this.setWidth=function(amt) {
		var ui = this.controller.objView.getObjView();	
		if(ui && typeof amt!="undefined") {	
			if(amt && parseInt(amt)){
				
				amt = (this.resizeElement.style.minHeight && amt<parseInt(this.resizeElement.style.minHeight))?parseInt(this.resizeElement.style.minHeight):amt;				
				
				ui.style.width=parseInt(amt)+"px";
				if(this.resizeElement && this.resizeElement.getAttribute("width"))
					this.resizeElement.setAttribute("width",parseInt(amt)+"px");
				else if(this.resizeElement)
					this.resizeElement.style.width=parseInt(amt)+"px";
			}else{

				var styleStr = ui.style.cssText;
				var str = styleStr.replace(/^width|[^-]width: \S+;/,"");
				ui.setAttribute("style",str);
				
				if(this.resizeElement) {
					var styleStr = this.resizeElement.style.cssText;
					var str = styleStr.replace(/^width|[^-]width: \S+;/,"");
					this.resizeElement.setAttribute("style",str);	
				}

			}
		}	
		if(!isNaN(parseInt(amt)))
			this.width=parseInt(amt);		
	}
								
	//set the height of the object
	this.setHeight=function(amt) {
		var ui = this.controller.objView.getContentWrapper();		
		if(ui && typeof amt!="undefined") {
			if(amt && parseInt(amt)){
				
				amt = (this.resizeElement.style.minHeight && amt<parseInt(this.resizeElement.style.minHeight))?parseInt(this.resizeElement.style.minHeight):amt;
				
				ui.style.height=parseInt(amt)+"px";
				if(this.resizeElement && this.resizeElement.getAttribute("height"))
					this.resizeElement.setAttribute("height",parseInt(amt)+"px");
				else if(this.resizeElement)
					this.resizeElement.style.height=parseInt(amt)+"px";
					
			}else{
				var styleStr = ui.style.cssText;
				var str = styleStr.replace(/^height|[^-]height: \S+;/,"");
				ui.setAttribute("style",str);
				
				if(this.resizeElement) {	
					var styleStr = this.resizeElement.style.cssText;
					var str = styleStr.replace(/^height|[^-]height: \S+;/,"");
					this.resizeElement.setAttribute("style",str);	
				}
								
			}	
		}
		if(!isNaN(parseInt(amt)))			
			this.height=parseInt(amt);
	}
	
	//set visibility of the object
	this.setVisibility=function(visible) {
		var ui=this.controller.objView.getObjWrapper();
		if(ui && typeof visible!="undefined")	
			ui.style.visibility=visible;
		this.visibility=visible;
	}	
		
	this.moveLeftBy=function(args) {
		var ui=this.controller.objView.getObjWrapper(); //get the dom node
		ui.style.left=parseInt(ui.style.left)+parseInt(args)+"px"; //move it
		this.objectMoved(); //notifiy listeners- make this object moved.
		this.controller.updatePos(); //update model
	}
	
	this.moveTopBy=function(args) {
		var ui=this.controller.objView.getObjWrapper(); //get the dom node
		ui.style.top=parseInt(ui.style.top)+parseInt(args)+"px"; //move it
		this.objectMoved(); //notifiy listeners- make this object moved.
		this.controller.updatePos(); //update model
	}
	
	this.moveLeft=function(args) {
		var ui=this.controller.objView.objViewNode; //get the dom node	
		ui.style.left=parseInt(args)+"px"; //move it
		this.objectMoved(); //notifiy listeners- make this object moved.
		this.controller.updatePos(); //update model
	}
	
	this.moveTop=function(args) {
		var ui=this.controller.objView.objViewNode; //get the dom node
		ui.style.top=parseInt(args)+"px"; //move it
		this.objectMoved(); //notifiy listeners- make this object moved.
		this.controller.updatePos(); //update model
	}		
	
	//clean up
	//this needs a lot of work
	this.destroy=function()	{
		
		if(typeof this.destructor=="function")
			this.destructor();
				
		this.ui.remove();
		
		for(var x in this.controller)
			delete x;
			
		for(var y in this.view)
			delete y;
		
		for(var z in this)
			delete z;
	}
	
	this.createElID=function(elID) {
		return this.objID + "." + elID;
	}
	
	this.removeObjConnections=function() {
	
		var arrOut=this.getOutlets();
		var arrIn=this.getInlets();		
		
		for(var i=0;i<arrOut.length;i++)
			this.parent.getObj(this.objID+"."+arrOut[i]).removeConnections();
			
		for(var i=0;i<arrIn.length;i++)
			this.parent.getObj(this.objID+"."+arrIn[i]).removeConnections();			
	}
	
	
	//notify listeners
	this.objectMoved=function() {
		if(this.parent.patchController) {
			this.parent.patchController.notifyPatchListeners(this.objID+"_moved");				
		}		
	}	
	
	//store collection of ins/outs
	this.getInlets=function() {
		return this.inletArray;
	}
	
	this.getOutlets=function() {
		return this.outletArray;
	}
	
	this.resetInlets=function() {
		this.inletArray=[];
	}
	
	this.resetOutlets=function() {
		this.outletArray=[];
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////

	this.openHelpWindow=function(e) {

//		LilyDebugWindow.print("was the alt key depressed? "+e.altKey);		
		if((e.altKey && !LilyUtils.controlOrCommand(e)) && !thisPtr.controller.objDrag.pasted) {
			if(thisPtr.name!="tmp") {
				Lily.openHelpPatch((thisPtr.controller.objView.parent.loadsSubPatchByName)?thisPtr.controller.objView.parent.displayName:thisPtr.name);
			} else if(thisPtr.controller.objInputControl.objInput && thisPtr.controller.objInputControl.objInput.value) {
				var name = thisPtr.controller.objInputControl.objInput.value.split(" ")[0];
				if(name.length) {
					Lily.openHelpPatch(name);	
				}
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////
	
	this.openInspectorWindow=function() {
				
		if(thisPtr.name=="tmp")
			return;
		
		var select=thisPtr.parent.patchController.getSelectedObjectsLength();
				
		if(select==1)
			LilyInspectorWindow.open(thisPtr.objID);
		else
			LilyInspectorWindow.open();	//open the empty window			
			
	}
		
	this.loadFloatingInspectorWindow=function() {

		if(thisPtr.name=="tmp")
			return;
		
		var select=this.parent.patchController.getSelectedObjectsLength();
				
		if(LilyInspectorWindow.isOpen() && (select==1))
			LilyInspectorWindow.open(thisPtr.objID);
		else if(LilyInspectorWindow.isOpen() && (!select||select>1))
			LilyInspectorWindow.clear();
			
	}

	this.saveInspector=function(values) {
//		var values=LilyInspectorWindow.getInspectorValues();
		
		if(values && LilyInspectorWindow.isLoaded()) {
//			LilyDebugWindow.print("in the object before save "+values.toSource())
			thisPtr.parent.getObj(thisPtr.objID).saveInspectorValues(values); //save the values in the impl	
			thisPtr.parent.getObj(thisPtr.objID).updateInspectorConfig(values);		
//			var values=thisPtr.getInspectorConfig();
//			LilyDebugWindow.print("in the object after save "+values.toSource())			
		}	
			
	}

	this.saveInspectorValues=function() {
		//define this in the object implementation to receive values updated in the inspector
	}

	this.inspectorConfig=[]; //config for inspector

	this.setInspectorConfig=function(arr) {
//		LilyDebugWindow.print("before here "+arr.toSource())
		thisPtr.inspectorConfig=arr;
//		LilyDebugWindow.print("after here "+thisPtr.inspectorConfig.toSource())		
	}
	
	this.updateInspectorConfig=function(obj) {
		
		for(var i=0;i<thisPtr.inspectorConfig.length;i++) {
			for(var x in obj) {
				if(x==thisPtr.inspectorConfig[i].name) {
					thisPtr.inspectorConfig[i].value=obj[x];
				}
			}	
		}
				
	}

	this.getInspectorConfig=function() {
		if(typeof thisPtr.inspectorConfig!="undefined")	
			return thisPtr.inspectorConfig;
		else
			return [];
	}

	////////////////////////////////////////////////////////////////////////////////////////////	
			
	//outlet class
	this.outletClass=function (id,parent,helpText)
	{
		var thisPtr=this;
		this.id=id;
		this.parent=parent;
		this.patch=parent.parent;
		this.connected=[];
		this.helpText=helpText||"";
		this.type="outlet";
		
		this.getConnected=function() {
			return this.connected;
		}
		
		this.getObjectType=function() {
			return "outlet";
		}	
		
		this.connect=function(inletID) {
			if(this.connected.indexOf(inletID)==-1)
				this.connected.push(inletID);
		}
		
		//remove a specific connection
		this.removeConnection=function(inletID) { 
			if(this.connected.indexOf(inletID)!=-1) {
				this.patch.getObj(inletID).remove();
			}
		}
		
		//remove the connection from the connected array
		this.deconnect=function(connectionID) {
			this.connected.splice(this.connected.indexOf(connectionID),1);
		}		
		
		//removes all connections
		this.removeConnections=function() {
			for(var z=0;z<this.connected.length;z++) {
				this.removeConnection(this.connected[z]);
				z--;
			}
		}
		
		this.doOutlet=function(msg) {
				var thisPtr=this;
				if(Lily.trace && this.connected.length) LilyDebugWindow.trace("["+this.parent.name+"] sent: "+msg)
				for(var i=0;i < this.connected.length; i++) {				
					var obj=this.patch.getObj(this.connected[i]);
					obj.send(msg); //send  msg
				}
		}
		
		this.parent.registerOutlet(this.id); //register on startup
	}
	
	//inlet class
	this.inletClass=function (id,parent,helpText) {
		this.id=id;
		this.parent=parent;
		this.patch=parent.parent;
		this.connected=[];
		this.helpText=helpText||"";
		this.type="inlet";		
				
		this.processInput=function(msg) {
					
			if(typeof msg=="string") {
				var argArr=msg.split(" ");
				var cmd=argArr.shift();
				var argStr=argArr.join(" ");
			} 
			
			if(Lily.trace) LilyDebugWindow.trace("["+this.parent.name+"] received: "+msg)
			
			if(typeof this[cmd]=="function") {
				this[cmd](argStr);
			} else if(typeof msg=="object" && typeof this["obj"]=="function") {
				this["obj"](msg);
			} else if(typeof msg=="boolean" && typeof this["bool"]=="function") {
				this["bool"](msg);
			} else if((typeof msg=="number"||!isNaN(msg)) && typeof this["num"]=="function") {
				this["num"](msg);											
			} else if(cmd=="thisObject") {
				var a=argStr.split(" ");
				var c=a.shift();
				this.parent[argStr.split(" ").shift()](a.join(" "));
			} else if(typeof this["anything"]=="function") {
				this["anything"](msg);
			} else {
				LilyDebugWindow.error(this.parent.objID+"."+this.id +": input not handled");
			}	
		}
		
		this.getConnected=function() {
			return this.connected;
		}
		
		this.getObjectType=function() {
			return "inlet";
		}		

		this.connect=function(outletID) { 
			if(this.connected.indexOf(outletID)==-1)
				this.connected.push(outletID) 
		}
		
		//remove the connection from the connected array
		this.deconnect=function(connectionID) {
			this.connected.splice(this.connected.indexOf(connectionID),1);
		}
		
		//remove a specific connection
		this.removeConnection=function(outletID) { 
			if(this.connected.indexOf(outletID)!=-1)
				this.patch.getObj(outletID).remove();
		}
		
		//remove all connections
		this.removeConnections=function() {
			for(var z=0;z<this.connected.length;z++) {
				this.removeConnection(this.connected[z]);
				z--
			}
		}
		
		this.parent.registerInlet(this.id); //register on startup
	}
	
	this.registerInlet = function(id) {this.inletArray.push(id);}
	this.registerOutlet = function(id) {this.outletArray.push(id);}
	
	this.controller=new LilyObjectController(this);
}



/**
*	Class for a new Object Controller
*	@class
*	@constructor
*/
function LilyObjectController (obj) {

	var thisPtr=this;
	this.obj=obj;
	this.objView=null; //ptr to the view filled in when view instantiates
	this.patch=obj.parent;
	this.id=obj.objID;
	this.patchView=this.patch.patchView;
	this.patchController=this.patch.patchController;
	this.win=this.patchView.oWin;
	this.editing=false;
	this.replacing=false;
	this.isOutletOver=false;
	this.isSelected=false;
	this.noBorders=false;
	
	this.outlets=obj.getOutlets();
	this.inlets=obj.getInlets();
		
	this.getObjEdit=function() {
		return this.editing;
	}
	
	this.setObjEdit=function(b) {
		this.editing=b;
		this.patchController.setPatchEdit(b);
	}
	
	this.getNoBorders=function() {
		return this.noBorders;
	}
	
	this.setNoBorders=function(b) {
		this.noBorders=b;
	}	
	
	this.inletOver=function(id) {
		//note- by default mozilla blocks js from setting status text
		this.patchView.setWindowStatusText(this.obj.parent.getObj(id).helpText);
		if(this.patchController.okToConnect(id)) {
			this.objView.inletOverView(id);
//			LilyDebugWindow.print("over " + id);
		}
	}
	
	this.inletOut=function(id) {
		this.objView.inletOutView(id);
		this.patchView.clearWindowStatusText();		
	}
	
	this.inletConnect=function(e,id) {
		if(this.patchController.okToConnect(id)) {
			this.patchController.endConnection(id);
//			LilyDebugWindow.print("in connect " + id);
		}
		return false;
	}	
	
	this.outletOver=function(id) {
		//note- by default blocks js from setting status text		
		this.patchView.setWindowStatusText(this.obj.parent.getObj(id).helpText);
		if(this.patchController.okToConnect(id)) {	
			this.objView.outletOverView(id);	
			this.isOutletOver=true;			
			//LilyDebugWindow.print("over " + id);
		}
	}
	
	this.outletOut=function(id) {
		this.objView.outletOutView(id);
		this.isOutletOver=false;
		this.patchView.clearWindowStatusText();		
	}
	
	this.outletConnect=function(e,id) {

		if(this.patchController.okToConnect(id) && (!LilyUtils.controlOrCommand(e) && !e.altKey)) {
			this.patchController.startConnection(id);
		}	else if(LilyUtils.controlOrCommand(e) && e.altKey) {
			this.patchController.startConnection(id,true);
		}
//		LilyDebugWindow.print("out connect " + id);
		return false;		
	}
	
	this.updateFont=function() {
		var fontArr=thisPtr.patch.patchController.getFont();
		
		thisPtr.objView.parent.setFontFamily(fontArr[0]);
		thisPtr.objView.parent.setFontSize(parseInt(fontArr[1]));
		thisPtr.objView.parent.setFontColor(fontArr[2]);				
		
//		LilyDebugWindow.print(fontArr.toSource());
	}
	
	this.updateColor=function() {
		var color=thisPtr.patch.patchController.getColor();
		thisPtr.objView.parent.setColor(color[0],color[1]);
	}
	
/*	
	this.updateNames=function() {
		var names=thisPtr.patch.patchController.getNames();
		thisPtr.objView.parent.setGroupName(names["groupName"]); //need to use this round-about path back to the root level
		thisPtr.objView.parent.setCSSName(names["cssName"]); //need to use this round-about path back to the root level
	}	
*/
	
	this.setHiddenInPerf=function(b) {
		thisPtr.obj.hiddenInPerf=b;
//		LilyDebugWindow.print("hiddeninperf after being set "+thisPtr.obj.hiddenInPerf)
	}
	
	this.setBringForward=function() {
		//need to use this path so changes will be reflected
		var val=thisPtr.objView.parent.zIndex+1;
		thisPtr.objView.parent.setzIndex(val);
	}		
	
	this.setSendBack=function() {
		//need to use this path so changes will be reflected
		var val=((thisPtr.objView.parent.zIndex-1)>1)?thisPtr.objView.parent.zIndex-1:1;
		thisPtr.objView.parent.setzIndex(val);
	}
	
	this.select=function(e)	{
		
		//log("select "+e+" "+e.detail+" "+e["dispatched"]+" "+thisPtr.id+" "+e.target.id)
				
		if(thisPtr.isSelected && LilyUtils.selectionModifyingKeyDown(e))		
			return thisPtr.deselect(e);
		else if(thisPtr.isOutletOver || thisPtr.isSelected)
			return;
		
		//store certain properties about the object while its selected.	
		thisPtr.patchController.setSelectedObjects({
				id:thisPtr.id,
				color:thisPtr.objView.parent.color,				
				fontSize:thisPtr.objView.parent.fontSize,
				fontFace:thisPtr.objView.parent.fontFamily,
				fontColor:thisPtr.objView.parent.fontColor,
				className:thisPtr.objView.parent.name,
				hideInPerf:thisPtr.objView.parent.hiddenInPerf
		});

		thisPtr.patchController.deselectAll(e); //if shift key is not pressed- deselect all the others
		thisPtr.objView.selectObjView(e);
		
		//add listeners here for patch mousedown events
		//delete	
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"deleteKey",function(){thisPtr.patch.deleteObject(thisPtr.id)},"select");

		//inspector
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"inspector",thisPtr.obj.openInspectorWindow,"select");
		thisPtr.obj.loadFloatingInspectorWindow();
		
		//font
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"fontChanged",thisPtr.updateFont,"select");

		//name
//		thisPtr.patchController.attachPatchObserver(thisPtr.id,"nameChanged",thisPtr.updateNames,"select");
		
		//color
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"colorChanged",thisPtr.updateColor,"select");
		
		//open file
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"click",function(event){if(event.metaKey&&event.altKey){Lily.openExtFile(Lily["$"+thisPtr.obj.name+"MetaData"].textName);}},"select");				
			
		//set name values	
//		LilyMenuBar.setNameValue(thisPtr.objView.parent.groupName,thisPtr.objView.parent.cssName);	
			
		//zindex
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"bringForward",thisPtr.setBringForward,"select");
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"sendBack",thisPtr.setSendBack,"select");

		//hidden in perf
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"hiddenInPerf",function(){thisPtr.setHiddenInPerf(true);},"select");
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"visibleInPerf",function(){thisPtr.setHiddenInPerf(false);},"select");
		
		//drag & resize
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"mousedown",thisPtr.selectDelegate,"select");
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"mouseup",thisPtr.selectDelegate,"select");
			
		//set flag
		thisPtr.isSelected=true;
				
		//notify connections we've been selected.
		thisPtr.patchController.notifyPatchListeners(thisPtr.id+"_objSelected");
		
		thisPtr.obj.objectMoved(); 
		//this.editing=false;
	}
	
	//funnel events to drag & resize
	this.selectDelegate=function(e) {
		if(e.shiftKey && LilyUtils.controlOrCommand(e)) {
			
			if(e.type=="mousedown") {
				thisPtr.objResizeControl.mousedown(e);
			} else if(e.type=="mouseup") {
				thisPtr.objResizeControl.mouseup(e);	
			}			
				
		} else {
			
			if(e.type=="mousedown") {
				thisPtr.objDrag.mousedown(e);
			} else if(e.type=="mouseup") {
				thisPtr.objDrag.mouseup(e);	
			}
		}		
	}
	
	this.deselect=function(e) {
	
		//this.objectSelected=null;
		//this.editing=false;
		
		//if(e)
		//	log("deselect "+e+" "+e.detail+" "+e["dispatched"]+" "+thisPtr.id)
		//else
		//	log("deselect- no e "+thisPtr.id)
				
		if(!thisPtr.isSelected || thisPtr.objDrag.dragging || (e && e.type=="paste"))
			return;	
			
		thisPtr.patchController.unsetSelectedObjects(thisPtr.id);

		thisPtr.notifyObjectListeners("deselect");
		thisPtr.patchController.notifyPatchListeners(thisPtr.id+"_objDeSelected");	
		
//		LilyDebugWindow.print(thisPtr.id+"_objDeselected")	
		
		//remove listeners here for patch mousedown events				
		thisPtr.patchController.removePatchObserver(thisPtr.id,"deleteKey",function(){thisPtr.patch.deleteObject(thisPtr.id)},"select");		
		
		//inspector
		thisPtr.patchController.removePatchObserver(thisPtr.id,"inspector",thisPtr.obj.openInspectorWindow,"select");
		LilyInspectorWindow.unloadFloatingInspectorWindow();			
		
		//font listener
		thisPtr.patchController.removePatchObserver(thisPtr.id,"fontChanged",thisPtr.updateFont,"select");

		//name
//		thisPtr.patchController.removePatchObserver(thisPtr.id,"nameChanged",thisPtr.updateNames,"select");
		
		//color
		thisPtr.patchController.removePatchObserver(thisPtr.id,"colorChanged",thisPtr.updateColor,"select");				

		//open file
		thisPtr.patchController.removePatchObserver(thisPtr.id,"click",function(event){if(event.metaKey&&event.altKey){Lily.openExtFile(Lily["$"+thisPtr.obj.name+"MetaData"].textName);}},"select");				

		//zindex
		thisPtr.patchController.removePatchObserver(thisPtr.id,"bringForward",thisPtr.setBringForward,"select");
		thisPtr.patchController.removePatchObserver(thisPtr.id,"sendBack",thisPtr.setSendBack,"select");

		//visibility in perf
		thisPtr.patchController.removePatchObserver(thisPtr.id,"hiddenInPerf",function(){thisPtr.setHiddenInPerf(true);},"select");
		thisPtr.patchController.removePatchObserver(thisPtr.id,"visibleInPerf",function(){thisPtr.setHiddenInPerf(false);},"select");

		//drag & resize
		thisPtr.patchController.removePatchObserver(thisPtr.id,"mousedown",thisPtr.selectDelegate,"select");
		thisPtr.patchController.removePatchObserver(thisPtr.id,"mouseup",thisPtr.selectDelegate,"select");			
			
		//deselect view			
		thisPtr.objView.deSelectObjView();
		
		thisPtr.patchView.clearWindowStatusText();		
				
		//set name values
		//XXX FIXME - bug when objects are deselected individually			
//		LilyMenuBar.setNameValue("","");		
		
		//update the object size
//		thisPtr.objView.updateObjSize();
		thisPtr.obj.objectMoved(); //notifiy listeners- make this object moved.					
		
		//toggle flags
		if(thisPtr.getObjEdit())
			thisPtr.doneEditObj();
			
		//toggle flags	
		thisPtr.isSelected=false;
		
//		thisPtr.patchController.setHasSelection();
						
	}
	
	this.notifyObjectListeners=function(e) {	
		var evt = thisPtr.win.document.createEvent("Event");			
		evt.initEvent(e, true, false);
		thisPtr.objView.objViewNode.dispatchEvent(evt);		
	}	
	
	this.updatePos=function() {
		var arr=this.objView.getCurrentPosition();
		this.obj.top=arr[1];
		this.obj.left=arr[0];
		//LilyDebugWindow.print(this.obj.top + " " + this.obj.left);
	}		
	
	this.startEditObj=function() {
		
		if(this.objDrag.dragging)
			return;
		
		//remove everything that might interfere with editing...
		this.patchController.removePatchObserver(this.id,"deleteKey",function(){thisPtr.patch.deleteObject(thisPtr.id)},"select");
		this.patchController.removePatchObserver(this.id,"mousedown",thisPtr.objDrag.mousedown,"select");
		this.patchController.removePatchObserver(this.id,"mouseup",thisPtr.objDrag.mouseup,"select");
	
		//this two need to be added back when edit is complete
		this.removeObserver(this.id,"dblclick",function(){thisPtr.startEditObj();},"edit");	
		this.removeObserver(this.id,"mousedown",LilyUtils.preventDefault,"edit");			

		this.objView.startEditView();
		this.setObjEdit(true);
		thisPtr.obj.objectMoved(); 		

	}
	
	this.abortEditObj=function() {

		if(!this.getObjEdit())
			return;
			
		this.objView.endEditView();
		this.setObjEdit(false);
		
		thisPtr.obj.objectMoved(); 		
		
//		LilyDebugWindow.print("aborting...");		
	}	
	
	this.doneEditObj=function() {

		if(!this.getObjEdit())
			return;

		var newVal=this.objView.endEditView();
		
		if(newVal=="") {
			this.patch.deleteObject(this.id);
		} else if(newVal!=null) {
			var argsArray=newVal.split(" ");
			var newName=argsArray.shift();
			var args=(argsArray.length)?LilyUtils.strip(argsArray.join(" ")):null;
		
			if(newName && (newName!=this.obj.name || args!=this.obj.args))
				this.patch.replaceObject(this.obj,newName,args);
		} else {
			//restore the patch observer we removed
//			this.patchController.attachPatchObserver(this.id,"deleteKey",function(){thisPtr.patch.deleteObject(thisPtr.id)},"edit");
			this.attachObserver(this.id,"mousedown",LilyUtils.preventDefault,"edit");
			this.attachObserver(this.id,"dblclick",function(){thisPtr.startEditObj();},"edit");				
		}
		
//		this.objInputControl.endAutoComplete();
		this.setObjEdit(false);	
		thisPtr.obj.objectMoved(); 
//		LilyDebugWindow.print("done edit " + this.id);			
	}
		
	//handler for edit state switch
	this.toggleEditState=function() {
		if(!thisPtr.objView.parent.isPaste)thisPtr.deselect();
		thisPtr.objView.toggleEditView(); 
	}
	
	//utility method for attaching a listener with an id
	this.attachObserver=function(id,evt,func,mode) {		
		thisPtr.patchController.attachObserver(id,evt,func,mode);
	}
	
	//utility method for removing a listener with an id
	this.removeObserver=function(id,evt,func,mode) {		
		thisPtr.patchController.removeObserver(id,evt,func,mode);
	}
	
	this.addInletListeners=function() {
		//attach listeners for inputs
		//mouseover & mouseout & mouseup
		for(var i=0;i<this.inlets.length;i++) {
			var instr=this.obj.createElID("inlet"+(i+1));		
			with ( {elemID : instr } ) {
				this.attachObserver(instr,"mouseover",function(){thisPtr.inletOver(elemID);},"edit");
				this.attachObserver(instr,"mouseout",function(){thisPtr.inletOut(elemID);},"edit");
				this.attachObserver(instr,"mouseup",function(event){thisPtr.inletConnect(event,elemID);},"edit");
				this.attachObserver(instr,"mousedown",function(event){thisPtr.inletConnect(event,elemID);},"edit");				
			}
		}		
	}
	
	this.addOutletListeners=function() {
		//attach listeners for outputs
		//mouseover & mouseout & mousedown
		for(var j=0;j<this.outlets.length;j++) {
			var outstr=this.obj.createElID("outlet"+(j+1));
			with( {elemID:outstr }) {
				this.attachObserver(outstr,"mouseover",function(){thisPtr.outletOver(elemID);},"edit");
				this.attachObserver(outstr,"mouseout",function(){thisPtr.outletOut(elemID);},"edit");
				this.attachObserver(outstr,"mousedown",function(event){thisPtr.outletConnect(event,elemID);},"edit");
			}
		}	
	}	
	
	this.addDefaultListeners=function() {
		
		this.addInletListeners();
		this.addOutletListeners();

		//methods for selecting & deselecing objects
		this.attachObserver(this.id,"mousedown",thisPtr.select,"edit");
		this.attachObserver(this.id,"mousedown",LilyUtils.preventDefault,"edit");
		this.patchController.attachPatchObserver(thisPtr.id,"selectAll",thisPtr.select,"edit");
		this.attachObserver("canvas","mousedown",thisPtr.deselect,"edit");
		
		//open help window
		this.attachObserver(this.id,"click",thisPtr.obj.openHelpWindow,"edit");
		
		//methods for editing default object
		if(!this.objView.usesCustomUI/*&&thisPtr.objView.parent.displayArgs*/) { //not if there's a custom or if we're hiding the args (ie patcher)
			this.attachObserver(this.id,"dblclick",function(){thisPtr.startEditObj();},"edit");
			this.attachObserver(this.id,"blur",function(){thisPtr.doneEditObj();},"edit");
		} 
		
		//add listener on this object for patch edit state change
		this.patchController.attachPatchObserver(thisPtr.id,"editabilityChange",thisPtr.toggleEditState,"all");
	}
	
	this.removeInletListeners=function() {
		//attach listeners for inputs
		//mouseover & mouseout & mouseup
		for(var i=0;i<this.inlets.length;i++) {
			var instr=this.obj.createElID("inlet"+(i+1));		
			with ( {elemID : instr } ) {
				this.removeObserver(instr,"mouseover",function(){thisPtr.inletOver(elemID);},"edit");
				this.removeObserver(instr,"mouseout",function(){thisPtr.inletOut(elemID);},"edit");
				this.removeObserver(instr,"mouseup",function(event){thisPtr.inletConnect(event,elemID);},"edit");
				this.removeObserver(instr,"mousedown",function(event){thisPtr.inletConnect(event,elemID);},"edit");				
			}
		}	
	}
	
	this.removeOutletListeners=function() {
		//attach listeners for outputs
		//mouseover & mouseout & mousedown
		for(var j=0;j<this.outlets.length;j++) {
			var outstr=this.obj.createElID("outlet"+(j+1));
			with( {elemID:outstr }) {
				this.removeObserver(outstr,"mouseover",function(){thisPtr.outletOver(elemID);},"edit");
				this.removeObserver(outstr,"mouseout",function(){thisPtr.outletOut(elemID);},"edit");
				this.removeObserver(outstr,"mousedown",function(event){thisPtr.outletConnect(event,elemID);},"edit");
			}
		}	
	}
		
	this.removeDefaultListeners=function() {
		
		this.removeInletListeners();
		this.removeOutletListeners();

		//methods for selecting & editing objects
		this.removeObserver(this.id,"mousedown",thisPtr.select,"edit");
		this.removeObserver(this.id,"mousedown",LilyUtils.preventDefault,"edit");
		this.removeObserver("canvas","mousedown",thisPtr.deselect,"edit");		
		this.patchController.removePatchObserver(thisPtr.id,"selectAll",thisPtr.select,"edit");

		//help window
		this.removeObserver(this.id,"click",thisPtr.obj.openHelpWindow,"edit");			

		//methods for editing default object
		if(!this.objView.usesCustomUI) {
		//	this.removeObserver(this.id,"focus",function(){thisPtr.startEditObj();},"edit");
			this.removeObserver(this.id,"dblclick",function(){thisPtr.startEditObj();},"edit");
			this.removeObserver(this.id,"blur",function(){thisPtr.doneEditObj();},"edit");
		}
		
		//add listener on this object for patch edit state change
		this.patchController.removePatchObserver(thisPtr.id,"editabilityChange",thisPtr.toggleEditState,"all");
	}
	
	//cleanup this object's outlet connections
	this.cleanupOutletConnections=function() {
		for(var i=0;i<thisPtr.outlets.length;i++) {
			var this_outlet = thisPtr.patch.getObj(thisPtr.id+"."+thisPtr.outlets[i]);
			var connections=(this_outlet)?this_outlet.getConnected():[];
			for(var j=0;j<connections.length;j++)
				thisPtr.patch.getObj(connections[j]).controller.updateOutletConnection()
		}
	}
	
	//TBD
	this.cleanupInletConnections=function() {
		
		
	}	

	/**
		encapsulates object resize functionality
	*/
	this.objResizeControl=new function(parent) {
		
		this.objController=parent;
		this.patch=this.objController.obj.parent;
		this.patchController=this.patch.patchController;
		this.mousePosition={};
		this.obj=null;		
		this.height=0;
		this.width=0;
		this.cb=null;
		this.resizeFlag=false;		
		var thisPtr=this;

		//reset the size
		this.clearSize=function() {
			thisPtr.obj=thisPtr.patch.getObj(thisPtr.objController.obj.objID);
			if(thisPtr.obj) {
				//remove the sizes from the style property, so the browser will handle the sizing for us
				thisPtr.obj.setHeight(null);
				thisPtr.obj.setWidth(null);	
			}		
		}
		
		//reset the size
		this.resetSize=function() {
			thisPtr.obj=thisPtr.patch.getObj(thisPtr.objController.obj.objID);
			if(thisPtr.obj) {

				//suss out the new size
				var newHeight = thisPtr.objController.objView.getActualHeight();
				var newWidth = thisPtr.objController.objView.getActualWidth();

				thisPtr.obj.setHeight(newHeight);
				thisPtr.obj.setWidth(newWidth);	
				
				thisPtr.objController.cleanupOutletConnections(); //adjust the outlets connections to the new size				
			}		
		}		
		
		this.mousedown=function(e) {
			thisPtr.mousePosition["startX"]=parseInt(e.clientX);
			thisPtr.mousePosition["startY"]=parseInt(e.clientY);
			thisPtr.obj=thisPtr.patch.getObj(thisPtr.objController.obj.objID);
			thisPtr.objController.objView.updateObjSize();	//update the object incase its not set yet.			
			thisPtr.height=thisPtr.obj.height;
			thisPtr.width=thisPtr.obj.width;				
			thisPtr.patchController.attachPatchObserver(thisPtr.patchController.pID,"mousemove",resize,"select");
			thisPtr.objController.patchView.setWindowStatusText("width:"+(thisPtr.width)+"px height:"+(thisPtr.height)+"px");
			thisPtr.resizeFlag=true;
			parent.obj.hasBeenResized=true;			
		}
		
		this.mouseup=function(e) {
			thisPtr.objController.cleanupOutletConnections();
			thisPtr.mousePosition={};
			thisPtr.obj=null;
			thisPtr.height=0;
			thisPtr.width=0;						
			thisPtr.patchController.removePatchObserver(thisPtr.patchController.pID,"mousemove",resize,"select");
			thisPtr.objController.patchView.clearWindowStatusText();
			thisPtr.resizeFlag=false;						
		}
		
		function resize(e) {
			
			//if the no resize flag is set.
			if(!thisPtr.obj.resize)
				return;
			
//			LilyDebugWindow.print(e.clientX+" "+window.innerWidth+" "+e.clientY+" "+window.innerHeight)
						
			//kill the resize if we're too close to the edgedr
			if(
					e.clientX <= 10||
					e.clientY <= 10||
					e.clientX >= (thisPtr.patch.patchView.xulWin.innerWidth-10)||
					e.clientY >= (thisPtr.patch.patchView.xulWin.innerHeight-40)
			) {
				//log("exit resize")
				thisPtr.mouseup();				
				return;
			}
			
			var startX=thisPtr.mousePosition["startX"];
			var startY=thisPtr.mousePosition["startY"];
			var currX=parseInt(e.clientX);
			var currY=parseInt(e.clientY);
			var diffX=currX-startX;
			var diffY=currY-startY;
			var width=((parseInt(thisPtr.width)+diffX)>10)?(parseInt(thisPtr.width)+diffX):10; //fix me- hardcoding the mins here
			var height=((parseInt(thisPtr.height)+diffY)>10)?(parseInt(thisPtr.height)+diffY):10; //here too.
			
			thisPtr.obj.setHeight(height);
			thisPtr.obj.setWidth(width);
			
			thisPtr.objController.patchView.setWindowStatusText("width:"+(width)+"px height:"+(height)+"px");			
				
			//callbac
			if(thisPtr.cb)
				thisPtr.cb(height,width);
				
			thisPtr.obj.objectMoved(); //adjust the outlets connections to the new size

		}
		
	}(this);
	
	/**
		encapsulates object input functionality
	*/
	this.objInputControl=new function(parent) {
		
		this.objController=parent;
		this.obj=this.objController.obj;
		this.objView=this.objController.objView;
		this.objInput=null;
		this.minInputWidth=38;
		var thisPtr=this;
		
		var results=[];
		var selectedItem=0;
		var objListArr=LilyObjectList.getNames();
		
		function searchArr(searchStr) {
			
			if(searchStr[searchStr.length-1]!='\\') { // to avoid "a trailing \" regex error.
				
				var vals = [];
				searchStr=searchStr.replace(/(\+|\*|\[|\]|\(|\))/g,"\\$1"); //escape special characters
	//			LilyDebugWindow.print(searchStr);
				try {
					var re=new RegExp("^"+searchStr.toLowerCase());
					for(var x=0;x<objListArr.length;x++)
						if(re.test(objListArr[x].menuName.toLowerCase())) //make regexp
							vals.push({display:objListArr[x].displayName,text:objListArr[x].menuName,summary:objListArr[x].objSummary,arguments:objListArr[x].objArguments});
	
				} catch(e) {
					
				}

	//			LilyDebugWindow.print("vals is " + vals)		

				return vals;
				
			} else {
				return [];
			}
			
		}	

		this.startAutoComplete=function(e) {
			
			if(e.which==40||e.which==38||e.which==13)
				return;			

//			LilyDebugWindow.print("start autocomplete" + e.which);
			selectedItem=0;	

			var resultArr=[];
			var txt=thisPtr.objInput.value;
			resultArr=searchArr(thisPtr.objInput.value);
			resetDisplay();
			for(var i=0;i<resultArr.length;i++) {
				results[i]={item:resultArr[i].text,el:insertDiv(resultArr[i].display),summary:resultArr[i].summary,arguments:resultArr[i].arguments};
			}
			if(resultArr.length)
				select(selectedItem);
		}
		
		this.endAutoComplete=function() {
			//remove the event handlers

			if(results.length) {			
				thisPtr.objInput.value=results[selectedItem].item;
				thisPtr.objController.patchView.clearWindowStatusText();
				thisPtr.objController.patchView.setWindowStatusText("arguments: "+results[selectedItem].arguments);				
			}	
			
			resetDisplay();
			thisPtr.keydown();
			
//			LilyDebugWindow.print("end autocomplete...")
			
		}		
		
		function handleKeyPress(e) {
			var key=e.which;
//			thisPtr.objInput.blur();
			e.preventDefault();
			if(key==40) {
				changeSelection("up");
				return;
			} else if(key==38) {
				changeSelection("down");
				return;
			} else if (key==13) {
				thisPtr.endAutoComplete();
				return;
			}
		}

		function resetDisplay() {
			if(thisPtr.objController.objView.autoCompleteList)
				thisPtr.objController.objView.autoCompleteList.innerHTML=""; //clear out the div
			results=[]; //clear out the list of
			selectedItem=0;
		}

		function insertDiv(text) {
			var d=thisPtr.objController.objView.document.createElement("div");
			d.innerHTML=text;
			d.style.paddingRight="5px";
			d.style.paddingLeft="5px";			
			thisPtr.objController.objView.autoCompleteList.appendChild(d);
			d.addEventListener("click",handleClick,false);
			d.addEventListener("mouseover",function(){if(this.style.backgroundColor=="White"){
				this.style.backgroundColor="LightCyan"
			}},false);
			d.addEventListener("mouseout",function(){if(this.style.backgroundColor=="LightCyan"){
				this.style.background="White"
			}},false);			
			return d;
		}
		
		function handleClick() {
			for(var i=0;i<results.length;i++) {
				if(results[i].item==this.innerHTML) {
					select(i);
					thisPtr.objInput.value=results[i].item;
					var size=LilyUtils.getTextSize(thisPtr.objController.win,thisPtr.objInput.value);
					thisPtr.objInput.style.width=(size[0]+10)+"px";			
					thisPtr.objInput.focus();
					thisPtr.endAutoComplete();
					return;
				}	
			}		
		}
		
		function select(i) {
			clearSelection();
//			thisPtr.objInput.value=results[i].item;
//			results[i].selected=true;
			selectedItem=i;
			if(results[i]){
				results[i].el.style.backgroundColor="LightSkyBlue";
				thisPtr.objController.patchView.setWindowStatusText(results[i].item+": "+results[i].summary);				
			}	
				
//			LilyDebugWindow.print("in the select "+results.toSource()+" "+i)
		
		}
		
		function clearSelection() {
			for(var i in results) {
				results[i].el.style.backgroundColor="White";
//				results[i].selected=false;					
			}
		}
		
		function changeSelection(dir) {
			if(dir=="up")
				incrementIndex();
			else
				decrementIndex();
			select(selectedItem);	
		}
		
		function incrementIndex() {
			if((selectedItem+1)<(results.length)) {
				selectedItem++;
			} else {
				selectedItem=0;
			}
		}
		
		function decrementIndex() {
			if((selectedItem-1)>=0) {
				selectedItem--;
			} else {
				selectedItem=results.length-1;
			}
		}		

		this.keydown=function(e) {
			
			var txt=thisPtr.objInput.value;			
			var size=LilyUtils.getTextSize(thisPtr.objController.win,txt);			
			
			if(size[0]) { //if there's a value
				if((size[0])>=(thisPtr.minInputWidth))
					thisPtr.objInput.style.width=(size[0]+10)+"px";
				else
					thisPtr.objInput.style.width=thisPtr.minInputWidth+"px";
			}
			
			thisPtr.obj.objectMoved();
		}

		this.registerDefaultListeners=function(node) {
			this.objInput=node;
			this.objInput.addEventListener("keyup",thisPtr.keydown,false);
			thisPtr.objController.win.addEventListener("keyup",handleKeyPress,false);
			this.objInput.addEventListener("keyup",thisPtr.startAutoComplete,false);					

			var txt=thisPtr.objInput.value;
			var size=LilyUtils.getTextSize(thisPtr.objController.win,txt);						
			
			if(txt && (size[0])>=thisPtr.minInputWidth) //if there's a value
				this.objInput.style.width=(size[0]+10)+"px"; //init
			else
				this.objInput.style.width=thisPtr.minInputWidth+"px";	
		}
		
		this.unregisterDefaultListeners=function(node) {
			this.objInput=null;
			this.objInput.removeEventListener("keyup",thisPtr.keydown,false);
			thisPtr.objController.win.removeEventListener("keyup",handleKeyPress,false);
			this.objInput.removeEventListener("keyup",thisPtr.startAutoComplete,false);				
		}

	}(this)
	
	/**
		encapsulates object drag functionality
	*/
	this.objDrag=new function(parent) {
		this.objController=parent;
		this.obj=this.objController.obj;
		this.ui=null;
		this.isDraggable=false;
		this.dragging=false;	
		this.startX;
		this.startY;
		this.mouseX;
		this.mouseY;
		this.copied=false;
		this.pasted=false;
		this.cb=null;
		var thisPtr=this;
		
		this.mousemove=function(e) {
			if(!thisPtr.isDraggable)
				return false;
				
			thisPtr.dragging=true;	
				
			if(e.altKey && thisPtr.copied && !thisPtr.pasted) { //alt-drag copy
				thisPtr.obj.parent.paste();
				thisPtr.pasted=true;
				Lily.clipboard=null; //only paste once
			}	
			
			thisPtr.ui.style.left=(thisPtr.startX + e.clientX - thisPtr.mouseX)+"px";
			thisPtr.ui.style.top=(thisPtr.startY + e.clientY - thisPtr.mouseY)+"px";
			
			thisPtr.objController.patchView.setWindowStatusText("x: "+(thisPtr.startX + e.clientX - thisPtr.mouseX)+"px y:"+(thisPtr.startY + e.clientY - thisPtr.mouseY)+"px");
			
			if(thisPtr.cb)
				thisPtr.cb((thisPtr.startX + e.clientX - thisPtr.mouseX),(thisPtr.startY + e.clientY - thisPtr.mouseY));
			
			return false;
		}
		this.mousedown=function(e) {
						
			//LilyDebugWindow.print("objDrag- mousedown " + thisPtr.objController.id);
			
			if(e.altKey) { //alt-drag copy
				thisPtr.obj.parent.copy();
				thisPtr.pasted=false;
				thisPtr.copied=true;				
			}
				
			thisPtr.isDraggable=true;
			thisPtr.ui=thisPtr.objController.objView.getObjWrapper();
			thisPtr.startX=parseInt(thisPtr.ui.style.left+0);
			thisPtr.startY=parseInt(thisPtr.ui.style.top+0);
			thisPtr.mouseX=e.clientX;
			thisPtr.mouseY=e.clientY;
			thisPtr.objController.patchController.attachPatchObserver(thisPtr.objController.id,"mousemove",thisPtr.mousemove,"select");
			thisPtr.objController.patchController.notifyPatchListeners((thisPtr.objController.id+"_moveStart"));
			thisPtr.objController.patchView.setWindowStatusText("x:"+(thisPtr.startX)+"px y:"+(thisPtr.startY)+"px");			
			//LilyDebugWindow.print(">>>>>>>>"+(thisPtr.objController.id+"_moveStart"));
			return false;
		}
		this.mouseup=function(e) {
			//LilyDebugWindow.print("objDrag- mouseup " + thisPtr.objController.id);
			
			thisPtr.objController.patchController.notifyPatchListeners((thisPtr.objController.id+"_moveStop"));
			thisPtr.objController.patchController.removePatchObserver(thisPtr.objController.id,"mousemove",thisPtr.mousemove,"select");				
			thisPtr.objController.updatePos();
			thisPtr.copied=false;
			thisPtr.isDraggable=false;
			thisPtr.dragging=false;
			thisPtr.objController.patchView.clearWindowStatusText();											
			//LilyDebugWindow.print(">>>>>>>>"+(thisPtr.objController.id+"_moveStop"));			
		}
	}(this);
}



/**
*	Construct a new ObjectView
*	@class
*	@constructor
*/
function LilyObjectView (obj,HTML,cmdStr) {

	var thisPtr=this;
	this.name=obj.name; //real class name
	this.display=obj.displayName; //class name to display
	this.id=obj.objID; //this objects id
	this.top=obj.top;
	this.left=obj.left;
	this.parent=obj; //object class
	this.patch=this.parent.parent;	
	this.objHTML=HTML; //custom html if present
	this.usesCustomUI=(this.objHTML)?true:false;
	this.win=obj.parent.patchView; //patch view
	this.document=this.win.document; //patch document
	this.controller=this.parent.controller; //obj controller
	this.parent.view=this; //pass the parent a reference to the view	
	this.controller.objView=this; //pass the controller a reference to the view
	this.cmdStr=this.display + cmdStr; //command line the object was created with
	this.parent.document=this.document; //pass the base a pointer to the patch document
	this.parent.win=this.patch.patchView.oWin; //pass the base a pointer to the patch window
	
	//refs to the nodes & various bits of the object ui- these names are not very helpful.
	this.objViewNode=null; //pointer to the div that wraps everything for this object	
	this.objInput=null; //pointer to the object's default text input during editing.
	this.contentWrapper=null; //pointer to the user-editable wrapper around the object
	this.inputWrapper=null; //pointer to the div that contains the object name & arguments
	this.objectView=null; //pointer to html table that contains the object.
	this.contentContainer=null;
	this.autoCompleteList=null;
	
	this.outlets=obj.getOutlets();
	this.inlets=obj.getInlets();
	
	this.getObjWrapper=function() {
		var node=this.document.getElementById(this.id);
		return node;
	}
	
	this.getObjView=function() {
		return this.objectView;
	}
	
	this.getContentContainer=function() {
		return this.contentContainer;
	}
	
	this.getContentWrapper=function() {
		return this.contentWrapper;
	}
	
	this.getInputWrapper=function() {
		return this.inputWrapper;
	}
	
	this.getCurrentPosition=function() {
		var node=this.getObjWrapper();
		if(node) {
			var posArr=[parseInt(node.style.left+0),parseInt(node.style.top+0)];
			return posArr;		
		} else {
			return [];
		}
	}
	
	this.setPosition=function(x,y) {
		var node=this.getObjWrapper();
		if(node) {
			node.style.left=x+"px";
			node.style.top=y+"px";
		}
	}	
	
	//
	var stretchedFlag=false;
	
	this.selectObjView=function(e) {
		var objwrapper=this.getObjWrapper();
		var arr=objwrapper.getElementsByTagName("td");
				
		if(!(e.shiftKey && LilyUtils.controlOrCommand(e)) && this.usesCustomUI) { //if not resizing...
			this.parent.setWidth(this.parent.width+2); //expand the object to prevent unsightly wrapping.
			stretchedFlag=true;
		}	
		
		for(var i=0;i<arr.length;i++) {
			var node=arr[i];			
			if(arr[i].className=="contentContainer") {
				node.className="contentContainerSelected";
				break;
			} else if(arr[i].className=="contentContainerNoWrap") {
				node.className="contentContainerSelectedNoWrap";
				break;	
			}
		}
	}

	this.deSelectObjView=function() {
		var objwrapper=this.getObjWrapper();
		if(objwrapper) {
			
			var arr=objwrapper.getElementsByTagName("td");
			
			if(stretchedFlag) {
				this.parent.setWidth(this.parent.width-2);  //expand the object to prevent unsightly wrapping.
				stretchedFlag=false;				
			}
			
			for(var i=0;i<arr.length;i++) {
				var node=arr[i];
				if(arr[i].className=="contentContainerSelected") {
					node.className="contentContainer";
					break;
				} else if(arr[i].className=="contentContainerSelectedNoWrap") {
					node.className="contentContainerNoWrap";
					break;	
				}
			}
		}
	}
	
	this.inletOverView=function(id) {
		var selInletID=id.substring(0,(id.lastIndexOf("inlet")+"inlet".length)) + "Sel" + id.substring((id.lastIndexOf("inlet")+"inlet".length));
		this.document.getElementById(selInletID).style.visibility="visible";
	}
	
	this.inletOutView=function(id) {
		var selInletID=id.substring(0,(id.lastIndexOf("inlet")+"inlet".length)) + "Sel" + id.substring((id.lastIndexOf("inlet")+"inlet".length));
		this.document.getElementById(selInletID).style.visibility="hidden";
	}
	
	this.outletOverView=function(id) {
		var selOutletID=id.substring(0,(id.lastIndexOf("outlet")+"outlet".length)) + "Sel" + id.substring((id.lastIndexOf("outlet")+"outlet".length));
		this.document.getElementById(selOutletID).style.visibility="visible";
	}
	
	this.outletOutView=function(id) {
		var selOutletID=id.substring(0,(id.lastIndexOf("outlet")+"outlet".length)) + "Sel" + id.substring((id.lastIndexOf("outlet")+"outlet".length));
		this.document.getElementById(selOutletID).style.visibility="hidden";
	}
	
	this.startEditView=function() {
		this.contentWrapper.innerHTML=this.editObjectHTML; //insert the text input for editing
		this.objInput=this.getElByID(this.parent.createElID("input")); //get a ref to the node
		this.inputWrapper=null; //set ref to null
		
		if(this.objInput) {
			var args = (typeof obj.displayArgs == "string") ? obj.displayArgs : obj.args;
			this.objInput.value=this.display + ((args)?" ":"") + (obj.displayArgs==true?args:"");
			this.objInput.focus();
			this.objInput.select();
			this.controller.objInputControl.registerDefaultListeners(this.objInput);
			this.autoCompleteList=this.getElByID(this.parent.createElID("autoCompleteList"));		
		}
	}
	
	this.endEditView=function() {
		
		//if we new, valid input, we will return it- otherwise, we return null;
		if(this.objInput && this.objInput.value=="")
			var val="";
		else if(this.objInput && this.objInput.value && this.objInput.value!=this.cmdStr && (typeof this.objInput.value!='undefined' || this.objInput.value!=" "))
			var val=this.objInput.value;
		else 
			var val=null;
			
		this.objInput=null; //set ref to null
		this.autoCompleteList=null; //set ref to null
		this.contentWrapper.innerHTML=this.wrapperObjectHTML; //insert the input wrapper
		this.inputWrapper=this.getElByID(this.parent.createElID("inputWrapper")); //get a ref to the node
		
		//restore the font
		this.parent.setFontSize(this.parent.fontSize);
		this.parent.setFontFamily(this.parent.fontFamily);
		this.parent.setFontColor(this.parent.fontColor);
				
		
		if(this.inputWrapper)
			this.inputWrapper.innerHTML=LilyUtils.string2HTML(this.cmdStr); //escape any args
			
		this.updateObjSize();						
		return val;	
	}
		
	this.draw=function() {
	
		this.objViewNode = this.win.displayHTML(this.ui,this.id,this.top,this.left,true,this.parent.subPatcherID);
		
		if(!this.usesCustomUI) {
			this.inputWrapper=this.getElByID(this.parent.createElID("inputWrapper"));
			
			if(typeof this.parent.displayArgs == "boolean" && this.parent.displayArgs) {//display args ok...
				this.inputWrapper.innerHTML=LilyUtils.string2HTML(this.cmdStr); //escape any args
			} else if(typeof this.parent.displayArgs == "boolean" && !this.parent.displayArgs) {
				this.inputWrapper.innerHTML=this.display; //just the name since we're not displaying args
			} else if(typeof this.parent.displayArgs == "string" && this.parent.displayArgs) {
				this.inputWrapper.innerHTML=this.display+" "+this.parent.displayArgs; //display this specific args
			}	
			
		}
		
		if(!this.parent.subPatcherID) //no listeners for subpatch objects
			this.controller.addDefaultListeners();
		
		this.contentWrapper=this.getElByID(this.parent.createElID("contentWrapper"));
		this.objectView=this.getElByID(this.parent.createElID("objectView"));
		this.contentContainer=this.getElByID(this.parent.createElID("contentContainer")); //get a ref to the node

		this.parent.displayElement=this.contentContainer;
		this.parent.resizeElement=this.contentWrapper;	
		this.parent.animationElement=this.objViewNode;	
				
		//FIXME? hack to get the borders to draw correctly
		if(!this.controller.noBorders) {
			setTimeout(function(){
				if(thisPtr.name!="tmp"){
					thisPtr.controller.toggleEditState();
					thisPtr.parent.isPaste=false;					
				}
			},100);
		} else if(thisPtr.name!="tmp" && this.controller.noBorders) {
			thisPtr.controller.toggleEditState();
			thisPtr.parent.isPaste=false;
		}	
		
		setTimeout(function(){thisPtr.updateObjSize();},100);
	}
	
	this.getActualHeight=function() {
		return (!isNaN(parseInt(this.contentWrapper.offsetHeight)))?parseInt(this.contentWrapper.offsetHeight):0;		
	}
	
	this.getActualWidth=function() {
		return (!isNaN(parseInt(this.objectView.offsetWidth)))?parseInt(this.objectView.offsetWidth):0;
	}	
	
	this.updateObjSize=function() {
		
//		LilyDebugWindow.print("update" + this.parent.height + " " + this.parent.width)
//		2-3-07 -- changing the hard-coded padding below to 0 to fix a bug where objects with args had line breaks on creation.
//		not sure what else this will break...				
		
		if(!this.parent.height) {
			this.parent.height=(this.getActualHeight()+0); //hardcode the padding/border width here :<
//			this.parent.setHeight(parseInt(this.parent.height));
		}	

		if(!this.parent.width) {			
			this.parent.width=(this.getActualWidth()+0); //hardcode the padding/border width here :<
//			this.parent.setWidth(parseInt(this.parent.width));
		}	
			
//		LilyDebugWindow.print("update object size "+this.objectView.style.paddingLeft + " " + this.contentWrapper.style.paddingTop)	

	}
	
	this.remove=function() {
		this.win.removeElement(this.objViewNode);
		this.controller.removeDefaultListeners();
	}
	
	this.getElByID=function(id) {
		return this.document.getElementById(id);
	}
	
	this.toggleEditView=function()		{
		
		var editMode=this.patch.patchController.getEditable();
			
		if(editMode=="performance") {
			if(this.inputWrapper && this.parent.color=="#FFFFFF") {
				this.inputWrapper.style.background="#EEEEEE";	
				this.contentContainer.style.background="#EEEEEE";
			}	
			if(this.controller.getNoBorders())
				this.contentContainer.style.borderColor="transparent";
				
			if(this.objViewNode && this.parent.hiddenInPerf)
				this.objViewNode.style.display="none";//visibility="hidden";
				
			changeInletOutletVisibility("none","hidden");
			
			setTimeout(function(){
				thisPtr.parent.objectMoved();
			},10);		
				
		} else {
			if(this.inputWrapper && this.parent.color=="#FFFFFF") {
				this.inputWrapper.style.background="#FFFFFF";
				this.contentContainer.style.background="#FFFFFF";				
			}	
			this.contentContainer.style.borderColor="#000000";
			this.objViewNode.style.display="inherit";
			changeInletOutletVisibility("block","visible");
			
			setTimeout(function(){
				thisPtr.parent.objectMoved();
			},10);								
		}

	}
	
	function changeInletOutletVisibility(display,visibility) {
		var ins=thisPtr.parent.getInlets();
		var outs=thisPtr.parent.getOutlets();
		
		for(var x=0;x<ins.length;x++) {
//			LilyDebugWindow.print(thisPtr.parent.objID+"."+ins[x])
			thisPtr.getElByID(thisPtr.parent.objID+"."+ins[x]).style.display=display;
			thisPtr.getElByID(thisPtr.parent.objID+"."+ins[x]).style.visibility=visibility;
		}	
			
		for(var y=0;y<outs.length;y++) {
//			LilyDebugWindow.print(thisPtr.parent.objID+"."+outs[y])	
			thisPtr.getElByID(thisPtr.parent.objID+"."+outs[y]).style.display=display;
			thisPtr.getElByID(thisPtr.parent.objID+"."+outs[y]).style.visibility=visibility;		
		}
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
	//build inlet html
	this.buildInletHTML=function() {
	
		if(!this.inlets.length)
			return "";
		
		var inletHTML="" +
				"<table cellspacing=\"0\" cellpadding=\"0\" width=\"100%\">" +
					"<tr>" +
						"<td style=\"width:16px\" align=\"left\"><div id=\"" + this.parent.createElID("inletSel1") + "\" class=\"vanillaInletsSelected\"></div></td>";
						
						for(var j=1;j<(this.inlets.length-1);j++) {
							inletHTML+="<td style=\"width:16px\" align=\"center\"><div id=\""  + this.parent.createElID(("inletSel")+(j+1)) +"\" class=\"vanillaInletsSelected\"></div></td>";
						}
						
						if((this.inlets.length-1)>0)
							inletHTML+="<td style=\"width:16px\" align=\"right\"><div id=\""+ this.parent.createElID(("inletSel")+(this.inlets.length)) +"\" class=\"vanillaInletsSelected\"></div></td>";

						inletHTML+= "" +	
					"</tr>" 	+
					"<tr>" 	+
						"<td align=\"left\"><div id=\"" + this.parent.createElID("inlet1") + "\" class=\"vanillaInlets\"></div></td>";
					
						for(var k=1;k<(this.inlets.length-1);k++) {
							inletHTML+="<td align=\"center\"><div id=\""  + this.parent.createElID(("inlet")+(k+1)) +"\" class=\"vanillaInlets\"></div></td>";
						}
						
						if((this.inlets.length-1)>0)
							inletHTML+="<td align=\"right\"><div id=\""+ this.parent.createElID(("inlet")+(this.inlets.length)) +"\" class=\"vanillaInlets\"></div></td>";

						inletHTML+= "" +	
					"</tr>" +
				"</table>";	
		return inletHTML;
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//build outlet html
	this.buildOutletHTML=function() {
	
		if(!this.outlets.length)
			return "";
		
		var outletHTML="" +
				"<table cellspacing=\"0\" cellpadding=\"0\" width=\"100%\">" +
					"<tr>" +
						"<td style=\"width:16px\" align=\"left\"><div id=\"" + this.parent.createElID("outlet1") + "\" class=\"vanillaOutlets\"></div></td>";
						
						for(var j=1;j<(this.outlets.length-1);j++) {
							outletHTML+="<td style=\"width:16px\" align=\"center\"><div id=\""  + this.parent.createElID(("outlet")+(j+1)) +"\" class=\"vanillaOutlets\"></div></td>";
						}
						
						if((this.outlets.length-1)>0)
							outletHTML+="<td style=\"width:16px\" align=\"right\"><div id=\""+ this.parent.createElID(("outlet")+(this.outlets.length)) +"\" class=\"vanillaOutlets\"></div></td>";

						outletHTML+= "" +	
					"</tr>" 	+
					"<tr>" 	+
						"<td align=\"left\"><div id=\"" + this.parent.createElID("outletSel1") + "\" class=\"vanillaOutletsSelected\"></div></td>";
					
						for(var k=1;k<(this.outlets.length-1);k++) {
							outletHTML+="<td align=\"center\"><div id=\""  + this.parent.createElID(("outletSel")+(k+1)) +"\" class=\"vanillaOutletsSelected\"></div></td>";
						}
						
						if((this.outlets.length-1)>0)
							outletHTML+="<td align=\"right\"><div id=\""+ this.parent.createElID(("outletSel")+(this.outlets.length)) +"\" class=\"vanillaOutletsSelected\"></div></td>";

						outletHTML+= "" +	
					"</tr>" +
				"</table>";			
		return outletHTML;	
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	this.editObjectHTML="<input style=\"padding-right:5px;padding-left:5px;background:white;font-size:"+LilyUtils.sizeFontForPlatform(LilyUtils.getDefaultFont()[1])+"px;font-family:"+LilyUtils.getDefaultFont()[0]+"\" autocomplete=\"off\" type=\"text\" id=\"" + this.parent.createElID("input") + "\" class=\"defaultEntry\"/><br/><div id=\""+ this.parent.createElID("autoCompleteList") +"\"></div>";
	this.wrapperObjectHTML="<div style=\"min-width:28px;min-height:12px;padding:2px;\" id=\""+ this.parent.createElID("inputWrapper") +"\" ></div>";
	
	//build obj inner html
	this.buildObjHTML=function() {
	
		if(this.objHTML)
			return this.objHTML //return custom html if it exists
		else
			return this.wrapperObjectHTML;
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
	//combine obj wrapper & component html
	this.objWrapperViewHTML=function() {
		var containerClass=(this.usesCustomUI)?"contentContainer":"contentContainerNoWrap";
		var defaultObjHTML = "" +
			"<table id=\"" + this.parent.createElID("objectView") + "\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
				"<tr>" +
					"<td style=\"height:5px\" id=\"" + this.parent.createElID("inletContainer") + "\">" +	
						this.buildInletHTML() +
					"</td>" +
				"</tr>" +
				"<tr>" +
					"<td align=\"center\" id=\"" + this.parent.createElID("contentContainer") + "\" class=\""+containerClass+"\">" +
						"<table style=\"width:100%;height:100%;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
							"<tr>" +					
								"<td align=\"center\" valign=\"middle\" id=\"" + this.parent.createElID("contentWrapper") + "\">" +
									this.buildObjHTML() +
								"</td>" +
							"</tr>" +
						"</table>" +
					"</td>" +
				"</tr>" +
				"<tr>" +
					"<td style=\"height:5px\" id=\"" + this.parent.createElID("outletContainer") + "\">" +
						this.buildOutletHTML() +			
					"</td>" +
				"</tr>" +
			"</table>";
		return defaultObjHTML;
	}
	
	//complete obj html	
	this.ui = this.objWrapperViewHTML(); 	
}