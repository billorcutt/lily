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
*	Construct a new wow object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

//arg order - path(*), width, height, top, left, bottom, right, position, opacity. * required
function $wow(args) //window on window
{
	var thisPtr=this;	
	
	this.inlet1=new this.inletClass("inlet1",this,"delete, hide, show, setHeight, setWidth, setLeft, setTop");
	this.outlet1 = new this.outletClass("outlet1",this,"bang on transition complete");	
	
	//global iframe ref
	var _iframe = null;			

	//arg values values
	var argsArr = LilyUtils.splitArgs(args); //split the args
	
	//iframe size/pos from object arguments
	this.fPath = argsArr.shift()||""; //path to patch or null	
	this._iframe_width = (argsArr[0]!="null")?argsArr[0]:null;
	this._iframe_height = (argsArr[1]!="null")?argsArr[1]:null;
	this._iframe_top = (argsArr[2]!="null")?argsArr[2]:null;
	this._iframe_left = (argsArr[3]!="null")?argsArr[3]:null;
	this._iframe_bottom = (argsArr[4]!="null")?argsArr[4]:null;
	this._iframe_right = (argsArr[5]!="null")?argsArr[5]:null;
	this._iframe_position = (argsArr[6]!="null"&&typeof argsArr[6]!="undefined")?argsArr[6]:"absolute";
	this._iframe_opacity = (argsArr[7]!="null"&&typeof argsArr[7]!="undefined")?argsArr[7]:1;
	
	this.setInspectorConfig([
		{name:"fPath",value:thisPtr.fPath,label:"Patch Path",type:"string",input:"file"},
		{name:"_iframe_width",value:this._iframe_width,label:"Width",type:"string",input:"text"},
		{name:"_iframe_height",value:this._iframe_height,label:"Height",type:"string",input:"text"},
		{name:"_iframe_top",value:this._iframe_top,label:"Top",type:"string",input:"text"},
		{name:"_iframe_left",value:this._iframe_left,label:"Left",type:"string",input:"text"},
		{name:"_iframe_bottom",value:this._iframe_bottom,label:"Bottom",type:"string",input:"text"},
		{name:"_iframe_right",value:this._iframe_right,label:"Right",type:"string",input:"text"},
		{name:"_iframe_position",value:thisPtr._iframe_position,label:"Posiiton",type:"string",options:[
			{label:"Absolute",value:"absolute"},
			{label:"Fixed",value:"fixed"}
		],input:"select"},
		{name:"_iframe_opacity",value:this._iframe_opacity,label:"Opacity",type:"string",input:"text"}			
															
	]);
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		var oldargs = thisPtr.args;
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		thisPtr.args=""+LilyUtils.quoteString(vals["fPath"])+" "+vals["_iframe_width"]+" "+vals["_iframe_height"]+" "+vals["_iframe_top"]+" "+vals["_iframe_left"]+" "+vals["_iframe_bottom"]+" "+vals["_iframe_right"]+" "+vals["_iframe_position"]+" "+vals["_iframe_opacity"];
		
		if(oldargs!=thisPtr.args)
			reloadPatch(); //reload the patch if the args has changed.
			
	}
	
	//refresh the object when the patch we're editing is updated.
	function reloadPatch() {
		setTimeout(function(){			
			var o = thisPtr.parent.replaceObject(thisPtr,"wow",thisPtr.args);	
		},100);		
	}					

	//patch stuff
	var pid = "patch0";	//id for the subpatch
	var thisPatch = {obj:null,id:pid,file:null,json:null};	
	
	//inlet/outlet arrays
	var tmpIn=[];
	var tmpOut=[];
	
	//unload the patch & kill the iframe
	this.inlet1["delete"]=function() {
		deleteFrame();
	}
	
	//load the patch & make the iframe
	this.inlet1["create"]=function() {
		makeFrame();
	}	
	
	//animate iframe opacity- hide the frame
	this.inlet1["hide"]=function(dur) {	
		var duration = dur||400;
		iframeAnimator("opacity",thisPtr._iframe_opacity,0,parseInt(duration),function(){_iframe.style.zIndex=-9999999999999;});
	}
	
	//animate iframe opacity
	this.inlet1["show"]=function(dur) {
		var duration = dur||400;		
		iframeAnimator("opacity",0,thisPtr._iframe_opacity,parseInt(duration));
		_iframe.style.zIndex=9999999999999; //really big number		
	}
	
	//animate iframe height
	this.inlet1["setHeight"]=function(args) {
		var tmp = args.split(" ");
		var start = (tmp[0]!="null")?parseInt(tmp[0]):parseInt(content.getComputedStyle(_iframe,null).height);
		var end = parseInt(tmp[1]);
		var dur = parseInt(tmp[2]);	
		iframeAnimator("height",start,end,dur);
	}
	
	//animate iframe width
	this.inlet1["setWidth"]=function(args) {
		var tmp = args.split(" ");
		var start = (tmp[0]!="null")?parseInt(tmp[0]):parseInt(content.getComputedStyle(_iframe,null).width);
		var end = parseInt(tmp[1]);
		var dur = parseInt(tmp[2]);	
		iframeAnimator("width",start,end,dur);
	}
	
	//animate iframe left pos
	this.inlet1["setLeft"]=function(args) {
		var tmp = args.split(" ");
		var start = (tmp[0]!="null")?parseInt(tmp[0]):parseInt(content.getComputedStyle(_iframe,null).left);
		var end = parseInt(tmp[1]);
		var dur = parseInt(tmp[2]);	
		iframeAnimator("left",start,end,dur);
	}
	
	//animate iframe top pos
	this.inlet1["setTop"]=function(args) {
		var tmp = args.split(" ");
		var start = (tmp[0]!="null")?parseInt(tmp[0]):parseInt(content.getComputedStyle(_iframe,null).top);
		var end = parseInt(tmp[1]);
		var dur = parseInt(tmp[2]);	
		iframeAnimator("top",start,end,dur);
	}	

	//here's where we do the animation
	function iframeAnimator(type,start,end,dur,cb) {
		var d = dur||400;
				
		//bang when animation is complete
		function done(val) {
			thisPtr.outlet1.doOutlet(val+" bang");
		}		
								
		var animatedEl = new LilyAnimator.Animator({			
		    onComplete: function() {
			
				var val = type;
				return function() {
					if(typeof cb == "function") cb();
					done(val);
				}
			
			}(),
			duration: parseInt(d)
		})
		    .addSubject(new LilyAnimator.NumericalStyleSubject(_iframe, type, start, end));
		animatedEl.toggle();		
	}	
								
	function loadPatch() {
		
		if(!thisPtr.fPath) //quit silently if there's no path defined
			return;
		
		var filepath = LilyUtils.getFilePath(thisPtr.fPath);

		if(!filepath) { //bail if the path isn't correct
			LilyDebugWindow.error("patch not found");
			return;
		}

		//get the data- FIXME - need a way to access http/file/chrome patch
		var fileObj = LilyUtils.readFileFromPath(filepath,true);
		var file=fileObj.file;
		//var data=replacePatchArgs(thisPtr.patchArgs,fileObj.data);
		var data=fileObj.data;	
		
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
				var inletCounter=i+2;
				thisPtr["inlet"+inletCounter]=new thisPtr.inletClass(("inlet"+inletCounter),thisPtr,tmpIn[i].args);
			}

			//create the outlets
			for(var j=0;j<tmpOut.length;j++) {
				var outletCounter=j+2;
				var thisOutLet=thisPtr["outlet"+outletCounter]=new thisPtr.outletClass(("outlet"+outletCounter),thisPtr,tmpOut[j].args);
			}	
		}	
	}
	
	function openPatch(data,file) {
								
		var sizeArr=LilyUtils.extractPatchSize(data); //get the patch size w/o having to eval the json.
		var parentDir=(file.parent.isDirectory())?file.parent:null; //patch's parent dir.
		thisPatch.obj = new LilyPatch(pid,LilyApp,sizeArr[0],sizeArr[1],false,{type:"iframe",win:_iframe,parent:thisPtr.parent.patchView.xulWin}); //call the patch constructor

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

				var inletCounter=i+2;

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

				var outletCounter=j+2;

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
	
	//create the iframe
	function makeFrame() {
		
		var content_window = window.gBrowser.selectedBrowser.contentDocument.defaultView;
		
		//bail if the frame already exists...
		if(content_window.document.getElementById(thisPtr.createElID("wow_frame")))
			return;
				
		var body = content_window.document.getElementsByTagName("body")[0];						
		var tmp=content_window.document.createElement("iframe");
		tmp.setAttribute("id",thisPtr.createElID("wow_frame"));
		
		tmp.style.position=thisPtr._iframe_position;
		if(thisPtr._iframe_left!=null) tmp.style.left=parseInt(thisPtr._iframe_left)+"px";
		if(thisPtr._iframe_top!=null) tmp.style.top=parseInt(thisPtr._iframe_top)+"px";
		if(thisPtr._iframe_right!=null) tmp.style.right=parseInt(thisPtr._iframe_right)+"px";
		if(thisPtr._iframe_bottom!=null) tmp.style.bottom=parseInt(thisPtr._iframe_bottom)+"px";								
		if(thisPtr._iframe_width!=null) tmp.style.width=parseInt(thisPtr._iframe_width)+"px";
		if(thisPtr._iframe_height!=null) tmp.style.height=parseInt(thisPtr._iframe_height)+"px";

		tmp.style.padding="0px";
		tmp.style.margin="0px";
		
		tmp.style.borderWidth="0px";
		tmp.style.borderStyle="solid";
			
		tmp.style.backgroundColor="transparent";
		tmp.style.opacity = parseFloat(0); //create it hidden
		tmp.style.zIndex=-9999999999999; //really big negative number
		
		_iframe = body.appendChild(tmp);
		_iframe.setAttribute("scrolling","no");
		_iframe.addEventListener("load", frameLoad, true);	
		_iframe.contentDocument.defaultView.location.href="chrome://lily/content/blank.html";	
	}	
	
	//clean up when we delete this object
	this.destructor=function() {
		deleteFrame();
		gBrowser.removeEventListener("load",makeFrame,true);
	}
	
	//delete the frame
	function deleteFrame() {
		if(_iframe) {
			if(thisPatch.obj) { thisPatch.obj.close(); } //kill the patch
			//thisPatch = {obj:null,id:pid,file:null,json:null}; //reset the thispatch object
			thisPatch.obj=null;
			_iframe.parentNode.removeChild(_iframe); //kill the frame
			_iframe = null;
		}
	}
	
	//create the new patch using the iframe
	function frameLoad() {
		_iframe.removeEventListener("load",frameLoad,true); //remove this so we don't loop
		if(thisPtr.fPath&&thisPatch.json&&thisPatch.file) { openPatch(thisPatch.json,thisPatch.file); }//open the patch if we've got the data
	}
			
	//blocking- gets the patch data & creates the outlets
	loadPatch();
	
	//make the frame
	makeFrame();
	
	//when we load a new page, make the frame again
	gBrowser.addEventListener("load",makeFrame,true);		
		
	return this;
}

var $wowMetaData = {
	textName:"wow",
	htmlName:"wow",
	objectCategory:"UI",
	objectSummary:"Display a patch on the host window",
	objectArguments:"[path], width, height, top, left, bottom, right, position, opacity"	
	
}	