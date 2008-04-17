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
*	Construct a new antipode object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//need to expand this antipode with various typed messages
function $antipode()
{
	var thisPtr=this;
	
	this.inlet1=new this.inletClass("inlet1",this,"coordinates as hash \"{longitude,latitude}\" or list \"longitude latitude\"");		
	this.outlet1 = new this.outletClass("outlet1",this,"coordinates as a hash with keys {longitude,latitude}");
		
	function getAntipode(lon,lat) {
		return [(parseFloat(lon)>180)?(parseFloat(lon)-180):(parseFloat(lon)+180),(lat*-1)];
	}
	
	//anything else
	this.inlet1["obj"]=function(obj) {		
		var tmp=getAntipode(obj["longitude"],obj["latitude"]);	
		thisPtr.outlet1.doOutlet({"longitude":parseFloat(tmp[0]),"latitude":parseFloat(tmp[1])});
	}	
	
	//anything else
	this.inlet1["anything"]=function(msg) {		
		var tmp=getAntipode(msg.split(" ")[0],msg.split(" ")[1]);	
		thisPtr.outlet1.doOutlet({"longitude":parseFloat(tmp[0]),"latitude":parseFloat(tmp[1])});
	}	
	
	return this;
}

var $antipodeMetaData = {
	textName:"antipode",
	htmlName:"antipode",
	objectCategory:"Math",
	objectSummary:"Output the antipode for a coordinate.",
	objectArguments:""	
}