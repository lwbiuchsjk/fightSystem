/**
 * Created by Lee on 2015/10/29.
 */
var SysFlowControl = cc.Layer.extend({
	eventCenter: null,
	statusCalculateLayer: null,
	showLayer: null,

	ctor: function() {
		this._super();
		this.setName(Config.FLOW_CONTROL_LAYER);
		/*
		this.eventCenter = new CustomEventCenter();


		var events = Config.events;
		for(var i in events) {
			this.eventCenter.addListener(events[i], this[events[i]].bind(this));
		}
		this.eventCenter.addListener(Config.HARD_ATTACK_MODE, this.hardAttack);
		this.eventCenter.addListener(Config.MOVE_BACKWARD, this.moveBackward);
		*/

		console.log("flow layer OK!!!");
	},
	/**
	 *
	 * @param {object} value. "role" is the String that defined in the Config.js file. "time" is the ms time class, that is easy to calculate with "Config.duration".
	 * the above-like-function is all have the VALUE to be the param.
	 */
	easyAttackBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN)) {
			chct.setActionTime(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN, value.time);
			this.showLayer.easyAttackBegin();
			var attackProgress = this.showLayer.attackProgress;
			var upAction = this.showLayer.attackEasyUp;
			if (upAction.getTarget() == null) {
				attackProgress.runAction(upAction);
			}
			console.info("EASY BEGIN!!!");
		}
	},
	easyAttackReady: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_READY)) {
			chct.setActionTime(Config.EASY_ATTACK_MODE, Config.events.EASY_READY, value.time);
			this.showLayer.easyAttackReady();
			console.info("EASY READY!!!");
		}
	},
	easyAttackGo: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_GO)) {
			chct.setActionTime(Config.EASY_ATTACK_MODE, Config.events.EASY_GO, value.time);
			this.showLayer.attackFinished();
			console.info("EASY GO!!!");
		}
	},

	hardAttackBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN)) {
			chct.setActionTime(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN, value.time);
			this.showLayer.hardAttackBegin();
			var attackProgress = this.showLayer.attackProgress;
			var upAction = this.showLayer.attackHardUp;
			if (upAction.getTarget() == null) {
				attackProgress.runAction(upAction);
			}
			console.info("HARD BEGIN!!!");
		}
	},
	hardAttackReady: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_READY)) {
			chct.setActionTime(Config.HARD_ATTACK_MODE, Config.events.HARD_READY, value.time);
			this.showLayer.hardAttackReady();
			console.info("HARD READY!!!");
		}
	},
	hardAttackGo: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_GO)) {
			chct.setActionTime(Config.HARD_ATTACK_MODE, Config.events.HARD_GO, value.time);
			this.showLayer.attackFinished();
			console.info("HARD GO!!!");
		}
		//console.log(this.statusCalculateLayer.getCharacter(value.role).hardAttack);
	},

	moveAside: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var isBegan = chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
		var isMoved = chct.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE);
		if (isBegan && !isMoved) {
			chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE, value.time);
			console.info("move aside");
		}
	},
	moveForward: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var isBegan = chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
		var isMoved = chct.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD);
		if (isBegan && !isMoved) {
			chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD, value.time);
			console.info("move forward");
		}
	},
	moveBackward: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var isBegan = chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
		var isMoved = chct.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD);
		if (isBegan && !isMoved) {
			chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD, value.time);
			console.info("move backward");
		}
	},
	adjustFinished: function(value/*role, time*/) {
		console.info("ADJUST FINISHED!!!");
	},
	positionBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN)) {
			chct.setActionTime(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN, value.time);
			var positionMovement = this.showLayer.positionMovement;
			var positionProgress = this.showLayer.positionProgress;
			if (positionMovement.getTarget() == null) {
				positionProgress.runAction(positionMovement);
				console.info("position begin");
			}
		}
	},
	positionEnd: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var isBegan = chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
		var isEnded = chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_END);
		if (isBegan && !isEnded) {
			chct.setActionTime(Config.ADJUST_POSITION, Config.events.POSITION_END, value.time);
			console.info("position end");
		}
	},

	defenceBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var event = Config.events.DEFENCE_BEGIN;
		if (!chct.isDefenceBegan()) {
			chct.setDefenceTime(event, value.time);
			chct.setDefenceDuration(event);
			this.showLayer.defenceAction(event, chct.getDefenceDuration() / 1000);
			console.info("DEFENCE BEGIN!!!");
		}
	},
	defenceEnd: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var event = Config.events.DEFENCE_END;
		if (!chct.isDefenceEnded()) {
			chct.setDefenceTime(event, value.time);
			chct.setDefenceDuration(event);
			var time = chct.getDefenceDuration() / 1000;
			this.showLayer.defenceAction(event, Config.duration.DEFENCE_MAX_TIME / 1000 - time);
			console.info("DEFENCE END!!!");
		}
	},
	blockBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (chct.isBlockReady(value.time)) {
			this.showLayer.blockBegin();
			console.info("BLOCK BEGIN!!!");
		}
	},
	blockFail: function(value/*role, time*/) {

	},
	blockGo: function(value/*role, time*/) {

	},

	setLayer: function(showLayer, statusCalculate) {
		this.statusCalculateLayer = statusCalculate;
		this.showLayer = showLayer;
	}
});