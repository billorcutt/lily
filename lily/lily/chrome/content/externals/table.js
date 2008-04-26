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
*	Construct a new table object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
function $table(args)
{
	var thisPtr=this;
	
	this.resetSize=false; //don't redraw after a font change, etc.	
		
	this.inlet1 = new this.inletClass("inlet1",this,"urls/text to display, methods: \"setRow\", \"setCell\", \"addRow\", \"setRowColor\", \"setCellColor\", \"getRow\", \"getCell\", \"delRow\", \"reset\"");	
	this.outlet1 = new this.outletClass("outlet1",this,"table values");
	this.outlet2 = new this.outletClass("outlet2",this,"table info");

	var gData = []; //array for all content that is inserted
	
	var gRows = +(args.split(" ")[0])||1;
	var gCols = +(args.split(" ")[1])||1;
	
	this.borderWidth = (typeof args.split(" ")[2]!="undefined")?+(args.split(" ")[2]):1;
	this.textAlign=(args.split(" ")[3])||"left";
	this.cellPadding=+(args.split(" ")[4])||3;
	
	function parseID(id) {
		var arr = id.match(/\.table_(\d+)_(\d+)/);
		return arr.splice(1,2);
	}		
	
	function clickFunc(e) {
		
		if(e.target.id||e.target.parentNode.id) {
			var id = parseID((e.target.id)?(e.target.id):(e.target.parentNode.id));

			var row = id[0];
			var cell = id[1];
			var arr = getContentByRow(row);

			thisPtr.outlet2.doOutlet("click "+id.join(" "));
			
			if(e.target.src)
				thisPtr.outlet1.doOutlet("click "+e.target.src);
			else if(e.target.href)
				thisPtr.outlet1.doOutlet("click "+e.target.href);
			else
				thisPtr.outlet1.doOutlet("click "+arr[cell]);
		}
			
	}
	
	function mouseoverFunc(e) {
		if(e.target.id) {
			var id = parseID(e.target.id);
			thisPtr.outlet2.doOutlet("over "+id.join(" "));	
		}
	}
	
	function mouseoutFunc(e) {
		if(e.target.id) {
			var id = parseID(e.target.id);
			thisPtr.outlet2.doOutlet("out "+id.join(" "));	
		}
	}
	
	function setCellBorder(num) {
		
		var tds=thisPtr.displayElement.getElementsByTagName("td");
		for(var i=0;i<tds.length;i++)
			tds[i].style.borderWidth=num+"px";

	}
	
	function setCellAlign(str) {
		
		var tds=thisPtr.displayElement.getElementsByTagName("td");
		for(var i=0;i<tds.length;i++)
			tds[i].align=str;

	}	
	
	//init
	function initTable(r,c) {
		var str = "";
		str+="<div id=\""+ thisPtr.createElID("table_container") +"\" style=\"overflow:auto;\"><table border=\"0\" cellpadding=\"3\" cellspacing=\"0\" height=\"50\" width=\"50\" id=\""+ thisPtr.createElID("table") +"\">";
		str+=makeRow(r,c);	
		str+="</table></div>";
		return str;
	}
	
	//add mouse event observers
	function addObservers() {
		var r = (gRows>gData.length)?gRows:gData.length;
		for(var i=0;i<r;i++) {
			for(var j=0;j<gCols;j++) {
				var elID = thisPtr.createElID("table") + "_" + i + "_" + j;
				var td = i + " " + j;
				with({id:td}) {
										
					if(thisPtr.parent.patchView.getElByID(elID)) {
						//remove the observers first, so we don't double set
						thisPtr.controller.removeObserver(elID,"click",clickFunc,"performance");
						thisPtr.controller.removeObserver(elID,"mouseover",mouseoverFunc,"performance");
						thisPtr.controller.removeObserver(elID,"mouseout",mouseoutFunc,"performance");					

						//now add them back
						thisPtr.controller.attachObserver(elID,"click",clickFunc,"performance");
						thisPtr.controller.attachObserver(elID,"mouseover",mouseoverFunc,"performance");
						thisPtr.controller.attachObserver(elID,"mouseout",mouseoutFunc,"performance");						
					}
						
				}				
			}
		}
	}
	
	//add mouse event observers
	function removeObservers(el) {
		var r = (gRows>gData.length)?gRows:gData.length;
		for(var i=0;i<r;i++) {
			for(var j=0;j<gCols;j++) {
				var elID = thisPtr.createElID("table") + "_" + i + "_" + j;
				var td = i + " " + j;
				with({id:td}) {

					//remove the observers...
					thisPtr.controller.removeObserver(elID,"click",clickFunc,"performance");
					thisPtr.controller.removeObserver(elID,"mouseover",mouseoverFunc,"performance");
					thisPtr.controller.removeObserver(elID,"mouseout",mouseoutFunc,"performance");					
					
				}				
			}
		}
	}
	
	//reset the ids
	function resetIds(el) {
		var rows = thisPtr.displayElement.getElementsByTagName("tr");
		var r = rows.length; //(gRows>gData.length)?gRows:gData.length;
		for(var i=0;i<r;i++) {
			for(var j=0;j<gCols;j++) {
				var elID = thisPtr.createElID("table") + "_" + i + "_" + j;
				rows[i].getElementsByTagName("td")[j].setAttribute("id",elID);
			}
		}
	}	

	//make a row
	function makeRow(r,c,idx) {
		var str="";
		var index=idx||0;
		//gRows
		for(var i=0;i<r;i++) {
			str+="<tr>";
			//gCols
			for(var j=0;j<c;j++) {
				str+="<td id=\""+ thisPtr.createElID("table") + "_" + index + "_" + j +"\" style=\"border-style:solid;border-width:"+thisPtr.borderWidth+"px;border-color:black\"></td>";
			}
			index++;			
			str+="</tr>";	
		}
		return str;
	}

	function populateTable(argsArr) {
		
		var currRow=gData.length;		
		var trs = thisPtr.displayElement.getElementsByTagName("tr");			
		
		//if the row exists
		if(trs[currRow]!=undefined) {
			insertContent(trs[currRow],null,argsArr);			
		} else {
			//add a row
			thisPtr.displayElement.innerHTML = thisPtr.displayElement.innerHTML + makeRow(1,gCols,currRow);
			insertContent(trs[currRow],null,argsArr);
			resize();
		}
		thisPtr.controller.cleanupOutletConnections();				
		gData.push(argsArr.join(" "));
		addObservers();	
	}
	
	function populateTableFromHash(obj) {
					
		var tmpKeys=[];
		var tmpVals=[];	
			
		for(var i in obj) {
			tmpKeys.push(i);
			tmpVals.push(obj[i]);						
		}
		
		if(!gData.length) {
			populateTable(tmpKeys);			
			populateTable(tmpVals);
		} else if(gData.length && gData[0]==tmpKeys.join(" ")) {
			populateTable(tmpVals);	
		}				
	}
		
	this.inlet1["anything"]=function(str) {
			
		if(LilyUtils.typeOf(str)=="array")
			var argsArr = str;
		else if(LilyUtils.typeOf(str)=="object")
			return populateTableFromHash(str);
		else if(LilyUtils.typeOf(str)=="string")
			var argsArr = LilyUtils.splitArgs(str);
		else
			return;
			
		populateTable(argsArr);
	}
	
	//set content on a row
	this.inlet1["setRow"]=function(args) {
		var params = LilyUtils.splitArgs(args);
		var row = params.shift();
		var trs = thisPtr.displayElement.getElementsByTagName("tr");
		insertContent(trs[row],null,params);
		resize();		
	}
		
	//set color on a row
	this.inlet1["setRowColor"]=function(args) {
		var params = args.split(" ")||[];
		var row = params.shift();
		var trs = thisPtr.displayElement.getElementsByTagName("tr");
		var tds = (trs[row])?trs[row].getElementsByTagName("td"):[];
		
		for(var i=0;i<tds.length;i++)
			if(tds[i])
				tds[i].setAttribute("bgcolor",params);
	}
	
	//get the table length
	this.inlet1["length"]=function() {			
		thisPtr.outlet2.doOutlet(gData.length);
	}
	
	//scroll box
	this.inlet1["scrollTo"]=function(num) {			
		var scrollbox = thisPtr.ui.getElByID(thisPtr.createElID("table_container"));
		scrollbox.scrollTop = parseInt(num);
	}
	
	//scroll box to top
	this.inlet1["scrollTop"]=function(num) {			
		var scrollbox = thisPtr.ui.getElByID(thisPtr.createElID("table_container"));
		scrollbox.scrollTop = 0;
	}
	
	//scroll box to bottom
	this.inlet1["scrollBottom"]=function(num) {			
		var scrollbox = thisPtr.ui.getElByID(thisPtr.createElID("table_container"));
		scrollbox.scrollTop = parseInt(thisPtr.ui.getElByID(thisPtr.createElID("table")).offsetHeight);
	}				
	
	//set color of a cell
	this.inlet1["setCellColor"]=function(args) {
		var params = args.split(" ")||[];
		var row = params.shift();
		var td = params.shift();
		var trs = thisPtr.displayElement.getElementsByTagName("tr");
		var el = (trs[row])?trs[row].getElementsByTagName("td")[td]:null;
		if(el){el.setAttribute("bgcolor",params);}		
	}
	
	//get color of a cell
	this.inlet1["getCellColor"]=function(args) {
		var params = args.split(" ")||[];
		var row = params.shift();
		var td = params.shift();
		var trs = thisPtr.displayElement.getElementsByTagName("tr");
		var el = (trs[row])?trs[row].getElementsByTagName("td")[td]:null;
		if(el){thisPtr.outlet1.doOutlet(el.getAttribute("bgcolor"));}		
	}		
	
	//add a row
	this.inlet1["addRow"]=function() {
		var r = (gRows>gData.length)?gRows:gData.length;		
		thisPtr.displayElement.innerHTML = thisPtr.displayElement.innerHTML + makeRow(1,gCols,(r+1));
		thisPtr.controller.cleanupOutletConnections();		
		addObservers(thisPtr.displayElement);
		resize();		
	}
	
	//set content on a row
	this.inlet1["getRow"]=function(args) {
		var params = args.split(" ")||[];
		var tmp = [];
		var row = params.shift();
		var trs = thisPtr.displayElement.getElementsByTagName("tr");
		var tds = trs[row].getElementsByTagName("td");
		for(var i=0;i<tds.length;i++)
			tmp.push(LilyUtils.html2String(tds[i].innerHTML));
			
		thisPtr.outlet1.doOutlet(tmp);
	}
	
	//set content on a row
	this.inlet1["getCol"]=function(args) {
		var params = args.split(" ")||[];
		var arr = [];
		var col = params.shift();
		//FIXME ********** all these getElementsByTagName(tr's & td's) cause a problem if you insert a table into this table
		var trs = thisPtr.displayElement.getElementsByTagName("tr");
		for(var i=0;i<trs.length;i++)
			arr.push(LilyUtils.html2String(trs[i].getElementsByTagName("td")[col].innerHTML));
			
		thisPtr.outlet1.doOutlet(arr);
	}	
	
	//set content on a row
	this.inlet1["getCell"]=function(args) {
		var params = args.split(" ")||[];
		var row = params.shift();
		var td = params.shift();
		var trs = thisPtr.displayElement.getElementsByTagName("tr");
		var el = trs[row].getElementsByTagName("td")[td];
		thisPtr.outlet1.doOutlet(LilyUtils.html2String(el.innerHTML));
	}
	
	function getContentByRow(row) {
		var tmp = [];
		var trs = thisPtr.displayElement.getElementsByTagName("tr");
		var tds = trs[row].getElementsByTagName("td");
		for(var i=0;i<tds.length;i++)
			tmp.push(LilyUtils.html2String(tds[i].innerHTML));
		return tmp;
	}				
	
	//delete row
	this.inlet1["delRow"]=function(args) {
		
		//bail if negative
		if(parseInt(args)<0)
			return;
		
		var row = thisPtr.displayElement.getElementsByTagName("tr")[(+args)]||null;
		if(row) {
			removeObservers();
			thisPtr.displayElement.removeChild(row);
			thisPtr.controller.cleanupOutletConnections();				
			gData.splice((+args),1); //remove the data.
			resetIds();			
 			addObservers();
			resize();			
		}
	}	
	
	//set content on a cell
	this.inlet1["setCell"]=function(args) {
		var params = args.split(" ")||[];
		var row = params.shift();
		var td = params.shift();
		var trs = thisPtr.displayElement.getElementsByTagName("tr");
		insertContent(trs[row],td,params.join(" "));
		resize();
	}
		
	//reset to the initial state	
	this.inlet1["reset"]=function(str) {
		removeObservers();
		thisPtr.displayElement.innerHTML = makeRow(gRows,gCols);
		thisPtr.controller.cleanupOutletConnections();	
		gData = [];
		addObservers();
		resize();	
	}				
	
	//stick it in.
	function insertContent(row,td,args) {
		
		if(row) {
			//grab the tds
			var tds = row.getElementsByTagName("td");
			if(td) {
				tds[td].innerHTML=LilyUtils.makeSafe(args);
			} else {
				//stick the content in
				for(var i=0;i<tds.length;i++) {
					if(args[i]!=undefined){
						tds[i].innerHTML=LilyUtils.makeSafe(args[i]);
					}
				}
			}	
		}	
	}

	this.setInspectorConfig([
		{name:"borderWidth",value:thisPtr.borderWidth,label:"Border Width",type:"string",input:"text"},
		{name:"textAlign",value:thisPtr.textAlign,label:"Text Align",type:"string",options:[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"}],input:"select"},		
		{name:"cellPadding",value:thisPtr.cellPadding,label:"Cell Padding",type:"string",input:"text"}
	]);	
	
	//save the values returned by the inspector- returned in form {valueName:value...}
	//called after the inspector window is saved
	this.saveInspectorValues=function(vals) {
		
		//update the local properties
		for(var x in vals)
			thisPtr[x]=vals[x];
			
		//update the arg str
		this.args=""+gRows+" "+gCols+" "+vals["borderWidth"]+" "+vals["textAlign"]+" "+vals["cellPadding"];
		
		applyInspectorValues();

	}

	function applyInspectorValues() {
		setCellBorder(thisPtr.borderWidth);	
		setCellAlign(thisPtr.textAlign);
		thisPtr.displayElement.cellPadding=parseInt(thisPtr.cellPadding);	
	}
	
	function resize() {
		thisPtr.controller.objResizeControl.cb(thisPtr.height,thisPtr.width);
		setCellAlign(thisPtr.textAlign);
	}
	
	function scrollPadding() {
		if((parseInt(thisPtr.resizeElement.scrollHeight)-parseInt(thisPtr.resizeElement.offsetHeight))>0) {
			return 16;
		} else {
			return 0;
		}		
	}

	//custom html
	this.ui=new LilyObjectView(this,initTable(gRows,gCols));
	this.ui.draw();
	
	this.displayElement=this.ui.getElByID(this.createElID("table"));
	this.resizeElement=this.displayElement.parentNode;
	
	this.controller.objResizeControl.cb=function(h,w) {
		thisPtr.displayElement.setAttribute("height",(parseInt((h))+"px"));
		thisPtr.displayElement.setAttribute("width",(parseInt((w-scrollPadding()))+"px"));	
	}	

	//clean up
	this.destructor=function() {
		removeObservers();
	}
	
	//apply values	
	applyInspectorValues();		
	
	//add listeners for clicks
	addObservers(this.displayElement);
	
	//resize the inner table on load.
	thisPtr.controller.patchController.attachPatchObserver(thisPtr.objID,"patchLoaded",function(){
		thisPtr.controller.objResizeControl.cb(thisPtr.height,thisPtr.width);
	},"all");
	
	this.controller.setNoBorders((this.borderWidth==0)?true:false); //no object border if table borders == 0
		
	return this;
}

var $tableMetaData = {
	textName:"table",
	htmlName:"table",
	objectCategory:"UI",
	objectSummary:"Display text in an HTML table.",
	objectArguments:"rows[1], columns [1], border width [1], text align [left], cellpadding [3]"
}