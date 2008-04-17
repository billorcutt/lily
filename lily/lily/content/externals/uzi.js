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
*	Construct a new uzi object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $uzi(val) 
{
	var thisPtr=this;
	var bangCount=parseInt(val)||1;
		
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" triggers uzi, number sends out that number of bangs");
	this.inlet2=new this.inletClass("inlet2",this,"set the number of bangs to send");	
	
	this.outlet1=new this.outletClass("outlet1",this,"watch out");
	this.outlet2=new this.outletClass("outlet2",this,"bang when done");
	this.outlet3=new this.outletClass("outlet3",this,"bang count");	
	
	this.inlet1["bang"]=function(){	
		for(var i=0;i<bangCount;i++) {
			thisPtr.outlet3.doOutlet(i+1);			
			thisPtr.outlet1.doOutlet("bang");
		}
		thisPtr.outlet2.doOutlet("bang");
	}
	
	this.inlet1["anything"]=function(val){
		
		if(isNaN(parseInt(val)))
			return;
			
		var bang_count = parseInt(val);
			
		for(var i=0;i<bang_count;i++) {
			thisPtr.outlet3.doOutlet(i+1);			
			thisPtr.outlet1.doOutlet("bang");
		}
		thisPtr.outlet2.doOutlet("bang");
	}
	
	this.inlet2["anything"]=function(val){
		if(isNaN(parseInt(val)))
			return;
			
		bangCount=parseInt(val);
	}		
	
	return this;
}

var $uziMetaData = {
	textName:"uzi",
	htmlName:"uzi",
	objectCategory:"Control",
	objectSummary:"Output a sequence of bangs.",
	objectArguments:"number of bangs [1]"
}