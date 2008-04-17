/*  -- This library is released under the BSD license:

	Copyright (c) 2006, Bernard Sumption. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:
	
	Redistributions of source code must retain the above copyright notice, this
	list of conditions and the following disclaimer. Redistributions in binary
	form must reproduce the above copyright notice, this list of conditions and
	the following disclaimer in the documentation and/or other materials
	provided with the distribution. Neither the name BernieCode nor
	the names of its contributors may be used to endorse or promote products
	derived from this software without specific prior written permission. 
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
	CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
	LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
	OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
	DAMAGE.

*/

var LilyAnimator = {};

// Applies a sequence of numbers between 0 and 1 to a number of subjects
// construct - see setOptions for parameters
LilyAnimator.Animator=function(options) {
	this.setOptions(options);
	var _this = this;
	this.timerDelegate = function(){_this.onTimerEvent()};
	this.subjects = [];
	this.target = 0;
	this.state = 0;
};
LilyAnimator.Animator.prototype = {
	// apply defaults
	setOptions: function(options) {
		this.options = LilyAnimator.Animator.applyDefaults({
			interval: 40,  // time between animation frames
			duration: 400, // length of animation
			onComplete: function(){},
			onStep: function(){},
			transition: LilyAnimator.Animator.tx.easeInOut
		}, options);
	},
	// animate from the current state to provided value
	seekTo: function(to) {
		this.seekFromTo(this.state, to);
	},
	// animate from the current state to provided value
	seekFromTo: function(from, to) {
		this.target = Math.max(0, Math.min(1, to));
		this.state = Math.max(0, Math.min(1, from));
		if (!this.intervalId) {
			this.intervalId = window.setInterval(this.timerDelegate, this.options.interval);
		}
	},
	// animate from the current state to provided value
	jumpTo: function(to) {
		this.target = this.state = Math.max(0, Math.min(1, to));
		this.propagate();
	},
	// seek to the opposite of the current target
	toggle: function() {
		this.seekTo(1 - this.target);
	},
	// add a function or an object with a method setState(state) that will be called with a number
	// between 0 and 1 on each frame of the animation
	addSubject: function(subject) {
		this.subjects[this.subjects.length] = subject;
		return this;
	},
	// remove an object that was added with addSubject
	removeSubject: function(subject) {
		this.subjects = this.subjects.reject(function(item){return item == subject;});
	},
	// remove all subjects
	clearSubjects: function() {
		this.subjects = [];
	},
	// forward the current state to the animation subjects
	propagate: function() {
		var value = this.options.transition(this.state);
		for (var i=0; i<this.subjects.length; i++) {
			if (this.subjects[i].setState) {
				this.subjects[i].setState(value);
			} else {
				this.subjects[i](value);
			}
		}
	},
	// called once per frame to update the current state
	onTimerEvent: function() {
		
		var movement = (this.options.interval / this.options.duration) * (this.state < this.target ? 1 : -1);
		if (Math.abs(movement) >= Math.abs(this.state - this.target)) {
			this.state = this.target;
		} else {
			this.state += movement;
		}
		
		try {
			this.propagate();
		} finally {
			this.options.onStep.call(this);
			if (this.target == this.state) {
				window.clearInterval(this.intervalId);
				this.intervalId = null;
				this.options.onComplete.call(this);
			}
		}
	},
	// shortcuts
	play: function() {this.seekFromTo(0, 1)},
	reverse: function() {this.seekFromTo(1, 0)}
}
// merge the properties of two objects
LilyAnimator.Animator.applyDefaults = function(defaults, prefs) {
	prefs = prefs || {};
	var prop, result = {};
	for (prop in defaults) result[prop] = prefs[prop] || defaults[prop];
	return result;
}
// make an array from any object
LilyAnimator.Animator.makeArray = function(o) {
	if (o == null) return [];
	if (!o.length) return [o];
	var result = [];
	for (var i=0; i<o.length; i++) result[i] = o[i];
	return result;
}
// convert a dash-delimited-property to a camelCaseProperty (c/o Prototype, thanks Sam!)
LilyAnimator.Animator.camelize = function(string) {
	var oStringList = string.split('-');
	if (oStringList.length == 1) return oStringList[0];
	
	var camelizedString = string.indexOf('-') == 0
		? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
		: oStringList[0];
	
	for (var i = 1, len = oStringList.length; i < len; i++) {
		var s = oStringList[i];
		camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
	}
	return camelizedString;
}
// syntactic sugar for creating CSSStyleSubjects
LilyAnimator.Animator.apply = function(el, style, options) {
	if (style instanceof Array) {
		return new LilyAnimator.Animator(options).addSubject(new CSSStyleSubject(el, style[0], style[1]));
	}
	return new LilyAnimator.Animator(options).addSubject(new CSSStyleSubject(el, style));
}
// make a transition function that gradually accelerates. pass a=1 for smooth
// gravitational acceleration, higher values for an exaggerated effect
LilyAnimator.Animator.makeEaseIn = function(a) {
	return function(state) {
		return Math.pow(state, a*2); 
	}
}
// as makeEaseIn but for deceleration
LilyAnimator.Animator.makeEaseOut = function(a) {
	return function(state) {
		return 1 - Math.pow(1 - state, a*2); 
	}
}
// make a transition function that, like an object with momentum being attracted to a point,
// goes past the target then returns
LilyAnimator.Animator.makeElastic = function(bounces) {
	return function(state) {
		state = LilyAnimator.Animator.tx.easeInOut(state);
		return ((1-Math.cos(state * Math.PI * bounces)) * (1 - state)) + state; 
	}
}
// make an Attack Decay Sustain Release envelope that starts and finishes on the same level
// 
LilyAnimator.Animator.makeADSR = function(attackEnd, decayEnd, sustainEnd, sustainLevel) {
	if (sustainLevel == null) sustainLevel = 0.5;
	return function(state) {
		if (state < attackEnd) {
			return state / attackEnd;
		}
		if (state < decayEnd) {
			return 1 - ((state - attackEnd) / (decayEnd - attackEnd) * (1 - sustainLevel));
		}
		if (state < sustainEnd) {
			return sustainLevel;
		}
		return sustainLevel * (1 - ((state - sustainEnd) / (1 - sustainEnd)));
	}
}
// make a transition function that, like a ball falling to floor, reaches the target and/
// bounces back again
LilyAnimator.Animator.makeBounce = function(bounces) {
	var fn = LilyAnimator.Animator.makeElastic(bounces);
	return function(state) {
		state = fn(state); 
		return state <= 1 ? state : 2-state;
	}
}
 
// pre-made transition functions to use with the 'transition' option
LilyAnimator.Animator.tx = {
	easeInOut: function(pos){
		return ((-Math.cos(pos*Math.PI)/2) + 0.5);
	},
	linear: function(x) {
		return x;
	},
	easeIn: LilyAnimator.Animator.makeEaseIn(1.5),
	easeOut: LilyAnimator.Animator.makeEaseOut(1.5),
	strongEaseIn: LilyAnimator.Animator.makeEaseIn(2.5),
	strongEaseOut: LilyAnimator.Animator.makeEaseOut(2.5),
	elastic: LilyAnimator.Animator.makeElastic(1),
	veryElastic: LilyAnimator.Animator.makeElastic(3),
	bouncy: LilyAnimator.Animator.makeBounce(1),
	veryBouncy: LilyAnimator.Animator.makeBounce(3)
}

// animates a pixel-based style property between two integer values
LilyAnimator.NumericalStyleSubject=function(els, property, from, to, units) {
	this.els = LilyAnimator.Animator.makeArray(els);
	if (property == 'opacity' && window.ActiveXObject) {
		this.property = 'filter';
	} else {
		this.property = LilyAnimator.Animator.camelize(property);
	}
	this.from = parseFloat(from);
	this.to = parseFloat(to);
	this.units = units || 'px';
}
LilyAnimator.NumericalStyleSubject.prototype = {
	setState: function(state) {
		var style = this.getStyle(state);
		var visibility = (this.property == 'opacity' && state == 0) ? 'hidden' : '';
		var j=0;
		for (var i=0; i<this.els.length; i++) {
			this.els[i].style[this.property] = style;
			if (j++ > 20) return;
		}
	},
	getStyle: function(state) {
		state = this.from + ((this.to - this.from) * state);
		if (this.property == 'filter') return "alpha(opacity=" + Math.round(state*100) + ")";
		if (this.property == 'opacity') return state;
		return Math.round(state) + this.units;
	}
}

// animates a colour based style property between two hex values
LilyAnimator.ColorStyleSubject=function(els, property, from, to) {
	this.els = LilyAnimator.Animator.makeArray(els);
	this.property = LilyAnimator.Animator.camelize(property);
	this.to = this.expandColor(to);
	this.from = this.expandColor(from);
}

LilyAnimator.ColorStyleSubject.prototype = {
	// parse "#FFFF00" to [256, 256, 0]
	expandColor: function(color) {
		var hexColor, red, green, blue;
		hexColor = LilyAnimator.ColorStyleSubject.parseColor(color);
		if (hexColor) {
			red = parseInt(hexColor.slice(1, 3), 16);
			green = parseInt(hexColor.slice(3, 5), 16);
			blue = parseInt(hexColor.slice(5, 7), 16);
			return [red,green,blue]
		}
		if (window.DEBUG) {
//			alert("Invalid colour: '" + color + "'");
		}
	},
	getValueForState: function(color, state) {
		return Math.round(this.from[color] + ((this.to[color] - this.from[color]) * state));
	},
	setState: function(state) {
		var color = '#'
				+ LilyAnimator.ColorStyleSubject.toColorPart(this.getValueForState(0, state))
				+ LilyAnimator.ColorStyleSubject.toColorPart(this.getValueForState(1, state))
				+ LilyAnimator.ColorStyleSubject.toColorPart(this.getValueForState(2, state));
		for (var i=0; i<this.els.length; i++) {
			this.els[i].style[this.property] = color;
		}
	}
}

// return a properly formatted 6-digit hex colour spec, or false
LilyAnimator.ColorStyleSubject.parseColor = function(string) {
	var color = '#', match;
	if(match = LilyAnimator.ColorStyleSubject.parseColor.rgbRe.exec(string)) {
		var part;
		for (var i=1; i<=3; i++) {
			part = Math.max(0, Math.min(255, parseInt(match[i])));
			color += LilyAnimator.ColorStyleSubject.toColorPart(part);
		}
		return color;
	}
	if (match = LilyAnimator.ColorStyleSubject.parseColor.hexRe.exec(string)) {
		if(match[1].length == 3) {
			for (var i=0; i<3; i++) {
				color += match[1].charAt(i) + match[1].charAt(i);
			}
			return color;
		}
		return '#' + match[1];
	}
	return false;
}
// convert a number to a 2 digit hex string
LilyAnimator.ColorStyleSubject.toColorPart = function(number) {
	if (number > 255) number = 255;
	var digits = number.toString(16);
	if (number < 16) return '0' + digits;
	return digits;
}
LilyAnimator.ColorStyleSubject.parseColor.rgbRe = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
LilyAnimator.ColorStyleSubject.parseColor.hexRe = /^\#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// animates between two styles defined using CSS.
// if style1 and style2 are present, animate between them, if only style1
// is present, animate between the element's current style and style1
LilyAnimator.CSSStyleSubject=function(els, style1, style2) {
	els = LilyAnimator.Animator.makeArray(els);
	this.subjects = [];
	if (els.length == 0) return;
	var prop, toStyle, fromStyle;
	if (style2) {
		fromStyle = this.parseStyle(style1, els[0]);
		toStyle = this.parseStyle(style2, els[0]);
	} else {
		toStyle = this.parseStyle(style1, els[0]);
		fromStyle = {};
		for (prop in toStyle) {
			fromStyle[prop] = CSSStyleSubject.getStyle(els[0], prop);
		}
	}
	// remove unchanging properties
	var prop;
	for (prop in fromStyle) {
		if (fromStyle[prop] == toStyle[prop]) {
			delete fromStyle[prop];
			delete toStyle[prop];
		}
	}
	// discover the type (numerical or colour) of each style
	var prop, from, to, units, match, type;
	for (prop in fromStyle) {
		if (!toStyle[prop]) {
			if (window.DEBUG) alert("No to style provided for '" + prop + '"');
			continue;
		}
		if (from = LilyAnimator.ColorStyleSubject.parseColor(fromStyle[prop])) {
			to = LilyAnimator.ColorStyleSubject.parseColor(toStyle[prop]);
			type = LilyAnimator.ColorStyleSubject;
		} else if(match = LilyAnimator.CSSStyleSubject.numericalRe.exec(fromStyle[prop])) {
			from = parseFloat(fromStyle[prop]);
			to = parseFloat(toStyle[prop]);
			type = LilyAnimator.NumericalStyleSubject;
			units = match[1] || LilyAnimator.CSSStyleSubject.numericalRe.exec(toStyle[prop])[1];
		} else {
			if (window.DEBUG) {
				alert("Unrecognised format for value of "
					+ prop + ": '" + fromStyle[prop] + "'");
			}
			continue;
		}
		this.subjects[this.subjects.length] = new type(els, prop, from, to, units);
	}
}

LilyAnimator.CSSStyleSubject.prototype = {
	// parses "width: 400px; color: #FFBB2E" to {width: "400px", color: "#FFBB2E"}
	parseStyle: function(style, el) {
		var rtn = {};
		// if style is a rule set
		if (style.indexOf(":") != -1) {
			var styles = style.split(";");
			for (var i=0; i<styles.length; i++) {
				var parts = CSSStyleSubject.ruleRe.exec(styles[i]);
				if (parts) {
					rtn[parts[1]] = parts[2];
				}
			}
		}
		// else assume style is a class name
		else {
			var prop, value, oldClass;
			oldClass = el.className;
			el.className = style;
			for (var i=0; i<CSSStyleSubject.cssProperties.length; i++) {
				prop = CSSStyleSubject.cssProperties[i];
				value = CSSStyleSubject.getStyle(el, prop);
				if (value) {
					rtn[prop] = value;
				}
			}
			el.className = oldClass;
		}
		return rtn;
		
	},
	setState: function(state) {
		for (var i=0; i<this.subjects.length; i++) {
			this.subjects[i].setState(state);
		}
	}
}
LilyAnimator.CSSStyleSubject.getStyle = function(el, rule){
	var style;
	if(document.defaultView && document.defaultView.getComputedStyle){
		style = document.defaultView.getComputedStyle(el, "").getPropertyValue(rule);
		if (style) {
			return style;
		}
	}
	rule = LilyAnimator.Animator.camelize(rule);
	if(el.currentStyle){
		style = el.currentStyle[rule];
	}
	return style || el.style[rule]
}


LilyAnimator.CSSStyleSubject.ruleRe = /^\s*([a-zA-Z\-]+)\s*:\s*(\S(.+\S)?)\s*$/;
LilyAnimator.CSSStyleSubject.numericalRe = /^-?\d+(?:\.\d+)?(%|[a-zA-Z]{2})?$/;

// required because the style object of elements isn't enumerable in Safari
LilyAnimator.CSSStyleSubject.cssProperties = ['background-color','border','border-color','border-spacing',
'border-style','border-top','border-right','border-bottom','border-left','border-top-color',
'border-right-color','border-bottom-color','border-left-color','border-top-width','border-right-width',
'border-bottom-width','border-left-width','border-width','bottom','color','font-size','font-size-adjust',
'font-stretch','font-style','height','left','letter-spacing','line-height','margin','margin-top',
'margin-right','margin-bottom','margin-left','marker-offset','max-height','max-width','min-height',
'min-width','orphans','outline','outline-color','outline-style','outline-width','overflow','padding',
'padding-top','padding-right','padding-bottom','padding-left','quotes','right','size','text-indent',
'top','width','word-spacing','z-index','opacity','outline-offset'];

/*

// chains several Animator objects together
LilyAnimator.AnimatorChain=function(animators) {
	this.animators = animators;
	for (var i=0; i<this.animators.length; i++) {
		this.listenTo(this.animators[i]);
	}
	this.forwards = false;
	this.current = 0;
}

LilyAnimator.AnimatorChain.prototype = {
	play: function() {
		this.forwards = true;
		this.current = -1;
		for (var i=0; i<this.animators.length; i++) {
			this.animators[i].jumpTo(0);
		}
		this.advance();
	},
	reverse: function() {
		this.forwards = false;
		this.current = this.animators.length;
		for (var i=0; i<this.animators.length; i++) {
			this.animators[i].jumpTo(1);
		}
		this.advance();
	},
	toggle: function() {
		if (this.forwards) {
			this.reverse();
		} else {
			this.play();
		}
	},
	listenTo: function(animator) {
		var oldOnComplete = animator.options.onComplete;
		var _this = this;
		animator.options.onComplete = function() {
			if (oldOnComplete) oldOnComplete.call(animator);
			_this.advance();
		}
	},
	// play the next animator
	advance: function() {
		if (this.forwards) {
			if (this.animators[this.current + 1] == null) return;
			this.current++;
			this.animators[this.current].play();
		} else {
			if (this.animators[this.current - 1] == null) return;
			this.current--;
			this.animators[this.current].reverse();
		}
	}
}


// an Accordion is a class that creates and controls a number of LilyAnimator.Animators. An array of elements is passed in,
// and for each element an LilyAnimator.Animator and a activator button is created. When an LilyAnimator.Animator's activator button is
// clicked, the LilyAnimator.Animator and all before it seek to 0, and all LilyAnimator.Animators after it seek to 1. This can be used to
// create the classic Accordion effect, hence the name.
function Accordion(options) {
	this.setOptions(options);
	var selected = this.options.initialSection, current;
	if (this.options.rememberance) {
		current = document.location.hash.substring(1);
	}
	this.rememberanceTexts = [];
	this.ans = [];
	var _this = this;
	for (var i=0; i<this.options.sections.length; i++) {
		var el = this.options.sections[i];
		var an = new LilyAnimator.Animator(this.options.animatorOptions);
		var from = this.options.from + (this.options.shift * i);
		var to = this.options.to + (this.options.shift * i);
		an.addSubject(new NumericalStyleSubject(el, this.options.property, from, to, this.options.units));
		an.jumpTo(0);
		var activator = this.options.getActivator(el);
		activator.index = i;
		activator.onclick = function(){_this.show(this.index)};
		this.ans[this.ans.length] = an;
		this.rememberanceTexts[i] = activator.innerHTML.replace(/\s/g, "");
		if (this.rememberanceTexts[i] === current) {
			selected = i;
		}
	}
	this.show(selected);
}

Accordion.prototype = {
	// apply defaults
	setOptions: function(options) {
		this.options = Object.extend({
			// an array of elements to use as the accordion sections
			sections: null,
			// a function that locates an activator button element given a section element.
			// by default it takes a button id from the section's "activator" attibute
			getActivator: function(el) {return $(el.getAttribute("activator"))},
			// shifts each animator's range, for example with options {from:0,to:100,shift:20}
			// the animators' ranges will be 0-100, 20-120, 40-140 etc.
			shift: 0,
			// the first page to show
			initialSection: 0,
			// if set to true, document.location.hash will be used to preserve the open section across page reloads 
			rememberance: true,
			// constructor arguments to the LilyAnimator.Animator objects
			animatorOptions: {}
		}, options || {});
	},
	show: function(section) {
		for (var i=0; i<this.ans.length; i++) {
			this.ans[i].seekTo(i > section ? 1 : 0);
		}
		if (this.options.rememberance) {
			document.location.hash = this.rememberanceTexts[section];
		}
	}
}
*/