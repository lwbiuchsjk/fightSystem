/**
 * Created by Lee on 2015/11/26.
 */
var EnemyAi = cc.Node.extend({

	showLayer: null,
	eventCenter: null,

	me: null,
	thinkCount: null,

	reflectionTime: null,
	instinctTemplate: null,
	instinct: null,
	acting: null,
	operationPossibility: null,
	maxPossibility: null,
	actionTime: null,

	actionExecutor: null,
	energyExecutor: null,

	ctor: function(fighter, instinct, eventCenter, showLayer){
		this._super();
		this.me = fighter;
		this.eventCenter = eventCenter;
		this.showLayer = showLayer;
		this.thinkCount = 0;
		
		this.reflectionTime = [0.2, 0.5];

		this.instinctTemplate = {};
		this.instinctTemplate[Config.events.EASY_BEGIN] = 20;
		this.instinctTemplate[Config.events.HARD_BEGIN] = 20;
		this.instinctTemplate[Config.events.MOVE_ASIDE_BEGIN] = 20;
		this.instinctTemplate[Config.events.MOVE_FORWARD_BEGIN] = 20;
		this.instinctTemplate[Config.events.MOVE_BACKWARD_BEGIN] = 20;
		this.instinctTemplate[Config.events.DEFENCE_BEGIN] = 20;
		this.instinctTemplate[Config.events.BLOCK_BEGIN] = 20;
		this.instinctTemplate[Config.events.ADJUST_TO_FACE] = 20;
		this.instinctTemplate[Config.events.OPERATE_ADJUST] = -100;
		this.instinctTemplate[Config.OPERATE_EVENT] = 50;

		this.instinct = {};

		this.maxPossibility = {};
		this.maxPossibility[Config.OPERATE_EVENT] = 90;		// NO USE
		this.maxPossibility[Config.UP_INSTINCT] = 90;
		this.maxPossibility[Config.DOWN_INSTINCT] = 10;

		this.acting = {};
		this.acting[Config.events.EASY_BEGIN] = false;
		this.acting[Config.events.HARD_BEGIN] = false;
		this.acting[Config.events.MOVE_ASIDE_BEGIN] = false;
		this.acting[Config.events.MOVE_FORWARD_BEGIN] = false;
		this.acting[Config.events.MOVE_BACKWARD_BEGIN] = false;
		this.acting[Config.events.DEFENCE_BEGIN] = false;
		this.acting[Config.events.BLOCK_BEGIN] = false;
		this.acting[Config.events.ADJUST_TO_FACE] = false;
		this.acting[Config.OPERATE_EVENT] = false;
		// energy event in the other action list, do not use the same action list with the other action.
		this.acting[Config.events.OPERATE_ENERGY_BEGIN] = false;

		this.actionTime = 0;

		this.actionExecutor = new cc.Node.create();
		this.energyExecutor = new cc.Node.create();
		this.addChild(this.actionExecutor);
		this.addChild(this.energyExecutor);
	},
	onEnter: function() {
		this._super();
		this._optimizedSchedule(this.checkCount, this.me.status.frameTime, cc.REPEAT_FOREVER);
		this._resetInstinct();
	},
	checkCount: function() {
		this.thinkCount++;
		if (this.actionTime > 0) {
			this.actionTime -= 20
		} else
		if (this.thinkCount > 0 && this.thinkCount % 10 == 0) {
			this._tactic(this.thinkCount);
		}
	},
	_tactic: function(count) {
		this._resetInstinct();
		var me = this.me;
		var enemy = this.me.status.target;
		if (me.getNoActionTime() <= 0) {
			if (me.enemies.broadsideOnEnemy != null) {
				this._generateActionPos(Config.events.HARD_BEGIN, Config.OP_PLUS, 30);
				this._generateActionPos(Config.events.EASY_BEGIN, Config.OP_PLUS, 60);
				this._generateActionPos(Config.events.MOVE_ASIDE_BEGIN, Config.OP_SET, 0);
			} else
			if (me.enemies.enemyBroadsideOnMe != null) {
				this._generateActionPos(Config.events.ADJUST_TO_FACE, Config.OP_PLUS, 60);
				this._generateActionPos(Config.events.EASY_BEGIN, Config.OP_SET, 0);
				this._generateActionPos(Config.events.HARD_BEGIN, Config.OP_SET, 0);
				this._generateActionPos(Config.events.DEFENCE_BEGIN, Config.OP_SET, 0);

			} else
			if (me.enemies.enemyFacedToMe != null) {
				if (enemy.getNoActionTime() > 0) {
					this._generateActionPos(Config.events.EASY_BEGIN, Config.OP_PLUS, 60);
				} else
				if (enemy.isDefenceBegan()) {
					this._generateActionPos(Config.events.MOVE_ASIDE_BEGIN, Config.OP_PLUS, 60);
				} else
				if (enemy.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN)) {
					if (enemy.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_READY)) {
						if (enemy.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_GO)) {
							this._generateActionPos(Config.events.BLOCK_BEGIN, Config.OP_PLUS, 60);
						} else {
							this._generateActionPos(Config.events.DEFENCE_BEGIN, Config.OP_PLUS, 60);
						}
					} else {
						this._generateActionPos(Config.events.MOVE_ASIDE_BEGIN, Config.OP_PLUS, 60);
					}
				} else
				if (enemy.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN)) {
					if (enemy.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_READY)) {
						if (enemy.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_GO)) {
							this._generateActionPos(Config.events.BLOCK_BEGIN, Config.OP_PLUS, 60);
						} else {
							this._generateActionPos(Config.events.DEFENCE_BEGIN, Config.OP_PLUS, 60);
						}
					} else {
						this._generateActionPos(Config.events.EASY_BEGIN, Config.OP_PLUS, 60);
					}
				} else
				if (enemy.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN)) {
					this._generateActionPos(Config.events.MOVE_ASIDE_BEGIN, Config.OP_PLUS, 60);
					console.log("MOVING!!!")
				} else
				if (enemy.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN)) {
					console.log("COMING TO ME!!!")
				} else
				if (enemy.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN)) {
					console.log("LEAVING ME!!!")
				} else {
					this._generateActionPos(Config.events.EASY_BEGIN, Config.OP_PLUS, 30);
					this._generateActionPos(Config.events.HARD_BEGIN, Config.OP_PLUS, 30);
					this._generateActionPos(Config.events.MOVE_ASIDE_BEGIN, Config.OP_PLUS, 60);
				}
			}
		} else {
			this._setNoActionInstinct();
			/**
			 * TODO
			 * the temporary energy begin action
			 */
			if (Config.ENERGY_WEAK[me.getAttackEnergy()] == me.getTarget().getEnergyIndex() || Config.ENERGY_MIGHTY[me.getTarget().getAttackEnergy()] == me.getEnergyIndex()) {
				console.log("change");
				this._do_operateEnergyBegin();
			}
		}

		/**
		 * TODO
		 * the temporary energy end action
		 */
		if (Config.ENERGY_MIGHTY[me.getAttackEnergy()] == me.getTarget().getEnergyIndex() || Config.ENERGY_WEAK[me.getTarget().getAttackEnergy()] == me.getEnergyIndex()) {
			console.log("stop");
			this._do_operateEnergyEnd();
		}

		var conclusion = this._getAction();
		if (conclusion.action != null) {
			this[conclusion.action](conclusion.FLASH);
		}
	},
	_optimizedSchedule: function(callback, interval) {
		var then = Date.now();
		interval = interval * 1000;
		this.schedule(function() {
			var now = Date.now();
			var delta = now - then;
			if(delta > interval) {
				then = now - (delta % interval);
				callback.call(this);
			}
		}.bind(this), 0);
	},
	/**
	 *
	 * below is the flow control functions.
	 *
	 */
	_isActing: function(FLAG) {
		if (FLAG == null) {
			for (var i in this.acting) {
				if (this.acting[i]) {
					return true;
				}
			}
			return false;
		} else {
			return this.acting[FLAG];
		}
	},
	_openActing: function(FLAG) {
		if (FLAG != null) {
			this.acting[FLAG] = true;
		}
	},
	_closeActing: function(FLAG) {
		if (FLAG != null) {
			this.acting[FLAG] = false;
		}
	},
	_clearActing: function() {
		for (var i in this.acting) {
			this.acting[i] = false;
		}
	},
	_do_Something: function(something, delayTime, condition, CLEAR_FLAG, OPEN_FLAG, CLOSE_FLAG, executor) {
		condition = condition || false;
		if (condition) {
			if (CLEAR_FLAG === true) {
				this._exceptionClearAction(OPEN_FLAG);
			}
			this._openActing(OPEN_FLAG);
			executor.scheduleOnce(function() {
				something();
				this._closeActing(CLOSE_FLAG);
			}.bind(this), delayTime)
		}
	},
	/**
	 *
	 * below is the instinct functions that can filter the specific action from the instinct list
	 *
	 */
	_resetInstinct: function() {
		this.instinct = Object.create(this.instinctTemplate);
	},
	_generateActionPos: function(ACTION, OP, number) {
		var tmp = this.instinct[ACTION];
		var maximum = this.maxPossibility[Config.UP_INSTINCT];
		var minimum = this.maxPossibility[Config.DOWN_INSTINCT];
		var conclusion = this._opNumber(OP, tmp, number);
		if (conclusion > maximum) {
			this.instinct[ACTION] = maximum;
		} else {
			this.instinct[ACTION] = conclusion;
		}
	},
	_opNumber: function(OP, oprand, number) {
		switch(OP) {
			case "+": {
				return oprand + number;
			}
			case "=": {
				return number;
			}
		}
	},
	_getAction: function() {
		var downLimit = Config.POSSIBILITY_SCALE[0];
		var upLimit = Config.POSSIBILITY_SCALE[1];
		var me = this.me;
		var limit = Math.random() * (upLimit - downLimit) + downLimit;
		var actionList = [];
		var flashFlag = Config.OPERATE_EVENT;
		for (var i in this.instinct) {
			var ele = this.instinct[i];
			if (ele > limit) {
				actionList[i] = ele;
			}
		}
		if (flashFlag in actionList) {
			delete actionList[Config.OPERATE_EVENT];
		}
		if (!this._isActing(Config.events.DEFENCE_BEGIN)) {
			delete actionList[Config.events.BLOCK_BEGIN];
		} else {
			delete actionList[Config.events.DEFENCE_BEGIN];
		}
		var nameList = [];
		for (var j in actionList) {
			nameList.push(j);
		}
		if (nameList.length == 0 || this._isActing()) {
			nameList.push(Config.DO_CONTINUE);
		}
		var actionTag = Math.round(Math.random() * (nameList.length - 1)), FLASH;
		if (me.isInAdjustWindow()) {
			var randomFlash = Math.random() * (upLimit - downLimit) + downLimit;
			if (this.instinct[flashFlag] > randomFlash) {
				FLASH = Config.OPERATE_EVENT;
			}
		}
		console.log(actionList);
		return {
			action: "_do_" + nameList[actionTag],
			FLASH: FLASH
		};
	},
	setActionTime: function(number) {
		this.actionTime = number;
	},
	_setNoActionInstinct: function() {
		for (var i in this.instinct) {
			if (i == Config.events.OPERATE_ADJUST) {
				this._generateActionPos(i, Config.OP_SET, 90);
			} else {
				this._generateActionPos(i, Config.OP_SET, 0);
			}
		}
	},
	/**
	 *
	 * below is the specific action functions
	 *
	 */
	_do_easyAttackBegin: function(FLASH) {
		var me = this.me;
		var FLAG = Config.events.EASY_BEGIN;
		var beginCondition = !this._isActing(FLAG) && !me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN);
		console.log("flag: " + FLAG + " is acting: " + this._isActing(FLAG) + " is begin: " + me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN));
		var beginDelay = this._getReflectionTime();
		var beginAction = function () {
			// below is something about begin
			var easyBeginTime = Date.now();
			var easyBeginEvent = {
				role: me.getName(),
				time: easyBeginTime
			};
			console.info("easy begin time: " + easyBeginTime);
			this.eventCenter.dispatchEvent(Config.events.EASY_BEGIN, easyBeginEvent);
			var readyCondition = this._isActing(FLAG) && !me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_READY) && me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN);
			var readyDelay;
			if (FLASH == Config.OPERATE_EVENT) {
				readyDelay = this._getReflectionTime();
			} else {
				readyDelay = me.getAttackTime(Config.EASY_ATTACK_MODE) + this._getReflectionTime();
			}
			var readyAction = function() {
				// below is something about ready
				var easyReadyTime = Date.now();
				var easyReadyEvent = {
					role: me.getName(),
					time: easyReadyTime
				};
				console.info("easy ready duration: " + (easyReadyTime - easyBeginTime));
				if (FLASH == Config.OPERATE_EVENT) {
					this.eventCenter.dispatchEvent(Config.events.ADJUST_GO, easyReadyEvent);
				} else {
					this.eventCenter.dispatchEvent(Config.events.EASY_READY, easyReadyEvent);
				}
				var goDelay = this._getReflectionTime();
				var goCondition = this._isActing(FLAG) && !me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_GO) && me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN);
				var goAction = function() {
					// below is something about go
					var easyGoTime = Date.now();
					var easyGoEvent = {
						role: me.getName(),
						time: easyGoTime
					};
					console.info("easy go duration: " + (easyGoTime - easyReadyTime));
					this.eventCenter.dispatchEvent(Config.events.EASY_GO, easyGoEvent);
				}.bind(this);
				this._do_Something(goAction, goDelay, goCondition, false, null, FLAG, this.actionExecutor);
			}.bind(this);
			this._do_Something(readyAction, readyDelay, readyCondition, false, null, null, this.actionExecutor);
		}.bind(this);
		this._do_Something(beginAction, beginDelay, beginCondition, true, FLAG, null,  this.actionExecutor);
	},
	_do_hardAttackBegin: function(FLASH) {
		var me = this.me;
		var FLAG = Config.events.HARD_BEGIN;
		var beginCondition = !this._isActing(FLAG) && !me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN);
		var beginDelay = this._getReflectionTime();
		var beginAction = function () {
			// below is something about begin
			var hardBeginTime = Date.now();
			var hardBeginEvent = {
				role: me.getName(),
				time: hardBeginTime
			};
			console.log("hard begin time: " + hardBeginTime);
			this.eventCenter.dispatchEvent(Config.events.HARD_BEGIN, hardBeginEvent);
			var readyCondition = this._isActing(FLAG) && !me.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_READY) && me.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN);
			var readyDelay;
			if (FLASH == Config.OPERATE_EVENT) {
				readyDelay = this._getReflectionTime();
			} else {
				readyDelay = me.getAttackTime(Config.HARD_ATTACK_MODE) + this._getReflectionTime();
			}
			var readyAction = function() {
				// below is something about ready
				var hardReadyTime = Date.now();
				var hardReadyEvent = {
					role: me.getName(),
					time: hardReadyTime
				};
				console.log("hard ready duration: " + (hardReadyTime - hardBeginTime));
				if (FLASH == Config.OPERATE_EVENT) {
					this.eventCenter.dispatchEvent(Config.events.ADJUST_GO, hardReadyEvent);
				} else {
					this.eventCenter.dispatchEvent(Config.events.HARD_READY, hardReadyEvent);
				}
				var goDelay = this._getReflectionTime();
				var goCondition = this._isActing(FLAG) && !me.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_GO) && me.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN);
				var goAction = function() {
					// below is something about go
					var hardGoTime = Date.now();
					var hardGoEvent = {
						role: me.getName(),
						time: hardGoTime
					};
					console.log("hard go duration: " + (hardGoTime - hardReadyTime));
					this.eventCenter.dispatchEvent(Config.events.HARD_GO, hardGoEvent);
				}.bind(this);
				this._do_Something(goAction, goDelay, goCondition, false, null, FLAG, this.actionExecutor);
			}.bind(this);
			this._do_Something(readyAction, readyDelay, readyCondition, false, null, null, this.actionExecutor);
		}.bind(this);
		this._do_Something(beginAction, beginDelay, beginCondition, true, FLAG, null, this.actionExecutor);
	},
	/**
	 * function use the Config.events.MOVE_ASIDE_BEGIN FLAG to distinguish whether the AI is doing turn-to-face action.
	 * @private
	 */
	_do_adjustToFace: function(FLASH) {
		var me = this.me;
		var adjustExp = "TURN TO FACE SLOWLY...";
		var FLAG = Config.events.ADJUST_TO_FACE;
		var adjustBeginDelay = this._getReflectionTime();
		var adjustBeginCondition = !this._isActing(FLAG) || (me.isDefenceBegan() && this._isActing(FLAG));
		var adjustBeginAction = function() {
			var adjustBeginTime = Date.now();
			var adjustBeginEvent = {
				role: me.getName(),
				time: adjustBeginTime,
				FLAG: null
			};
			if (FLASH == Config.OPERATE_EVENT) {
				console.log("adjust flash go time: " + adjustBeginTime);
				this.eventCenter.dispatchEvent(Config.events.ADJUST_GO, adjustBeginEvent);
			} else {
				console.log("turn to face begin time:" + adjustBeginTime);
				this.eventCenter.dispatchEvent(Config.events.ADJUST_GO, adjustBeginEvent);
			}
			var adjustGoDelay = this._getReflectionTime() + me.action.adjustTime;
			var adjustGoCondition = this._isActing(FLAG);
			var adjustGoAction = function() {
				var adjustGoTime = Date.now();
				var adjustGoEvent = {
					role: me.getName(),
					time: adjustGoTime
				};
				console.log("turn to face go duration:" + (adjustGoTime - adjustBeginTime));
				this.eventCenter.dispatchEvent(Config.events.ADJUST_TO_FACE, adjustGoEvent);
			}.bind(this);
			if (FLASH != Config.OPERATE_EVENT) {
				this._do_Something(adjustGoAction, adjustGoDelay, adjustGoCondition, false, null, FLAG,  this.actionExecutor)
			}
		}.bind(this);
		if (FLASH == Config.OPERATE_EVENT) {
			this._do_Something(adjustBeginAction, adjustBeginDelay, adjustBeginCondition, true, FLAG, FLAG, this.actionExecutor);
		} else {
			this._do_Something(adjustBeginAction, adjustBeginDelay, adjustBeginCondition, true, FLAG, null, this.actionExecutor);
		}
	},
	/**
	 * AI use this function to move aside. the FLASH is a FLAG to tag whether the method is FLASH. if so, two events and one delay time will be changed. and like the player operate functoin,
	 * AI will change the show layer element in this function, use the "setPositionStatusTexture" function.
	 * @param {string} FLASH
	 * @private
	 */
	_do_moveAsideBegin: function(FLASH) {
		var me = this.me;
		var asideBeginDelay = this._getReflectionTime();
		var FLAG = Config.events.MOVE_ASIDE_BEGIN;
		var asideBeginCondition = !this._isActing(FLAG);
		console.log("out acting: " + this._isActing(FLAG));
		var asideFLAG = Config.LEFT_SERIES;
		var asideBeginAction = function() {
			var asideBeginTime = Date.now();
			var asideBeginEvent = {
				role: me.getName(),
				time: asideBeginTime,
				FLAG: asideFLAG
			};
			console.log("out FLAG: " + FLASH);
			if (FLASH == Config.OPERATE_EVENT) {
				this.eventCenter.dispatchEvent(Config.events.ADJUST_GO, asideBeginEvent);
			} else {
				this.eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_BEGIN, asideBeginEvent);
			}
			this.showLayer.setPositionStatusTexture(asideBeginEvent.FLAG);

			var asideEndDelay;
			if (FLASH == Config.OPERATE_EVENT) {
				asideEndDelay = 0.2;
			} else {
				asideEndDelay = this._getReflectionTime() + me.getMoveDirectionTime(asideFLAG);
			}
			var asideEndCondition = this._isActing(FLAG);
			console.log("in acting: " + this._isActing(FLAG));
			console.log("delay time: " + asideEndDelay);
			var asideEndAction = function() {
				var asideEndTime = Date.now();
				console.log("in FLAG: " + FLASH);
				var asideEndEvent = {
					role: me.getName(),
					time: asideEndTime,
					FLAG: asideFLAG
				};
				if (FLASH == Config.OPERATE_EVENT) {
					this.eventCenter.dispatchEvent(Config.events.ADJUST_GO, asideEndEvent);
				} else {
					this.eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_END, asideEndEvent);
				}
				console.log("move aside end time: " + asideEndTime);
			}.bind(this);
			this._do_Something(asideEndAction, asideEndDelay, asideEndCondition, false, null, FLAG, this.actionExecutor);
		}.bind(this);
		this._do_Something(asideBeginAction, asideBeginDelay, asideBeginCondition, true, FLAG, null, this.actionExecutor);
	},
	_do_defenceBegin: function() {
		var me = this.me;
		var beginDelay = this._getReflectionTime();
		var FLAG = Config.events.DEFENCE_BEGIN;
		var beginCondition = !this._isActing(FLAG) && !me.isDefenceBegan();
		var beginAction = function() {
			var beginTime = Date.now();
			var beginEvent = {
				role: me.getName(),
				time: beginTime
			};
			this.eventCenter.dispatchEvent(Config.events.DEFENCE_BEGIN, beginEvent);
			console.log("enemy defence begin at " + beginTime);
		}.bind(this);
		this._do_Something(beginAction, beginDelay, beginCondition, true, FLAG, null, this.actionExecutor);
	},
	_do_blockBegin: function() {
		var me = this.me;
		var FLAG = Config.events.BLOCK_BEGIN;
		var beginDelay = this._getReflectionTime();
		var beginCondition = me.isDefenceBegan() && !this._isActing(FLAG);
		var beginAction = function() {
			var beginTime = Date.now();
			var beginEvent = {
				role: me.getName(),
				time: beginTime
			};
			this.eventCenter.dispatchEvent(Config.events.BLOCK_BEGIN, beginEvent);
		}.bind(this);
		this._do_Something(beginAction, beginDelay, beginCondition, false, FLAG, FLAG, this.actionExecutor);
	},
	_do_operateAdjust: function() {
		var me = this.me;
		var adjustDelay = this._getReflectionTime();
		var FLAG = Config.OPERATE_EVENT;
		var adjustCondition = !this._isActing(FLAG);
		var adjustAction = function() {
			var adjustEvent = {
				role: me.getName(),
				time: Date.now() + adjustDelay,
				FLAG: null
			};
			this.eventCenter.dispatchEvent(Config.events.ADJUST_GO, adjustEvent);
		}.bind(this);
		this._do_Something(adjustAction, adjustDelay, adjustCondition, false, FLAG, FLAG, this.actionExecutor);
	},
	_do_operateEnergyBegin: function() {
		var me = this.me;
		var operateDelay = this._getReflectionTime();
		var FLAG = Config.events.OPERATE_ENERGY_BEGIN;
		var operateCondition = !this._isActing(FLAG);
		var operateAction = function() {
			var operateEvent = {
				role: me.getName(),
				time: Date.now(),
				index: me.getEnergyIndex()
			};
			this.eventCenter.dispatchEvent(Config.events.OPERATE_ENERGY_BEGIN, operateEvent);
		}.bind(this);
		this._do_Something(operateAction, operateDelay, operateCondition, false, FLAG, null, this.energyExecutor);
	},
	_do_operateEnergyEnd: function() {
		var me = this.me;
		var operateDelay = this._getReflectionTime();
		var FLAG = Config.events.OPERATE_ENERGY_BEGIN;
		var operateCondition = this._isActing(FLAG);
		var operateAction = function() {
			var operateEvent = {
				role: me.getName(),
				time: Date.now()
			};
			this.eventCenter.dispatchEvent(Config.events.OPERATE_ENERGY_END, operateEvent);
		}.bind(this);
		this._do_Something(operateAction, operateDelay, operateCondition, false, null, FLAG, this.energyExecutor);

	},
	_do_moveForwardBegin: function() {

	},
	_do_moveBackwardBegin: function() {

	},
	_do_continue: function() {

	},
	/**
	 * the clear method must used in the _do_Something method, and within the judge condition
	 * @private
	 */
	clearAction: function(exception) {
		var me = this.me;
		// attack clear
		me.attackEnded();
		this.showLayer.enemyAttackEnd();
		// position clear
		me.cleanMoveDirection();
		this.eventCenter.dispatchEvent(Config.events.SET_POSITION_LABEL, me.getName());
		// defence clear
		var FLAG = Config.events.DEFENCE_END;
		var defenceEndCondition = !me.isDefenceEnded();
		var defenceEndDelay = 0;
		var defenceEndAction = function() {
			var defenceEndTime = Date.now();
			var defenceEndEvent = {
				role: me.getName(),
				time: defenceEndTime,
			};
			this.eventCenter.dispatchEvent(Config.events.DEFENCE_END, defenceEndEvent);
		}.bind(this);
		this._do_Something(defenceEndAction, defenceEndDelay, defenceEndCondition, false, null, FLAG, this.actionExecutor);
		// acting clear
		this._clearActing();
		this._openActing(exception);
		console.error("clear");

		this.actionExecutor.unscheduleAllCallbacks();
	},
	closeDefence: function() {
		this._closeActing(Config.events.DEFENCE_BEGIN);
		this._closeActing(Config.events.BLOCK_BEGIN);
	},
	_getReflectionTime: function() {
		var begin = this.reflectionTime[0], end = this.reflectionTime[1];
		return Math.random() * (end - begin) + begin;
	},
	/**
	 * the function is used to filter the condition when AI is acting but he wants to stop to do other thing
	 * the exception must be the Config event. the detail is in the below.
	 * @param {string} exception
	 * must be the Config events String like
	 * Config.events.EASY_BEGIN;
	 * Config.events.HARD_BEGIN;
	 * Config.events.MOVE_ASIDE_BEGIN;
	 * Config.events.MOVE_FORWARD_BEGIN;
	 * Config.events.MOVE_BACKWARD_BEGIN;
	 * Config.events.DEFENCE_BEGIN;
	 * Config.events.BLOCK_BEGIN; 		???
	 * Config.events.ADJUST_TO_FACE;	???
	 * null;
	 * @private
	 */
	_exceptionClearAction: function(exception) {
		var me = this.me;
		var condition =
			(me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN) ||
			me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN) ||
			me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN) ||
			me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN) ||
			me.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN) || me.isDefenceBegan());
		switch(exception) {
			case Config.events.MOVE_ASIDE_BEGIN : {
				condition = condition && !me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN);
				break;
			}
			case Config.events.MOVE_BACKWARD_BEGIN : {
				condition = condition && !me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN);
				break;
			}
			case Config.events.MOVE_FORWARD_BEGIN : {
				condition = condition && !me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN);
				break;
			}
			case Config.events.EASY_BEGIN : {
				condition = condition && !me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN);
				break;
			}
			case Config.events.HARD_BEGIN : {
				condition = condition && !me.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN);
				break;
			}
			case Config.events.DEFENCE_BEGIN : {
				condition = condition && !me.isDefenceBegan();
				break;
			}
		}
		if (condition) {
			this.clearAction(exception);
		}
	},
});
