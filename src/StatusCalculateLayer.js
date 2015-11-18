/**
 * Created by Lee on 2015/11/3.
 */
var StatusCalculateLayer = cc.Layer.extend({
	showLayer: null,

	ctor: function() {
		this._super();
		this.init();
		this.setName(Config.STATUS_CALCULATE_LAYER);

		var player = new CharacterStatus();
		player.setName(Config.PLAYER);
		this.addChild(player);
		this._initEnemies();
	},

	getCharacter: function(character) {
		return this.getChildByName(character);
	},

	_initEnemies: function() {
		var enemy = new CharacterStatus();
		enemy.setName(Config.ENEMY.category);
		this.addChild(enemy);
	},

	/**
	 * TODO
	 * how to init the character in one scene
	 */
	onEnter: function() {
		this._super();
		this.showLayer = this.getParent().getChildByName(Config.SHOW_LAYER);

		var player = this.getChildByName(Config.PLAYER);
		var enemy = this.getChildByName(Config.ENEMY.category);
		player.setEnemy(enemy, Config.ENEMY_FACED_TO_ME);
		player.setTarget(enemy);
		enemy.setEnemy(player, Config.ENEMY_FACED_TO_ME);
	}
});

var CharacterStatus = cc.Node.extend({

	showLayer: null,
	eventCenter: null,

	easyAttack: null,
	hardAttack: null,
	adjustPosition: null,
	defenceAction: null,
	energy: null,
	status: null,
	enemies: null,
	action: null,

	ctor: function() {
		this._super();
		console.info("STATUS OK!!!");

		this.easyAttack = new Array(3);
		this.easyAttack[Config.events.EASY_BEGIN] = 0;
		this.easyAttack[Config.events.EASY_READY] = 0;
		this.easyAttack[Config.events.EASY_GO] = 0;

		this.hardAttack = new Array(3);
		this.hardAttack[Config.events.HARD_BEGIN] = null;
		this.hardAttack[Config.events.HARD_READY] = null;
		this.hardAttack[Config.events.HARD_GO] = null;

		this.adjustPosition = new Array(9);
		this.adjustPosition[Config.events.MOVE_ASIDE_BEGIN] = null;
		this.adjustPosition[Config.events.MOVE_FORWARD_BEGIN] = null;
		this.adjustPosition[Config.events.MOVE_BACKWARD_BEGIN] = null;
		this.adjustPosition[Config.events.MOVE_ASIDE_END] = null;
		this.adjustPosition[Config.events.MOVE_FORWARD_END] = null;
		this.adjustPosition[Config.events.MOVE_BACKWARD_END] = null;
		this.adjustPosition[Config.events.POSITION_BEGIN] = null;
		this.adjustPosition[Config.events.POSITION_END] = null;
		this.adjustPosition[Config.events.OPERATE_ADJUST] = null;

		this.defenceAction = new Array(5);
		this.defenceAction[Config.events.DEFENCE_BEGIN] = null;
		this.defenceAction[Config.events.DEFENCE_END] = null;
		this.defenceAction[Config.events.BLOCK_BEGIN] = null;
		this.defenceAction[Config.events.BLOCK_FAIL] = null;
		this.defenceAction[Config.events.BLOCK_GO] = null;

		this.energy = new Array(7);
		for (var i = 0; i < Config.ENERGY_LENGTH; i++) {
			//init energy. should be replaced
			this.energy[i] = {};
			this.energy[i][Config.events.ENERGY_DURATION_BEGIN] = 0;
			this.energy[i][Config.ENERGY_QUANTITY] = 48;
			this.energy[i].energyDuration = Config.duration.ENERGY[i];
		}
		this.energy[Config.events.OPERATE_ENERGY_BEGIN] = 0;
		this.energy[Config.events.OPERATE_ENERGY_END] = 0;

		this.status = {};
		this.status.energyIndex = 0;
		this.status.getWounded = 1;
		this.status.ATTACK_ENERGY = this.status.energyIndex;
		this.status.target = {};
		this.status.noAction = 0;
		this.status.adjustPositionWindow = 0;
		this.status.enemyMoving = null;
		this.status.frameTime = Config.duration.FRAME_TIME / 1000;

		this.action = {};
		this.action.blockPunishment = 250;
		this.action.blockBonus = 250;
		this.action.easyTime = Config.duration.EASY_BUTTON / 1000;
		this.action.hardTime = Config.duration.HARD_BUTTON / 1000;
		this.action.hitTime = Config.duration.HIT_TIME / 1000;
		this.action.adjustTime = Config.duration.ADJUST_POSITION_BUTTON / 1000;
		this.action.maxDefenceTime = Config.duration.DEFENCE_MAX_TIME / 1000;
		this.action.blockWindow = Config.duration.BLOCK_WINDOW / 1000;
		this.action.maxNoActionTime = Config.duration.MAX_NO_ACTON_TIME;
		this.action.adjustWindow = Config.duration.ADJUST_POSITION_WINDOW / 1000;
		this.action.directionTime = Config.duration.ADJUST_POSITION_BUTTON / 1000;
		this.action.defenceDuration = Config.duration.DEFENCE_MAX_TIME / 1000;
		this.action.movingEvent = {
			me: {
				begin: null,
				end: null
			},
			enemy: {
				begin: null,
				end: null
			}
		};

		this.enemies = {
			ENEMY_FACED_TO_ME: null,
			ENEMY_BROADSIDE_ON_ME: null,
			BROADSIDE_ON_ENEMY: null,
		};

	},
	onEnter: function() {
		this._super();

		this.showLayer = this.getParent().getParent().getChildByName(Config.SHOW_LAYER);
		this.eventCenter = this.getParent().getParent().eventCenter;
		this.optimizedSchedule(this.checkStatus, this.status.frameTime);
	},

	setActionTime: function(action, event, time){
		this[action][event] = time;
	},
	isHappened: function(action, event) {
		return this[action][event] != null && this[action][event] > 0;
	},

	/**
	 * attack action function
	 */
	getEasyTime: function() {
		return this.action.easyTime;
	},
	getHardTime: function() {
		return this.action.hardTime;
	},
	attackEnded: function() {
		for (var i in this.easyAttack) {
			this.easyAttack[i] = null;
		}
		for (var i in this.hardAttack) {
			this.hardAttack[i] = null;
		}
	},
	isAttacked: function() {
		return this.status.getWounded > 0;
	},
	getHitTime: function() {
		return this.action.hitTime;
	},
	setAttackEnergy: function(index) {
		if (0 < index && index < Config.ENERGY_LENGTH) {
			this.status.ATTACK_ENERGY = index;
		}
	},
	getAttackEnergy: function() {
	 	return this.status.ATTACK_ENERGY;
	},
	checkWound: function(index, kind, positionCondition, defenceCondition) {
		var wound = Config[kind].getWounded;
		var noAction = Config[kind].noAction;
		var myIndex = this.getEnergyIndex();
		if (this.isAttacked()) {
			if (positionCondition) {
				if (defenceCondition) {
					wound += Config.ATTACK_EFFECT.defenceAction.getWounded;
				} else {
				}
			} else {
				wound += Config.ATTACK_EFFECT.ENEMY_BROADSIDE_ON_ME.getWounded;
				noAction += Config.ATTACK_EFFECT.ENEMY_BROADSIDE_ON_ME.noAction;
			}
			if (this.getMightyEnergy(index) == myIndex) {
				wound += Config.ATTACK_EFFECT.ENERGY_MIGHTY.getWounded;
			}
			if (this.getWeakEnergy(index)  == myIndex) {
				wound += Config.ATTACK_EFFECT.ENERGY_WEAK.getWounded;
			}
			var energy = this.getEnergy(myIndex) - wound;
			this.setEnergy(myIndex, energy);
			this.setNoActionTime(noAction);
			var labelEvent = {
				FLAG: this.getName(),
				index: myIndex,
				energy: energy
			};
			this.eventCenter.dispatchEvent(Config.events.SET_ENERGY_LABEL, labelEvent);
		}
	},
	/**
	 * position action function
	 */
	isAdjustPosition: function(endTime) {
		return endTime - this.adjustPosition[Config.events.POSITION_BEGIN] < this.action.adjustTime * 1000;
	},
	cleanMoveDirection: function() {
		for (var i in this.adjustPosition) {
			this.adjustPosition[i] = null;
		}
		this.setEnemyMoving(null);
	},
	getPositionDuration: function() {
		return this.action.adjustTime;
	},
	adjustPositionGo: function() {
	},
	setAdjustWindow: function() {
		this.status.adjustPositionWindow = this.action.adjustWindow;
		console.info("ADJUST GO!!!");
	},
	isInAdjustWindow: function() {
		return this.status.adjustPositionWindow <= 0;
	},
	isSatisfiedMoveTime: function(FLAG) {
		switch(FLAG) {
			case Config.LEFT_SERIES : {
				return this.adjustPosition[Config.events.MOVE_ASIDE_END] - this.adjustPosition[Config.events.MOVE_ASIDE_BEGIN] >= this.action.adjustTime;
			}
			case Config.RIGHT_SERIES: {
				return this.adjustPosition[Config.events.MOVE_ASIDE_END] - this.adjustPosition[Config.events.MOVE_ASIDE_BEGIN] >= this.action.adjustTime;
			}
			case Config.MOVE_FORWARD: {
				return this.adjustPosition[Config.events.MOVE_FORWARD_END] - this.adjustPosition[Config.events.MOVE_FORWARD_BEGIN] >= this.action.adjustTime;
			}
			case Config.MOVE_BACKWARD: {
				return this.adjustPosition[Config.events.MOVE_BACKWARD_END] - this.adjustPosition[Config.events.MOVE_BACKWARD_BEGIN] >= this.action.adjustTime;
			}
		}
	},
	getMoveDirectionTime: function() {
		return this.action.directionTime;
	},
	/**
	 * defence action function
	 */
	isDefenceBegan: function() {
		return (this.isHappened(Config.DEFENCE_ACTION, Config.events.DEFENCE_BEGIN) && (!this.isHappened(Config.DEFENCE_ACTION, Config.events.DEFENCE_END)
		|| this.defenceAction[Config.events.DEFENCE_BEGIN] > this.defenceAction[Config.events.DEFENCE_END]))
	},
	isDefenceEnded: function() {
		return (this.isHappened(Config.DEFENCE_ACTION, Config.events.DEFENCE_END) && this.defenceAction[Config.events.DEFENCE_END] > this.defenceAction[Config.events.DEFENCE_BEGIN])
	},
	setDefenceDuration: function(FLAG) {
		var beginTime = this.defenceAction[Config.events.DEFENCE_BEGIN];
		var endTime = this.defenceAction[Config.events.DEFENCE_END];
		switch (FLAG) {
			case Config.events.DEFENCE_BEGIN: {
				if (beginTime != null && endTime != null) {
					this.action.defenceDuration = Math.min(beginTime - endTime + this.getDefenceDuration(), this.action.maxDefenceTime * 1000);
				}
				break;
			}
			case Config.events.DEFENCE_END: {
				this.action.defenceDuration = Math.max(this.getDefenceDuration() - (endTime - beginTime), 0);
				break;
			}
		}
	},
	getDefenceDuration: function() {
		return this.action.defenceDuration;
	},
	isBlockReady: function(time) {
		return time - this.defenceAction[Config.events.DEFENCE_BEGIN] < this.getDefenceDuration()
			&& this.defenceAction[Config.events.DEFENCE_END] < this.defenceAction[Config.events.DEFENCE_BEGIN];
	},
	getBlockWindowBegin: function() {
	 	return this.status.getWounded - this.action.blockWindow;
	},
	calcDefenceEndTime: function(time) {
		return this.action.maxDefenceTime - time;
	},
	checkBlock: function(time) {
		if (this.isAttacked()) {
			var blockEvent;
			if (this.getBlockWindowBegin() < time && time < this.status.getWounded) {
				this.setActionTime(Config.CHARACTER_STATUS, Config.events.GET_WOUNDED, 0);
				blockEvent = {
					role: this.getTarget(),
					noAction: this.action.blockBonus,
				};
				this.eventCenter.dispatchEvent(Config.events.BLOCK_GO, blockEvent);
			} else {
				/*
				 * here could be the fail block action
				 */
				this.setNoActionTime(this.action.blockPunishment);
				console.error("BLOCK FAIL!!!");
			}
		} else {
			/*
			 * here could be the shield attack action
			 */
			this.setNoActionTime(this.action.blockPunishment);
			console.info("CAN SHIELD ATTACK!!!");
		}
		this.eventCenter.dispatchEvent(Config.events.DEFENCE_END, {role: Config.PLAYER, time: Date.now()});
	},
	/**
	 * energy action function
	 */
	setEnergyIndex: function(index) {
		this.status.energyIndex = index;
	},
	getEnergyIndex: function() {
		return this.status.energyIndex;
	},
	isOperateEnergyBegan: function() {
		return (this.energy[Config.events.OPERATE_ENERGY_BEGIN] > this.energy[Config.events.OPERATE_ENERGY_END]);
	},
	isOperateEnergyEnded: function() {
		return (this.energy[Config.events.OPERATE_ENERGY_END] > this.energy[Config.events.OPERATE_ENERGY_BEGIN]);
	},
	getEnergyOperationBegin: function() {
		return this.energy[Config.events.OPERATE_ENERGY_BEGIN];
	},
	getEnergyOperationEnd: function() {
		return this.energy[Config.events.OPERATE_ENERGY_END];
	},
	setEnergyBeginTime: function(index, time) {
		this.energy[index][Config.events.ENERGY_DURATION_BEGIN] = time;
	},
	duration2Height: function(index) {
		return Config.MOVE_BUTTON_Y * 2 / (Config.duration.ENERGY[index] / this.status.frameTime / 1000);
	},
	getEnergyDuration: function(index) {
		return Config.duration.ENERGY[index];
	},
	getEnergyBeginTime: function(index) {
		return this.energy[index][Config.events.ENERGY_DURATION_BEGIN];
	},
	isOneDuration: function(lastIndex, thisIndex) {
		var thisBegin = this.getEnergyBeginTime(thisIndex);
		var lastBegin = this.getEnergyBeginTime(lastIndex);
		var lastDuration = this.getEnergyDuration(lastIndex);
		var condition = thisBegin - lastBegin >=  lastDuration / Config.ENERGY_BAR_MAGNIFICATION - Config.ENERGY_DURATION_SAFE_WINDOW;
		if (thisBegin - lastBegin < lastDuration / Config.ENERGY_BAR_MAGNIFICATION) {
			console.log("last time: %d, this, time: %d, index: %d, minus: %d", lastBegin, thisBegin, thisIndex, thisBegin - lastBegin);
		}
		return condition;
	},
	getMightyEnergy: function(index) {
		return Config.ENERGY_MIGHTY[index];
	},
	getWeakEnergy: function(index) {
		return Config.ENERGY_WEAK[index];
	},
	setEnergy: function(index, energy) {
		this.energy[index][Config.ENERGY_QUANTITY] = energy;
	},
	getEnergy: function(index) {
		return this.energy[index][Config.ENERGY_QUANTITY];
	},
	
	/**
	 *
	 * status, enemies, action
	 *
	 */
	setEnemy: function(enemy, position) {
		for (var i in this.enemies) {
			if (position == i) {
				this.enemies[position] = enemy;
			} else {
				this.enemies[i] = null;
			}
		}
	},
	isEnemyPosition: function(position, enemy) {
		if (enemy != null) {
			return enemy == this.enemies[position];
		} else {
			return this.getTarget() == this.enemies[position];
		}
	},
	delEnemy: function(enemy) {
		for (var i in this.enemies) {
			if (enemy == this.enemies[i]) {
				this.enemies[i] = null;
			}
		}
	},
	setTarget: function(enemy) {
		this.status.target = enemy;
	},
	getTarget: function() {
		return this.status.target;
	},
	isTarget: function(target) {
		return 	target == this.status.target;
	},
	setNoActionTime: function(time) {
		var wholeTime = this.getNoActionTime() + time;
		var FLAG;
		if (wholeTime <= this.action.maxNoActionTime) {
			this.status.noAction = wholeTime;
		} else {
			this.status.noAction = this.action.maxNoActionTime;
		}
		if (this.isInAdjustWindow()) {
			FLAG = Config.ADJUST_POSITION;
		}
		var noActionEvent = {
			character: this.getName(),
			FLAG: FLAG
		};
		this.eventCenter.dispatchEvent(Config.events.NO_ACTION_GO, noActionEvent);
	},
	getNoActionTime: function() {
		return this.status.noAction;
	},
	/**
	 * @param {Number} value
	 * can only be null, 0, 1;
	 */
	setEnemyMoving: function(value) {
		this.status.enemyMoving = value;
	},
	getEnemyMoving: function() {
		return this.status.enemyMoving;
	},
	setMovingEvent: function(value/*me, enemy*/) {
		var event = this.action.movingEvent;
		if (event.me.begin == null || event.enemy.begin == null || event.me.begin < value.me.begin || event.enemy.begin < value.enemy.begin) {
			this.action.movingEvent = value;
			if ((value.me.end != null && value.enemy.end == null) || (value.me.end != null && value.enemy.end != null && value.me.end < value.enemy.end)) {
				this.enemies.BROADSIDE_ON_ENEMY = this.getTarget();
				this.enemies.ENEMY_FACED_TO_ME = null;
				console.log("%s: MOVE TO ENEMY ASIDE!!!", this.getName());
			} else
			if ((value.enemy.end != null && value.me.end == null) || (value.me.end != null && value.enemy.end != null && value.enemy.end < value.me.end)) {
				this.enemies.ENEMY_BROADSIDE_ON_ME = this.getTarget();
				this.enemies.ENEMY_FACED_TO_ME = null;
				console.log("%s: ENEMY MOVES TO OUR ASIDE!!!", this.getName());
			} else {
				console.error("MOVING ERROR!!!");
			}
		}
	},
	getPositionLabel: function() {
		for (var i in this.enemies) {
			var enemy = this.enemies[i];
			if (enemy != null) {
				return i;
			}
		}
	},
	/**
	 * @param {string} FLAG
	 * the function use FLAG to distinguish the callee function. the FLAG is the Config events String.
	 */
	checkPosition: function(FLAG) {
		if (this.isEnemyPosition(Config.ENEMY_FACED_TO_ME) && FLAG == Config.events.MOVE_ASIDE_END) {
			var meAsideBegin = this.adjustPosition[Config.events.MOVE_ASIDE_BEGIN];
			var meAsideEnd = this.adjustPosition[Config.events.MOVE_ASIDE_END];
			var moving = this.getEnemyMoving();
			if ((meAsideBegin != null && meAsideEnd != null && moving != 1) || moving == 1) {
				var enemyAsideBegin = this.getTarget().adjustPosition[Config.events.MOVE_ASIDE_BEGIN];
				var enemyAsideEnd = this.getTarget().adjustPosition[Config.events.MOVE_ASIDE_END];
				var movingConclusion = {
					me: {
						begin: meAsideBegin,
						end: meAsideEnd
					},
					enemy: {
						begin: enemyAsideBegin,
						end: enemyAsideEnd
					}
				};
				var dispatchConclusion = {
					me: movingConclusion.enemy,
					enemy: movingConclusion.me
				};
				this.setMovingEvent(movingConclusion);
				this.getTarget().setMovingEvent(dispatchConclusion);
			}
		} else
		if ((this.isEnemyPosition(Config.ENEMY_BROADSIDE_ON_ME) || this.isEnemyPosition(Config.BROADSIDE_ON_ENEMY)) && FLAG == Config.events.ADJUST_TO_FACE ) {
			this.setEnemy(this.getTarget(), Config.ENEMY_FACED_TO_ME);
			this.getTarget().setEnemy(this, Config.ENEMY_FACED_TO_ME);
			console.log("ENEMY FACED TO ME!!!");
		}
		this.cleanMoveDirection();
		this.eventCenter.dispatchEvent(Config.events.SET_POSITION_LABEL);
	},
	checkStatus: function() {
		if (this.status.noAction > 0) {
			this.status.noAction -= 1;
		} else
		if (this.status.noAction <= 0) {
			var noActionEvent = {
				character: this.getName()
			};
			this.eventCenter.dispatchEvent(Config.events.NO_ACTION_STOP, noActionEvent);
		}
		if (this.status.adjustPositionWindow > 0) {
			this.status.adjustPositionWindow -= 5;
		}
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

});
