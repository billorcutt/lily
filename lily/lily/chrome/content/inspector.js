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
	Class: LilyInspectorWindow
		Object Property Inspector.
*/
var LilyInspectorWindow = {

	/*
		Property: iWin
			pointer to the inspector window.
	*/
	iWin:null,
	
	/*
		Property: bWin
			pointer to the inner inspector browser window.
	*/
	bWin:null,	
	
	/*
		Property: cWin
			pointer to the browser chrome window.
	*/
	cWin:null,
	
	/*
		Property: loaded
			flag to identify if the window is loaded.
	*/
	loaded:false,	
	
	/*
		Method: isOpen
			is the inspector window open?
			
		Returns:	
			bool
	*/
	isOpen: function(){
		return (this.iWin!=null);
	},	

	/*
		Method: open
			open inspector window.
	*/
	open:function (id) {
//		LilyDebugWindow.print("open the window...")				
		if(!this.iWin) {
			var tmp_coords = LilyUtils.getOpenDialogCoords(300,300);	
			this.iWin=window.openDialog("chrome://lily/content/xul/inspector.xul", "iWin","width=300,height=300,left="+tmp_coords[0]+",top="+tmp_coords[1]+",toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,chrome=yes",function(){LilyInspectorWindow.init(id);});					
		} else {
			LilyInspectorWindow.init(id);
		}		
		return this.iWin;		
	},

	/*
		Method: close
			close inspector window.
	*/	
	close:function() {
		if(this.iWin) {
			this.iWin.close();
			this.reset();
		}	
	},

	/*
		Method: reset
			reset the object & menu item.
	*/
	reset:function() {
		this.iWin=null;
		this.bWin=null;
		this.cWin=null;
		this.loaded=false;		
	},

	/*
		Method: clear
			clear the inspector window.
	*/
	clear:function() {
		if(this.iWin) {	
//			LilyDebugWindow.print("clearing...")			
			this.cWin.setAttribute("src","chrome://lily/content/inspector.html?rand="+Math.random());
			this.iWin.title="Inspector"; //FIXME localize string - XXXX - pass the html title to the xul window.	
		}
		this.loaded=false;
	},
	
	/*
		Method: loaded
			is the inspector window loaded?
	*/	
	isLoaded:function() {
		if(this.iWin && this.loaded) {
			return true;
		} else {
			return false;
		}
	},	

	/*
		Method: toggle
			toggle the inspector window open or close.

		Arguments: 
			menuitem - inspector window menuitem.		
	*/
	toggle:function() {
		
		if(!this.iWin) {
			if(LilyApp.getCurrentPatch()&&LilyApp.getCurrentPatch().patchController.getHasSelection())
				LilyApp.getInfo();
			else
				this.open();
		} else {
			this.close();
		}				
	},
	
	generateInspectorHTML: function(arr,displayName,groupName,cssName) {
		
		var src='<html>' +
		'<head>' +
			'<title>'+displayName+': Properties</title>' +
			'<style type="text/css">' +
				'td, input, select, textarea{font-size:'+LilyUtils.getDefaultFont()[1]+'px;font-family:'+LilyUtils.getDefaultFont()[0]+'}' +
			'</style>' +
		'</head>' +
		'<body>' +
		'<table border="0" style="background:#E5E5E5" id="inspector-layout-table" cellpadding="5" width="300">';	
		
		src += '<tr><td colspan="3" style="height:1px"></td></tr>';

		for(var i=0;i<arr.length;i++) {
			src += '<tr>';
				src += '<td style="background:lightgrey;width:110px" align="right">';
					src += arr[i].label;
				src += '</td>';
				src += '<td align="left">';
					if(arr[i].input=="radio") {
						for(var j=0;j<arr[i].options.length;j++) {
							var isChecked=(arr[i].value==arr[i].options[j].value)?"checked":"";
							src += '<input id="'+arr[i].name+'-radio-'+(j+1)+'" name="'+arr[i].name+'" value="'+arr[i].options[j].value+'" '+isChecked+' type="radio">&nbsp;'+arr[i].options[j].label+'<br>';
						}
					} else if(arr[i].input=="file") {
						src += '<input style="width:120px" id="'+arr[i].name+'" value="'+LilyUtils.stripLTQuotes(arr[i].value)+'" type="text"><input id="'+arr[i].name+'_button" style="margin-left:5px" type="button"/>';
					} else if(arr[i].input=="select") {
						src += '<select style="width:150px" id="'+arr[i].name+'" name="'+arr[i].name+'">';
						for(var j=0;j<arr[i].options.length;j++) {
							var isSelected=(arr[i].value==arr[i].options[j].value)?"selected":"";
							src += '<option ' + isSelected + ' value="'+arr[i].options[j].value+'">'+arr[i].options[j].label+'</option>';
						}
						src += '</select>';						
					} else if(arr[i].input=="textarea") {
						src += '<textarea rows=\"5\" style="width:150px" id="'+arr[i].name+'">'+arr[i].value+'</textarea>' ;	
					} else if(arr[i].input=="checkbox") {
						src += '<input id="'+arr[i].name+'" '+(arr[i].value?"checked":"")+' value="'+arr[i].value+'" type="checkbox">';	
					} else {
						src += '<input style="width:150px" id="'+arr[i].name+'" value="'+arr[i].value+'" type="text">';						
					}
				src += '</td>';
				src += '<td width="5">&nbsp;</td>';
			src += '</tr>';
		}
		
		//group names
		src += '<tr>';
			src += '<td style="background:lightgrey" align="right">';
				src += 'Object Name';
			src += '</td>';		
			src += '<td align="left">';
				src += '<input type="text" id="groupNameInput" style="width:150px" value=\"'+groupName+'\"/>';		
			src += '</td>';
			src += '<td width="5">&nbsp;</td>';			
		src += '</tr>';
		
		//css names
		src += '<tr>';
		src += '<td style="background:lightgrey" align="right">';
			src += 'CSS Classname';
		src += '</td>';		
			src += '<td align="left">';
				src += '<input type="text" id="classNameInput" style="width:150px;" value=\"'+cssName+'\"/>';		
			src += '</td>';
			src += '<td width="5">&nbsp;</td>';			
		src += '</tr>';			

		src += '<tr>';
			src += '<td cellpadding="10" cellspacing="10" style="background:lightgrey" colspan="3" align="center">';
				src += '<input style="font-size:18px;margin-right:20px;margin-top:10px;margin-bottom:10px;" id="revertButton" type="button" value="Revert"/>';
				src += '<input style="font-size:18px;margin-left:20px;margin-top:10px;margin-bottom:10px;" id="doneButton" type="button" value="Done"/>';						
			src += '</td>';
		src += '</tr>';	
		src += '</table>';
		src += '</body>';
		src += '</html>';

		return src;
	},
	
	cloneInspectorConfig: function(configArr) {
		var tmpArr=[];
//		var configArr=thisPtr.getInspectorConfig();
		for(var i=0;i<configArr.length;i++) {
			
			tmpArr.push({name:configArr[i].name, value:configArr[i].value, type:configArr[i].type, input:configArr[i].input, label:configArr[i].label});
			
			if(typeof configArr[i].options != "undefined")
				tmpArr[i].options = LilyUtils.cloneArray(configArr[i].options);
				
		}
		return tmpArr;
	},
	
	saveInspector: function() {
		if(LilyInspectorWindow.inspectorConfig.length && LilyApp.getCurrentPatch()) {
			LilyInspectorWindow.inspectorConfigBackup=LilyInspectorWindow.cloneInspectorConfig(LilyApp.getCurrentPatch().getObj(LilyInspectorWindow.objID).getInspectorConfig()); //state of config at last save	
		}
		var vals=LilyInspectorWindow.getInspectorValues();
		LilyApp.getCurrentPatch().getObj(LilyInspectorWindow.objID).saveInspector(vals);
		LilyInspectorWindow.saveNames();		
	},

	inspectorConfigBackup: [],	 //copy of the data used for restore	
	inspectorConfig: [],	 //current values	
	objID: null,	//object id
	namesBackup: {}, //for restore.
 	
	//save data, remove listeners
	unloadFloatingInspectorWindow: function() {
		
//		LilyDebugWindow.print("unloading..." + this.isOpen() +" "+ this.isLoaded())

		if(this.isOpen() && this.isLoaded()) {

//			LilyDebugWindow.print("unloading... ");			

			if(!LilyApp.getCurrentPatch().patchController.getHasSelection())	{
				
				this.saveInspector();
				var config=this.inspectorConfig;			

				for(var i=0;i<config.length;i++) {

					if(config[i].input=="radio")
						for(var j=0;j<config[i].options.length;j++)
							this.bWin.document.getElementById(config[i].name+"-radio-"+(j+1)).removeEventListener("change",this.saveInspector,false);
					else
						this.bWin.document.getElementById(config[i].name).removeEventListener("change",this.saveInspector,false);
				}
				
				this.bWin.document.getElementById("groupNameInput").removeEventListener("change",this.saveNames,false);
				this.bWin.document.getElementById("classNameInput").removeEventListener("change",this.saveNames,false);				
				

//				if(config.length){
					this.iWin.removeEventListener("close",this.saveInspector,false);		
					this.iWin.removeEventListener("unload",this.saveInspector,false);
					this.bWin.document.getElementById("revertButton").removeEventListener("click",this.restoreInspectorValues,false);				
//				}
				
									
			}
						
			this.clear();
		}
	},	
	
	getInspectorValues: function() {

		var obj={};
		var changed=false;

		if(!this.isOpen() || !this.isLoaded())
			return obj;	
			
		var config=this.inspectorConfig; //LilyApp.getCurrentPatch().getObj(this.objID).getInspectorConfig();
		
		for(var i=0;i<config.length;i++) {

//			LilyDebugWindow.print("at the top "+config[i].input+" "+config[i].name+" "+config[i].value+" "+changed)			

			if(config[i].input=="radio") {				
				for(var j=0;j<config[i].options.length;j++) {
					var node=this.bWin.document.getElementById(config[i].name+'-radio-'+(j+1));
					if(node.checked && (node.value!=config[i].value)) {
						changed=true;
						obj[config[i].name]=node.value;
						config[i].value=node.value;
//						LilyDebugWindow.print("inside radio "+node.name+" "+node.value+" "+changed);
					}
				}
			} else if(config[i].input=="checkbox") {
				if(config[i].value!=this.bWin.document.getElementById(config[i].name).checked)
					changed=true;

					obj[config[i].name]=this.bWin.document.getElementById(config[i].name).checked;
					config[i].value=this.bWin.document.getElementById(config[i].name).checked;

			} else { //works for html select, textarea, text
				if(config[i].type!="number"&&(config[i].value!=this.bWin.document.getElementById(config[i].name).value))
					changed=true;
				else if(config[i].type=="number"&&(config[i].value!=(+this.bWin.document.getElementById(config[i].name).value)))
					changed=true;

//				LilyDebugWindow.print("outside radio "+config[i].name+" "+config[i].value+" "+changed)				

				config[i].value=(config[i].type!="number")?this.bWin.document.getElementById(config[i].name).value:(+this.bWin.document.getElementById(config[i].name).value);
				obj[config[i].name]=(config[i].type!="number")?this.bWin.document.getElementById(config[i].name).value:(+this.bWin.document.getElementById(config[i].name).value);
			}
		}		

//		LilyDebugWindow.print("getInspectorValues... "+changed+" "+obj.toSource());	

		if(changed) {
			return obj;
		} else {
			return null;
		}	
	},
	
	init: function(id) {

//		if(!this.isOpen()) //if the floating window's not open
//			this.open(); //window.open
			
//		LilyDebugWindow.print("init start... "+id);
		
		if(!this.iWin.document.getElementById("browserInspectorElement"))
			return;
			
		this.iWin.addEventListener("unload",function(){LilyInspectorWindow.reset()},false);	
		this.cWin=this.iWin.document.getElementById("browserInspectorElement");
		this.bWin=this.cWin.contentWindow;				
//		this.iWin.blur();		
		
		if(typeof id == "undefined") //if called without an id...
			return;

		var obj=LilyApp.getCurrentPatch().getObj(id);
		var config=obj.getInspectorConfig(); //get the config to build the html string for the window.
		
//		LilyDebugWindow.print("initing... "+config.toSource());		
		
		this.inspectorConfig=this.cloneInspectorConfig(config);	//save the config, so we have a copy of the original.
		this.objID=id; //save the id

		var display=obj.name; //get the display name
		var groupname=obj.groupName;
		var cssname=obj.cssName;	
		var src=this.generateInspectorHTML(config,display,groupname,cssname); //FIXME - if the config is empty, this should return the default string- currenty its an empty string i think
		
		//save the names for restore.
		this.namesBackup["groupName"]=groupname;
		this.namesBackup["cssName"]=cssname;		
		
//		LilyDebugWindow.print("inspectorConfigSave "+inspectorConfigSave.toSource() + " " + "InspectorConfig "+config.toSource());		

		this.bWin.document.open(); 
		this.bWin.document.write(src); //write to the window

		//only if there's a config length- add element listeners
		for(var i=0;i<config.length;i++) {
			if(config[i].input=="radio")
				for(var j=0;j<config[i].options.length;j++)
					this.bWin.document.getElementById(config[i].name+"-radio-"+(j+1)).addEventListener("change",this.saveInspector,false);
			else
				this.bWin.document.getElementById(config[i].name).addEventListener("change",this.saveInspector,false);
		}

//		if(config.length) { //add window listeners
			
		this.bWin.document.getElementById("groupNameInput").addEventListener("change",this.saveNames,false);
		this.bWin.document.getElementById("classNameInput").addEventListener("change",this.saveNames,false);
		
		var inputArr=this.bWin.document.getElementsByTagName("INPUT");
		for(var i=0;i<inputArr.length;i++) {
			if(inputArr[i].getAttribute("id").indexOf("_button")!=-1) {
				inputArr[i].addEventListener("click",this.pickFile,false);
			}
		}

		this.iWin.addEventListener("close",this.saveInspector,false);		
		this.bWin.addEventListener("beforeunload",this.saveInspector,false);		
		this.bWin.document.getElementById("revertButton").addEventListener("click",this.restoreInspectorValues,false);
		this.bWin.document.getElementById("doneButton").addEventListener("click",function(){LilyInspectorWindow.iWin.close();},false);		
		
//		}
		
		this.bWin.document.close(); //done writing to the window.
		this.loaded=true;
		
		this.iWin.title=this.bWin.document.title; //pass the html title to the xul window.		
		
		if(src) {
			var table=this.bWin.document.getElementById("inspector-layout-table");
			var menuHeight=(LilyUtils.navigatorPlatform()!='apple')?parseInt(this.iWin.getComputedStyle(this.iWin.document.getElementById("lilyInspectorMenuBar"),"").height):0;			
			var statusHeight=parseInt(this.iWin.getComputedStyle(this.iWin.document.getElementById("status_LilyStatusBar"),"").height);			
			var height=table.offsetHeight+(this.iWin.outerHeight-this.iWin.innerHeight)+20+menuHeight+statusHeight;
			var width=table.offsetWidth+(this.iWin.outerWidth-this.iWin.innerWidth)+20;			
//			LilyDebugWindow.print((height)+" "+(width))
			this.iWin.resizeTo(width,height);		
		}	
			
	},
	
	saveNames: function() {
		
		if(!LilyInspectorWindow.isOpen() || !LilyInspectorWindow.isLoaded())
			return;		
		
		var obj=LilyApp.getCurrentPatch().getObj(LilyInspectorWindow.objID);
		var group = LilyInspectorWindow.bWin.document.getElementById("groupNameInput").value;
		var css =LilyInspectorWindow.bWin.document.getElementById("classNameInput").value;

		obj.setGroupName(group);
		obj.setCSSName(css);
		
	},
	
	pickFile: function(e) {
		
		var buttonID = e.target.id;
		var fieldID = buttonID.replace(/_button/,"");
		
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
		                   .createInstance(nsIFilePicker);

		fp.init(window, "Find file to open", nsIFilePicker.modeOpen);
		fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

		var rv = fp.show();	
		if (rv == nsIFilePicker.returnOK) {
			LilyInspectorWindow.bWin.document.getElementById(fieldID).value="file://"+fp.file.path;
		}		
	},	
	
	restoreInspectorValues: function() {

		if(!LilyInspectorWindow.isOpen() || !LilyInspectorWindow.isLoaded())
			return;
			
//		var obj=LilyApp.getCurrentPatch().getObj(LilyInspectorWindow.objID);			

//		var tmpObj={};				
//		var configArr=LilyInspectorWindow.inspectorConfigSave;	//LilyApp.getCurrentPatch().getObj(LilyInspectorWindow.objID).getInspectorConfig();
		var configArr=LilyInspectorWindow.inspectorConfigBackup;
		
//		LilyDebugWindow.print("restore "+configArr.toSource())
//		LilyDebugWindow.print("restore "+obj.groupName+" "+obj.cssName)
				
		//restore the names		
		LilyInspectorWindow.bWin.document.getElementById("groupNameInput").value=LilyInspectorWindow.namesBackup["groupName"];
		LilyInspectorWindow.bWin.document.getElementById("classNameInput").value=LilyInspectorWindow.namesBackup["cssName"];				
		
		for(var i=0;i<configArr.length;i++) {

//			LilyDebugWindow.print(configArr[i].name + " " + inspectorConfigSave[i].value)			

//			configArr[i].value=LilyInspectorWindow.inspectorConfigSave[i].value;

			if(configArr[i].input=="radio") {
				for(var j=0;j<configArr[i].options.length;j++) {
					var node=LilyInspectorWindow.bWin.document.getElementById(configArr[i].name+'-radio-'+(j+1));
					if(node.value==configArr[i].value) {
						node.checked=true;
					} else {
						node.checked=false;
					}
				}
			} else if(configArr[i].input=="checkbox") {

//				LilyDebugWindow.print(inspectorConfigSave[i].value + " " + typeof inspectorConfigSave[i].value)

				LilyInspectorWindow.bWin.document.getElementById(configArr[i].name).checked=configArr[i].value;						
			} else if(configArr[i].input=="select") {

//				LilyDebugWindow.print(inspectorConfigSave[i].value + " " + typeof inspectorConfigSave[i].value)

				var sel = LilyInspectorWindow.bWin.document.getElementById(configArr[i].name);

				for(var k=0;k<sel.options.length;k++)
					if(sel.options[k].value==configArr[i].value)
						sel.selectedIndex=k;

			} else {
				LilyInspectorWindow.bWin.document.getElementById(configArr[i].name).value=configArr[i].value;
			}

//			tmpObj[configArr[i].name]=configArr[i].value;
		}
		
		LilyInspectorWindow.saveInspector();
	}		
		
};

