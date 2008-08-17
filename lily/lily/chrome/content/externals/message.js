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
*	Construct a new message object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $message(args)
{
	var thisPtr=this;
	this.args=args||""; //save read only copy of text
	this.editArgs=args||""; //text to be displayed/output
	this.argType="string";
	
	//define inputs outputs
	this.outlet1 = new this.outletClass("outlet1",this,"message result");
	this.inlet1 = new this.inletClass("inlet1",this,"\"bang\" outputs the message, \"set\" changes it");
	
	function setArgs(str) {
		thisPtr.args=str||""; 
		thisPtr.editArgs=str||"";	
	}
	
	function getArgs(str) {
		return thisPtr.editArgs;	
	}
	
	function spacer() {
		var arr = LilyUtils.getDefaultFont();
		return html = "<img width=\"48\" height=\""+arr[1]+"\" src=\"chrome://lily/content/images/glass.gif\"/>";
	}		
		
	//define message handler- output the message
	this.inlet1["bang"]=function() {
		doOutput();
	}
	
	//define message handler- set the message value
	this.inlet1["set"]=function(msg) {
		setArgs(msg);//new message
		thisPtr.ui.getElByID(thisPtr.createElID("message")).innerHTML=LilyUtils.string2HTML(thisPtr.editArgs);		
	}
	
	//define message handler- clear the message value
	this.inlet1["clear"]=function() {
		setArgs("");//new message
		thisPtr.ui.getElByID(thisPtr.createElID("message")).innerHTML=thisPtr.editArgs;		
	}		
	
	//define message handler- array of values to subsitute
	this.inlet1["obj"]=function(arr) {
		 
		var argStr=thisPtr.args; //get the original string;
		
		//do replace
		if(argStr.indexOf("$")!=-1) {
			for(var i=0;i<arr.length;i++) {
				var replace=("$"+(i+1));
				while(argStr.indexOf(replace)!=-1){
					var s1=argStr.substring(0,argStr.indexOf(replace));
					var s2=argStr.substring((argStr.indexOf(replace)+replace.length),argStr.length);
					argStr=s1+arr[i]+s2;
				}
			}
			determineType(argStr); //rerun the type determination if we've done a replace
		}

		doOutput(argStr);
	}
	
	//define message handler- list of values to subsitute
	this.inlet1["anything"]=function(str) {
		
		var argStr=thisPtr.args;		
		
		if(argStr.indexOf("$1")==-1)
			return;
		
		var arr=LilyUtils.splitArgs(str.toString());
		
		//do replace
		for(var i=0;i<arr.length;i++) {
			var replace=("$"+(i+1));
			while(argStr.indexOf(replace)!=-1){
				var s1=argStr.substring(0,argStr.indexOf(replace));
				var s2=argStr.substring((argStr.indexOf(replace)+replace.length),argStr.length);
				argStr=s1+arr[i]+s2;
			}
		}
		
		argStr=argStr.replace(/\$\d/,"");
		determineType(argStr); //rerun the type determination if we've done a replace
		doOutput(argStr);
	}	
	
	//html strings
	var messageHTML="<div style=\"text-align:left;padding-right:5px;padding-top:0px;padding-bottom:0px;padding-left:0px\" id=\""+ this.createElID("message") +"\" ></div>";

	function doOutput(args) {
		
		var argStr=args||thisPtr.args;		
		if(thisPtr.argType=="string") {
			thisPtr.outlet1.doOutlet(argStr); //string- send out the message	//.replace(/\\/g,"")	
		} else if(thisPtr.argType=="array") {
			try { eval("var a="+argStr); } catch(e) { LilyDebugWindow.error(e.name + ": " + e.message); } //.replace(/\\/g,"")
			thisPtr.outlet1.doOutlet(a); //output as array literal			
		} else if(thisPtr.argType=="object") {
			try { eval("var a="+argStr); } catch(e) { LilyDebugWindow.error(e.name + ": " + e.message); } //.replace(/\\/g,"")	
			thisPtr.outlet1.doOutlet(a); //output as object literal	
		} else if(thisPtr.argType=="number") {		
			thisPtr.outlet1.doOutlet(+(argStr)); //output as number	//.replace(/\\/g,"")
		} 
	}

	//event handler
	function mouseDownFunc(e){
		e.preventDefault(); //prevent text from being selected
		thisPtr.ui.contentWrapper.style.borderTopWidth="2px"; //contentWrapper is defined in the base class
		thisPtr.ui.contentWrapper.style.borderLeftWidth="2px";
		thisPtr.ui.contentWrapper.style.borderTopColor="#AAAAAA";		
		thisPtr.ui.contentWrapper.style.borderLeftColor="#BBBBBB";		
		thisPtr.ui.contentWrapper.style.paddingBottom="0px";
		thisPtr.ui.contentWrapper.style.paddingRight="0px";						
	}
	
	//event handler
	function mouseUpFunc(){ //output on click
		thisPtr.ui.contentWrapper.style.borderTopWidth="1px";
		thisPtr.ui.contentWrapper.style.borderLeftWidth="1px";
		thisPtr.ui.contentWrapper.style.borderTopColor="#EEEEEE";		
		thisPtr.ui.contentWrapper.style.borderLeftColor="#EEEEEE";		
		thisPtr.ui.contentWrapper.style.paddingBottom="1px";
		thisPtr.ui.contentWrapper.style.paddingRight="1px";								
		doOutput();
	}	
		
	//event handler
	function deselectFunc() { //finished editing
		determineType(); //set type flag so we output as the correct type
		setStyles();
	}
	
	//helper function to set the flag for output type
	function determineType(arg) {
		var args = arg||thisPtr.args;
		if(args && args[0]=='[' && args[args.length-1]==']') {
			thisPtr.argType="array";
		} else if(args && args[0]=='{' && args[args.length-1]=='}' && args.indexOf(":")!=-1) {
			thisPtr.argType="object";
		} else if(args && args.split(" ").length==1 && !isNaN((+args))) {
			thisPtr.argType="number";
		} else {
			thisPtr.argType="string";
		}
	}
	
	//'editability' event handler	
	function toggleEditabilityFunc() {
		
		//if a custom color has been set, then use that.
		if(thisPtr.color!="#FFFFFF") {
			var bgcolor=thisPtr.color;
		} else {
			var bgcolor="#EEEEEE";			
		}
			
		var editMode=thisPtr.controller.patchController.getEditable();
		if(editMode=="performance")	{
			thisPtr.ui.contentWrapper.style.background=bgcolor;		
			thisPtr.ui.getElByID(thisPtr.createElID("message")).style.background=bgcolor;
			if(thisPtr.ui.getElByID(thisPtr.createElID("message")))
				thisPtr.ui.getElByID(thisPtr.createElID("message")).style.background=bgcolor;
		} else { //edit
			thisPtr.ui.contentWrapper.style.background=thisPtr.color;			
			thisPtr.ui.getElByID(thisPtr.createElID("message")).style.background=thisPtr.color;
			if(thisPtr.ui.getElByID(thisPtr.createElID("message")))
				thisPtr.ui.getElByID(thisPtr.createElID("message")).style.background=thisPtr.color;
			setStyles();		
		}
	}
	
	//render custom html strings above
	this.ui=new LilyObjectView(this,messageHTML);
	this.ui.draw();
	this.ui.getElByID(thisPtr.createElID("message")).innerHTML=(this.editArgs)?LilyUtils.string2HTML(this.editArgs):spacer(); //set the value here	
	
	//
	this.displayElement=this.ui.getElByID(thisPtr.createElID("message"));
	var editor=new LilyComponents._editor(this,this.displayElement,spacer(),setArgs,getArgs,false); //widget that will handle editing...			
	
	function setStyles() {
		
		if(thisPtr.color!="#EEEEEE") {
			var bgcolor=thisPtr.color;
		} else {
			var bgcolor="#EEEEEE";			
		}		
		
		//set some basics for the contentWrapper
		thisPtr.ui.contentWrapper.style.borderWidth="1px";
		thisPtr.ui.contentWrapper.style.borderStyle="solid";
		thisPtr.ui.contentWrapper.style.borderColor="white";
		thisPtr.ui.contentWrapper.style.background=bgcolor;
		thisPtr.ui.contentWrapper.style.padding="1px";
		thisPtr.ui.contentWrapper.style.margin="0px"; 

		thisPtr.ui.contentContainer.style.borderRightWidth="4px";
		thisPtr.ui.contentContainer.style.borderRightStyle="double";
			
	}	
	
	setStyles();
		
	//add listeners to handle changes in patch editability
	this.controller.patchController.attachPatchObserver(thisPtr.objID,"editabilityChange",toggleEditabilityFunc,"all");
	
	//add listeners to handle user interaction	
	this.controller.attachObserver(this.createElID("message"),"mousedown",mouseDownFunc,"performance");
	this.controller.attachObserver(this.createElID("message"),"mouseup",mouseUpFunc,"performance");

	this.controller.attachObserver(this.createElID("message"),"dblclick",editor.startEdit,"edit");	
	this.controller.attachObserver(this.objID,"deselect",editor.endEdit,"edit");

	this.controller.attachObserver(this.objID,"deselect",deselectFunc,"edit");

	toggleEditabilityFunc(); //ensure appearance is correct on creation
	determineType(); //make sure we have the correct type.	
	
//	LilyDebugWindow.print(thisPtr.argType);

	return this; //return the instance
}

var $messageMetaData = {
	textName:"message",
	htmlName:"message",
	objectCategory:"Messages",
	objectSummary:"Output a message by clicking it.",
	objectArguments:""
}