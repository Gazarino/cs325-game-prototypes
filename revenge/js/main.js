window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/v2.6.2/resources/Project%20Templates/Basic

    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".

    "use strict";

    var game = new Phaser.Game( 725, 500, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );

    function preload() {
        game.load.image('play1', 'assets/player1.png');
        game.load.image('play2', 'assets/player2.png');
        game.load.image('bullet', 'assets/blast.png');
        game.load.image('background', 'assets/background.jpg');
        game.load.audio('song', ['assets/Savage_Steel_Fun_Club.mp3', 'assets/Savage_Steel_Fun_Club.ogg']);
    }

    var music;
    var sprite;
    var sprite2;
    var bullet;
    var bullets;
    var bulletTime = 0;

    var leftKey;
    var rightKey;
    var downKey;
    var upKey;
    var spaceKey;

    var textCharge;
    var textAttack;
    var textHeal;
    var textCounter;

    var textAction;
    var textActionCount;
    var textPower;
    var textStored;
    var textHP1;
    var textHP2;
    var textPlayer;
    var textPhase;
    var textSpace;
    var textKeys;
    var textInfo;
    var textBattle;

    var turn = {actionCount:2, chosenAct:"", power:2};
    var actionsP1 = {act1:"", act2:"", act3:"", act4:"", pow1:0, pow2:0, pow3:0, pow4:0};
    var actionsP2 = {act1:"", act2:"", act3:"", act4:"", pow1:0, pow2:0, pow3:0, pow4:0};
    var gaugeP1 = {charge:1, attack:1, heal:1, counter:1, stored:0};
    var gaugeP2 = {charge:1, attack:1, heal:1, counter:1, stored:0};
    var healthP1 = 100;
    var healthP2 = 100;
    var phase = 0;
    var blastInPlay = false;
    var blastPower = {p1:0, p2:0, ref:false};

    function create() {
        game.add.sprite(0, 0, 'background');
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //game.stage.backgroundColor = '#2d2d2d';

        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(10, 'bullet');
        bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetBullet, this);
        bullets.setAll('checkWorldBounds', true);

        sprite = game.add.sprite(330, 150, 'play1');
        game.physics.enable(sprite, Phaser.Physics.ARCADE);

        sprite2 = game.add.sprite(330, 360, 'play2');
        game.physics.enable(sprite2, Phaser.Physics.ARCADE);

        music = game.add.audio('song');
        music.play();
        music.volume -= .7;

      	//  Register the keys.
      	this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      	this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      	this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //  Stop the following keys from propagating up to the browser
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
                    Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.SPACEBAR ]);


        this.textPhase = game.add.text(265, 35, "Player 1 Phase", { font: "24px Arial", fill: "#ffffff", align: "center" });
        this.textSpace = game.add.text(275, 65, "Press SPACE to continue.", { font: "12px Arial", fill: "#ffffff", align: "center" });

        this.textPlayer = game.add.text(135, 120, "", { font: "16px Arial", fill: "#ffffff", align: "center" });
      	this.textCharge = game.add.text(100, 140, "", { font: "16px Arial", fill: "#ffffff", align: "center" });
      	this.textAttack = game.add.text(100, 160, "", { font: "16px Arial", fill: "#ffffff", align: "center" });
      	this.textHeal = game.add.text(100, 180, "", { font: "16px Arial", fill: "#ffffff", align: "center" });
        this.textCounter = game.add.text(100, 200, "", { font: "16px Arial", fill: "#ffffff", align: "center" });

        this.textHP1 = game.add.text(290, 130, "P1 Health: "+healthP1, { font: "16px Arial", fill: "#ffffff", align: "center" });
        this.textHP2 = game.add.text(290, 400, "P2 Health: "+healthP2, { font: "16px Arial", fill: "#ffffff", align: "center" });
        this.textInfo = game.add.text(220, 25, "", { font: "18px Arial", fill: "#ffffff", align: "center" });
        this.textKeys = game.add.text(110, 55, "", { font: "14px Arial", fill: "#ffffff", align: "center" });
        this.textAction = game.add.text(220, 55, "", { font: "16px Arial", fill: "#ffffff", align: "center" });
        this.textActionCount = game.add.text(230, 80, "", { font: "16px Arial", fill: "#ffffff", align: "center" });
        this.textPower = game.add.text(340, 80, "", { font: "16px Arial", fill: "#ffffff", align: "center" });
        this.textStored = game.add.text(245, 170, "", { font: "16px Arial", fill: "#ffffff", align: "center" });

        this.textBattle = game.add.text(400, 225, "", { font: "20px Arial", fill: "#ffffff", align: "center" });
    }

    function battle(p1Act, p1Pow, p2Act, p2Pow) {
        if (p1Act==="Heal") {
            healthP1 += (8*p1Pow);
            if (healthP1 > 100)
                healthP1 = 100;
        } if (p2Act==="Heal") {
            healthP2 += (8*p2Pow);
            if (healthP2 > 100)
                healthP2 = 100;
        }

        blastPower.p1 = 0;
        blastPower.p2 = 0;

        if (p1Act==="Attack") {
            if (p2Act==="Counter" && p2Pow > 0) {
                blastPower.p1 = 6*p1Pow*p2Pow;
                blastPower.ref = true;
                if (blastPower.p1 > 49)
                    gaugeP1.charge++;
            } else {
                blastPower.p1 = 10*p1Pow;
                blastPower.ref = false;
                if (blastPower.p1 > 0)
                    gaugeP2.attack++;
                if (blastPower.p1 > 49)
                    gaugeP2.charge++;
            }
            if (blastPower.p1 > 0)
                fireBullet(1);
        } if (p2Act==="Attack") {
            if (p1Act==="Counter" && p2Pow > 0) {
                blastPower.p2 = 6*p1Pow*p2Pow;
                blastPower.ref = true;
                if (blastPower.p2 > 49)
                    gaugeP2.charge++;
            } else {
                blastPower.p2 = 10*p2Pow;
                blastPower.ref = false;
                if (blastPower.p2 > 0)
                    gaugeP1.attack++;
                if (blastPower.p2 > 49)
                    gaugeP1.charge++;
            }
            if (blastPower.p2 > 0)
                fireBullet(2);
        }

        var strP1 = "P1 "+p1Act+"s with "+p1Pow+" power!";
        var strP2 = "P2 "+p2Act+"s with "+p2Pow+" power!";
        if (p1Pow < 1)
            strP1 = "P1 uses no power...";
        if (p2Pow < 1)
            strP2 = "P2 uses no power...";
        if (p1Act==="" && p2Act==="") {
            turn.actionCount = 0;
            return "Neither players acts!";
        } if (p2Act==="")
            return strP1;
        if (p1Act==="")
            return strP2;
        return strP1+"\n"+strP2;
    }

    function update() {
        if (this.spaceKey.downDuration(1)) {
            if (this.textPhase.text === "Player 1 Phase") {
                this.textPhase.text = "";
                this.textSpace.text = "";
                this.textPlayer.text = "Player 1";
                this.textInfo.text = "Select how many actions you wish to perform.";
                this.textKeys.text = "Use arrow keys:";
                this.textAction.text = "v Fewer actions, ^ More actions, > Submit";
                turn.actionCount = 2;
                gaugeP1.counter++;
                gaugeP1.charge++;
                gaugeP1.heal++;
                gaugeP1.attack++;
                if (gaugeP1.counter > 4)
                    gaugeP1.counter = 4;
                if (gaugeP1.charge > 4)
                    gaugeP1.charge = 4;
                if (gaugeP1.heal > 4)
                    gaugeP1.heal = 4;
                if (gaugeP1.attack > 4)
                    gaugeP1.attack = 4;
                actionsP1.act1 = "";
                actionsP1.act2 = "";
                actionsP1.act3 = "";
                actionsP1.act4 = "";
            } else if (this.textPhase.text === "Player 2 Phase") {
                this.textPhase.text = "";
                this.textSpace.text = "";
                this.textPlayer.text = "Player 2";
                this.textInfo.text = "Select how many actions you wish to perform.";
                this.textKeys.text = "Use arrow keys:";
                this.textAction.text = "v Fewer actions, ^ More actions, > Submit";
                turn.actionCount = 2;
                gaugeP2.counter++;
                gaugeP2.charge++;
                gaugeP2.heal++;
                gaugeP2.attack++;
                if (gaugeP2.counter > 4)
                    gaugeP2.counter = 4;
                if (gaugeP2.charge > 4)
                    gaugeP2.charge = 4;
                if (gaugeP2.heal > 4)
                    gaugeP2.heal = 4;
                if (gaugeP2.attack > 4)
                    gaugeP2.attack = 4;
                actionsP2.act1 = "";
                actionsP2.act2 = "";
                actionsP2.act3 = "";
                actionsP2.act4 = "";
            } else if (this.textPhase.text === "Battling Phase") {
                this.textPhase.text = "Battle Action 1";
                turn.actionCount = 4;
                this.textBattle.text = battle(actionsP1.act1, actionsP1.pow1, actionsP2.act1, actionsP2.pow1);
            } else if (this.textBattle.text !== "" && this.textSpace.text === "Press SPACE to continue.") {
                turn.actionCount--;
                if (turn.actionCount === 3) {
                    this.textPhase.text = "Battle Action 2";
                    this.textBattle.text = battle(actionsP1.act2, actionsP1.pow2, actionsP2.act2, actionsP2.pow2);
                } else if (turn.actionCount === 2) {
                    this.textPhase.text = "Battle Action 3";
                    this.textBattle.text = battle(actionsP1.act3, actionsP1.pow3, actionsP2.act3, actionsP2.pow3);
                } else if (turn.actionCount === 1) {
                    this.textPhase.text = "Battle Action 4";
                    this.textBattle.text = battle(actionsP1.act4, actionsP1.pow4, actionsP2.act4, actionsP2.pow4);
                } if (turn.actionCount < 1 && this.textSpace.text !== "Refresh page to restart.") {
                    this.textBattle.text = "";
                    this.textPhase.text = "Player 1 Phase";
                }
            }
        }

        if (this.downKey.downDuration(1)) {
            if (this.textAction.text === "v Fewer actions, ^ More actions, > Submit") {
                if (turn.actionCount > 0)
                    turn.actionCount--;
            } else if (this.textAction.text === "v Counter, ^ Charge, < Heal, > Attack") {
                turn.chosenAct = "Counter";
                turn.power = 2;
                if (this.textPlayer.text === "Player 1") {
                    while (turn.power > gaugeP1.counter)
                        turn.power--;
                    if (turn.power < gaugeP1.stored)
                        turn.power = gaugeP1.stored;
                } else if (this.textPlayer.text === "Player 2") {
                    while (turn.power > gaugeP2.counter)
                        turn.power--;
                    if (turn.power < gaugeP2.stored)
                        turn.power = gaugeP2.stored;
                }
                this.textInfo.text = "How much Counter power do you want to use?";
                this.textAction.text = "v Less power, ^ More power, < Back, > Submit";
            } else if (this.textAction.text === "v Less power, ^ More power, < Back, > Submit") {
                if (this.textPlayer.text === "Player 1") {
                    if (turn.power > gaugeP1.stored)
                        turn.power--;
                } else {
                    if (turn.power > gaugeP2.stored)
                        turn.power--;
                }
            }
      	}

      	if (this.upKey.downDuration(1)) {
            if (this.textAction.text === "v Fewer actions, ^ More actions, > Submit") {
                if (turn.actionCount < 4)
                    turn.actionCount++;
            } else if (this.textAction.text === "v Counter, ^ Charge, < Heal, > Attack") {
                turn.chosenAct = "Charge";
                turn.power = 2;
                if (this.textPlayer.text === "Player 1") {
                    while (turn.power > gaugeP1.charge)
                        turn.power--;
                    if (turn.power < gaugeP1.stored)
                        turn.power = gaugeP1.stored;
                } else if (this.textPlayer.text === "Player 2") {
                    while (turn.power > gaugeP2.charge)
                        turn.power--;
                    if (turn.power < gaugeP2.stored)
                        turn.power = gaugeP2.stored;
                }
                this.textInfo.text = "How much Charge power do you want to use?";
                this.textAction.text = "v Less power, ^ More power, < Back, > Submit";
            } else if (this.textAction.text === "v Less power, ^ More power, < Back, > Submit") {
                if (this.textPlayer.text === "Player 1") {
                    if (turn.chosenAct === "Counter") {
                        if (gaugeP1.counter+gaugeP1.stored > turn.power)
                            turn.power++;
                    } else if (turn.chosenAct === "Charge") {
                        if (gaugeP1.charge+gaugeP1.stored > turn.power)
                            turn.power++;
                    } else if (turn.chosenAct === "Heal") {
                        if (gaugeP1.heal+gaugeP1.stored > turn.power)
                            turn.power++;
                    } else if (turn.chosenAct === "Attack") {
                        if (gaugeP1.attack+gaugeP1.stored > turn.power)
                            turn.power++;
                    }
                } else if (this.textPlayer.text === "Player 2") {
                    if (turn.chosenAct === "Counter") {
                        if (gaugeP2.counter+gaugeP2.stored > turn.power)
                            turn.power++;
                    } else if (turn.chosenAct === "Charge") {
                        if (gaugeP2.charge+gaugeP2.stored > turn.power)
                            turn.power++;
                    } else if (turn.chosenAct === "Heal") {
                        if (gaugeP2.heal+gaugeP2.stored > turn.power)
                            turn.power++;
                    } else if (turn.chosenAct === "Attack") {
                        if (gaugeP2.attack+gaugeP2.stored > turn.power)
                            turn.power++;
                    }
                }
            }
      	}

        if (this.leftKey.downDuration(1)) {
            if (this.textAction.text === "v Counter, ^ Charge, < Heal, > Attack") {
                turn.chosenAct = "Heal";
                turn.power = 2;
                if (this.textPlayer.text === "Player 1") {
                    while (turn.power > gaugeP1.heal)
                        turn.power--;
                    if (turn.power < gaugeP1.stored)
                        turn.power = gaugeP1.stored;
                } else if (this.textPlayer.text === "Player 2") {
                    while (turn.power > gaugeP2.heal)
                        turn.power--;
                    if (turn.power < gaugeP2.stored)
                        turn.power = gaugeP2.stored;
                }
                this.textInfo.text = "How much Heal power do you want to use?";
                this.textAction.text = "v Less power, ^ More power, < Back, > Submit";
            } else if (this.textAction.text === "v Less power, ^ More power, < Back, > Submit") {
                this.textInfo.text = "Choose an action.";
                this.textAction.text = "v Counter, ^ Charge, < Heal, > Attack";
            }
      	}

        if (this.rightKey.downDuration(1)) {
            if (this.textAction.text === "v Fewer actions, ^ More actions, > Submit") {
                if (turn.actionCount > 0) {
                    this.textInfo.text = "Choose an action.";
                    this.textAction.text = "v Counter, ^ Charge, < Heal, > Attack";
                } else {
                    if (this.textPlayer.text === "Player 1")
                        this.textPhase.text = "Player 2 Phase";
                    else if (this.textPlayer.text === "Player 2")
                        this.textPhase.text = "Battling Phase";
                    this.textPlayer.text = "";
                }
            } else if (this.textAction.text === "v Counter, ^ Charge, < Heal, > Attack") {
                turn.chosenAct = "Attack";
                turn.power = 2;
                if (this.textPlayer.text === "Player 1") {
                    while (turn.power > gaugeP1.attack)
                        turn.power--;
                    if (turn.power < gaugeP1.stored)
                        turn.power = gaugeP1.stored;
                } else if (this.textPlayer.text === "Player 2") {
                    while (turn.power > gaugeP2.attack)
                        turn.power--;
                    if (turn.power < gaugeP2.stored)
                        turn.power = gaugeP2.stored;
                }
                this.textInfo.text = "How much Attack power do you want to use?";
                this.textAction.text = "v Less power, ^ More power, < Back, > Submit";
            } else if (this.textAction.text === "v Less power, ^ More power, < Back, > Submit") {
                if (this.textPlayer.text === "Player 1") {
                    if (actionsP1.act1 === "") {
                        actionsP1.pow1 = turn.power;
                    } else if (actionsP1.act2 === "") {
                        actionsP1.pow2 = turn.power;
                    } else if (actionsP1.act3 === "") {
                        actionsP1.pow3 = turn.power;
                    } else {
                        actionsP1.pow4 = turn.power;
                    }

                    if (turn.chosenAct === "Counter") {
                        gaugeP1.counter -= (turn.power-gaugeP1.stored);
                        gaugeP1.stored = 0;
                        if (actionsP1.act1 === "") {
                            actionsP1.act1 = "Counter";
                        } else if (actionsP1.act2 === "") {
                            actionsP1.act2 = "Counter";
                        } else if (actionsP1.act3 === "") {
                            actionsP1.act3 = "Counter";
                        } else {
                            actionsP1.act4 = "Counter";
                        }
                    } else if (turn.chosenAct === "Charge") {
                        gaugeP1.charge -= (turn.power-gaugeP1.stored);
                        gaugeP1.stored = turn.power;
                        if (actionsP1.act1 === "") {
                            actionsP1.act1 = "Charge";
                        } else if (actionsP1.act2 === "") {
                            actionsP1.act2 = "Charge";
                        } else if (actionsP1.act3 === "") {
                            actionsP1.act3 = "Charge";
                        } else {
                            actionsP1.act4 = "Charge";
                        }
                    } else if (turn.chosenAct === "Heal") {
                        gaugeP1.heal -= (turn.power-gaugeP1.stored);
                        gaugeP1.stored = 0;
                        if (actionsP1.act1 === "") {
                            actionsP1.act1 = "Heal";
                        } else if (actionsP1.act2 === "") {
                            actionsP1.act2 = "Heal";
                        } else if (actionsP1.act3 === "") {
                            actionsP1.act3 = "Heal";
                        } else {
                            actionsP1.act4 = "Heal";
                        }
                    } else if (turn.chosenAct === "Attack") {
                        gaugeP1.attack -= (turn.power-gaugeP1.stored);
                        gaugeP1.stored = 0;
                        if (actionsP1.act1 === "") {
                            actionsP1.act1 = "Attack";
                        } else if (actionsP1.act2 === "") {
                            actionsP1.act2 = "Attack";
                        } else if (actionsP1.act3 === "") {
                            actionsP1.act3 = "Attack";
                        } else {
                            actionsP1.act4 = "Attack";
                        }
                    }
                } else if (this.textPlayer.text === "Player 2") {
                    if (actionsP2.act1 === "") {
                        actionsP2.pow1 = turn.power;
                    } else if (actionsP2.act2 === "") {
                        actionsP2.pow2 = turn.power;
                    } else if (actionsP2.act3 === "") {
                        actionsP2.pow3 = turn.power;
                    } else {
                        actionsP2.pow4 = turn.power;
                    }
                    if (turn.chosenAct === "Counter") {
                        gaugeP2.counter -= (turn.power-gaugeP2.stored);
                        gaugeP2.stored = 0;
                        if (actionsP2.act1 === "") {
                            actionsP2.act1 = "Counter";
                        } else if (actionsP2.act2 === "") {
                            actionsP2.act2 = "Counter";
                        } else if (actionsP2.act3 === "") {
                            actionsP2.act3 = "Counter";
                        } else {
                            actionsP2.act4 = "Counter";
                        }
                    } else if (turn.chosenAct === "Charge") {
                        gaugeP2.charge -= (turn.power-gaugeP2.stored);
                        gaugeP2.stored = turn.power;
                        if (actionsP2.act1 === "") {
                            actionsP2.act1 = "Charge";
                        } else if (actionsP2.act2 === "") {
                            actionsP2.act2 = "Charge";
                        } else if (actionsP2.act3 === "") {
                            actionsP2.act3 = "Charge";
                        } else {
                            actionsP2.act4 = "Charge";
                        }
                    } else if (turn.chosenAct === "Heal") {
                        gaugeP2.heal -= (turn.power-gaugeP2.stored);
                        gaugeP2.stored = 0;
                        if (actionsP2.act1 === "") {
                            actionsP2.act1 = "Heal";
                        } else if (actionsP2.act2 === "") {
                            actionsP2.act2 = "Heal";
                        } else if (actionsP2.act3 === "") {
                            actionsP2.act3 = "Heal";
                        } else {
                            actionsP2.act4 = "Heal";
                        }
                    } else if (turn.chosenAct === "Attack") {
                        gaugeP2.attack -= (turn.power-gaugeP2.stored);
                        gaugeP2.stored = 0;
                        if (actionsP2.act1 === "") {
                            actionsP2.act1 = "Attack";
                        } else if (actionsP2.act2 === "") {
                            actionsP2.act2 = "Attack";
                        } else if (actionsP2.act3 === "") {
                            actionsP2.act3 = "Attack";
                        } else {
                            actionsP2.act4 = "Attack";
                        }
                    }
                }

                if (turn.actionCount > 0) {
                    turn.actionCount--;
                    this.textInfo.text = "Choose an action.";
                    this.textAction.text = "v Counter, ^ Charge, < Heal, > Attack";
                }

                if (turn.actionCount === 0) {
                    if (this.textPlayer.text === "Player 1")
                        this.textPhase.text = "Player 2 Phase";
                    else if (this.textPlayer.text === "Player 2")
                        this.textPhase.text = "Battling Phase";
                    this.textPlayer.text = "";
                }
            }
      	}

        if (this.textPlayer.text === "Player 1") {
            this.textActionCount.text = "Actions: "+turn.actionCount;
            this.textCounter.text = "Counter  power: "+gaugeP1.counter;
            this.textCharge.text = "Charge  power: "+gaugeP1.charge;
            this.textHeal.text = "Heal  power: "+gaugeP1.heal;
            this.textAttack.text = "Attack  power: "+gaugeP1.attack;
            if (gaugeP1.stored > 0)
                this.textStored.text = "+"+gaugeP1.stored;
            else
                this.textStored.text = "";
        } else if (this.textPlayer.text === "Player 2") {
            this.textActionCount.text = "Actions: "+turn.actionCount;
            this.textCounter.text = "Counter  power: "+gaugeP2.counter;
            this.textCharge.text = "Charge  power: "+gaugeP2.charge;
            this.textHeal.text = "Heal  power: "+gaugeP2.heal;
            this.textAttack.text = "Attack  power: "+gaugeP2.attack;
            if (gaugeP2.stored > 0)
                this.textStored.text = "+"+gaugeP2.stored;
            else
                this.textStored.text = "";
        } else {
            this.textInfo.text = "";
            this.textKeys.text = "";
            this.textAction.text = "";
            this.textActionCount.text = "";
            this.textCounter.text = "";
            this.textCharge.text = "";
            this.textHeal.text = "";
            this.textAttack.text = "";
            this.textStored.text = "";
            if (blastInPlay)
                this.textSpace.text = "";
            else
                this.textSpace.text = "Press SPACE to continue.";
            if (healthP1 === 0 || healthP2 === 0)
                this.textSpace.text = "Refresh page to restart.";
        }

        if (this.textAction.text === "v Less power, ^ More power, < Back, > Submit") {
            this.textPower.text = "Power: "+turn.power;
        } else {
            this.textPower.text = "";
        }

        game.physics.arcade.overlap(bullets, sprite, p1Hit, null, this);
        game.physics.arcade.overlap(bullets, sprite2, p2Hit, null, this);

        if (healthP1 < 0)
            healthP1 = 0;
        if (healthP2 < 0)
            healthP2 = 0;
        if (healthP1===0 && healthP2===0)
            this.textPhase.text = "Game! It's a draw!";
        else if (healthP1 === 0)
            this.textPhase.text = "Player 2 Wins!";
        else if (healthP2 === 0)
            this.textPhase.text = "Player 1 Wins!";
        this.textHP1.text = "P1 Health: "+healthP1;
        this.textHP2.text = "P2 Health: "+healthP2;
    }

    function p1Hit(p1, bullet) {
        if (blastPower.ref) {
            blastPower.ref = false;
            bullet.body.velocity.y = -bullet.body.velocity.y;
        } else {
            if (blastPower.p2 === 0)
                healthP1 -= blastPower.p1;
            else
                healthP1 -= blastPower.p2;
            bullet.kill();
            blastInPlay = false;
        }
    }
    function p2Hit(p2, bullet) {
        if (blastPower.ref) {
            blastPower.ref = false;
            bullet.body.velocity.y = -bullet.body.velocity.y;
        } else {
            if (blastPower.p1 === 0)
                healthP2 -= blastPower.p2;
            else
                healthP2 -= blastPower.p1;
            bullet.kill();
            blastInPlay = false;
        }
    }

    function fireBullet(player) {
        bullet = bullets.getFirstExists(false);
        if (bullet) {
            if (player === 1) {
                bullet.reset(sprite.x - 2, sprite.y + 40);
                bullet.body.velocity.y = 200;
                bulletTime = game.time.now + 250;
            } else {
                bullet.reset(sprite2.x - 2, sprite2.y - 40);
                bullet.body.velocity.y = -200;
            }
            blastInPlay = true;
        }
    }

    //  Called if the bullet goes out of the screen
    function resetBullet (bullet) {
        bullet.kill();
        blastInPlay = false;
    }
};
