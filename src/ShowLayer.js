
var ShowLayer = cc.Layer.extend({

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
    energyButtons: [],
    //show player`s energy status
    energyBars: [],
    //energy quantity of player
    energyLabelsMe: new Array(5),
    //energy quantity of enemy
    energyLabelsEnemy: new Array(5),

    //show the attack progress bar
    attackProgress: null,
    //show the button which like player`s defence progress bar
    defenceProgress: null,
    //show the button which like player`s position action progress bar
    positionProgress: null,
    //the attack status of enemy
    attackStatus: null,
    //the defence status of enemy
    defenceStatus: null,
    //the position relationship between player and enemy
    positionStatus: null,
    //the noAction status of enemy
    actionStatus: null,
    //the energy dot of enemy
    energyDotEnemy: null,
    //the energy progress bar of enemy
    energyBarEnemy: null,

    attackEasyUp: null,
    attackHardUp: null,
    positionMovement: null,
    //attackProgressDown: null,
    defenceProgressOut: null,
    defenceProgressIn: null,

    sysControlLayer: null,

    ctor:function () {
        this._super();

        this.setName(Config.SHOW_LAYER);
        this._setElements();
        this._setAction();

        console.log("show layer OK!!!");

        return true;
    },

    /**
     *
     * below is the attack action series
     *
     */
    easyAttackReady: function() {
        this.easyButton.setTexture(res.easyGo);
    },
    easyAttackBegin: function() {
        this.easyButton.setTexture(res.easyAttack);
        this.hardButton.setTexture(res.hardNo);
    },
    hardAttackReady: function() {
        this.hardButton.setTexture(res.hardGo);
    },
    hardAttackBegin: function() {
        this.hardButton.setTexture(res.hardAttack);
        this.easyButton.setTexture(res.easyNo);
    },
    attackFinished: function() {
        this.attackProgress.y = this.attackButton.y + Config.ATTACK_PROGRESS_Y;
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
        if (this.attackEasyUp.getTarget() != null || this.attackHardUp.getTarget() != null) {
            //this.attackProgress.stopAction(this.attackEasyUp);
            this.attackProgress.stopAllActions();
            this.attackEasyUp.setTarget(null);
            this.attackHardUp.setTarget(null);
            console.log("stop progress");
        }

        this.attackFinished();
    },
    adjustPositionFinished: function() {
    },

    /**
     *
     * below is the position action series.
     *
     */
    adjustPositionEnded: function(FLAG) {
        var positionMovement = this.positionMovement;
        var positionProgress = this.positionProgress;
        if (FLAG == null || FLAG == Config.WRONG_ACTION) {
            if (positionMovement.getTarget() != null) { //!!! getTarget not getTarget()
                positionProgress.stopAllActions();
                positionMovement.setTarget(null);
            }
            positionProgress.x = this.positionButton.x + Config.SLIDE_X;
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
     *
     * below is the defence action series.
     *
     */
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
    blockBegin: function() {
        var block = this.blockSprite;
        if (block.getParent() == null) {
            this.addChild(block);
        }
    },
    blockEnd: function() {
        var block = this.blockSprite;
        if (block.getParent()) {
           block.removeFromParent();
        }
    },

    /**
     *
     * below is the showlayer private method.
     * @private
     */
    _setAction: function() {
        var easyTime = Config.duration.EASY_BUTTON / 1000;
        var hardTime = Config.duration.HARD_BUTTON / 1000;
        var positionTime = Config.duration.ADJUST_POSITION_BUTTON / 1000;
        this.attackEasyUp = cc.sequence(
            cc.moveTo(easyTime, cc.p(this.attackButton.x + Config.ATTACK_PROGRESS_X, this.attackButton.y + Config.ATTACK_PROGRESS_Y + 300)),
            cc.callFunc(function() {
                //_dispatchCustomEvent(Config.events.EASY_READY, Config.PLAYER);
                this.getParent().eventCenter.dispatchEvent(Config.events.EASY_READY, {role: Config.PLAYER, time: new Date().getTime()});
            }.bind(this), this)
        );
        this.attackHardUp = cc.sequence(
            cc.moveTo(hardTime, cc.p(this.attackButton.x + Config.ATTACK_PROGRESS_X, this.attackButton.y + Config.ATTACK_PROGRESS_Y + 300)),
            cc.callFunc(function() {
                //_dispatchCustomEvent(Config.events.HARD_READY, Config.PLAYER);
                this.getParent().eventCenter.dispatchEvent(Config.events.HARD_READY, {role: Config.PLAYER, time: new Date().getTime()});
            }.bind(this), this)
        );
        this.positionMovement = cc.sequence(
            cc.moveTo(positionTime, cc.p(this.positionButton.x, this.positionButton.y)),
            cc.callFunc(function() {
                for(var i in this.moveButtons) {
                    var e = this.moveButtons[i];
                    if (!e.getParent()) {
                        this.addChild(e);
                    }
                }
                //_dispatchCustomEvent(Config.events.POSITION_END, Config.PLAYER);
                //this.getParent().eventCenter.dispatchEvent(Config.events.POSITION_END, {role: Config.PLAYER, time: new Date().getTime()});
            }.bind(this), this)
        );
        /*
         var _dispatchCustomEvent = function(event, role) {
         this.getParent().eventCenter.dispatchEvent(event, {role: role, time: new Date().getTime()});
         };
         */
        //this.attackProgressDown = cc.moveTo(easyTime, cc.p(this.attackButton.x + Config.ATTACK_PROGRESS_X, this.attackButton.y + Config.ATTACK_PROGRESS_Y));
    },
    _setElements: function() {
        var bg = new cc.Sprite(res.backGround);
        bg.x = Config.CENTER_X;
        bg.y = Config.CENTER_Y;
        this.addChild(bg);

        var position = new cc.Sprite(res.position);
        position.x = Config.CENTER_X;
        position.y = Config.CENTER_Y + Config.POSITION_Y;
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

        var attackMe = new cc.Sprite(res.attack);
        attackMe.x = Config.CENTER_X + Config.ATTACK_X;
        attackMe.y = Config.CENTER_Y + Config.ATTACK_Y;
        this.addChild(attackMe);

        var easyAttack = new cc.Sprite(res.easyAttack);
        easyAttack.x = Config.CENTER_X + Config.EASY_X;
        easyAttack.y = Config.CENTER_Y + Config.EASY_Y;
        easyAttack.setName(Config.EASY_ATTACK_MODE);

        var hardAttack = new cc.Sprite(res.hardAttack);
        hardAttack.x = Config.CENTER_X + Config.HARD_X;
        hardAttack.y = Config.CENTER_Y + Config.HARD_Y;
        hardAttack.setName(Config.HARD_ATTACK_MODE);

        var energyLeftBar = new cc.Sprite(res.whiteBar);
        energyLeftBar.x = Config.CENTER_X + Config.ENERGY_L_X;
        energyLeftBar.y = Config.CENTER_Y + Config.ENERGY_Y;
        this.addChild(energyLeftBar);

        var energyRightBar = new cc.Sprite(res.redBar);
        energyRightBar.x = Config.CENTER_X + Config.ENERGY_R_X;
        energyRightBar.y = Config.CENTER_Y + Config.ENERGY_Y;
        this.addChild(energyRightBar);

        this.energyBars[Config.LEFT_SERIES] = energyLeftBar;
        this.energyBars[Config.RIGHT_SERIES] = energyRightBar;

        var energyLeftDot = new cc.Sprite(res.whiteDot);
        energyLeftDot.x = Config.CENTER_X + Config.ENERGY_L_X;
        energyLeftDot.y = Config.CENTER_Y + Config.DOT_Y;
        this.addChild(energyLeftDot);

        var energyRightDot = new cc.Sprite(res.redDot);
        energyRightDot.x = Config.CENTER_X + Config.ENERGY_R_X;
        energyRightDot.y = Config.CENTER_Y + Config.DOT_Y;
        this.addChild(energyRightDot);

        this.energyButtons[Config.LEFT_SERIES] = energyLeftDot;
        this.energyButtons[Config.RIGHT_SERIES] = energyRightDot;

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
        //this.addChild(positionProgress);
        var positionStencil = new cc.Sprite(res.buttonProgress);
        positionStencil.x = position.x;
        positionStencil.y = position.y;
        var positionProgressMask = new cc.ClippingNode();
        positionProgressMask.stencil = positionStencil;
        positionProgressMask.addChild(positionProgress);
        //positionProgressMask.setInverted(true);
        this.addChild(positionProgressMask);

        var attackEnemy = new cc.Sprite(res.attack);
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

        var faceEnemy = new cc.Sprite(res.face);
        faceEnemy.x = Config.CENTER_X + Config.FACE_X;
        faceEnemy.y = Config.CENTER_Y + Config.FACE_Y;
        this.addChild(faceEnemy);

        var energyEnemyDot = new cc.Sprite(res.greenDot);
        energyEnemyDot.x = Config.CENTER_X + Config.DOT_ENEMY_X;
        energyEnemyDot.y = Config.CENTER_Y + Config.DOT_ENEMY_Y;
        this.addChild(energyEnemyDot);

        var energyEnemyBar = new cc.Sprite(res.greenBar);
        energyEnemyBar.x = Config.CENTER_X + Config.ENERGY_ENEMY_X;
        energyEnemyBar.y = Config.CENTER_Y + Config.ENERGY_ENEMY_Y;
        this.addChild(energyEnemyBar);

        for (var i = 0; i < Config.ENERGY_LENGTH; i++) {
            var numberMe = new cc.Sprite("res/" + i + "Rec.png");
            numberMe.x = Config.CENTER_X + Config.ENERGY_NUMBER_X + i * Config.ENERGY_NUMBER_INTERVAL;
            numberMe.y = Config.CENTER_Y + Config.ENERGY_NUMBER_ME_Y;
            this.addChild(numberMe);

            var numberEnemy = new cc.Sprite("res/" + i + "Rec.png");
            numberEnemy.x = numberMe.x;
            numberEnemy.y = Config.CENTER_Y + Config.ENERGY_NUMBER_ENEMY_Y;
            this.addChild(numberEnemy);

            var labelMe = new cc.LabelTTF("48", "arial", 80);
            labelMe.x = numberMe.x;
            labelMe.y = numberMe.y;
            labelMe.setColor(Config.ENERGY_LIGHT_COLORS[i]);
            this.addChild(labelMe);

            var labelEnemy = new cc.LabelTTF("48", "arial", 80);
            labelEnemy.x = numberEnemy.x;
            labelEnemy.y = numberEnemy.y;
            labelEnemy.setColor(Config.ENERGY_LIGHT_COLORS[i]);
            this.addChild(labelEnemy);

            this.energyLabelsMe.push(labelMe);
            this.energyLabelsEnemy.push(labelEnemy);
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
        this.energyDotEnemy = energyEnemyDot;
        this.energyBarEnemy = energyEnemyBar;
        this.defenceProgress = defenceProgress;
        this.attackProgress = attackProgress;
        this.positionProgress = positionProgress;
    }
});



