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
*	Construct a new patcher object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $patcher(param)
{
	var thisPtr=this;
//	this.resetSize=false; //don't reflow after a font change, etc.
	var pid = "patch0";	//id for the patcher
	var thisPatch = {obj:null,id:pid,file:null,json:null}; //this is the patch in the iframe
	Lily.patcherReloadFlag = false; //true if we're reloading the object- tacking this on Lily since we need to persist this value while refreshing the object.
	
	var openPatchWin = null; //this is the patch object for the open edit window.

	//flag to determine if we've got a patch string or file path
	var isPatchString=(/var patch={/.test(param)||!param.length);
			
	var pArr = (!isPatchString)?LilyUtils.splitArgs(param):[];
	this.fPath = (!isPatchString)?pArr.shift():""; //pull off the path
	this.pStr = (isPatchString)?param:"";
	this.displayArgs=(isPatchString)?false:true; //don't display argument if it isn't a patch path
	this.patchArgs=(!isPatchString)?pArr.join(" "):""; //rest of args as a string
	
	if(!isPatchString && /##\w+##/.test(param)) {
		this.displayName = param.match(/##(\w+)##/)[1];
		this.displayArgs = false;
	}
	
	//inlet/outlet arrays
	var tmpIn=[];
	var tmpOut=[];
	
	//replace placeholders with args
	function replacePatchArgs(arg_str,data) {
		var patch_str = data;
		var tmp = LilyUtils.splitArgs(arg_str);
		for(var i=0;i<tmp.length;i++) {
			var re = new RegExp("\\#"+(i+1),"g");
			patch_str=patch_str.replace(re,tmp[i]);
		}			
		return patch_str;	
	}	
	
	//refresh the object when the patch we're editing is updated.
	function reloadPatch() {
				
		setTimeout(function(){
			Lily.patcherReloadFlag=true; //start reload				
			var o = thisPtr.parent.replaceObject(thisPtr,"patcher",thisPtr.args);
			o.controller.cleanupOutletConnections();	
			Lily.patcherReloadFlag=false; //reload over
		},100);	
			
	}		
			
	//get the file and read the patch string in	
	function loadPatch() {
		
		if(thisPtr.fPath) {
			
			var filepath = LilyUtils.getFilePath(thisPtr.fPath);

			if(!filepath) { //bail if the path isn't correct
				LilyDebugWindow.error("patch not found");
				return;
			}

			//get the data- FIXME - need a way to access http/file/chrome patch
			var fileObj = LilyUtils.readFileFromPath(filepath,true);
			var file=fileObj.file;
			var data=replacePatchArgs(thisPtr.patchArgs,fileObj.data);
			
		} else {
			var file=LilyUtils.getTempFile(); //create a temp file to hold the patch.
			LilyUtils.writeFile(file,thisPtr.pStr);
			var data=thisPtr.pStr;
		}
		
		//update the thisPatch object
		thisPatch.json=data;
		thisPatch.file=file;
				
		//eval the patch string to get the inlet/outlet count
		try {
			eval(data);
		} catch(e) {
			LilyDebugWindow.error(e.name + ": " + e.message);
			return;
		}
		
		if(typeof patch != "undefined") {

			//push all the inlets into an array
			for(var x in patch.objArray) {
				if(patch.objArray[x].name=="inlet") {
					tmpIn.push(patch.objArray[x]);				
				}
			}

			//push all the outlets into an array
			for(var y in patch.objArray) {
				if(patch.objArray[y].name=="outlet") {
					tmpOut.push(patch.objArray[y]);				
				}
			}

			//sort the arrays by position.
			tmpIn.sort(function(a,b) {

				   if (a["left"] < b["left"])
				      return -1;
				   if (a["left"] > b["left"])
				      return 1;
				   // a must be equal to b
				   return 0;			

			});	

			//sort the arrays by position.
			tmpOut.sort(function(a,b) {

				   if (a["left"] < b["left"])
				      return -1;
				   if (a["left"] > b["left"])
				      return 1;
				   // a must be equal to b
				   return 0;			

			});	

			//create the inlets
			for(var i=0;i<tmpIn.length;i++) {
				var inletCounter=i+1;
				thisPtr["inlet"+inletCounter]=new thisPtr.inletClass(("inlet"+inletCounter),thisPtr,tmpIn[i].args);
			}

			//create the outlets
			for(var j=0;j<tmpOut.length;j++) {
				var outletCounter=j+1;
				var thisOutLet=thisPtr["outlet"+outletCounter]=new thisPtr.outletClass(("outlet"+outletCounter),thisPtr,tmpOut[j].args);
			}		

		}
	
	}
	
	//use the patch string to load the file in the hidden iframe
	function openPatch(data,file) {
								
		var sizeArr=Lily.extractPatchSize(data); //get the patch size w/o having to eval the json.
		var parentDir=(file.parent.isDirectory())?file.parent:null; //patch's parent dir.
		thisPatch.obj = new LilyPatch(pid,Lily,sizeArr[0],sizeArr[1],false,{type:"iframe",win:iframe,parent:thisPtr.parent.patchView.xulWin}); //call the patch constructor

		thisPatch.obj.callback=function(){
			
			//open the patch
			thisPatch.obj.patchWindowType="iframe";	
			
			//override this function to point at this patch (not the subpatch)
			thisPatch.obj.getContainerPatch=function() {
				return thisPtr.parent; //pointer to the container patch
			}
			
			//override this function to point at this id
			thisPatch.obj.getContainerID=function() {
				return thisPtr.parent.objID;
			}
					
			thisPatch.obj.openPatch(data,null,null,null,parentDir); //create the patch in the new window.
			thisPatch.obj.patchController.setEditable("performance"); //if readonly, go to perf mode.		
		
			//add method to the inlets
			for(var i=0;i<tmpIn.length;i++) {

				var inletCounter=i+1;

				//thisPtr["inlet"+inletCounter]=new thisPtr.inletClass(("inlet"+inletCounter),thisPtr,tmpIn[i].args);
				thisPtr["inlet"+inletCounter]["anything"]=function() {

					var patchInlet=thisPatch.obj.getObj(tmpIn[i].objID);
					return function(msg) {
						patchInlet.outlet1.doOutlet(msg);
					}	

				}();
			}

			//add method to the outlets
			for(var j=0;j<tmpOut.length;j++) {

				var outletCounter=j+1;

				//var thisOutLet=thisPtr["outlet"+outletCounter]=new thisPtr.outletClass(("outlet"+outletCounter),thisPtr,tmpOut[j].args);
				var patchOutlet=thisPatch.obj.getObj(tmpOut[j].objID);				
				patchOutlet.inlet1.processInput=function() {

					var oc = outletCounter;
					return function(msg) {
						thisPtr["outlet"+oc].doOutlet(msg);
					}

				}();		

			}
			
			var parent_patch = thisPatch.obj.getTopPatch(); //get the top level patch
			parent_patch.patchController.patchLoaded(thisPtr.objID,thisPatch.obj); //tell the patch we're loaded.
																			
		}		
		
	}
	
	//clean up the subpatch when closing the patch.
	this.destructor=function() {
		
		if(!Lily.patcherReloadFlag) { //only when we're not reloading the object.
			if(isPatchString) { thisPatch.file.remove(false); } //remove the temp file if we have one.
			thisPatch.obj.close(); //clean up the patch
			thisPatch = {obj:null,id:pid,file:null,json:null}; //reset the thispatch object	
		}	
	}
	
	//when the iframe loads and is ready, create the new patch using the iframe.
	function frameLoad() {
		iframe.removeEventListener("load",frameLoad,true); //remove this so we don't loop
		if(thisPatch.json&&thisPatch.file) {
			openPatch(thisPatch.json,thisPatch.file);//open the patch if we've got the data- this loads the patch in the iframe
		} else {
			openPatchWindow(); //no data so open the edit window- this opens the patch window we'll create the patch in.
		}
	}
	
	function closePatchWindow() {
		//nothing yet.
	}
	
	//read the saved state of patch and load it into a popup window for editing.
	function openPatchWindow() {
		
		//open the patch window
		openPatchWin=Lily.openPatchFromFile(thisPatch.file,false,false);
		
		//timing isn't critical here so we'll use setimteout to avoid the hassle of setting a listener on the inner browser window
		setTimeout(function(){
			openPatchWin.obj.patchView.setPatchTitle("[subpatch]"); //mark it as a subpatch
			openPatchWin.obj.patchView.xulWin.moveBy(20,20); //move it a bit so its clear whats going on
		},100);
		
		//watch the json property in the patch object- refresh the patcher when it updates.
		openPatchWin.watch("json",function(id,oldval,newval){
			thisPtr.args=(isPatchString)?newval:thisPtr.fPath; //udpate the args with the json if its an embedded, otherwise use the filepath
			reloadPatch(); //recreate the patch with the new data.
		})
	}
	
	this.init=function() {
		thisPtr.controller.attachObserver(this.objID,"dblclick",openPatchWindow,"performance");			
	}	
		
	//blocking- gets the patch data & creates the outlets
	loadPatch();
		
	//create the iframe
	var iframeWrapper = this.parent.patchView.displayHTML("<iframe scrolling='no' id='"+this.createElID("patcher")+"' style='height:0px;width:0px;margin:0px;border:0px;padding:0px;visibility:hidden'></iframe>");
	var iframe = iframeWrapper.getElementsByTagName("iframe")[0];
	iframe.addEventListener("load",frameLoad,true); //we'll use this once for init only	
	
	return this;
}

var $patcherMetaData = {
	textName:"patcher",
	htmlName:"patcher",
	objectCategory:"System",
	objectSummary:"Load a subpatch inside a patch.",
	objectArguments:"path to subpatch"
}