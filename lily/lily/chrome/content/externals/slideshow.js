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
*	Construct a new slideshow object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/

function $slideshow()
{
	var thisPtr=this;
	this.inlet1=new this.inletClass("inlet1",this,"url loads slideshow photo, \"bang\" steps through photo array, click outputs photo url");
	this.inlet2=new this.inletClass("inlet2",this,"array of urls to load");	

	this.outlet1 = new this.outletClass("outlet1",this,"photo url");
	this.outlet2 = new this.outletClass("outlet2",this,"bang on load or error");
	
	//these params are used during object creation
	this.height="100px";
	this.width="100px";
	this.color = "transparent";
	this.allowFont=false; //dont allow font changes			
		
	var image1 = null; //front
	var image2 = null; //back
	var currImg = 1;
	var timer = null;
	var runningArr = [false,false];
	var slideshowArr = [];
	var currIdx = 0;
	var defaultUrl = "chrome://lily/content/images/glass.gif";
	
	this.controller.objResizeControl.cb=function(h,w) {
		image1.setAttribute("height",(parseInt((h-12))+"px"));
		image2.setAttribute("height",(parseInt((h-12))+"px"));		
	}
	
	this.inlet2["obj"]=function(arr) {
		slideshowArr=arr;
		currIdx = 0;
	}
	
	this.inlet2["clear"]=function() {
		slideshowArr=[];
		currIdx=0;
		preload(defaultUrl,0);
	}	
	
	this.inlet1["nofade"]=function(src) {

		if(notRunning()) {
			preload(src,1);
		}	
	}
	
	this.inlet1["obj"]=function(obj) {
		if(notRunning() && typeof obj["url"]!="undefined") {
			preload(obj["url"]);
		}	
	}			
			
	this.inlet1["anything"]=function(src) {
		if(notRunning()) {			
			preload(src);
		}	
	}

	this.inlet1["fade"]=function(str) {
		
		if(notRunning()) {			
			var arr=str.split(" ");
			var dur=arr.shift();									
			preload(arr.join(" "),dur);
		}	
	}
				
	this.inlet1["bang"]=function() {
		if(notRunning() && slideshowArr.length) {
			if(currIdx<slideshowArr.length) {
				preload(slideshowArr[currIdx]);
				currIdx++;
			} else {
				currIdx=0;
				preload(slideshowArr[currIdx]);
				currIdx++;							
			}
		}	
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
			duration: parseInt(d)
		})
		    .addSubject(new LilyAnimator.NumericalStyleSubject(el, 'opacity', start, end));
		animatedEl.toggle();		
	}
	
	function done(end) {
		runningArr[end]=false;
		if(notRunning())
			thisPtr.outlet2.doOutlet("bang");		
	}
	
	function notRunning() {
		return (runningArr[0]==false&&runningArr[1]==false);
	}	
			
	function preload(url,dur) {
		var img = new Image();
		img.src=LilyUtils.stripLTQuotes(url);
		img.onload=function() {
			var t=toggle();						
			if(t==1) {
				image1.onload=function() {				
					image1.style.zIndex++;
					image2.style.zIndex--;
//					timer=setInterval(function(){transition(image1,image2)},getInterval());	
					transition(image1,0,1,dur);
					transition(image2,1,0,dur);					
				}
				image1.src=LilyUtils.stripLTQuotes(url);				
			} else {
				image2.onload=function() {
					image2.style.zIndex++;
					image1.style.zIndex--;				
//					timer=setInterval(function(){transition(image2,image1)},getInterval());	
					transition(image2,0,1,dur);
					transition(image1,1,0,dur);									
				}
				image2.src=LilyUtils.stripLTQuotes(url);												
			}	
		}
		img.onerror=function() {
			runningArr[0]=false;
			runningArr[1]=false;
			LilyDebugWindow.error("error: image did not load");
			thisPtr.outlet2.doOutlet("bang");			
		}
	}
	
	function toggle() {
		if(currImg==1) {
			currImg=2;
			return 2;			
		} else {
			currImg=1;
			return 1;						
		}	
	}	
	
	function loadFunc() {
		
		//centers image
		var img = (currImg==2)?image2:image1;
		var marginWidth = (parseInt((thisPtr.width - img.width)/2)>1)?parseInt((thisPtr.width - img.width)/2):0;		
		img.style.marginLeft=(marginWidth+"px");
		img.style.marginRight=(marginWidth+"px");
				
		image1.setAttribute("height",(parseInt(((thisPtr.height-12)||100))+"px"));
		image2.setAttribute("height",(parseInt(((thisPtr.height-12)||100))+"px"));
			
	}
	
	function clickFunc(img) {
		thisPtr.outlet1.doOutlet(thisPtr.ui.getElByID(thisPtr.createElID(img)).src);			
	}
	
	this.init=function() {
		thisPtr.controller.objResizeControl.cb((thisPtr.height||100),(thisPtr.width||100));
	}		
	
	//custom html
	this.ui=new LilyObjectView(this,"<img id=\""+ this.createElID("image1") +"\" src=\""+defaultUrl+"\" height=\"100px\" style=\"position:absolute;left:1px;top:12px;opacity:0;z-index:"+(this.zIndex+1)+"\"/><img id=\""+ this.createElID("image2") +"\" src=\""+defaultUrl+"\" height=\"100px\" style=\"position:absolute;left:1px;top:12px;opacity:0;z-index:"+this.zIndex+"\"/>");
	this.ui.draw();
	thisPtr.controller.attachObserver(thisPtr.createElID("image1"),"load",loadFunc,"performance");
	thisPtr.controller.attachObserver(thisPtr.createElID("image2"),"load",loadFunc,"performance");	
	thisPtr.controller.attachObserver(thisPtr.createElID("image1"),"click",function(){clickFunc("image1")},"performance");
	thisPtr.controller.attachObserver(thisPtr.createElID("image2"),"click",function(){clickFunc("image2")},"performance");	
	image1=thisPtr.ui.getElByID(thisPtr.createElID("image1"));
	image2=thisPtr.ui.getElByID(thisPtr.createElID("image2"));
		
	this.controller.patchController.attachPatchObserver(thisPtr.createElID("image"),"patchLoaded",thisPtr.init,"all");	
	this.controller.setNoBorders(true);				
	
	return this;
}

var $slideshowMetaData = {
	textName:"slideshow",
	htmlName:"slideshow",
	objectCategory:"UI",
	objectSummary:"Display photos in a slideshow.",
	objectArguments:""
}