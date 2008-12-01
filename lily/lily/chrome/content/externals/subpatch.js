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
*	Construct a new subpatch object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $subpatch(args)
{
	//var args=params||thisPtr.args;
	var thisPtr=this;
	this.allowFont=false; //dont allow font changes	
	var pid = "patch0";	//id for the subpatch
	var thisPatch = {obj:null,id:pid,file:null,json:null};
	
	//inspector values
	var argsArr = LilyUtils.splitArgs(args); //split the args
	
	this.fPath = (argsArr.length>0)?argsArr.shift():""; //path to patch or null
	this.patchArgs = argsArr.join(" ")||""; //the remainder of the args as string
	
	if(/##\w+##/.test(this.patchArgs)) {
		//pull out the patch name and use that as the display
		this.displayName = this.patchArgs.match(/##(\w+)##/)[1];
		//if there any additional args, strip out the classname and assign them to display args. otherwise displayargs = false.
		this.displayArgs = (!/^##\w+##/.test(this.patchArgs))?this.patchArgs.replace(/##\w+##/,""):false;
		this.loadsSubPatchByName = true;
	}	
	
	//inlet/outlet arrays
	var tmpIn=[];
	var tmpOut=[];	
	
	this.setInspectorConfig([
		{name:"fPath",value:thisPtr.fPath,label:"Patch Path",type:"string",input:"file"},
		{name:"patchArgs",value:thisPtr.patchArgs,label:"Patch Arguments",type:"string",input:"text"}		
	]);
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		var oldpath = thisPtr.fPath; //save the path first
		var oldpargs = thisPtr.patchArgs;
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=LilyUtils.quoteString(vals["fPath"])+vals["patchArgs"];
		
		if((thisPtr.fPath&&oldpath!=thisPtr.fPath)||(oldpargs!=thisPtr.patchArgs))
			reloadPatch(); //reload the patch if the path or args has changed.
			
	}
	
	function replacePatchArgs(arg_str,data) {
		var patch_str = data;
		var tmp = LilyUtils.splitArgs(arg_str.replace(/##\w+##/,""));		
		for(var i=0;i<tmp.length;i++) {
			var re = new RegExp("\\#"+(i+1),"g");
			patch_str=patch_str.replace(re,tmp[i]);
		}		
		return patch_str;	
	}
	
	function reloadPatch() {
		
		if(thisPtr.fPath) { 
			setTimeout(function(){
				//thisPatch = {obj:null,id:pid,file:null,json:null}; //reset the thispatch object
				var o = thisPtr.parent.replaceObject(thisPtr,"subpatch",thisPtr.args.replace(/##\w+##/,""));
				o.setHeight(thisPtr.height);
				o.setWidth(thisPtr.width);
			},100);	
		}
	}		
	
	function loadPatch() {
				
		if(!thisPtr.fPath) //quit silently if there's no path defined
			return;
		
		var filepath = LilyUtils.getFilePath(thisPtr.fPath.replace(/file:\/\//,""));

		if(!filepath) { //bail if the path isn't correct
			LilyDebugWindow.error("subpatch: patch not found");
			return;
		}

		//get the data- FIXME - need a way to access http/file/chrome patch
		var fileObj = LilyUtils.readFileFromPath(filepath,true);
		var file=fileObj.file;
		var data=replacePatchArgs(thisPtr.patchArgs,fileObj.data);	
		
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
	
	function openPatch(data,file) {
						
		var sizeArr=LilyUtils.extractPatchSize(data); //get the patch size w/o having to eval the json.
		var parentDir=(file.parent.isDirectory())?file.parent:null; //patch's parent dir.
		thisPatch.obj = new LilyPatch(pid,LilyApp,sizeArr[0],sizeArr[1],false,{type:"iframe",win:thisPtr.resizeElement,parent:thisPtr.parent.patchView.xulWin}); //call the patch constructor

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
			thisPatch.obj.patchController.setEditable("performance"); //go to perf mode.
		
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
																									
			//size the subpatch to the size set in patch we're loading...
			if(parseInt(thisPatch.obj.heightInSubPatch) != 0 && parseInt(thisPatch.obj.widthInSubPatch) != 0 && !thisPtr.hasBeenResized) 
				iframe.resize(parseInt(thisPatch.obj.widthInSubPatch), parseInt(thisPatch.obj.heightInSubPatch));

		}
		
	}
	
	
	//clean up the subpatch
	this.destructor=function() {
		thisPtr.parent.patchView.oWin.focus(); //restore focus so the iframe doesn't steal it.
		if(thisPatch.obj) { thisPatch.obj.close(); }
		thisPatch = {obj:null,id:pid,file:null,json:null}; //reset the thispatch object
	}
	
	//create the new patch using the iframe
	function frameLoad() {
		thisPtr.resizeElement.removeEventListener("load",frameLoad,true); //remove this so we don't loop
		if(thisPtr.fPath&&thisPatch.json&&thisPatch.file) { 
			openPatch(thisPatch.json,thisPatch.file);			
		}//open the patch if we've got the data
	}
		
	//blocking- gets the patch data & creates the outlets
	loadPatch();
	
	//_iframe contains the iframe html, ui property is a necessary placeholder, must'nt be null.
	this.ui={};	
	var iframe=new LilyComponents._iframe(this,null,200,200,"no",frameLoad);	//no scrolling
	
	this.resizeElement=iframe.objFrame; //
	this.displayElement=iframe.wrapper;	
//	this.displayElement.addEventListener("load",frameLoad,false); //we'll use this once for init only	
	this.controller.setNoBorders(true);
	
	return this;
}

var $subpatchMetaData = {
	textName:"subpatch",
	htmlName:"subpatch",
	objectCategory:"UI",
	objectSummary:"Display a subpatch in a patch.",
	objectArguments:""
}