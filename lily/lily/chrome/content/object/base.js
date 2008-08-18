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
