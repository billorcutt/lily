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
	Script: model.js
		Contains LilyModel.
		
	Author:
		Bill Orcutt
		
	License:
		MIT-style license.
*/	

/*				
	Class: LilyModel
		Constructs a new LilyModel instance.
		
	Arguments:
		parent - the parent patch.
*/

function LilyModel(parent)
{
	/*
		Property: patch
			pointer to the parent patch object.
	*/
	this.patch=parent;
	
	/*
		Property: objArray
			hash of all instantiated objects
	*/
	this.objArray={};
	
	/*
		Property: subPatchArray
			hash of all instantiated objects
	*/
	this.subPatchArray={};	

	/*
		Method: reset
			resets the model
	*/
	this.reset=function() { this.objArray={}; }
	
	/*
		Method: serializeDom
			serializes the model
		
		Arguments:
			copying - boolean indicating whether we're serializing as part of a copy.
			
		Returns:
			JSON.
	*/
	this.serializeDom=function(copying) {
		
		var j="";
		var oBrace="{";
		var cBrace="}";
		var oBracket="[";
		var cBracket="]";		
		var quote="'";
		var colon=":";
		var comma=",";
		var newline="\n";
		var tab="\t";
		var copy=copying||false;
		var counter=0;
		
		j+="var patch="+oBrace;

		j+="'version':"+quote+LilyApp.version+quote+comma;
		j+="'platform':"+quote+LilyUtils.navigatorPlatform()+quote+comma; //save platform
		j+="'title':"+quote+this.patch.title+quote+comma;
		j+="'width':"+this.patch.width+comma;
		j+="'height':"+this.patch.height+comma;
		j+="'color':"+quote+this.patch.color+quote+comma;
		j+="'mode':"+quote+this.patch.patchController.editable+quote+comma;	
		j+="'description':"+quote+this.patch.description+quote+comma;
		j+="'category':"+quote+this.patch.category+quote+comma;			
		j+="'heightInSubPatch':"+quote+this.patch.heightInSubPatch+quote+comma;	
		j+="'widthInSubPatch':"+quote+this.patch.widthInSubPatch+quote+comma;								
		
		j+="'objArray':"+oBrace;
		
		for(var x in this.objArray)
		{			
			if((!copy || (this.objArray[x].getIsSelected()==copy)) && (!this.objArray[x].subPatcherID)) {
				j+=newline+tab+quote+x+quote+colon+oBrace;
				counter++;
			} else {
				continue;
			}
			
			if(this.objArray[x].getObjectType()=="object") {			
				j+="'name':"+quote+this.objArray[x].name+quote+comma;
				j+="'top':"+this.objArray[x].top+comma;
				j+="'left':"+this.objArray[x].left+comma;
				j+="'color':"+quote+this.objArray[x].color+quote+comma;
				j+="'fontSize':"+quote+this.objArray[x].fontSize+quote+comma;
				j+="'fontFamily':"+quote+this.objArray[x].fontFamily+quote+comma;
				j+="'fontColor':"+quote+this.objArray[x].fontColor+quote+comma;				
				j+="'borderWidth':"+quote+this.objArray[x].borderWidth+quote+comma;
				j+="'borderStyle':"+quote+this.objArray[x].borderStyle+quote+comma;
				j+="'borderColor':"+quote+this.objArray[x].borderColor+quote+comma;							
				j+="'opacity':"+this.objArray[x].opacity+comma;
				j+="'zIndex':"+this.objArray[x].zIndex+comma;
				j+="'height':"+this.objArray[x].height+comma;
				j+="'width':"+(parseInt(this.objArray[x].width)-((this.objArray[x].getIsSelected())?2:0))+comma; //subtract 3px if the object is selected.
				j+="'visibility':"+quote+this.objArray[x].visibility+quote+comma;
				j+="'hiddenInPerf':"+this.objArray[x].hiddenInPerf+comma;
				j+="'groupName':"+quote+this.objArray[x].groupName+quote+comma;
				j+="'cssName':"+quote+this.objArray[x].cssName+quote+comma;
				j+="'customColor':"+quote+this.objArray[x].customColor+quote+comma;
				j+="'customBorder':"+quote+this.objArray[x].customBorder+quote+comma;					
				j+="'hasBeenResized':"+quote+this.objArray[x].hasBeenResized+quote+comma;					
																																											
				if(this.objArray[x].args)
					j+="'args':"+quote+LilyUtils.escape(this.objArray[x].args)+quote+comma; //copy in additional creation args
				
				if(this.objArray[x].inspectorConfig.length) {
					j+="'inspectorConfig':";	//+ oBracket + newline;
					j+=this.objArray[x].inspectorConfig.toSource();
					j+=comma;
				}
				
				//just for coll				
				if(this.objArray[x].gColl&&this.objArray[x].saveData) {
					j+="'collData':";
					j+=this.objArray[x].gColl.toSource();
					j+=comma;
				}
				
				//just for subpatches				
				if(this.objArray[x].fPath) {
					j+="'fPath':";
					j+=quote+this.objArray[x].fPath+quote;
					j+=comma;
				}				
				
				j+="'objID':"+quote+x+quote+comma;
				j+="'type':"+quote+'object'+quote;			
			} 
			else if(this.objArray[x].getObjectType()=="connection")	{
			
				j+="'inlet':"+quote+this.objArray[x].inlet+quote+comma;
				j+="'outlet':"+quote+this.objArray[x].outlet+quote+comma;
				j+="'type':"+quote+'connection'+quote+comma;
				j+="'hiddenInPerf':"+this.objArray[x].hiddenInPerf+comma;				
				j+="'segmentArray':" + oBracket + newline
				
				for(var y=0;y<this.objArray[x].segmentArray.length;y++) {
				
					j+=oBrace;
					j+="'orientation':" + quote + this.objArray[x].segmentArray[y].orientation + quote + comma;
					j+="startLeft:" + this.objArray[x].segmentArray[y].startLeft + comma;
					j+="startTop:" + this.objArray[x].segmentArray[y].startTop + comma;
					j+="endLeft:" + this.objArray[x].segmentArray[y].endLeft + comma;
					j+="endTop:" + this.objArray[x].segmentArray[y].endTop;
					j+=cBrace;
					
					if(y<this.objArray[x].segmentArray.length-1)
						j+= comma;
						
					j+=newline;
				}
				j+=cBracket+newline; //close segment array bracket
			}
			j+=cBrace+comma; //close obj brace
		}
		if(counter>0) {	
			j=j.substring(0,j.length-1); //remove final comma
		} else {
			j+="";
		}
		j+=cBrace;				
		j+=newline+cBrace;
		
		return j;
	}
	
	/*
		Method: addSubPatch
			adds an subpatch to the model.
			set subpatch load state.

		Arguments: 
			id - the subpatch id
			obj - the object
			
		Returns:
			returns true if all patches are loaded, false otherwise			
	*/
	this.addSubPatch=function(id,load_state,patch_object) {
		this.subPatchArray[id]={loaded:load_state,obj:patch_object};		
		return this.getLoadState();
	}
	
	/*
		Method: getLoadState
			get the patch load state.

		Returns:
			returns true if all patches are loaded, false otherwise
	*/
	this.getLoadState=function() {
		for(var x in this.subPatchArray) {
			if(!this.subPatchArray[x].loaded)
				return false;
		}
		return true;
	}
	
	/*
		Method: addNode
			adds an object to the model.

		Arguments: 
			elID - the object id
			obj - the object.
	*/
	this.addNode=function(elID,obj) {
		this.objArray[elID]=obj;
	}
	
	/*
		Method: addAttribute
			add or modify an object attribute.
	
		Arguments: 
			elID - the object id
			attr - the attribute name
			val - the attribute value

	*/
	this.addAttribute=function(elID,attr,val) { 
		this.objArray[elID][attr]=val;
	 }
	
	/*	
		Method: removeNode
			remove an object from the model.

		Arguments: 
			objID - the object id	
	*/
	this.removeNode=function(objID) {
		delete this.objArray[objID];
	}
	
	/*	
		Method: getObjConnections
			return all connections for the supplied id
	
		Arguments: 
			id - the object id.
			
		Returns: 
			array of all connection objects
	*/
	this.getObjConnections=function(id) {
		var tmpArr=[];
		for(var x in this.objArray) {
			if(x.indexOf(id)!=-1 && this.objArray[x].getObjectType()=="connection")
				tmpArr.push(this.objArray[x]);
		}
		return tmpArr;
	}

	/*	
		Method: getNode
			get the object.
		
		Arguments: 
			elID - the object id.
		
		Returns: 
			returns object
	*/
	this.getNode=function(elID) {
		
		if(elID && elID.indexOf(".")!=-1 && elID.indexOf("_")==-1)	{
			var outletEl=elID.split(".")[0];	
			var outletID=elID.split(".")[1];	
			if(this.objArray[outletEl]&&this.objArray[outletEl][outletID])
				return this.objArray[outletEl][outletID];
			else
				return null;
		} else if(elID) {
			if(this.objArray[elID])
				return this.objArray[elID];
			else
				return null;
		}		
	}
	
	/*
		Method: getObjectCoords
			get the coordinates of all objects.	
	
		Returns: 
			array of coordinates objects in the form- {id,left,top,height,width}
	*/
	this.getObjectCoords=function() {
		var tmp=[];
		for(var x in this.objArray) {
			if(this.objArray[x].getObjectType()=="object") {
				tmp.push({
					id:this.objArray[x].objID,
					left:this.objArray[x].left,
					top:this.objArray[x].top,
					height:this.objArray[x].height,
					width:this.objArray[x].width
				});
			}	
		}
		return tmp;
	}

	/*
		Method: getAllObjects
			return array of all objects
		
		Returns: 
			array of all objects	
	*/
	this.getAllObjects=function() {
		var tmp=[];
		for(var x in this.objArray) {
			if(this.objArray[x].getObjectType()=="object") {
				tmp.push(this.objArray[x]);
			}	
		}
		return tmp;
	}
	
	/*	
		Method: getAllObjectIDs
			get all object ids
	
		Returns: 
			array of all objects ids
	*/
	this.getAllObjectIDs=function() {
		var tmp=[];
		for(var x in this.objArray) {
			if(this.objArray[x].getObjectType()=="object") {
				tmp.push(x);
			}	
		}
		return tmp;
	}
	
	/*
		Method: getObjectsByClass
			get all objects of a certain class
		
		Arguments: 
			name - the object class name.
			
		Returns: 
			returns array of objects
	*/
	this.getObjectsByClass=function(name) {
		var tmp=[];
		for(var x in this.objArray) {
			var obj=this.objArray[x];
			if((obj.getObjectType()=="object") && (obj.displayName==name || !name)) {
				tmp.push(obj);
			}	
		}
		return tmp;	
	}
	
	/*
		Method: getObjectsByGroupName
			get all objects having a given group id
	
		Arguments: 
			group - the object group name- passing null returns all objects
	
		Returns: 
			returns array of objects	
	*/
	this.getObjectsByGroupName=function(group) {
		var tmp=[];
		for(var x in this.objArray) {
			var obj=this.objArray[x];
			if((obj.getObjectType()=="object") && (obj.groupName==group || !group)) {
				tmp.push(obj);
			}	
		}
		return tmp;	
	}
	
	/*
		Method: getObjectsIDsByGroupName
			get all object ids having a given group id
	
		Arguments: 
			group - the object group name- passing null returns all object ids
		
		Returns: 
			returns array of object ids
	*/
	this.getObjectsIDsByGroupName=function(group) {
		var tmp=[];
		for(var x in this.objArray) {
			var obj=this.objArray[x];
			if((obj.getObjectType()=="object") && (obj.groupName==group || !group)) {
				tmp.push(obj);
			}	
		}
		return tmp;	
	}	

	/*
		Method: getSelected
			return array of everything thats selected
		
		Returns: 
			returns array of objects & connections
	*/
	this.getSelected=function() {
		var tmp=[];
		for(var x in this.objArray) {
			if(this.objArray[x].getIsSelected()) {
				tmp.push(x);
			}	
		}
		return tmp;
	}
	
	/*
		Method: getSelectedObjects
			return array of just the selected objects
		
		Returns: 
			returns array of objects
	*/
	this.getSelectedObjects=function() {
		var tmp=[];
		for(var x in this.objArray) {
			if(this.objArray[x].getIsSelected()&&this.objArray[x].getObjectType()=="object") {
				tmp.push(x);
			}	
		}
		return tmp;
	}
	
	/*
		Method: getSelectedConnections
			return array of just the selected connections
		
		Returns: 
			returns array of objects
	*/
	this.getSelectedConnections=function() {
		var tmp=[];
		for(var x in this.objArray) {
			if(this.objArray[x].getIsSelected()&&this.objArray[x].getObjectType()=="connection") {
				tmp.push(x);
			}	
		}
		return tmp;
	}	
	
	/*
		Method: getObjectCount
			return an object count
		
		Returns: 
			return an object count
	*/
	this.getObjectCount=function() {
		var tmp=0;
		for(var x in this.objArray) {
			if(this.objArray[x].getObjectType()=="object") {
				tmp++
			}	
		}
		return tmp;
	}	
				
	
	/*
		Method: getPatchDependencies
			return an array of all the object class names & subpatch file paths used in the patch
		
		Returns: 
			returns an array of class names
	*/
	this.getPatchDependencies=function() {
		
		var classArr=[]; //array for class names
		var subPatchArr=[]; //array for subpatch file paths
		var tmpObj={};
		
		//helper- save the class names
		function saveClassNames(name) {
			tmpObj[("_"+name)]=name;
			classArr.push({name:name,source:LilyObjectList.search(name).sourceCode});
		}
		
		//helper- pull the class names from a patch string
		function processPatchString(str) {
			try {
				eval(str);
			} catch(e) {
				LilyDebugWindow.error("Couldn't eval subpatch json")
			}
			
			processObjectArray(patch.objArray); //get recursive 
		}
		
		//helper 
		function processObjectArray(objArr) {			
			for(var x in objArr) {	
				//if patcher and is a patch string
				if(objArr[x].name=="patcher" && LilyUtils.isPatchString(objArr[x].args)) {
					saveClassNames(objArr[x].name);						
					processPatchString(objArr[x].args); //get the class names
				//is a subpatch	
				} else if(objArr[x].name=="subpatch" || (objArr[x].name=="patcher" && objArr[x].fPath) || objArr[x].name=="wow") {
					subPatchArr.push(objArr[x].fPath); //save the file path
					saveClassNames(objArr[x].name);						
					var pStr = LilyUtils.readFileFromPath(LilyUtils.getFilePath(objArr[x].fPath),false).data; //get the patch string from file
					processPatchString(pStr); //get the class names
				///something else	
				} else if(objArr[x].type=="object" && typeof tmpObj[("_"+objArr[x].name)]=="undefined") {
					saveClassNames(objArr[x].name);	
				}
			}
		}	
		
		processObjectArray(this.objArray); //kick it off

		return {classes:classArr,subPatches:subPatchArr}; //all done
	}
	
}