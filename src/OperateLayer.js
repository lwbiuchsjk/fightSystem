/**
 * Created by Lee on 2015/10/29.
 */
var OperateLayer = cc.Layer.extend({

	showLayer: null,
	//sysControlLayer: null,
	statusCalculateLayer: null,

	attackButtonListener: null,
	positionListener: null,
	defenceListener: null,
	energyListener: null,

	noActionPositionListener: null,

	ctor: function() {
		this._super();
		this.setName(Config.OPERATE_LAYER);

		console.log("operate layer OK!!!");
	},

	setLayer: function() {
		//console.log(this.getParent());
		this.showLayer = this.getParent().getChildByName(Config.SHOW_LAYER);
		//this.sysControlLayer = this.getParent().getChildByName(Config.FLOW_CONTROL_LAYER);
		this.statusCalculateLayer = this.getParent().getChildByName(Config.STATUS_CALCULATE_LAYER);
	},

	onEnter: function() {
		this._super();
		this.setLayer();

		var that = this;
		var player = this.statusCalculateLayer.getCharacter(Config.PLAYER);
		var eventCenter = this.getParent().eventCenter;
		var attackListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			easy: that.showLayer.easyButton,
			hard: that.showLayer.hardButton,

			onTouchBegan: function(touch, event) {
				var pos = touch.getLocation();
				var target = event.getCurrentTarget();
				if (cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					eventCenter.dispatchEvent(Config.events.ATTACK_BEGIN);
					cc.eventManager.pauseTarget(that.showLayer.defenceButton);
					that.showLayer.noDefence();
					console.info("ATTACK BEGIN!!!");

					return true;
				}
				return false;
			},

			onTouchMoved: function(touch, event) {
				var pos = touch.getLocation();
				var easyUpLimit = this.easy.y + Config.MOVE_BUTTON_Y / 2;
				var easyDownLimit = this.easy.y - Config.MOVE_BUTTON_Y / 2;
				var isEasyHappened = player.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_BEGIN);
				var isHardHappened = player.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_BEGIN);
				if (cc.rectContainsPoint(this.easy.getBoundingBox(), pos) && !isHardHappened) {
					eventCenter.dispatchEvent(Config.events.EASY_BEGIN, {role: Config.PLAYER, time: Date.now()});
				} else
				if (cc.rectContainsPoint(this.hard.getBoundingBox(), pos) && !isEasyHappened) {
					eventCenter.dispatchEvent(Config.events.HARD_BEGIN, {role: Config.PLAYER, time: Date.now()});
				} else
				if ((cc.rectContainsPoint(this.easy.getBoundingBox(), pos) && isHardHappened) || (cc.rectContainsPoint(this.hard.getBoundingBox(), pos) && isEasyHappened))  {
					console.error("WRONG ATTACK!!!");
					that.showLayer.attackEnded(Config.WRONG_ACTION);
				} else
				if (pos.y < easyDownLimit) {
					// 下面的条件根据easy和hard是否发生进行两类判断，通过传入showLayer.attackEnded的FLAG来决定不同系统流程。功能尚未实现。
					if (isEasyHappened && !isHardHappened) {
						//以player的easyAttack的BEGIN时间的时机作为标示,
						player.attackEnded();
						that.showLayer.attackEnded(Config.EASY_ATTACK_MODE);
					}else if (!isEasyHappened && isHardHappened){
						//以player的hardAttack的BEGIN时间的时机作为标示
						player.attackEnded();
						that.showLayer.attackEnded(Config.HARD_ATTACK_MODE);
					}
				} else
				if (pos.y > easyUpLimit){
					if (player.isHappened(Config.EASY_ATTACK_MODE, Config.events.EASY_READY)){
						eventCenter.dispatchEvent(Config.events.EASY_GO, {role: Config.PLAYER, time: Date.now()});
					} else if (player.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_READY)){
						eventCenter.dispatchEvent(Config.events.HARD_GO, {role: Config.PLAYER, time: Date.now()});
					}
				}

				return true;
			},

			onTouchEnded: function(touch, event) {
				that.showLayer.attackEnded();
				cc.eventManager.resumeTarget(that.showLayer.defenceButton);
				that.showLayer.doDefence();
				//player.attackEnded();

				return true;
			}
		});
		var posListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			position: that.showLayer.positionButton,
			slideLeft: that.showLayer.moveButtons[Config.LEFT_SERIES],
			slideRight: that.showLayer.moveButtons[Config.RIGHT_SERIES],
			forward: that.showLayer.moveButtons[Config.MOVE_FORWARD_BEGIN],
			backward: that.showLayer.moveButtons[Config.MOVE_BACKWARD_BEGIN],
			buttonUpLimit : that.showLayer.positionButton.y + Config.MOVE_BUTTON_Y / 2,
		 	buttonDownLimit : that.showLayer.positionButton.y - Config.MOVE_BUTTON_Y / 2,
			buttonLeftLimit : that.showLayer.positionButton.x - Config.SLIDE_X / 2,
			buttonRightLimit : that.showLayer.positionButton.x + Config.SLIDE_X / 2,

			onTouchBegan: function(touch, event) {
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();
				if (cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					eventCenter.dispatchEvent(Config.events.POSITION_BEGIN, {role: Config.PLAYER, time: Date.now()});
					return true;
				}

				return false;
			},

			/**
			 *
			 * TODO
			 * adjust event plus position operation
			 */
			onTouchMoved: function(touch, event) {
				var target = event.getCurrentTarget();
				var posX = touch.getLocationX();
				var posY = touch.getLocationY();
				var isBegin = player.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
				var isAsideBegin = player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN);
				var isBackwardBegin = player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN);
				var isForwardBegin = player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN);
				var nowTime = Date.now();
				var isAdjustPosition = player.isAdjustPosition(nowTime);
				var isOperateAdjust = player.isHappened(Config.ADJUST_POSITION, Config.events.OPERATE_ADJUST);
				var positionEvent, FLAG;
				if (isBegin && !isForwardBegin && !isBackwardBegin && !isAsideBegin) {
					if (posX < this.buttonLeftLimit && posY < this.buttonUpLimit && posY > this.buttonDownLimit) {
						//at the left of position button and not forward and not backward and position action has began
						FLAG = Config.LEFT_SERIES;
						positionEvent = {
							role: Config.PLAYER,
							time: nowTime,
							FLAG: FLAG
						};
						if (!isAdjustPosition && !isOperateAdjust) {
							that.showLayer.adjustPositionEnded(FLAG);
							that.showLayer.setPositionProgressDirection(FLAG, player.getMoveDirectionTime());
							eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_BEGIN, positionEvent);
						} else {
							that.showLayer.resetPositionProgress();
							eventCenter.dispatchEvent(Config.events.ADJUST_GO, positionEvent);
						}
					} else
					if (posX > this.buttonRightLimit && posY < this.buttonUpLimit && posY > this.buttonDownLimit) {
						//at the right of position button and not forward and not backward and position action has began
						FLAG = Config.RIGHT_SERIES;
						positionEvent = {
							role: Config.PLAYER,
							time: nowTime,
							FLAG: FLAG
						};
						if (!isAdjustPosition && !isOperateAdjust) {
							that.showLayer.adjustPositionEnded(FLAG);
							that.showLayer.setPositionProgressDirection(FLAG, player.getMoveDirectionTime());
							eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_BEGIN, positionEvent);
						} else {
							that.showLayer.resetPositionProgress();
							eventCenter.dispatchEvent(Config.events.ADJUST_GO, positionEvent);
						}
					} else
					if (posY > this.buttonUpLimit && posX > this.buttonLeftLimit && posX < this.buttonRightLimit) {
						//at the top of position button and not aside and not backward and position action has began
						positionEvent = {
							role: Config.PLAYER,
							time: nowTime,
						};
						FLAG = Config.MOVE_FORWARD;
						that.showLayer.adjustPositionEnded(FLAG);
						if (!isAdjustPosition && !isOperateAdjust) {
							that.showLayer.setPositionProgressDirection(FLAG, player.getMoveDirectionTime());
							eventCenter.dispatchEvent(Config.events.MOVE_FORWARD_BEGIN, positionEvent);
						} else {
						}
					} else
					if (posY < this.buttonDownLimit && posX > this.buttonLeftLimit && posX < this.buttonRightLimit) {
						//at the bottom of position button and not forward and not aside and position action has began
						positionEvent = {
							role: Config.PLAYER,
							time: nowTime,
						};
						FLAG = Config.MOVE_BACKWARD;
						that.showLayer.adjustPositionEnded(FLAG);
						if (!isAdjustPosition && !isOperateAdjust) {
							that.showLayer.setPositionProgressDirection(FLAG, player.getMoveDirectionTime());
							eventCenter.dispatchEvent(Config.events.MOVE_BACKWARD_BEGIN, positionEvent);
						} else {
						}
					}
				}

				return true;
			},
			onTouchEnded: function(touch, event) {
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();
				var isBegin = player.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
				var positionEvent;
				var nowTime = Date.now();
				var isAdjustPosition = player.isAdjustPosition(nowTime);
				if (isBegin) {
					if (cc.rectContainsPoint(target.getBoundingBox(), pos)) {
						if (isAdjustPosition) {
							console.log("end");
							eventCenter.dispatchEvent(Config.events.ADJUST_GO, {role: Config.PLAYER, time: nowTime, FLAG: null})
						} else {
							// if not satisfied the adjust position time, then we conclude the operation satisfied the adjust to face time
							eventCenter.dispatchEvent(Config.events.ADJUST_TO_FACE, {role: Config.PLAYER, time: nowTime})
						}
						player.cleanMoveDirection();
					} else
					if (pos.x < this.buttonLeftLimit && pos.y < this.buttonUpLimit && pos.y > this.buttonDownLimit && player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN)) {
						//at the left of position button and not forward and not backward and position action has ended
						positionEvent = {
							role: Config.PLAYER,
							time: nowTime,
							FLAG: Config.LEFT_SERIES
						};
						if (!isAdjustPosition) {
							eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_END, positionEvent);
						} else {
							eventCenter.dispatchEvent(Config.events.ADJUST_GO, positionEvent)
						}
					} else
					if (pos.x > this.buttonRightLimit && pos.y < this.buttonUpLimit && pos.y > this.buttonDownLimit && player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE_BEGIN)) {
						//at the right of position button and not forward and not backward and position action has ended
						positionEvent = {
							role: Config.PLAYER,
							time: nowTime,
							FLAG: Config.RIGHT_SERIES
						};
						if (!isAdjustPosition) {
							eventCenter.dispatchEvent(Config.events.MOVE_ASIDE_END, positionEvent);
						} else {
							eventCenter.dispatchEvent(Config.events.ADJUST_GO, positionEvent)
						}
					} else
					if (pos.y > this.buttonUpLimit && pos.x > this.buttonLeftLimit && pos.x < this.buttonRightLimit && player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD_BEGIN)) {
						//at the top of position button and not aside and not backward and position action has ended
						if (!isAdjustPosition) {
							positionEvent = {
								role: Config.PLAYER,
								time: nowTime,
								FLAG: Config.MOVE_FORWARD
							};
							eventCenter.dispatchEvent(Config.events.MOVE_FORWARD_END, positionEvent);
						}
					} else
					if (pos.y < this.buttonDownLimit && pos.x > this.buttonLeftLimit && pos.x < this.buttonRightLimit && player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD_BEGIN)) {
						//at the bottom of position button and not forward and not aside and position action has ended
						if (!isAdjustPosition) {
							positionEvent = {
								role: Config.PLAYER,
								time: nowTime,
								FLAG: Config.MOVE_BACKWARD
							};
							eventCenter.dispatchEvent(Config.events.MOVE_BACKWARD_END, positionEvent);
						}
					}
				}
				player.cleanMoveDirection();
				that.showLayer.adjustPositionEnded();
				eventCenter.dispatchEvent(Config.events.POSITION_END, {role: Config.PLAYER, time: nowTime});

				return true;
			}
		});

		var noActionPositionListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: function(touch, event) {
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();

				return cc.rectContainsPoint(target.getBoundingBox(), pos);
			},
			onTouchEnded: function(touch, event) {
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();
				if (cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					var adjustEvent = {
						role: Config.PLAYER,
						time: Date.now(),
						FLAG: Config.events.NO_ACTION_STOP
					};
					eventCenter.dispatchEvent(Config.events.ADJUST_GO, adjustEvent);
					return true;
				}
				return false;
			}
		});

		var defenceListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,

			onTouchBegan: function(touch, event) {
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();

				if (cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					eventCenter.dispatchEvent(Config.events.DEFENCE_BEGIN, {role: Config.PLAYER, time: Date.now()});
					cc.eventManager.pauseTarget(that.showLayer.attackButton);
					that.showLayer.noAttack();
					return true;
				}
				return false;
			},
			onTouchMoved: function(touch, event) {
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();
				var upLimit = target.y + Config.MOVE_BUTTON_Y / 2;
				var leftLimit = target.x - Config.SLIDE_X / 2;
				var rightLimit = target.x + Config.SLIDE_X / 2;
				if (!cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					if (pos.y > upLimit && pos.x > leftLimit&& pos.x < rightLimit) {
						eventCenter.dispatchEvent(Config.events.BLOCK_BEGIN, {role: Config.PLAYER, time: Date.now()});
					}

					return true;
				}

				return false;
			},
			onTouchEnded: function(touch, event) {
				that.showLayer.blockEnd();
				cc.eventManager.resumeTarget(that.showLayer.attackButton);
				that.showLayer.doAttack();
				eventCenter.dispatchEvent(Config.events.DEFENCE_END, {role: Config.PLAYER, time: Date.now()});
				return true;
			}
		});

		var energyListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,

			onTouchBegan: function(touch, event){
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();
				if(cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					eventCenter.dispatchEvent(Config.events.OPERATE_ENERGY_BEGIN, {role: Config.PLAYER, time: Date.now()});

					return true;
				}

				return false;
			},
			onTouchMoved: function(touch, event) {
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();
				if(!cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					eventCenter.dispatchEvent(Config.events.OPERATE_ENERGY_END, {role: Config.PLAYER, time: Date.now()});

					return true;
				}

				return false;
			},
			onTouchEnded: function(touch, event) {
				eventCenter.dispatchEvent(Config.events.OPERATE_ENERGY_END, {role: Config.PLAYER, time: Date.now()});

				return true;
			}
		});


		this.attackButtonListener = attackListener;
		this.positionListener = posListener;
		this.defenceListener = defenceListener;
		this.energyListener = energyListener;
		this.noActionPositionListener = noActionPositionListener;
		cc.eventManager.addListener(attackListener, this.showLayer.attackButton);
		cc.eventManager.addListener(posListener, this.showLayer.positionButton);
		cc.eventManager.addListener(defenceListener, this.showLayer.defenceButton);
		cc.eventManager.addListener(energyListener, this.showLayer.energyDots[Config.LEFT_SERIES]);
		cc.eventManager.addListener(energyListener.clone(), this.showLayer.energyDots[Config.RIGHT_SERIES]);
	}
});