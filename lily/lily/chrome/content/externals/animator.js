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
*	Construct a new animator object
*	@class
*	@constructor
*	@extends LilyObjectBase
*/
//uses http://berniecode.com/writing/animator.html
function $animator()
{
	var thisPtr=this;
	var node=null;
	var running={};

	this.inlet1=new this.inletClass("inlet1",this,"methods: \"bgcolor\", \"radius\", \"fill-opacity\", \"color\", \"width\", \"height\", \"fontsize\", \"top\", \"left\"");	
	this.inlet2 = new this.inletClass("inlet2",this,"either the node to animate or it's id");
	this.outlet1 = new this.outletClass("outlet1",this,"bang on complete");
	
	function addRunning(id,cmd) {
		if(typeof running[id+"_"+cmd]=="undefined") {
			running[id+"_"+cmd]=true;
			return true;			
		} else {
			return false;
		}
	}
	
	function removeRunning(id,cmd) {
		if(typeof running[id+"_"+cmd]!="undefined")
			delete running[id+"_"+cmd];
	}	
	
	function SVGNumericalSubject(el,to,from,prop,unit) {

		this.element = el;
		this.fromValue=parseFloat(from);
		this.toValue=parseFloat(to);
		this.property=prop;
		this.units=unit||"";
		
	}
	
	SVGNumericalSubject.prototype = {
		setState: function(state) {			
			state = this.fromValue + ((this.toValue - this.fromValue) * state);
		    this.element.setAttribute(this.property,(state+this.units));
//			LilyDebugWindow.print(this.property+" "+(state+this.units))			
		}
	}
		
	//
	this.inlet2["obj"]=function(obj) {
		if(obj && typeof obj.objID != "undefined") //assume its a valid lily object.
			node = obj;
		else
			node = null;
	}	
	
	this.inlet2["anything"]=function(id) {
		var obj=thisPtr.parent.getObj(id);
		node = obj;
	}	
	
	//custom method
	this.inlet1["bgcolor"]=function(msg) {
		
		if(!node || !addRunning(node.objID,"bgcolor"))
			return;
		
		var tmp = [];
		tmp.push(node.displayElement);
		if(node.ui.inputWrapper) tmp.push(node.ui.inputWrapper);		
		
		var fromColor = LilyUtils.convertType(msg.split(" ")[1])||node.displayElement.style.backgroundColor;
		var toColor = msg.split(" ")[0];
		var dur = (typeof msg.split(" ")[2]!="undefined")?msg.split(" ")[2]:"";		
//		LilyDebugWindow.print(fromColor+" "+toColor+" "+node)				
		var animatedEl = new LilyAnimator.Animator({
			duration: dur,
		    onComplete: function() {
			
				var id=node.objID;
				return function() {
					done("bgcolor "+id);
					removeRunning(id,"bgcolor");
				}
			
			}()
		})
		    .addSubject(new LilyAnimator.ColorStyleSubject(tmp, 'background-color', fromColor, toColor));
		animatedEl.play();
	}
	
	this.inlet1["radius"]=function(msg) {

		if(!node || !addRunning(node.objID,"radius"))
			return;
		
		var fromValue = (+msg.split(" ")[1])||node.displayElement.getAttribute("r");
		var toValue = (+msg.split(" ")[0]);
		var dur = (typeof msg.split(" ")[2]!="undefined")?(+msg.split(" ")[2]):"";
		
//		LilyDebugWindow.print("-----> "+node.objID)
		
		var animatedEl = new LilyAnimator.Animator({
			duration: dur,
		    onComplete: function() {
			
				var id=node.objID;
				return function() {
					done("radius "+id);
					removeRunning(id,"radius");
				}
			
			}()
		})
		// the LilyAnimator.Animator's subjects define its behaviour 
		animatedEl.addSubject(new SVGNumericalSubject(node.displayElement,toValue,fromValue,"r","%"));

		// now click below: each click to the button calls ex1.toggle()
		animatedEl.play();
	}

	this.inlet1["fill-opacity"]=function(msg) {

		if(!node || !addRunning(node.objID,"fill-opacity"))
			return;

		var fromValue = (+msg.split(" ")[1])||node.displayElement.getAttribute("opacity");
		var toValue = (+msg.split(" ")[0]);
		var dur = (typeof msg.split(" ")[2]!="undefined")?(+msg.split(" ")[2]):"";

//		LilyDebugWindow.print("-----> "+node.objID)

		var animatedEl = new LilyAnimator.Animator({
			duration: dur,
		    onComplete: function() {

				var id=node.objID;
				return function() {
					done("fill-opacity "+id);
					removeRunning(id,"fill-opacity");
				}

			}()
		})
		// the LilyAnimator.Animator's subjects define its behaviour 
		animatedEl.addSubject(new SVGNumericalSubject(node.displayElement,toValue,fromValue,"opacity"));

		// now click below: each click to the button calls ex1.toggle()
		animatedEl.play();
	}
	
	//custom method
	this.inlet1["opacity"]=function(msg) {

		if(!node || !addRunning(node.objID,"opacity"))
			return;		

		var fromOpacity = LilyUtils.convertType(msg.split(" ")[1])||parseFloat(node.ui.objViewNode.style.opacity);
		var toOpacity = msg.split(" ")[0];
//		LilyDebugWindow.print(fromColor+" "+toColor+" "+node)
		var dur = (typeof msg.split(" ")[2]!="undefined")?msg.split(" ")[2]:"";		
		var animatedEl = new LilyAnimator.Animator({
			duration: dur,			
		    onComplete: function() {

				var id=node.objID;
				return function() {
					done("opacity "+id);
					removeRunning(id,"opacity");
				}

			}()
		})
		    .addSubject(new LilyAnimator.NumericalStyleSubject(node.ui.objViewNode, 'opacity', fromOpacity, toOpacity));
		animatedEl.play();
	}		
	
	//custom method
	this.inlet1["color"]=function(msg) {
		
		if(!node || !addRunning(node.objID,"color"))
			return;		
		
		var tmp = [];
		tmp.push(node.displayElement);
		if(node.ui.inputWrapper) tmp.push(node.ui.inputWrapper);		
		
		var fromColor = msg.split(" ")[1]||(node.ui.objViewNode.style.color);
		var toColor = msg.split(" ")[0];
//		LilyDebugWindow.print(fromColor+" "+toColor+" "+node)	
		var dur = (typeof msg.split(" ")[2]!="undefined")?msg.split(" ")[2]:"";						
		var animatedEl = new LilyAnimator.Animator({
			duration: dur,			
		    onComplete: function() {
			
				var id=node.objID;
				return function() {
					done("color "+id);
					removeRunning(id,"color");
				}
			
			}()
		})
		    .addSubject(new LilyAnimator.ColorStyleSubject(tmp, 'color', fromColor, toColor));
		animatedEl.play();
	}
	
	//custom method
	this.inlet1["width"]=function(msg) {
		
		if(!node || !addRunning(node.objID,"width"))
			return;		
		
		var tmp = [];
		tmp.push(node.ui.objectView);
		if(node.resizeElement) tmp.push(node.resizeElement);
		
		var fromWidth = msg.split(" ")[1]||parseInt(node.ui.objViewNode.style.width);
		var toWidth = msg.split(" ")[0];
//		LilyDebugWindow.print(fromColor+" "+toColor+" "+node)	
		var dur = (typeof msg.split(" ")[2]!="undefined")?msg.split(" ")[2]:"";						
		var animatedEl = new LilyAnimator.Animator({
			duration: dur,			
		    onComplete: function() {
			
				var id=node.objID;
				return function() {
					done("width "+id);
					removeRunning(id,"width");
				}
			
			}()
		})
		    .addSubject(new LilyAnimator.NumericalStyleSubject(tmp, 'width', fromWidth, toWidth));
		animatedEl.play();
	}		
	
	//custom method
	this.inlet1["height"]=function(msg) {
		
		if(!node || !addRunning(node.objID,"height"))
			return;		
		
		var tmp = [];
		tmp.push(node.ui.contentWrapper);
		if(node.resizeElement) tmp.push(node.resizeElement);		
		
		var fromHeight = msg.split(" ")[1]||parseInt(node.ui.objViewNode.style.height);
		var toHeight = msg.split(" ")[0];
//		LilyDebugWindow.print(fromColor+" "+toColor+" "+node)
		var dur = (typeof msg.split(" ")[2]!="undefined")?msg.split(" ")[2]:"";							
		var animatedEl = new LilyAnimator.Animator({
			duration: dur,			
		    onComplete: function() {
			
				var id=node.objID;
				return function() {
					done("height "+id);
					removeRunning(id,"height");
				}
			
			}()
		})
		    .addSubject(new LilyAnimator.NumericalStyleSubject(tmp, 'height', fromHeight, toHeight));
		animatedEl.play();
	}

	//custom method
	this.inlet1["fontsize"]=function(msg) {
		
		if(!node || !addRunning(node.objID,"fontsize"))
			return;		

		var tmp = [];
		tmp.push(node.displayElement);
		if(node.ui.inputWrapper) tmp.push(node.ui.inputWrapper);	

		var fromSize = msg.split(" ")[1]||parseInt(node.ui.objViewNode.style.fontSize);
		var toSize = msg.split(" ")[0];
//		LilyDebugWindow.print(fromColor+" "+toColor+" "+node)	
		var dur = (typeof msg.split(" ")[2]!="undefined")?msg.split(" ")[2]:"";						
		var animatedEl = new LilyAnimator.Animator({
			duration: dur,			
		    onComplete: function() {
			
				var id=node.objID;
				return function() {
					done("fontsize "+id);
					removeRunning(id,"fontsize");
				}
			
			}()
		})
		    .addSubject(new LilyAnimator.NumericalStyleSubject(tmp, 'font-size', fromSize, toSize));
		animatedEl.play();
	}			

	//custom method
	this.inlet1["top"]=function(msg) {
		
		if(!node || !addRunning(node.objID,"top"))
			return;		

		var fromTop = LilyUtils.convertType(msg.split(" ")[1])||parseInt(node.ui.objViewNode.style.top);
		var toTop = msg.split(" ")[0];
//		LilyDebugWindow.print(fromTop+" "+toTop+" "+node)
		var dur = (typeof msg.split(" ")[2]!="undefined")?msg.split(" ")[2]:"";							
		var animatedEl = new LilyAnimator.Animator({
			duration: dur,			
		    onComplete: function() {
				var id=node.objID;
				return function() {
					done("top "+id);
					removeRunning(id,"top");
				}
			}()
		})
		    .addSubject(new LilyAnimator.NumericalStyleSubject(node.ui.objViewNode, 'top', fromTop, toTop));
		animatedEl.play();
	}
		
	//custom method
	this.inlet1["left"]=function(msg) {
		
		if(!node || !addRunning(node.objID,"left"))
			return;		

		var fromLeft = LilyUtils.convertType(msg.split(" ")[1])||parseInt(node.ui.objViewNode.style.left);
		var toLeft = msg.split(" ")[0];
//		LilyDebugWindow.print(fromColor+" "+toColor+" "+node)
		var dur = (typeof msg.split(" ")[2]!="undefined")?msg.split(" ")[2]:"";		
		var animatedEl = new LilyAnimator.Animator({
			duration: dur,			
		    onComplete: function() {
			
				var id=node.objID;
				return function() {
					done("left "+id);
					removeRunning(id,"left");
				}
			
			}()
		})
		    .addSubject(new LilyAnimator.NumericalStyleSubject(node.ui.objViewNode, 'left', fromLeft, toLeft));
		animatedEl.play();
	}			
	
	function done(type) {
		thisPtr.outlet1.doOutlet(type+" bang");
	}
	
	return this;
}

var $animatorMetaData = {
	textName:"animator",
	htmlName:"animator",
	objectCategory:"Interaction",
	objectSummary:"Animate an object's appearance.",
	objectArguments:""
}