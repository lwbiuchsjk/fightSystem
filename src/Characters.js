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
			singleEnergy_0_energyQuantity: 48,
			singleEnergy_0_energyDuration: 5000,
			singleEnergy_1_energyDurationBegin: 0,
			singleEnergy_1_energyQuantity: 48,
			singleEnergy_1_energyDuration: 5000,
			singleEnergy_2_energyDurationBegin: 0,
			singleEnergy_2_energyQuantity: 48,
			singleEnergy_2_energyDuration: 5000,
			singleEnergy_3_energyDurationBegin: 0,
			singleEnergy_3_energyQuantity: 48,
			singleEnergy_3_energyDuration: 5000,
			singleEnergy_4_energyDurationBegin: 0,
			singleEnergy_4_energyQuantity: 48,
			singleEnergy_4_energyDuration: 5000,

			status_energyIndex: 0,
			status_getWounded: 1,
			status_attackEnergyIndex: 0,
			status_target: {},
			status_noAction: 0,
			status_noActionFlag: false,
			status_adjustPositionWindow: 0,
			status_frameTime: 20 / 1000,

			action_blockPunishment: 250,
			action_blockBonus: 250,
			action_maxNoActionTime: 6000,
			action_easyTime: 500 / 1000,
			action_hardTime: 2000 / 1000,
			action_hitTime: 500 / 1000,
			action_adjustTime: 500 / 1000,
			action_maxDefenceTime: 1000,
			action_blockWindow: 250 / 1000,
			action_adjustWindow: 5000,
			action_directionTime: 500 / 1000,
			action_defenceDuration: 1000,
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
			singleEnergy_0_energyQuantity: 48,
			singleEnergy_0_energyDuration: 5000,
			singleEnergy_1_energyDurationBegin: 0,
			singleEnergy_1_energyQuantity: 48,
			singleEnergy_1_energyDuration: 5000,
			singleEnergy_2_energyDurationBegin: 0,
			singleEnergy_2_energyQuantity: 48,
			singleEnergy_2_energyDuration: 5000,
			singleEnergy_3_energyDurationBegin: 0,
			singleEnergy_3_energyQuantity: 48,
			singleEnergy_3_energyDuration: 5000,
			singleEnergy_4_energyDurationBegin: 0,
			singleEnergy_4_energyQuantity: 48,
			singleEnergy_4_energyDuration: 5000,

			status_energyIndex: 0,
			status_getWounded: 0,
			status_attackEnergyIndex: 0,
			status_target: {},
			status_noAction: 0,
			status_noActionFlag: false,
			status_adjustPositionWindow: 0,
			status_frameTime: 20 / 1000,

			action_blockPunishment: 250,
			action_blockBonus: 250,
			action_maxNoActionTime: 6000,
			action_easyTime: 500 / 1000,
			action_hardTime: 2000 / 1000,
			action_hitTime: 500 / 1000,
			action_adjustTime: 500 / 1000,
			action_maxDefenceTime: 1000,
			action_blockWindow: 250 / 1000,
			action_adjustWindow: 50000,
			action_directionTime: 500 / 1000,
			action_defenceDuration: 1000,
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
			attackEffect_easyAttack_noAction: 25,
			attackEffect_hardAttack_getWounded: 4,
			attackEffect_hardAttack_noAction: 50,
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
