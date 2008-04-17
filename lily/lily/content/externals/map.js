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
*	Construct a new template object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $map(args)
{
	var thisPtr=this;	

	var originalMin = parseInt(args.split(" ")[0])||0;
	var originalMax = parseInt(args.split(" ")[1])||0; 
	var newMin 		= parseInt(args.split(" ")[2])||0;
	var newMax 		= parseInt(args.split(" ")[3])||0; 
	
	this.inlet1=new this.inletClass("inlet1",this,"input numbers are mapped to a new range");

	this.inlet2=new this.inletClass("inlet2",this,"input numbers set the original minimum");
	this.inlet3=new this.inletClass("inlet3",this,"input numbers set the original maximum");
	this.inlet4=new this.inletClass("inlet4",this,"input numbers set the new minimum");
	this.inlet5=new this.inletClass("inlet5",this,"input numbers set the new maximum");
	
	this.outlet1 = new this.outletClass("outlet1",this,"ranged numbers");						
	
	//anything else
	this.inlet1["num"]=function(msg) {
		var result = LilyUtils.map(originalMin,originalMax,newMin,newMax,(+msg));
		thisPtr.outlet1.doOutlet(result);
	}	
	
	this.inlet2["num"]=function(msg) {
		originalMin=(+msg);
	}

	this.inlet3["num"]=function(msg) {
		originalMax=(+msg);
	}

	this.inlet4["num"]=function(msg) {
		newMin=(+msg);
	}
	
	this.inlet5["num"]=function(msg) {
		newMax=(+msg);
	}	
	
	return this;
}

var $mapMetaData = {
	textName:"map",
	htmlName:"map",
	objectCategory:"Math",
	objectSummary:"Map a number from one range to another.",
	objectArguments:"Start Min, Start Max, End Min, End Max"
}