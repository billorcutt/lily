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
*	Construct a new contextmenu object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $contextmenu(menutxt)
{
	var thisPtr=this;	
	var label=menutxt||"";
	var menu = document.getElementById("contentAreaContextMenu");
	var separator = document.getElementById('lilyExternContextMenuSeparator');
	
	//create the menu item
	var tmp = document.createElement("menuitem");
	tmp.setAttribute("label",label);
	tmp.setAttribute("id","item_"+this.objID);
	var item = menu.insertBefore(tmp, separator.nextSibling);
	
	//init the menu
	item.addEventListener("command", contextCommand, false);	
	
	this.outlet1 = new this.outletClass("outlet1",this,"event when context menu is selected.");	
		
	function contextCommand(e) {
		thisPtr.outlet1.doOutlet(gContextMenu.target);
	}
	
	//remove the menu item
	this.destructor=function() {
		menu.removeChild(item);
	}	
			
	return this;
}

var $contextmenuMetaData = {
	textName:"contextmenu",
	htmlName:"contextmenu",
	objectCategory:"System",
	objectSummary:"Insert a menu item in the context menu.",
	objectArguments:""	
	
}