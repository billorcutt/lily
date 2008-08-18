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