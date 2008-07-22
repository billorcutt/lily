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
*	Construct a new qt object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $qt(args)
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"methods: \"play\", \"stop\", \"volume\", \"mute\", \"looping\", \"rate\", \"time\", \"load\", \"rewind\", \"step\", \"startTime\, \"endTime\"");
	this.outlet1=new this.outletClass("outlet1",this,"movie info");
	this.outlet2=new this.outletClass("outlet2",this,"bang on load");
	
	var isInstantiated = false;
	
	function checkForQT() {
		
		var platform = LilyUtils.navigatorPlatform();
		
		//no linux support
		if(platform.indexOf("linux") >= 0) {
			return false;
		}
		
		if (navigator.plugins) {
			for (i=0; i < navigator.plugins.length; i++ ) {
				if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) { 
					return true; 
				}
			}
		}
		return false;				
	}	
	
	//abort if qt not found or if we're on linux.
	if(!checkForQT()) {
		LilyDebugWindow.error("Quicktime not found. Quicktime must be present to use this external.");	
		return;
	}	
		
	var node=null; //pointer to html element
	var timeout=null;
	var nodeLooping=false;
	
	this.allowFont=false; //dont allow font changes	
	
	var mediaLoaded=false;
	var rectOnLoad=null;
	var myProtocol=null; //for some reason QT can't switch protocols- the first one in is it. 
	
	this.args=args;
	var argsArr=(args)?LilyUtils.splitArgs(args):[];
						
	//set the args & the inspector values up.
	this.QTUrl=(checkURL(argsArr[0],true))?argsArr[0]:"chrome://lily/content/images/silence.mov"; //load stub movie if we didn't get a valid url
	this.hideController=(argsArr[1]=="true")?true:false;
	
	if(!checkURL(argsArr[0],true)&&argsArr[0]) {
		LilyDebugWindow.error("Invalid URL");
	}
	
	this.setInspectorConfig([
		{name:"QTUrl",value:thisPtr.QTUrl,label:"Initial URL",type:"string",input:"file"},
		{name:"hideController",value:thisPtr.hideController,label:"Hide Controller",type:"boolean",input:"checkbox"}				
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		thisPtr.QTUrl=""+LilyUtils.quoteString(vals["QTUrl"]);
		thisPtr.hideController=""+vals["hideController"];
		thisPtr.args=""+LilyUtils.quoteString(vals["QTUrl"])+" "+vals["hideController"];
		
		//load the movie and resize the object.
		rectOnLoad=null;
		mediaLoaded=false;
		
		node.SetControllerVisible(!vals["hideController"]);		
		
		if(checkURL(thisPtr.QTUrl,false)) {
			//node.SetURL(thisPtr.QTUrl);		
			//checkLoaded(true,0);
			loadURL(thisPtr.QTUrl);		
			//checkLoaded(true,0);				
		} else {
			LilyDebugWindow.error("Invalid URL")
		}
						
	}	
	
	this.inlet1["play"]=function(args) {
		
		clearTimeout(timeout); //kill any running timeouts
		
		if(typeof args != "undefined") {
			
			var tmp = args.split(" ");
			var start = (!isNaN(parseInt(tmp[0])))?parseInt(tmp[0]):(node.GetStartTime()*(1000/node.GetTimeScale()));
			var end = (!isNaN(parseInt(tmp[1])))?parseInt(tmp[1]):(node.GetEndTime()*(1000/node.GetTimeScale()));
			var rate = (!isNaN(parseFloat(tmp[2])))?parseFloat(tmp[2]):1;
						
			if(end < start) 
				rate = (Math.abs(rate) * -1); //make sure rate is negative for backwards
			else
				rate = Math.abs(rate); //if no end pt or end is greater than start, rate must be positive.
			
//			LilyDebugWindow.print(start+" "+end+" "+rate+ " "+parseInt(Math.abs((end-start)/rate)));
			
			if(typeof start != "undefined") {
				thisPtr.inlet1.time(start); //set the pointer to the start point
			}
			
			if(end) {
				timeout=setTimeout(function(){
					var fArgs = args;					
					thisPtr.inlet1.stop();
					if(nodeLooping) {
						thisPtr.inlet1.play(fArgs); //do it again
					} else {
						thisPtr.outlet2.doOutlet("stop bang"); //stopping.
					}
				},parseInt(Math.abs((end-start)/rate))); //set a timeout to stop after (end-start) msecs
			}
			
			node.SetRate(rate.toString());
			
		} else {
			node.Play(); //no args so just play	
		}
		
	}
	
	this.inlet1["volume"]=function(val) {
		if(typeof node.SetVolume == "function") node.SetVolume(val);
	}
	
	//float
	this.inlet1["rate"]=function(val) {	
		if(typeof node.SetRate == "function") node.SetRate(val);
	}
	
	//time int
	this.inlet1["time"]=function(val) {
		if(typeof node.GetTimeScale == "function" && typeof node.SetTime == "function") {
			var t = val/(1000/node.GetTimeScale());		
			node.SetTime(t);
		}
	}
	
	//end
	this.inlet1["endTime"]=function() {
		if(typeof node.GetEndTime == "function" && typeof node.GetTimeScale == "function") {
			var t = node.GetEndTime()*(1000/node.GetTimeScale());
			thisPtr.outlet1.doOutlet("end "+t);	
		}	
	}
	
	//start
	this.inlet1["startTime"]=function() {
		if(typeof node.GetEndTime == "function" && typeof node.GetTimeScale == "function") {
			var t = node.GetEndTime()*(1000/node.GetTimeScale());		
			thisPtr.outlet1.doOutlet("start "+t);
		}		
	}			
	
	//looping bool
	this.inlet1["looping"]=function(val) {
		if(typeof node.SetIsLooping == "function") {
			if(val=="true") {
				node.SetIsLooping(true);
				nodeLooping=true;
			} else {
				node.SetIsLooping(false);
				nodeLooping=false;
			}	
		}	
	}	
	
	this.inlet1["mute"]=function(bool) {
		if(typeof node.SetMute == "function") {
			if(bool=="true")
				node.SetMute(true);
			else
				node.SetMute(false);
		}		
	}	
	
	this.inlet1["stop"]=function() {
		if(typeof node.SetMute == "function" && typeof node.Stop == "function"){
			node.SetMute(true);
			node.Stop();
			node.SetMute(false);
			clearTimeout(timeout);
		} 
	}
	
	this.inlet1["load"]=function(url) {
		
		if(checkURL(url,false)) {
			rectOnLoad=null;
			mediaLoaded=false;	
//			node.SetAutoPlay(false);			
//			node.SetURL(url);
			loadURL(url);		
			//checkLoaded(false,0);	
		} else {
			LilyDebugWindow.error("Invalid URL")
		}
				
	}
	
	this.inlet1["rewind"]=function() {
		if(typeof node.Rewind == "function") {
			node.Rewind();	
		}
	}
	
	this.inlet1["resize"]=function() { 
		resizeObject(rectOnLoad);
	}	
	
	this.inlet1["step"]=function(frames) {
		if(typeof node.Rewind == "function") {
			node.Step(frames);
		}		 
	}
	
	function isLoaded(sizeOnLoad) {
		
		var resize = sizeOnLoad||false;		
		
	//	LilyDebugWindow.print("resize me..."+node.GetRectangle()+" "+resize);
		rectOnLoad=node.GetRectangle();
		mediaLoaded=true;

		//determine if we have an audio or a video file.
		var tmp = rectOnLoad.split(",");
		var audio = ((parseInt(tmp[0])+parseInt(tmp[1])+parseInt(tmp[2])+parseInt(tmp[3]))<=0)?true:false;

		//resize if the resize flag is set or if we're transitioning from audio to video or vice versa.
		if(
			resize||
			((thisPtr.height==12&&thisPtr.width==100)&&!audio)||
			(!(thisPtr.height==12&&thisPtr.width==100)&&audio)
		) {
			resizeObject(rectOnLoad);	
		}

		//bang cuz we're loaded.						
		setTimeout(function(){thisPtr.outlet2.doOutlet("load bang");},100);
			
	}	
	
	function isError() {
		
		//node.SetURL("chrome://lily/content/images/silence.mov"); //load the stub.
		LilyDebugWindow.error("Couldn't load url "+ node.GetPluginStatus());
		
		//bang cuz we're loaded.						
		setTimeout(function(){thisPtr.outlet2.doOutlet("load bang");},100);	
			
	}
	
	/*
	function checkLoaded(sizeOnLoad,count) {
		
		var resize = sizeOnLoad||false;
		
		try {

			if(node && typeof node.GetPluginStatus == "function"  && (node.GetPluginStatus()=="Playable"||node.GetPluginStatus()=="Complete")) {

	//			LilyDebugWindow.print("resize me..."+node.GetRectangle()+" "+resize);
				rectOnLoad=node.GetRectangle();
				mediaLoaded=true;

				//determine if we have an audio or a video file.
				var tmp = rectOnLoad.split(",");
				var audio = ((parseInt(tmp[0])+parseInt(tmp[1])+parseInt(tmp[2])+parseInt(tmp[3]))<=0)?true:false;

				//resize if the resize flag is set or if we're transitioning from audio to video or vice versa.
				if(
					resize||
					((thisPtr.height==12&&thisPtr.width==100)&&!audio)||
					(!(thisPtr.height==12&&thisPtr.width==100)&&audio)
				) {
					resizeObject(rectOnLoad);	
				}

				//bang cuz we're loaded.						
				setTimeout(function(){thisPtr.outlet2.doOutlet("load bang");},100);			

			} else if(typeof node.GetPluginStatus == "function" && node.GetPluginStatus() && node.GetPluginStatus().toString().indexOf("Error")!=-1) {
	//			node.SetURL("chrome://lily/content/images/silence.mov"); //load the stub.
				LilyDebugWindow.error("Couldn't load url "+ node.GetPluginStatus());
				//bang cuz we're loaded.						
				setTimeout(function(){thisPtr.outlet2.doOutlet("load bang");},100);			
				return;
			} else if(count<300){ //30 second timeout.
				setTimeout(function(){
					checkLoaded(resize,(count+1)); 
				},100);
			} else {
	//			node.SetURL("chrome://lily/content/images/silence.mov"); //load the stub.			
				//LilyDebugWindow.error("Couldn't load url");
				//bang cuz we're loaded.						
				setTimeout(function(){thisPtr.outlet2.doOutlet("load bang");},100);			
				return;
			}

		} catch(e) {}
				
	}
	*/
	
	function resizeObject(rect) {
		
// 		LilyDebugWindow.print("now we resize... "+rect)		
		if(!rect) //bail if we don't have it.
			return;
		
		var tmp = rect.split(",");
		var audio = ((parseInt(tmp[0])+parseInt(tmp[1])+parseInt(tmp[2])+parseInt(tmp[3]))<=0)?true:false; // is it an audio file?
		
		if(audio) {
//			LilyDebugWindow.print("here in audio ")
//			node.SetRectangle("0,0,"+(100)+","+(0));
			thisPtr.setWidth(100);
			thisPtr.setHeight(12);
			thisPtr.objectMoved();									
		} else {
			var width = parseInt(tmp[2])-parseInt(tmp[0]);
			var height = parseInt(tmp[3])-parseInt(tmp[1]);
			node.SetRectangle("0,0,"+width+","+(height-controllerPadding()));			
			thisPtr.setWidth(width);
			thisPtr.setHeight(height);
			thisPtr.objectMoved();					
		}
		
	}
	
	function getProtocol(url) {
		
		if(typeof url == "string") {
			if(url.indexOf("http://")!=-1) {
				return "http";
			} else if(url.indexOf("file://")!=-1 ) {
				return "file";
			} else if(url.indexOf("chrome://")!=-1) {
				return "chrome";
			} else {
				return null;
			}
		}
	}
	
	function checkURL(url,init) {
		var protocol = getProtocol(processURL(url));
		return (protocol=="http"||protocol=="chrome"||protocol=="file");
	}
	
	function controllerPadding() {
		if(thisPtr.hideController=="true") {
			return 0;
		} else {
			return 12;
		}
	}
	
	function generateHTML(url) {
		
		/*
		var html='<div id="' + thisPtr.createElID("qtcontainer") + '"><object name="' + thisPtr.createElID("qt") + '" id="' + thisPtr.createElID("qt") + '" type="audio/mpeg" data="' + processURL(LilyUtils.stripLTQuotes(url)) + '" width="' + 100 + '" height="' + 12 + '">' +
			'<param name="src" value="' + processURL(LilyUtils.stripLTQuotes(url)) + '"/>'+
		    '<param name="autoplay" value="false" />' +
		    '<param name="autoStart" value="0" />' +
		'</object></div>';
		*/
		
		var html = '' +
		'<div id="' + thisPtr.createElID("qtcontainer") + '">' + 
		'<embed name="' + thisPtr.createElID("qt") + '" id="' + thisPtr.createElID("qt") + '" postdomevents="true" autostart="false" type="audio/mpeg" src="' + processURL(LilyUtils.stripLTQuotes(url)) + '" width="' + 100 + '" height="' + 12 + '">' +
		'</embed></div>';
		
		return html;	
	}
	
	function loadURL(url) {
		isInstantiated=false;
		var html = generateHTML(url);
		node.parentNode.innerHTML=html;
		node=thisPtr.ui.getElByID(thisPtr.createElID("qt")); //save ref to node	
		thisPtr.resizeElement=thisPtr.displayElement=node;			
	}
	
	function processURL(url) {
		
		//if there's a protocol, we're done...
		if(LilyUtils.containsProtocol(url))
			return url;	
			
		//otherwise look for it in the file system.
		var path = LilyUtils.getFilePath(url);	
			
		if(path) 
			return "file://"+path;
		else
			return "";
		
	}	

	function dndCallBack(data) {
		thisPtr.saveInspectorValues({QTUrl:"file://"+data[0],hideController:thisPtr.hideController});
		thisPtr.setInspectorConfig([
			{name:"QTUrl",value:thisPtr.QTUrl,label:"Initial URL",type:"string",input:"file"},
			{name:"hideController",value:thisPtr.hideController,label:"Hide Controller",type:"boolean",input:"checkbox"}				
		]);
	}

	var dndhandler = new LilyUtils.dragDropHandler(dndCallBack);

	//goes here dragDropHandler
	function ondrop(e) {
		nsDragAndDrop.drop(e,dndhandler);		
	}

	function onenter(e) {
		thisPtr.ui.selectObjView(e);
	}

	function onexit(e) {
		thisPtr.ui.deSelectObjView(e);	
	}
		
	//custom html
	this.ui=new LilyObjectView(this,generateHTML(this.QTUrl));
	this.ui.draw();
	node=this.ui.getElByID(this.createElID("qt")); //save ref to node
	this.resizeElement=this.displayElement=node;
	
	//setTimeout(function(){checkLoaded(true,0);},500);
	
	this.controller.objResizeControl.cb=function(h,w) {
		node.SetRectangle("0,0,"+w+","+(h-controllerPadding()));		
	}
	
	//set listeners for drag and drop
	this.controller.attachObserver(this.createElID("qtcontainer"),"dragdrop",ondrop,"edit");
	this.controller.attachObserver(this.createElID("qtcontainer"),"dragenter",onenter,"edit");
	this.controller.attachObserver(this.createElID("qtcontainer"),"dragexit",onexit,"edit");
	
	this.document.addEventListener("qt_load",function(e){
		if(e.target.id==thisPtr.createElID("qt")) {
			setTimeout(function(){isLoaded(true);},250);	
		}
	},false);

	this.document.addEventListener("qt_error",function(e){
		if(e.target.id==thisPtr.createElID("qt")) {
			setTimeout(function(){isError();},100);	
		}		
	},false);

	this.document.addEventListener("qt_begin",function(e){
		isInstantiated=true;
		//log("quicktime begin");
	},false);			
	
	return this;
}

var $qtMetaData = {
	textName:"qt",
	htmlName:"qt",
	objectCategory:"Graphics",
	objectSummary:"Play and control Quicktime sound and video files.",
	objectArguments:"url, hide controller [false]"
}
