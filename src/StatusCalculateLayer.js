/**
 * Created by Lee on 2015/11/3.
 */
var StatusCalculateLayer = cc.Layer.extend({

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
		var player = this.getChildByName(Config.PLAYER);
		var enemy = this.getChildByName(Config.ENEMY.category);
		player.addEnemy(enemy, Config.ENEMY_FACED_TO_ME);
		player.setTarget(enemy);
		enemy.addEnemy(player, Config.ENEMY_FACED_TO_ME);
		player.attr({
			hello :true
		});
	}
});

var CharacterStatus = cc.Node.extend({

	easyAttack: null,
	hardAttack: null,
	adjustPosition: null,
	defenceAction: null,
	defenceDuration: null,
	energy: null,
	status: null,
	enemies: null,
	eventCenter: null,

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

		this.adjustPosition = new Array(5);
		this.adjustPosition[Config.events.MOVE_ASIDE] = null;
		this.adjustPosition[Config.events.MOVE_FORWARD] = null;
		this.adjustPosition[Config.events.MOVE_BACKWARD] = null;
		this.adjustPosition[Config.events.POSITION_BEGIN] = null;
		this.adjustPosition[Config.events.POSITION_END] = null;
		this.adjustPosition[Config.events.ADJUST_FINISHED] = null;

		this.defenceAction = new Array(5);
		this.defenceAction[Config.events.DEFENCE_BEGIN] = null;
		this.defenceAction[Config.events.DEFENCE_END] = null;
		this.defenceAction[Config.events.BLOCK_BEGIN] = null;
		this.defenceAction[Config.events.BLOCK_FAIL] = null;
		this.defenceAction[Config.events.BLOCK_GO] = null;
		this.defenceDuration = Config.duration.DEFENCE_MAX_TIME;

		this.energy = new Array(7);
		for (var i = 0; i < Config.ENERGY_LENGTH; i++) {
			//init energy. should be replaced
			this.energy[i] = {};
			this.energy[i][Config.events.ENERGY_DURATION_BEGIN] = 0;
			this.energy[i][Config.ENERGY_QUANTITY] = 48;
		}
		this.energy[Config.events.OPERATE_ENERGY_BEGIN] = 0;
		this.energy[Config.events.OPERATE_ENERGY_END] = 0;

		this.status = {};
		this.status.ENERGY_INDEX = 0;
		this.status.GET_ATTACKED = false;
		this.status.ATTACK_ENERGY = this.status.ENERGY_INDEX;
		this.status.TARGET = {};
		this.status.noAction = 0;

		this.enemies = {
			ENEMY_FACED_TO_ME: null,
			ENEMY_BROADSIDE_ON_ME: null,
			BROADSIDE_ON_ENEMY: null,
		};

	},
	onEnter: function() {
		this._super();

		this.eventCenter = this.getParent().getParent().eventCenter;
	},

	setActionTime: function(action, event, time){
		this[action][event] = time;
	},
	isHappened: function(action, event) {
		return this[action][event] != null
	},

	/**
	 * attack action function
	 */
	getEasyTime: function() {
		return Config.duration.EASY_BUTTON / 1000;
	},
	getHardTime: function() {
		return Config.duration.HARD_BUTTON / 1000;
	},
	attackEnded: function() {
		for (var i in this.easyAttack) {
			this.easyAttack[i] = null;
		}
		for (var i in this.hardAttack) {
			this.hardAttack[i] = null;
		}
	},
	setAttacked: function(FLAG) {
		if(FLAG === true|| FLAG === false) {
			this.status.GET_ATTACKED = FLAG;
		}
	},
	isAttacked: function() {
		return this.status.GET_ATTACKED;
	},
	getHitTime: function() {
		return Config.duration.HIT_TIME / 1000;
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
		var myIndex = this.status.ENERGY_INDEX;
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
			this.setNoActionTime(this.getNoActionTime() + noAction);
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
		return endTime - this.adjustPosition[Config.events.POSITION_BEGIN] < Config.duration.ADJUST_POSITION_BUTTON;
	},
	adjustPositionEnded: function() {
		for (var i in this.adjustPosition) {
			this.adjustPosition[i] = null;
		}
	},
	getPositionEndTime: function() {
		return this.adjustPosition[Config.events.POSITION_END];
	},
	getPositionDuration: function() {
		return Config.duration.ADJUST_POSITION_BUTTON / 1000;
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
					this.defenceDuration = Math.min(beginTime - endTime + this.defenceDuration, Config.duration.DEFENCE_MAX_TIME);
				}
				break;
			}
			case Config.events.DEFENCE_END: {
				this.defenceDuration = Math.max(this.defenceDuration - (endTime - beginTime), 0);
				break;
			}
		}
	},
	getDefenceDuration: function() {
		return this.defenceDuration;
	},
	isBlockReady: function(time) {
		return time - this.defenceAction[Config.events.DEFENCE_BEGIN] < this.defenceDuration;
	},
	calcDefenceEndTime: function(time) {
		return Config.duration.DEFENCE_MAX_TIME / 1000 - time;
	},
	/**
	 * energy action function
	 */
	setEnergyIndex: function(index) {
		this.status.ENERGY_INDEX = index;
	},
	getEnergyIndex: function() {
		return this.status.ENERGY_INDEX;
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
		return Config.MOVE_BUTTON_Y * 2 / (Config.duration.ENERGY[index] / Config.duration.FRAME_TIME);
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
	 * enemies
	 */
	addEnemy: function(enemy, position) {
		this.enemies[position] = enemy;
	},
	isEnemyPosition: function(enemy, position) {
		return enemy == this.enemies[position];
	},
	delEnemy: function(enemy) {
		for (var i in this.enemies) {
			if (enemy == this.enemies[i]) {
				this.enemies[i] = null;
			}
		}
	},
	setTarget: function(enemy) {
		this.status.TARGET = enemy;
	},
	getTarget: function() {
		return this.status.TARGET;
	},
	isTarget: function(target) {
		return 	target == this.status.TARGET;
	},

	/**
	 *status
	 */
	getNoActionTime: function() {
		return this.status.noAction;
	},
	setNoActionTime: function(noAction) {
		this.status.noAction = noAction;
	}
});
