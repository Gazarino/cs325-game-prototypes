"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var music;
    var blue;
    var red;
    var blast;
    var blasts;
    var offset;

    var spaceKey;
    var rKey;

    var textPhase;
    var textSpace;
    var textBattle;

    var actionsBlue;
    var actionsRed;
    var gaugeBlue;
    var gaugeRed;
    var blastPower;
    var blueSpecial;
    var redSpecial;

    var powerBank;
    var actionList;
    var amountButtons;
    var specialButton;
    var submitButton;
    var amountText;
    var textSpecial;
    var textRevenge;
    var specialRecovery;
    var waterGod;
    var earthGod;
    var textGod;
    var gameOver;

    function quitGame() {
        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
        if (music)
            music.stop();
        music = null;
        //blue = {sprite:null, hp:100, hpChange:0, hpSprite:null, hpBarSprite:null, hpText:"100/100"};
        if (blue) {
            blue.sprite.kill();
            blue.sprite = null;
            blue.hpSprite.kill();
            blue.hpSprite = null;
            blue.hpBarSprite.kill();
            blue.hpBarSprite = null;
            blue.hpText.kill();
            blue.hpText = null;
        } blue = null;
        //red = {sprite:null, hp:100, hpChange:0, hpSprite:null, hpBarSprite:null, hpText:"100/100"};
        if (red) {
            red.sprite.kill();
            red.sprite = null;
            red.hpSprite.kill();
            red.hpSprite = null;
            red.hpBarSprite.kill();
            red.hpBarSprite = null;
            red.hpText.kill();
            red.hpText = null;
        } red = null;
        blast = null;
        blasts = null;
        offset = null;

        spaceKey = null;
        rKey = null;

        textPhase = null;
        textSpace = null;
        textBattle = null;
        redSpecial = null;
        blueSpecial = null;

        actionsBlue = null;
        actionsRed = null;
        gaugeBlue = null;
        gaugeRed = null;
        blastPower = null;

        //powerBank = {sprite:null, charge:null, attack:null, heal:null, counter:null};
        //actionList = {sprite:null, act1:null, act2:null, act3:null, act4:null};
        //amountButtons = {act1Up:null, act1Down:null, act2Up:null, act2Down:null, act3Up:null, act3Down:null, act4Up:null, act4Down:null};
        powerBank = null;
        actionList = null;
        amountButtons = null;
        specialButton = null;
        submitButton = null;
        //amountText = {bank1:null, bank2:null, bank3:null, bank4:null, act1:null, act2:null, act3:null, act4:null};
        amountText = null;
        textSpecial = null;
        specialRecovery = null;
        gameOver = null;
        waterGod = null;
        earthGod = null;
        textGod = null;
        textRevenge = null;
        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }

    var mainGame = {
        create: function () {
            blue = {sprite:null, hp:100, hpChange:0, hpSprite:null, hpBarSprite:null, hpText:"100%"};
            red = {sprite:null, hp:100, hpChange:0, hpSprite:null, hpBarSprite:null, hpText:"100%"};
            actionsBlue = {act1:"", act2:"", act3:"", act4:"", pow1:0, pow2:0, pow3:0, pow4:0};
            actionsRed = {act1:"", act2:"", act3:"", act4:"", pow1:0, pow2:0, pow3:0, pow4:0};
            gaugeBlue = {charge:1, attack:1, heal:1, counter:1};
            gaugeRed = {charge:1, attack:1, heal:1, counter:1};
            blastPower = {blue:0, red:0, ref:false};
            powerBank = {sprite:null, charge:null, attack:null, heal:null, counter:null};
            actionList = {sprite:null, act1:null, act2:null, act3:null, act4:null};
            amountButtons = {act1Up:null, act1Down:null, act2Up:null, act2Down:null, act3Up:null, act3Down:null, act4Up:null, act4Down:null};
            amountText = {bank1:null, bank2:null, bank3:null, bank4:null, act1:null, act2:null, act3:null, act4:null};
            gameOver = false;
            redSpecial = {type:"", last:false, acted:false};
            blueSpecial = {type:"", last:false, acted:false};
            waterGod = false;
            earthGod = false;

            game.add.sprite(0, 0, 'background');
            game.physics.startSystem(Phaser.Physics.ARCADE);
            blasts = game.add.physicsGroup();
            blasts.enableBody = true;
            blasts.physicsBodyType = Phaser.Physics.ARCADE;
            blasts.createMultiple(10, 'blast');

            blue.sprite = game.add.sprite(335, 150, 'player1');
            game.physics.enable(blue.sprite, Phaser.Physics.ARCADE);
            blue.hpBarSprite = game.add.sprite(298, 130, 'healthbar');
            blue.hpSprite = game.add.sprite(299, 131, 'health');
            blue.hpText = game.add.text(298, 140, "100%", { font: "13px Arial", fill: "#ffffff", align: "center" });

            red.sprite = game.add.sprite(335, 360, 'player2');
            game.physics.enable(red.sprite, Phaser.Physics.ARCADE);
            red.hpBarSprite = game.add.sprite(298, 400, 'healthbar');
            red.hpSprite = game.add.sprite(299, 401, 'health');
            red.hpText = game.add.text(298, 410, "100%", { font: "13px Arial", fill: "#ffffff", align: "center" });

            music = game.add.audio('music');
            music.loopFull(.5);
            spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            rKey = game.input.keyboard.addKey(Phaser.KeyCode.R);
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

            textPhase = game.add.text(350, 35, "Blue Phase", {font: "24px Arial Black", fill: "#5055ff", align: "center" });
            textPhase.anchor.x = .5;
            textPhase.anchor.y = .5;

            textSpace = game.add.text(350, 65, "Press SPACE to continue.", { font: "12px Arial", fill: "#ffffff", align: "center" });
            textSpace.anchor.x = .5;
            textSpace.anchor.y = .5;

            textBattle = game.add.text(350, 295, "", { font: "18px Arial Black", fill: "#ffffff", align: "center" });
            textBattle.anchor.x = .5;
            textBattle.anchor.y = .5;
            textSpecial = game.add.text(0, 0, "", {font:"17px Arial Black", fill:"#ffffff", align:"center"});
            textSpecial.alpha = 0;
            textSpecial.anchor.x = .5;
            textSpecial.anchor.y = .5;

            textRevenge = game.add.text(350, 300, "", { font: "13px Arial", fill: "#ffffff", align: "center" });
            textRevenge.anchor.x = .5;
            textRevenge.anchor.y = .5;

            textGod = game.add.text(350, 270, "", {font: "24px Arial Black", fill: "#96ddff", align: "center" });
            textGod.anchor.x = .5;
            textGod.anchor.y = .5;

            if (shared.solo) {
                textPhase.text = "";
                textSpace.alpha = 0;
                this.computerAct();
                if (shared.red)
                    this.startRedPhase();
                else
                    this.startBluePhase();
            }
        },

        createGUI: function () {
            actionList.sprite = game.add.sprite(185, 40+offset, 'action_list');
            actionList.data = {act1:0, act2:0, act3:0, act4:0};

            amountButtons.act1Up = game.add.button(238, 75+offset, 'button_up', this.action1Up, null, null, null, null);
            amountButtons.act1Down = game.add.button(238, 98+offset, 'button_down', this.action1Down, null, null, null, null);
            amountButtons.act2Up = game.add.button(238, 75+50+offset, 'button_up', this.action2Up, null, null, null, null);
            amountButtons.act2Down = game.add.button(238, 98+50+offset, 'button_down', this.action2Down, null, null, null, null);
            amountButtons.act3Up = game.add.button(238, 75+100+offset, 'button_up', this.action3Up, null, null, null, null);
            amountButtons.act3Down = game.add.button(238, 98+100+offset, 'button_down', this.action3Down, null, null, null, null);
            amountButtons.act4Up = game.add.button(238, 75+150+offset, 'button_up', this.action4Up, null, null, null, null);
            amountButtons.act4Down = game.add.button(238, 98+150+offset, 'button_down', this.action4Down, null, null, null, null);

            if (offset < 1) {
                powerBank.data = {charge:gaugeBlue.charge, attack:gaugeBlue.attack, heal:gaugeBlue.heal, counter:gaugeBlue.counter};
                submitButton = game.add.button(350, 52+offset, 'button_submit_blue', this.submit, null, null, null, null);
            } else {
                powerBank.data = {charge:gaugeRed.charge, attack:gaugeRed.attack, heal:gaugeRed.heal, counter:gaugeRed.counter};
                submitButton = game.add.button(350, 52+offset, 'button_submit_red', this.submit, null, null, null, null);
            }
            specialButton = game.add.button(270, 45+offset, 'button_special', this.specialAction, null, null, null, null);

            powerBank.sprite = game.add.sprite(50, 40+offset, 'power_bank');

            powerBank.charge = this.makeSprite("charge");
            powerBank.attack = this.makeSprite("attack");
            powerBank.heal = this.makeSprite("heal");
            powerBank.counter = this.makeSprite("counter");

            amountText.bank1 = game.add.text(powerBank.charge.x+35, powerBank.charge.y+30, powerBank.data.charge, {font:"15px Arial Black", fill:"#000000", align:"center"});
            amountText.bank2 = game.add.text(powerBank.attack.x+35, powerBank.attack.y+30, powerBank.data.attack, {font:"15px Arial Black", fill:"#000000", align:"center"});
            amountText.bank3 = game.add.text(powerBank.heal.x+35, powerBank.heal.y+30, powerBank.data.heal, {font:"15px Arial Black", fill:"#000000", align:"center"});
            amountText.bank4 = game.add.text(powerBank.counter.x+35, powerBank.counter.y+30, powerBank.data.counter, {font:"15px Arial Black", fill:"#000000", align:"center"});

            amountText.act1 = game.add.text(powerBank.charge.x+105, powerBank.charge.y+30, "", {font:"15px Arial Black", fill:"#000000", align:"center"});
            amountText.act2 = game.add.text(powerBank.attack.x+105, powerBank.attack.y+30, "", {font:"15px Arial Black", fill:"#000000", align:"center"});
            amountText.act3 = game.add.text(powerBank.heal.x+105, powerBank.heal.y+30, "", {font:"15px Arial Black", fill:"#000000", align:"center"});
            amountText.act4 = game.add.text(powerBank.counter.x+105, powerBank.counter.y+30, "", {font:"15px Arial Black", fill:"#000000", align:"center"});

            textSpecial.x = specialButton.centerX+50;
            textSpecial.y = specialButton.y-20;
            specialRecovery = {chargePow:0, attackPow:0, healPow:0, counterPow:0};
        },

        destroyGUI: function () {
            actionList.sprite.kill();
            if (actionList.act1) {
                actionList.act1.kill();
                actionList.act1 = null;
            }
            if (actionList.act2) {
                actionList.act2.kill();
                actionList.act2 = null;
            }
            if (actionList.act3) {
                actionList.act3.kill();
                actionList.act3 = null;
            }
            if (actionList.act4) {
                actionList.act4.kill();
                actionList.act4 = null;
            }

            amountButtons.act1Up.kill();
            amountButtons.act1Down.kill();
            amountButtons.act2Up.kill();
            amountButtons.act2Down.kill();
            amountButtons.act3Up.kill();
            amountButtons.act3Down.kill();
            amountButtons.act4Up.kill();
            amountButtons.act4Down.kill();
            submitButton.kill();
            specialButton.kill();

            powerBank.sprite.kill();
            powerBank.charge.kill();
            powerBank.charge = null;
            powerBank.attack.kill();
            powerBank.attack = null;
            powerBank.heal.kill();
            powerBank.heal = null;
            powerBank.counter.kill();
            powerBank.counter = null;
            powerBank.data.charge = 0;
            powerBank.data.attack = 0;
            powerBank.data.heal = 0;
            powerBank.data.counter = 0;

            amountText.bank1.kill();
            amountText.bank2.kill();
            amountText.bank3.kill();
            amountText.bank4.kill();
            amountText.act1.kill();
            amountText.act2.kill();
            amountText.act3.kill();
            amountText.act4.kill();
        },

        makeSprite: function(type) {
            var sprite;
            switch (type) {
                case "charge": sprite = game.add.sprite(118, 72+offset, 'action_charge');
                        sprite.data = {type:"charge", power:powerBank.data.charge, prev:"bank"}; break;
                case "attack": sprite = game.add.sprite(118, 72+50+offset, 'action_attack');
                        sprite.data = {type:"attack", power:powerBank.data.attack, prev:"bank"}; break;
                case "heal": sprite = game.add.sprite(118, 72+100+offset, 'action_heal');
                        sprite.data = {type:"heal", power:powerBank.data.heal, prev:"bank"}; break;
                case "counter": sprite = game.add.sprite(118, 72+150+offset, 'action_counter');
                        sprite.data = {type:"counter", power:powerBank.data.counter, prev:"bank"}; break;
                case "special": sprite = game.add.sprite(188, 72+offset, 'action_special');
                        sprite.data = {type:"special", power:1, prev:"act1"};
            }
            sprite.inputEnabled = true;
            sprite.input.enableDrag(true);
            sprite.events.onDragStop.add(this.fixLocation);
            sprite.events.onDragStart.add(this.changeLocation);
            return sprite;
        },

        action1Up: function () {
            if (actionList.act1 && actionList.act1.data.type !== "special")
                mainGame.increasePower(actionList.act1, amountText.act1);
        },
        action1Down: function () {
            if (actionList.act1 && actionList.act1.data.power > 1)
                mainGame.decreasePower(actionList.act1, amountText.act1);
        },
        action2Up: function () {
            if (actionList.act2 && actionList.act2.data.type !== "special")
                mainGame.increasePower(actionList.act2, amountText.act2);
        },
        action2Down: function () {
            if (actionList.act2 && actionList.act2.data.power > 1)
                mainGame.decreasePower(actionList.act2, amountText.act2);
        },
        action3Up: function () {
            if (actionList.act3 && actionList.act3.data.type !== "special")
                mainGame.increasePower(actionList.act3, amountText.act3);
        },
        action3Down: function () {
            if (actionList.act3 && actionList.act3.data.power > 1)
                mainGame.decreasePower(actionList.act3, amountText.act3);
        },
        action4Up: function () {
            if (actionList.act4 && actionList.act4.data.type !== "special")
                mainGame.increasePower(actionList.act4, amountText.act4);
        },
        action4Down: function () {
            if (actionList.act4 && actionList.act4.data.power > 1)
                mainGame.decreasePower(actionList.act4, amountText.act4);
        },

        increasePower: function(sprite, textAct) {
            switch (sprite.data.type) {
                case "charge": if (powerBank.data.charge < 1) return;
                                  powerBank.data.charge--;
                                  amountText.bank1.text = powerBank.data.charge; break;
                case "attack": if (powerBank.data.attack < 1) return;
                                  powerBank.data.attack--;
                                  amountText.bank2.text = powerBank.data.attack; break;
                case "heal": if (powerBank.data.heal < 1) return;
                                  powerBank.data.heal--;
                                  amountText.bank3.text = powerBank.data.heal; break;
                case "counter": if (powerBank.data.counter < 1) return;
                                  powerBank.data.counter--;
                                  amountText.bank4.text = powerBank.data.counter; break;
            }
            sprite.data.power++;
            textAct.text = sprite.data.power;
        },

        decreasePower: function(sprite, textAct) {
            switch (sprite.data.type) {
                case "charge": powerBank.data.charge++;
                              amountText.bank1.text = powerBank.data.charge; break;
                case "attack": powerBank.data.attack++;
                              amountText.bank2.text = powerBank.data.attack; break;
                case "heal": powerBank.data.heal++;
                              amountText.bank3.text = powerBank.data.heal; break;
                case "counter": powerBank.data.counter++;
                              amountText.bank4.text = powerBank.data.counter; break;
            }
            sprite.data.power--;
            textAct.text = sprite.data.power;
        },

        specialAction: function() {
            var powerSum = 0;
            var actionsInPlay = {charge:0, attack:0, heal:0, counter:0, special:0};
            if (actionList.act1) powerSum+=backupPower(actionList.act1);
            if (actionList.act2) powerSum+=backupPower(actionList.act2);
            if (actionList.act3) powerSum+=backupPower(actionList.act3);
            if (actionList.act4) powerSum+=backupPower(actionList.act4);

            if (powerSum !== 5 || actionsInPlay.special > 0) {
                if (textSpecial.alpha === 0)
                    game.time.events.add(Phaser.Timer.SECOND*4, fadeText, this);
                if (actionsInPlay.special > 0)
                    textSpecial.text = "You cannot do more than 1 special charge per battle phase.";
                else
                    textSpecial.text = "The power sum in the action list must equal 5.";
                textSpecial.alpha = 1;
            } else {
                specialRecovery.chargePow *= actionsInPlay.charge;
                specialRecovery.attackPow *= actionsInPlay.attack;
                specialRecovery.healPow *= actionsInPlay.heal;
                specialRecovery.counterPow *= actionsInPlay.counter;

                if (actionList.act1) {
                    actionList.act1.kill();
                    actionList.act1 = null;
                    amountText.act1.kill();
                    amountText.act1 = game.add.text(0,0,"",{font:"15px Arial", fill:"#000000", align:"center"});
                }
                if (actionList.act2) {
                    actionList.act2.kill();
                    actionList.act2 = null;
                    amountText.act2.kill();
                    amountText.act2 = game.add.text(0,0,"",{font:"15px Arial", fill:"#000000", align:"center"});
                }
                if (actionList.act3) {
                    actionList.act3.kill();
                    actionList.act3 = null;
                    amountText.act3.kill();
                    amountText.act3 = game.add.text(0,0,"",{font:"15px Arial", fill:"#000000", align:"center"});
                }
                if (actionList.act4) {
                    actionList.act4.kill();
                    actionList.act4 = null;
                    amountText.act4.kill();
                    amountText.act4 = game.add.text(0,0,"",{font:"15px Arial", fill:"#000000", align:"center"});
                }
                actionList.act1 = mainGame.makeSprite("special");
                amountText.act1 = game.add.text(188+35, actionList.act1.y+30, 1, {font:"15px Arial Black", fill:"#000000", align:"center"});
            }
            function backupPower (sprite) {
                switch (sprite.data.type) {
                    case "charge": specialRecovery.chargePow = sprite.data.power;   actionsInPlay.charge++; break;
                    case "attack": specialRecovery.attackPow = sprite.data.power;   actionsInPlay.attack++; break;
                    case "heal": specialRecovery.healPow = sprite.data.power;       actionsInPlay.heal++; break;
                    case "counter": specialRecovery.counterPow = sprite.data.power; actionsInPlay.counter++; break;
                    case "special": actionsInPlay.special++;
                }
                return sprite.data.power;
            }
            function fadeText () { game.add.tween(textSpecial).to({alpha:0}, 1000, "Linear", true); }
        },

        submit: function() {
            if (!chargesValid()) {
                if (textSpecial.alpha === 0)
                    game.time.events.add(Phaser.Timer.SECOND*4, fadeText, this);
                textSpecial.text = "Every charge must be immediately followed by attack, heal, or counter.";
                textSpecial.alpha = 1;
            } else {
                if (offset < 1) { // Blue
                    actionsBlue = {act1:"", act2:"", act3:"", act4:"", pow1:0, pow2:0, pow3:0, pow4:0};
                    storeInput(actionsBlue, gaugeBlue);
                    if (waterGod) {
                        textPhase.text = "Water God Phase";
                        textPhase.fill = "#96ddff";
                    } else {
                        textPhase.text = "Red Phase";
                        textPhase.fill = "#ff3030";
                    }
                } else {  // Red
                    actionsRed = {act1:"", act2:"", act3:"", act4:"", pow1:0, pow2:0, pow3:0, pow4:0};
                    storeInput(actionsRed, gaugeRed);
                    textPhase.text = "Battle Phase";
                    textPhase.fill = "#ffffff";
                }
                if (shared.solo) {
                    textPhase.text = "";
                    mainGame.startBattle();
                } else
                    textSpace.alpha = 1;
                mainGame.destroyGUI();
            }
            function storeInput (playerActions, gauge) {
                if (actionList.act1) {
                    playerActions.act1 = actionList.act1.data.type;
                    playerActions.pow1 = actionList.act1.data.power;
                } if (actionList.act2) {
                    playerActions.act2 = actionList.act2.data.type;
                    playerActions.pow2 = actionList.act2.data.power;
                } if (actionList.act3) {
                    playerActions.act3 = actionList.act3.data.type;
                    playerActions.pow3 = actionList.act3.data.power;
                } if (actionList.act4) {
                    playerActions.act4 = actionList.act4.data.type;
                    playerActions.pow4 = actionList.act4.data.power;
                }
                gauge.charge = powerBank.data.charge;
                gauge.attack = powerBank.data.attack;
                gauge.heal = powerBank.data.heal;
                gauge.counter = powerBank.data.counter;
            }
            function fadeText () { game.add.tween(textSpecial).to({alpha:0}, 1000, "Linear", true); }
            function chargesValid () {
                var valid = true;
                if (actionList.act1 && (actionList.act1.data.type === "charge" || actionList.act1.data.type === "special"))
                    if (!actionList.act2 || actionList.act2.data.type === "charge" || actionList.act2.data.type === "special")
                        valid = false;
                if (actionList.act2 && (actionList.act2.data.type === "charge" || actionList.act2.data.type === "special"))
                    if (!actionList.act3 || actionList.act3.data.type === "charge" || actionList.act3.data.type === "special")
                        valid = false;
                if (actionList.act3 && (actionList.act3.data.type === "charge" || actionList.act3.data.type === "special"))
                    if (!actionList.act4 || actionList.act4.data.type === "charge" || actionList.act4.data.type === "special")
                        valid = false;
                if (actionList.act4 && (actionList.act4.data.type === "charge" || actionList.act4.data.type === "special"))
                    valid = false;
                return valid;
            }
        },

        changeLocation: function(item) {
            switch (item.data.prev) {
                case "act1": amountText.act1.kill();
                    amountText.act1 = game.add.text(0,0,"",{font:"15px Arial", fill:"#000000", align:"center"});
                    actionList.act1 = null; break;
                case "act2": amountText.act2.kill();
                    amountText.act2 = game.add.text(0,0,"",{font:"15px Arial", fill:"#000000", align:"center"});
                    actionList.act2 = null; break;
                case "act3": amountText.act3.kill();
                    amountText.act3 = game.add.text(0,0,"",{font:"15px Arial", fill:"#000000", align:"center"});
                    actionList.act3 = null; break;
                case "act4": amountText.act4.kill();
                    amountText.act4 = game.add.text(0,0,"",{font:"15px Arial", fill:"#000000", align:"center"});
                    actionList.act4 = null; break;
            }
        },

        fixLocation: function(item) {
            if (item.data.prev === "bank")  // Stop fast clickers from doing anything to items in bank.
                return;
            if (item.centerX < 185 || item.centerX > 235 || item.centerY < 75+offset || item.centerY > 280+offset) {
                restorePower(item);
                item.kill();
                return;
            }
            if (item.centerY < 125+offset) {
                item.y = 72+offset;
                if (actionList.act1) {
                    if (actionList.act1.data.type === item.data.type)
                        item.data.power+=actionList.act1.data.power;
                    else
                        restorePower(actionList.act1);
                    actionList.act1.kill();
                }
                actionList.act1 = item;
                item.data.prev = "act1";
                amountText.act1.kill();
                amountText.act1 = game.add.text(188+35, item.y+30, item.data.power, {font:"15px Arial Black", fill:"#000000", align:"center"});
            } else if (item.centerY < 175+offset) {
                item.y = 122+offset;
                if (actionList.act2) {
                    if (actionList.act2.data.type === item.data.type)
                        item.data.power+=actionList.act2.data.power;
                    else
                        restorePower(actionList.act2);
                    actionList.act2.kill();
                }
                actionList.act2 = item;
                item.data.prev = "act2";
                amountText.act2.kill();
                amountText.act2 = game.add.text(188+35, item.y+30, item.data.power, {font:"15px Arial Black", fill:"#000000", align:"center"});
            } else if (item.centerY < 225+offset) {
                item.y = 172+offset;
                if (actionList.act3) {
                    if (actionList.act3.data.type === item.data.type)
                        item.data.power+=actionList.act3.data.power;
                    else
                        restorePower(actionList.act3);
                    actionList.act3.kill();
                }
                actionList.act3 = item;
                item.data.prev = "act3";
                amountText.act3.kill();
                amountText.act3 = game.add.text(188+35, item.y+30, item.data.power, {font:"15px Arial Black", fill:"#000000", align:"center"});
            } else {
                item.y = 222+offset;
                if (actionList.act4) {
                    if (actionList.act4.data.type === item.data.type)
                        item.data.power+=actionList.act4.data.power;
                    else
                        restorePower(actionList.act4);
                    actionList.act4.kill();
                }
                actionList.act4 = item;
                item.data.prev = "act4";
                amountText.act4.kill();
                amountText.act4 = game.add.text(188+35, item.y+30, item.data.power, {font:"15px Arial Black", fill:"#000000", align:"center"});
            }
            item.x = 188;
            function restorePower (sprite) {
                switch (sprite.data.type) {
                    case "charge": powerBank.data.charge += sprite.data.power; break;
                    case "attack": powerBank.data.attack += sprite.data.power; break;
                    case "heal": powerBank.data.heal += sprite.data.power; break;
                    case "counter": powerBank.data.counter += sprite.data.power; break;
                    case "special": powerBank.data.charge += specialRecovery.chargePow;
                                    powerBank.data.attack += specialRecovery.attackPow;
                                    powerBank.data.heal += specialRecovery.healPow;
                                    powerBank.data.counter += specialRecovery.counterPow;
                }
            }
        },

        startBattle: function () {
            offset = 1;
            if (blueSpecial.last)
                blueSpecial.last = false;
            else
                blueSpecial.type = "";
            if (redSpecial.last)
                redSpecial.last = false;
            else
                redSpecial.type = "";

            if (actionsBlue.act1==="" && actionsBlue.act2==="" && actionsBlue.act3==="" && actionsBlue.act4===""
             && actionsRed.act1==="" && actionsRed.act2==="" && actionsRed.act3==="" && actionsRed.act4==="") {
               game.time.events.add(Phaser.Timer.SECOND*2.5, this.battleEnd, this);
               textBattle.text = "Nobody acts!";
            } else {
                blueSpecial.acted = false;
                redSpecial.acted = false;
                this.battle();
            }
        },
        battle: function () {
            if (gameOver)
                return;
            if (blasts.total > 0) {
                game.time.events.add(Phaser.Timer.SECOND, this.battle, this);
                return;
            }
            var blueAct, bluePow, redAct, redPow;
            do {
                switch (offset) {
                    case 1: blueAct = actionsBlue.act1, bluePow = actionsBlue.pow1,
                            redAct = actionsRed.act1, redPow = actionsRed.pow1;
                            if (blueAct==="charge" && !(blueSpecial.acted && redSpecial.type === "stun attack"))
                                actionsBlue.pow2 += bluePow;
                            if (redAct==="charge" && !(redSpecial.acted && blueSpecial.type === "stun attack"))
                                actionsRed.pow2 += redPow;
                            if (blueAct==="special" && !(blueSpecial.acted && redSpecial.type === "stun attack"))
                                actionsBlue.act2 += blueAct;
                            if (redAct==="special" && !(redSpecial.acted && blueSpecial.type === "stun attack"))
                                actionsRed.act2 += redAct; break;
                    case 2: blueAct = actionsBlue.act2, bluePow = actionsBlue.pow2,
                            redAct = actionsRed.act2, redPow = actionsRed.pow2;
                            if (blueAct==="charge" && !(blueSpecial.acted && redSpecial.type === "stun attack"))
                                actionsBlue.pow3 += bluePow;
                            if (redAct==="charge" && !(redSpecial.acted && blueSpecial.type === "stun attack"))
                                actionsRed.pow3 += redPow;
                            if (blueAct==="special" && !(blueSpecial.acted && redSpecial.type === "stun attack"))
                                actionsBlue.act3 += blueAct;
                            if (redAct==="special" && !(redSpecial.acted && blueSpecial.type === "stun attack"))
                                actionsRed.act3 += redAct; break;
                    case 3: blueAct = actionsBlue.act3, bluePow = actionsBlue.pow3,
                            redAct = actionsRed.act3, redPow = actionsRed.pow3;
                            if (blueAct==="charge" && !(blueSpecial.acted && redSpecial.type === "stun attack"))
                                actionsBlue.pow4 += bluePow;
                            if (redAct==="charge" && !(redSpecial.acted && blueSpecial.type === "stun attack"))
                                actionsRed.pow4 += redPow;
                            if (blueAct==="special" && !(blueSpecial.acted && redSpecial.type === "stun attack"))
                                actionsBlue.act4 += blueAct;
                            if (redAct==="special" && !(redSpecial.acted && blueSpecial.type === "stun attack"))
                                actionsRed.act4 += redAct; break;
                    default: blueAct = actionsBlue.act4, bluePow = actionsBlue.pow4,
                            redAct = actionsRed.act4, redPow = actionsRed.pow4;
                }
                if (offset > 4) {
                    this.battleEnd();
                    return;
                } offset++;
                if (blueAct==="") blueSpecial.acted = false;
                if (redAct==="") redSpecial.acted = false;
            } while (blueAct==="" && redAct==="");

            if (blueAct.includes("special") && !(blueSpecial.acted && redSpecial.type === "stun attack")) {
                if (earthGod) {
                    if (blueAct==="attackspecial")  blueSpecial.type = "stun attack";
                    if (blueAct==="healspecial")  blueSpecial.type = "drain heal";
                    if (blueAct==="counterspecial")  blueSpecial.type = "deny counter";
                } else {
                    if (blueAct==="attackspecial")  blueSpecial.type = "pierce attack";
                    if (blueAct==="healspecial")  blueSpecial.type = "chronic heal";
                    if (blueAct==="counterspecial")  blueSpecial.type = "almighty counter";
                }
                blueSpecial.last = true;
            }
            if (redAct.includes("special") && !(redSpecial.acted && blueSpecial.type === "stun attack")) {
                if (waterGod) {
                    if (redAct==="attackspecial")  redSpecial.type = "stun attack";
                    if (redAct==="healspecial")  redSpecial.type = "drain heal";
                    if (redAct==="counterspecial")  redSpecial.type = "deny counter";
                } else {
                    if (redAct==="attackspecial")  redSpecial.type = "pierce attack";
                    if (redAct==="healspecial")  redSpecial.type = "chronic heal";
                    if (redAct==="counterspecial")  redSpecial.type = "almighty counter";
                }
                redSpecial.last = true;
            }

            if (blueAct.includes("heal") && !(blueSpecial.acted && redSpecial.type === "stun attack")) {
                blue.hpChange += (8*bluePow);
                if (blueSpecial.type==="drain heal")
                    red.hpChange -= (8*bluePow);
                if (redSpecial.type === "almighty counter" && redAct.includes("counter")
                        && !(redSpecial.acted && blueSpecial.type === "stun attack") && blueSpecial.type !== "deny counter")
                    blue.hpChange -= (6*redPow*bluePow);
            } if (redAct.includes("heal") && !(redSpecial.acted && blueSpecial.type === "stun attack")) {
                red.hpChange += (8*redPow);
                if (redSpecial.type==="drain heal")
                    blue.hpChange -= (8*redPow);
                if (blueSpecial.type === "almighty counter" && blueAct.includes("counter")
                        && !(blueSpecial.acted && redSpecial.type === "stun attack") && redSpecial.type !== "deny counter")
                    red.hpChange -= (6*redPow*bluePow);
            }

            blastPower.blue = 0;
            blastPower.red = 0;

            if (blueAct.includes("attack") && !(blueSpecial.acted && redSpecial.type === "stun attack")) {
                if (redAct.includes("counter") && blueSpecial.type !== "pierce attack"
                        && !(redSpecial.acted && blueSpecial.type === "stun attack") && blueSpecial.type !== "deny counter") {
                    blastPower.blue = 6*bluePow*redPow;
                    blastPower.ref = true;
                    if (blastPower.blue > 49)
                        gaugeBlue.charge++;
                } else {
                    blastPower.blue = 10*bluePow;
                    blastPower.ref = false;
                    if (blastPower.blue > 0)
                        gaugeRed.attack++;
                    if (blastPower.blue > 49)
                        gaugeRed.charge++;
                }
                if (blastPower.blue > 0)
                    this.fireblast(1);
            } if (redAct.includes("attack") && !(redSpecial.acted && blueSpecial.type === "stun attack")) {
                if (blueAct.includes("counter") && redSpecial.type !== "pierce attack"
                        && !(blueSpecial.acted && redSpecial.type === "stun attack") && redSpecial.type !== "deny counter") {
                    blastPower.red = 6*bluePow*redPow;
                    blastPower.ref = true;
                    if (blastPower.red > 49)
                        gaugeRed.charge++;
                } else {
                    blastPower.red = 10*redPow;
                    blastPower.ref = false;
                    if (blastPower.red > 0)
                        gaugeBlue.attack++;
                    if (blastPower.red > 49)
                        gaugeBlue.charge++;
                }
                if (blastPower.red > 0)
                    this.fireblast(2);
            }
            var strBlue;
            var strRed;
            if (earthGod) strBlue = this.generateBattleString("Earth God",blueAct,bluePow,blueSpecial,redAct,redSpecial);
            else  strBlue = this.generateBattleString("Blue",blueAct,bluePow,blueSpecial,redAct,redSpecial);

            if (waterGod) strRed = this.generateBattleString("Water God",redAct,redPow,redSpecial,blueAct,blueSpecial);
            else  strRed = this.generateBattleString("Red",redAct,redPow,redSpecial,blueAct,blueSpecial);
            textBattle.text = strBlue+"\n"+strRed;
            if (blueSpecial.acted)
                blueSpecial.acted = false;
            else if (blueAct!=="" && redSpecial.type==="stun attack")
                blueSpecial.acted = true;
            if (redSpecial.acted)
                redSpecial.acted = false;
            else if (redAct!=="" && blueSpecial.type==="stun attack")
                redSpecial.acted = true;
            if (offset < 5)
                game.time.events.add(Phaser.Timer.SECOND*2.75, this.battle, this);
            else
                game.time.events.add(Phaser.Timer.SECOND*2.75, this.battleEnd, this);
        },
        generateBattleString: function (name, action, power, special, opponentAction, opponentSpecial) {
            if (power < 1)
                return "";
            var battleStr = name+" "+action+"s with "+power+" power!"
            if (action==="special")
                battleStr = name+" does a special charge!";
            else if (action.includes("special"))
                battleStr = name+" activates "+special.type+"!";
            if (opponentAction.includes("attack") && action==="counter" && opponentSpecial.type==="pierce attack")
                battleStr = name+" counters, but it's pierced through!";
            if (opponentSpecial.type==="deny counter" && action==="counter")
                battleStr = name+" tries to counter, but fails!";
            if (opponentSpecial.type==="stun attack" && special.acted)
                battleStr = name+" tries to act, but can't move!";
            return battleStr;
        },
        battleEnd: function () {
            if (gameOver)
                return;
            if (shared.solo) {
                this.computerAct();
                if (shared.red)
                    this.startRedPhase();
                else
                    this.startBluePhase();
            } else {
                if (earthGod) {
                    textPhase.text = "Earth God Phase";
                    textPhase.fill = "#fca955";
                } else {
                    textPhase.text = "Blue Phase";
                    textPhase.fill = "#5055ff";
                }
                textSpace.alpha = 1;
            }
            textBattle.text = "";
        },

        startBluePhase: function () {
            offset = 0;
            if (earthGod)
                this.chargeChar(gaugeBlue, true);
            else
                this.chargeChar(gaugeBlue, false);
            this.createGUI();
        },
        startRedPhase: function () {
            offset = 200;
            if (waterGod)
                this.chargeChar(gaugeRed, true);
            else
                this.chargeChar(gaugeRed, false);
            this.createGUI();
        },
        chargeChar: function (gauge, isGod) {
            gauge.counter++;
            gauge.charge++;
            gauge.heal++;
            gauge.attack++;
            if (isGod)  gauge.charge++;
            if (gauge.counter > 4) gauge.counter = 4;
            if (gauge.charge > 4)  gauge.charge = 4;
            if (gauge.heal > 4)    gauge.heal = 4;
            if (gauge.attack > 4)  gauge.attack = 4;
        },

        computerAct: function () {
            if (shared.red) {
                this.chargeChar(gaugeBlue);
                actionsBlue = {act1:"", act2:"", act3:"", act4:"", pow1:0, pow2:0, pow3:0, pow4:0};
                decideActions(actionsBlue, gaugeBlue, gaugeRed, blue.hp, red.hp, blueSpecial.type, redSpecial.type);
            } else {
                this.chargeChar(gaugeRed);
                actionsRed = {act1:"", act2:"", act3:"", act4:"", pow1:0, pow2:0, pow3:0, pow4:0};
                decideActions(actionsRed, gaugeRed, gaugeBlue, red.hp, blue.hp, redSpecial.type, blueSpecial.type);
            }
            function decideActions (comInput, comGauge, playerGauge, comHP, playerHP, comSpecial, playerSpecial) {

            }
        },

        spawnWaterGod: function () {
            switch (offset) {
                case 1: textGod.text = "Red's vengeful soul\nwishes to destroy you.";
                        red.sprite.kill();
                        music = game.add.audio('boss');
                        music.loopFull(.5);
                        red.sprite = game.add.sprite(305, 320, 'waterGod');
                        red.sprite.animations.add('waterGod', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true);
                        game.add.tween(red.sprite).to({alpha:1}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
                        game.physics.enable(red.sprite, Phaser.Physics.ARCADE);
                        red.sprite.width *= 1.35;
                        red.sprite.height *= 1.35;
                        red.sprite.play('waterGod', 18, true, true); break;
                case 2: textGod.text = "You cannot be forgiven\nfor stealing my powers!"; break;
                case 3: textGod.text = "We won't miss this\nchance for revenge... Die!"; break;
                case 4: textGod.text = "";
            }
            offset++;
            if (offset < 5)
                game.time.events.add(Phaser.Timer.SECOND*5.9, this.spawnWaterGod, this);
            else {
                red.hp = 100;
                red.hpSprite.alpha = 1;
                red.hpBarSprite.alpha = 1;
                red.hpText.alpha = 1;
                gaugeRed = {charge:1, attack:1, heal:1, counter:1};
                textPhase.text = "Blue Phase";
                textPhase.fill = "#5055ff";
                textSpace.alpha = 1;
                waterGod = true;
                gameOver = false;
            }
        },

        spawnEarthGod: function () {
            switch (offset) {
                case 1: textGod.text = "Blue lends me his soul\nso that I may crush you.";
                        blue.sprite.kill();
                        music = game.add.audio('boss');
                        music.loopFull(.5);
                        blue.sprite = game.add.sprite(305, 115, 'earthGod');
                        blue.sprite.animations.add('earthGod', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true);
                        game.add.tween(blue.sprite).to({alpha:1}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
                        game.physics.enable(blue.sprite, Phaser.Physics.ARCADE);
                        blue.sprite.width *= 1.35;
                        blue.sprite.height *= 1.35;
                        blue.sprite.play('earthGod', 18, true, true); break;
                case 2: textGod.text = "I don't have much of the\npower you took from me..."; break;
                case 3: textGod.text = "But this should be enough\nto put you in your grave!"; break;
                case 4: textGod.text = "";
            }
            offset++;
            if (offset < 5)
                game.time.events.add(Phaser.Timer.SECOND*5.9, this.spawnEarthGod, this);
            else {
                blue.hp = 100;
                blue.hpSprite.y -= 25;
                blue.hpBarSprite.y -= 25;
                blue.hpText.y -= 25;
                blue.hpSprite.alpha = 1;
                blue.hpBarSprite.alpha = 1;
                blue.hpText.alpha = 1;
                gaugeBlue = {charge:1, attack:1, heal:1, counter:1};
                textPhase.text = "Earth God Phase";
                textPhase.fill = "#fca955";
                textSpace.alpha = 1;
                earthGod = true;
                gameOver = false;
            }
        },

        update: function () {
            if (rKey.downDuration(1) && textRevenge.text!=="") {
                offset = 1;
                music.fadeOut(2000);
                blueSpecial.type = "";
                redSpecial.type = "";
                textSpace.text = "Press SPACE to continue.";
                textSpace.alpha = 0;
                textPhase.text = "";
                if (textRevenge.text.includes("Blue")) {
                    blue.hp = 1;
                    textGod.fill = "#fca955";
                    textGod.text = "Grr...";
                    game.time.events.add(Phaser.Timer.SECOND*3.5, this.spawnEarthGod, this);
                } else {
                    red.hp = 1;
                    textGod.text = "Ahh....";
                    game.time.events.add(Phaser.Timer.SECOND*3.5, this.spawnWaterGod, this);
                }
                textRevenge.text = "";
            }
            if (spaceKey.downDuration(1)) {
                if (textPhase.text === "Blue Phase" || textPhase.text === "Earth God Phase") {
                    textPhase.text = "";
                    textSpace.alpha = 0;
                    this.startBluePhase();
                } else if (textPhase.text === "Red Phase" || textPhase.text === "Water God Phase") {
                    textPhase.text = "";
                    textSpace.alpha = 0;
                    this.startRedPhase();
                } else if (textPhase.text === "Battle Phase") {
                    textPhase.text = "";
                    textSpace.alpha = 0;
                    this.startBattle();
                } else if (gameOver && textSpace.alpha!==0) {
                    quitGame();
                }
            }

            if (powerBank) {
                if (powerBank.charge && powerBank.data.charge > 0) {
                    powerBank.charge.alpha = 1;
                    powerBank.charge.inputEnabled = true;
                    if (powerBank.charge.input.isDragged) {
                        powerBank.charge.data.power = 1;
                        powerBank.charge.data.prev = "";
                        powerBank.charge = this.makeSprite("charge");
                        powerBank.data.charge--;
                    }
                    amountText.bank1.kill();
                    amountText.bank1 = game.add.text(powerBank.charge.x+35, powerBank.charge.y+30, powerBank.data.charge, {font:"15px Arial Black", fill:"#000000", align:"center"});
                }
                if (powerBank.attack && powerBank.data.attack > 0) {
                    powerBank.attack.alpha = 1;
                    powerBank.attack.inputEnabled = true;
                    if (powerBank.attack.input.isDragged) {
                        powerBank.attack.data.power = 1;
                        powerBank.attack.data.prev = "";
                        powerBank.attack = this.makeSprite("attack");
                        powerBank.data.attack--;
                    }
                    amountText.bank2.kill();
                    amountText.bank2 = game.add.text(powerBank.attack.x+35, powerBank.attack.y+30, powerBank.data.attack, {font:"15px Arial Black", fill:"#000000", align:"center"});
                }
                if (powerBank.heal && powerBank.data.heal > 0) {
                    powerBank.heal.alpha = 1;
                    powerBank.heal.inputEnabled = true;
                    if (powerBank.heal.input.isDragged) {
                        powerBank.heal.data.power = 1;
                        powerBank.heal.data.prev = "";
                        powerBank.heal = this.makeSprite("heal");
                        powerBank.data.heal--;
                    }
                    amountText.bank3.kill();
                    amountText.bank3 = game.add.text(powerBank.heal.x+35, powerBank.heal.y+30, powerBank.data.heal, {font:"15px Arial Black", fill:"#000000", align:"center"});
                }
                if (powerBank.counter && powerBank.data.counter > 0) {
                    powerBank.counter.alpha = 1;
                    powerBank.counter.inputEnabled = true;
                    if (powerBank.counter.input.isDragged) {
                        powerBank.counter.data.power = 1;
                        powerBank.counter.data.prev = "";
                        powerBank.counter = this.makeSprite("counter");
                        powerBank.data.counter--;
                    }
                    amountText.bank4.kill();
                    amountText.bank4 = game.add.text(powerBank.counter.x+35, powerBank.counter.y+30, powerBank.data.counter, {font:"15px Arial Black", fill:"#000000", align:"center"});
                }

                if (powerBank.charge && powerBank.data.charge === 0) {
                    powerBank.charge.alpha = .5;
                    powerBank.charge.inputEnabled = false;
                } if (powerBank.attack && powerBank.data.attack === 0) {
                    powerBank.attack.alpha = .5;
                    powerBank.attack.inputEnabled = false;
                } if (powerBank.heal && powerBank.data.heal === 0) {
                    powerBank.heal.alpha = .5;
                    powerBank.heal.inputEnabled = false;
                } if (powerBank.counter && powerBank.data.counter === 0) {
                    powerBank.counter.alpha = .5;
                    powerBank.counter.inputEnabled = false;
                }
            }
            if (blue && blue.sprite) {
                game.physics.arcade.overlap(blasts, blue.sprite, this.blueHit, null, this);
                game.physics.arcade.overlap(blasts, red.sprite, this.redHit, null, this);
                this.checkHP();
            }
        },

        checkHP: function () {
            if (blue.hpChange > 0) {
                blue.hp++;
                blue.hpChange--;
            } else if (blue.hpChange < 0) {
                blue.hp--;
                blue.hpChange++;
            } if (red.hpChange > 0) {
                red.hp++;
                red.hpChange--;
            } else if (red.hpChange < 0) {
                red.hp--;
                red.hpChange++;
            }
            if (blue.hp <= 0) {
                blue.hp = 0;
                blue.hpChange = 0;
                game.add.tween(blue.sprite).to({alpha:0}, 1200, "Linear", true);
                game.add.tween(blue.hpSprite).to({alpha:0}, 1200, "Linear", true);
                game.add.tween(blue.hpBarSprite).to({alpha:0}, 1200, "Linear", true);
                game.add.tween(blue.hpText).to({alpha:0}, 1200, "Linear", true);
                if (!(earthGod || waterGod)) {
                    textRevenge.text = "Psst! Want REVENGE, Blue? Press R.";
                    textRevenge.y = blue.hpSprite.y+10;
                }
            } if (red.hp <= 0) {
                red.hp = 0;
                red.hpChange = 0;
                game.add.tween(red.sprite).to({alpha:0}, 1200, "Linear", true);
                game.add.tween(red.hpSprite).to({alpha:0}, 1200, "Linear", true);
                game.add.tween(red.hpBarSprite).to({alpha:0}, 1200, "Linear", true);
                game.add.tween(red.hpText).to({alpha:0}, 1200, "Linear", true);
                if (!(earthGod || waterGod)) {
                    textRevenge.text = "Psst! Want REVENGE, Red? Press R.";
                    textRevenge.y = red.hpSprite.y+15;
                }
            }
            if (blue.hp > 100) blue.hp = 100;
            if (red.hp > 100) red.hp = 100;
            blue.hpText.text = ""+blue.hp+"%";
            blue.hpSprite.width = blue.hp;
            red.hpText.text = ""+red.hp+"%";
            red.hpSprite.width = red.hp;

            if (blue.hp>50) blue.hpSprite.tint = 0x00e80f;
            else if (blue.hp>25) blue.hpSprite.tint = 0xf6ff00;
            else blue.hpSprite.tint = 0xff0000;
            if (red.hp>50) red.hpSprite.tint = 0x00e80f;
            else if (red.hp>25) red.hpSprite.tint = 0xf6ff00;
            else red.hpSprite.tint = 0xff0000;//*/

            if (blue.hp===0 || red.hp===0) {
                if (blue.hp===0 && red.hp===0) {
                    textPhase.text = "Game! It's a draw!";
                    textPhase.fill = "#ffffff";
                    textRevenge.text = "";
                } else if (blue.hp === 0) {
                    if (waterGod) {
                      textPhase.text = "Water God Wins!";
                      textPhase.fill = "#96ddff";
                    } else {
                      textPhase.text = "Red Wins!";
                      textPhase.fill = "#ff3030";
                    }

                } else {
                    if (earthGod) {
                      textPhase.text = "Earth God Wins!";
                      textPhase.fill = "#fca955";
                    } else {
                      textPhase.text = "Blue Wins!";
                      textPhase.fill = "#5055ff";
                    }
                }
                textBattle.text = "";
                textSpace.text = "Press SPACE to go back to the main menu.";
                textSpace.alpha = 1;
                if (!gameOver) {
                    music.fadeOut(2000);
                    game.time.events.add(Phaser.Timer.SECOND*1.5, playVictoryMusic, this);
                }
                gameOver = true;
            }
            function playVictoryMusic () {
                music = game.add.audio('victory');
                music.loopFull(.5);
            }
        },

        blueHit: function (b, blast) {
            if (blast.lifespan > 1500)
                return;
            if (blastPower.ref) {
                blastPower.ref = false;
                blast.body.velocity.y = -blast.body.velocity.y;
            } else {
                if (blastPower.red === 0)
                    blue.hpChange -= blastPower.blue;
                else
                    blue.hpChange -= blastPower.red;
                if (blueSpecial.type === "chronic heal")
                    blue.hpChange = Math.floor(blue.hpChange/3);
                blast.kill();
            }
        },
        redHit: function (r, blast) {
            if (blast.lifespan > 1500)
                return;
            if (blastPower.ref) {
                blastPower.ref = false;
                blast.body.velocity.y = -blast.body.velocity.y;
            } else {
                if (blastPower.blue === 0)
                    red.hpChange -= blastPower.red;
                else
                    red.hpChange -= blastPower.blue;
                if (redSpecial.type === "chronic heal")
                    red.hpChange = Math.floor(red.hpChange/3);
                blast.kill();
            }
        },

        fireblast: function (player) {
            blast = blasts.getFirstExists(false);
            if (blast) {
                if (player === 1) {
                    blast.reset(blue.sprite.centerX, blue.sprite.centerY + 20);
                    blast.body.velocity.y = 200;
                    blast.data = "blue";
                } else {
                    blast.reset(red.sprite.centerX, red.sprite.centerY - 20);
                    blast.body.velocity.y = -200;
                    blast.data = "red";
                }
                blast.lifespan = 2000;
                blast.anchor.x = .5;
                blast.anchor.y = .5;
                blast.body.angularVelocity = 225;
            }
        }
    };
    return mainGame;
};
