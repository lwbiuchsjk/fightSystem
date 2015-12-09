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
	FACE_Y: 450,				//250,
	DEFENCE_ENEMY_X: 200,
	DEFENCE_ENEMY_Y: 650,		//450,
	ATTACK_ENEMY_X: -200,
	ATTACK_ENEMY_Y: 650,		//450,
	STATUS_ENEMY_X: 0,
	STATUS_ENEMY_Y: 850,		//650,
	ENERGY_ENEMY_X: -420,
	ENERGY_ENEMY_Y: 775,		//575,
	DOT_ENEMY_X: -420,
	DOT_ENEMY_Y: 575,			//375,
	ENERGY_NUMBER_ENEMY_Y: 250, //850
	ME_HIT_Y: 0,
	ENEMY_HIT_Y: 313,
	ME_HIT_START_Y: -170,
	ME_HIT_END_Y: 150,
	ENEMY_HIT_START_Y: 550,
	ENEMY_HIT_END_Y: 75,
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
	LEFT_SERIES: "left",
	RIGHT_SERIES: "right",

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
	OPERATE_ENERGY: "operateEnergy",
	ENERGY_INDEX: "ENERGY_INDEX",

	POSITION_BUTTON: "positionButton",

	OPERATE_EVENT: "operateEvents",
	AUTO_EVENT: "autoEvent",
	UP_INSTINCT: "upInstinct",
	DOWN_INSTINCT: "downInstinct",

	// used in enemy AI to do nothing, if the action has began, and then continue the action
	DO_CONTINUE: "continue",

	OP_PLUS: "+",
	OP_SET: "=",

	// when operate energy, use the FLAG to mark the start energy if it is yellow energy, the transmission time will be half.
	OP_START_ENERGY: "operateStartEnergy",

	RECOVER_DEFENCE: "recoverDefence",			// NO USE

	POSSIBILITY_SCALE: [0, 100],

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

		MOVE_ASIDE_BEGIN: "moveAsideBegin",
		MOVE_ASIDE_END: "moveAsideEnd",
		MOVE_FORWARD_BEGIN: "moveForwardBegin",
		MOVE_FORWARD_END: "moveForwardEnd",
		MOVE_BACKWARD_BEGIN: "moveBackwardBegin",
		MOVE_BACKWARD_END: "moveBackwardEnd",
		OPERATE_ADJUST: "operateAdjust",
		ADJUST_GO: "adjustPositionGo",
		ADJUST_TO_FACE: "adjustToFace",
		POSITION_BEGIN: "positionBegin",
		POSITION_END: "positionEnd",

		SET_POSITION_LABEL: "setPositionLabel",

		DEFENCE_BEGIN: "defenceBegin",
		BLOCK_BEGIN: "blockBegin",
		BLOCK_FAIL: "blockFail",
		BLOCK_GO: "blockGo",
		DEFENCE_END: "defenceEnd",

		OPERATE_ENERGY_BEGIN: "operateEnergyBegin",
		OPERATE_ENERGY_END: "operateEnergyEnd",
		ENERGY_DURATION_BEGIN: "energyDurationBegin",
		INIT_SHOW_LAYER: "initShowLayer",
		ENERGY_ROTATION_GO: "energyRotationGo",

		NO_ACTION_GO: "noActionGo",
		NO_ACTION_STOP: "noActionStop",
		SET_ENERGY_LABEL: "setEnergyLabel",
	},

	/**
	 * status
	 */
	enemyFacedToMe: "enemyFacedToMe",
	enemyBroadsideOnMe: "enemyBroadsideOnMe",
	broadsideOnEnemy: "broadsideOnEnemy",

	/**
	 * characters
	 */
	PLAYER: "player",
	ENEMY: {
		category: "enemy",
	},
};