/**
 * Created by Lee on 2015/10/3.
 */
/*
 * this file is full of the common tools that can be used in many program
 */
var CustomEventCenter = cc.Class.extend({
	_listenerMap: null,

	ctor: function() {
		this._listenerMap = {};
		console.log("event center OK!!!");
	},

	addListener: function(event, callBack) {
		if(!callBack || ! event) {
			return;
		}
		var listenerList = this._listenerMap[event];
		if(!listenerList) {
			listenerList = this._listenerMap[event] = [];
		}
		for (var i = 0; i < listenerList.length; i++) {
			if (listenerList[i] == callBack) {
				return;
			}
		}
		listenerList.push(callBack);
	},

	removeListener: function(event, callBack) {
		if(!event || !callBack) {
			return;
		}
		var listenerList = this._listenerMap[event];
		if (listenerList) {
			for(var i = 0; i < listenerList.length; i++) {
				if(listenerList[i] == callBack) {
					listenerList.splice(i, 1);
					return;
				}
			}
		}
	},

	dispatchEvent: function(event, userData) {
		if (this._listenerMap[event]) {
			var listeners = this._listenerMap[event].slice();
			for (var i = 0; i < listeners.length; i++) {
				listeners[i](userData);
			}
		}
	},
	_toString: function() {
		for(var i = 0; i < this._listenerMap.length; i++) {
			console.log(this._listenerMap[i]);
		}
	}
});

/**
 * the factory can be used to generate characters and AIs from a specific template, which is defined in the Character.js & EnemyAI.js
 */
var InstanceFactory = cc.Class.extend({
	template: null,
	
	ctor: function(template) {
		this.template = template;
	},
	_isPrivate: function(string) {
		return string.indexOf("_") >= 0
	},
	loadTemplate: function(target, label) {
		this._loadPrototype(target);
		this._initInstance(target);
		this._loadInstanceTemplate(label, target);
	},
	_loadPrototype: function(target) {
		var proto = this.template.proto;
		for (var i in proto) {
			if (!this._isPrivate(i)) {
				if (typeof(proto[i]) == "object") {
					target[i] = Object.create(proto[i]);
				} else {
					target[i] = proto[i];
				}
			}
		}
		for (var i in proto) {
			if (this._isPrivate(i)) {
				var flag = this._navigateProperty(i, [])[0];
				var ele = target[flag];
				for (var j in ele) {
					if (typeof(proto[i]) == "object") {
						ele[j] = Object.create(proto[i]);
					} else {
						ele[j] = proto[i];
					}
				}
			}
		}
	},
	_loadInstanceTemplate: function(label, instance) {
		if (label in this.template.instance) {
			var duplicate = this.template.instance[label];
			for (var index in duplicate) {
				var navigator = this._navigateProperty(index, []);
				this._setCustomProperty(navigator, instance, duplicate[index]);
			}
		}
	},
	_navigateProperty: function(string, navi) {
		var that = this;
		var index = string.indexOf("_");
		if (index >= 0) {
			var tmp = string.slice(0, index);
			if (tmp != "") {
				navi.push(tmp);
			}
			return that._navigateProperty(string.slice(index + 1), navi);
		} else {
			navi.push(string);
			return navi;
		}
	},
	_setCustomProperty: function(navigator, pointer, value) {
		var that = this;
		if (navigator.length > 1) {
			that._setCustomProperty(navigator.slice(1), pointer[navigator[0]], value);
		} else {
			pointer[navigator[0]] = value;
		}
	},
	_initInstance: function(instance) {
		var that = this;
		for (var i in instance) {
			var ele = instance[i];
			if (typeof(ele) == "object") {
				that._initInstance(ele)
			} else
			if(typeof(ele) == "string") {
				instance[i] = null;
			}
		}
	}
});

var test = cc.Node.extend({
	count: null,
	ctor:function() {
		this._super();

		this.count = 1;
		this.unscheduleAllCallbacks();
		this.schedule(function() {
			this.count++;
			if (this.count % 10 == 0) {
				this.scheduleOnce(function() {
					console.log("ok")
				})
			}
			console.log(this.count);
		}.bind(this), 1);
	},
});