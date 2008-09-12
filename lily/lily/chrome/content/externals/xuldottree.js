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
*	Construct a new calendar object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $xuldottree(args)
{
	var thisPtr=this;
	
	var gData = []; //array for all content that is inserted
	var gColLabels = (args)?LilyUtils.splitArgs(args):[""]; //array of column header labels
	var gCols = []; //array of header nodes.
	
	var gSortColIdx = -1;
	var gSortColLabel = "";
	var gSortDir = "ascending";
	
	var removing = false;
	
	var aTree = null; //pointer to the tree itself
	var aTreeChildren = null; //pointer to the tree children element.
	
	var win = null; //pointer to the xul element
	var doc = null; //pointer to the iframe content document

	this.inlet1=new this.inletClass("inlet1",this, "list content to display, \"clear\", \"setHeaders\", \"delete\"");	
	this.outlet1 = new this.outletClass("outlet1",this,"tree value");
	this.outlet2 = new this.outletClass("outlet2",this,"tree info");	
	this.ui={};	
			
	function initTable() {
		
		//get the window element
		var doc_path = (iframe.objFrame.contentWindow.document)?iframe.objFrame.contentWindow.document:iframe.objFrame.contentWindow.wrappedJSObject.document;
		win = doc_path.getElementsByTagName("window")[0]; //set up the pointers
		doc = doc_path; //get the doc
		
		makeTable(gColLabels.length); //use the column labels to set the number of cols.
	}
	
	function selectFunc() {
		if(!removing) {
			thisPtr.outlet2.doOutlet(aTree.currentIndex);
			thisPtr.outlet1.doOutlet(gData[aTree.currentIndex]);	
		}
	}
	
	function toggleSortDir() {
		if(gSortDir=="ascending")
			gSortDir="descending";
		else
			gSortDir="ascending";
	}
	
	function clickFunc(e) {
				
		var idx = (+(e.target.id.charAt(e.target.id.length-1))-1);
		if(idx==gSortColIdx){ toggleSortDir(); } //if its a click on the same header, toggle it
		
		for(var i=0;i<gCols.length;i++) {
			if(i==idx){
				gCols[i].setAttribute("sortDirection",gSortDir);
			}else{
				gCols[i].setAttribute("sortDirection","");
			}	
		}
		
		gSortColIdx=idx;
		gSortColLabel=gCols[idx].getAttribute("label");
		
		doSort();
		
	}
	
	function doSort() {
		
		gData.sort(function(a,b) {
			
			if(gSortDir=="ascending") {
			   if (a[gSortColLabel] < b[gSortColLabel])
			      return -1;
			   if (a[gSortColLabel] > b[gSortColLabel])
			      return 1;			
			   // a must be equal to b
			   return 0;	
			} else {
			   if (a[gSortColLabel] > b[gSortColLabel])
			      return -1;
			   if (a[gSortColLabel] < b[gSortColLabel])
			      return 1;			
			   // a must be equal to b
			   return 0;	
			}
						
		});
		
		redrawTable(gData);
	}
	
	function redrawTable() {
		
		var rows = aTreeChildren.getElementsByTagName("treerow");
		var headers = aTree.getElementsByTagName("treecol");
		
		for(var i=0;i<rows.length;i++) {
			var cells = rows[i].getElementsByTagName("treecell");			
			for(var j=0;j<cells.length;j++) {
				cells[j].setAttribute("label",gData[i][headers[j].getAttribute("label")])
			}
		}
		
	}
	
	function makeTable(columns) {
				
		//create tree and add it.
		var tree = doc.createElement("tree");
		tree.setAttribute("flex",1);
		tree.setAttribute("enableColumnDrag",true);
		tree.setAttribute("style","font-size: 12px;font-family:verdana,DejaVu Sans,sans-serif");													
		aTree = win.appendChild(tree);
		aTree.addEventListener("select",selectFunc,false); //add a select listener. 
		
		var cols = doc.createElement("treecols");
		var aCols = aTree.appendChild(cols);
		
		for(var i=0;i<columns;i++) {
			//create columns
			var col = doc.createElement("treecol");
			col.setAttribute("flex",1);			
			col.setAttribute("id","treeHeader"+(i+1));
			
			if(i==gSortColIdx) {
				//col.setAttribute("class","sortDirectionIndicator");			
				col.setAttribute("sortDirection",gSortDir);							
			}
			
			if(typeof gColLabels[i] != "undefined") { col.setAttribute("label",LilyUtils.stripQuotes(gColLabels[i])); }
			var aCol = aCols.appendChild(col);	//save a ref to the headers
			aCol.addEventListener("click",clickFunc,false);
			gCols.push(aCol);
			
			var splitter = doc.createElement("splitter");
			splitter.setAttribute("class","tree-splitter");
			aCols.appendChild(splitter);
		}
		
		//add an empty
		var children = doc.createElement("treechildren");
		aTreeChildren = aTree.appendChild(children);
		
	}
	
	//add a data row.
	function makeDataRow(arr) {
		var headers = aTree.getElementsByTagName("treecol");		
		var tmp = {};
		for(var i=0;i<arr.length;i++) {
			tmp[headers[i].getAttribute("label")]=LilyUtils.convertType(arr[i]); //convert to correct type before storing it
		}
		
		gData.push(tmp);
	}
	
	function resetSortDisplay() {
		gSortColIdx = -1;
		gSortColLabel = "";
		gSortDir = "ascending";		
		for(var i=0;i<gCols.length;i++) {
			gCols[i].setAttribute("sortDirection","");	
		}	
	}
	
	function resetModel() {
		gData = [];
	}
	
	function removeChildren() {
		var rows = aTreeChildren.childNodes;
		for(var i=0;i<rows.length;i++) {
			aTreeChildren.removeChild(rows[i]);
			i--;
		}
		resetModel();
		resetSortDisplay();		
	}
	
	//make a row
	function makeRow(arr) {
	
		//make tree item
		var item = doc.createElement("treeitem");
		var aItem = aTreeChildren.appendChild(item);
	
		//make tree row
		var row = doc.createElement("treerow");
		var aRow = aItem.appendChild(row);			
	
		//gCols
		for(var j=0;j<gColLabels.length;j++) {
			//make the cells
			var cell = doc.createElement("treecell");
			if(typeof arr[j]!="undefined") { cell.setAttribute("label",LilyUtils.stripQuotes(arr[j])) }				
			var aCell = aRow.appendChild(cell);
		}

	}
	
	/*
	//get a row values
	function getRow(index) {
		
		var tmp = [];
		var row = aTree.getElementsByTagName("treerow")[index];
		
		if(row) {
			var cells = row.getElementsByTagName("treecell");
			if(cells) {
				for(var i=0;i<cells.length;i++) {
					tmp.push(cells[i].getAttribute("label"));
				}
			}	
		}
		
		return tmp;
		
	}
	*/
	
	function setHeaders(arr) {
		for(var i=0;i<gCols.length;i++) {
			gCols[i].setAttribute("label",LilyUtils.stripQuotes(arr[i]));	
		}
	}
	
	function getKeys(obj) {
		var str = "";
		for(var x in obj)
			str += x + " ";
			
		str = LilyUtils.strip(str);
		return str;	
	}
	
	function removeAtIndex(idx) {
		var rows = aTreeChildren.childNodes;
		if(gData[idx]) { gData.splice(idx,1); }		
		if(rows[idx]) { aTreeChildren.removeChild(rows[idx]); }
	}
	
	this.inlet1["obj"]=function(obj) {
		
		var tmp = []; //placeholder to stick the data.
		
		if(gData.length==0 && !(/\w/.test(gColLabels.join("")))) { //if there's no rows && no headers yet.
			var str = getKeys(obj); //pull the keys out to use as header labels
			var arr = str.split(" "); //make an array of it
			setHeaders(arr); //set the header labels
		}
				
		for(var i=0;i<gCols.length;i++) {
			if(typeof obj[gCols[i].getAttribute("label")] != "undefined")
				tmp.push(LilyUtils.stripQuotes(obj[gCols[i].getAttribute("label")]+"")); //store the data corresponding to the headers
		}

		gData.push(obj);
		makeRow(tmp);
		
	}	
	
	this.inlet1["setHeaders"]=function() {
		var arr = LilyUtils.splitArgs(str);
		setHeaders(arr);
	}
	
	this.inlet1["delete"]=function(idx) {
		removing=true;		
		removeAtIndex(idx);
		removing=false;		
	}		
	
	this.inlet1["clear"]=function() {
		removing=true;
		removeChildren();
		removing=false;		
	}	
	
	this.inlet1["anything"]=function(str) {
		var arr = LilyUtils.splitArgs(str);
		makeDataRow(arr);
		makeRow(arr);
	}
	
	var iframe=new LilyComponents._iframe(this,"chrome://lily/content/lib/base.xul",200,200,"no",frameInit);
	
	function frameInit() {
		initTable();
	}

	return this;
}

var $xuldottreeMetaData = {
	textName:"xul.tree",
	htmlName:"xul.tree",
	objectCategory:"Interaction",
	objectSummary:"Display data in a table.",
	objectArguments:""
}