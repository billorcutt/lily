/**
*	Construct a new PatchView
*	@class top level class for the patch object
*	@constructor
*/
function LilyPatchView(pID,parent,extWin) 
{			
	this.patch=parent;
	this.controller=null;
	
	var thisPtr=this;		
	
	//some pointers into the patch window that are filled in during inits
	this.xulWin=null;	//chrome xul window
	this.oWin=null; //browser content window
	this.chromeWin=null; //browsers chrome window
	this.statusBar=null; //status bar
	this.statusBarIcon=null; //icon status bar
	this.statusBarActivity=null; //activity status bar
	this.document=null;
	this.body=null;
	this.head=null;	
	
	//setup patch width variables
	var winWidth=this.patch.width;
	var winHeight=this.patch.height;
	
	/**
	*	takes an html string & displays it as innerHTML as a div- returns a reference to the parent div.
	*/
	this.displayHTML=function(HTML,id,top,left,mode,nodeID) {
		
		var parentNode=(this.getElByID(nodeID))?this.getElByID(nodeID):this.body
		var divWrapper=this.document.createElement("div");
			
		if(mode) { //true if creating an object
			divWrapper.setAttribute("id",id);
			divWrapper.setAttribute("class","vanillaObj"); 
			divWrapper.style.position='absolute';
			divWrapper.style.left=left+"px";
			divWrapper.style.top=top+"px";
		}
		
		divWrapper.innerHTML=HTML;
		parentNode.appendChild(divWrapper);
		return divWrapper;
	}
	
	/**
	*	Creates a root SVG element in the document- returns a reference to that element.
	*/
	this.createSVG=function(id,nodeID) {
		
		var svgns = "http://www.w3.org/2000/svg";
		var parentNode=(this.getElByID(nodeID))?this.getElByID(nodeID):this.body
		var svgWrapper=this.document.createElementNS(svgns,"svg");
		var svgID=id||null;
		
		if(svgID)
			svgWrapper.setAttributeNS(null,"id",svgID);
		
		parentNode.appendChild(svgWrapper);
		return svgWrapper;
	}
	
	/**
	*	Creates an SVG element as a child of a root SVG element- returns a reference to that element.
	*/	
	this.displaySVG=function(element,attributes,parent) {
		//
	}
	
	this.addInclude=function(type,url) {
		if(type.indexOf("css")!=-1) {
			var includeEl = this.document.createElement("link");
			
			if(url)
				includeEl.setAttribute("href",url);
			
			includeEl.setAttribute("type",type);
			includeEl.setAttribute("rel","StyleSheet");
			this.head.appendChild(includeEl);
			return includeEl;
		} else if(type.indexOf("javascript")!=-1){
			var includeEl = this.document.createElement("script");
			
			if(url)
				includeEl.setAttribute("src",url);
			
			includeEl.setAttribute("type",type);
			this.head.appendChild(includeEl);
			return includeEl;	
		}
		return null;
	}
	
	this.getElByID=function(id) {
		return this.document.getElementById(id);
	}	
	
	this.removeElement=function(el) {
						
		try {
			this.body.removeChild(el);	
		} catch(e) {
			//in space no one can hear you scream...
		}

	}
	
	//return calculated position of an object
	this.findPos=function(obj) {
		return LilyUtils.getObjectPos(obj);
	}
	
	//set the patch title
	this.setPatchTitle=function(title) {
		var patch_title=(/-help/.test(title))?title.replace(/dot/,"."):title; //if its a help patch, replace "dot" with "."
		this.oWin.document.title=patch_title;
		this.xulWin.title=patch_title;
		this.patch.title=patch_title;
	}
	
	//FF doesn't honor this- no effect.
	this.makeWindowResizable=function(bool) {
		this.xulWin.setResizable(LilyUtils.convertType(bool));
	}
	
	//update the patch size properties on resize
	this.updateWinSize=function(e) {
		thisPtr.patch.height=thisPtr.xulWin.outerHeight;
		thisPtr.patch.width=thisPtr.xulWin.outerWidth;
//		LilyDebugWindow.print(thisPtr.patch.height+" "+thisPtr.patch.width)
	}
	
	//wrap resize to
	this.setPatchSize=function(x,y) {
		this.oWin.resizeTo(x,y);
	}
	
	//set the canvas color
	this.setPatchColor=function(color) {
		thisPtr.canvas.style.background=color;
		thisPtr.patch.color=color;
	}
	
	//set the font face
	this.setPatchFontFamily=function(family) {
		this.body.style.fontFamily=LilyUtils.getCompatibleFont(font);
	}
	
	//set the font size
	this.setPatchFontSize=function(size) {
		this.body.style.fontSize=LilyUtils.sizeFontForPlatform(size);
	}
	
	this.showWindowStatusActivity=function(state) {				
		if(state)
			this.statusBarActivity.style.visibility="visible";
		else
			this.statusBarActivity.style.visibility="hidden";
	}	
	
	this.setWindowStatusIcon=function(state) {		
		if(state=="locked")
			this.statusBarIcon.setAttribute("src","chrome://lily/content/images/lock.png");
		else
			this.statusBarIcon.setAttribute("src","chrome://lily/content/images/lock_open.png");		
	}
	
	this.setWindowStatusTooltip=function(txt) {		
		this.statusBarIcon.setAttribute("tooltiptext",txt);
	}	
	
	this.setTempWindowStatus=function(txt,time) {
		this.setWindowStatusText(txt);
		setTimeout(function(){
			if(typeof thisPtr.clearWindowStatusText == "function") {
				thisPtr.clearWindowStatusText();	
			}
		},time);
	}	
		
	this.setWindowStatusText=function(txt) {
		try {
			this.statusBar.setAttribute("label",txt);	
		} catch(e) {}
	}
	
	this.clearWindowStatusText=function() {
		try {
			this.statusBar.setAttribute("label","");
		} catch(e) {}
	}
	
	this.displayPatchDialog=function(str,color) {
		var width=Math.floor(this.patch.width/1.33);	
		return LilyComponents._dialog.toggleMessageDialog(thisPtr.oWin,str,width,color);
	}
		
	this.displayHelpDialog=function() {
		LilyUtils.readAsyncFromURL("chrome://lily/content/help-patches/help.html",function(str){
			thisPtr.displayPatchDialog(str.replace(/ACCEL/g,LilyUtils.getAccelText()),null);
		});
	}
	
	this.displayFirstTimeScreen=function() {
		if(LilyUtils.getBoolPref("extensions.lily.showFirstTimeHelp")) {
			LilyUtils.readAsyncFromURL("chrome://lily/content/help-patches/firsttime.html",function(str){
				var tmp = thisPtr.displayPatchDialog(str,null);
				tmp.message.getElementsByTagName("input")[0].addEventListener("click",function(e) {
					if(e && e.target && typeof e.target.checked!="undefined") {
						LilyUtils.setBoolPref("extensions.lily.showFirstTimeHelp",e.target.checked);
						//LilyDebugWindow.print("set pref to "+e.target.checked);
					}
				},false);
			});
		}
	}
	
	function initSidebar(sidebar) {
		
		//LilyDebugWindow.print("init sidebar...")
		
		thisPtr.xulWin=sidebar.parent;		
		
		//setup some pointers into the patch window
		thisPtr.chromeWin=sidebar.win//
		thisPtr.oWin=sidebar.win.contentWindow;

		thisPtr.document=thisPtr.oWin.document;
		thisPtr.body=thisPtr.oWin.document.getElementById("bodyElement");
		thisPtr.head=thisPtr.oWin.document.getElementById("headElement");

		thisPtr.statusBar={setAttribute:function(){}};//
		thisPtr.statusBarIcon={setAttribute:function(){}}; //window.status//

		//pass the window refs to the controller
		thisPtr.controller.oWin=thisPtr.oWin;
		thisPtr.controller.xulWin=thisPtr.oWin;		
		thisPtr.controller.document=thisPtr.document;

		//add a css include
		thisPtr.addInclude("text/css","chrome://lily/content/lily.css");

		//add the background canvas
		thisPtr.canvas=thisPtr.displayHTML("");
		thisPtr.canvas.setAttribute("class","canvas");
		thisPtr.canvas.setAttribute("name","canvas");
		thisPtr.canvas.setAttribute("id","canvas");	
		thisPtr.canvas.addEventListener("mousedown",LilyUtils.preventDefault,false); //stop contextual menu

		//add patch listeners
		//thisPtr.controller.addDefaultPatchListeners();
		//adding editability mode listener here instead of calling adddefaultlisteners...
		thisPtr.controller.attachPatchObserver(thisPtr.controller.pID,"editabilityChange",thisPtr.controller.toggleEditState,"all");		

		//if theres a callback, do it now
		if(typeof thisPtr.patch.callback=="function")
			thisPtr.patch.callback();
	}
	
	function initIframe() {
		
		extWin.win.removeEventListener("load",initIframe,true);
				
		thisPtr.xulWin=extWin.parent;
		
		//setup some pointers into the patch window
		thisPtr.chromeWin=extWin.win.contentWindow;
		thisPtr.oWin=extWin.win.contentWindow;

		thisPtr.document=thisPtr.oWin.document;
		thisPtr.body=thisPtr.oWin.document.getElementById("bodyElement");
		thisPtr.head=thisPtr.oWin.document.getElementById("headElement");

		thisPtr.statusBar=thisPtr.xulWin.document.getElementById("lilyStatusPanel")||{setAttribute:function(){}};
		thisPtr.statusBarIcon=thisPtr.xulWin.document.getElementById("lilyIconPanel")||{setAttribute:function(){}};
		thisPtr.statusBarActivity=thisPtr.xulWin.document.getElementById("lilyStatusActivity")||{setAttribute:function(){}};

		//pass the window refs to the controller
		thisPtr.controller.oWin=thisPtr.oWin;
		thisPtr.controller.xulWin=thisPtr.oWin;		
		thisPtr.controller.document=thisPtr.document;

		//add a css include
		thisPtr.addInclude("text/css","chrome://lily/content/lily.css");

		//add the background canvas
		thisPtr.canvas=thisPtr.displayHTML("");
		thisPtr.canvas.setAttribute("class","canvas");
		thisPtr.canvas.setAttribute("name","canvas");
		thisPtr.canvas.setAttribute("id","canvas");	
		thisPtr.canvas.addEventListener("mousedown",LilyUtils.preventDefault,false); //stop contextual menu

		//add patch listeners
		thisPtr.controller.addDefaultPatchListeners();

		//if theres a callback, do it now
		if(typeof thisPtr.patch.callback=="function")
			thisPtr.patch.callback();

	}
	
	function initReadOnlyWindow() {

		//call the common init functions.
		patchInit();
		
		//adding editability mode listener here instead of calling adddefaultlisteners...
		thisPtr.controller.attachPatchObserver(thisPtr.controller.pID,"editabilityChange",thisPtr.controller.toggleEditState,"all");
				
		//if theres a callback, do it now
		if(typeof thisPtr.patch.callback=="function")
			thisPtr.patch.callback();
			
		//focus
		setTimeout(function(){thisPtr.xulWin.focus();},100);		
	
	}	
				
	function initWindow() {

		//call the common init functions.
		patchInit();
				
		//window listener for contextmenu event
		thisPtr.oWin.addEventListener("contextmenu",LilyMenuBar.onContextMenu,false); //move this function.
		//preload the font menus
		setTimeout(function(){LilyMenuBar.initFontMenus(thisPtr.xulWin)},2000);	
		
		//preload the font menus
		setTimeout(function(){LilyMenuBar.initBorderMenus(thisPtr.xulWin)},2000);			
				
		//add patch listeners
		thisPtr.controller.addDefaultPatchListeners();
		
		//set the initial paste cmd
		LilyMenuBar.setEditCommands(false);
		
		//if theres a callback, do it now
		if(typeof thisPtr.patch.callback=="function")
			thisPtr.patch.callback();

		//focus	
		setTimeout(function(){thisPtr.xulWin.focus();},100);
		
	}
	
	function patchInit() {
		
		//setup some pointers into the patch window
		thisPtr.chromeWin=thisPtr.xulWin.document.getElementById("browserElement");
		thisPtr.oWin=thisPtr.xulWin.document.getElementById("browserElement").contentWindow;
		
		thisPtr.document=thisPtr.oWin.document;
		thisPtr.body=thisPtr.oWin.document.getElementById("bodyElement");
		thisPtr.head=thisPtr.oWin.document.getElementById("headElement");
		
		thisPtr.statusBar=thisPtr.xulWin.document.getElementById("lilyStatusPanel");
		thisPtr.statusBarIcon=thisPtr.xulWin.document.getElementById("lilyIconPanel");
		thisPtr.statusBarActivity=thisPtr.xulWin.document.getElementById("lilyStatusActivity");		
								
		//pass the window refs to the controller
		thisPtr.controller.oWin=thisPtr.oWin;
		thisPtr.controller.xulWin=thisPtr.oWin;		
		thisPtr.controller.document=thisPtr.document;

		//add a css include
		thisPtr.addInclude("text/css","chrome://lily/content/lily.css");

		//add the background canvas
		thisPtr.canvas=thisPtr.displayHTML("");
		thisPtr.canvas.setAttribute("class","canvas");
		thisPtr.canvas.setAttribute("name","canvas");
		thisPtr.canvas.setAttribute("id","canvas");	
		thisPtr.canvas.addEventListener("mousedown",LilyUtils.preventDefault,false); //stop contextual menu
		
		//resize window listener for resize event
		thisPtr.oWin.addEventListener("resize",thisPtr.updateWinSize,false);
			
	}	
		
	//standard patch	
	if(!this.patch.hidden && !this.patch.readonly && !extWin)	{
		var tmp_coords = LilyUtils.getOpenDialogOffset(winWidth,winHeight);	
		this.xulWin=window.openDialog("chrome://lily/content/xul/patch.xul", pID,"width="+winWidth+",height="+winHeight+",left="+tmp_coords[0]+",top="+tmp_coords[1]+",menubar=yes,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=yes,chrome=yes",initWindow,pID);	
	//hidden patch
	} else if(this.patch.hidden && !extWin) {
		var iframe = document.getElementById("lilyHiddenIframe");
		extWin = {type:"iframe",win:iframe,parent:iframe.contentWindow};
		extWin.win.addEventListener("load",initIframe,true);
		extWin.win.contentWindow.location.href="chrome://lily/content/patch.xhtml";
		//this.xulWin=window.openDialog("chrome://lily/content/xul/hiddenpatch.xul", pID,"",initReadOnlyWindow,pID);	//hidden patch	
	} else if(this.patch.readonly && !extWin) {
		var tmp_coords = LilyUtils.getOpenDialogOffset(winWidth,winHeight);		
		this.xulWin=window.openDialog("chrome://lily/content/xul/readonlypatch.xul", pID,"width="+winWidth+",height="+winHeight+",left="+tmp_coords[0]+",top="+tmp_coords[1]+",menubar=yes,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=yes,chrome=yes",initReadOnlyWindow,pID);
	//patch in iframe
	} else if(extWin && extWin.type=="iframe") {
		extWin.win.addEventListener("load",initIframe,true);
		extWin.win.contentWindow.location.href="chrome://lily/content/patch.xhtml";
	//patch in sidebar
	} else if(extWin && extWin.type=="sidebar") {			
		document.getElementById("lilyHorizontalSideBar").setAttribute("src","chrome://lily/content/patch.xhtml");
		//FIXME - can't remove the above event listener for some reason- resorting to settimeout.	
		setTimeout(function(){
			initSidebar(extWin); //init when the sidebar is loaded
		},100);
	}
}