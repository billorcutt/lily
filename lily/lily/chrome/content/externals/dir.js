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
*	Construct a new dir object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $dir(recursive)
{
	var thisPtr=this;
	var recur=(recursive&&recursive == "true")?true:false;
	
	this.inlet1=new this.inletClass("inlet1",this,"path to directory to list");	
	this.outlet1 = new this.outletClass("outlet1",this,"directory contents, one at a time.");	
	
	this.inlet1["anything"]=function(path) {	
		
		var dir = LilyUtils.getFileHandle(path);
		
		if(dir.exists()&&dir.isDirectory()) {
			if(recur) {
				LilyUtils.directorySearch(dir,function(file){
				  thisPtr.outlet1.doOutlet({name:file.leafName,directory:file.isDirectory(),path:file.path,hidden:(file.isHidden())});
				});				
			} else {
				var contents = dir.directoryEntries;
				while (contents.hasMoreElements()) {
				  var file = contents.getNext().QueryInterface(Components.interfaces.nsIFile);
				  thisPtr.outlet1.doOutlet({name:file.leafName,directory:file.isDirectory(),path:file.path,hidden:(file.isHidden())});
				}
			}						
		} else {
			LilyDebugWindow.error(path+" does not exist or is not a folder")
		}		
	}	
	
	return this;
}

var $dirMetaData = {
	textName:"dir",
	htmlName:"dir",
	objectCategory:"System",
	objectSummary:"List a folder's contents."
}