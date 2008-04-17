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
*	Construct a new marquee object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//need to expand this example with various typed messages
function $marquee()
{
	var thisPtr=this;	
	
	var marquee1 = null; //front
	var marquee2 = null; //back
	var marquee = null; //container	
	var currDiv = 1;
	var timer = null;
	var runningArr = [false,false];
	var messageArr = [];
	var currIdx = 0;
	
	this.color = "transparent";
	
//	this.outlet1 = new this.outletClass("outlet1",this,"help text describing this outlet");
	this.inlet1=new this.inletClass("inlet1",this,"text to display. methods: \"nofade\", \"visibleColor\", \"color\", \"fade\", \"bang\"");	
	this.inlet2=new this.inletClass("inlet2",this,"text array to display, \"clear\" resets array");	
	this.outlet2 = new this.outletClass("outlet2",this,"bang on complete");
	this.outlet1 = new this.outletClass("outlet1",this,"output text on click");	
	
	this.inlet2["obj"]=function(arr) {
		messageArr=arr;
		currIdx = 0;
	}
	
	this.inlet2["clear"]=function() {
		messageArr=[];
		currIdx=0;
		load("",0);
	}
	
	this.inlet1["nofade"]=function(src) {
		if(notRunning()) {
			load(src,1);
		}	
	}	
	
	this.inlet1["obj"]=function(obj) {
		if(notRunning() && typeof obj["title"]!="undefined") {
			load(obj["title"]);
		}	
	}	
			
	this.inlet1["anything"]=function(src) {
		if(notRunning()) {
			load(src);
		}	
	}
	
	this.inlet1["visibleColor"]=function(colorStr) {
		var el=(currDiv==1)?marquee1:marquee2;
		if(notRunning()) {
			colorTransition(colorStr,el);
		}	
	}	
	
	this.inlet1["color"]=function(colorStr) {
		var el=(currDiv==1)?marquee2:marquee1;
		if(notRunning()) {
			colorTransition(colorStr,el);
		}	
	}	
	
	this.inlet1["fade"]=function(src) {
		if(notRunning()) {
			var arr=src.split(" ");
			var dur=arr.shift();			
			load(arr.join(" "),dur);
		}	
	}	
	
	this.inlet1["bang"]=function() {		
		if(notRunning() && messageArr.length) {
			if(currIdx<messageArr.length) {
				load(messageArr[currIdx]);
				currIdx++;
			} else {
				currIdx=0;
				load(messageArr[currIdx]);
				currIdx++;							
			}
		}	
	}
	
	function notRunning() {
		return (runningArr[0]==false&&runningArr[1]==false);
	}
	
	function setColor(c) {
		var el=(currDiv==1)?marquee2:marquee1;
		el.style.color=c;	
	}
	
	function colorTransition(colorStr,el) {
		var fromColor = el.style.color||"#000000";
		var toColor = colorStr.split(" ")[0];
//		LilyDebugWindow.print(fromColor+" "+toColor+" "+el.style.color)	
		var dur = (typeof colorStr.split(" ")[1]!="undefined")?colorStr.split(" ")[1]:"";						
		var animatedEl = new LilyAnimator.Animator({
			duration: dur
		})
		    .addSubject(new LilyAnimator.ColorStyleSubject(el, 'color', fromColor, toColor));
		animatedEl.toggle();
	}
	
	function transition(el,start,end,dur) {
		var d = dur||null;

		runningArr[end]=true;							
		var animatedEl = new LilyAnimator.Animator({			
		    onComplete: function() {
			
				var val = end;
				return function() {
					done(val);
				}
			
			}(),
			duration: d
		})
		    .addSubject(new LilyAnimator.NumericalStyleSubject(el, 'opacity', start, end));
		animatedEl.toggle();		
	}
	
	function done(end) {	
		runningArr[end]=false;
		setColor("#000000");
		if(notRunning())
			thisPtr.outlet2.doOutlet("bang");		
	}
	
	function load(str,dur) {		
			var t=toggle();						
			if(t==1) {
				marquee1.innerHTML=LilyUtils.makeSafe(str);
				marquee1.style.zIndex++;
				marquee2.style.zIndex--;
				transition(marquee1,0,1,dur);
				transition(marquee2,1,0,dur);							
			} else {
				marquee2.innerHTML=LilyUtils.makeSafe(str);
				marquee2.style.zIndex++;
				marquee1.style.zIndex--;
				transition(marquee2,0,1,dur);
				transition(marquee1,1,0,dur);								
			}	
	}		
	
	function toggle() {
		if(currDiv==1) {
			currDiv=2;
			return 2;			
		} else {
			currDiv=1;
			return 1;						
		}	
	}	
	
	this.controller.objResizeControl.cb=function(h,w) {
		marquee1.style.height=parseInt(h/3)+"px";
		marquee1.style.marginTop=parseInt(h/3)+"px";
		marquee1.style.marginBottom=parseInt(h/3)+"px";				
		marquee1.style.width=parseInt(w)+"px";
		marquee2.style.height=parseInt(h/3)+"px";
		marquee2.style.marginTop=parseInt(h/3)+"px";
		marquee2.style.marginBottom=parseInt(h/3)+"px";					
		marquee2.style.width=parseInt(w)+"px";		
		marquee.style.height=parseInt(h)+"px";		
		marquee.style.width=parseInt(w)+"px";
	}
	
	function clickFunc(e) {
		e.preventDefault();
		var el=(currDiv==1)?marquee1:marquee2;
		thisPtr.outlet1.doOutlet(LilyUtils.html2String(el.innerHTML));
	}
			
	this.ui=new LilyObjectView(this,
		"<div id=\""+ this.createElID("marquee") +"\" style=\"position:relative;width:200px;height:40px;background:transparent;\">"			
		+ "<div style=\"text-align:center;background:transparent;width:100%;margin-top:33%;margin-bottom:33%;position:absolute;top:0px;left:0px;opacity:0;z-index:"+this.zIndex+"\" id=\""+ this.createElID("marquee2") +"\"></div>"
		+ "<div style=\"text-align:center;background:transparent;width:100%;margin-top:33%;margin-bottom:33%;position:absolute;top:0px;left:0px;opacity:1;z-index:"+(this.zIndex+1)+"\" id=\""+ this.createElID("marquee1") +"\"></div>"
		+ "</div>"					
	);
	this.ui.draw();
	
	marquee1=thisPtr.ui.getElByID(thisPtr.createElID("marquee1"));
	marquee2=thisPtr.ui.getElByID(thisPtr.createElID("marquee2"));
	marquee=thisPtr.ui.getElByID(thisPtr.createElID("marquee"));
	
	this.init=function() {
		thisPtr.controller.objResizeControl.cb((thisPtr.height||40),(thisPtr.width||200));
	}

	this.controller.attachObserver(this.createElID("marquee1"),"click",clickFunc,"performance");
	this.controller.attachObserver(this.createElID("marquee2"),"click",clickFunc,"performance");
		
	this.parent.getTopPatch().patchController.attachPatchObserver(thisPtr.createElID("marquee"),"patchLoaded",thisPtr.init,"all");
	this.controller.setNoBorders(true);	
	
	this.displayElement=marquee;//thisPtr.ui.getElByID(thisPtr.createElID("marquee"));	
	return this;

}

var $marqueeMetaData = {
	textName:"marquee",
	htmlName:"marquee",
	objectCategory:"UI",
	objectSummary:"Display text as a slideshow.",
	objectArguments:""
}