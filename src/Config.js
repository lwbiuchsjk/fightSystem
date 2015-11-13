/**
 * Created by Lee on 2015/10/28.
 */
var Constant = {
	WIDTH : 1080,
	HEIGHT : 1920
};

var Config = {
	/**
	 * the configs below is about the basic system data
	 */
	ENERGY_LENGTH: 5,
	ENERGY_MIGHTY: [2, 3, 4, 0, 1],
	ENERGY_WEAK: [1, 2, 3, 4, 0],

	/**
	 * the configs below is the name of layers
	 */
	SHOW_LAYER: "showLayer",
	STATUS_CALCULATE_LAYER: "statusCalculateLayer",
	FLOW_CONTROL_LAYER: "flowControlLayer",
	OPERATE_LAYER: "operateLayer",

	/**
	 * the configs below is all about the element location in the show layer
	 */
	CENTER_X : Constant.WIDTH / 2,
	CENTER_Y : Constant.HEIGHT / 2,
	POSITION_Y : -720,
	POSITION_X: 0,
	DEFENCE_X : -200,
	DEFENCE_Y : -410,
	ATTACK_X : 200,
	ATTACK_Y: -410,
	EASY_X : 125,
	EASY_Y : -260,
	HARD_X : 275,
	HARD_Y: -260,
	ENERGY_L_X : -460,
	ENERGY_Y : -282,
	ENERGY_R_X : 460,
	DOT_Y : -482,
	WHITE_ME_X: -400,
	BLUE_ME_X: -200,
	GREEN_ME_X: 0,
	RED_ME_X: 200,
	YELLOW_ME_X: 400,
	ENERGY_NUMBER_X: -400,
	ENERGY_NUMBER_ME_Y: -25,
	ENERGY_NUMBER_INTERVAL: 200,
	FACE_X: 0,
	FACE_Y: 250,
	DEFENCE_ENEMY_X: 200,
	DEFENCE_ENEMY_Y: 450,
	ATTACK_ENEMY_X: -200,
	ATTACK_ENEMY_Y: 450,
	STATUS_ENEMY_X: 0,
	STATUS_ENEMY_Y: 650,
	ENERGY_ENEMY_X: -420,
	ENERGY_ENEMY_Y: 575,
	DOT_ENEMY_X: -420,
	DOT_ENEMY_Y: 375,
	ENERGY_NUMBER_ENEMY_Y: 850,
	ATTACK_PROGRESS_X: -170,
	ATTACK_PROGRESS_Y: -225,
	SLIDE_X: 300,  	//based on position and the position & move button`s width
	MOVE_BUTTON_Y: 150,  	//based on position and the position & move button or other button`s height

	ENERGY_DURATION_SAFE_WINDOW: 50,
	ENERGY_BAR_MAGNIFICATION: 10,

	/**
	 * the configs below is about the energy data, like colors, effect, etc
	 */
	ENERGY_LIGHT_COLORS: [
		cc.color(127, 127, 127),
		cc.color(181, 199, 231),
		cc.color(169, 209, 142),
		cc.color(244, 177, 131),
		cc.color(255, 217, 102)
	],
	ENERGY_DARK_COLOR: [
		cc.color(255, 255, 255),
		cc.color(48, 84, 151),
		cc.color(84, 130, 53),
		cc.color(167, 90, 17),
		cc.color(191, 144, 0)
	],

	/**
	 * the configs below is about the event message when player operate the button
	 */
	LEFT_SERIES: "LEFT",
	RIGHT_SERIES: "RIGHT",

	EASY_ATTACK_MODE: "easyAttack",
	HARD_ATTACK_MODE: "hardAttack",
	WRONG_ACTION: "WRONG_ACTION",

	ADJUST_POSITION: "adjustPosition",
	MOVE_FORWARD: "moveForward",
	MOVE_BACKWARD: "moveBackward",

	DEFENCE_ACTION: "defenceAction",
	DEFENCE_DURATION: "DEFENCE_DURATION",

	ENERGY_QUANTITY: "energyQuantity",

	CHARACTER_STATUS: "status",
	CHARACTER_ENERGY: "energy",
	ENERGY_INDEX: "ENERGY_INDEX",

	/**
	 * the configs below is about the function name with events
	 */
	events: {
		ATTACK_BEGIN: "attackBegin",
		EASY_BEGIN: "easyAttackBegin",
		EASY_READY: "easyAttackReady",
		EASY_GO: "easyAttackGo",
		HARD_BEGIN: "hardAttackBegin",
		HARD_READY: "hardAttackReady",
		HARD_GO: "hardAttackGo",
		GET_WOUNDED: "getWounded",

		MOVE_ASIDE: "moveAside",
		MOVE_FORWARD: "moveForward",
		MOVE_BACKWARD: "moveBackward",
		ADJUST_FINISHED: "adjustFinished",
		POSITION_BEGIN: "positionBegin",
		POSITION_END: "positionEnd",

		DEFENCE_BEGIN: "defenceBegin",
		BLOCK_BEGIN: "blockBegin",
		BLOCK_FAIL: "blockFail",
		BLOCK_GO: "blockGo",
		DEFENCE_END: "defenceEnd",

		OPERATE_ENERGY_BEGIN: "operateEnergyBegin",
		OPERATE_ENERGY_END: "operateEnergyEnd",
		ENERGY_DURATION_BEGIN: "energyDurationBegin",
		SET_ENERGY_ROTATION_BEGIN_TIME: "setEnergyRotationBeginTime",
		PLAYER_ENERGY_ROTATION: "playerEnergyRotation",
		ENEMY_ENERGY_ROTATION: "enemyEnergyRotation",

		NO_ACTION: "noAction",
		SET_ENERGY_LABEL: "setEnergyLabel",
	},

	/**
	 * the action time configuration, unit ms.
	 */
	duration: {
		EASY_BUTTON: 500,
		HARD_BUTTON: 2000,
		//if the adjust action duration is less than ADJUST_POSITION_TIME, then we think the player meant to "adjust position", otherwise, we conclude the player meant to move.
		ADJUST_POSITION_BUTTON: 500,
		//the max defence time if player do not release his finger
		DEFENCE_MAX_TIME: 1000,
		//the energy status duration
		ENERGY: [5000, 5000, 5000, 5000, 5000],
		//the duration time that on frame last
		FRAME_TIME: 20,
		HIT_TIME: 500,
	},

	/**
	 * status
	 */
	ENEMY_FACED_TO_ME: "ENEMY_FACED_TO_ME",
	ENEMY_BROADSIDE_ON_ME: "ENEMY_BROADSIDE_ON_ME",
	BROADSIDE_ON_ENEMY: "BROADSIDE_ON_ENEMY",

	/**
	 * characters
	 */
	PLAYER: "player",
	ENEMY: {
		category: "enemy",
	},
	/**
	 * attack effect
	 * getWounded can be searched by Config.events.GET_WOUNDED,
	 * noAction can be searched by Config.events.NO_ACTION,
	 */
		easyAttack: {
			getWounded: 2,
			noAction: 250,
		},
		hardAttack: {
			getWounded: 4,
			noAction: 500,
		},
	ATTACK_EFFECT: {
		defenceAction: {
			getWounded: -1,
		},
		ENEMY_BROADSIDE_ON_ME: {
			getWounded: 1,
			noAction: 250,
		},
		ENERGY_MIGHTY: {
			getWounded: 1,
		},
		ENERGY_WEAK: {
			getWounded: -1,
		}
	},
};