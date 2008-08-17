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

/*
	Script: patch.js
		Contains LilyUtils.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/

if(!LilyUtils) {
	var LilyUtils = {};
}	

/*				
	Class: LilyUtils
		Utility Methods.
*/



/*
	Method: isPatchString
		evaluates if a string is a lily patch string.

	Arguments: 
		str - string to evaluate
	
	Returns: 
		returns boolean- true if patch string.
*/
LilyUtils.isPatchString = function(str) {
	return (/var patch={/.test(str));
}

/*
	Method: isHelpPatch
		evaluates if a filenmae is a lily help patch.

	Arguments: 
		str - string to evaluate
	
	Returns: 
		returns boolean- true if help patch.
*/
LilyUtils.isHelpPatch = function(str) {
	return (/\-help\.json$/.test(str));
}	

/*
	Method: extractPatchDesc
		get the patch size without having to eval the patch JSON.
		
	Arguments: 
		data - JSON patch string.
		
	Returns: 
		Patch description.									
*/	
LilyUtils.extractPatchDesc = function(data) {
	var desc=data.match(/'description':'([\S|\s]+)','category'/);		
	
	if(desc && desc.length>1)
		return desc[1];
	else
		return "";
}

/*
	Method: extractPatchCat
		get the patch size without having to eval the patch JSON.
		
	Arguments: 
		data - JSON patch string.
		
	Returns: 
		Patch description.									
*/	

//'description':'','category':'','heightInSubPatch':

LilyUtils.extractPatchCat = function(data) {
	var cat=data.match(/'category':'([\S|\s]+)','heightInSubPatch'/);		
	
	if(cat && cat.length>1)
		return cat[1];
	else
		return "";
}

/*
	Method: extractPatchSize
		get the patch size without having to eval the patch JSON.
		
	Arguments: 
		data - JSON patch string.
		
	Returns: 
		An array of patch width & height.									
*/	
LilyUtils.extractPatchSize = function(data) {
	var wArr=data.match(/'width':(\d+)/);
	var hArr=data.match(/'height':(\d+)/);		
	
	if(wArr && hArr)
		return [wArr[1],hArr[1]];
	else
		return [0,0];
}

/*
	Method: extractSizeInSubPatch
		get the size in subpatch without having to eval the patch JSON.
		
	Arguments: 
		data - JSON patch string.
		
	Returns: 
		An array of patch width & height when opened in subpatch.									
*/	
LilyUtils.extractSizeInSubPatch = function(data) {
			
	if(typeof data == "string") {
		var wArr=data.match(/'widthInSubPatch':'(\d+)'/);
		var hArr=data.match(/'heightInSubPatch':'(\d+)'/);	
		
		if(wArr && hArr){
			return [parseInt(wArr[1]),parseInt(hArr[1])];
		}else{
			return [0,0];
		}
			
	} else {
			return [0,0];
	}
}

/*
	Method: getPIDFromPackage
		returns the patch id based on the package name.

	Arguments: 
		name - patch package name.
	
	Returns: 
		returns the patch id from a patch package name.
*/	
LilyUtils.getPIDFromPackage = function(name) {
	var package_id = name+"\.id@"+name+"\.com";
	for(var x in Lily.patchObj) {
		if(Lily.patchObj[x].file && Lily.patchObj[x].file.path.indexOf(package_id)!=-1) {
			return x;
		}
	}
}