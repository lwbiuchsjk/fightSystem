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
	},
	/**
	 *
	 * below is the functions related to attack
	 *
	 * * @param {object} value. "role" is the String that defined in the Config.js file. "time" is the ms time class, that is easy to calculate with "Config.duration".
	 * the above-like-function is all have the VALUE to be the param.
	 *
	 */
	attackBegin: function(value/*role*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var easyTime = chct.getEasyTime();
		var hardTime = chct.getHardTime();
		this.showLayer.attackBegan(easyTime, hardTime);
	},
	easyAttackBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN)) {
			chct.setActionTime(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN, value.time);
			this.showLayer.easyAttackBegin();
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
			var target = chct.getTarget();
			target.setAttacked(true);
			var hitTime = chct.getHitTime();
			var woundEvent = {
				from: chct,
				to: target,
				time: Date.now(),
				attackEnergy: chct.getAttackEnergy(),
				ATTACK_FLAG: Config.EASY_ATTACK_MODE
			};
			this.scheduleOnce(function() {
				this.eventCenter.dispatchEvent(Config.events.GET_WOUNDED, woundEvent);
			}.bind(this), hitTime);
			console.info("EASY GO!!!");
		}
	},

	hardAttackBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN)) {
			chct.setActionTime(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN, value.time);
			this.showLayer.hardAttackBegin();
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
			var target = chct.getTarget();
			target.setAttacked(true);
			var hitTime = chct.getHitTime();
			var woundEvent = {
				from: chct,
				to: target,
				time: Date.now(),
				attackEnergy: chct.getAttackEnergy(),
				ATTACK_FLAG: Config.HARD_ATTACK_MODE
			};
			this.scheduleOnce(function() {
				this.eventCenter.dispatchEvent(Config.events.GET_WOUNDED, woundEvent);
			}.bind(this), hitTime);
			console.info("HARD GO!!!");
		}
	},

	getWounded: function(value/*from, to, time, attackEnergy, ATTACK_FLAG*/) {
		var source = value.from;
		var target = value.to;
		var positionCondition = target.isEnemyPosition(source, Config.ENEMY_FACED_TO_ME);
		var defenceCondition = target.isDefenceBegan() && !target.isDefenceEnded();
		target.checkWound(value.attackEnergy, value.ATTACK_FLAG, positionCondition, defenceCondition);
	},
	/**
	 *
	 * below is the related position action control function
	 *
	 */
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
			this.showLayer.adjustPositionBegan(chct.getPositionDuration());
			console.info("position begin");
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
	noAction: function() {
		console.info("NO ACTION!!!");
	},

	/**
	 *
	 * below is the related defence action control function
	 *
	 */
	defenceBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var event = Config.events.DEFENCE_BEGIN;
		if (!chct.isDefenceBegan()) {
			chct.setActionTime(Config.DEFENCE_ACTION, event, value.time);
			chct.setDefenceDuration(event);
			this.showLayer.defenceAction(event, chct.getDefenceDuration() / 1000);
			console.info("DEFENCE BEGIN!!!");
		}
	},
	defenceEnd: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var event = Config.events.DEFENCE_END;
		if (!chct.isDefenceEnded()) {
			chct.setActionTime(Config.DEFENCE_ACTION, event, value.time);
			chct.setDefenceDuration(event);
			this.showLayer.defenceAction(event, chct.calcDefenceEndTime(chct.getDefenceDuration() / 1000));
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
	/**
	 *
	 * below is the related energy action control function
	 *
	 */
	operateEnergyBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if(!chct.isOperateEnergyBegan()) {
			chct.setActionTime(Config.CHARACTER_ENERGY, Config.events.OPERATE_ENERGY_BEGIN, value.time);
			console.info("OPERATE ENERGY!!!");
		}
	},
	operateEnergyEnd: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if(!chct.isOperateEnergyEnded()) {
			chct.setActionTime(Config.CHARACTER_ENERGY, Config.events.OPERATE_ENERGY_END, value.time);
			console.info("OPERATE ENERGY END!!!");
		}
	},
	setEnergyRotationBeginTime: function(value/*role, index, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setEnergyIndex(value.index);
		chct.setEnergyBeginTime(value.index, value.time);
	},
	energyDurationBegin: function(value/*role, lastIndex, index, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (chct.isOneDuration(value.lastIndex, value.index)) {
			var nextIndex = (value.index + 1) % Config.ENERGY_LENGTH;
			chct.setEnergyIndex(nextIndex);
			chct.setEnergyBeginTime(nextIndex, value.time);
			if (chct.isOperateEnergyBegan() && !chct.isOperateEnergyEnded()) {
				chct.setAttackEnergy(nextIndex);
			}
			this.showLayer.nextEnergyRotation(nextIndex, Config.LEFT_SERIES);
			this.showLayer.nextEnergyRotation(nextIndex, Config.RIGHT_SERIES);
		}
	},
	playerEnergyRotation: function(value/*role, index, time, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var variation;
		if (!chct.isOperateEnergyBegan() || chct.isOperateEnergyEnded()) {
			variation = -chct.duration2Height(value.index);
		} else {
			variation = -Config.ENERGY_BAR_MAGNIFICATION * chct.duration2Height(value.index);
		}
		this.showLayer.moveEnergyBar(variation, Config.LEFT_SERIES);
		this.showLayer.moveEnergyBar(variation, Config.RIGHT_SERIES);
	},
	enemyEnergyRotation: function(value/*role, index, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var variation;
		if (!chct.isOperateEnergyBegan() || chct.isOperateEnergyEnded()) {
			variation = -chct.duration2Height(value.index);
		} else {
			variation = -Config.ENERGY_BAR_MAGNIFICATION * chct.duration2Height(value.index);
		}
		this.showLayer.moveEnergyBar(variation, Config.ENEMY.category);
	},
	/**
	 * related status event function
	 */
	setEnergyLabel: function(value/*FLAG, index, energy*/) {
		this.showLayer.setEnergyLabel(value.FLAG, value.index, value.energy);
	},
	onEnter: function() {
		this._super();
		this.statusCalculateLayer = this.getParent().getChildByName(Config.STATUS_CALCULATE_LAYER);
		this.showLayer = this.getParent().getChildByName(Config.SHOW_LAYER);
		this.eventCenter = this.getParent().eventCenter;

		console.log("flow layer OK!!!");
	}
});