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