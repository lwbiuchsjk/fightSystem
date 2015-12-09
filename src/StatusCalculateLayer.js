/**
 * Created by Lee on 2015/11/3.
 */
var StatusCalculateLayer = cc.Layer.extend({
	showLayer: null,
	characterFactory: null,

	ctor: function() {
		this._super();
		this.init();
		this.setName(Config.STATUS_CALCULATE_LAYER);
		this.characterFactory = new CharacterFactory();

		var player = new Fighter();
		player.setName(Config.PLAYER);
		this.characterFactory.loadCharacter(player.data, player.getName());
		this.addChild(player);
		this._initEnemies();
		//this.addChild(new test());  //DEBUG
	},

	getCharacter: function(character) {
		return this.getChildByName(character);
	},

	_initEnemies: function() {
		var enemy = new Fighter();
		enemy.setName(Config.ENEMY.category);
		this.characterFactory.loadCharacter(enemy.data, enemy.getName());
		this.addChild(enemy);
	},

	onEnter: function() {
		this._super();
		this.showLayer = this.getParent().getChildByName(Config.SHOW_LAYER);

		var player = this.getChildByName(Config.PLAYER);
		var enemy = this.getChildByName(Config.ENEMY.category);
		player.setEnemy(enemy, Config.enemyFacedToMe);
		player.setTarget(enemy);
		enemy.setEnemy(player, Config.enemyFacedToMe);
		enemy.setTarget(player);
		var enemyAi = new EnemyAi(enemy, 0.3, this.getParent().eventCenter, this.showLayer);
		enemy.AI = enemyAi;
		enemy.addChild(enemyAi);
	},

	showEndPanel: function(FLAG) {
		var panel
	},
});

var Fighter = cc.Node.extend({

	showLayer: null,
	eventCenter: null,

	// data is used to load the basic character data from character factory. and then the thins below will read data to themselves when used in the calculation
	data: null,

	easyAttack: null,
	hardAttack: null,
	adjustPosition: null,
	defenceAction: null,
	singleEnergy: null,
	operateEnergy: null,
	status: null,
	enemies: null,
	action: null,
	attackEffect: null,

	ctor: function() {
		this._super();

		this.data = {};
		//console.info("STATUS OK!!!");
	},
	onEnter: function() {
		this._super();


		this.easyAttack = this.data.easyAttack;
		this.hardAttack = this.data.hardAttack;
		this.adjustPosition = this.data.adjustPosition;
		this.defenceAction = this.data.defenceAction;
		this.singleEnergy = this.data.singleEnergy;
		this.operateEnergy = this.data.operateEnergy;
		this.status = this.data.status;
		this.enemies = this.data.enemies;
		this.action = this.data.action;
		this.attackEffect = this.data.attackEffect;

		this.showLayer = this.getParent().getParent().getChildByName(Config.SHOW_LAYER);
		this.eventCenter = this.getParent().getParent().eventCenter;

		this.initDefenceDuration();
		this.optimizedSchedule(this.checkStatus, this.status.frameTime);
	},

	setActionTime: function(action, event, time){
		this[action][event] = time;
	},
	isHappened: function(action, event) {
		return this[action][event] != null && this[action][event] > 0;
	},

	/**
	 *
	 * attack action function
	 *
	 */
	/**
	 * if in red energy, the attack time will be half, but in white energy, the attack time will be double
	 */
	getAttackTime: function(FLAG) {
		if (this.getEnergyIndex() == 3) {
			return this.action[FLAG + "Time"] / 2;
		} else
		if (this.getEnergyIndex() == 0) {
			return this.action[FLAG + "Time"] * 2;
		} else {
			return this.action[FLAG + "Time"];
		}
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
	getAttackEffect: function(kind) {
		return this.attackEffect[kind];
	},
	setAttackEnergy: function(index) {
		if (0 <= index && index < Config.ENERGY_LENGTH) {
			this.status.attackEnergyIndex = index;
		}
	},
	getAttackEnergy: function() {
	 	return this.status.attackEnergyIndex;
	},
	checkWound: function(index, sourceEffect, positionCondition, defenceCondition) {
		var wound = sourceEffect.getWounded;
		var noAction = sourceEffect.noAction;
		var myIndex = this.getEnergyIndex();
		if (this.isAttacked()) {
			if (positionCondition) {
				if (defenceCondition) {
					wound += this.attackEffect.defenceAction.getWounded;
				} else {
				}
			} else {
				wound += this.attackEffect.enemyBroadsideOnMe.getWounded;
				noAction += this.attackEffect.enemyBroadsideOnMe.noAction;
			}
			if (this.getMightyEnergy(index) == myIndex) {
				wound += this.attackEffect.energyMight.getWounded;
			}
			if (this.getWeakEnergy(index)  == myIndex) {
				wound += this.attackEffect.energyWeak.getWounded;
			}
			var energy = this.getEnergy(myIndex) - wound;
			this.setEnergy(myIndex, energy);
			//console.info("check wound time: " + Date.now());
			this.setNoActionTime(noAction);
			var labelEvent = {
				FLAG: this.getName(),
				index: myIndex,
				energy: energy
			};
			this.eventCenter.dispatchEvent(Config.events.SET_ENERGY_LABEL, labelEvent);
		}
		this.attackEnded();
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
		this.status.adjustCoolWindow = this._getPositionTimeByEnergy(this.action.adjustWindow);
		//console.log("cool window time:" + this.status.adjustCoolWindow);
	},
	isInAdjustWindow: function() {
		return this.status.adjustCoolWindow <= 0;
	},
	isSatisfiedMoveTime: function(FLAG) {
		//console.log(this.action.adjustTime);
		switch(FLAG) {
			case Config.LEFT_SERIES : {
				return this.adjustPosition[Config.events.MOVE_ASIDE_END] - this.adjustPosition[Config.events.MOVE_ASIDE_BEGIN] >= this.action.adjustTime * 1000;
			}
			case Config.RIGHT_SERIES: {
				return this.adjustPosition[Config.events.MOVE_ASIDE_END] - this.adjustPosition[Config.events.MOVE_ASIDE_BEGIN] >= this.action.adjustTime * 1000;
			}
			case Config.MOVE_FORWARD: {
				return this.adjustPosition[Config.events.MOVE_FORWARD_END] - this.adjustPosition[Config.events.MOVE_FORWARD_BEGIN] >= this.action.adjustTime * 1000;
			}
			case Config.MOVE_BACKWARD: {
				return this.adjustPosition[Config.events.MOVE_BACKWARD_END] - this.adjustPosition[Config.events.MOVE_BACKWARD_BEGIN] >= this.action.adjustTime * 1000;
			}
		}
	},
	getMoveDirectionTime: function(FLAG) {
		return this._getPositionTimeByEnergy(this.action.directionTime[FLAG]);
	},
	/**
	 * if in blue energy, the position time will minus half, but if in green energy, the position time will be double
	 * the position time is move direction time, and adjust window
	 */
	_getPositionTimeByEnergy: function(positionTime) {
		if (this.getEnergyIndex() == 1) {
			return positionTime / 2;
		} else
		if (this.getEnergyIndex() == 2) {
			return positionTime * 2;
		} else
		{
			return positionTime;
		}
	},

	/**
	 *
	 * DEFENCE_ACTION function
	 *
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
					this.action.defenceDuration = Math.min(beginTime - endTime + this.getDefenceDuration(), this._getMaxDefenceByEnergy());
				}
				break;
			}
			case Config.events.DEFENCE_END: {
				this.action.defenceDuration = Math.max(this.getDefenceDuration() - (endTime - beginTime), 0);
				break;
			}
		}
	},
	initDefenceDuration: function() {
		this.action.defenceDuration = this._getMaxDefenceByEnergy();
	},
	getDefenceDuration: function() {
		return this.action.defenceDuration;
	},
	isBlockReady: function(time) {
		return time - this.defenceAction[Config.events.DEFENCE_BEGIN] < this.getDefenceDuration()
			&& this.defenceAction[Config.events.DEFENCE_END] < this.defenceAction[Config.events.DEFENCE_BEGIN];
	},
	getBlockWindowBegin: function() {
		var window;
		if (this.getEnergyIndex() == 0) {
			window = this.action.blockWindow * 2;
		} else
		if (this.getEnergyIndex() == 3) {
			window = this.action.blockWindow / 2;
		} else {
			window = this.action.blockWindow;
		}
	 	return this.status.getWounded - window;
	},
	/**
	 * TODO
	 * make the white recover faster and red slower.
	 */
	calcDefenceEndTime: function(time) {
		return this._getMaxDefenceByEnergy() - time;
	},
	checkDefence: function(nowTime) {
		var beginTime = this.defenceAction[Config.events.DEFENCE_BEGIN];
		if (beginTime != null && !this.isDefenceEnded() && nowTime - beginTime >= this._getMaxDefenceByEnergy()) {
			var endEvent = {
				role: this.getName(),
				time: nowTime
			};
			this.eventCenter.dispatchEvent(Config.events.DEFENCE_END, endEvent);
			//console.log(this.getName() + " defence auto end");
		}
	},
	/**
	 * if in red energy, the defence time will be half, but in white energy will be double
	 * used in [calcDefenceEndTime, initDefenceDuration, checkDefence, setDefenceDuration] function
	 */
	_getMaxDefenceByEnergy: function() {
		if (this.getEnergyIndex() == 0) {
			return this.status.maxDefenceTime * 2;
		} else
		if (this.getEnergyIndex() == 3) {
			return this.status.maxDefenceTime / 2;
		} else {
			return this.status.maxDefenceTime;
		}
	},
	checkBlock: function(time) {
		//console.info("block info begin: " + this.getBlockWindowBegin() + " now: " + time + " end: " + this.status.getWounded);
		var blockEvent;
		if (this.isAttacked()) {
			if (this.getBlockWindowBegin() < time && time < this.status.getWounded && this.isEnemyPosition(Config.enemyFacedToMe)) {
				this.setActionTime(Config.CHARACTER_STATUS, Config.events.GET_WOUNDED, 0);
				blockEvent = {
					role: this.getName(),
					noAction: this.getTarget().action.blockBonus,
				};
				//console.log(blockEvent.noAction);
				this.eventCenter.dispatchEvent(Config.events.BLOCK_GO, blockEvent);
			} else {
				/*
				 * here could be the fail block action
				 */
				blockEvent = {
					role: this.getName(),
					noAction: this.action.blockPunishment,
				};
				this.eventCenter.dispatchEvent(Config.events.BLOCK_FAIL, blockEvent);
				//console.error("BLOCK FAIL!!!");
			}
		} else {
			/*
			 * here could be the shield attack action
			 */
			blockEvent = {
				role: this.getName(),
				noAction: this.action.blockPunishment,
			};
			this.eventCenter.dispatchEvent(Config.events.BLOCK_FAIL, blockEvent);
			//console.info("CAN SHIELD ATTACK!!!");
		}
		this.eventCenter.dispatchEvent(Config.events.DEFENCE_END, {role: Config.PLAYER, time: Date.now()});
	},

	/**
	 *
	 * energy action function
	 *
	 */
	setEnergyIndex: function(index) {
		this.status.energyIndex = index;
	},
	getEnergyIndex: function() {
		return this.status.energyIndex;
	},
	isOperateEnergyBegan: function() {
		return (this.operateEnergy[Config.events.OPERATE_ENERGY_BEGIN] > this.operateEnergy[Config.events.OPERATE_ENERGY_END]);
	},
	isOperateEnergyEnded: function() {
		return (this.operateEnergy[Config.events.OPERATE_ENERGY_END] > this.operateEnergy[Config.events.OPERATE_ENERGY_BEGIN]);
	},
	setOperateStartEnergy: function(index) {
		this.status.operateStartEnergy = index;
	},
	getOperateStartEnergy: function() {
		return this.status.operateStartEnergy;
	},
	getEnergyOperationBegin: function() {
		return this.operateEnergy[Config.events.OPERATE_ENERGY_BEGIN];
	},
	getEnergyOperationEnd: function() {
		return this.operateEnergy[Config.events.OPERATE_ENERGY_END];
	},
	setEnergyBeginTime: function(index, time) {
		this.singleEnergy[index][Config.events.ENERGY_DURATION_BEGIN] = time;
	},
	duration2Height: function(index) {
		return Config.MOVE_BUTTON_Y * 2 / (this.getEnergyDuration(index) / this.status.frameTime / 1000);
	},
	getEnergyDuration: function(index) {
		return this.singleEnergy[index].energyDuration;
	},
	getEnergyBeginTime: function(index) {
		return this.singleEnergy[index][Config.events.ENERGY_DURATION_BEGIN];
	},
	isOneDuration: function(lastIndex, thisIndex) {
		var thisBegin = this.getEnergyBeginTime(thisIndex);
		var lastBegin = this.getEnergyBeginTime(lastIndex);
		var lastDuration = this.getEnergyDuration(lastIndex);
		var condition = thisBegin - lastBegin >=  lastDuration / Config.ENERGY_BAR_MAGNIFICATION / 4 - Config.ENERGY_DURATION_SAFE_WINDOW;
		return condition;
	},
	getMightyEnergy: function(index) {
		return (index + 2) % 5;//Config.ENERGY_MIGHTY[index];
	},
	getWeakEnergy: function(index) {
		return (index + 1) % 5;//Config.ENERGY_WEAK[index];
	},
	setEnergy: function(index, energy) {
		this.singleEnergy[index].energyQuantity = energy;
	},
	getEnergy: function(index) {
		return this.singleEnergy[index].energyQuantity;
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
	/**
	 * if in green energy, no action time will minus half, and the max no action time either.
	 */
	setNoActionTime: function(time) {
		var maxTime;
		if (this.getEnergyIndex() == 2) {
			// green energy
			time /= 2;
			maxTime = this.status.maxNoActionTime / 2;
		} else {
			maxTime = this.status.maxNoActionTime;
		}

		var wholeTime = this.getNoActionTime() + time;
		var FLAG;
		if (wholeTime <= maxTime) {
			this.status.noAction = wholeTime;
		} else {
			this.status.noAction = maxTime;
		}
		if (this.isInAdjustWindow()) {
			FLAG = Config.ADJUST_POSITION;
		}
		var noActionEvent = {
			character: this.getName(),
			FLAG: FLAG
		};
		//console.log("name: %s, no action time: %d", this.getName(), this.status.noAction);
		this.eventCenter.dispatchEvent(Config.events.NO_ACTION_GO, noActionEvent);
	},
	getNoActionTime: function() {
		// if noAction <= 0, that means someone can do actions.
		return this.status.noAction;
	},
	setNoActionFlag: function(value) {
		this.status.noActionFlag = value;
	},
	isNoActionFlag: function() {
		return this.status.noActionFlag;
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
				this.enemies.broadsideOnEnemy = this.getTarget();
				this.enemies.enemyFacedToMe = null;
				//console.log("%s: MOVE TO ENEMY ASIDE!!!", this.getName());
			} else
			if ((value.enemy.end != null && value.me.end == null) || (value.me.end != null && value.enemy.end != null && value.enemy.end < value.me.end)) {
				this.enemies.enemyBroadsideOnMe = this.getTarget();
				this.enemies.enemyFacedToMe = null;
				//console.log("%s: ENEMY MOVES TO OUR ASIDE!!!", this.getName());
			} else {
				//console.error("MOVING ERROR!!!");
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
		if (this.isEnemyPosition(Config.enemyFacedToMe) && FLAG == Config.events.MOVE_ASIDE_END) {
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
		if ((this.isEnemyPosition(Config.enemyBroadsideOnMe) || this.isEnemyPosition(Config.broadsideOnEnemy)) && FLAG == Config.events.ADJUST_TO_FACE ) {
			this.setEnemy(this.getTarget(), Config.enemyFacedToMe);
			this.getTarget().setEnemy(this, Config.enemyFacedToMe);
			//console.log("ENEMY FACED TO ME!!!");
		}
		this.cleanMoveDirection();
		this.eventCenter.dispatchEvent(Config.events.SET_POSITION_LABEL, this.getName());
	},
	checkStatus: function() {
		if (this.status.noAction > 0) {
			this.status.noAction -= 20;
		} else
		if (this.status.noAction <= 0) {
			var noActionEvent = {
				character: this.getName()
			};
			this.eventCenter.dispatchEvent(Config.events.NO_ACTION_STOP, noActionEvent);
		}
		if (this.status.adjustCoolWindow > 0) {
			this.status.adjustCoolWindow -= 20;
		}
		this.checkDefence(Date.now());
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
