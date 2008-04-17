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
*	Construct a new window object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $window()
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"methods: \"open\", \"close\", \"moveTo\", \"MoveBy\", \"location\", \"resizeTo\", \"resizeBy\", \"sizeToContent\", \"write\", \"alert\"");
	this.outlet2 = new this.outletClass("outlet2",this,"\"bang\" on complete");	
	this.outlet1 = new this.outletClass("outlet1",this,"html as string, host document nodes.");	
	var popup=null;	
	
	//open a window
	this.inlet1["open"]=function(args) {
		
		//if(!popup || popup.closed) {
			
//			LilyDebugWindow.print(args)	
			
			var params=args.split(" ")||"";

			//some weird syntax here to fake FF into letting me call window.open with apply().
			var foo=function(){popup=window.open.apply(this,params);}();
			popup.addEventListener("load",function(){thisPtr.outlet2.doOutlet("bang");},false);
			thisPtr.outlet1.doOutlet(popup);			
			
//			LilyDebugWindow.print(popup);
		
		//}
	}
	
	//close a window
	this.inlet1["close"]=function() {

		if(popup || !popup.closed) {
			popup.close();
			popup=null;
		}
		
	}
	
	//move a window
	this.inlet1["moveBy"]=function(args) {
		
		var params=args.split(" ")||"";		

		if(popup && !popup.closed && params.length==2) {
			popup.moveBy(params[0],params[1]);
		}
		
	}
	
	//move a window
	this.inlet1["moveTo"]=function(args) {
		
		var params=args.split(" ")||"";		

		if(popup && !popup.closed && params.length==2) {
			popup.moveTo(params[0],params[1]);
		}
		
	}
	
	//location of window
	this.inlet1["location"]=function(args) {
		
		var params=args.split(" ")||"";		

		if(popup && !popup.closed && params.length==1) {
			popup.location=params[0];
		}
		
	}
	
	//resizeto window
	this.inlet1["resizeTo"]=function(args) {
		
		var params=args.split(" ")||"";		

		if(popup && !popup.closed && params.length==2) {
			popup.resizeTo(params[0],params[1]);
		}
		
	}
	
	//resizeby window
	this.inlet1["resizeBy"]=function(args) {
		
		var params=args.split(" ")||"";		

		if(popup && !popup.closed && params.length==2) {
			popup.resizeBy(params[0],params[1]);
		}
		
	}
	
	
	//sizeToContent window
	this.inlet1["sizeToContent"]=function() {
	
		if(popup && !popup.closed) {
			popup.sizeToContent();
		}
		
	}
	
	//write window
	this.inlet1["write"]=function(str) {
	
		if(popup && !popup.closed) {
			popup.document.open();
			popup.document.write(str);
			popup.document.close();
		}
		
	}
	
	//write window
	this.inlet1["alert"]=function(str) {
	
		if(popup && !popup.closed) {
			popup.alert(str);
		}
		
	}	
					
	return this;
}

var $windowMetaData = {
	textName:"window",
	htmlName:"window",
	objectCategory:"System",
	objectSummary:"Open and control a browser window.",
	objectArguments:""
}