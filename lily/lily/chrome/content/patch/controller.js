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
	this.isMouseDown=false; //flag to tell if mouse is down.	
	
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
		
		if(
			(
			e && 
				(
				LilyUtils.selectionModifyingKeyDown(e)||
				e.type=="selectAll"||
				e.type=="marqueeSelection"||
				e.type=="paste"
				)
			)
		)
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
		thisPtr.isMouseDown=true;		
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
		thisPtr.isMouseDown=false;		
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