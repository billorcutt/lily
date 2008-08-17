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
	Script: string.js
		Contains LilyUtils
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/	

/*				
	Class: LilyUtils
		Utility Methods.
*/

if(!LilyUtils) {
	var LilyUtils = {};
}

/*
	Method: splitArgs
		split strings: split on spaces, unless the string is quoted.

	Arguments: 
		args - text string.
	
	Returns: 
		array of split text.
*/	
LilyUtils.splitArgs = function(args) {
	var type=LilyUtils.typeOf(args);		
	if(type=="string"&&args.length) {
		var arr=args.match(/(["'])(?:\\\1|.)*?\1|(\S+,)|(\S+)/g);
		return arr;
	} else if(type=="array") {
		return this.cloneArray(args);
	} else if(type=="number") {
		return [args];
	} else {
		return [];
	}
}

/*
	Method: strip
		strip white space.

	Arguments: 
		string.
	
	Returns: 
		returns stripped string.
*/
LilyUtils.strip = function(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
}

/*
	Method: stripQuotes
		strip quotes.

	Arguments: 
		string.
	
	Returns: 
		returns stripped string.
*/
LilyUtils.stripQuotes = function(str) {
    return str.replace(/"/g, '').replace(/'/g, '');
}

/*
	Method: stripLTQuotes
		strip leading & trailing quotes.

	Arguments: 
		str - string to strip
	
	Returns: 
		returns stripped string.
*/
LilyUtils.stripLTQuotes = function(str) {
	if(str && str.length) {
		return str.replace(/^['"]|['"]$/ig, '');
	} else {
		return "";
	}	
}

/*
	Method: quoteString
		add leading & trailing quotes if they're missing.

	Arguments: 
		str - string to quote
	
	Returns: 
		returns quoted string.
*/
LilyUtils.quoteString = function(str) {
	
	if(!str.match(/^['"]/)) {
		str = '"'+str;
	}
	
	if(!str.match(/['"]$/)) {
		str = str+'"';
	}
	
	return str; //return leading trailing quotes
}

/*
	Method: titleCase
		upper case the first letter.

	Arguments: 
		str - string to case
	
	Returns: 
		returns cased string.
*/
LilyUtils.titleCase = function(str) {
	str = str.replace(/(^.)/,function($1){return $1.toUpperCase();})
	return str;	
}

/*
	Method: stripTags
		strip HTML tags from text.

	Arguments: 
		str - string to strip of tags
	
	Returns: 
		returns stripped string.
*/
LilyUtils.stripTags = function(str) {
	str = str.replace(new RegExp('(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)', 'img'), '');
	str = (str&&str.replace) ? str.replace(/<\/?[^>]+>/gi, '') : str;
	return str;	
}

/*
	Method: isText
		determines if a file name contains a known (ie one we can handle) text extension.

	Arguments: 
		str - string to test.
	
	Returns: 
		boolean.
*/
LilyUtils.isText = function(str) {
	return str.match(/\.txt$|\.xul$|\.js$|\.css$|\.html$|\.xhtml$|\.json$|\.xml$/);	
}

/*
	Method: isResource
		determines if a file name contains a rsrc extension.

	Arguments: 
		str - string to test.
	
	Returns: 
		boolean.
*/
LilyUtils.isResource = function(str) {
	return str.match(/\.rsrc$/);	
}			

/*
	Method: isCompressed
		determines if a file name contains a known (ie one we can handle) compression extension.

	Arguments: 
		str - string to test.
	
	Returns: 
		boolean.
*/
LilyUtils.isCompressed = function(str) {
	return str.match(/\.zip$|\.jar$|\.rsrc$/);	
}

/*
	Method: containsProtocol
		determines if a string contains a known protocol.

	Arguments: 
		str - string to test.
	
	Returns: 
		boolean.
*/
LilyUtils.containsProtocol = function(str) {
	if(str&&str.length) {
		return !(str.indexOf("http://")==-1 && str.indexOf("chrome://")==-1 && str.indexOf("file://")==-1)		
	} else {
		return false;
	}
}

/*
	Method: isLegalID
		determine if a string is a valid identifier.

	Arguments: 
		str - string to test
	
	Returns: 
		bool- true if name contains no illegal characters.
*/
LilyUtils.isLegalID = function(str) {
	return !(/[\-\*\+\)\(\&\#\!\@\$\^\%\–\<\?\"\'\;\:\[\]\}\{\=]/.test(str));
}	

/*
	Method: hasExtension
		determine if a string has an extension.

	Arguments: 
		str - string to test
	
	Returns: 
		bool- true if extension is found.
*/
LilyUtils.hasExtension = function(str) {
	if(str&&str.match) {
		return str.match(/\.\S{2,4}$/);
	} else {
		return false;
	}
}

/*
	Method: stripExtension
		strip file extension if it exists.

	Arguments: 
		str - string to strip
	
	Returns: 
		returns stripped string.
*/
LilyUtils.stripExtension = function(str) {
	return str.replace(/\.\S{2,4}$/, ''); //only works with 2-4 char exts
}

/*
	Method: escape
		backslash escape single quotes.

	Arguments: 
		str - string to escape

	Returns: 
		returns escaped string.
*/	
LilyUtils.escape = function(str) {

//	LilyDebugWindow.print(LilyUtils.typeOf(str))

	if(LilyUtils.typeOf(str)=="string") {
		return sub(str);
	} else if(LilyUtils.typeOf(str)=="array") {
		var tmp=[];			
		for(var i=0;i<str.length;i++)
			if(LilyUtils.typeOf(str[i])=="string")
				tmp.push(sub(str[i]));
			else
				tmp.push(str[i]);
		return tmp;
	} else {
		return str;
	}

	function sub(ss) {
		var s = ss.replace(/\\/g,'\\\\');			
		s = s.replace(/\'/g,"\\'");
		s = s.replace(/\n/g,'\\n');			
		return s.replace(/\"/g,'\\"');
	}

}

/*
	Method: unescape
		backslash unescape single quotes.

	Arguments: 
		str - string to unescape

	Returns: 
		returns unescaped string.
*/	
LilyUtils.unescape = function(str) {

	if(LilyUtils.typeOf(str)=="string") {
		return sub(str);
	} else if(LilyUtils.typeOf(str)=="array") {
		var tmp=[];			
		for(var i=0;i<str.length;i++)
			if(LilyUtils.typeOf(str[i])=="string")
				tmp.push(sub(str[i]));
			else
				tmp.push(str[i]);
		return tmp;
	} else {
		return str;
	}

	function sub(ss) {
		var s = ss.replace(/\\'/g,"\'");
		s = s.replace(/\\n/g,'\n');			
		return s.replace(/\\"/g,'\"');
	}
}

/*
	Method: escapeSpecial
		backslash escape special characters.

	Arguments: 
		str - string to escape

	Returns: 
		returns escaped string.
*/	
LilyUtils.escapeSpecial = function(str) {

//	LilyDebugWindow.print(LilyUtils.typeOf(str))

	if(LilyUtils.typeOf(str)=="string") {
		return sub(str);
	} else if(LilyUtils.typeOf(str)=="array") {
		var tmp=[];			
		for(var i=0;i<str.length;i++)
			if(LilyUtils.typeOf(str[i])=="string")
				tmp.push(sub(str[i]));
			else
				tmp.push(str[i]);
		return tmp;
	} else {
		return str;
	}

	function sub(ss) {
		var s = ss.replace(/\n/g,'\\n');			
		s = s.replace(/\t/g,"\\t");
		s = s.replace(/\r/g,"\\r");
		s = s.replace(/\b/g,"\\b");										
		return s.replace(/\f/g,'\\f');
	}

}

/*
	Method: unescapeSpecial
		backslash unescape special characters.

	Arguments: 
		str - string to unescape

	Returns: 
		returns unescaped string.
*/	
LilyUtils.unescapeSpecial = function(str) {

	if(LilyUtils.typeOf(str)=="string") {
		return sub(str);
	} else if(LilyUtils.typeOf(str)=="array") {
		var tmp=[];			
		for(var i=0;i<str.length;i++)
			if(LilyUtils.typeOf(str[i])=="string")
				tmp.push(sub(str[i]));
			else
				tmp.push(str[i]);
		return tmp;
	} else {
		return str;
	}

	function sub(ss) {
		var s = ss.replace(/\\n/g,'\n');			
		s = s.replace(/\\t/g,"\t");
		s = s.replace(/\\r/g,"\r");
		s = s.replace(/\\b/g,"\b");										
		return s.replace(/\\f/g,'\f');
	}
}		

/*
	Method: html2String
		converts html to a string.

	Arguments: 
		string - html string.

	Returns: 
		string.
*/
LilyUtils.html2String = function(str) {

	if(LilyUtils.typeOf(str)=="string") {
		return sub(str);
	} else if(LilyUtils.typeOf(str)=="array") {
		var tmp=[];			
		for(var i=0;i<str.length;i++)
			if(LilyUtils.typeOf(str[i])=="string")
				tmp.push(sub(str[i]));
			else
				tmp.push(str[i]);
		return tmp;
	} else {
		return str;
	}

	function sub(string) {
		string=string.replace(/<br\/>/g,"\n");
		string=string.replace(/&amp;/g,"&");		
		string=string.replace(/&lt;/g,"<");
		string=string.replace(/&gt;/g,">");
//		string=string.replace(/&commat;/g,"@");				
		return string;	
	}		
}

/*
	Method: string2HTML
		escape string to make XHTML-ready.

	Arguments: 
		string - text string.

	Returns: 
		encoded HTML string.
*/
LilyUtils.string2HTML = function(str) {

	if(LilyUtils.typeOf(str)=="string") {
		return sub(str);
	} else if(LilyUtils.typeOf(str)=="array") {
		var tmp=[];			
		for(var i=0;i<str.length;i++)
			if(LilyUtils.typeOf(str[i])=="string")
				tmp.push(sub(str[i]));
			else
				tmp.push(str[i]);
		return tmp;
	} else {
		return str;
	}

	function sub(string) {

		//dont double escape...
		if(string.indexOf("&amp;")!=-1||string.indexOf("&lt;")!=-1||string.indexOf("&gt;")!=-1)
			return string;

		string=string.replace(/&/g,"&amp;");		
		string=string.replace(/</g,"&lt;");
		string=string.replace(/>/g,"&gt;");	
		string=string.replace(/\n/g,"<br/>");
//		string=string.replace(/@/g,"&commat;");
		return string;	
	}		
}

/*
	Method: makeSafe
		make a string "safe" to insert into an xhtml document.
		checks for well-formedness. if not well-formed, appropriate 
		entity substitutions are performed.

	Arguments: 
		aStr - string to evaluate

	Returns: 
		returns the parsed object or null.
*/
LilyUtils.makeSafe = function(aStr) {

	//strip wrapping quotes if its html, so html will render
	if(aStr && aStr.match && aStr.match(/^'<|^"</g)&&aStr.match(/>'$|>"$/)) {
		aStr = LilyUtils.stripLTQuotes(aStr);
	}

	if(aStr && !LilyUtils.parseXML(aStr)) {
		return LilyUtils.string2HTML(aStr); //escape everything
	}
	return aStr; 
}
