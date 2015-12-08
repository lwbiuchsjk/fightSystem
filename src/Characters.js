/**
 * Created by Lee on 2015/11/18.
 */
var Character = {
	proto:{
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
		_singleEnergy: {
			energyDurationBegin: "energyDurationBegin",
			energyQuantity: "energyQuantity",
			energyDuration: "energyDuration",
		},
		singleEnergy: [{},{},{},{},{}],//"singleEnergy"
		operateEnergy: {
			operateEnergyBegin: "operateEnergyBegin",
			operateEnergyEnd: "operateEnergyEnd"
		},
		status: {
			energyIndex : "energyIndex",
			getWounded : "getWounded",
			attackEnergyIndex : "attackEnergyIndex",
			target: "target",
			noAction : "noAction",
			noActionFlag: "noActionFlag",
			adjustCoolWindow : "adjustCoolWindow",
			enemyMoving : "enemyMoving",
			frameTime : "frameTime",
			maxDefenceTime : "maxDefenceTime",
			maxNoActionTime : "maxNoActionTime",
		},
		action: {
			blockPunishment : "blockPunishment", 	// when i block fail,  i will no action by my block punishment
			blockBonus : "blockBonus",				// when i block succeed, the enemy will no action by his block punishment
			easyTime : "easyTime",
			hardTime : "hardTime",
			hitTime : "hitTime",
			adjustTime : "adjustTime",
			blockWindow : "blockWindow",
			adjustWindow : "adjustWindow",
			directionTime : "directionTime",
			defenceDuration : "defenceDuration",
			movingEvent : "movingEvent",
		},
		enemies: {
			enemyFacedToMe: "enemyFacedToMe",
			enemyBroadsideOnMe: "enemyBroadsideOnMe",
			broadsideOnEnemy: "broadsideOnEnemy",
		},
		attackEffect: {
			easyAttack: {},//"easyAttack",
			hardAttack: {},//"hardAttack",
			defenceAction: {},//"defenceAction",
			enemyBroadsideOnMe: {},//"enemyBroadsideOnMe",
			energyMight: {},//"energyMight",
			energyWeak: {},//"energyWeak"
		},
		_attackEffect: {
			getWounded: "getWounded",
			noAction: "noAction"
		}
	},
	instance: {
		player: {
			//singleEnergy: [{},{},{},{},{}],
			singleEnergy_0_energyDurationBegin: 0,
			singleEnergy_0_energyQuantity: 24,
			singleEnergy_0_energyDuration: 10000,
			singleEnergy_1_energyDurationBegin: 0,
			singleEnergy_1_energyQuantity: 24,
			singleEnergy_1_energyDuration: 10000,
			singleEnergy_2_energyDurationBegin: 0,
			singleEnergy_2_energyQuantity: 24,
			singleEnergy_2_energyDuration: 10000,
			singleEnergy_3_energyDurationBegin: 0,
			singleEnergy_3_energyQuantity: 24,
			singleEnergy_3_energyDuration: 10000,
			singleEnergy_4_energyDurationBegin: 0,
			singleEnergy_4_energyQuantity: 24,
			singleEnergy_4_energyDuration: 10000,

			status_energyIndex: 0,
			status_getWounded: 1,
			status_attackEnergyIndex: 0,
			status_target: {},
			status_noAction: 0,
			status_noActionFlag: false,
			status_adjustCoolWindow: 0,
			status_frameTime: 20 / 1000,
			status_maxNoActionTime: 6000,
			status_maxDefenceTime: 1000,

			action_blockPunishment: 1000,
			action_blockBonus: 300,
			action_easyTime: 500 / 1000,
			action_hardTime: 2000 / 1000,
			action_hitTime: 500 / 1000,
			action_adjustTime: 500 / 1000,
			action_blockWindow: 250,
			action_adjustWindow: 50000,
			action_directionTime: 500 / 1000,
			action_movingEvent: {
				me: {
					begin: null,
					end: null
				},
				enemy: {
					begin: null,
					end: null
				}
			},

			attackEffect_easyAttack_getWounded: 2,
			attackEffect_easyAttack_noAction: 250,
			attackEffect_hardAttack_getWounded: 4,
			attackEffect_hardAttack_noAction: 500,
			attackEffect_defenceAction_getWounded: -1,
			attackEffect_defenceAction_noAction: 0,
			attackEffect_enemyBroadsideOnMe_getWounded: 1,
			attackEffect_enemyBroadsideOnMe_noAction: 0,
			attackEffect_energyMight_getWounded: 1,
			attackEffect_energyMight_noAction: 0,
			attackEffect_energyWeak_getWounded: -1,
			attackEffect_energyWeak_noAction: 0
		},
		enemy: {
			singleEnergy_0_energyDurationBegin: 0,
			singleEnergy_0_energyQuantity: 24,
			singleEnergy_0_energyDuration: 10000,
			singleEnergy_1_energyDurationBegin: 0,
			singleEnergy_1_energyQuantity: 24,
			singleEnergy_1_energyDuration: 10000,
			singleEnergy_2_energyDurationBegin: 0,
			singleEnergy_2_energyQuantity: 24,
			singleEnergy_2_energyDuration: 10000,
			singleEnergy_3_energyDurationBegin: 0,
			singleEnergy_3_energyQuantity: 24,
			singleEnergy_3_energyDuration: 10000,
			singleEnergy_4_energyDurationBegin: 0,
			singleEnergy_4_energyQuantity: 24,
			singleEnergy_4_energyDuration: 10000,

			status_energyIndex: 0,
			status_getWounded: 0,
			status_attackEnergyIndex: 0,
			status_target: {},
			status_noAction: 0,
			status_noActionFlag: false,
			status_adjustCoolWindow: 0,
			status_frameTime: 20 / 1000,
			status_maxNoActionTime: 6000,
			status_maxDefenceTime: 1000,

			action_blockPunishment: 250,
			action_blockBonus: 1000,
			action_easyTime: 500 / 1000,
			action_hardTime: 2000 / 1000,
			action_hitTime: 500 / 1000,
			action_adjustTime: 500 / 1000,
			action_blockWindow: 250,
			action_adjustWindow: 50000,
			action_directionTime: 500 / 1000,
			action_movingEvent: {
				me: {
					begin: null,
					end: null
				},
				enemy: {
					begin: null,
					end: null
				}
			},

			attackEffect_easyAttack_getWounded: 2,
			attackEffect_easyAttack_noAction: 250,
			attackEffect_hardAttack_getWounded: 4,
			attackEffect_hardAttack_noAction: 500,
			attackEffect_defenceAction_getWounded: -1,
			attackEffect_defenceAction_noAction: 0,
			attackEffect_enemyBroadsideOnMe_getWounded: 1,
			attackEffect_enemyBroadsideOnMe_noAction: 0,
			attackEffect_energyMight_getWounded: 1,
			attackEffect_energyMight_noAction: 0,
			attackEffect_energyWeak_getWounded: -1,
			attackEffect_energyWeak_noAction: 0
		}
	}
};
