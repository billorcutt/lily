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
	var url="http://babelfish.altavista.com/tr?";
	
	var langs = {
					"chinese-simp english": "zh_en",
					"chinese-trad english": "zt_en",
					"english chinese-simp": "en_zh",
					"english chinese-trad": "en_zt",
					"english dutch": "en_nl",
					"english french": "en_fr",
					"english german": "en_de",
					"english greek": "en_el",
					"english italian": "en_it",
					"english japanese": "en_ja",
					"english korean": "en_ko",
					"english portuguese": "en_pt",
					"english russian": "en_ru",
					"english spanish": "en_es",
					"dutch english": "nl_en",
					"dutch french": "nl_fr",
					"french dutch": "fr_nl",
					"french english": "fr_en",
					"french german": "fr_de",
					"french greek": "fr_el",
					"french italian": "fr_it",
					"french portuguese": "fr_pt",
					"french spanish": "fr_es",
					"german english": "de_en",
					"german french": "de_fr",
					"greek english": "el_en",
					"greek french": "el_fr",
					"italian english": "it_en",
					"italian french": "it_fr",
					"japanese english": "ja_en",
					"korean english": "ko_en",
					"portuguese english": "pt_en",
					"portuguese french": "pt_fr",
					"russian english": "ru_en",
					"spanish english": "es_en",
					"spanish french": "es_fr"
				}		
	
	this.inlet1=new this.inletClass("inlet1",this,"list of 3 parameters: \"[language from] [language to] [text be translated]\"");
	this.outlet1 = new this.outletClass("outlet1",this,"translated text");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete");	
		
	this.xhr=new LilyUtils._xhr(outputResponse,"text",this);	
	
	this.inlet1["anything"]=function(str) {
		
		var tmp = str.toLowerCase().split(" ");
		var lang = langs[tmp.shift() + " " + tmp.shift()];
		var msg = tmp.join(" ");
		
		if(typeof lang=="undefined")
			return LilyDebugWindow.error("Error: Language not found")
			
		thisPtr.xhr.loadXMLDoc(url+"lp="+lang+"&trtext="+msg);
	}	
	
	function outputResponse(txt) {
		
		if(!txt) {	//bail if there's nothing
			thisPtr.outlet2.doOutlet("bang");
			return;		
		}					

		var result = txt.substring(txt.search("10px;>") + 6, txt.search('</div>'));
		this.outlet1.doOutlet(result);
		
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