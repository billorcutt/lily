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
*	Construct a new dom object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $dom()
{
	var thisPtr=this;	
	var doc=null;
	var tw=null;
	var hl=false;
	var prevNode={node:null,borderStyle:null,borderWidth:null,borderColor:null};
	var parserNode = null; //for html that we've parsed, we get a handle to the parser so we can clean up when we're done.
	
	this.inlet1=new this.inletClass("inlet1",this,"methods: \"root\", \"next\", \"prev\", \"parent\", \"lastChild\", \"firstChild\", \"parse\", \"serialize\"");
	this.inlet2=new this.inletClass("inlet2",this,"document to explore");
	this.outlet1 = new this.outletClass("outlet1",this,"dom nodes, bang if null");
	this.outlet2 = new this.outletClass("outlet2",this,"bang when parseHTML is complete");			
	
	this.destructor=function() {
		if(parserNode) {
			parserNode.parentNode.removeChild(parserNode);
			parserNode=null;
		}	
	}	
	
	//get root node.
	this.inlet2["obj"]=function(obj) {
		if(obj) {
			
			if(parserNode) {
				parserNode.parentNode.removeChild(parserNode);
				parserNode=null;
			}
			
			doc=obj;
			tw=doc.createTreeWalker(
				doc.documentElement, NodeFilter.SHOW_ELEMENT,
			    { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } },
			    false
			);
		}
	}
		
	//set pref to highlight the current node.
	this.inlet1["highlight"]=function(bool) {
		hl=LilyUtils.convertType(bool);
	}
	
	function overFunc(evt) {
		if(tw) {
			tw.currentNode=evt.target;
			if(hl) {			
				restoreStyle();
				saveStyle(tw.currentNode);
				setStyle(tw.currentNode);
			}	
		}
	}
	
	function outFunc(evt) {
		if(hl) {
			restoreStyle();					
		}
	}
	
	function clickFunc(evt) {
		if(tw) {
			evt.preventDefault();
			thisPtr.outlet1.doOutlet(tw.currentNode);
		}
	}	
	
	//the inspector sets the current node using the mouse.
	this.inlet1["inspector"]=function(bool) {		
		if(bool=="true") {			
			content.addEventListener("mouseover",overFunc, true);
			content.addEventListener("mouseout",outFunc, true);
			content.addEventListener("click",clickFunc, true);		
		} else {		
			content.removeEventListener("mouseover",overFunc, true);
			content.removeEventListener("mouseout",outFunc, true);
			content.removeEventListener("click",clickFunc, true);			
		}
	}
	
	//parse string into xml. 
	this.inlet1["parse"]=function(aStr) {
		var xmlDoc = LilyUtils.parseXML(aStr);
		if(xmlDoc) {
			thisPtr.inlet2["obj"](xmlDoc);
		}		
	}
	
	//parse string into html. 
	this.inlet1["parseHTML"]=function(str) {
		var tmp=LilyUtils.parseHTML(thisPtr.win,str,function(htmlDoc){
			if(htmlDoc) {
				thisPtr.inlet2["obj"](htmlDoc);
				parserNode=tmp; //save the node.
				thisPtr.outlet2.doOutlet("bang"); //send out a notification				
			}
		});	
	}	
	
	//serialize xml as string
	this.inlet1["serialize"]=function() {
		if(doc) {
			var s = new XMLSerializer();
			var str = s.serializeToString(doc);	
			thisPtr.outlet1.doOutlet(str);
		}		
	}	
			
	//get nodes by tag name - if no argument then just get all nodes- output one at a time. 
	this.inlet1["getTags"]=function(type) {
		
		if(doc) {
			var t = type || "*";
			var coll = doc.getElementsByTagName(t);

			if(coll.length) {
				for(var i=0;i<coll.length;i++)
					thisPtr.outlet1.doOutlet(coll[i]);
				thisPtr.outlet1.doOutlet("bang");	
			} else {
				thisPtr.outlet1.doOutlet("bang");
			}	
		}
						
	}

	//just output the dom obj.
	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet(doc);	
	}			
			
	//get the next node.
	this.inlet1["next"]=function() {
		if(tw&&tw.nextNode())
			outputCurrNode();
		else
			thisPtr.outlet1.doOutlet("bang");	
	}
	
	//get the prev node.
	this.inlet1["prev"]=function() {
		if(tw&&tw.previousNode())
			outputCurrNode();
		else
			thisPtr.outlet1.doOutlet("bang");	
	}
	
	//just output the current node.
	this.inlet1["current"]=function() {
		if(tw&&tw.currentNode)
			outputCurrNode();
		else
			thisPtr.outlet1.doOutlet("bang");
	}		
	
	//get root node.
	this.inlet1["root"]=function(type) {
		if(tw) {
			tw.currentNode=tw.root;
			outputCurrNode();
		} else {
			thisPtr.outlet1.doOutlet("bang");	
		}	
	}
	
	//get root node.
	this.inlet1["body"]=function(type) {
		if(tw&&doc&&doc.getElementsByTagName("body")[0]) {
			tw.currentNode=doc.getElementsByTagName("body")[0]||doc.documentElement;
			outputCurrNode();
		} else {
			thisPtr.outlet1.doOutlet("bang");	
		}	
	}			
	
	//get parent node.
	this.inlet1["parentNode"]=function(type) {
		if(tw&&tw.parentNode()) {			
			outputCurrNode();		
		} else {
			thisPtr.outlet1.doOutlet("bang");	
		}
	}
		
	//get next parent node.
	this.inlet1["nextSibling"]=function(type) {
		if(tw&&tw.nextSibling()) {			
			outputCurrNode();		
		} else {
			thisPtr.outlet1.doOutlet("bang");	
		}
	}
	
	//get prev node
	this.inlet1["prevSibling"]=function() {
		if(tw&&tw.previousSibling()) {			
			outputCurrNode();		
		} else {
			thisPtr.outlet1.doOutlet("bang");	
		}	
	}
	
	//get all.
	this.inlet1["childNodes"]=function() {
		if(tw && tw.currentNode) {			
			var coll = tw.currentNode.childNodes;

			if(coll.length) {
				for(var i=0;i<coll.length;i++)
					thisPtr.outlet1.doOutlet(coll[i]);
				thisPtr.outlet1.doOutlet("bang");	
			} else {
				thisPtr.outlet1.doOutlet("bang");
			}	
		
		} else {
			thisPtr.outlet1.doOutlet("bang");	
		}
	}				
	
	//get first child node.
	this.inlet1["firstChild"]=function() {
		if(tw&&tw.firstChild()) {			
			outputCurrNode();		
		} else {
			thisPtr.outlet1.doOutlet("bang");	
		}
	}
	
	//get last child node.
	this.inlet1["lastChild"]=function() {
		if(tw&&tw.lastChild()) {			
			outputCurrNode();		
		} else {
			thisPtr.outlet1.doOutlet("bang");	
		}
	}
	
	//save node style info.
	function saveStyle(node) {
		prevNode.node=node;
		prevNode.borderWidth=node.style.borderWidth;
		prevNode.borderStyle=node.style.borderStyle;
		prevNode.borderColor=node.style.borderColor;		
	}
	
	//restore node style info from prevNode object.	
	function restoreStyle() {
		if(prevNode.node) {
			prevNode.node.style.borderWidth=prevNode.borderWidth;
			prevNode.node.style.borderStyle=prevNode.borderStyle;
			prevNode.node.style.borderColor=prevNode.borderColor;			
		}
	}
	
	//highlight the node.
	function setStyle(node) {
		node.style.borderWidth="3px";
		node.style.borderStyle="solid";
		node.style.borderColor="blue";
	}	
	
	//output node.
	function outputCurrNode() {
		if(tw && tw.currentNode) {
			if(hl) {			
				restoreStyle();
				saveStyle(tw.currentNode);
				setStyle(tw.currentNode);
			}	
			thisPtr.outlet1.doOutlet(tw.currentNode);
		}
	}		
	
	return this;
}

var $domMetaData = {
	textName:"dom",
	htmlName:"dom",
	objectCategory:"Objects",
	objectSummary:"Manipulate an XML or HTML document.",
	objectArguments:"Access a document via its DOM."
}