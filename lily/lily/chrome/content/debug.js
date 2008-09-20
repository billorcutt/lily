/*				
	Class: LilyDebugWindow
		Debug Window.
*/
var LilyDebugWindow = {

	/*
		Property: dWin
			pointer to the debug window.
	*/
	dWin:null,
	
	/*
		Property: bWin
			pointer to the inner browser window.
	*/
	bWin:null,	
	
	/*
		Method: isOpen
			is the debug window open?
			
		Returns:	
			bool
	*/
	isOpen: function(){
		return (this.dWin!=null);
	},	
	
	/*
		Property: dWinBody
			pointer to the debug document body.
	*/	
	dWinBody:null,

	/*
		Method: open
			open debug window.
	*/
	open:function () {
		if(!this.dWin) {
			this.dWin=window.openDialog("chrome://lily/content/xul/debug.xul", "dWin","width=350,height=600,left=50,top=50,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,chrome=yes",function(){LilyDebugWindow.init();});
		}		
	},
	
	/*
		Method: init
			init debug window.
	*/
	init:function () {
		if(this.dWin) {
			var font=LilyUtils.getDefaultFont();
			this.bWin=this.dWin.document.getElementById("browserDebugElement").contentWindow;
			this.dWinBody=this.bWin.document.getElementById("bodyElement");
			this.dWin.addEventListener("unload",function(){LilyDebugWindow.reset()},false);
			this.dWinBody.style.fontFamily=LilyUtils.getCompatibleFont(font[0]);
			this.dWinBody.style.fontSize=font[1];
			setTimeout(function(){LilyDebugWindow.dWin.blur();},100);					
		}		
	},

	/*
		Method: close
			close debug window.
	*/	
	close:function() {
		if(this.dWin) {
			this.dWin.close();
			this.reset();
		}	
	},

	/*
		Method: reset
			reset debug object & menuitem.
	*/
	reset:function() {
		this.dWin=null;
		this.dWinBody=null;
	},
	
	/*
		Method: clear
			clear debug window.
			
		Arguments: 
			e - keypress event.	
	*/	
	clear:function() {
		LilyDebugWindow.dWinBody.innerHTML="";  
	},
	
	/*
		Method: print
			print message to the debug window.
			
		Arguments: 
			msg - string to print.	
	*/	
	print:function(msg) {
		if(this.dWin)
			setTimeout(function(){LilyDebugWindow.dispatch(msg)},1);
	},
	
	/*
		Method: trace
			print an trace message to the debug window.
			
		Arguments: 
			msg - string to print.	
	*/
	trace:function(msg) {		
		if(this.dWin) {
			var font=LilyUtils.getDefaultFont();
			var fontSize = (parseInt(font[1])+2) + "px";	
			setTimeout(function(){LilyDebugWindow.dispatch(msg,null,"courier",fontSize,"italic","#999")},1);	
		}
	},	

	/*
		Method: error
			print an error message to the debug window.
			
		Arguments: 
			msg - string to print.	
	*/
	error:function(msg) {		
		if(this.dWin) {
			setTimeout(function(){LilyDebugWindow.dispatch((msg),"bold",null,null,null,"red")},1);	
		}
	},
	
	/*
		Method: insertHelp
			insert a help message.
			
		Arguments: 
			msg - string to print.
			help - object name of help patch to link to.	
	*/
	insertHelp:function(help,msg) {
		if(this.dWin)
			setTimeout(function(){LilyDebugWindow.insertHelpLink(help,msg)},1);
	},
	
	/*
		Method: insert
			insert a help message.
			
		Arguments: 
			msg - string to print.	
	*/
	insert:function(msg,callback) {
		if(this.dWin)
			setTimeout(function(){LilyDebugWindow.insertLink(msg,callback)},1);
	},	
	
	/*
		Method: insertLink
			insert a link in the debug window.
			
		Arguments: 
			msg - string to print.	
	*/
	insertLink:function(msg,callback) {
		if(this.dWin&&this.bWin) {		
			var wrapper=this.bWin.document.createElement("div");
			var lastMsg=this.dWinBody.appendChild(wrapper);
			lastMsg.innerHTML="<a onclick='return false' href='about:blank'>"+msg+"</a>";
			lastMsg.addEventListener("click",callback,false);	
			this.bWin.scrollTo(0,this.bWin.scrollMaxY);
		}
	},
	
	/*
		Method: insertHelpLink
			insert a link to open a help patch in the debug window.

		Arguments: 
			msg - string to print.	
	*/
	insertHelpLink:function(helpName,msg) {		
		if(this.dWin&&this.bWin) {
			var mess = msg||"open the help patch for ";		
			var wrapper=this.bWin.document.createElement("div");
			var lastMsg=this.dWinBody.appendChild(wrapper);
			lastMsg.innerHTML="<p><a style=\"text-decoration:underline;color:blue;padding:10px;background:yellow\" onmouseup=\"this.style.color='blue'\" onmousedown=\"this.style.color='red'\" onclick=\"return false\" href=\"about:blank\">"+mess+" "+LilyObjectList.getDisplayName(helpName)+"</a></p>";
			lastMsg.addEventListener("click",function(){LilyApp.openHelpPatch(helpName);},false);	
			this.bWin.scrollTo(0,this.bWin.scrollMaxY);
		}
	},	
	
	/*
		Method: dispatch
			print a message to the debug window.
			
		Arguments: 
			msg - string to print.	
	*/	
	dispatch:function(msg,weight,font,size,style,color) {
		
		var font_weight = weight || "";
		var font_family = font || "";
		var font_size = size || "";
		var font_style = style || "";
		var font_color = color || "";			
				
		if(this.dWin&&this.dWinBody&&this.bWin) {			
			var wrapper=this.bWin.document.createElement("div");
			if(font_weight) wrapper.style.fontWeight = font_weight;
			if(font_family) wrapper.style.fontFamily = LilyUtils.getCompatibleFont(font_family);
			if(font_size) wrapper.style.fontSize = font_size;
			if(font_style) wrapper.style.fontStyle = font_style;
			if(font_color) wrapper.style.color = font_color;						
			var message=this.bWin.document.createTextNode(msg);
			wrapper.appendChild(message);
			var lastMsg=this.dWinBody.appendChild(wrapper);
			this.bWin.scrollTo(0,this.bWin.scrollMaxY);
		} else {
			LilyUtils.jsDump(msg);
		}
	},

	/*
		Method: toggle
			toggle the debug window open or close.

		Arguments: 
			menuitem - inspector window menuitem.		
	*/
	toggle:function(menuitem) {
			
		if(this.dWin)
			this.close();
		else
			this.open();
		
	}
};

//global
function log(str) {
	LilyDebugWindow.print(str);
}


