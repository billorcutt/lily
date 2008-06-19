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
*	Construct a new receive object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $receive(args)
{
	var thisPtr=this;	
	this.receiveName=args||null;
	
	if(!this.receiveName) {
		LilyDebugWindow.error("the receive object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("receive");		
		return;
	}
	
	this.outlet1=new this.outletClass("outlet1",this,"received message");		
	
	this.receiveSentData=function(msg) {
		thisPtr.outlet1.doOutlet(msg);
	}
	
	//init
	if(typeof Lily.receiveObjects[this.receiveName] == "undefined") {
		Lily.receiveObjects[this.receiveName]=[this];
	} else if(typeof Lily.receiveObjects[this.receiveName] == "object") {
		Lily.receiveObjects[this.receiveName].push(this);
	}
	
	//remove the ref to this instance.
	this.destructor=function() {
		if(typeof Lily.receiveObjects[thisPtr.receiveName] != "undefined") {
			var tmp = Lily.receiveObjects[thisPtr.receiveName];
			for(var i=0;i<tmp.length;i++) {
				if(tmp[i] === thisPtr) {
					tmp.splice(i,1);
					if(!tmp.length) {
						delete Lily.receiveObjects[thisPtr.receiveName];
					}
				}
			}
		}
	}

	return this;
}

var $receiveMetaData = {
	textName:"receive",
	htmlName:"receive",
	objectCategory:"Messages",
	objectSummary:"Receive messages sent without connections.",
	objectArguments:"[senders to receive from]"
}