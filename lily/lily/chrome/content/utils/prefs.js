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
Script: prefs.js
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
	Method: getStringPref
		get a string pref.

	Arguments: 
		prefName - name of the pref.
	
	Returns: 
		returns a string.
*/
LilyUtils.getStringPref = function(prefName) {
	var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
	return prefs.getCharPref(prefName)||false; // get a pref		
}

/*
	Method: setStringPref
		get a string pref.

	Arguments: 
		prefName - name of the pref.
		value - value to set.
*/
LilyUtils.setStringPref = function(prefName,value) {
	var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
	prefs.setCharPref((prefName),value); // set a pref			
}	

/*
	Method: getBoolPref
		get a bool pref.

	Arguments: 
		prefName - name of the pref.
	
	Returns: 
		returns a bool.
*/
LilyUtils.getBoolPref = function(prefName) {
	var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
	return prefs.getBoolPref(prefName)||false; // get a pref		
}

/*
	Method: setBoolPref
		get a bool pref.

	Arguments: 
		prefName - name of the pref.
		state - state of the pref to set.
*/
LilyUtils.setBoolPref = function(prefName,state) {
	var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
	prefs.setBoolPref((prefName),state); // set a pref			
}

/*
	Method: getIntPref
		get an int pref.

	Arguments: 
		prefName - name of the pref.
	
	Returns: 
		returns a number.
*/
LilyUtils.getIntPref = function(prefName) {
	var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
	return prefs.getIntPref(prefName)||false; // get a pref		
}

/*
	Method: setIntPref
		get an int pref.

	Arguments: 
		prefName - name of the pref.
		state - state of the pref to set.
*/
LilyUtils.setIntPref = function(prefName,state) {
	var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch2);	
	prefs.setIntPref((prefName),state); // set a pref			
}
