/**
 * Created by Lee on 2015/11/3.
 */
var StatusCalculateLayer = cc.Layer.extend({

	characterList: [],

	ctor: function() {
		this._super();
		this.setName(Config.STATUS_CALCULATE_LAYER);

		var player = new CharacterStatus();
		this.addChild(player);
		this.characterList[Config.PLAYER] = player;
	},

	getCharacter: function(character) {
		return this.characterList[character];
	}

});

var CharacterStatus = cc.Node.extend({

	easyAttack: new Array(3),
	hardAttack: new Array(3),
	adjustPosition: new Array(5),
	defenceAction: new Array(5),
	defenceDuration: null,

	ctor: function() {
		this._super();
		console.log("status ok");

		this.easyAttack[Config.events.EASY_BEGIN] = null;
		this.easyAttack[Config.events.EASY_READY] = null;
		this.easyAttack[Config.events.EASY_GO] = null;

		this.hardAttack[Config.events.HARD_BEGIN] = null;
		this.hardAttack[Config.events.HARD_READY] = null;
		this.hardAttack[Config.events.HARD_GO] = null;

		this.adjustPosition[Config.events.MOVE_ASIDE] = null;
		this.adjustPosition[Config.events.MOVE_FORWARD] = null;
		this.adjustPosition[Config.events.MOVE_BACKWARD] = null;
		this.adjustPosition[Config.events.POSITION_BEGIN] = null;
		this.adjustPosition[Config.events.POSITION_END] = null;
		this.adjustPosition[Config.events.ADJUST_FINISHED] = null;

		this.defenceAction[Config.events.DEFENCE_BEGIN] = null;
		this.defenceAction[Config.events.DEFENCE_END] = null;
		this.defenceAction[Config.events.BLOCK_BEGIN] = null;
		this.defenceAction[Config.events.BLOCK_FAIL] = null;
		this.defenceAction[Config.events.BLOCK_GO] = null;
		this.defenceDuration = Config.duration.DEFENCE_MAX_TIME;

	},

	setActionTime: function(action, event, time){
		var blank = this[action][event];
		if (blank == null) {
			this[action][event] = time;
		}
	},
	isHappened: function(action, event) {
		return this[action][event] != null
	},
	attackEnded: function() {
		for (var i in this.easyAttack) {
			this.easyAttack[i] = null;
		}
		for (var i in this.hardAttack) {
			this.hardAttack[i] = null;
		}
	},
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
	setDefenceTime: function(event, time) {
		this.defenceAction[event] = time;
	},
	getDefenceDuration: function() {
		return this.defenceDuration;
	},
	isBlockReady: function(time) {
		return time - this.defenceAction[Config.events.DEFENCE_BEGIN] < this.defenceDuration;
	}
});
