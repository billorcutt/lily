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
	Script: dialog.js
		Contains LilyComponents.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/

if(!LilyComponents) {
	var LilyComponents = {};
}

/*
	Constructor: _dialog
		create a new _dialog instance.

	Arguments: 
		context - parent context.
		parEl - parent element to display text.
		defaultContent - default content
		saveFunc - callback.
	
	Returns: 
		returns editor instance.
*/
LilyComponents._dialog={
	
	/*
		Method: toggleMessageDialog
			toggles a translucent message in a patch window- disappears when the window is clicked or key is pressed.

		Arguments: 
			win = window object to display the message in
			str = html string to display
			width = patch id
			color = message background color
	*/
	toggleMessageDialog:function(win,str,width,color) {

		if(win&&!win.document.getElementById("lilyMessageDialog")) {
			return this.displayMessageDialog(win,str,width,color);
		} else {
			win.document.getElementById("lilyMessageDialog").parentNode.removeChild(win.document.getElementById("lilyMessageDialog"));
			return null;
		}
	},	

	/*
		Method: displayMessageDialog
			display a translucent message in a patch window- disappears when the window is clicked or keys is pressed.

		Arguments: 
			str = html string to display
			pID = patch id
			color = message background color

		Returns:
			object that contains the outer message node & the a method to remove it.
	*/
	displayMessageDialog:function(win,str,width,color) {

		if(win.document.getElementById("lilyMessageDialog"))
			return;

		var body = win.document.getElementsByTagName("body")[0];						
		var d1=win.document.createElement("div");
		var d2=win.document.createElement("div");		

		//outer div
		d1.id="lilyMessageDialog";
		d1.style.position="absolute";
		d1.style.left="0px";
		d1.style.top="0px";					
		d1.style.width="100%";
		d1.style.height="100%";
		d1.style.textAlign="center";
		d1.style.zIndex=1000;

		//inner div
		d2.style.width=width+"px";		
		d2.style.margin="50px auto";						
		d2.style.border="1px solid #000";		
		d2.style.padding="15px";
		if(!color) {
			d2.style.color="white";				
			d2.style.backgroundImage="url(chrome://lily/content/images/overlay.png)";
			d2.style.backgroundColor="#333";
			d2.style.backgroundColor="transparent";
		} else {
			d2.style.backgroundColor=color;
			d2.style.color="black";			
		}

		var outerDiv = body.appendChild(d1);
		var innerDiv = outerDiv.appendChild(d2);
		innerDiv.innerHTML=str;

		outerDiv.addEventListener("click",function(e){
			if(e.target.tagName != "input") this.parentNode.removeChild(this);
		},false);

		//XXX - FIXME - DOESN'T WORK THE FIRST TIME IF THE PATCH IS UNEDITED
//		win.addEventListener("keydown",function(){outerDiv.parentNode.removeChild(outerDiv);},false);		

		return {message:outerDiv,close:function(){outerDiv.parentNode.removeChild(outerDiv)}};
	},


	/*
		Method: displayIframeOnContent
			display a translucent message in a patch window- disappears when the window is clicked or keys is pressed.

		Arguments: 
			str = html string to display
			pID = patch id
			color = message background color

		Returns:
			object that contains the outer message node & the a method to remove it.
	*/
	displayIframeOnContent:function() {
		var body = content.document.getElementsByTagName("body")[0];						
		var tmp=content.document.createElement("iframe");
		tmp.style.position="absolute";
		tmp.style.left="0px";
		tmp.style.top="0px";
		tmp.style.padding="0px";
		tmp.style.margin="0px";
		tmp.style.borderWidth="0px";							
		tmp.style.width="100%";
		tmp.style.height="100%";
		tmp.style.backgroundColor="transparent";
		var _iframe = body.appendChild(tmp);
		//_iframe.setAttribute("src","chrome://lily/content/blank.html");			
		return _iframe;
	}
}