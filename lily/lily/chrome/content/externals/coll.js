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
*	Construct a new coll object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $coll(save)
{
	var thisPtr=this;
	this.saveData=(save=="nosave")?false:true;	
	this.gColl={};
	var gData="";
	
	this.inlet1=new this.inletClass("inlet1",this,"list of key & value(s) to be stored");		
	this.outlet1 = new this.outletClass("outlet1",this,"stored data, retrieved by key.");	
	
	//set
	function storeData() {
		var tmp = gData.shift();	
		thisPtr.gColl[tmp]=gData.join(" ");
	}
	
	//get
	function getData() {		
		return thisPtr.gColl[gData[0]];
	}
	
	//is data to store?
	function isData(str) {
		
		gData = LilyUtils.splitArgs(str);			
		if(gData && gData.length>1)
			return true;
		else
			return false;
	
	}
	
	this.inlet1["clear"]=function(msg) {
		thisPtr.gColl={};
	}
	
	this.inlet1["remove"]=function(msg) {
		delete thisPtr.gColl[msg];
	}
	
	//anything else
	this.inlet1["anything"]=function(msg) {	
		if(isData(msg)) {
			storeData();			
		} else {
			var tmp = getData();
			if(typeof tmp!="undefined") {
				thisPtr.outlet1.doOutlet(LilyUtils.convertType(tmp));			
			} else {
				thisPtr.outlet1.doOutlet("bang");
			}
		}
	}
	
	return this;
}

var $collMetaData = {
	textName:"coll",
	htmlName:"coll",
	objectCategory:"Data",
	objectSummary:"Persist data in a patch.",
	objectArguments:"\"nosave\" prevents data from being saved with patch"	
	
}