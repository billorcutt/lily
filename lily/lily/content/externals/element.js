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
*	Construct a new element object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $element(param)
{
	var thisPtr=this;	
	var obj=null;
	
	var gArr=LilyUtils.splitArgs(param);
	var gCmd=gArr.shift()||null;
	
	this.inlet1=new this.inletClass("inlet1",this,"method to call on the element");
	this.inlet2=new this.inletClass("inlet2",this,"store an object");
	this.outlet1=new this.outletClass("outlet1",this,"result if any, otherwise bang on complete");
	this.outlet2=new this.outletClass("outlet2",this,"target nodes if event handler is set");		
	
	function eventHandler(e) {
		thisPtr.outlet2.doOutlet(e.target);
	}
	
	function preventDefaultHandler(e) {
		e.preventDefault();
		thisPtr.outlet2.doOutlet(e.target);
	}				
				
	//exec commands
	this.inlet1["anything"]=function(str) {
		
		var arr=LilyUtils.splitArgs(str);
		var cmd=arr.shift()||null;
		
//		LilyDebugWindow.print("tagName is "+ obj.hasAttribute("innerHTML"));
		
		if(obj && cmd && (typeof obj[cmd]=="function"||typeof obj[cmd]=="object")) {		
			
			try {
				//it's a function, so call it.
				var tmp = obj[cmd].apply(obj,arr);	
			} catch(e) {
				LilyDebugWindow.error("Element property not a method")
			}

			if(tmp && typeof tmp == "object" && tmp.length) {
				for(var i=0;i<tmp.length;i++)
					arr.push(tmp[i]);
				thisPtr.outlet1.doOutlet(arr);
			} else if(tmp) {
				thisPtr.outlet1.doOutlet(tmp);	
			} else {
				thisPtr.outlet1.doOutlet("bang");
			}				
		
		} else if(cmd && obj && typeof obj[cmd]!="undefined" && arr.length) {
			
			//its a property and an argument, so set it.
			var tmp = obj[cmd]=arr.join(" ");
			
//			log("set prop "+cmd+" "+arr);			
			
			if(tmp && typeof tmp == "object" && tmp.length) {
				for(var i=0;i<tmp.length;i++)
					arr.push(tmp[i]);
				thisPtr.outlet1.doOutlet(arr);
			} else if(tmp) {
				thisPtr.outlet1.doOutlet(tmp);	
			} else {
				thisPtr.outlet1.doOutlet("bang");
			}				
			
		} else if(cmd && obj && typeof obj[cmd]!="undefined") {

			//its just a property- output it.
			var tmp = obj[cmd];

//			log("get prop "+cmd);			

			if(tmp && typeof tmp == "object" && tmp.length) {
				for(var i=0;i<tmp.length;i++)
					arr.push(tmp[i]);
				thisPtr.outlet1.doOutlet(arr);
			} else if(tmp) {
				thisPtr.outlet1.doOutlet(tmp);	
			} else {
				thisPtr.outlet1.doOutlet("bang");
			}				

		}	
	}
	
	this.inlet1["getSize"]=function() {
		if(obj) {
			var size_obj = {width:obj.offsetWidth,height:obj.offsetHeight}
			thisPtr.outlet1.doOutlet(size_obj);
		} else {
			thisPtr.outlet1.doOutlet("bang");
		}
	}
	
	this.inlet1["getPos"]=function() {
		if(obj) {
			var tmp = LilyUtils.getObjectPos(obj);
			var pos_obj = {left:tmp[0],top:tmp[1]}
			thisPtr.outlet1.doOutlet(pos_obj);
		} else {
			thisPtr.outlet1.doOutlet("bang");			
		}
	}	
	
	//set element style
	this.inlet1["setStyle"]=function(str) {
		
		var arr=LilyUtils.splitArgs(str);
		var prop=arr.shift()||null;
		
		if(obj && typeof obj.style != "undefined") {
			obj.style[prop]=arr.join(" ");
			thisPtr.outlet1.doOutlet("bang");
		}
			
	}
	
	//get element style
	this.inlet1["getStyle"]=function(str) {
		
		var prop=str||null;
		if(obj && typeof obj.style != "undefined" && prop && typeof obj.style[prop] != "undefined") {
			thisPtr.outlet1.doOutlet(obj.style[prop]);
		} else {
			thisPtr.outlet1.doOutlet("bang");
		}
			
	}

	//add event listener
	this.inlet1["addEvent"]=function(args) {
		
		var type=args.split(" ")[0]||null;
		var pDefault=args.split(" ")[1]||false;
				
		if(obj && typeof type != "undefined" && typeof obj.addEventListener != "undefined") {
			
			if(!pDefault)
				obj.addEventListener(type,eventHandler,false);
			else
				obj.addEventListener(type,preventDefaultHandler,false);
				
			thisPtr.outlet1.doOutlet(obj);
		}	
	}
	
	//remove event listener
	this.inlet1["removeEvent"]=function(args) {
				
		var type=args.split(" ")[0]||null;
		var pDefault=args.split(" ")[1]||false;
		
		if(obj && typeof type != "undefined" && typeof obj.removeEventListener != "undefined") {

			if(!pDefault) { 
				obj.removeEventListener(type,eventHandler,false);
			} else {
				obj.removeEventListener(type,preventDefaultHandler,false);
			} 	
				
			thisPtr.outlet1.doOutlet(obj);
		}	
	}	
		
	//output stored element
	this.inlet1["bang"]=function() {	
		if(obj) {
			thisPtr.outlet1.doOutlet(obj);
		}		
	}		

	//delete node
	this.inlet1["delete"]=function() {
		var parEl = obj.parentNode;
		if(parEl){
			var el = parEl.removeChild(obj);
			thisPtr.outlet1.doOutlet(el);
			obj=null;
		}		
	}	

	//replace node
	this.inlet1["replace"]=function(tag) {
		var parEl = obj.parentNode;
		if(parEl && tag){
			var tmp = thisPtr.document.createElement(tag);
			var id = this.parent.generateUID();
			tmp.setAttribute("id","newNode"+id);
			var el = parEl.replaceChild(tmp,obj);
			thisPtr.outlet1.doOutlet(el);
			obj=thisPtr.document.getElementById(id); //set the new object here
		}		
	}
	
	//exec commands
	this.inlet1["obj"]=function(o) {
		
		obj=o; //store the object
		var arr = [];
		
		if(obj && gCmd && typeof obj[gCmd]=="function") {
			
			//it's a function, so call it.
			var tmp = obj[gCmd].apply(obj,gArr);
			
			if(tmp && typeof tmp == "object" && tmp.length) {
				for(var i=0;i<tmp.length;i++)
					arr.push(tmp[i]);
				thisPtr.outlet1.doOutlet(arr);
			} else if(tmp) {
				thisPtr.outlet1.doOutlet(tmp);	
			} else {
				thisPtr.outlet1.doOutlet("bang");
			}
			
		
		} else if(gCmd && typeof obj[gCmd]!="undefined") {
			
			var tmp = obj[gCmd];

			if(tmp && typeof tmp == "object" && tmp.length) {
				for(var i=0;i<tmp.length;i++)
					arr.push(tmp[i]);
				thisPtr.outlet1.doOutlet(arr);
			} else if(tmp) {
				thisPtr.outlet1.doOutlet(tmp);	
			} else {
				thisPtr.outlet1.doOutlet("bang");
			}

		}
			
	}	
		
	//store object
	this.inlet2["obj"]=function(o) {
		obj=o;		
	}	
	
	return this;
}

var $elementMetaData = {
	textName:"element",
	htmlName:"element",
	objectCategory:"Objects",
	objectSummary:"Manipulate a DOM element.",
	objectArguments:"method name, arguments to method"
}