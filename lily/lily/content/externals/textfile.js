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
*	Construct a new textfile object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $textfile(path)
{
	var thisPtr=this;
	var data="";
	var file=null;
	var file_is_tmp = false;
		
	this.inlet1=new this.inletClass("inlet1",this,"data is appended to the buffer. methods: \"bang\", \"clear\", \"write\", \"cr\", \"tab\", \"dump\", \"open\", \"read\", \"query\", \"length\", \"line\", \"tmpfile\", \"path\", \"writebin\"");	

	this.outlet1 = new this.outletClass("outlet1",this,"text data");
	this.outlet2 = new this.outletClass("outlet2",this, "text info");
	
	//append input
	this.inlet1["anything"]=function(str) {
		data=(data.length)?data+" "+str:str; //prepend a space if there's already data in the buffer	
	}
	
	//reset the data var
	this.inlet1["clear"]=function() {
		data="";
	}	
	
	//write to disk
	this.inlet1["write"]=function() {
		file=LilyUtils.writeDataToFile(file,data);
	}
	
	//write binary to disk
	this.inlet1["writebin"]=function() {
		if(file) LilyUtils.writeBinaryFile(file,data);
	}	
	
	//create a tmp file
	this.inlet1["tmpfile"]=function(ext) {
		file = LilyUtils.getTempFile(ext);
		file_is_tmp = true;
	}
	
	//output the file path if it exists
	this.inlet1["path"]=function() {
		if(file && file.path)
			thisPtr.outlet2.doOutlet(file.path);
		else
			thisPtr.outlet2.doOutlet("bang");
	}
	
	//new line
	this.inlet1["cr"]=function() {
		if(LilyUtils.navigatorPlatform() == "windows") {
			data=data+"\r\n";
		} else {
			data=data+"\n";
		}
	}
	
	//new line
	this.inlet1["tab"]=function() {
		data=data+"\t";
	}				
	
	//dump contents
	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet(data);
	}
	
	//dump contents
	this.inlet1["dump"]=function() {
		thisPtr.outlet1.doOutlet(data);
	}
	
	//open in text window
	this.inlet1["open"]=function() {
		if(file)
			file.launch();
		else
			LilyDebugWindow.error("file must be saved before it can be opened.") //error
	}	
	
	//read in a new file
	this.inlet1["read"]=function(p) {
		readFile(p,true);		
	}
	
	//data array length
	this.inlet1["query"]=function() {
		var arr=data.split("\n");		
		thisPtr.outlet2.doOutlet(arr.length);
	}
	
	//data array length
	this.inlet1["length"]=function() {		
		thisPtr.outlet2.doOutlet(data.length);
	}	
	
	//output line by number
	this.inlet1["line"]=function(num) {
		var arr=data.split("\n");
		if(typeof arr[parseInt(num)]!="undefined")
			thisPtr.outlet1.doOutlet(arr[parseInt(num)]);
	}
	
	//remove the tmp file
	this.destructor=function() {
		if(file_is_tmp) {
			try {
				file.remove(false);	
			} catch(e) {
				LilyDebugWindow.error(e.name + ": " + e.message);
			}
		}
	}	
	
	function readFile(p,useFP) {
		var fPath = null;
		
		if(p) {
			//get the path to the patch if we need it
			fPath = (p)?LilyUtils.getFilePath(p):"";				
		}
			
		//read the file.	
		var tmp=LilyUtils.readFileFromPath(fPath,useFP);
		data=tmp.data;
		file=tmp.file;	
	}
	
	readFile(path,false); //open the file if a path is provided
	
	//called by the object creation method.	
	this.init=function() {
		thisPtr.controller.attachObserver(this.objID,"dblclick",function(){thisPtr.inlet1.open();},"performance");			
	}	
		
	return this;
}

var $textfileMetaData = {
	textName:"textfile",
	htmlName:"textfile",
	objectCategory:"Data",
	objectSummary:"Read and write text files from disk.",
	objectArguments:"path to file to read"
}