"use strict";

GameStates.makePrepare = function( game, shared ) {
    var music;
    var background;

    var player1Pets = null;
    var player2Pets = null;
    var submit1 = null;
    var submit2 = null;
    var entryFee;
    var backButton;
    var error;
    var coin;

    function quitGame() {
        if (music) music.stop(); music = null;
        if (background) background.kill(); background = null;

        game.state.start('MainMenu');
    }

    function startGame() {
        if (entryFee>0) coin.play();
        if (music) music.stop(); music = null;
        if (background) background.kill(); background = null;
        if (submit1 && !submit1.data) shared.gold1 -= entryFee;
        if (submit2 && !submit2.data) shared.gold2 -= entryFee;
        game.state.start('Game');
    }

    var mainGame = {
        create: function () {
            player1Pets = [];
            player2Pets = [];
            background = game.add.sprite(0, 0, 'background');
            background.tint = 0x6DB4FF;
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);
            backButton = game.add.button(10, game.height-40, 'backButton', quitGame, null, 'over', 'out', 'down');
            backButton.height *= .45;
            backButton.width *= .45;

            music = game.add.audio('prepareMusic');
            music.loopFull(1);
            coin = game.add.audio('coin');

            this.createPetIcons();

            if (shared.mode===0) entryFee = 0;
            else if (shared.mode===1) entryFee = 100;
            else if (shared.mode===2) entryFee = 200;
            game.add.text(game.width/2-100, 15, "Entry Fee: "+entryFee, {font:"22px Yu Gothic UI Semibold", fill:"#ffffff", align:"left" });
            error = game.add.text(game.width/2, game.height-100, "You do not have enough gold.",
                        {font:"20px Yu Gothic UI Semibold", fill:"#ffffff", align:"center" });
            error.anchor.set(.5); error.alpha = 0;
            this.stage.disableVisibilityChange = true;
            game.input.onDown.add(this.selectPet, this);
        },
        createPetIcons: function () {//display info for player currently playing in middle if mode!==2
            var xPlacement = game.width/2-150;
            var xx=1; if (shared.mode===2) xx=2;
            if (shared.mode===2 && !shared.file1) xx=.5;

            if (shared.file1 || shared.mode===2) {
                game.add.text(xPlacement/xx, 100, shared.name1+" ("+shared.gold1+" gold)",
                      {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                for (var i=0; i<shared.pets1.length; i++) {
                    var petText = game.add.text(xPlacement/xx, 200+50*i, shared.pets1[i].name,
                          {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                    game.add.text(xPlacement/xx, 200+50*i, "\nMax Speed: "+shared.pets1[i].maxSpeed+"   Stamina: "+shared.pets1[i].stamina,
                          {font:"15px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                    if (i===0) petText.fill = "#ffff00";
                    player1Pets.push(petText);
                    game.add.sprite(petText.x-50, petText.y, shared.pets1[i].type+"_icon");
                }
                submit1 = game.add.button(xPlacement/xx, 300+50*shared.pets1.length, 'submitButton', this.evalSubmit1, null, 'over', 'out', 'down');
								submit1.scale.set(.55);
                submit1.data = true;
            }
            if (!shared.file1 || shared.mode===2) {
                game.add.text(xPlacement*xx, 100, shared.name2+" ("+shared.gold2+" gold)",
                      {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                for (var i=0; i<shared.pets2.length; i++) {
                    var petText = game.add.text(xPlacement*xx, 200+50*i, shared.pets2[i].name,
                          {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                    game.add.text(xPlacement*xx, 200+50*i, "\nMax Speed: "+shared.pets2[i].maxSpeed+"   Stamina: "+shared.pets2[i].stamina,
                          {font:"15px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                    if (i===0) petText.fill = "#ffff00";
                    player2Pets.push(petText);
                    game.add.sprite(petText.x-50, petText.y, shared.pets2[i].type+"_icon");
                }
                submit2 = game.add.button(xPlacement*xx, 300+50*shared.pets2.length, 'submitButton', this.evalSubmit2, null, 'over', 'out', 'down');
								submit2.scale.set(.55);
                submit2.data = true;
            }
        },
        fadeObj: function (obj) { game.add.tween(obj).to({alpha:0}, 500, "Linear", true); },
        evalSubmit1: function () {
            if (shared.gold1 < entryFee) {
                error.alpha = 1;
                game.time.events.add(2000, mainGame.fadeObj, this, error);
            } else {
                for (var i=0; i<player1Pets.length; i++)
                    if (player1Pets[i].fill === "#ffff00") {
                        var temp = shared.pets1[0];
                        shared.pets1[0] = shared.pets1[i];
                        shared.pets1[i] = temp;
                    } else player1Pets[i].fill = "#808080";
                submit1.data = false;
                if (shared.mode<2 || submit2 && !submit2.data) startGame();
            }
        },
        evalSubmit2: function () {
            if (shared.gold2 < entryFee) {
                error.alpha = 1;
                game.time.events.add(2000, mainGame.fadeObj, this, error);
            } else {
                for (var i=0; i<player2Pets.length; i++)
                    if (player2Pets[i].fill === "#ffff00") {
                        var temp = shared.pets2[0];
                        shared.pets2[0] = shared.pets2[i];
                        shared.pets2[i] = temp;
                    } else player2Pets[i].fill = "#808080";
                submit2.data = false;
                if (shared.mode<2 || submit1 && !submit1.data) startGame();
            }
        },

        selectPet: function () {
            var selected = null;
            var smallestDist = 100;
            var smallestDistIsOnPlayerOneSide = true;
            if (submit1 && submit1.data)
                for (var i=0; i<player1Pets.length; i++) {
                    var distX = game.input.mousePointer.x - player1Pets[i].centerX;
                    var distY = game.input.mousePointer.y - player1Pets[i].centerY;
                    var dist = Math.sqrt(distX*distX + distY*distY);
                    if (dist < 100 && dist < smallestDist) {
                        selected = player1Pets[i];
                        smallestDist = dist;
                    }
                }
            if (submit2 && submit2.data)
                for (var i=0; i<player2Pets.length; i++) {
                    var distX = game.input.mousePointer.x - player2Pets[i].centerX;
                    var distY = game.input.mousePointer.y - player2Pets[i].centerY;
                    var dist = Math.sqrt(distX*distX + distY*distY);
                    if (dist < 100 && dist < smallestDist) {
                        selected = player2Pets[i];
                        smallestDist = dist;
                        smallestDistIsOnPlayerOneSide = false;
                    }
                }
            if (selected && smallestDistIsOnPlayerOneSide) { this.clearTints(1);  selected.fill = "#ffff00"; }
            if (selected && !smallestDistIsOnPlayerOneSide) { this.clearTints(2);  selected.fill = "#ffff00"; }
        },
        clearTints: function (num) {
            if (num===1)
                for (var i=0; i<player1Pets.length; i++)
                    player1Pets[i].fill = "#000000";
            else
                for (var i=0; i<player2Pets.length; i++)
                    player2Pets[i].fill = "#000000";
        },
        update: function () {

        },

    }; return mainGame;
};
