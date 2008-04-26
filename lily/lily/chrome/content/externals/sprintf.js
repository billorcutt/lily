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
*	Construct a new sprintf object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $sprintf(args)
{
	var thisPtr=this;		
	var formatting=args||null;
	
	if(!formatting) {
		LilyDebugWindow.error("the sprintf object needs arguments to be useful.");
		LilyDebugWindow.insertHelp("sprintf");		
		return;
	}	
	
	this.inlet1=new this.inletClass("inlet1",this,"message to format");
	this.outlet1 = new this.outletClass("outlet1",this,"formatted message");			
	
	this.inlet1["anything"]=function(str) {
		//make it into an array.
		var args=(LilyUtils.typeOf(str)!="array")?LilyUtils.splitArgs(str):str;
//		LilyDebugWindow.print(args);
		thisPtr.outlet1.doOutlet(doSprintf.apply(this,args));
	}
	
	/* Copyright (c) 2005 Scott S. McCoy
	 * This was originally a non-object oriented interface
	* Function printf(format_string,arguments...)
	 * Javascript emulation of the C printf function (modifiers and argument types 
	 *    "p" and "n" are not supported due to language restrictions)
	 *
	 * Copyright 2003 K&L Productions. All rights reserved
	 * http://www.klproductions.com 
	 *
	 * Terms of use: This function can be used free of charge IF this header is not
	 *               modified and remains with the function code.
	 * 
	 * Legal: Use this code at your own risk. K&L Productions assumes NO resposibility
	 *        for anything.
	 ********************************************************************************/

	function doSprintf() {
	  var fstring = formatting.toString();

	  var pad = function(str,ch,len) { var ps='';
	      for(var i=0; i<Math.abs(len); i++) {
			  ps+=ch;
		  }
	      return len>0?str+ps:ps+str;
	  };
	  var processFlags = function(flags,width,rs,arg) { 
	      var pn = function(flags,arg,rs) {
	          if(arg>=0) { 
	              if(flags.indexOf(' ')>=0) {
					  rs = ' ' + rs;
				  } else if(flags.indexOf('+')>=0) {
					  rs = '+' + rs;
				  }
	          } else {
	              rs = '-' + rs;
			  }
	          return rs;
	      };
	      var iWidth = parseInt(width,10);
	      if(width.charAt(0) == '0') {
	          var ec=0;
	          if(flags.indexOf(' ')>=0 || flags.indexOf('+')>=0) {
				  ec++;
			  }
	          if(rs.length<(iWidth-ec)) {
				  rs = pad(rs,'0',rs.length-(iWidth-ec));
			  }
	          return pn(flags,arg,rs);
	      }
	      rs = pn(flags,arg,rs);
	      if(rs.length<iWidth) {
	          if(flags.indexOf('-')<0) {
				  rs = pad(rs,' ',rs.length-iWidth);
			  } else {
				  rs = pad(rs,' ',iWidth - rs.length);
			  }
	      }    
	      return rs;
	  };
	  var converters = [];
	  converters.c = function(flags,width,precision,arg) { 
	      if (typeof(arg) == 'number') {
			  return String.fromCharCode(arg);
		  } else if (typeof(arg) == 'string') {
			  return arg.charAt(0);
		  } else {
			  return '';
		  }
	  };
	  converters.d = function(flags,width,precision,arg) { 
	      return converters.i(flags,width,precision,arg); 
	  };
	  converters.u = function(flags,width,precision,arg) { 
	      return converters.i(flags,width,precision,Math.abs(arg)); 
	  };
	  converters.i =  function(flags,width,precision,arg) {
	      var iPrecision=parseInt(precision, 10);
	      var rs = ((Math.abs(arg)).toString().split('.'))[0];
	      if(rs.length<iPrecision) {
			  rs=pad(rs,' ',iPrecision - rs.length);
		  }
	      return processFlags(flags,width,rs,arg); 
	  };
	  converters.E = function(flags,width,precision,arg) {
	      return (converters.e(flags,width,precision,arg)).toUpperCase();
	  };
	  converters.e = function(flags,width,precision,arg) {
	      iPrecision = parseInt(precision, 10);
	      if(isNaN(iPrecision)) {
			  iPrecision = 6;
		  }
	      rs = (Math.abs(arg)).toExponential(iPrecision);
	      if(rs.indexOf('.')<0 && flags.indexOf('#')>=0) {
			  rs = rs.replace(/^(.*)(e.*)$/,'$1.$2');
		  }
	      return processFlags(flags,width,rs,arg);        
	  };
	  converters.f = function(flags,width,precision,arg) { 
	      iPrecision = parseInt(precision, 10);
	      if(isNaN(iPrecision)) {
			  iPrecision = 6;
		  }
	      rs = (Math.abs(arg)).toFixed(iPrecision);
	      if(rs.indexOf('.')<0 && flags.indexOf('#')>=0) {
			  rs = rs + '.';
		  }
	      return processFlags(flags,width,rs,arg);
	  };
	  converters.G = function(flags,width,precision,arg) { 
	      return (converters.g(flags,width,precision,arg)).toUpperCase();
	  };
	  converters.g = function(flags,width,precision,arg) {
	      iPrecision = parseInt(precision, 10);
	      absArg = Math.abs(arg);
	      rse = absArg.toExponential();
	      rsf = absArg.toFixed(6);
	      if(!isNaN(iPrecision)) { 
	          rsep = absArg.toExponential(iPrecision);
	          rse = rsep.length < rse.length ? rsep : rse;
	          rsfp = absArg.toFixed(iPrecision);
	          rsf = rsfp.length < rsf.length ? rsfp : rsf;
	      }
	      if(rse.indexOf('.')<0 && flags.indexOf('#')>=0) {
			  rse = rse.replace(/^(.*)(e.*)$/,'$1.$2');
		  }
	      if(rsf.indexOf('.')<0 && flags.indexOf('#')>=0) {
			  rsf = rsf + '.';
		  }
	      rs = rse.length<rsf.length ? rse : rsf;
	      return processFlags(flags,width,rs,arg);        
	  };  
	  converters.o = function(flags,width,precision,arg) { 
	      var iPrecision=parseInt(precision, 10);
	      var rs = Math.round(Math.abs(arg)).toString(8);
	      if(rs.length<iPrecision) {
			  rs=pad(rs,' ',iPrecision - rs.length);
		  }
	      if(flags.indexOf('#')>=0) {
			  rs='0'+rs;
		  }
	      return processFlags(flags,width,rs,arg); 
	  };
	  converters.X = function(flags,width,precision,arg) { 
	      return (converters.x(flags,width,precision,arg)).toUpperCase();
	  };
	  converters.x = function(flags,width,precision,arg) { 
	      var iPrecision=parseInt(precision, 10);
	      arg = Math.abs(arg);
	      var rs = Math.round(arg).toString(16);
	      if(rs.length<iPrecision) {
			  rs=pad(rs,' ',iPrecision - rs.length);
		  }
	      if(flags.indexOf('#')>=0) {
			  rs='0x'+rs;
		  }
	      return processFlags(flags,width,rs,arg); 
	  };
	  converters.s = function(flags,width,precision,arg) { 
	      var iPrecision=parseInt(precision, 10);
	      var rs = arg;
	      if(rs.length > iPrecision) {
			  rs = rs.substring(0,iPrecision);
		  }
	      return processFlags(flags,width,rs,0);
	  };

	  farr = fstring.split('%');
	  retstr = farr[0];
	  fpRE = /^([-+ #]*)(?:(\d*)\$|)(\d*)\.?(\d*)([cdieEfFgGosuxX])(.*)$/;
	  for(var i = 1; i<farr.length; i++) { 
	      fps=fpRE.exec(farr[i]);
	      if(!fps) {
			  continue;
		  }
		  var my_i = fps[2] ? fps[2] : i;
	      if(arguments[my_i-1]!= "undefined") {
	          retstr+=converters[fps[5]](fps[1],fps[3],fps[4],arguments[my_i-1]);
	      }
	      retstr += fps[6];
	  }
	  return retstr;
	};	
	
	return this;	
}

var $sprintfMetaData = {
	textName:"sprintf",
	htmlName:"sprintf",
	objectCategory:"Strings",
	objectSummary:"Format messages using sprintf.",
	objectArguments:"[formatting]"
}