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
	Class: LilyAPIKeyManager
		Manage API Keys for objects that require them.
*/
var LilyAPIKeyManager= {
	
	keys:null,
	keysObj:null,
	keyPath:null,

	/*
		Method: initKeys
			load the key file from disk and into memory.
	*/
	initKeys:function() {
		var pathToKeys = LilyApp.installDir.clone();
		pathToKeys.append("chrome");		
		pathToKeys.append("content");
		pathToKeys.append("config");		
		pathToKeys.append("keys.txt");
		this.keyPath=pathToKeys.path;
		this.keys=LilyUtils.readFileFromPath(pathToKeys.path);
		this.keysObj=eval("("+this.keys.data+")");
	},
	
	/*
		Method: saveKeys
			save the key file to disk.
	*/
	saveKeys:function() {		
		var file = LilyUtils.getFileHandle(this.keyPath);
		LilyUtils.writeDataToFile(file,this.keysObj.toSource());
	},	

	/*
		Method: getKey
			get a key.
			
		Arguments: 
			keyType - the api key name	
	
		Returns: 
			returns key if found else return null.
	*/
	getKey:function(keyType) {
		
		var keyValue = this.keysObj[keyType].key;

		if(keyValue!=undefined&&keyValue!="") {
			return keyValue;
		} else {
			this.keyNotFound(keyType);
			return null;
		}
		
	},
	
	/*
		Method: getKeyObject
			return the key hash.
	
		Returns: 
			returns the key object.
	*/
	getKeyObject:function() {		
		return this.keysObj;
	},	

	/*
		Method: keyNotFound
			print an key manager error message.
			
		Arguments: 
			keyType - the api key name
	*/
	keyNotFound:function(keyType) {
		LilyDebugWindow.error(keyType + " not found.");
	},	

	/*
		Method: setKey
			set a key value.
			
		Arguments: 
			keyType - the api key hash key
			keyValue - the api key value
			keyURL - the api key url
			keyLabel - the api key label
	*/
	setKey:function(keyType,keyValue,keyURL,keyLabel) {
			
		if(keyType) {
			
			if(typeof this.keysObj[keyType]=="undefined") {
				this.keysObj[keyType]={};
			}
			
			if(keyValue)
				this.keysObj[keyType].key=keyValue;
				
			if(keyURL)
				this.keysObj[keyType].url=keyURL;	
				
			if(keyLabel)
				this.keysObj[keyType].label=keyLabel;							
				
		}	
	},

	/*
		Method: addNewKeyType
			print an key manager error message.
			
		Arguments: 
			type - the api key name
			val - the api key value			
	*/
	addNewKeyType:function() {
		//do stuff
	}	
	
}