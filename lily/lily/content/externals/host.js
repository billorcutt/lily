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
*	Construct a new host object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $host()
{
	var thisPtr=this;	
	var layers=[]; //save for later.

	this.outlet2 = new this.outletClass("outlet2",this,"\"bang\" on complete");	
	this.outlet1 = new this.outletClass("outlet1",this,"html as string, host document nodes.");	
	this.inlet1=new this.inletClass("inlet1",this,"methods: \"setLoc\", \"getLoc\", \"getHTML\", \"getText\", \"getTags\", \"getText\", \"getDoc\", \"displayLayer\", \"getLayers\", \"display\"");	
	
	//set the host location.
	this.inlet1["anything"]=function(url) {
		log(url)
	}	
	
	//set the host location.
	this.inlet1["loadTab"]=function(url) {
		LilyUtils.getBrowser().loadOneTab(url);
	}
	
	//set the host location.
	this.inlet1["setLoc"]=function(url) {
		window.gBrowser.selectedBrowser.contentDocument.defaultView.location.href=url
	}	
	
	//get the host location.
	this.inlet1["getLoc"]=function() {
		thisPtr.outlet1.doOutlet(window.gBrowser.selectedBrowser.contentDocument.defaultView.location.href);
	}	
	
	//get the host size.
	this.inlet1["getSize"]=function() {
		thisPtr.outlet1.doOutlet({width:parseInt(window.innerWidth),height:parseInt(window.innerHeight)});
	}
	
	//get the host position.
	this.inlet1["getPos"]=function() {
		thisPtr.outlet1.doOutlet({left:parseInt(window.screen.left),top:parseInt(window.screen.top)});
	}	
	
	//return html string.
	this.inlet1["getHTML"]=function() {
		var str="<html>"+content.document.getElementsByTagName("html")[0].innerHTML+"</html>";
		if(str) thisPtr.outlet1.doOutlet(str);
	}
	
	//get displayed text.
	this.inlet1["getText"]=function() {
		var body = content.document.getElementsByTagName("body")[0];
		content.getSelection().selectAllChildren(body);
		var str=content.getSelection();
		thisPtr.outlet1.doOutlet(str);
		content.getSelection().removeAllRanges(); //deselect			
	}	
	
	//get selected text.
	this.inlet1["getSelected"]=function() {
		thisPtr.outlet1.doOutlet(content.getSelection());			
	}
	
	//get selected text.
	this.inlet1["getSelectedNode"]=function() {
		//look to see if there's an existiing span
		var selection = content.getSelection();
		
		if(selection.toString().length) {
			var parNode = selection.getRangeAt(0).commonAncestorContainer;
			
			if(parNode && parNode.getElementsByTagName) {
				var coll = parNode.getElementsByTagName("SPAN");

				for(var i=0;i<coll.length;i++) {
					if(coll[i].className=="span_surrounded_node") {
						thisPtr.outlet1.doOutlet(coll[i]);
						return;	
					}
				}	
			}
			
			//no existing span so create and output
			var span = content.document.createElement("span");
			span.setAttribute("class","span_surrounded_node");		
			selection.getRangeAt(0).surroundContents(span);
			thisPtr.outlet1.doOutlet(span);
		}
				
	}
	
	//get host window.
	this.inlet1["getWin"]=function() {
		thisPtr.outlet1.doOutlet(content);			
	}			
	
	//get host window doc.
	this.inlet1["getDoc"]=function() {
		thisPtr.outlet1.doOutlet(content.document);			
	}	
			
	//display some html as a layer in the host window.
	this.inlet1["displayLayer"]=function(msg) {
		
		var d = content.document.createElement("div");
		d.setAttribute("style","position:absolute;left:0px;top:0px;width:100%;height:100%;")
		var b = content.document.getElementsByTagName("body")[0];
		b.appendChild(d);
		d.innerHTML=msg;
		layers.push(d);
		
		thisPtr.outlet2.doOutlet("bang");		
		
	}
	
	//need a method to display an entire page.
	this.inlet1["getLayers"]=function() {
		if(layers) thisPtr.outlet1.doOutlet(layers);
	}
	
	//need a method to display an entire page.
	this.inlet1["display"]=function(msg) {
		content.document.open();
		content.document.write(msg);
		content.document.close();	
	}
	
	function loadFunc(e) {
//		thisPtr.outlet1.doOutlet(content.document);
		if(e.originalTarget instanceof HTMLDocument) {
			layers=[];
			thisPtr.outlet2.doOutlet("bang");
		}
	}
		
	//window.addEventListener("load",loadFunc,true);
	gBrowser.addEventListener("load", loadFunc, true)	
			
	return this;
}

var $hostMetaData = {
	textName:"host",
	htmlName:"host",
	objectCategory:"System",
	objectSummary:"Interact with the main browser window.",
	objectArguments:""
}