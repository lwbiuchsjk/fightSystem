
var ShowLayer = cc.Layer.extend({

    eventCenter: null,
    //player click to attack
    attackButton: null,
    //player click to defence
    defenceButton: null,
    //block sprite. if player slide the finger to the bounding box, that means player want to block
    blockSprite: null,
    //if player slide the finger to the bounding box, that means player want to easyAttack. now easy attack is gain the energy. when the energy is satisfied, player slide finger up to "EASY ATTACK"
    easyButton: null,
    //if player slide the finger to the bounding box, that means player want to hardAttack. now easy attack is gain the energy. when the energy is satisfied, player slide finger up to "HARD ATTACK"
    hardButton: null,
    //player click to adjust position
    positionButton: null,
    //player click to make movement action from position button
    moveButtons: new Array(4),
    //player click to adjust energy status
    energyDots: new Array(3),
    //show player`s energy status
    energyBars: new Array(3),

    //show the attack progress bar
    attackProgress: null,
    //show the button which like player`s defence progress bar
    defenceProgress: null,
    //show the button which like player`s position action progress bar
    positionProgress: null,
    positionMask: null,
    //the attack status of enemy
    attackStatus: null,
    //the defence status of enemy
    defenceStatus: null,
    //the position relationship between player and enemy
    positionStatus: null,
    //the noAction status of enemy
    actionStatus: null,

    playerHitMask: null,
    playerHitStencil: null,
    enemyHitMask: null,
    enemyHitStencil: null,

    attackEasyUp: null,
    attackHardUp: null,
    positionMovement: null,
    //attackProgressDown: null,
    defenceProgressOut: null,
    defenceProgressIn: null,

    sysControlLayer: null,

    playerEnergyIndex: null,
    playerAttackEnergy: null,
    enemyEnergyIndex: null,
    enemyAttackEnergy: null,

    noActionPlayer: null,
    noActionEnemy: null,

    Energy: {
        player: new Array(5),
        enemy: new Array(5),
    },

    frameTime: null,

    ctor:function () {
        this._super();
        this.setName(Config.SHOW_LAYER);

        this.playerEnergyIndex = 0;
        this._setElements();

        console.log("show layer OK!!!");
    },

    /**
     *
     * below is the attack action series
     *
     */
    initAttackMovement: function(easyTime, hardTime) {
        if (this.attackEasyUp == null) {
            this.attackEasyUp = cc.sequence(
                cc.moveTo(easyTime, cc.p(this.attackButton.x + Config.ATTACK_PROGRESS_X, this.attackButton.y + Config.ATTACK_PROGRESS_Y + 300)),
                cc.callFunc(function() {
                    this.eventCenter.dispatchEvent(Config.events.EASY_READY, {role: Config.PLAYER, time: Date.now()});
                }.bind(this), this)
            );
        }
        if (this.attackHardUp == null) {
            this.attackHardUp = cc.sequence(
                cc.moveTo(hardTime, cc.p(this.attackButton.x + Config.ATTACK_PROGRESS_X, this.attackButton.y + Config.ATTACK_PROGRESS_Y + 300)),
                cc.callFunc(function() {
                    this.eventCenter.dispatchEvent(Config.events.HARD_READY, {role: Config.PLAYER, time: Date.now()});
                }.bind(this), this)
            );
        }
    },
    attackBegan: function() {
        if (!this.easyButton.getParent() && !this.hardButton.getParent()) {
            this.addChild(this.easyButton, 1, Config.EASY_ATTACK_MODE);//, 1, "easy");
            this.addChild(this.hardButton, 1, Config.HARD_ATTACK_MODE);//, 1, "easy");
            this.easyButton.setTexture(res["easy" + this.playerAttackEnergy]);
            this.hardButton.setTexture(res["hard" + this.playerAttackEnergy]);
        }
    },
    easyAttackReady: function() {
        this.easyButton.setTexture(res.easyGo);
    },
    easyAttackBegin: function() {
       // this.easyButton.setTexture(res.easyAttack);
        this.hardButton.setTexture(res.hardNo);
        var attackProgress = this.attackProgress;
        var upAction = this.attackEasyUp;
        if (upAction.getTarget() == null) {
            attackProgress.runAction(upAction);
        }
    },
    hardAttackReady: function() {
        this.hardButton.setTexture(res.hardGo);
    },
    hardAttackBegin: function() {
        //this.hardButton.setTexture(res.hardAttack);
        this.easyButton.setTexture(res.easyNo);
        var attackProgress = this.attackProgress;
        var upAction = this.attackHardUp;
        if (upAction.getTarget() == null) {
            attackProgress.runAction(upAction);
        }
    },
    attackFlashReady: function(FLAG) {
        switch(FLAG) {
            case Config.EASY_ATTACK_MODE: {
                this.easyAttackReady();
                this.hardButton.setTexture(res.hardNo);
                break;
            }
            case Config.HARD_ATTACK_MODE: {
                this.hardAttackReady();
                this.easyButton.setTexture(res.easyNo);
                break;
            }
        }
        this.attackProgressActionStopped();
        this.attackProgress.y = this.attackButton.y + Config.ATTACK_PROGRESS_Y + 300;
    },
    attackFinished: function() {
        this.attackProgress.y = this.attackButton.y + Config.ATTACK_PROGRESS_Y;
    },
    enemyEasyBegin: function() {
        this.attackStatus.setTexture(res["easy" + this.enemyAttackEnergy]);
        this.attackStatus.scaleX = 0.5;
    },
    enemyEasyReady: function() {
        this.attackStatus.setTexture(res.easyGo);
        console.log("Ready");
        this.attackStatus.scaleX = 0.5;
    },
    enemyHardBegin: function() {
        this.attackStatus.setTexture(res["hard" + this.enemyAttackEnergy]);
        this.attackStatus.scaleX = 0.5;
    },
    enemyHardReady: function() {
        this.attackStatus.setTexture(res.hardGo);
        this.attackStatus.scaleX = 0.5;
    },
    enemyAttackEnd: function() {
        this.setAttackEnergyTexture(Config.ENEMY.category, this.enemyAttackEnergy);
        this.attackStatus.scaleX = 1;
    },
    setAttackEnergyTexture: function(FLAG, index) {
        var sprite, texture;
        switch (FLAG) {
            case Config.PLAYER: {
                sprite = this.attackButton;
                texture = res["attack" + index];
                break;
            }
            case Config.ENEMY.category: {
                sprite = this.attackStatus;
                texture = res["attack" + index];
            }
        }
        sprite.setTexture(texture);
    },
    setAttackEnergyIndex: function(FLAG, index) {
        this[FLAG + "AttackEnergy"] = index;
    },
    executeHitAction: function(FLAG, time) {
        var startY, endY;
        switch(FLAG) {
            case Config.PLAYER: {
                startY = Config.CENTER_Y + Config.ME_HIT_START_Y;
                endY = Config.CENTER_Y + Config.ME_HIT_END_Y;
                break;
            }
            case Config.ENEMY.category: {
                startY = Config.CENTER_Y + Config.ENEMY_HIT_START_Y;
                endY = Config.CENTER_Y + Config.ENEMY_HIT_END_Y;
                break;
            }
        }
        var mask = this[FLAG + "HitMask"];
        var stencil = this[FLAG + "HitStencil"];
        if (mask.getParent() == null) {
            this.addChild(mask);
            var hitAction = cc.sequence(
                cc.moveTo(time - 0.05, cc.p(stencil.x, endY)),
                cc.callFunc(function() {
                    if (mask.getParent() != null) {
                        stencil.y = startY;
                        mask.removeFromParent();
                    }
                }, this)
            );
            stencil.runAction(hitAction);
        }
    },
    /**
     * @param {string} FLAG
     * if FLAG is null, that means the attack action is truly ended.
     * if FLAG is Config.EASY_ATTACK_MODE or HARD_ATTACK_MODE, that means the attack action is half ended and the finger is not leave the pad.
     * if FLAG is Config.WRONG_ACTION, that means the finger slide from easy to hard, or from hard to easy, which is the wrong operation.
     */
    attackEnded: function(FLAG) {
        var easyTexture = this.easyButton.getTexture();
        var hardTexture = this.hardButton.getTexture();
        if (FLAG == Config.WRONG_ACTION) {
            if (easyTexture != res.easyNo) {
                this.easyButton.setTexture(res.easyNo);
            }
            if (hardTexture != res.hardNo) {
                this.hardButton.setTexture(res.hardNo);
            }
        } else {
            this.easyButton.setTexture(res.easyAttack);
            this.hardButton.setTexture(res.hardAttack);
        }
        if (FLAG == null) {
            this.easyButton.removeFromParent();
            this.hardButton.removeFromParent();
        }
        this.attackProgressActionStopped();
        this.attackFinished();
    },
    attackProgressActionStopped: function() {
        if (this.attackEasyUp.getTarget() != null || this.attackHardUp.getTarget() != null) {
            //this.attackProgress.stopAction(this.attackEasyUp);
            this.attackProgress.stopAllActions();
            this.attackEasyUp.setTarget(null);
            this.attackHardUp.setTarget(null);
            console.log("stop progress");
        }
    },
    noAttack: function() {
        this.attackButton.setTexture(res.noAttack);
        this.attackEnded();
    },
    doAttack: function() {
        this.setAttackEnergyTexture(Config.PLAYER, this.playerAttackEnergy);
    },

    /**
     *
     * below is the position action series.
     *
     */
    noPosition: function() {
        this.positionButton.setTexture(res.noPosition);
        this.adjustPositionEnded();
        this.setComponentEnbaled(Config.POSITION_BUTTON, false);
    },
    doPosition: function() {
        this.positionButton.setTexture(res.position);
        this.setComponentEnbaled(Config.POSITION_BUTTON, true);
    },
    setPositionProgressDirection: function(FLAG, time) {
        var positionProgress = this.positionProgress;
        var positionMovement = this.positionMovement;
        this.positionMask.setInverted(true);
        positionProgress.attr({
            x: this.positionButton.x,
            y: this.positionButton.y
        });
        var direction;
        switch(FLAG) {
            case Config.LEFT_SERIES: {
                direction = cc.p(this.positionButton.x - Config.SLIDE_X, this.positionButton.y);
                break;
            }
            case Config.RIGHT_SERIES: {
                direction = cc.p(this.positionButton.x + Config.SLIDE_X, this.positionButton.y);
                break;
            }
            case Config.MOVE_FORWARD: {
                direction = cc.p(this.positionButton.x, this.positionButton.y + Config.MOVE_BUTTON_Y);
                break;
            }
            case Config.MOVE_BACKWARD: {
                direction = cc.p(this.positionButton.x, this.positionButton.y - Config.MOVE_BUTTON_Y);
                break;
            }
        }
        positionMovement = cc.moveTo(time, direction);
        if (positionMovement.getTarget() == null) {
            positionProgress.runAction(positionMovement);
        }
    },
    showFlashPosition: function(FLAG) {
        var img = this.moveButtons[FLAG];
        if (img != null && img.getParent() == null) {
            this.addChild(img);
        }
        this.resetPositionProgress();
    },
    adjustPositionBegan: function(time) {
        this.positionProgress.attr({
            x: this.positionButton.x + Config.SLIDE_X,
            y: this.positionButton.y
        });
        this.positionMovement = cc.sequence(
            cc.moveTo(time, cc.p(this.positionButton.x, this.positionButton.y)),
            cc.callFunc(function() {
                for(var i in this.moveButtons) {
                    var e = this.moveButtons[i];
                    if (!e.getParent()) {
                        this.addChild(e, 1);
                    }
                }
                this.positionMovement.setTarget(null);
            }.bind(this), this));
        var positionMovement = this.positionMovement;
        var positionProgress = this.positionProgress;
        if (positionMovement.getTarget() == null) {
            positionProgress.runAction(positionMovement);
        }
    },
    resetPositionProgress: function() {
        var positionMovement = this.positionMovement;
        var positionProgress = this.positionProgress;
        if (positionMovement.getTarget() != null) { //!!! getTarget not getTarget()
            positionProgress.stopAllActions();
            positionMovement.setTarget(null);
        }
        positionProgress.x = this.positionButton.x + Config.SLIDE_X;
    },
    adjustPositionEnded: function(FLAG) {
        if (FLAG == null || FLAG == Config.WRONG_ACTION) {
            this.resetPositionProgress();
            this.positionMask.setInverted(false);
        }
        if (FLAG != Config.WRONG_ACTION) {
            for (var i in this.moveButtons) {
                var e = this.moveButtons[i];
                if (i != FLAG) {
                    if (e.getParent()) {
                        e.removeFromParent();
                    }
                }
            }
        }
    },
    /**
     * the function is used by ENEMY AI. when the enemy is moving, he will use this function to change the position status, and imply the player "I will move"
     * the FLAG must be the Config events that is related to move action. the detail is below.
     * @param FLAG
     */
    setPositionStatusTexture: function(FLAG) {
        var texture;
        switch(FLAG) {
            case Config.LEFT_SERIES: {
                texture = res.slide;
                break;
            }
            case Config.RIGHT_SERIES: {
                texture = res.slide;
                break;
            }
            case Config.MOVE_BACKWARD: {
                texture = res.backward;
                break;
            }
            case Config.MOVE_FORWARD: {
                texture = res.forward;
                break;
            }
        }
        this.positionStatus.setTexture(texture);
    },

    /**
     *
     * below is the defence action series.
     *
     */
    noDefence: function() {
        this.defenceButton.setTexture(res.noDefence);
        this.defenceProgress.setVisible(false);
        //this.defenceAction(Config.events.DEFENCE_END, Date.now());
        this.blockEnd();
    },
    doDefence: function() {
        this.defenceButton.setTexture(res.defence);
        this.defenceProgress.setVisible(true);
    },
    defenceAction: function(FLAG, time) {
        var progress = this.defenceProgress;
        var generateAction = function(stop, start) {
            if (stop != null && stop.getTarget() != null) {
                progress.stopAction(stop);
                stop.setTarget(null);
            }
            progress.runAction(start);
        };
        switch(FLAG) {
            case Config.events.DEFENCE_BEGIN: {
                this.defenceProgressOut = cc.moveTo(time, cc.p(this.defenceButton.x + Config.SLIDE_X, this.defenceButton.y));
                generateAction(this.defenceProgressIn, this.defenceProgressOut);
                break;
            }
            case Config.events.DEFENCE_END: {
                this.defenceProgressIn = cc.moveTo(time, cc.p(this.defenceButton.x, this.defenceButton.y));
                generateAction(this.defenceProgressOut, this.defenceProgressIn);
                break;
            }
        }
    },
    enemyDefenceBegin: function() {
        this.defenceStatus.setTexture(res.defence);
    },
    resetEnemyDefence: function() {
        this.defenceStatus.setTexture(res.noDefence);
    },
    /**
     * show layer will show the block action element with this function. the character is used to distingush player and AI.
     * @param character
     */
    blockBegin: function(character) {
        var block;
        switch(character) {
            case Config.PLAYER: {
                block = this.blockSprite;
                if (block.getParent() == null) {
                    this.addChild(block);
                }
                return;
            }
            case Config.ENEMY.category: {
                block = this.defenceStatus;
                block.setTexture(res.block);
                return;
            }
        }
    },
    blockEnd: function(character) {
        var block;
        switch(character) {
            case Config.PLAYER: {
                block = this.blockSprite;
                if (block.getParent()) {
                    block.removeFromParent();
                }
                return;
            }
            case Config.ENEMY.category: {
                block = this.defenceStatus;
                block.setTexture(res.defence);
                return;
            }
        }
    },

    /**
     * update function is used to listen the frame event, and no-stop action, like energy bar move up and down
     */

    setEnergyIndex: function(FLAG, index) {
        this[FLAG + "EnergyIndex"] = index;
        //this.playerEnergyIndex = index;
    },
    moveEnergyBar: function(variation, FLAG) {
        var fighter = this._getFighter(FLAG);
        var index = this[fighter + "EnergyIndex"];
        var bar = this.energyBars[FLAG];
        var yLimit = bar.getParent().getStencil().y - Config.MOVE_BUTTON_Y * 2;
        var height = bar.y + variation;
        var lastIndex = (index - 1 + Config.ENERGY_LENGTH) % Config.ENERGY_LENGTH;
        bar.y = height;
        if (height < yLimit) {
            this.eventCenter.dispatchEvent(Config.events.ENERGY_DURATION_BEGIN, {role: fighter, lastIndex: lastIndex, index: index, time: Date.now()})
        }
    },
    nextEnergyRotation: function(index, FLAG) {
        var fighter = this._getFighter(FLAG);
        var bar = this.energyBars[FLAG];
        var dot = this.energyDots[FLAG];
        bar.setTexture(res["Bar" + index]);
        if (FLAG == Config.ENEMY.category) {
            bar.y = Config.CENTER_Y + Config.ENERGY_ENEMY_Y;
        } else {
            bar.y = Config.CENTER_Y + Config.ENERGY_Y;
        }
        dot.setTexture(res["Dot" + index]);
        this[fighter + "EnergyIndex"] = index;
    },
    _getFighter: function(FLAG) {
        switch(FLAG) {
            case Config.RIGHT_SERIES: {
                return Config.PLAYER;
            }
            case Config.LEFT_SERIES: {
                return Config.PLAYER;
            }
            case Config.ENEMY.category: {
                return FLAG;
            }
        }

    },
    energyRotation: function() {
        //this.eventCenter.dispatchEvent(Config.events.PLAYER_ENERGY_ROTATION, {role: Config.PLAYER, index: this.playerEnergyIndex, time: Date.now()});
        this.eventCenter.dispatchEvent(Config.events.ENERGY_ROTATION_GO, {role: Config.PLAYER, index: this.playerEnergyIndex, time: Date.now()});
        this.eventCenter.dispatchEvent(Config.events.ENERGY_ROTATION_GO, {role: Config.ENEMY.category, index: this.enemyEnergyIndex, time: Date.now()});
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
    setEnergyLabel: function(FLAG, index, energy) {
        this.Energy[FLAG][index].setString(energy);
    },
    onEnter: function() {
        this._super();
        this.eventCenter = this.getParent().eventCenter;
        this.scheduleOnce(function() {
            this.eventCenter.dispatchEvent(Config.events.INIT_SHOW_LAYER, {time: Date.now()});
        }.bind(this));
    },
    /**
     * status action function
     */
    setPositionLabel: function(label) {
        //console.log(label);
        this.positionStatus.setTexture(res[label]);
    },
    enemyNoActionGo: function() {
        this.actionStatus.setTexture(res.noActionGo);
        this.enemyAttackEnd();
        this.attackStatus.setTexture(res.noAttack);
        this.defenceStatus.setTexture(res.noDefence);
    },
    enemyNoActionStop: function() {
        this.actionStatus.setTexture(res.noActionStop);
        this.setAttackEnergyTexture(Config.ENEMY.category, this.enemyAttackEnergy);
        this.resetEnemyDefence();
        //this.defenceStatus.setTexture(res.defence);
    },
    setComponentEnbaled: function(target, enable) {
        this[target].enable = enable;
    },
    getComponentEnabled: function(target) {
        return this[target].enable;
    },

    /**
     *
     * below is the show layer private method.
     * @private
     */
    _setElements: function() {
        var bg = new cc.Sprite(res.backGround);
        bg.x = Config.CENTER_X;
        bg.y = Config.CENTER_Y;
        this.addChild(bg);

        var position = new cc.Sprite(res.position);
        position.attr({
            x : Config.CENTER_X,
            y : Config.CENTER_Y + Config.POSITION_Y,
        });
        this.addChild(position, 1);

        var slideLeft = new cc.Sprite(res.slide);
        slideLeft.x = position.x - Config.SLIDE_X;
        slideLeft.y = position.y;

        var slideRight = new cc.Sprite(res.slide);
        slideRight.x = position.x + Config.SLIDE_X;
        slideRight.y = position.y;

        var moveForward = new cc.Sprite(res.forward);
        moveForward.x = position.x;
        moveForward.y = position.y + Config.MOVE_BUTTON_Y;

        var moveBackward = new cc.Sprite(res.backward);
        moveBackward.x = position.x;
        moveBackward.y = position.y - Config.MOVE_BUTTON_Y;

        var defence = new cc.Sprite(res.defence);
        defence.x = Config.CENTER_X + Config.DEFENCE_X;
        defence.y = Config.CENTER_Y + Config.DEFENCE_Y;
        this.addChild(defence, 1);

        var block = new cc.Sprite(res.block);
        block.x = defence.x;
        block.y = defence.y + Config.MOVE_BUTTON_Y;

        var attackMe = new cc.Sprite(res.noAttack);
        attackMe.x = Config.CENTER_X + Config.ATTACK_X;
        attackMe.y = Config.CENTER_Y + Config.ATTACK_Y;
        this.addChild(attackMe);

        var easyAttack = new cc.Sprite(res.easyNo);
        easyAttack.x = Config.CENTER_X + Config.EASY_X;
        easyAttack.y = Config.CENTER_Y + Config.EASY_Y;
        easyAttack.setName(Config.EASY_ATTACK_MODE);

        var hardAttack = new cc.Sprite(res.hardNo);
        hardAttack.x = Config.CENTER_X + Config.HARD_X;
        hardAttack.y = Config.CENTER_Y + Config.HARD_Y;
        hardAttack.setName(Config.HARD_ATTACK_MODE);

        var energyLeftBar = new cc.Sprite(res["Bar" + this.playerEnergyIndex]);
        energyLeftBar.x = Config.CENTER_X + Config.ENERGY_L_X;
        energyLeftBar.y = Config.CENTER_Y + Config.ENERGY_Y;
        var energyLeftStencil = new cc.Sprite(res.Bar0);
        energyLeftStencil.x = energyLeftBar.x;
        energyLeftStencil.y = energyLeftBar.y;
        var energyLeftMask = new cc.ClippingNode(energyLeftStencil);
        energyLeftMask.addChild(energyLeftBar);
        this.addChild(energyLeftMask);

        var energyRightBar = new cc.Sprite(res["Bar" + this.playerEnergyIndex]);
        energyRightBar.x = Config.CENTER_X + Config.ENERGY_R_X;
        energyRightBar.y = Config.CENTER_Y + Config.ENERGY_Y;
        var energyRightStencil = new cc.Sprite(res.Bar0);
        energyRightStencil.x = energyRightBar.x;
        energyRightStencil.y = energyRightBar.y;
        var energyRightMask = new cc.ClippingNode(energyRightStencil);
        energyRightMask.addChild(energyRightBar);
        this.addChild(energyRightMask);

        var energyLeftDot = new cc.Sprite(res["Dot" + this.playerEnergyIndex]);
        energyLeftDot.x = Config.CENTER_X + Config.ENERGY_L_X;
        energyLeftDot.y = Config.CENTER_Y + Config.DOT_Y;
        this.addChild(energyLeftDot);

        var energyRightDot = new cc.Sprite(res["Dot" + this.playerEnergyIndex]);
        energyRightDot.x = Config.CENTER_X + Config.ENERGY_R_X;
        energyRightDot.y = Config.CENTER_Y + Config.DOT_Y;
        this.addChild(energyRightDot);

        var defenceProgress = new cc.Sprite(res.buttonProgress);
        defenceProgress.x = defence.x;
        defenceProgress.y = defence.y;
        var defenceStencil = new cc.Sprite(res.buttonProgress);
        defenceStencil.x = defence.x;
        defenceStencil.y = defence.y;
        var defenceProgressMask = new cc.ClippingNode();
        defenceProgressMask.stencil = defenceStencil;
        defenceProgressMask.addChild(defenceProgress);
        this.addChild(defenceProgressMask);

        var attackProgress = new cc.Sprite(res.attackProgress);
        attackProgress.x = attackMe.x + Config.ATTACK_PROGRESS_X;
        attackProgress.y = attackMe.y + Config.ATTACK_PROGRESS_Y;
        var attackStencil = new cc.Sprite(res.attackProgress);
        attackStencil.x = attackProgress.x;
        attackStencil.y = attackProgress.y;
        var attackProgressMask = new cc.ClippingNode();
        attackProgressMask.stencil = attackStencil;
        attackProgressMask.addChild(attackProgress);
        attackProgressMask.setInverted(true);
        this.addChild(attackProgressMask);

        var positionProgress = new cc.Sprite(res.buttonProgress);
        positionProgress.x = position.x + Config.SLIDE_X;
        positionProgress.y = position.y;
        var positionStencil = new cc.Sprite(res.buttonProgress);
        positionStencil.x = position.x;
        positionStencil.y = position.y;
        var positionProgressMask = new cc.ClippingNode(positionStencil);
        positionProgressMask.addChild(positionProgress);
        this.addChild(positionProgressMask);

        var attackEnemy = new cc.Sprite(res.noAttack);
        attackEnemy.x = Config.CENTER_X + Config.ATTACK_ENEMY_X;
        attackEnemy.y = Config.CENTER_Y + Config.ATTACK_ENEMY_Y;
        this.addChild(attackEnemy);

        var defenceEnemy = new cc.Sprite(res.defence);
        defenceEnemy.x = Config.CENTER_X + Config.DEFENCE_ENEMY_X;
        defenceEnemy.y = Config.CENTER_Y + Config.DEFENCE_ENEMY_Y;
        this.addChild(defenceEnemy);

        var statusEnemy = new cc.Sprite(res.noAction);
        statusEnemy.x = Config.CENTER_X + Config.STATUS_ENEMY_X;
        statusEnemy.y = Config.CENTER_Y + Config.STATUS_ENEMY_Y;
        this.addChild(statusEnemy);

        var faceEnemy = new cc.Sprite(res.enemyFacedToMe);
        faceEnemy.x = Config.CENTER_X + Config.FACE_X;
        faceEnemy.y = Config.CENTER_Y + Config.FACE_Y;
        this.addChild(faceEnemy);

        var energyEnemyDot = new cc.Sprite(res["Dot" + this.playerEnergyIndex]);
        energyEnemyDot.x = Config.CENTER_X + Config.DOT_ENEMY_X;
        energyEnemyDot.y = Config.CENTER_Y + Config.DOT_ENEMY_Y;
        this.addChild(energyEnemyDot);

        var energyEnemyBar = new cc.Sprite(res["Bar" + this.playerEnergyIndex]);
        energyEnemyBar.x = Config.CENTER_X + Config.ENERGY_ENEMY_X;
        energyEnemyBar.y = Config.CENTER_Y + Config.ENERGY_ENEMY_Y;
        var energyEnemyStencil = new cc.Sprite(res.Bar2);
        energyEnemyStencil.x = energyEnemyBar.x;
        energyEnemyStencil.y = energyEnemyBar.y;
        var energyEnemyMask = new cc.ClippingNode(energyEnemyStencil);
        energyEnemyMask.addChild(energyEnemyBar);
        this.addChild(energyEnemyMask);

        var hitMe = new cc.Sprite(res.hitMe);
        hitMe.attr({
            x: attackMe.x,
            y: Config.CENTER_Y + Config.ME_HIT_Y
        });
        var hitMeStencil = new cc.Sprite(res.hitMask);
        hitMeStencil.attr({
            x: attackMe.x,
            y: Config.CENTER_Y + Config.ME_HIT_START_Y,
        });
        var hitMeMask = new cc.ClippingNode(hitMeStencil);
        hitMeMask.addChild(hitMe);

        var hitEnemy = new cc.Sprite(res.hitEnemy);
        hitEnemy.attr({
            x: attackEnemy.x,
            y: Config.CENTER_Y + Config.ENEMY_HIT_Y
        });
        var hitEnemyStencil = new cc.Sprite(res.hitMask);
        hitEnemyStencil.attr({
            x: attackEnemy.x,
            y: Config.CENTER_Y + Config.ENEMY_HIT_START_Y,
        });
        var hitEnemyMask = new cc.ClippingNode(hitEnemyStencil);
        hitEnemyMask.addChild(hitEnemy);
        
        for (var i = 0; i < Config.ENERGY_LENGTH; i++) {
            var numberMe = new cc.Sprite(res["Rec" + i]);
            numberMe.x = Config.CENTER_X + Config.ENERGY_NUMBER_X + i * Config.ENERGY_NUMBER_INTERVAL;
            numberMe.y = Config.CENTER_Y + Config.ENERGY_NUMBER_ME_Y;
            this.addChild(numberMe);

            var numberEnemy = new cc.Sprite(res["Rec" + i]);
            numberEnemy.x = numberMe.x;
            numberEnemy.y = Config.CENTER_Y + Config.ENERGY_NUMBER_ENEMY_Y;
            this.addChild(numberEnemy);

            var labelMe = new cc.LabelTTF("", "arial", 80);
            labelMe.x = numberMe.x;
            labelMe.y = numberMe.y;
            labelMe.setColor(Config.ENERGY_LIGHT_COLORS[i]);
            this.addChild(labelMe);
            this.Energy.player[i] = labelMe;

            var labelEnemy = new cc.LabelTTF("", "arial", 80);
            labelEnemy.x = numberEnemy.x;
            labelEnemy.y = numberEnemy.y;
            labelEnemy.setColor(Config.ENERGY_LIGHT_COLORS[i]);
            this.addChild(labelEnemy);
            this.Energy.enemy[i] = labelEnemy;
        }

        this.attackButton = attackMe;
        this.attackStatus = attackEnemy;
        this.defenceButton = defence;
        this.blockSprite = block;
        this.defenceStatus = defenceEnemy;
        this.positionButton = position;
        this.moveButtons[Config.LEFT_SERIES] = slideLeft;
        this.moveButtons[Config.RIGHT_SERIES] = slideRight;
        this.moveButtons[Config.MOVE_BACKWARD] = moveBackward;
        this.moveButtons[Config.MOVE_FORWARD] = moveForward;
        this.positionStatus = faceEnemy;
        this.easyButton = easyAttack;
        this.hardButton = hardAttack;
        this.actionStatus = statusEnemy;
        this.energyBars[Config.LEFT_SERIES] = energyLeftBar;
        this.energyBars[Config.RIGHT_SERIES] = energyRightBar;
        this.energyBars[Config.ENEMY.category] = energyEnemyBar;
        this.energyDots[Config.LEFT_SERIES] = energyLeftDot;
        this.energyDots[Config.RIGHT_SERIES] = energyRightDot;
        this.energyDots[Config.ENEMY.category] = energyEnemyDot;
        this.defenceProgress = defenceProgress;
        this.attackProgress = attackProgress;
        this.positionProgress = positionProgress;
        this.positionMask = positionProgressMask;
        this.playerHitMask = hitMeMask;
        this.playerHitStencil = hitMeStencil;
        this.enemyHitMask = hitEnemyMask;
        this.enemyHitStencil = hitEnemyStencil;
    },
});



