/**
 * Created by Lee on 2015/10/29.
 */
var OperateLayer = cc.Layer.extend({

	showLayer: null,
	sysControlLayer: null,
	statusCalculateLayer: null,

	attackButtonListener: null,
	positionListener: null,
	defenceListener: null,

	ctor: function() {
		this._super();
		this.setName(Config.OPERATE_LAYER);

		console.log("operate layer OK!!!");
	},

	setLayer: function(showLayer, sysControl, stCalLayer) {
		this.showLayer = showLayer;
		this.sysControlLayer = sysControl;
		this.statusCalculateLayer = stCalLayer;
	},

	onEnter: function() {
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
					if (!this.easy.getParent() && !this.hard.getParent()) {
						that.showLayer.addChild(this.easy, 1, Config.EASY_ATTACK_MODE);//, 1, "easy");
						that.showLayer.addChild(this.hard, 1, Config.HARD_ATTACK_MODE);//, 1, "easy");

						return true;
					}
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
					eventCenter.dispatchEvent(Config.events.EASY_BEGIN, {role: Config.PLAYER, time: new Date().getTime()});
				} else
				if (cc.rectContainsPoint(this.hard.getBoundingBox(), pos) && !isEasyHappened) {
					eventCenter.dispatchEvent(Config.events.HARD_BEGIN, {role: Config.PLAYER, time: new Date().getTime()});
				} else
				if ((cc.rectContainsPoint(this.easy.getBoundingBox(), pos) && isHardHappened) || (cc.rectContainsPoint(this.hard.getBoundingBox(), pos) && isEasyHappened))  {
					console.log("wrong attack");
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
						eventCenter.dispatchEvent(Config.events.EASY_GO, {role: Config.PLAYER, time: new Date().getTime()});
					} else if (player.isHappened(Config.HARD_ATTACK_MODE, Config.events.HARD_READY)){
						eventCenter.dispatchEvent(Config.events.HARD_GO, {role: Config.PLAYER, time: new Date().getTime()});
					}
				}

				return true;
			},

			onTouchEnded: function(touch, event) {
				that.showLayer.attackEnded();
				player.attackEnded();
				console.log("remove OK!!!");

				return true;
			}
		});
		var posListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			position: that.showLayer.positionButton,
			slideLeft: that.showLayer.moveButtons[Config.LEFT_SERIES],
			slideRight: that.showLayer.moveButtons[Config.RIGHT_SERIES],
			forward: that.showLayer.moveButtons[Config.MOVE_FORWARD],
			backward: that.showLayer.moveButtons[Config.MOVE_BACKWARD],

			onTouchBegan: function(touch, event) {
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();
				if (cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					eventCenter.dispatchEvent(Config.events.POSITION_BEGIN, {role: Config.PLAYER, time: new Date().getTime()});
					return true;
				}

				return false;
			}
			,
			onTouchMoved: function(touch, event) {
				var target = event.getCurrentTarget();
				var posX = touch.getLocationX();
				var posY = touch.getLocationY();
				var buttonUpLimit = this.position.y + Config.MOVE_BUTTON_Y / 2;
				var buttonDownLimit = this.position.y - Config.MOVE_BUTTON_Y / 2;
				var buttonLeftLimit = this.position.x - Config.SLIDE_X / 2;
				var buttonRightLimit = this.position.x + Config.SLIDE_X / 2;
				var isBegin = player.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
				var isAside = player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_ASIDE);
				var isBackward = player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_BACKWARD);
				var isForward = player.isHappened(Config.ADJUST_POSITION, Config.events.MOVE_FORWARD);
				if (posX < buttonLeftLimit || posX > buttonRightLimit || posY < buttonDownLimit || posY > buttonUpLimit) {
					var nowTime = new Date().getTime();
					if (isBegin && !player.isAdjustPosition(nowTime)) {
						if (posX < buttonLeftLimit && posY < buttonUpLimit && posY > buttonDownLimit && !isForward && !isBackward) {
							//at the left of position button and not forward and not backward and position action has began
							eventCenter.dispatchEvent(Config.events.MOVE_ASIDE, {role: Config.PLAYER, time: new Date().getTime()});
							that.showLayer.adjustPositionEnded(Config.LEFT_SERIES);
						}
						if (posX > buttonRightLimit && posY < buttonUpLimit && posY > buttonDownLimit && !isForward && !isBackward) {
							//at the right of position button and not forward and not backward and position action has began
							eventCenter.dispatchEvent(Config.events.MOVE_ASIDE, {role: Config.PLAYER, time: new Date().getTime()});
							that.showLayer.adjustPositionEnded(Config.RIGHT_SERIES);
						}
						if (posY > buttonUpLimit && posX > buttonLeftLimit && posX < buttonRightLimit && !isBackward && !isAside) {
							//at the top of position button and not aside and not backward and position action has began
							eventCenter.dispatchEvent(Config.events.MOVE_FORWARD, {role: Config.PLAYER, time: new Date().getTime()});
							that.showLayer.adjustPositionEnded(Config.MOVE_FORWARD);
						}
						if (posY < buttonDownLimit && posX > buttonLeftLimit && posX < buttonRightLimit && !isForward && !isAside) {
							//at the bottom of position button and not forward and not aside and position action has began
							eventCenter.dispatchEvent(Config.events.MOVE_BACKWARD, {role: Config.PLAYER, time: new Date().getTime()});
							that.showLayer.adjustPositionEnded(Config.MOVE_BACKWARD);
						}
					} else {
						player.adjustPositionEnded();
						that.showLayer.adjustPositionEnded();
					}
				}

				return true;
			},
			onTouchEnded: function(touch, event) {
				eventCenter.dispatchEvent(Config.events.POSITION_END, {role: Config.PLAYER, time: new Date().getTime()});
				var isBegin = player.isHappened(Config.ADJUST_POSITION, Config.events.POSITION_BEGIN);
				if (isBegin && player.isAdjustPosition(player.getPositionEndTime())) {
					eventCenter.dispatchEvent(Config.events.ADJUST_FINISHED, {role: Config.PLAYER, time: new Date().getTime()})
				}
				player.adjustPositionEnded();
				that.showLayer.adjustPositionEnded();

				return true;
			}
		});

		var defenceListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,

			onTouchBegan: function(touch, event) {
				var target = event.getCurrentTarget();
				var pos = touch.getLocation();

				if (cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					eventCenter.dispatchEvent(Config.events.DEFENCE_BEGIN, {role: Config.PLAYER, time: new Date().getTime()});
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
						eventCenter.dispatchEvent(Config.events.BLOCK_BEGIN, {role: Config.PLAYER, time: new Date().getTime()});
					}

					return true;
				}

				return false;
			},
			onTouchEnded: function(touch, event) {
				that.showLayer.blockEnd();
				eventCenter.dispatchEvent(Config.events.DEFENCE_END, {role: Config.PLAYER, time: new Date().getTime()});
				return true;
			}
		});

		this.attackButtonListener = attackListener;
		this.positionListener = posListener;
		this.defenceListener = defenceListener;
		cc.eventManager.addListener(attackListener, this.showLayer.attackButton);
		cc.eventManager.addListener(posListener, this.showLayer.positionButton);
		cc.eventManager.addListener(defenceListener, this.showLayer.defenceButton);
	}
});