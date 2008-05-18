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
*	Construct a new Connection
*	@class
*	@constructor
*/ 

function LilyConnectionSegment(parent,orientation,startLeft,startTop,endLeft,endTop) {
	
	this.orientation=orientation||null;
	this.startLeft=startLeft||null;
	this.startTop=startTop||null;
	this.endLeft=endLeft||null;
	this.endTop=endTop||null;
	
	this.startX=null; //used for drag
	this.startY=null; //used for drag
	this.mouseX=null; //used for drag
	this.mouseY=null; //used for drag
	this.diffX=null; //used for drag
	this.diffY=null; //used for drag
	
	this.ui=null;	
	this.isComplete=false;
	this.id=null;
	this.isFirstSegment=false;
	this.isLastSegment=false;
	this.isDraggable=false;		
	
	this.connection=parent;
	this.patchView=this.connection.patchView;
	this.patchController=this.connection.patchController;
	var thisPtr=this;
			
	this.drawDown=function(x,y) {
				
		if(!thisPtr.isComplete && !thisPtr.connection.controller.isFirstSegment() && Math.abs(thisPtr.startLeft-x)>Math.abs(thisPtr.startTop-y)) {	//don't change orientation of completed segments			
			thisPtr.orientation="horizontal"; //update
			this.endTop=this.startTop; //reset the end points in case orientation has changed.
		} else if(!thisPtr.isComplete) {
			thisPtr.orientation="vertical"; //update
			this.endLeft=this.startLeft; //reset the end points in case orientation has changed.		
		}		
		
		if(this.orientation=="vertical") {
			this.endTop=y; //update
			this.drawVerticalSegment(this.startLeft,this.startTop,this.startLeft,y);
		}	else if(!thisPtr.connection.controller.isFirstSegment())	{ 
			this.endLeft=x; //update
			this.drawHorizontalSegment(this.startLeft,this.startTop,x,this.startTop);
		}
	}
	
	this.drawUp=function(x,y) {
		
		if(!thisPtr.isComplete && Math.abs(thisPtr.startLeft-x)>Math.abs(thisPtr.startTop-y)) {	//don't change orientation of completed segments			
			thisPtr.orientation="horizontal"; //update
		} else if(!thisPtr.isComplete) {
			thisPtr.orientation="vertical"; //update
		}		
		
		if(this.orientation=="vertical") {
			this.startTop=y; //update
			this.drawVerticalSegment(this.endLeft,this.endTop,this.endLeft,y);
		}	else	{ 
			this.startLeft=x; //update
			this.drawHorizontalSegment(this.endLeft,this.endTop,x,this.endTop);
		}
	}	
	
	this.drawHorizontalSegment=function(startLeft,startTop,currLeft,currTop) {
	
		var sX=(startLeft < currLeft) ? startLeft : currLeft;
		var sY=startTop;
		var cX=(startLeft > currLeft) ? startLeft : currLeft;

		this.ui.style.left=sX+"px";
		this.ui.style.top=sY+"px";
		this.ui.style.height="3px"
		this.ui.style.width=(cX-sX)+"px";
		
		this.ui.style.borderTopStyle="solid";
		this.ui.style.borderTopColor="black";
		this.ui.style.borderTopWidth=((this.connection.controller.isSelected)?3:1)+"px";
	}
	
	this.drawVerticalSegment=function(startLeft,startTop,currLeft,currTop) {
	
		var sX=startLeft;
		var sY=(startTop < currTop) ? startTop : currTop;
		var cY=(startTop > currTop) ? startTop : currTop;
			
		this.ui.style.left=sX+"px";
		this.ui.style.top=sY+"px";
		this.ui.style.width="3px";
		this.ui.style.height=(cY-sY)+"px";
		
		this.ui.style.borderLeftStyle="solid";
		this.ui.style.borderLeftColor="black";
		this.ui.style.borderLeftWidth=((this.connection.controller.isSelected)?3:1)+"px";		

	}
	
	this.setzIndex=function(val) {
		this.ui.style.zIndex=parseInt(val);
	}
	
	this.nudge=function(x,y) {
	
		if(this.orientation=="vertical") {
			this.ui.style.left=x+"px";
			this.startLeft=this.endLeft=x;
		} else if(this.orientation=="horizontal") {
			this.ui.style.top=y+"px";
			this.startTop=this.endTop=y;
		}			
	}
	
	//mousemove- handled by moveSegment
	this.registerForSegmentMove=function() {
		
//		if(thisPtr.isDraggable)
//			return;		
		
		//set curr pos here
		thisPtr.isDraggable=true;	
		thisPtr.mouseX=thisPtr.patchController.mouseX;
		thisPtr.mouseY=thisPtr.patchController.mouseY;
		thisPtr.startX=parseInt(thisPtr.ui.style.left+0);
		thisPtr.startY=parseInt(thisPtr.ui.style.top+0);
		
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"mousemove",thisPtr.moveSegment,"edit");
	}
	
	this.unregisterForSegmentMove=function() {
		
//		if(!thisPtr.isDraggable)
//			return;
		
		//update
		thisPtr.isDraggable=false;
		thisPtr.startLeft=thisPtr.startLeft+thisPtr.diffX;
		thisPtr.startTop=thisPtr.startTop+thisPtr.diffY;
		thisPtr.endLeft=thisPtr.endLeft+thisPtr.diffX;
		thisPtr.endTop=thisPtr.endTop+thisPtr.diffY;	
		thisPtr.patchController.removePatchObserver(thisPtr.id,"mousemove",thisPtr.moveSegment,"edit");
		thisPtr.diffX=thisPtr.diffY=0; //zero out these variables		
	}
	
	//freeform move- calculate x/y & call move(x,y)
	this.moveSegment=function(e) {
		
		if(!thisPtr.isDraggable)
			return false;
			
		//calculate change in mouse movement
		thisPtr.diffX=e.clientX - thisPtr.mouseX;
		thisPtr.diffY=e.clientY - thisPtr.mouseY;
				
		//move it
		thisPtr.ui.style.left=(thisPtr.startX + thisPtr.diffX)+"px";
		thisPtr.ui.style.top=(thisPtr.startY + thisPtr.diffY)+"px";
	}
	
	this.startSegment=function(x,y) {
		this.ui=this.patchView.displayHTML("",null,null,null,false,this.connection.subPatcherID);
		this.ui.setAttribute("class","segment");
		this.ui.style.left=x+"px";
		this.ui.style.top=y+"px";
		
		//if we're using svg, make the div segments invisible
		if(!this.connection.compatibleConnection) {
			this.ui.style.visibility="hidden";
		}		
	}
		
	this.removeSegment=function() {
		this.patchView.removeElement(this.ui);
	}
	
	this.createSegment=function() {
		
		this.startSegment(this.startLeft,this.startTop);
		
		if(this.orientation=="vertical")
			this.drawVerticalSegment(this.startLeft,this.startTop,this.endLeft,this.endTop);
		else
			this.drawHorizontalSegment(this.startLeft,this.startTop,this.endLeft,this.endTop);
	}
	
	this.selectSegment=function() {
		if(this.orientation=="horizontal") {
			this.ui.style.borderTopWidth=3+"px";
		} else {
			this.ui.style.borderLeftWidth=3+"px";
		}
	}
	
	this.deSelectSegment=function() {
		if(this.orientation=="horizontal")  {
			this.ui.style.borderTopWidth=1+"px";
		} else {
			this.ui.style.borderLeftWidth=1+"px";
		}
	}	
}

/**
*	Construct a new SVGConnectionSegment
*	@class
*	@constructor
*/

function LilySVGConnectionSegment(parent,startLeft,startTop,endLeft,endTop) 
{
	
	this.ui=null;	
	this.svg=null;
	this.line=null;	
	
	this.connection=parent;
	this.patchView=this.connection.patchView;
	var thisPtr=this;
	
	this.startSegment=function(x,y) {
		this.ui=this.patchView.displayHTML("<svg xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"0px\" y1=\"0px\" x2=\"0px\" y2=\"0px\" stroke=\"black\" stroke-width=\"1px\"/></svg>",null,null,null,false,this.connection.subPatcherID);
		this.line=this.ui.getElementsByTagName("line")[0];
		this.ui.style.position='absolute';
		this.ui.style.zIndex=0;
		this.ui.style.left=(0+this.patchView.oWin.scrollX)+"px";
		this.ui.style.top=(0+this.patchView.oWin.scrollY)+"px";
		this.ui.style.height="98%";
		this.ui.style.width="100%";	
	    this.line.setAttribute("x1", (x-this.patchView.oWin.scrollX)+"px");
	    this.line.setAttribute("y1", (y-this.patchView.oWin.scrollY)+"px");
	    this.line.setAttribute("x2", (x-this.patchView.oWin.scrollX)+"px");
	    this.line.setAttribute("y2", (y-this.patchView.oWin.scrollY)+"px");
	}
		
	this.removeSegment=function() {
		this.patchView.removeElement(this.ui);
	}
	
	this.draw=function(x,y) {
	    this.line.setAttribute("x2", (x)+"px");
	    this.line.setAttribute("y2", (y)+"px");	
	}
	
	this.end=function() {
		this.removeSegment();
	}
}
 
/**
*	Construct a new Connection
*	@class
*	@constructor
*/

function LilyConnection(parent,inlet,outlet,segmentArray)
{
	this.inlet=inlet||null;
	this.outlet=outlet||null;
	var inletObj=null;
	var outletObj=null;
	this.segmentArray=segmentArray||[];
	this.patch=parent;
	this.patchController=this.patch.patchController;
	this.patchView=this.patch.patchView;
	this.currentSegment=null;
	this.currentSVGSegment=null;	
	this.isComplete=false;
	this.hiddenInPerf=false;	
	this.asyncMessaging=false;
	this.compatibleConnection=false;
	this.subPatcherID=null;
	this.zIndex=null;
	var thisPtr=this;
	
///////////////////////////////////////////////////////////////	
	
	this.setCompatibleConnection=function(b) {
		this.compatibleConnection=b;
	}
	
///////////////////////////////////////////////////////////////	

	this.getObjectzIndexes=function() {
		var inzIndex=parseInt(this.patch.getObj(this.inlet).parent.zIndex);
		var outzIndex=parseInt(this.patch.getObj(this.outlet).parent.zIndex);
		var maxzIndex=(inzIndex>outzIndex)?inzIndex:outzIndex;
		this.zIndex=maxzIndex;
		return maxzIndex;
	}
	
	
	this.setBringForward=function() {
		thisPtr.controller.setzIndex(++thisPtr.zIndex);
	}		
	
	this.setSendBack=function() {
		var val=((thisPtr.zIndex-1)>1)?thisPtr.zIndex-1:1;
		thisPtr.controller.setzIndex(val);	
	}


///////////////////////////////////////////////////////////////
	
	this.start=function(id) {
	
		if(this.currentSegment)
			return;
	
		this.outlet=id;
		outletObj=this.patch.getObj(this.outlet); //cache this for use in send().
		this.controller.startSegment(id);
		
		if(!this.compatibleConnection)
			this.controller.startSVGSegment(id);
	}
	
	this.end=function(id) {
	
		if(!this.currentSegment)
			return;
	
		this.inlet=id;
		inletObj=this.patch.getObj(this.inlet); //cache this for use in send().
		this.controller.endSegment(id);
		
		if(!this.compatibleConnection)
			this.controller.endSVGSegment(id);		
		
		this.create();
		this.controller.completeConnection();
	}
	
	this.abort=function() {
		this.remove();
		
		if(!this.compatibleConnection)
			this.controller.abortSVGSegment();		
	}
	
////////////////////////////////////////////////////////////////		
		
	this.addSegment=function() {
		thisPtr.segmentArray.push(thisPtr.currentSegment);
	}	
	
	this.clearCurrentSegment=function() {
		thisPtr.currentSegment=null;
	}
	
	this.clearCurrentSVGSegment=function() {
		thisPtr.currentSVGSegment=null;
	}	

	this.initCurrentSegment=function() {
		thisPtr.currentSegment=new LilyConnectionSegment(this);
	}
	
	this.initCurrentSVGSegment=function() {
		thisPtr.currentSVGSegment=new LilySVGConnectionSegment(this);
	}
	
	this.getCurrentSegment=function() {
		return thisPtr.currentSegment;
	}
	
	this.clearSegmentArray=function() {
		thisPtr.segmentArray=[];
	}
	
	//why is this called getPrevious?
	this.getPreviousSegment=function() {
		if(typeof this.segmentArray[this.segmentArray.length-1]!="undefined")
			return this.segmentArray[this.segmentArray.length-1];
		else
			return false;
	}
	
////////////////////////////////////////////////////////////////	
	
	this.getObjectType=function() {
		return "connection";
	}
	
	this.getIsSelected=function() {
		return this.controller.isSelected;
	}

////////////////////////////////////////////////////////////////
	
	this.create=function() {
		
		var inlet=(inletObj)?inletObj:inletObj=this.patch.getObj(this.inlet);
		var outlet=(outletObj)?outletObj:outletObj=this.patch.getObj(this.outlet);

		if(inlet && outlet) {
			this.controller.id=this.outlet+ "_" +this.inlet;
			outlet.connect(this.controller.id);
			inlet.connect(this.controller.id);
			this.patch.patchModel.addNode(this.controller.id,this);
		} else {
			//figure out what to do here
			//this.destroy();
		}
	}
	
	//requires a segment array
	this.createSavedConnection=function(pID) {
		
		this.subPatcherID=pID||null; //id if part of a sub-patcher	
		this.createSavedSegments(); //creates/draws the segments
		this.create(); //creates the connection between inlet & outlet
		this.controller.completeConnection(); //adds ids for segments, drag/selection listeners, etc
	}
	
	//if no segment array... needs only inlet & outlet ids
	this.createNewConnection=function(pID) {

		this.subPatcherID=pID||null; //id if part of a sub-patcher	
		
		var inletPos=thisPtr.controller.getEndCoords(this.inlet);
		var outletPos=thisPtr.controller.getStartCoords(this.outlet);
				
		//the segment to be split
		var currSeg={'orientation':'vertical','startLeft':outletPos[0],'startTop':outletPos[1],'endLeft':outletPos[0],'endTop':inletPos[1]};
		
		//calculate pos points here
		var total_length=Math.abs(currSeg.startTop-currSeg.endTop); //total seg length
		var splitSeg_length=(total_length-1)/2; //split seg length + 1px for the horizontal seg in the middle
		var seg1_endTop=(currSeg.startTop<currSeg.endTop)?(currSeg.startTop+splitSeg_length):(currSeg.startTop-splitSeg_length);
		var seg2_startTop=seg1_endTop;
		var seg2_endTop=(currSeg.startTop<currSeg.endTop)?(seg2_startTop+1):(seg2_startTop-1);
		var seg3_startTop=seg2_endTop;
		
		var seg1={"orientation":"vertical","startLeft":currSeg.startLeft,"startTop":currSeg.startTop,"endLeft":currSeg.endLeft,"endTop":seg1_endTop};
		var seg2={"orientation":"horizontal","startLeft":currSeg.startLeft,"startTop":seg2_startTop,"endLeft":currSeg.endLeft,"endTop":seg2_endTop};
		var seg3={"orientation":"vertical","startLeft":currSeg.startLeft,"startTop":seg3_startTop,"endLeft":currSeg.endLeft,"endTop":currSeg.endTop};
				
		//reset the seg array
		this.segmentArray=[seg1,seg2,seg3];
		
		//create new segments
		this.createSavedConnection(pID);

		this.controller.moveEndTo(inletPos[0],inletPos[1]); //nudge the last segment to the inlet		

	}

	this.createSavedSegments=function(start,end) {
		//draw the segments
		var arrStart=start||0;
		var arrEnd=end||this.segmentArray.length;
		
		for(var i=arrStart;i<arrEnd;i++) {
			var s=this.segmentArray[i];
			this.segmentArray[i]=new LilyConnectionSegment(this,s.orientation,s.startLeft,s.startTop,s.endLeft,s.endTop);
			this.segmentArray[i].createSegment();
			this.segmentArray[i].isComplete=true;
		}
	}

	this.remove=function() {
	
		//var outlet=this.patch.getObj(this.outlet);
		//var inlet=this.patch.getObj(this.inlet);
//		var inlet=(inletObj)?inletObj:this.patch.getObj(this.inlet);
//		var outlet=(outletObj)?outletObj:this.patch.getObj(this.outlet);

		if(outletObj) {	
			outletObj.deconnect(this.controller.id);
			outletObj=null;
		}	
			
		if(inletObj) {
			inletObj.deconnect(this.controller.id);
			inletObj=null;			
		}				
			
		this.destroy();
	}	
	
	this.destroy=function() {
		
		this.controller.deselect();
		this.controller.removeConnection();	
		
		for(var i=0;i<this.segmentArray.length;i++)
			this.segmentArray[i].removeSegment();
			
		if(this.currentSegment) {
			this.controller.abortSegment();	
			this.currentSegment.removeSegment();	
			this.clearCurrentSegment();
		}
		
		this.patch.patchModel.removeNode(this.controller.id);
	}
	
/////////////////////////////////////////////////////////////////	
	
	//send message
	this.send=function(msg) {
		
//		var obj=this.patch.getObj(this.inlet); //using cached value to improve perf of send
		
		if(this.asyncMessaging)
			setTimeout(function(){inletObj.processInput(msg);},0);
		else
			inletObj.processInput(msg);
	}
	
/////////////////////////////////////////////////////////////////
	
	this.controller=new LilyConnectionController(this);
	return this;
}


/**
	Construct a new ConnectionController
	@class
	@constructor
*/

function LilyConnectionController(parent) 
{
	this.connection=parent;
	this.patch=this.connection.patch;
	this.patchView=this.patch.patchView;
	this.patchController=this.patch.patchController;
	this.id=null;
	this.isSelected=false;
	var connectionPaused=false;
	var thisPtr=this;
	var inletSelected=false;
	var outletSelected=false;
	
	this.setHiddenInPerf=function(b) {
		thisPtr.connection.hiddenInPerf=b;
//		LilyDebugWindow.print("hiddeninperf after being set "+thisPtr.obj.hiddenInPerf)
	}	
	
	function inletOrOutletSelected(type) {
//		LilyDebugWindow.print("select " + type)
		
		if(type=="inlet")
			inletSelected=true;
		else
			outletSelected=true;
			
//		LilyDebugWindow.print("select " + type + " inletselected "+inletSelected+" outletSelected "+outletSelected)	
		
		if(inletSelected && outletSelected){
			thisPtr.select({type:"selectAll"},null);
		}
	}
	
	function inletOrOutletDeselected(type) {
//		LilyDebugWindow.print("deselect " + type)
		if(type=="inlet")
			inletSelected=false;
		else
			outletSelected=false;
			
		if(!inletSelected && !outletSelected && thisPtr.isSelected)
			thisPtr.deselect();			
			
//		LilyDebugWindow.print("deselect " + type + " inletselected "+inletSelected+" outletSelected "+outletSelected)	
					
	}	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
	this.isFirstSegment=function() {
		if(this.connection.segmentArray.length)
			return false;
		else
			return true;
	}
	
	this.isLastSegment=function() {
		if(this.connection.inlet && this.connection.outlet)
			return true;
		else
			return false;
	}
	
	this.isConnectionComplete=function() {
		return this.connection.isComplete;
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	this.getPreviousSegment=function(id) {

		for(var i=0;i<this.connection.segmentArray.length;i++) {
			//LilyDebugWindow.print(this.connection.segmentArray[i].id);
			if(this.connection.segmentArray[i].id==id && typeof this.connection.segmentArray[i-1]!="undefined") {
				return this.connection.segmentArray[i-1];
			}
		}
		return null;
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	this.getNextSegment=function(id) {

		for(var i=0;i<this.connection.segmentArray.length;i++) {
			//LilyDebugWindow.print(this.connection.segmentArray[i].id);
			if(this.connection.segmentArray[i].id==id && typeof this.connection.segmentArray[i+1]!="undefined") {
				return this.connection.segmentArray[i+1];
			}
		}
		return null;
	}		
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	//update the connection position after the object is modified
	this.updateInletConnection=function() {
		//do getPos of the inlet here- then move the connection to it
		if(thisPtr.patchView.getElByID(thisPtr.connection.inlet).style.display=="none") return; //bail if the inlets hidden		
		var posArr=thisPtr.getEndCoords(thisPtr.connection.inlet);
		thisPtr.moveEndTo(posArr[0],posArr[1]);		
//		LilyDebugWindow.print("update inlet-"+posArr.toSource());
	}
	
	//update the connection position after object is modified
	this.updateOutletConnection=function() {
		//do getPos of the inlet here- then move the connection to it
		if(thisPtr.patchView.getElByID(thisPtr.connection.inlet).style.display=="none") return;	 //bail if the outlets hidden		
		var posArr=thisPtr.getStartCoords(thisPtr.connection.outlet);
		thisPtr.moveStartTo(posArr[0],posArr[1]);				
//		LilyDebugWindow.print("update outlet-"+posArr.toSource());	
	}	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
	//returns the outlet or the the previous segments endpoint
	this.getStartCoords=function(id) {
		if((this.isFirstSegment() || this.isConnectionComplete()) && id) {
			var a=this.patchView.findPos(this.patchView.getElByID(id));
			//adjust to the top of the outlet
			return [a[0],(a[1])]; //need to constrain to pos of outlet
		} else {
			return [this.connection.getPreviousSegment().endLeft,this.connection.getPreviousSegment().endTop]
		}
	}

	//returns the inlet or null
	this.getEndCoords=function(id) {
		if((this.isLastSegment() || this.isConnectionComplete()) && id) {
			var a=this.patchView.findPos(this.patchView.getElByID(id));
			//adjust to the bottom of the inlet
			return [a[0],(a[1]+3)]; //need to constrain to pos of outlet
		} else {
			return null;
		}
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	this.startSegment=function(id) {
		
		var elID=id||null;
		var arr=this.getStartCoords(elID);
		var x=arr[0];
		var y=arr[1];

		thisPtr.connection.initCurrentSegment();
		thisPtr.connection.currentSegment['startLeft']=x;
		thisPtr.connection.currentSegment['startTop']=y;
		thisPtr.connection.currentSegment['endLeft']=x;
		thisPtr.connection.currentSegment['endTop']=y;		
		thisPtr.connection.currentSegment.startSegment(x,y);
		registerConnectionHandler();
	}
	
	this.startSVGSegment=function(id) {
		
		var elID=id||null;
		var arr=this.getStartCoords(elID);
		var x=arr[0];
		var y=arr[1];

		thisPtr.connection.initCurrentSVGSegment();
		thisPtr.connection.currentSVGSegment['startLeft']=x;
		thisPtr.connection.currentSVGSegment['startTop']=y;
		thisPtr.connection.currentSVGSegment['endLeft']=x;
		thisPtr.connection.currentSVGSegment['endTop']=y;		
		thisPtr.connection.currentSVGSegment.startSegment(x,y);
		registerSVGConnectionHandler();
	}
	
	this.abortSegment=function() {
		unRegisterConnectionHandler();	
	}
	
	this.abortSVGSegment=function() {
		this.endSVGSegment();	
	}	
	
	this.endSVGSegment=function(id) {
		unRegisterSVGConnectionHandler();
		this.connection.currentSVGSegment.end();
		this.connection.clearCurrentSVGSegment();									
	}	
	
	this.endSegment=function(id) {

		var elID=id||null;		
		unRegisterConnectionHandler();
		this.connection.addSegment();
							
		var segArr=this.connection.segmentArray;
		var currSegOrientVert=segArr[segArr.length-1].orientation=="vertical";
		var prevSegOrientVert=(segArr.length>1)?segArr[segArr.length-2].orientation=="vertical":false;		

		if(currSegOrientVert && prevSegOrientVert) //vertical
			this.combineSegments("vertical");
		else if(!currSegOrientVert && !prevSegOrientVert) //horizontal
			this.combineSegments("horizontal");

		if(this.isLastSegment()) {
		
			this.connection.currentSegment.isComplete=true;
			this.connection.clearCurrentSegment();
			var arr=this.getEndCoords(elID);
			
			if(arr && this.connection.segmentArray.length>1)
				this.moveEndTo(arr[0],arr[1]); //nudge the segment to the inlet	
				
		} else {		
			this.connection.currentSegment.isComplete=true;
			this.connection.initCurrentSegment();
		}
	}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////	

	this.setzIndex=function(val) {
		var segArr=this.connection.segmentArray;
		for(var i=0;i<segArr.length;i++)
			segArr[i].setzIndex(val);
	}
		
////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
	//assumes the connection is complete- also assumes last segments are vertical.
	this.moveEndTo=function(x,y) {
		this.connection.segmentArray[this.connection.segmentArray.length-1].drawDown(x,y); //move last segment  to y
		this.connection.segmentArray[this.connection.segmentArray.length-1].nudge(x,y); //move last segment to x
		this.connection.segmentArray[this.connection.segmentArray.length-2].drawDown(x,y); //move penultimate segment to x
	}
	
	this.moveStartTo=function(x,y) {
		this.connection.segmentArray[0].drawUp(x,y); //move first segment  to y
		this.connection.segmentArray[0].nudge(x,y); //move first segment to x
		this.connection.segmentArray[1].drawUp(x,y); //move second segment to x
	}
	
	this.moveSegmentTo=function(x,y,index) {
		this.connection.segmentArray[index].nudge(x,y); //move first segment  to y
		this.connection.segmentArray[index-1].drawDown(x,y); //move first segment to x
		this.connection.segmentArray[index+1].drawUp(x,y); //move second segment to x
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
	function draw(e) {
		thisPtr.connection.currentSegment.drawDown((e.clientX+thisPtr.patchView.oWin.scrollX),(e.clientY+thisPtr.patchView.oWin.scrollY));
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	function drawSVG(e) {		
		thisPtr.connection.currentSVGSegment.draw(e.clientX,e.clientY);
	}
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
	//split a single segment into 3 segments- assumes this single segment is vertical
	this.splitSegment=function() {
	
		//the segment to be split
		var currSeg=this.connection.segmentArray[0];
		
		//calculate pos points here
		var total_length=Math.abs(currSeg.startTop-currSeg.endTop); //total seg length
		var splitSeg_length=(total_length-1)/2; //split seg length + 1px for the horizontal seg in the middle
		var seg1_endTop=(currSeg.startTop<currSeg.endTop)?(currSeg.startTop+splitSeg_length):(currSeg.startTop-splitSeg_length);
		var seg2_startTop=seg1_endTop;
		var seg2_endTop=(currSeg.startTop<currSeg.endTop)?(seg2_startTop+1):(seg2_startTop-1);
		var seg3_startTop=seg2_endTop;
		
		var seg1={"orientation":"vertical","startLeft":currSeg.startLeft,"startTop":currSeg.startTop,"endLeft":currSeg.endLeft,"endTop":seg1_endTop};
		var seg2={"orientation":"horizontal","startLeft":currSeg.startLeft,"startTop":seg2_startTop,"endLeft":currSeg.endLeft,"endTop":seg2_endTop};
		var seg3={"orientation":"vertical","startLeft":currSeg.startLeft,"startTop":seg3_startTop,"endLeft":currSeg.endLeft,"endTop":currSeg.endTop};
		
		//remove old segment
		this.connection.segmentArray[0].removeSegment();
		
		//reset the seg array
		this.connection.segmentArray=[seg1,seg2,seg3];
		
		//create new segments
		this.connection.createSavedSegments();
		
		var arr=this.getEndCoords(this.connection.inlet);
		this.moveEndTo(arr[0],arr[1]); //nudge the last segment to the inlet
		
		//nudge the middle segment to close any unsightly gaps that might have occurred.
		this.moveSegmentTo(this.connection.segmentArray[1].startLeft,this.connection.segmentArray[1].startTop+5,1)
		
	}
	
	this.combineSegments=function(orientation) {
	//	LilyDebugWindow.print("two verticals");	

		var segArr=this.connection.segmentArray;
		var currSeg=segArr[segArr.length-1];
		var prevSeg=segArr[segArr.length-2];		

		var seg1={"orientation":orientation,"startLeft":prevSeg.startLeft,"startTop":prevSeg.startTop,"endLeft":currSeg.endLeft,"endTop":currSeg.endTop};

		//remove old segments
		this.connection.segmentArray[segArr.length-2].removeSegment();
		this.connection.segmentArray[segArr.length-1].removeSegment();			
		this.connection.segmentArray.splice(segArr.length-2,2);

		//reset the seg array
		this.connection.segmentArray.push(seg1);

		//create new segment
		this.connection.createSavedSegments(segArr.length-1,segArr.length);
	}	
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//mouseup
	function pauseConnection(e) {
		if(thisPtr.connection.compatibleConnection){	
			connectionPaused=true;
		}
	}
	
	//mousedown
	function resumeConnection(e) {
		if((!LilyUtils.controlOrCommand(e) && !e.altKey && thisPtr.connection.compatibleConnection)) { //end this segment & create a new one.
			updateConnection();
			connectionPaused=false;
		} else if(LilyUtils.controlOrCommand(e) && !e.altKey) { //if the meta key is down then cancel the connection.
			connectionPaused=false;
			thisPtr.patchController.abortCurrentConnection();
		}	
	}
	
	function updateConnection() {
		if(connectionPaused) {
			//LilyDebugWindow.print("update Connection");	
			thisPtr.endSegment();
			thisPtr.startSegment(); 
		}	
	}
	
	this.completeConnection=function() {

		if(this.connection.segmentArray.length==1)
			this.splitSegment();
			
		var zindex=this.connection.getObjectzIndexes();
				
		//give ids to all the segments/segment views
		for(var i=0;i<this.connection.segmentArray.length;i++) {
			this.connection.segmentArray[i].id=this.id+"_segment"+i;
			this.connection.segmentArray[i].ui.setAttribute("id",(this.id+"_segment"+i));
			this.connection.segmentArray[i].ui.style.visibility="visible";			
			this.connection.segmentArray[i].ui.style.zIndex=zindex;
			this.patchController.attachObserver(thisPtr.connection.segmentArray[i].id,"mousedown",LilyUtils.preventDefault,"all");			
		}
		
		//set some more segment properties
		this.connection.segmentArray[0].isFirstSegment=true;
		this.connection.segmentArray[this.connection.segmentArray.length-1].isLastSegment=true;
		
//		setTimeout(function(){thisPtr.addDefaultListeners();},100);
		thisPtr.addDefaultListeners();
		
		this.connection.isComplete=true;
	}
	
	this.addDefaultListeners=function() {
		
		if(!this.connection.subPatcherID) {

			this.patchController.attachPatchObserver(this.id,"selectAll",function(event){thisPtr.select(event,null)},"edit");		

			//add listener on this object for patch edit state change
			this.patchController.attachPatchObserver(thisPtr.id,"editabilityChange",toggleEditState,"all");

			this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.inlet)+"_objSelected"),function(){inletOrOutletSelected("inlet")},"edit");		
			this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.inlet)+"_objDeSelected"),function(){inletOrOutletDeselected("inlet")},"edit");		
			this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.outlet)+"_objSelected"),function(){inletOrOutletSelected("outlet")},"edit");		
			this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.outlet)+"_objDeSelected"),function(){inletOrOutletDeselected("outlet")},"edit");	

//			LilyDebugWindow.print(this.patchController.getParentID(this.connection.outlet)+"_objDeSelected")	

			//register for segment selection here
			for(var j=0;j<this.connection.segmentArray.length;j++) {
				var k=j;
				with({index:k}) {
						this.patchController.attachObserver(thisPtr.connection.segmentArray[index].id,"mousedown",function(event){thisPtr.select(event,index)},"edit");
				}
			}

			//register for mouseup after selection to remove drag listener
			for(var l=0;l<this.connection.segmentArray.length;l++) {
				var m=l;
				with({index:m}) {
						this.patchController.attachObserver(thisPtr.connection.segmentArray[index].id,"mouseup",thisPtr.connectionDrag.unregisterForSegmentDrag,"edit");
						this.patchController.attachPatchObserver(thisPtr.connection.segmentArray[index].id,"mouseup",thisPtr.connectionDrag.unregisterForSegmentDrag,"edit");
				}
			}				
		}

		//register for object drag events
		this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.outlet)+"_moveStart"),this.connectionDrag.registerForOutletDrag,"edit");
		this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.inlet)+"_moveStart"),this.connectionDrag.registerForInletDrag,"edit");
		this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.outlet)+"_moveStop"),this.connectionDrag.unregisterForOutletDrag,"edit");
		this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.inlet)+"_moveStop"),this.connectionDrag.unregisterForInletDrag,"edit");						
		this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.inlet)+"_moved"),this.updateInletConnection,"all");
		this.patchController.attachPatchObserver(this.id,(this.patchController.getParentID(this.connection.outlet)+"_moved"),this.updateOutletConnection,"all");

	}
	
	this.removeConnection=function() {
		
		if(this.connection.currentSegment) //if we're still making a connection, then bail.
			return;
		
		//unregister handlers for all segments here
		for(var j=0;j<this.connection.segmentArray.length;j++) {
			this.patchController.removeAllObserversByID(this.connection.segmentArray[j].ui.id);
			this.patchController.removeAllPatchObserversByID(thisPtr.connection.segmentArray[j].id);
			
			//LilyDebugWindow.print(">>>>>>>>"+this.connection.segmentArray[j].ui.id);	
		}
		
		this.patchController.removeAllPatchObserversByID(this.id);		
		
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////	

	function toggleEditState() {
		var editMode=thisPtr.patch.patchController.getEditable();
		if(editMode=="performance" && thisPtr.connection.hiddenInPerf) {
			changeVisibility("none","hidden");
		} else {
			changeVisibility("inherit","visible");
		}	
	}
	
	function changeVisibility(display,visibility) {
		//select view
		for(var i=0;i<thisPtr.connection.segmentArray.length;i++) {
			thisPtr.connection.segmentArray[i].ui.style.visibility=visibility;
			thisPtr.connection.segmentArray[i].ui.style.display=display;
		}
	}
	
	this.select=function(e,index) {

		//no selection if we're still drawing the connection
		if(thisPtr.patchController.currentConnection||thisPtr.isSelected)
			return;
			
		thisPtr.patchController.deselectAll(e);
		
//		LilyDebugWindow.print("connection select "+index);
		//thisPtr.patchController.setObjectSelected(thisPtr);
		
		//register for delete & deselect
		thisPtr.patchController.attachObserver("canvas","mousedown",thisPtr.deselect,"select");
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"deleteKey",function(){thisPtr.patch.deleteObject(thisPtr.id)},"select");

		//hidden in perf
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"hiddenInPerf",function(){thisPtr.setHiddenInPerf(true);},"select");
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"visibleInPerf",function(){thisPtr.setHiddenInPerf(false);},"select");
					
		//forward/back
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"bringForward",thisPtr.connection.setBringForward,"select");
		thisPtr.patchController.attachPatchObserver(thisPtr.id,"sendBack",thisPtr.connection.setSendBack,"select");
				
		//select view
		for(var i=0;i<thisPtr.connection.segmentArray.length;i++)
			thisPtr.connection.segmentArray[i].selectSegment();
			
		thisPtr.isSelected=true;			
			
		//don't set drag listeners for first & last segments or if there's no specific segment selected- i.e. select all
		if(!index || thisPtr.connection.segmentArray[index].isFirstSegment || thisPtr.connection.segmentArray[index].isLastSegment)
			return;
			
		//mousedown- register the segment for drag
		thisPtr.connectionDrag.registerForSegmentDrag(e,index);			
	}
	
	this.deselect=function() {
	
		//thisPtr.patchController.removeObjectSelected(thisPtr.id);
		//if(thisPtr.connectionDrag.isDraggable)
		//	return;
		
//		LilyDebugWindow.print("connection deselect "+thisPtr.id);
		
		if(!thisPtr.isSelected)
			return;
		
		thisPtr.patchController.removeObserver("canvas","mousedown",thisPtr.deselect,"select");
		thisPtr.patchController.removePatchObserver(thisPtr.id,"deleteKey",function(){thisPtr.patch.deleteObject(thisPtr.id)},"select");

		//visibility in perf
		thisPtr.patchController.removePatchObserver(thisPtr.id,"hiddenInPerf",function(){thisPtr.setHiddenInPerf(true);},"select");
		thisPtr.patchController.removePatchObserver(thisPtr.id,"visibleInPerf",function(){thisPtr.setHiddenInPerf(false);},"select");
	
		for(var i=0;i<thisPtr.connection.segmentArray.length;i++)
			thisPtr.connection.segmentArray[i].deSelectSegment();
			
		thisPtr.isSelected=false;	
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////	

	//change these to use addPatchObserver
	function registerConnectionHandler() {
		thisPtr.patchController.document.addEventListener("mousemove",draw,false);
		thisPtr.patchController.document.addEventListener("mouseup",pauseConnection,false);
		thisPtr.patchController.document.addEventListener("mousedown",resumeConnection,false);
	}
	
	function unRegisterConnectionHandler() {
		thisPtr.patchController.document.removeEventListener("mousemove",draw,false);
		thisPtr.patchController.document.removeEventListener("mouseup",pauseConnection,false);
		thisPtr.patchController.document.removeEventListener("mousedown",resumeConnection,false);	
	}
	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//change these to use addPatchObserver
	function registerSVGConnectionHandler() {
		thisPtr.patchController.document.addEventListener("mousemove",drawSVG,false);
//		thisPtr.patchController.document.addEventListener("mouseup",pauseConnection,false);
//		thisPtr.patchController.document.addEventListener("mousedown",resumeConnection,false);
	}
	
	function unRegisterSVGConnectionHandler() {
		thisPtr.patchController.document.removeEventListener("mousemove",drawSVG,false);
//		thisPtr.patchController.document.removeEventListener("mouseup",pauseConnection,false);
//		thisPtr.patchController.document.removeEventListener("mousedown",resumeConnection,false);	
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
		singleton to encapsulate the completed connection's drag functionality
	*/	
	this.connectionDrag=new function(parent) {
	
		this.connController=parent;
		this.connection=this.connController.connection; 
		this.patchController=this.connection.patchController;
		this.patch=this.connection.patch;
		//this.ui=null;
		this.isDraggable=false;		
		this.startX;
		this.startY;
		this.mouseX;
		this.mouseY;
		this.segmentToDrag=null;
		this.registeredForInletDrag=false;
		this.registeredForOutletDrag=false;
		this.registeredForInletOutletDrag=false;
		
		var thisPtr=this;
	
		this.dragWithInlet=function(e) {
			//drag logic happens here
			//LilyDebugWindow.print("inlet dragging "+thisPtr.id);
			if(!thisPtr.isDraggable)
				return false;
										
			var x=thisPtr.startX + e.clientX - thisPtr.mouseX;
			var y=thisPtr.startY + e.clientY - thisPtr.mouseY;
			
			//LilyDebugWindow.print("inlet dragging "+x+" "+y);				
			
			thisPtr.connController.moveEndTo(x,y);
			return false;
		}
		
		this.dragWithOutlet=function(e) {
			//LilyDebugWindow.print("outlet dragging "+thisPtr.id);
			if(!thisPtr.isDraggable)
				return false;	

			var x=thisPtr.startX + e.clientX - thisPtr.mouseX;
			var y=thisPtr.startY + e.clientY - thisPtr.mouseY;
			
			//LilyDebugWindow.print("outlet dragging "+x+" "+y);	
			
			thisPtr.connController.moveStartTo(x,y);
			return false;		
		}
		
		this.registerForInletDrag=function() {
		
//			LilyDebugWindow.print("reg for inlet drag "+thisPtr.connController.id + " " + thisPtr.isDraggable);
			
//			if(thisPtr.isDraggable)
//				return;			
			
			thisPtr.isDraggable=true;
			thisPtr.registeredForInletDrag=true;
					
			//check if we've already registered for outletdrag- if so, abort & registerForInletOutletDrag
			if(thisPtr.registeredForOutletDrag)
				return thisPtr.registerForInletOutletDrag();
			
			thisPtr.startX=thisPtr.connection.segmentArray[thisPtr.connection.segmentArray.length-1].endLeft;	
			thisPtr.startY=thisPtr.connection.segmentArray[thisPtr.connection.segmentArray.length-1].endTop;
			thisPtr.mouseX=thisPtr.patch.patchController.mouseX;
			thisPtr.mouseY=thisPtr.patch.patchController.mouseY;

			thisPtr.patchController.attachPatchObserver(thisPtr.connController.id,"mousemove",thisPtr.dragWithInlet,"edit");
		}
		
		this.registerForOutletDrag=function() {
		
//			LilyDebugWindow.print("reg for outlet drag"+thisPtr.connController.id + " " + thisPtr.isDraggable);
			
//			if(thisPtr.isDraggable)
//				return;			
			
			thisPtr.isDraggable=true;
			thisPtr.registeredForOutletDrag=true;
			
			//check if we've already registered forinletdrag- if so, abort & registerForInletOutletDrag
			if(thisPtr.registeredForInletDrag)
				return thisPtr.registerForInletOutletDrag();			
			
			thisPtr.startX=thisPtr.connection.segmentArray[0].startLeft;
			thisPtr.startY=thisPtr.connection.segmentArray[0].startTop;
			thisPtr.mouseX=thisPtr.patch.patchController.mouseX;
			thisPtr.mouseY=thisPtr.patch.patchController.mouseY;

			thisPtr.patchController.attachPatchObserver(thisPtr.connController.id,"mousemove",thisPtr.dragWithOutlet,"edit");
		}	
		
		this.unregisterForInletDrag=function(e) {
		
//			LilyDebugWindow.print("unreg for inlet drag"+thisPtr.connController.id + " " + thisPtr.isDraggable);
			
//			if(!thisPtr.isDraggable)
//				return;			
			
			thisPtr.isDraggable=false;
			thisPtr.registeredForInletDrag=false;
			
			//unregisterForInletOutletDrag
			if(thisPtr.registeredForInletOutletDrag)
				thisPtr.unregisterForInletOutletDrag();				
			
			//thisPtr.connController.updatePos();					
			thisPtr.patchController.removePatchObserver(thisPtr.connController.id,"mousemove",thisPtr.dragWithInlet,"edit");
		}
		
		this.unregisterForOutletDrag=function(e) {
		
//			LilyDebugWindow.print("unreg for outlet drag"+thisPtr.connController.id + " " + thisPtr.isDraggable);
			
//			if(!thisPtr.isDraggable)
//				return;			
			
			thisPtr.isDraggable=false;
			thisPtr.registeredForOutletDrag=false;
			
			//unregisterForInletOutletDrag
			if(thisPtr.registeredForInletOutletDrag)
				thisPtr.unregisterForInletOutletDrag();				
			
			//thisPtr.connController.updatePos();	
			thisPtr.patchController.removePatchObserver(thisPtr.connController.id,"mousemove",thisPtr.dragWithOutlet,"edit");
		}
		
		//this should be set on mouse down whether the connection is already selected or not.
		this.registerForSegmentDrag=function(e,index) {
		
//			LilyDebugWindow.print(">>>>>>>>reg for segment drag" + " " + thisPtr.isDraggable);
//			if(thisPtr.isDraggable)
//				return;			
			
			thisPtr.startX=thisPtr.connection.segmentArray[index].startLeft;
			thisPtr.startY=thisPtr.connection.segmentArray[index].startTop;
			thisPtr.mouseX=parseInt(e.clientX);
			thisPtr.mouseY=parseInt(e.clientY);
		
			thisPtr.isDraggable=true;
			thisPtr.segmentToDrag=index;
			thisPtr.patchController.attachPatchObserver(thisPtr.connController.id,"mousemove",thisPtr.dragSegment,"edit");
//			thisPtr.patchController.attachObserver(thisPtr.connection.segmentArray[index].id,"mouseout",thisPtr.unregisterForSegmentDrag,"edit");
		}
		
		//this should be called on mouse up after a segment mousedown.
		this.unregisterForSegmentDrag=function() {
		
//			LilyDebugWindow.print(">>>>>>>>unreg for segment drag" + " " + thisPtr.isDraggable);
			if(!thisPtr.isDraggable) 
				return;
		
			thisPtr.isDraggable=false;
			thisPtr.segmentToDrag=null;
			thisPtr.patchController.removePatchObserver(thisPtr.connController.id,"mousemove",thisPtr.dragSegment,"edit");
//			thisPtr.patchController.removeObserver(thisPtr.connection.segmentArray[index].id,"mouseout",thisPtr.unregisterForSegmentDrag,"edit");
		}
		
		this.dragSegment=function(e) {
			
			if(!thisPtr.isDraggable || !thisPtr.segmentToDrag)
				return false;	

			var x=thisPtr.startX + parseInt(e.clientX) - thisPtr.mouseX;
			var y=thisPtr.startY + parseInt(e.clientY) - thisPtr.mouseY;
			
			//LilyDebugWindow.print("segment dragging "+x+" "+y);	
			
			thisPtr.connController.moveSegmentTo(x,y,thisPtr.segmentToDrag);
			return false;
		}
		
		//register all segments for dragging here- loop thru seg array & call register function
		this.registerForInletOutletDrag=function() {			
			
//			LilyDebugWindow.print("register for inlet/outlet drag");
			
			if(thisPtr.registeredForInletDrag)
				thisPtr.unregisterForInletDrag();
				
			if(thisPtr.registeredForOutletDrag)
				thisPtr.unregisterForOutletDrag();
			
			thisPtr.registeredForInletOutletDrag=true;
			for(var i=0; i<thisPtr.connection.segmentArray.length; i++) {
				thisPtr.connection.segmentArray[i].registerForSegmentMove();
//				thisPtr.connection.segmentArray[i].selectSegment();
			}
			
//			this.connController.select({type:"selectAll"},null);
		}
		
		//unregister all segments for drag 
		this.unregisterForInletOutletDrag=function() {
			
//			LilyDebugWindow.print("unregister for inlet/outlet drag");

			thisPtr.registeredForInletOutletDrag=false;
			for(var i=0; i<thisPtr.connection.segmentArray.length; i++) {
				thisPtr.connection.segmentArray[i].unregisterForSegmentMove();
//				thisPtr.connection.segmentArray[i].deSelectSegment();				
			}
		}
		
	}(this);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////