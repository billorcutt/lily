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
*	Construct a new color object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $color(arg)
{
	var thisPtr=this;
	var websafe=arg||false;
	this.outlet1 = new this.outletClass("outlet1",this,"random color in hexadecimal");
	this.inlet1=new this.inletClass("inlet1",this,"\"bang\" outputs random color");	
	
	// getRandomColor()
	// Returns a random hex color.  Passing true for safe returns a web safe color
	//code hijacked from http://www.scottandrew.com/js/js_util.js
	
	function getRandomColor(safe)
	{		
	  var vals,r,n;
	  if (safe)
	  {
	    v = "0369CF";
	    n = 3;
	  } else
	  {
	    v = "0123456789ABCDEF";
	    n = 6;
	  }
	  var c = "#";
	  for (var i=0;i<n;i++)
	  {
	    var ch = v.charAt(Math.round(Math.random() * (v.length-1)));
	    c += (safe)?ch+ch:ch;
	  }
	  return c;
	}

	function RGBtoHex(R,G,B) {
		return toHex(R)+toHex(G)+toHex(B);
	}
	
	function toHex(N) {
		if (N==null) return "00";
		N=parseInt(N); if (N==0 || isNaN(N)) return "00";
		N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
		return "0123456789ABCDEF".charAt((N-N%16)/16) + "0123456789ABCDEF".charAt(N%16);
	}
	
	function HSLtoRGB (h,s,l) {
		if (s == 0) return [l,l,l] // achromatic
		h=h*360/255;s/=255;l/=255;
		if (l <= 0.5) rm2 = l + l * s;
		else rm2 = l + s - l * s;
		rm1 = 2.0 * l - rm2;
		return [toRGB1(rm1, rm2, h + 120.0),toRGB1(rm1, rm2, h),toRGB1(rm1, rm2, h - 120.0)];
	}

	function toRGB1(rm1,rm2,rh) {
		if      (rh > 360.0) rh -= 360.0;
		else if (rh <   0.0) rh += 360.0;
 		if      (rh <  60.0) rm1 = rm1 + (rm2 - rm1) * rh / 60.0;
		else if (rh < 180.0) rm1 = rm2;
		else if (rh < 240.0) rm1 = rm1 + (rm2 - rm1) * (240.0 - rh) / 60.0; 
 		return Math.round(rm1 * 255);
	}

	//output random color
	this.inlet1["random"]=function() {
		thisPtr.outlet1.doOutlet(getRandomColor(websafe));
	}	
		
	//convert RGB to hex
	this.inlet1["RGBtoHEX"]=function(rgb) {
		var tmp = rgb.split(" ");
		thisPtr.outlet1.doOutlet("#"+RGBtoHex(tmp[0],tmp[1],tmp[2]));
	}

	//convert HSL to hex
	this.inlet1["HSLtoHEX"]=function(hsl) {
		var tmp = hsl.split(" ");
		var rgb = HSLtoRGB(tmp[0],tmp[1],tmp[2]);
		thisPtr.outlet1.doOutlet("#"+RGBtoHex(rgb[0],rgb[1],rgb[2]));
	}			
		
	return this;
}

var $colorMetaData = {
	textName:"color",
	htmlName:"color",
	objectCategory:"Math",
	objectSummary:"Various color related utilities",
	objectArguments:"websafe colors only [false]"
}