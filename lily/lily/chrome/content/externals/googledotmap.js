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
*	Construct a new googlemap object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//tbd- need to set markers
function $googledotmap()
{
	var thisPtr=this;
	this.ui={};	
	
	var api=null;
	var map=null;
	var mgr = null;	
	var gZoom=6;
	
	var orgHeight=300;
	var orgWidth=500;
	var gMarkers = [];
	
	this.inlet1=new this.inletClass("inlet1",this,"coordinates as hash \"{longitude,latitude}\". methods: \"addmarker\", \"center\", \"pan\", \"zoomIn\", \"zoomOut\"");
	this.inlet2=new this.inletClass("inlet2",this,"number 0-17 sets zoom level");
	
	this.outlet1 = new this.outletClass("outlet1",this,"outputs coordinates on click");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on load");	
	
	this.inlet2["num"]=function(num) {
		gZoom=parseInt(num);
		map.setZoom(gZoom);	
	}
	
	this.inlet1["obj"]=function(obj) {
		setCenter(obj);		
	}
	
	this.inlet1["anything"]=function(str) {
		setCenter({"latitude":str.split(" ")[0],"longitude":str.split(" ")[1]});	
	}	
	
	this.inlet1["addmarker"]=function(str) {		
		setMarker({"latitude":str.split(" ")[0],"longitude":str.split(" ")[1]});
	}
	
	this.inlet1["clearmarkers"]=function() {		
		for(var i=0;i<gMarkers.length;i++) {
			gMarkers[i].hide();
		}
	}	
	
	this.inlet1["center"]=function(str) {		
		setCenter({"latitude":str.split(" ")[0],"longitude":str.split(" ")[1]});
	}
	
	this.inlet1["pan"]=function(str) {
		setTimeout(function(){
			panTo({"latitude":str.split(" ")[0],"longitude":str.split(" ")[1]});
		},10);		

	}
	
	this.inlet1["zoomIn"]=function() {
		if(gZoom<17)	 {
			map.zoomIn();
			gZoom++;	
		}
	}
	
	this.inlet1["zoomOut"]=function() {
		if(gZoom>1)	 {
			map.zoomOut();
			gZoom--;	
		}		
	}
	
	this.inlet1["map"]=function() {
		map.setMapType(api.G_NORMAL_MAP);
	}	
	
	this.inlet1["satellite"]=function() {
		map.setMapType(api.G_SATELLITE_MAP);
	}
	
	function panTo(pos) {
		map.panTo(new api.GLatLng(parseFloat(pos["latitude"]),parseFloat(pos["longitude"])));
	}	
	
	function setMarker(pos) {
		mgr = new api.GMarkerManager(map);	
		var marker = new api.GMarker(new api.GLatLng(parseFloat(pos["latitude"]),parseFloat(pos["longitude"])));
		gMarkers.push(marker);
		mgr.addMarker(marker, 3);		
	}
	
	function setCenter(pos) {
		map.setCenter(new api.GLatLng(parseFloat(pos["latitude"]),parseFloat(pos["longitude"])),gZoom);		
	}		
	
	function loadMap() {
      if (typeof iframe.objFrame.contentWindow.GBrowserIsCompatible == "function" && iframe.objFrame.contentWindow.GBrowserIsCompatible()) {
		//create map
		map = new api.GMap2(iframe.objFrame.contentDocument.getElementById(thisPtr.createElID("map")));
		map.enableContinuousZoom();
		//add click listener
		api.GEvent.addListener(map, "click", function(marker, point) {
			if(point) {
				thisPtr.outlet1.doOutlet({longitude:point.lng(),latitude:point.lat()})
			}
		});		
      }
    }
		
	function frameInit() {
		iframe.objFrame.contentDocument.getElementById("bodyElement").innerHTML='<div id="'+thisPtr.createElID("map")+'" style="padding:0px;border:0px;margin:0px;width:'+orgWidth+'px;height:'+orgHeight+'px"></div>';
		api=iframe.objFrame.contentWindow;
		loadMap();
		thisPtr.outlet2.doOutlet("bang");			
	}
	
	//resize
	function deselectFunc() {
		if(thisPtr.height!=orgHeight||thisPtr.width!=orgWidth) {
			orgHeight=thisPtr.height;
			orgWidth=thisPtr.width;
			iframe.reload();		
		}
	}
	
	var iframe=new LilyComponents._iframe(this,"file://"+Lily.libPath+"/googlemaps.html",300,500,"no",frameInit);
	
	this.controller.attachObserver(this.objID,"deselect",function(){deselectFunc();},"edit");
	this.controller.patchController.attachPatchObserver(thisPtr.createElID("map"),"patchLoaded",function(){deselectFunc();},"all");	

	return this;
}

var $googledotmapMetaData = {
	textName:"google.map",
	htmlName:"google.map",
	objectCategory:"Web Service",
	objectSummary:"Display a location using the Google Map API.",
	objectArguments:""
}