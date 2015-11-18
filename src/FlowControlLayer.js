/**
 * Created by Lee on 2015/10/29.
 */
var SysFlowControl = cc.Layer.extend({
	eventCenter: null,
	statusCalculateLayer: null,
	showLayer: null,
	operateLayer: null,

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
			/*
			 * DEBUG
			 * this.adjustPositionGo({role: chct.getName(), time: Date.now()});
			 */
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
			var hitTime = chct.getHitTime();
			target.setActionTime(Config.CHARACTER_STATUS, Config.events.GET_WOUNDED, value.time + hitTime * 1000);
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
			var hitTime = chct.getHitTime();
			target.setActionTime(Config.CHARACTER_STATUS, Config.events.GET_WOUNDED, value.time + hitTime * 1000);
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
		var positionCondition = target.isEnemyPosition(Config.ENEMY_FACED_TO_ME, source);
		var defenceCondition = target.isDefenceBegan() && !target.isDefenceEnded();
		target.checkWound(value.attackEnergy, value.ATTACK_FLAG, positionCondition, defenceCondition);
	},
	/**
	 *
	 * below is the related position action control function
	 *
	 */
	moveAsideBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN, value.time);
		chct.getTarget().setEnemyMoving(0);
		console.info("move aside");
	},
	moveAsideEnd: function(value/*role, time, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_END, value.time);
		if (chct.isSatisfiedMoveTime(value.FLAG)) {
			chct.getTarget().setEnemyMoving(1);
			chct.checkPosition(Config.events.MOVE_ASIDE_END);
		}
	},
	moveForwardBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN, value.time);
		chct.getTarget().setEnemyMoving(0);
		console.info("move forward");
	},
	moveForwardEnd: function(value/*role, time, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_END, value.time);
		if (chct.isSatisfiedMoveTime(value.FLAG)) {
			chct.getTarget().setEnemyMoving(1);
			console.info("MOVE FORWARD SUCCEED!!!");
			chct.checkPosition();
		}
	},
	moveBackwardBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN, value.time);
		chct.getTarget().setEnemyMoving(0);
		console.info("move backward");
	},
	moveBackwardEnd: function(value/*role, time, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_END, value.time);
		if (chct.isSatisfiedMoveTime(value.FLAG)) {
			chct.getTarget().setEnemyMoving(1);
			console.info("MOVE BACKWARD SUCCEED!!!");
			chct.checkPosition();
		}
	},
	adjustPositionGo: function(value/*role, time, FLAG*/) {
		// the FLAG is used to distinguish the callee operation which is dragged to right or to left.
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var adjustEvent = {
			role: value.role,
			time: value.time
		};
		this.eventCenter.dispatchEvent(Config.events.OPERATE_ADJUST, adjustEvent);
		if (chct.isInAdjustWindow()) {
			if (chct.getNoActionTime() <= 0) {
				if (chct.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN)) {
					var easyEvent = {
						role: value.role,
						time: value.time
					};
					chct.setActionTime(Config.EASY_ATTACK_MODE, Config.events.EASY_READY, easyEvent);
					this.showLayer.attackFlashReady(Config.EASY_ATTACK_MODE);
					chct.setAdjustWindow();
				} else
				if (chct.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN)) {
					var hardEvent = {
						role: value.role,
						time: value.time
					};
					chct.setActionTime(Config.HARD_ATTACK_MODE, Config.events.HARD_READY, hardEvent);
					this.showLayer.attackFlashReady(Config.HARD_ATTACK_MODE);
					chct.setAdjustWindow();
				} else
				if (chct.isEnemyPosition(Config.ENEMY_FACED_TO_ME) && !chct.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN)) {
					var positionBeginEvent = {
						role: value.role,
						time: value.time
					};
					this.eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_BEGIN, positionBeginEvent);
					this.showLayer.showFlashPosition(value.FLAG);
				} else
				if (chct.isEnemyPosition(Config.ENEMY_FACED_TO_ME) && chct.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN)) {
					var positionEndEvent = {
						role: value.role,
						time: value.time,
						FLAG: value.FLAG
					};
					this.eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_END, positionEndEvent);
					chct.setAdjustWindow();
				}
			} else {
				var noActionEvent = {
					character: value.role
				};
				this.eventCenter.dispatchEvent(Config.events.NO_ACTION_STOP, noActionEvent);
				chct.setAdjustWindow();
			}
		}
	},
	adjust2Face: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.checkPosition(Config.events.ADJUST_TO_FACE);
		/*
		var isFace2Enemy = chct.isEnemyPosition(Config.ENEMY_FACED_TO_ME);
		var isBroadOnEnemy = chct.isEnemyPosition(Config.BROADSIDE_ON_ENEMY);
		if (!isFace2Enemy && isBroadOnEnemy) {
			chct.checkPosition();
		}
		*/
	},
	operateAdjust: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.OPERATE_ADJUST, value.time);
	},
	positionBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN)) {
			chct.setActionTime(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN, value.time);
			this.showLayer.adjustPositionBegan(chct.getPositionDuration());
			console.info("POSITION BEGIN!!!");
		}
	},
	positionEnd: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var isBegan = chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
		var isEnded = chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_END);
		if (isBegan && !isEnded) {
			chct.setActionTime(Config.ADJUST_POSITION, Config.events.POSITION_END, value.time);
			console.info("POSITION END!!!");
		}
	},
	noActionGo: function(value/*character, FLAG*/) {
		var listener, replacement;
		switch(value.character) {
			case Config.PLAYER: {
				if (value.FLAG == Config.ADJUST_POSITION) {
					listener = this.operateLayer.positionListener;
					replacement = this.operateLayer.noActionPositionListener;
				} else {
					this.showLayer.noPosition();
				}
				this._playerNoActionGo(listener, replacement);
				break;
			}
			case Config.ENEMY.category: {
				this.showLayer.enemyNoActionGo();
				break;
			}
		}
		console.info("NO ACTION!!!");
	},
	_playerNoActionGo: function(listener, noAction) {
		var showLayer = this.showLayer;
		if (showLayer.noActionPlayer == null) {
			showLayer.noActionPlayer = cc.sequence(
				cc.callFunc(function() {
					cc.eventManager.pauseTarget(this.attackButton);
					cc.eventManager.pauseTarget(this.defenceButton);
					if (listener != null) {
						cc.eventManager.removeListener(listener);
						console.log(listener.isEnabled());
						cc.eventManager.addListener(noAction, this.positionButton);
						console.log(noAction.isEnabled());
					} else {
						cc.eventManager.pauseTarget(this.positionButton);
					}
					this.noAttack();
					this.noDefence();
				}.bind(showLayer)),
				cc.delayTime(1000)
			)
		}
		if (showLayer.noActionPlayer.getTarget() == null) {
			showLayer.runAction(showLayer.noActionPlayer);
		}
	},
	/**
	 * TODO how to figure out whether the listener had be registered?
	 */
	noActionStop: function(value/*character, FLAG*/) {
		var listener, replacement;
		switch(value.character) {
			case Config.PLAYER: {
				//if (value.FLAG == Config.ADJUST_POSITION) {
					listener = this.operateLayer.noActionPositionListener;
					replacement = this.operateLayer.positionListener;
				//} else {
				//}
				this._playerNoActionStop(listener, replacement);
				break;
			}
			case Config.ENEMY.category: {
				this.showLayer.enemyNoActionStop();
				break;
			}
		}
		//console.info("NO ACTION STOP");
		//this.showLayer.playerNoActionStop();
	},
	_playerNoActionStop: function(listener, position) {
		var showLayer = this.showLayer;
		if (showLayer.noActionPlayer != null && showLayer.noActionPlayer.getTarget() == showLayer) {
			showLayer.stopAction(showLayer.noActionPlayer);
			showLayer.noActionPlayer.setTarget(null);
			cc.eventManager.resumeTarget(showLayer.attackButton);
			cc.eventManager.resumeTarget(showLayer.defenceButton);
			if (listener == null) {
				cc.eventManager.resumeTarget(showLayer.positionButton);
			} else {
				cc.eventManager.removeListener(listener);
				cc.eventManager.addListener(position, showLayer.positionButton);
			}
			showLayer.doAttack();
			showLayer.doDefence();
			showLayer.doPosition();
		}
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
			chct.setActionTime(Config.DEFENCE_ACTION, Config.events.BLOCK_BEGIN, value.time);
			chct.checkBlock(value.time);
			console.info("BLOCK BEGIN!!!");
		}
	},
	blockFail: function(value/*role, time*/) {

	},
	blockGo: function(value/*role, noAction*/) {
		var chct = value.role;
		chct.setNoActionTime(value.noAction);
		console.info("BLOCK SUCCEED!!!");
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
		console.log("ENERGY BEGIN!!");
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
	setPositionLabel: function() {
		var chct = this.statusCalculateLayer.getCharacter(Config.PLAYER);
		this.showLayer.setPositionLabel(chct.getPositionLabel());
	},
	onEnter: function() {
		this._super();
		this.statusCalculateLayer = this.getParent().getChildByName(Config.STATUS_CALCULATE_LAYER);
		this.showLayer = this.getParent().getChildByName(Config.SHOW_LAYER);
		this.operateLayer = this.getParent().getChildByName(Config.OPERATE_LAYER);
		this.eventCenter = this.getParent().eventCenter;

		console.log("flow layer OK!!!");
	}
});