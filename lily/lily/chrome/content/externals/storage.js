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
*	Construct a new storage object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $storage()
{
	var thisPtr=this;
	this.outlet1 = new this.outletClass("outlet1",this,"query result");
	this.inlet1=new this.inletClass("inlet1",this,"\"open\" opens a db, \"execute\" executes a sql statement, \"close\" closes the open db");	
	
	var currentDBFile=null;
	var currentConnection=null;

	this.inlet1["open"]=function(db) {
		
		if(currentConnection) {
			LilyDebugWindow.error("database already open.");
			return;
		}		
		
		var fileName=db+".sqlite";
		
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
		                     .getService(Components.interfaces.nsIProperties)
		                     .get("ProfD", Components.interfaces.nsIFile);
		
		try {
			file.append(fileName);	
		} catch (e) {
			LilyDebugWindow.error(e.name + ": " + e.message);
			return;
		}
		
		if(!file.exists()) {   // if it doesn't exist, create		
			try {
			   file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);	
			} catch (e) {
				LilyDebugWindow.error(e.name + ": " + e.message);
				return;
			}
		}
		
		currentDBFile=file;		

		var storageService = Components.classes["@mozilla.org/storage/service;1"]
		                        .getService(Components.interfaces.mozIStorageService);
		
		try {
			currentConnection=storageService.openDatabase(file);	
		} catch (e) {
			LilyDebugWindow.error(e.name + ": " + e.message);
			return;
		}
		
	}
	
	this.inlet1["execute"]=function(sql) {
		
		//LilyDebugWindow.print("sql is" + sql)
		if(!currentConnection) {
			LilyDebugWindow.error("no open database.");
			return;
		}
		
		try {
			var statement=currentConnection.createStatement(sql);
		} catch(e) {
			LilyDebugWindow.error(currentConnection.lastErrorString);
			return;
		}
		
		while (statement.executeStep()) {
			var tmpObj={};
			for(var i=0;i<statement.columnCount;i++) { //build the row
				try {
					tmpObj[statement.getColumnName(i)]=statement.getString(i);	
				} catch (e) {
					LilyDebugWindow.error(currentConnection.lastErrorString);
				}
			}
			thisPtr.outlet1.doOutlet(tmpObj);	
		}
		
		try {
			statement.reset();	
		} catch (e) {
			LilyDebugWindow.error(currentConnection.lastErrorString);	
		}
	}
	
	this.inlet1["close"]=function() {
		currentDBFile=null;
		currentConnection=null;	
	}
	
	return this;
}

var $storageMetaData = {
	textName:"storage",
	htmlName:"storage",
	objectCategory:"Data",
	objectSummary:"Store and retrieve data using a SQLite database.",
	objectArguments:""
}