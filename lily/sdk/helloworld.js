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
*	Construct a new helloworld object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//the name of the constructor is the filename/classname with a prepended "$".
function $helloworld()
{
	//save this to use in our inner functions 
	var thisPtr=this;
	
	//create an inlet- args to the inlet constructor are: inlet name, the current context (always this), help text (displayed when the user mouses over the inlet).
	this.inlet1=new this.inletClass("inlet1",this,"bang outputs the message \"hello world\"");

	//create an outlet- args to the outlet constructor are: outlet name, the current context (always this), help text (displayed when the user mouses over the outlet).
	this.outlet1 = new this.outletClass("outlet1",this,"outputs \"hello world\" after receiving a bang.");

	//adding an "bang" method to the inlet. when the inlet receives a "bang" message this handler will be called.
	this.inlet1["bang"]=function() {
		thisPtr.outlet1.doOutlet("hello world!"); //call the outlet's output method and send our greeting.
	}	
	
	return this;
}

//meta data module- required. the module name should take the form "$"+ classname/filename +"MetaData"
var $helloworldMetaData = {
	textName:"helloworld", //the name as it will appear to the user- can be different from the filename/classname
	htmlName:"helloworld", //same as above, but valid for an xhtml document with appropriate entity substitutions. 
	objectCategory:"Sample", //where to file, need not be an existing category
	objectSummary:"The simplest of lily externals- outputs hello world on receiving a bang.", //one sentence description for help system
	objectArguments:"" //also for help- object argument list if any, otherwise empty.
}