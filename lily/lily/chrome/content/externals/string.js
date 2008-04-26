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
*	Construct a new  string object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//need to expand this example with various typed messages
function $string(param)
{
	var thisPtr=this;
	var cmd=param||null;

	this.inlet1=new this.inletClass("inlet1",this,"string to modify");
	this.outlet1 = new this.outletClass("outlet1",this,"modified string");	
	
	//anything else
	this.inlet1["anything"]=function(msg) {
		if(cmd && typeof thisPtr.inlet1[cmd]=="function")
			thisPtr.inlet1[cmd]((msg));
		else
			thisPtr.outlet1.doOutlet((msg+=""));	
	}
	
	//string methods
	this.inlet1["indexOf"]=function(msg) {
		var arr = msg.split(" ");
		var idx = arr.shift();
		thisPtr.outlet1.doOutlet(arr.join(" ").indexOf(idx));
	}
	
	this.inlet1["lastIndexOf"]=function(msg) {
		var arr = msg.split(" ");
		var idx = arr.shift();
		thisPtr.outlet1.doOutlet(arr.join(" ").lastIndexOf(idx));
	}		
	
	this.inlet1["substring"]=function(msg) {
		var arr = msg.split(" ");
		var start = parseInt(arr.shift());
		var end = parseInt(arr.shift());
		var str = arr.join(" ");	
		thisPtr.outlet1.doOutlet(str.substring(start,end));
	}
	
	this.inlet1["charAt"]=function(msg) {
		var arr = msg.split(" ");
		var idx = parseInt(arr.shift());
		thisPtr.outlet1.doOutlet(arr.join(" ").charAt(idx));
	}	
	
	this.inlet1["toLowerCase"]=function(msg) {
		msg+="";
		thisPtr.outlet1.doOutlet(msg.toLowerCase());
	}	
	
	this.inlet1["toUpperCase"]=function(msg) {
		msg+="";
		thisPtr.outlet1.doOutlet(msg.toUpperCase());
	}	
	
	this.inlet1["length"]=function(msg) {
		msg+="";
		thisPtr.outlet1.doOutlet(msg.length);
	}		
	
	//html wrapper methods
	this.inlet1["anchor"]=function(msg) {
		var arr = msg.split(" ");
		var name = arr.shift();
		thisPtr.outlet1.doOutlet(arr.join(" ").anchor(name));
	}
	
	this.inlet1["bold"]=function(msg) {
		msg+="";
		thisPtr.outlet1.doOutlet(msg.bold());
	}
	
	this.inlet1["big"]=function(msg) {
		msg+="";		
		thisPtr.outlet1.doOutlet(msg.big());
	}
	
	this.inlet1["blink"]=function(msg) {
		msg+="";		
		thisPtr.outlet1.doOutlet(msg.blink());
	}
	
	this.inlet1["fixed"]=function(msg) {
		msg+="";		
		thisPtr.outlet1.doOutlet(msg.fixed());
	}
	
	this.inlet1["fontcolor"]=function(msg) {
		var arr = msg.split(" ");
		var color = arr.shift();
		thisPtr.outlet1.doOutlet(arr.join(" ").fontcolor(color));
	}
	
	this.inlet1["fontsize"]=function(msg) {
		var arr = msg.split(" ");
		var size = parseInt(arr.shift());
		thisPtr.outlet1.doOutlet(arr.join(" ").fontsize(size));
	}
	
	this.inlet1["italics"]=function(msg) {
		msg+="";
		thisPtr.outlet1.doOutlet(msg.italics());
	}	
	
	this.inlet1["small"]=function(msg) {
		msg+="";
		thisPtr.outlet1.doOutlet(msg.small());
	}
	
	this.inlet1["strike"]=function(msg) {
		thisPtr.outlet1.doOutlet(msg.strike());
	}	
	
	this.inlet1["sub"]=function(msg) {
		msg+="";		
		thisPtr.outlet1.doOutlet(msg.sub());
	}
	
	this.inlet1["sup"]=function(msg) {
		msg+="";		
		thisPtr.outlet1.doOutlet(msg.sup());
	}			
	
	this.inlet1["link"]=function(msg) {
		var arr = (typeof msg == "string")?msg.split(" "):msg;
		var url = arr.shift();
		var linktxt = arr.join(" ").link(url);
		linktxt = linktxt.replace(/a href/,"a target=\"_blank\" href");
		thisPtr.outlet1.doOutlet(linktxt);
	}
	
	this.inlet1["image"]=function(msg) {
		msg+="";		
		thisPtr.outlet1.doOutlet("<img src=\""+msg+"\"/>");
	}
	
	this.inlet1["thumb"]=function(msg) {
		msg+="";
		var arr = msg.split(" ");
		var size = arr[1]||100;
		var url  = arr[0]||"";		
		thisPtr.outlet1.doOutlet("<img style=\"cursor: pointer;\" height=\""+size+"\" src=\""+url+"\"/>");
	}	
	
	this.inlet1["quote"]=function(msg) {
		var quote = (msg.indexOf("'")==-1)?'"':"'"; //primitive quote detection 
		thisPtr.outlet1.doOutlet(quote+msg+quote);
	}
	
	this.inlet1["escape"]=function(msg) {
		msg+="";		
		thisPtr.outlet1.doOutlet(escape(msg));
	}										
	
	this.inlet1["unescape"]=function(msg) {
		msg+="";		
		thisPtr.outlet1.doOutlet(unescape(msg));
	}
	
	this.inlet1["escapequotes"]=function(msg) {		
		thisPtr.outlet1.doOutlet(LilyUtils.escape(msg));
	}										
	
	this.inlet1["unescapequotes"]=function(msg) {		
		thisPtr.outlet1.doOutlet(LilyUtils.unescape(msg));
	}	
	
	this.inlet1["convertToEntity"]=function(msg) {		
		thisPtr.outlet1.doOutlet(LilyUtils.string2HTML(msg));
	}
	
	this.inlet1["convertFromEntity"]=function(msg) {		
		thisPtr.outlet1.doOutlet(LilyUtils.html2String(msg));
	}
	
	this.inlet1["iter"]=function(msg) {
		msg+="";
		for(var i=0;i<msg.length;i++) {
			thisPtr.outlet1.doOutlet(msg.charAt(i));	
		}	
	}
	
	this.inlet1["reverse"]=function(msg) {
		msg+="";
		var tmp="";
		for(var i=(msg.length-1);i>-1;i--) {
			tmp+=msg.charAt(i);	
		}
		thisPtr.outlet1.doOutlet(tmp);			
	}
	
	this.inlet1["stripquotes"]=function(msg) {			
		thisPtr.outlet1.doOutlet(msg.replace(/'|"/g,""));
	}
	
	this.inlet1["stripbackslashes"]=function(msg) {			
		thisPtr.outlet1.doOutlet(msg.replace(/\\/g,""));
	}		
	
	this.inlet1["btoa"]=function(msg) {			
		thisPtr.outlet1.doOutlet(btoa(msg));
	}

	this.inlet1["atob"]=function(msg) {			
		thisPtr.outlet1.doOutlet(atob(msg));
	}
	
	//anything else
	this.inlet1["parseURL"]=function(url) {	
		
		var key_value = [];

		var uri = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURL);
		uri.spec = url;
		
		var kv_pairs = (uri.query && uri.query.match("&"))?uri.query.split("&"):[uri.query];
				
		for(var i=0;i<kv_pairs.length;i++) {
			if(kv_pairs[i].indexOf("=")!=-1) {
				var tmp = kv_pairs[i].split("=");
				key_value.push({key:tmp[0],value:tmp[1]});	
			}
		}
		
		thisPtr.outlet1.doOutlet({
									file:uri.fileName, 
									spec:uri.spec, 
									params:key_value, 
									path:uri.filePath, 
									host:uri.host, 
									port:uri.port, 
									filebasename: uri.fileBaseName, 
									extension:uri.fileExtension,
									directory: uri.directory,
									query: uri.query
								});
	}				
		
	return this;
}

var $stringMetaData = {
	textName:"string",
	htmlName:"string",
	objectCategory:"Strings",
	objectSummary:"Call various utility string methods.",
	objectArguments:"method name"
}