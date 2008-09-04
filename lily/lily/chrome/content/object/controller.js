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
//		log("out connect " + id);
		return false;		
	}
	
	this.updateBorder=function() {
		var borderArr=thisPtr.patch.patchController.getBorder();

		thisPtr.objView.parent.setBorderStyle(borderArr[0],true);
		thisPtr.objView.parent.setBorderSize(parseInt(borderArr[1]),true);
		thisPtr.objView.parent.setBorderColor(borderArr[2],true);				

		//log(borderArr.toSource());
	}	
	
	this.updateFont=function() {
		var fontArr=thisPtr.patch.patchController.getFont();
		
		thisPtr.objView.parent.setFontFamily(fontArr[0]);
		thisPtr.objView.parent.setFontSize(parseInt(fontArr[1]));
		thisPtr.objView.parent.setFontColor(fontArr[2]);				
		
//		log(fontArr.toSource());
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
				borderWidth:thisPtr.objView.parent.borderWidth,
				borderStyle:thisPtr.objView.parent.borderStyle,
				borderColor:thisPtr.objView.parent.borderColor,				
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
		
		//border
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"borderChanged",thisPtr.updateBorder,"select");		
		
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
	
	this.overResizeHandle=function(e) {
		
		var bwidth = (thisPtr.objView.parent.borderWidth||0)*2;
		var offset = 5;
		var padding = 10;
		
		var ui = thisPtr.objView.getObjView();			
		var computed_width = ui.offsetWidth;
		var computed_height = ui.offsetHeight;
		
		//get the handle dimensions
		var bottom_left = thisPtr.objView.parent.left+computed_width+bwidth+offset+padding;
		var bottom_top 	= thisPtr.objView.parent.top+computed_height+bwidth+offset+padding;
		var top_left 	= thisPtr.objView.parent.left+computed_width+bwidth-padding;
		var top_top 	= thisPtr.objView.parent.top+computed_height+bwidth-padding;
		
		//get mouse coords
		var x = parseInt(e.clientX);
		var y = parseInt(e.clientY);
		
		//log(bottom_left+" "+bottom_top+" "+top_left+" "+top_top+" "+x+" "+y);
		
		if(
			(x>=top_left && x<=bottom_left) &&
			(y>=top_top && y<=bottom_top)
		) {
			//log("returning true");
			return true;
		}
		
		//log("returning false");
		return false;
	}
	
	//funnel events to drag & resize
	this.selectDelegate=function(e) {
		if((e.shiftKey && LilyUtils.controlOrCommand(e)) || thisPtr.overResizeHandle(e)) {
			
			if(e.type=="mousedown") {
				thisPtr.objResizeControl.mousedown(e);
			} else if(e.type=="mouseup") {
				thisPtr.objResizeControl.mouseup(e);
				thisPtr.objDrag.mouseup(e);					
			}			
				
		} else {
			
			if(e.type=="mousedown") {
				thisPtr.objDrag.mousedown(e);
			} else if(e.type=="mouseup") {
				thisPtr.objDrag.mouseup(e);
				thisPtr.objResizeControl.mouseup(e);
			}
		}		
	}
	
	this.deselect=function(e) {
				
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

		//border listener
		thisPtr.patchController.removePatchObserver(thisPtr.id,"borderChanged",thisPtr.updateBorder,"select");
		
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
		this.resizeType="handle";	
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
			thisPtr.resizeType=((e.shiftKey&&LilyUtils.controlOrCommand(e)))?"modifier":"handle";
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
						
			//kill the resize if we're too close to the edge or not in resize mode
			if(
					e.clientX <= 10||
					e.clientY <= 10||
					e.clientX >= (thisPtr.patch.patchView.xulWin.innerWidth-10)||
					e.clientY >= (thisPtr.patch.patchView.xulWin.innerHeight-40)||
					(!(e.shiftKey&&LilyUtils.controlOrCommand(e)) && thisPtr.resizeType=="modifier")
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
