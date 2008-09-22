/** 

Copyright (c) 2007 Bill Orcutt (http://lilyapp.org, http://publicbeta.cx)

Permission is hereby granted, free of charge, any person obtaining
a copy of this software and associated documentation files (the
"Software"), deal in the Software without restriction, including
without limitation the rights use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons whom the Software is furnished do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 

*/

/**
*	Construct a new babelfish object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $babelfish()
{
	var thisPtr=this;	
	
	//uses the google ajax language api - http://code.google.com/apis/ajaxlanguage/
	var url="http://ajax.googleapis.com/ajax/services/language/translate?v=1.0";
		
	var langs = {
					"chinese-simp english": "zh|en",
					"chinese-trad english": "zt|en",
					"english chinese-simp": "en|zh",
					"english chinese-trad": "en|zt",
					"english dutch": "en|nl",
					"english french": "en|fr",
					"english german": "en|de",
					"english greek": "en|el",
					"english italian": "en|it",
					"english japanese": "en|ja",
					"english korean": "en|ko",
					"english portuguese": "en|pt",
					"english russian": "en|ru",
					"english spanish": "en|es",
					"dutch english": "nl|en",
					"dutch french": "nl|fr",
					"french dutch": "fr|nl",
					"french english": "fr|en",
					"french german": "fr|de",
					"french greek": "fr|el",
					"french italian": "fr|it",
					"french portuguese": "fr|pt",
					"french spanish": "fr|es",
					"german english": "de|en",
					"german french": "de|fr",
					"greek english": "el|en",
					"greek french": "el|fr",
					"italian english": "it|en",
					"italian french": "it|fr",
					"japanese english": "ja|en",
					"korean english": "ko|en",
					"portuguese english": "pt|en",
					"portuguese french": "pt|fr",
					"russian english": "ru|en",
					"spanish english": "es|en",
					"spanish french": "es|fr"
				}		
	
	this.inlet1=new this.inletClass("inlet1",this,"list of 3 parameters: \"[language from] [language to] [text be translated]\"");
	this.outlet1 = new this.outletClass("outlet1",this,"translated text");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete");	
		
	this.xhr=new LilyComponents._xhr(outputResponse,"json",this);	
	
	this.inlet1["anything"]=function(str) {
		
		var tmp = str.toLowerCase().split(" ");
		var lang = langs[tmp.shift() + " " + tmp.shift()];
		var msg = tmp.join(" ");
		
		if(typeof lang=="undefined")
			return LilyDebugWindow.error("Error: Language not found")
			
		thisPtr.xhr.loadXMLDoc(encodeURI(url+"&langpair="+lang+"&q="+msg));
	}	
	
	function outputResponse(json) {
		
		if(!json || typeof json != "object") {	//bail if there's nothing
			thisPtr.outlet2.doOutlet("bang");
			return;		
		}					

		if(json.responseStatus==200) {
			this.outlet1.doOutlet(json.responseData.translatedText);
		}
		
		thisPtr.outlet2.doOutlet("bang");	//done
	}	
	
	return this;
}

var $babelfishMetaData = {
	textName:"babelfish",
	htmlName:"babelfish",
	objectCategory:"Web Service",
	objectSummary:"Translate messages to other languages.",
	objectArguments:""
}