/**
 * Created by Lee on 2015/11/26.
 */
var EnemyAi = cc.Node.extend({
	reflectionTime: null,
	me: null,
	instinct: null,
	eventCenter: null,
	executor: null,
	acting: null,
	ctor: function(fighter, instinct, eventCenter){
		this._super();
		this.me = fighter;
		this.reflectionTime = instinct;
		this.eventCenter = eventCenter;
		this.acting = false;
		this.executor = new cc.Node.create();
		this.addChild(this.executor);
	},
	tactic: function() {
		//console.log("rotation");
		var me = this.me;
		var enemy = this.me.status.target;
		if (me.getNoActionTime() <= 0) {
			if (me.enemies.broadsideOnEnemy != null) {
				this._doEasyAttack();
			} else
			if (me.enemies.enemyBroadsideOnMe != null) {
				if (me.isInAdjustWindow()) {
					this._doTurnToFaceFlash();
				} else {
					console.log("TURN TO FACE SLOWLY......")
				}
			} else
			if (me.enemies.enemyFacedToMe != null) {
				if (enemy.getNoActionTime() > 0) {
					this._doEasyAttack();
				} else
				if (enemy.isDefenceBegan()) {
					console.log("SHOULD THINK");
				} else
				if (enemy.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN)) {
					console.log("EASY COMING!!!");
				} else
				if (enemy.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN)) {
					console.log("HARD COMING!!!");
				} else
				if (enemy.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN)) {
					console.log("MOVING!!!")
				} else
				if (enemy.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN)) {
					console.log("COMING TO ME!!!")
				} else
				if (enemy.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN)) {
					console.log("LEAVING ME!!!")
				} else {
					console.log("nothing");
					this._doEasyAttack();
				}
			}
		} else
		if (me.isInAdjustWindow()) {
			console.log("ready to adjust");
			var adjustDelay = this._getReflectionTime();
			var adjustCondition = !this._isActing();
			var adjustAction = function() {
				this._clearAction();
				var adjustEvent = {
					role: me.getName(),
					time: Date.now() + adjustDelay,
					FLAG: null
				};
				this.eventCenter.dispatchEvent(Config.events.ADJUST_GO, adjustEvent);
			}.bind(this);
			this._doSomething(adjustAction, adjustDelay, adjustCondition, true, "enemy adjust");
		} else {
			this._clearAction();
		}
	},
	onEnter: function() {
		this._super();
		this.optimizedSchedule(this.tactic, this.me.status.frameTime, cc.REPEAT_FOREVER);
	},
	optimizedSchedule: function(callback, interval) {
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
	_isActing: function() {
		return this.acting;
	},
	_setActing: function(value) {
		this.acting = value;
	},
	_doSomething: function(something, delayTime, condition, OFF_ACTING, exp) {
		condition = condition || false;

		if (condition) {
			this._setActing(true);
			this.executor.scheduleOnce(function() {
				if (exp != null) {
					console.log(exp);
				}
				something();
				OFF_ACTING && this._setActing(false);
			}.bind(this), delayTime)
		}
	},
	_doEasyAttack: function() {
		var me = this.me;
		var beginCondition = !this._isActing() && !me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN);
		var beginDelay = this._getReflectionTime();
		var beginAction = function () {
			if (me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN) || me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN) ||
				me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN) || me.isHappened(Config.DEFENCE_ACTION, Config.events.DEFENCE_BEGIN) ||
				me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN)) {
				this._clearAction();
			}
			// below is something about begin
			var easyBeginEvent = {
				role: me.getName(),
				time: new Date().getTime()
			};
			this.eventCenter.dispatchEvent(Config.events.EASY_BEGIN, easyBeginEvent);
			var readyCondition = this._isActing() && !me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_READY) && me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN);
			var readyDelay = me.action.easyTime + this._getReflectionTime();
			var readyAction = function() {
				// below is something about ready
				var easyReadyEvent = {
					role: me.getName(),
					time: new Date().getTime()
				};
				this.eventCenter.dispatchEvent(Config.events.EASY_READY, easyReadyEvent);
				var goDelay = this._getReflectionTime();
				var goCondition = this._isActing() && !me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_GO) && me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN);
				var goAction = function() {
					// below is something about go
					var easyGoEvent = {
						role: me.getName(),
						time: new Date().getTime()
					};
					this.eventCenter.dispatchEvent(Config.events.EASY_GO, easyGoEvent);
					console.log("attack down");
				}.bind(this);
				this._doSomething(goAction, goDelay, goCondition, true);
			}.bind(this);
			this._doSomething(readyAction, readyDelay, readyCondition, true);
		}.bind(this);
		this._doSomething(beginAction, beginDelay, beginCondition, false);
	},
	_doTurnToFaceFlash: function() {
		var me = this.me;
		var adjustExp = "TURN TO FACE QUICKLY!!!";
		var adjustDelay = this._getReflectionTime();
		var adjustCondition = !this._isActing();
		var adjustAction = function() {
			if (me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN) || me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN) ||
				me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN) || me.isHappened(Config.DEFENCE_ACTION, Config.events.DEFENCE_BEGIN) ||
				me.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN) || me.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN) ||
				me.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN)) {
				this._clearAction();
			}
			var adjustEvent = {
				role: me.getName(),
				time: Date.now(),
				FLAG: null
			};
			this.eventCenter.dispatchEvent(Config.events.ADJUST_GO, adjustEvent);
		}.bind(this);
		this._doSomething(adjustAction, adjustDelay, adjustCondition, true, adjustExp);
	},
	/**
	 * the clear method must used in the _doSomething method, and within the judge condition
	 * @private
	 */
	_clearAction: function() {
		this._setActing(false);
		this.me.attackEnded();
		this.me.cleanMoveDirection();
		this.executor.unscheduleAllCallbacks();
	},
	_getReflectionTime: function() {
		return this.reflectionTime;
	},
});
