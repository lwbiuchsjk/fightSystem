/**
 * Created by Lee on 2015/11/18.
 */
var ProtoCharacters = {
	easyAttack: {
		easyAttackBegin: "easyAttackBegin",
		easyAttackReady: "easyAttackReady",
		easyAttackGo: "easyAttackGo",
	},
	hardAttack: {
		hardAttackBegin: "hardAttackBegin",
		hardAttackReady: "hardAttackReady",
		hardAttackGo: "hardAttackGo",
	},
	adjustPosition: {
		moveAsideBegin: "moveAsideBegin",
		moveAsideEnd: "moveAsideEnd",
		moveForwardBegin: "moveForwardBegin",
		moveForwardEnd: "moveForwardEnd",
		moveBackwardBegin: "moveBackwardBegin",
		moveBackwardEnd: "moveBackwardEnd",
		operateAdjust: "operateAdjust",
		positionBegin: "positionBegin",
		positionEnd: "positionEnd",
	},
	defenceAction: {
		defenceBegin: "defenceBegin",
		blockBegin: "blockBegin",
		blockFail: "blockFail",
		blockGo: "blockGo",
		defenceEnd: "defenceEnd",
	},
	_energy: {
		energyDurationBegin: "energyDurationBegin",
		energyQuantity: "energyQuantity",
		energyDuration: "energyDuration",
	},
	energy: {
		operateEnergyBegin: "operateEnergyBegin",
		operateEnergyEnd: "operateEnergyEnd"
	},
	status: {
		energyIndex : "energyIndex",
		getWounded : "getWounded",
		attackEnergyIndex : "attackEnergyIndex",
		target: "target",
		noAction : "noAction",
		adjustPositionWindow : "adjustPositionWindow",
		enemyMoving : "enemyMoving",
		frameTime : "frameTime",
	},
	action: {
		blockPunishment : "blockPunishment",
		blockBonus : "blockBonus",
		easyTime : "easyTime",
		hardTime : "hardTime",
		hitTime : "hitTime",
		adjustTime : "adjustTime",
		maxDefenceTime : "maxDefenceTime",
		blockWindow : "blockWindow",
		maxNoActionTime : "maxNoActionTime",
		adjustWindow : "adjustWindow",
		directionTime : "directionTime",
		defenceDuration : "defenceDuration",
		movingEvent : "movingEvent",
	},
	enemies: {
		ENEMY_FACED_TO_ME: null,
		ENEMY_BROADSIDE_ON_ME: null,
		BROADSIDE_ON_ENEMY: null,
	},
};

var PLAYER = {

};