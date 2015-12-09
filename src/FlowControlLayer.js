/**
 * Created by Lee on 2015/10/29.
 */
var SysFlowControl = cc.Layer.extend({
	eventCenter: null,
	statusCalculateLayer: null,
	showLayer: null,
	operateLayer: null,
	player: null,

	ctor: function() {
		this._super();
		this.setName(Config.FLOW_CONTROL_LAYER);
	},
	/**
	 *
	 * below is the functions related to attack
	 *
	 */
	attackBegin: function() {
		this.showLayer.attackBegan();
	},
	/**
	 * @param {object} value
	 * "role" is the String that defined in the Config.js file. "time" is the ms time class, that is easy to calculate with "Config.duration".
	 * the above-like-function is all have the VALUE to be the param.
	 */
	easyAttackBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN)) {
			chct.setActionTime(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN, value.time);
			switch(value.role) {
				case Config.PLAYER : {
					this.showLayer.easyAttackBegin();
					return;
				}
				case Config.ENEMY.category: {
					this.showLayer.enemyEasyBegin();
					return;
				}
			}
			/*
			 * DEBUG
			 * this.adjustPositionGo({role: chct.getName(), time: Date.now()});
			 */
		}
	},
	easyAttackReady: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_READY)) {
			chct.setActionTime(Config.EASY_ATTACK_MODE, Config.events.EASY_READY, value.time);
			//console.log("EASY READY");
			switch(value.role) {
				case Config.PLAYER : {
					this.showLayer.easyAttackReady();
					return;
				}
				case Config.ENEMY.category: {
					this.showLayer.enemyEasyReady();
					return;
				}
			}
		}
	},
	easyAttackGo: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_GO)) {
			switch(value.role) {
				case Config.PLAYER : {
					this.showLayer.attackFinished();
					break;
				}
				case Config.ENEMY.category: {
					this.showLayer.enemyAttackEnd();
					chct.AI.setActionTime(chct.getHitTime());
					break;
				}
			}
			if (!chct.isEnemyPosition(Config.enemyBroadsideOnMe)) {
				chct.setActionTime(Config.EASY_ATTACK_MODE, Config.events.EASY_GO, value.time);
				var target = chct.getTarget();
				var hitTime = chct.getHitTime();
				var getWoundedTime = value.time + hitTime * 1000;
				var woundEvent = {
					from: chct,
					to: target,
					time: getWoundedTime,
					attackEnergy: chct.getAttackEnergy(),
					ATTACK_FLAG: Config.EASY_ATTACK_MODE
				};
				//console.log("attack go: " + value.time);
				target.setActionTime(Config.CHARACTER_STATUS, Config.events.GET_WOUNDED, getWoundedTime);
				// hit action
				this.showLayer.executeHitAction(chct.getName(), hitTime);
				// check wound
				this.scheduleOnce(function() {
					this.eventCenter.dispatchEvent(Config.events.GET_WOUNDED, woundEvent);
				}.bind(this), hitTime);
			} else {
				chct.attackEnded();
				//console.log("NO ACTION...");
			}

		}
	},

	hardAttackBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN)) {
			chct.setActionTime(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN, value.time);
			switch(value.role) {
				case Config.PLAYER : {
					this.showLayer.hardAttackBegin();
					return;
				}
				case Config.ENEMY.category: {
					this.showLayer.enemyHardBegin();
					return;
				}
			}

		}
	},
	hardAttackReady: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_READY)) {
			chct.setActionTime(Config.HARD_ATTACK_MODE, Config.events.HARD_READY, value.time);
			switch(value.role) {
				case Config.PLAYER : {
					this.showLayer.hardAttackReady();
					return;
				}
				case Config.ENEMY.category: {
					this.showLayer.enemyHardReady();
					return;
				}
			}

		}
	},
	hardAttackGo: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (!chct.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_GO)) {
			switch(value.role) {
				case Config.PLAYER : {
					this.showLayer.attackFinished();
					break;
				}
				case Config.ENEMY.category: {
					this.showLayer.enemyAttackEnd();
					chct.AI.setActionTime(chct.getHitTime());
					break;
				}
			}
			if (!chct.isEnemyPosition(Config.enemyBroadsideOnMe)) {
				chct.setActionTime(Config.HARD_ATTACK_MODE, Config.events.HARD_GO, value.time);
				var target = chct.getTarget();
				var hitTime = chct.getHitTime();
				var getWoundedTime = value.time + hitTime * 1000;
				var woundEvent = {
					from: chct,
					to: target,
					time: getWoundedTime,
					attackEnergy: chct.getAttackEnergy(),
					ATTACK_FLAG: Config.HARD_ATTACK_MODE
				};
				target.setActionTime(Config.CHARACTER_STATUS, Config.events.GET_WOUNDED, getWoundedTime);
				// hit action
				this.showLayer.executeHitAction(chct.getName(), hitTime);
				// check wound
				this.scheduleOnce(function() {
					this.eventCenter.dispatchEvent(Config.events.GET_WOUNDED, woundEvent);
				}.bind(this), hitTime);
				//console.info("HARD GO!!!");
			} else {
				chct.attackEnded();
				//console.log("NO ACTION...");
			}
		}
	},

	getWounded: function(value/*from, to, time, attackEnergy, ATTACK_FLAG*/) {
		var source = value.from;
		var target = value.to;
		var positionCondition = target.isEnemyPosition(Config.enemyFacedToMe, source);
		var defenceCondition = target.isDefenceBegan() && !target.isDefenceEnded();
		var attackEffect = source.getAttackEffect(value.ATTACK_FLAG);
		target.checkWound(value.attackEnergy, attackEffect, positionCondition, defenceCondition);
		source.attackEnded();
	},
	/**
	 *
	 * below is the related position action control function
	 *
	 */
	moveAsideBegin: function(value/*role, time, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN, value.time);
		chct.getTarget().setEnemyMoving(0);
		//console.info("move aside time: " + value.time);
	},
	moveAsideEnd: function(value/*role, time, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_END, value.time);
		if (chct.isSatisfiedMoveTime(value.FLAG) || chct.isHappened(Config.ADJUST_POSITION, Config.events.OPERATE_ADJUST)) {
			chct.getTarget().setEnemyMoving(1);
			chct.checkPosition(Config.events.MOVE_ASIDE_END);
			//console.info("MOVE ASIDE SUCCEED!!! " + value.time);
		}
	},
	moveForwardBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN, value.time);
		chct.getTarget().setEnemyMoving(0);
		//console.info("move forward");
	},
	moveForwardEnd: function(value/*role, time, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_END, value.time);
		if (chct.isSatisfiedMoveTime(value.FLAG) || chct.isHappened(Config.ADJUST_POSITION, Config.events.OPERATE_ADJUST)) {
			chct.getTarget().setEnemyMoving(1);
			//console.info("MOVE FORWARD SUCCEED!!!");
			chct.checkPosition();
		}
	},
	moveBackwardBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN, value.time);
		chct.getTarget().setEnemyMoving(0);
		//console.info("move backward");
	},
	moveBackwardEnd: function(value/*role, time, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setActionTime(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_END, value.time);
		if (chct.isSatisfiedMoveTime(value.FLAG) || chct.isHappened(Config.ADJUST_POSITION, Config.events.OPERATE_ADJUST)) {
			chct.getTarget().setEnemyMoving(1);
			//console.info("MOVE BACKWARD SUCCEED!!!");
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
			//console.info(chct.getName() + " adjust position!!!");
			if (chct.getNoActionTime() <= 0) {
				if (chct.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN)) {
					var easyEvent = {
						role: value.role,
						time: value.time
					};
					this.eventCenter.dispatchEvent(Config.events.EASY_READY, easyEvent);
					switch(value.role) {
						case Config.PLAYER : {
							this.showLayer.attackFlashReady(Config.EASY_ATTACK_MODE);
							break;
						}
						case Config.ENEMY.category: {
							break;
						}
					}
					chct.setAdjustWindow();
				} else
				if (chct.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN)) {
					var hardEvent = {
						role: value.role,
						time: value.time
					};
					this.eventCenter.dispatchEvent(Config.events.HARD_READY, hardEvent);
					switch(value.role) {
						case Config.PLAYER : {
							this.showLayer.attackFlashReady(Config.HARD_ATTACK_MODE);
							break;
						}
						case Config.ENEMY.category: {
							break;
						}
					}
					chct.setAdjustWindow();
				} else
				if (chct.isEnemyPosition(Config.enemyFacedToMe) && !chct.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN) && value.FLAG != null) {
					//console.error("null action happen " + (value.FLAG == null));
					var positionBeginEvent = {
						role: value.role,
						time: value.time
					};
					this.eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_BEGIN, positionBeginEvent);
					switch(value.role) {
						case Config.PLAYER : {
							this.showLayer.showFlashPosition(value.FLAG);
							break;
						}
						case Config.ENEMY.category: {
							break;
						}
					}
				} else
				if (chct.isEnemyPosition(Config.enemyFacedToMe) && chct.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN)) {
					var positionEndEvent = {
						role: value.role,
						time: value.time,
						FLAG: value.FLAG
					};
					this.eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_END, positionEndEvent);
					chct.setAdjustWindow();
				} else
				if (chct.isEnemyPosition(Config.enemyBroadsideOnMe)) {
					var turnEvent = {
						role: value.role,
						time: value.time
					};
					this.eventCenter.dispatchEvent(Config.events.ADJUST_TO_FACE, turnEvent);
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
	adjustToFace: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.checkPosition(Config.events.ADJUST_TO_FACE);
		/*
		var isFace2Enemy = chct.isEnemyPosition(Config.enemyFacedToMe);
		var isBroadOnEnemy = chct.isEnemyPosition(Config.broadsideOnEnemy;
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
			switch(value.role) {
				case Config.PLAYER : {
					this.showLayer.adjustPositionBegan(chct.getPositionDuration());
					//console.info("POSITION BEGIN!!!");
					break;
				}
				case Config.ENEMY.category: {
					break;
				}
			}
		}
	},
	positionEnd: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var isBegan = chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
		var isEnded = chct.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_END);
		if (isBegan && !isEnded) {
			chct.setActionTime(Config.ADJUST_POSITION, Config.events.POSITION_END, value.time);
			//console.info("POSITION END!!!");
		}
	},
	noActionGo: function(value/*character, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.character);
		chct.setNoActionFlag(true);
		switch(value.character) {
			case Config.PLAYER: {
				this._playerNoActionGo();
				var endEvent = {
					role: Config.PLAYER,
					time: Date.now(),
					FLAG: Config.OPERATE_EVENT
				};
				this.eventCenter.dispatchEvent(Config.events.DEFENCE_END, endEvent);
				break;
			}
			case Config.ENEMY.category: {
				this.showLayer.enemyNoActionGo();
				chct.AI.clearAction();
				break;
			}
		}
		chct.cleanMoveDirection();
		chct.attackEnded();
		this.eventCenter.dispatchEvent(Config.events.POSITION_END, {role: value.character, time: Date.now()});
		//console.info(value.character + " NO ACTION!!! " + "time: " + Date.now());
	},
	_playerNoActionGo: function() {
		var showLayer = this.showLayer;
		cc.eventManager.pauseTarget(showLayer.attackButton);
		cc.eventManager.pauseTarget(showLayer.defenceButton);
		cc.eventManager.pauseTarget(showLayer.positionButton);
		showLayer.noAttack();
		showLayer.noDefence();
		showLayer.noPosition();
	},
	/**
	 * TODO how to figure out whether the listener had be registered?
	 */
	noActionStop: function(value/*character, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.character);
		if (chct.isNoActionFlag()) {
			switch(value.character) {
				case Config.PLAYER: {
					this._playerNoActionStop();
					break;
				}
				case Config.ENEMY.category: {
					this.showLayer.enemyNoActionStop();
					break;
				}
			}
			//console.info(value.character + " resume!!! " + "time: " + Date.now());
		}
		chct.setNoActionFlag(false);

		//console.info("NO ACTION STOP");
	},
	_playerNoActionStop: function() {
		var showLayer = this.showLayer;
		cc.eventManager.resumeTarget(showLayer.attackButton);
		cc.eventManager.resumeTarget(showLayer.defenceButton);
		cc.eventManager.resumeTarget(showLayer.positionButton);
		showLayer.doAttack();
		showLayer.doDefence();
		showLayer.doPosition();
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
			switch(value.role) {
				case Config.PLAYER : {
					this.showLayer.defenceAction(event, chct.getDefenceDuration() / 1000);
					//console.info("DEFENCE BEGIN!!!");
					break;
				}
				case Config.ENEMY.category: {
					this.showLayer.enemyDefenceBegin();
					//console.log("enemy defence begin");
					break;
				}
			}

		}
	},
	defenceEnd: function(value/*role, time, FLAG*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var event = Config.events.DEFENCE_END;
		if (!chct.isDefenceEnded()) {
			chct.setActionTime(Config.DEFENCE_ACTION, event, value.time);
			chct.setDefenceDuration(event);
			if (value.role == Config.ENEMY.category) {
				this.showLayer.resetEnemyDefence();
				chct.AI.closeDefence();
				//console.info("enemy defence end");
			}
		}
		if (value.role == Config.PLAYER && value.FLAG == Config.OPERATE_EVENT) {
			this.showLayer.defenceAction(event, chct.calcDefenceEndTime(chct.getDefenceDuration()) / 1000);
			//console.info("DEFENCE END!!!");
		}
	},
	blockBegin: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (chct.isBlockReady(value.time)) {
			this.showLayer.blockBegin(value.role);
			//console.log("enemy BLOCK begin at: " + value.time);
			chct.setActionTime(Config.DEFENCE_ACTION, Config.events.BLOCK_BEGIN, value.time);
			chct.checkBlock(value.time);
		}
	},
	blockFail: function(value/*role, noAction*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		chct.setNoActionTime(value.noAction);
		if (value.role == Config.ENEMY.category) {
			this.showLayer.blockEnd(value.role);
			var endEvent = {
				role: chct.getName(),
				time: Date.now()
			};
			this.eventCenter.dispatchEvent(Config.events.DEFENCE_END, endEvent);
		}
	},
	blockGo: function(value/*role, noAction*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var target = chct.getTarget();
		target.attackEnded();
		target.setNoActionTime(value.noAction);
		if (chct.getName() == Config.ENEMY.category) {
			var endEvent = {
				role: chct.getName(),
				time: Date.now()
			};
			this.eventCenter.dispatchEvent(Config.events.DEFENCE_END, endEvent);
		}
		//console.info("BLOCK SUCCEED!!!");
	},
	/**
	 *
	 * below is the related energy action control function
	 *
	 */
	operateEnergyBegin: function(value/*role, time, index*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if(!chct.isOperateEnergyBegan()) {
			chct.setOperateStartEnergy(value.index);
			chct.setActionTime(Config.OPERATE_ENERGY, Config.events.OPERATE_ENERGY_BEGIN, value.time);
			//console.info("OPERATE ENERGY!!!");
		}
	},
	operateEnergyEnd: function(value/*role, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if(!chct.isOperateEnergyEnded()) {
			chct.setOperateStartEnergy(null);
			chct.setActionTime(Config.OPERATE_ENERGY, Config.events.OPERATE_ENERGY_END, value.time);
			chct.setAttackEnergy(chct.getEnergyIndex());
			this.showLayer.setAttackEnergyIndex(chct.getName(), chct.getAttackEnergy());
			this.showLayer.setAttackEnergyTexture(chct.getName(), chct.getAttackEnergy());
			//console.info("OPERATE ENERGY END!!!");
		}
	},
	energyDurationBegin: function(value/*role, lastIndex, index, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		if (chct.isOneDuration(value.lastIndex, value.index)) {
			var nextIndex = (value.index + 1) % Config.ENERGY_LENGTH;
			chct.setEnergyIndex(nextIndex);
			chct.setEnergyBeginTime(nextIndex, value.time);
			this.showLayer.initAttackMovement(chct.getAttackTime(Config.EASY_ATTACK_MODE), chct.getAttackTime(Config.HARD_ATTACK_MODE));
			switch(value.role) {
				case Config.PLAYER : {
					this.showLayer.nextEnergyRotation(nextIndex, Config.LEFT_SERIES);
					this.showLayer.nextEnergyRotation(nextIndex, Config.RIGHT_SERIES);
					break;
				}
				case Config.ENEMY.category: {
					this.showLayer.nextEnergyRotation(nextIndex, Config.ENEMY.category);
					break;
				}
			}

		}
	},
	/**
	 * if operate energy start by yellow energy, then transmission time will be 1/4
	 */
	energyRotationGo: function(value/*role, index, time*/) {
		var chct = this.statusCalculateLayer.getCharacter(value.role);
		var variation;
		if (!chct.isOperateEnergyBegan() || chct.isOperateEnergyEnded()) {
			variation = -chct.duration2Height(value.index);
		} else {
			var factor;
			if (chct.getOperateStartEnergy() == 4) {
				// yellow energy
				factor = 4 * Config.ENERGY_BAR_MAGNIFICATION;
			} else {
				factor = Config.ENERGY_BAR_MAGNIFICATION;
			}
			variation = -factor * chct.duration2Height(value.index);
		}
		switch (value.role) {
			case Config.PLAYER: {
				this.showLayer.moveEnergyBar(variation, Config.LEFT_SERIES);
				this.showLayer.moveEnergyBar(variation, Config.RIGHT_SERIES);
				break;
			}
			case Config.ENEMY.category: {
				this.showLayer.moveEnergyBar(variation, Config.ENEMY.category);
				break;
			}
		}
	},
	/**
	 * related status event function
	 */
	initShowLayer: function(value/*time*/) {
		var player = this.statusCalculateLayer.getChildByName(Config.PLAYER);
		var enemy = this.statusCalculateLayer.getChildByName(Config.ENEMY.category);
		var showLayer = this.showLayer;

		// init player energy index and enemy energy index in show layer
		var playerIndex = player.getEnergyIndex();
		var enemyIndex = enemy.getEnergyIndex();
		showLayer.setEnergyIndex(player.getName(), playerIndex);
		showLayer.setEnergyIndex(enemy.getName(), enemyIndex);
		player.setEnergyBeginTime(playerIndex, value.time);
		enemy.setEnergyBeginTime(enemyIndex, value.time);

		// init attack elements
		showLayer.setAttackEnergyIndex(player.getName(), playerIndex);
		showLayer.setAttackEnergyIndex(enemy.getName(), enemyIndex);
		showLayer.setAttackEnergyTexture(player.getName(), player.getAttackEnergy());
		showLayer.setAttackEnergyTexture(enemy.getName(), enemy.getAttackEnergy());
		var easyTime = player.getAttackTime(Config.EASY_ATTACK_MODE);
		var hardTime = player.getAttackTime(Config.HARD_ATTACK_MODE);
		this.showLayer.initAttackMovement(easyTime, hardTime);

		// init the energy number
		showLayer.Energy[Config.PLAYER].forEach(function(e, i) {
			e.setString(player.singleEnergy[i][Config.ENERGY_QUANTITY]);
		});
		showLayer.Energy[Config.ENEMY.category].forEach(function(e, i) {
			e.setString(enemy.singleEnergy[i][Config.ENERGY_QUANTITY]);
		});

		// init position label
		this.eventCenter.dispatchEvent(Config.events.SET_POSITION_LABEL);

		// init enemy status
		this.showLayer.enemyNoActionStop(); //DEBUG

		// init show layer frame time
		showLayer.frameTime = player.status.frameTime;

		/**
		 *  set show layer frame time
		 * 	TODO
		 * 	is it beautiful enough to start schedule action in here?
		 */
		showLayer.optimizedSchedule(showLayer.energyRotation, showLayer.frameTime);
		//console.log("ENERGY BEGIN!!");
	},
	setEnergyLabel: function(value/*FLAG, index, energy*/) {
		this.showLayer.setEnergyLabel(value.FLAG, value.index, value.energy);
	},
	setPositionLabel: function() {
		// called in init showLayer;
		var chct = this.statusCalculateLayer.getCharacter(Config.PLAYER);
		//console.log(chct.getName() + " set position label");
		this.showLayer.setPositionLabel(chct.getPositionLabel());
	},


	onEnter: function() {
		this._super();
		this.statusCalculateLayer = this.getParent().getChildByName(Config.STATUS_CALCULATE_LAYER);
		this.showLayer = this.getParent().getChildByName(Config.SHOW_LAYER);
		this.operateLayer = this.getParent().getChildByName(Config.OPERATE_LAYER);
		this.eventCenter = this.getParent().eventCenter;
		//this.player = this.statusCalculateLayer.getChildByName(Config.PLAYER);
		//this._setPositionLabel();

		//console.log("flow layer OK!!!");
	},
});