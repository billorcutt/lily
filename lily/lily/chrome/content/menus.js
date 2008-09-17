/** 

Copyright (c) 2007 Bill Orcutt (http://lilyapp.org, http://publicbeta.cx)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the follopenerg conditions:

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

var LilyMenuBar = {
	        
    hideContextItem: function() {
		if(gContextMenu) {
			var hide = (!((gContextMenu.onLink)&&(gContextMenu.link.href.indexOf(".json")!=-1)));
			document.getElementById('contextObjectSeparator').hidden = hide;			
			document.getElementById('contextOpenInLily').hidden = hide;
		}
    },

	initFontMenus:function(win) {
		//preload the font menu
		if(win && win.document.getElementById("menu_ObjectFontPopup")&&win.document.getElementById("contextMenu_ObjectFontPopup")) {
			this.setFontList(win.document.getElementById("menu_ObjectFontPopup"));
			this.setFontList(win.document.getElementById("contextMenu_ObjectFontPopup"));
		}		
	},	
	
	setFileMenu: function(menu,win) {
		
		//if(LilyUtils.navigatorPlatform()!="apple"&&LilyUtils.navigatorPlatform()!="windows") {
			win.document.getElementById("saveAsAppPatchItem").setAttribute("disabled",true);
			win.document.getElementById("saveAsAddOnPatchItem").setAttribute("disabled",true);		
		//} else {
			win.document.getElementById("saveAsAppPatchItem").setAttribute("disabled",false);
			win.document.getElementById("saveAsAddOnPatchItem").setAttribute("disabled",false);
		//}
		
	},
		
	//toggle the paste command to use the Ff clipboard or the Lily clipboard.	
	setEditCommands: function(editing) {
		
			var win=LilyUtils.getActiveXULWindow(); //get the chrome window.		
		
		if(
			win.document.getElementById("contextPasteItem")&&
			win.document.getElementById("pasteItemLily")&&
			win.document.getElementById("lilyPasteKey")
		) {
									
			if(editing) {
	//			LilyDebugWindow.print("ok now im editing.")		
				win.document.getElementById("contextPasteItem").setAttribute("oncommand","goDoCommand('cmd_paste')");
				win.document.getElementById("pasteItemLily").setAttribute("oncommand","goDoCommand('cmd_paste')");
				win.document.getElementById("lilyPasteKey").setAttribute("oncommand","goDoCommand('cmd_paste')");			
			
			} else {
	//			LilyDebugWindow.print("done editing.")		//
				win.document.getElementById("contextPasteItem").setAttribute("oncommand","opener.Lily.paste()");
				win.document.getElementById("pasteItemLily").setAttribute("oncommand","opener.Lily.paste()");
				win.document.getElementById("lilyPasteKey").setAttribute("oncommand","opener.Lily.paste()");
								
			}
		
		}		
		
	},
		
	setWindowMenu: function(menu,pWin) {
						
		var menuNodes = menu.childNodes;
		
		for(var i=0;i<menuNodes.length;i++) {
			
			if(menuNodes[i].getAttribute("id")=="debugWindowOption") {
				menuNodes[i].setAttribute("checked",LilyDebugWindow.isOpen())
			} else if (menuNodes[i].getAttribute("id")=="inspectorWindowOption") {
				menuNodes[i].setAttribute("checked",LilyInspectorWindow.isOpen())
			} else if(menuNodes[i].getAttribute("id")!="lilyWindowSeparator") {
				menu.removeChild(menuNodes[i]); //clear the old windows...
				i--;				
			}
		}
				
		var enumerator = LilyUtils.getWindowEnumerator();
		
		while(enumerator.hasMoreElements()) {
			
			var win = enumerator.getNext();
		
	        // For each window, create a menu item element
	        var tempItem = null;
	        tempItem = pWin.document.createElement("menuitem"); //create the menu item.

			//set attributes			
	        tempItem.setAttribute("label",win.title);	
	        tempItem.setAttribute("type","checkbox");
	        tempItem.setAttribute("autocheck",true);
	        tempItem.setAttribute("checked",false);
		
			if(win===pWin)
				tempItem.setAttribute("checked",true);
			else
				tempItem.setAttribute("checked",false);

	        // Add the item to our menu
	        var appended = menu.appendChild(tempItem);
	
			//focus win when the menu item is selected.
			appended.addEventListener("command",function(e){
				var name = e.target.getAttribute("label");
				var enumerator = LilyUtils.getWindowEnumerator();
				var currWinID = Lily.currPatch;
				while(enumerator.hasMoreElements()) {
					var win = enumerator.getNext();
					if(win.title==name && currWinID!=win.windowID) {
						win.focus();
					}
				}
			},false);	
		
		}
		
	},
	
	disableObjectMenu: function(menu) {
		
		var menuNodes = menu.childNodes;
		
		for(var i=0;i<menuNodes.length;i++) {
			menuNodes[i].setAttribute("disabled",true);		
		}
		
	},
	
	setObjectMenu: function(menu) {
		
		var menuNodes = menu.childNodes;
		var len = Lily.getCurrentPatch().patchController.getSelectedObjectsLength();
		var connect_length = Lily.getCurrentPatch().patchController.getSelectedConnectionsLength();
		var editable = (Lily.getCurrentPatch().patchController.getEditable()=="edit");
		
		for(var i=0;i<menuNodes.length;i++) {
			
			menuNodes[i].setAttribute("disabled",true);			
						
			if(editable) { //everything is disabled if we're not in edit mode.	

				if(menuNodes[i].getAttribute("id")=="menu_ObjectNew") { //new is always enabled
					menuNodes[i].setAttribute("disabled",false); //XXX -FIXME - this item not being disabled - XXXX
				} else if(
					(
						menuNodes[i].getAttribute("id")=="menu_ObjectFont"||
						menuNodes[i].getAttribute("id")=="menu_ObjectColor"||
						menuNodes[i].getAttribute("id")=="getInfoItem"||
						menuNodes[i].getAttribute("id")=="hideInPerfItem"||
						menuNodes[i].getAttribute("id")=="showInPerfItem"||
						menuNodes[i].getAttribute("id")=="nameItem"||
						menuNodes[i].getAttribute("id")=="bringForwardItem"||
						menuNodes[i].getAttribute("id")=="sendBackItem" ||
						menuNodes[i].getAttribute("id")=="reloadItem"						
					) 
					&& 
					(
						len //enable the above items only if there are selected objects
					)
				) {
				
					menuNodes[i].setAttribute("disabled",false);
				
					if(menuNodes[i].getAttribute("id")=="hideInPerfItem"||menuNodes[i].getAttribute("id")=="showInPerfItem") {
	
						var hide = Lily.getCurrentPatch().patchController.getSelectedObjectsProperty("hideInPerf");

						if(hide==true) {
		
							if(menuNodes[i].getAttribute("id")=="hideInPerfItem")
								menuNodes[i].setAttribute("disabled",true); 

							if(menuNodes[i].getAttribute("id")=="showInPerfItem")
								menuNodes[i].setAttribute("disabled",false); 
	
						} else if(hide==false) {
	
							if(menuNodes[i].getAttribute("id")=="hideInPerfItem")
								menuNodes[i].setAttribute("disabled",false); 

							if(menuNodes[i].getAttribute("id")=="showInPerfItem")
								menuNodes[i].setAttribute("disabled",true); 
	
						} else {
							menuNodes[i].setAttribute("disabled",false); 
						}	
	
					}	

				} else if(
					(
						menuNodes[i].getAttribute("id")=="hideInPerfItem"||
						menuNodes[i].getAttribute("id")=="showInPerfItem"				
					) 
					&& 
					(
						connect_length //enable the above items only if there are selected connections
					) 
				) {

					menuNodes[i].setAttribute("disabled",false);
				
					var hide = Lily.getCurrentPatch().patchController.getSelectedConnectionsProperty("hiddenInPerf");

					if(hide==true) {
	
						if(menuNodes[i].getAttribute("id")=="hideInPerfItem")
							menuNodes[i].setAttribute("disabled",true); 

						if(menuNodes[i].getAttribute("id")=="showInPerfItem")
							menuNodes[i].setAttribute("disabled",false); 

					} else if(hide==false) {

						if(menuNodes[i].getAttribute("id")=="hideInPerfItem")
							menuNodes[i].setAttribute("disabled",false); 

						if(menuNodes[i].getAttribute("id")=="showInPerfItem")
							menuNodes[i].setAttribute("disabled",true); 

					} else {
						menuNodes[i].setAttribute("disabled",false); 
					}
					
				} else {
					menuNodes[i].setAttribute("disabled",true);
				}
			} else {				
				menuNodes[i].setAttribute("disabled",true);
			}	
		} //close for loop	
	},
	
	
	setEditMenu: function(menu) {
		
		var menuNodes = menu.childNodes;
		var len = Lily.getCurrentPatch().patchController.getSelectedObjectsLength();
		var editable = (Lily.getCurrentPatch().patchController.getEditable()=="edit");				
		
		for(var i=0;i<menuNodes.length;i++) {
			
			if(len&&menuNodes[i].getAttribute("id")!="pasteItemLily") {
				menuNodes[i].setAttribute("disabled",false);
			} else if(Lily.clipboard&&menuNodes[i].getAttribute("id")=="pasteItemLily"&&editable) {
				menuNodes[i].setAttribute("disabled",false);	
			} else if(menuNodes[i].getAttribute("id")=="selectAllItemLily"&&editable) {
				menuNodes[i].setAttribute("disabled",false);	
			}else {
				menuNodes[i].setAttribute("disabled",true);
			}
			
		}
				
	},
	
	setPatchMenu: function(menu) {
		
		var menuNodes = menu.childNodes;		
		var edit = Lily.getCurrentPatch().patchController.getEditable();		
				
		for(var i=0;i<menuNodes.length;i++) {
			
			if(menuNodes[i].getAttribute("id")=="patchEditOption") {
				if(edit=="edit")
					menuNodes[i].setAttribute("checked",true);
				else
					menuNodes[i].setAttribute("checked",false);	
			} else { //the color menu
				if(Lily.getCurrentPatch().patchController.getEditable()!="edit")
					menuNodes[i].setAttribute("disabled",true);
				else
					menuNodes[i].setAttribute("disabled",false);
			}
		}			
	},	
			
	onContextMenu: function(e) {

		var win=LilyUtils.getActiveXULWindow(); //get the chrome window.
		var editable = (Lily.getCurrentPatch().patchController.getEditable()=="edit");
		
		//hide the menu items.
		var contextMenu = win.document.getElementById("lilyContextMenu");
		
		if(!contextMenu) //if no context menu, bail... 
			return;
		
		var children = contextMenu.childNodes;
				
		//hide everything when we're done.
		contextMenu.addEventListener("popuphidden",function(e){
			if(e.target.id=="contentAreaContextMenu") {
			    for (var i=children.length-1; i>-1; i--) { 
					children[i].style.display="none";
			    }
			}	
		},true);
		
		//hide all on init.
	    for (var i=children.length-1; i>-1; i--) { 
			children[i].style.display="none";
	    } 

		//if we're clicking on the patch.
		if(e.target.getAttribute("name")=="canvas") {

		    for (var i=children.length-1; i>-1; i--) {	
				if(
					children[i].id=="contextPasteItem"||
					children[i].id=="contextMenu_PatchColor"||
					children[i].id=="contextPatchEditOption"||					
					children[i].id=="contextMenu_ObjectNew"
				) {
					
					//make visible
					children[i].style.display="inherit";
										
					//set the edit state item
					if(children[i].id=="contextPatchEditOption") {
						if(editable) { 
							children[i].setAttribute("checked",true);
						} else {
							children[i].setAttribute("checked",false); 
						}
					} else {
						if(!editable) { 
							children[i].setAttribute("disabled",true);
						} else {
							children[i].setAttribute("disabled",false);	
						}	
					}					
					
					//if paste, then make the separator visible
					if(children[i].id=="contextPasteItem") {
						win.document.getElementById("contextEditSeparator").style.display="inherit";
						if(!Lily.clipboard) { 
							children[i].setAttribute("disabled",true); //if the clipboard's empty, then disable paste
						} else {
							children[i].setAttribute("disabled",false); 
						}
					}

				}
		    }
		
		} else if(e.target.className=="segment") { //clicking on a connection segment
			
			for (var i=children.length-1; i>-1; i--) {
				if(children[i].id=="contextClearItem") {
					children[i].style.display="inherit";
					if(editable) {
						children[i].setAttribute("disabled",false); 
					} else {
						children[i].setAttribute("disabled",true); 
					}	
				}					
			}
						
		} else { 	//must be clicking on an object.

			for (var i=children.length-1; i>-1; i--) {	
				if(
					children[i].id=="contextCutItem"||					
					children[i].id=="contextCopyItem"||
					children[i].id=="contextPasteItem"||					
					children[i].id=="contextClearItem"||

					children[i].id=="contextHelpItem"||

					children[i].id=="contextMenu_ObjectColor"||
					children[i].id=="contextMenu_ObjectFont"||	
					children[i].id=="contextHideInPerfItem"||
					children[i].id=="contextShowInPerfItem"||					
					children[i].id=="contextBringForwardItem"||					
					children[i].id=="contextSendBackItem"||										
					children[i].id=="contextGetInfoItem" ||
					children[i].id=="contextReloadItem"					
				) {

					//help
					if(children[i].id=="contextHelpItem") {
						
						win.document.getElementById("contextHelpSeparator").style.display="inherit";
						
						var name = Lily.getCurrentPatch().patchController.getSelectedObjectsProperty("className");
						
						if(!name) {
							children[i].setAttribute("disabled",true);
						} else {
							children[i].setAttribute("disabled",false);
						}						
					}	

					//edit
					if(children[i].id=="contextCutItem"||children[i].id=="contextCopyItem"||children[i].id=="contextPasteItem"||children[i].id=="contextClearItem") {

						win.document.getElementById("contextEditSeparator").style.display="inherit";

						if(!Lily.clipboard && children[i].id=="contextPasteItem") { 
							children[i].setAttribute("disabled",true); //if the clipboard's empty, then disable paste
						} else {
							children[i].setAttribute("disabled",false); 
						}
						
					}

					//object
					if(
						children[i].id=="contextMenu_ObjectColor"||
						children[i].id=="contextMenu_ObjectFont"||
						children[i].id=="contextHideInPerfItem"||
						children[i].id=="contextShowInPerfItem"||
						children[i].id=="contextBringForwardItem"||
						children[i].id=="contextSendBackItem"||
						children[i].id=="contextGetInfoItem" ||
						children[i].id=="contextReloadItem"							
					) {
						win.document.getElementById("contextObjectSeparator").style.display="inherit";
						children[i].setAttribute("disabled",false); 
						
						if(children[i].id=="contextHideInPerfItem"||children[i].id=="contextShowInPerfItem") {
							var hide = Lily.getCurrentPatch().patchController.getSelectedObjectsProperty("hideInPerf");

							//LilyDebugWindow.print(">>> "+hide)

							if(hide==true) {
								
								if(children[i].id=="contextHideInPerfItem")
									children[i].setAttribute("disabled",true); 

								if(children[i].id=="contextShowInPerfItem")
									children[i].setAttribute("disabled",false); 
							
							} else if(hide==false) {
							
								if(children[i].id=="contextHideInPerfItem")
									children[i].setAttribute("disabled",false); 

								if(children[i].id=="contextShowInPerfItem")
									children[i].setAttribute("disabled",true); 
							
							} else {

								if(children[i].id=="contextHideInPerfItem")
									children[i].setAttribute("disabled",false); 

								if(children[i].id=="contextShowInPerfItem")
									children[i].setAttribute("disabled",false); 

							}	
							
						}	
							
					}
					
					children[i].style.display="inherit";
					
					if(!editable)
						children[i].setAttribute("disabled",true);
						
				}				
					
			}	
			
		} 

	},
	
	fontArray: [],
		
	initFonts: function() {
		this.fontArray=LilyUtils.getInstalledFonts();
	},
	
	getDefaultFont: function() {
		var cp=Lily.getCurrentPatch();
		return cp.getPatchFont();
	},
	
	setFontValue: function(menu) {
		
		this.deselectFontValue(menu); //clear the font menu
			
		var menuArr=menu.childNodes;//win.document.getElementById("menu_ObjectFontPopup").childNodes;
		
		var patch=Lily.getCurrentPatch().patchController;
		var size=patch.getSelectedObjectsProperty("fontSize");
		var face=patch.getSelectedObjectsProperty("fontFace");				

		for(var i=0;i<menuArr.length;i++) {
			
			var label=menuArr[i].getAttribute("label");	
			//FIXME XXXX *** hack until we normalize the patches.			
			if(size==label||face && (face.toLowerCase()==label.toLowerCase())) {
				menuArr[i].setAttribute("checked",true);			
			}
			
		}
				
	},	
	
	deselectFontValue: function(menu) {
		
//		var win = LilyUtils.getActiveWindow(); ///get the chrome window for the patch.				
		var menuArr=menu.childNodes;
				
		for(var i=0;i<menuArr.length;i++) {
			menuArr[i].setAttribute("checked",false);
		}
				
	},		
	
	setFontList: function(menu) {
				
		if(menu.statusText=="true") {
			return;	
		}
		
		var win = LilyUtils.getActiveXULWindow(); ///get the chrome window for the patch.				

        // For each search term, create a menu item element
        var tempItem = null;
        tempItem = win.document.createElement("menuitem");

		//set attributes			
        tempItem.setAttribute("label", "Color...");
        tempItem.setAttribute("name", "fontColor");
        tempItem.setAttribute("id", "fc");	
        tempItem.setAttribute("type", "radio");	
		
        tempItem.setAttribute("oncommand", "opener.Lily.openColorPicker('font')");	

        // Add the item to our menu
        menu.appendChild(tempItem);
		
		menu.appendChild(win.document.createElement("menuseparator"));		
		
	    // Load the search terms into our menu
	    for(var i=5; i<15; i++)
	    {
	        // For each search term, create a menu item element
	        var tempItem = null;
	        tempItem = win.document.createElement("menuitem");

			//set attributes			
	        tempItem.setAttribute("label", i);
	        tempItem.setAttribute("name", "fontSize");
	        tempItem.setAttribute("id", "fs"+i);	
	        tempItem.setAttribute("type", "radio");	
			
	        tempItem.setAttribute("oncommand", "opener.Lily.setFont(\"fontSize\","+ i +")");	

	        // Add the item to our menu
	        menu.appendChild(tempItem);
	    }		
		
	    // Load the search terms into our menu
	    for(var i=15; i<150; i+=5)
	    {
	        // For each search term, create a menu item element
	        var tempItem = null;
	        tempItem = win.document.createElement("menuitem");

			//set attributes			
	        tempItem.setAttribute("label", i);
	        tempItem.setAttribute("name", "fontSize");
	        tempItem.setAttribute("id", "fs"+i);	
	        tempItem.setAttribute("type", "radio");	
			
	        tempItem.setAttribute("oncommand", "opener.Lily.setFont(\"fontSize\","+ i +")");	

	        // Add the item to our menu
	        menu.appendChild(tempItem);
	    }	

		menu.appendChild(win.document.createElement("menuseparator"));

	    // Load the search terms into our menu
	    for(var i=0; i<this.fontArray.length; i++)
	    {
	        // For each search term, create a menu item element
	        var tempItem = null;
	        tempItem = win.document.createElement("menuitem");

			//set attributes			
	        tempItem.setAttribute("label", this.fontArray[i]);
	        tempItem.setAttribute("id", this.fontArray[i]);	
	        tempItem.setAttribute("name", "fontFamily");
	        tempItem.setAttribute("type", "radio");
			
	        tempItem.setAttribute("oncommand", "opener.Lily.setFont(\"fontFamily\",\""+this.fontArray[i]+"\")");	

	        // Add the item to our menu
	        menu.appendChild(tempItem);
	    }
		
		menu.statusText="true";
	},
	
	initBorderMenus:function(win) {
		//preload the font menu
		if(win && win.document.getElementById("menu_ObjectBorderPopup")&&win.document.getElementById("contextMenu_ObjectBorderPopup")) {
			this.setBorderList(win.document.getElementById("menu_ObjectBorderPopup"));
			this.setBorderList(win.document.getElementById("contextMenu_ObjectBorderPopup"));
		}		
	},

	setBorderValue: function(menu) {
		this.deselectBorderValue(menu); //clear the font menu

		var menuArr=menu.childNodes;

		var patch=Lily.getCurrentPatch().patchController;
		var size=patch.getSelectedObjectsProperty("borderStyle");
		var style=patch.getSelectedObjectsProperty("borderWidth");
		
		for(var i=0;i<menuArr.length;i++) {

			var label=menuArr[i].getAttribute("label");	
			//FIXME XXXX *** hack until we normalize the patches.			
			if(size==label||style && (style.toString().toLowerCase()==label.toLowerCase())) {
				menuArr[i].setAttribute("checked",true);			
			}

		}
	},	

	deselectBorderValue: function(menu) {			
		var menuArr=menu.childNodes;

		for(var i=0;i<menuArr.length;i++) {
			menuArr[i].setAttribute("checked",false);
		}
	},	
	
	setBorderList: function(menu) {
				
		if(menu.statusText=="true") {
			return;	
		}
		
		var styleArray = [
			"none",
			"dashed",
			"dotted",
			"double",
			"groove",
			"inset",
			"outset",
			"ridge",
			"solid"
		];
		
		var win = LilyUtils.getActiveXULWindow(); ///get the chrome window for the patch.				

        // For each search term, create a menu item element
        var tempItem = null;
        tempItem = win.document.createElement("menuitem");

		//set attributes			
        tempItem.setAttribute("label", "Color...");
        tempItem.setAttribute("name", "borderColor");
        tempItem.setAttribute("id", "bc");
        tempItem.setAttribute("type", "radio");	
		
        tempItem.setAttribute("oncommand", "opener.Lily.openColorPicker('border')");	

        // Add the item to our menu
        menu.appendChild(tempItem);
		
		menu.appendChild(win.document.createElement("menuseparator"));		
		
	    // Load the search terms into our menu
	    for(var i=0; i<15; i++)
	    {
	        // For each search term, create a menu item element
	        var tempItem = null;
	        tempItem = win.document.createElement("menuitem");

			//set attributes			
	        tempItem.setAttribute("label", i);
	        tempItem.setAttribute("name", "borderWidth");
	        tempItem.setAttribute("id", "bs"+i);	
	        tempItem.setAttribute("type", "radio");	
			
	        tempItem.setAttribute("oncommand", "opener.Lily.setBorder(\"borderWidth\","+ i +")");	

	        // Add the item to our menu
	        menu.appendChild(tempItem);
	    }		
		
	    // Load the search terms into our menu
	    for(var i=15; i<150; i+=5)
	    {
	        // For each search term, create a menu item element
	        var tempItem = null;
	        tempItem = win.document.createElement("menuitem");

			//set attributes			
	        tempItem.setAttribute("label", i);
	        tempItem.setAttribute("name", "borderWidth");
	        tempItem.setAttribute("id", "bs"+i);	
	        tempItem.setAttribute("type", "radio");	
			
	        tempItem.setAttribute("oncommand", "opener.Lily.setBorder(\"borderWidth\","+ i +")");	

	        // Add the item to our menu
	        menu.appendChild(tempItem);
	    }	

		menu.appendChild(win.document.createElement("menuseparator"));

	    // Load the search terms into our menu
	    for(var i=0; i<styleArray.length; i++)
	    {
	        // For each search term, create a menu item element
	        var tempItem = null;
	        tempItem = win.document.createElement("menuitem");

			//set attributes			
	        tempItem.setAttribute("label", styleArray[i]);
	        tempItem.setAttribute("id", styleArray[i]);	
	        tempItem.setAttribute("name", "borderStyle");
	        tempItem.setAttribute("type", "radio");
			
	        tempItem.setAttribute("oncommand", "opener.Lily.setBorder(\"borderStyle\",\""+styleArray[i]+"\")");	

	        // Add the item to our menu
	        menu.appendChild(tempItem);
	    }		
		menu.statusText="true";
	},	
				
	setObjectList: function(menu,help,context,opener) {
		
		if(menu.statusText=="true") {
			return;	
		}
				
		var isHelp=help||false;
		var catMenu=null;
		var isContext=(context=="context");
		
		var win=LilyUtils.getActiveXULWindow();		
				
		//make the all objects category menu
		var arrNames=LilyObjectList.getNames();		
		
		var allMenu = win.document.createElement("menu");
		allMenu.setAttribute("label", "All Objects"); //XXXX - fixme -- XXXX			
        allMenu.setAttribute("id", context+"allNewObjectMenu");
		
		var allPop = win.document.createElement("menupopup");
		//set attributes			
        allPop.setAttribute("id", context+"allNewObjectMenu"+"Popup");	
	
		allMenu.appendChild(allPop);
    	menu.appendChild(allMenu);

	    for(var i=0; i<arrNames.length; i++) {
			if(arrNames[i].menuName!="") {
				// For each search term, create a menu item element
		        var allItem = null;
		        allItem = win.document.createElement("menuitem");

				//set attributes			
		        allItem.setAttribute("id", context+arrNames[i].menuName+"Item");
				//set attributes			
		        allItem.setAttribute("label", arrNames[i].menuName);

				if(isHelp)
					allItem.setAttribute("oncommand", opener+".Lily.openHelpPatch(\""+ LilyUtils.stripExtension(arrNames[i].name) +"\")");
				else
		        	allItem.setAttribute("oncommand", opener+".Lily.newObject(\""+ LilyUtils.stripExtension(arrNames[i].name) +"\",null,"+isContext+")");	

		        // Add the item to our menu
		        allPop.appendChild(allItem);	
			}
		}

		//make the category menu
		var objArr=LilyObjectList.getNamesByCategory();		
	    // Load the search terms into our menu
	    for(var i=0; i<objArr.length; i++)
	    {					
			//if a category doesn't exist or if the category has changed, make a new one.
	        if(catMenu==null||(objArr[i].catName!=objArr[i-1].catName)) { 
				catMenu = win.document.createElement("menu");
				catMenu.setAttribute("label", objArr[i].catName);
				catMenu.setAttribute("id", context+objArr[i].catName+"Menu");				
				
				var catPop = win.document.createElement("menupopup");
				catMenu.setAttribute("id", context+objArr[i].catName+"Popup");					
				
				catMenu.appendChild(catPop);
	        	menu.appendChild(catMenu);
			}
	
			// For each search term, create a menu item element
	        var tempItem = null;
	        tempItem = win.document.createElement("menuitem");

			//set attributes			
	        tempItem.setAttribute("label", objArr[i].menuName);
			//set attributes			
	        tempItem.setAttribute("id", context+objArr[i].menuName+"Item");	
			
			if(isHelp)
				tempItem.setAttribute("oncommand", opener+".Lily.openHelpPatch(\""+ LilyUtils.stripExtension(objArr[i].name) +"\")");
			else
	        	tempItem.setAttribute("oncommand", opener+".Lily.newObject(\""+ LilyUtils.stripExtension(objArr[i].name) +"\",null,"+isContext+")");	

	        // Add the item to our menu
			catPop.appendChild(tempItem);
	    }
	
		menu.statusText="true";
			
	},
	
	setDebugMenu: function(win) {
		win.document.getElementById("setDebugItem").setAttribute("checked",Lily.debug);
		win.document.getElementById("setTraceItem").setAttribute("checked",Lily.trace);				
	}
	
}
