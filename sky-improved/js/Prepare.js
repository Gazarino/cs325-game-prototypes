"use strict";

GameStates.makePrepare = function( game, shared ) {
    var music;
    var background;

    var player1Pets = null;
    var player2Pets = null;
    var submit1 = null;
    var submit2 = null;

    function quitGame() {
        if (music) music.stop(); music = null;
        if (background) background.kill(); background = null;

        game.state.start('MainMenu');
    }

    function startGame() {
        if (music) music.stop(); music = null;
        if (background) background.kill(); background = null;

        game.state.start('Game');
    }

    var mainGame = {
        create: function () {
            player1Pets = [];
            player2Pets = [];
            background = game.add.sprite(0, 0, 'background');
            background.tint = 0x6DB4FF;
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);

            music = game.add.audio('prepareMusic');
            music.loopFull(1);

            this.createPetIcons();

            //speechBubble = game.add.sprite(game.width-297, game.height-520, 'speechBubble');
            //textRose = game.add.text(speechBubble.x+10, speechBubble.y+10, "",
            //        {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });

            this.stage.disableVisibilityChange = true;
            game.input.onDown.add(this.selectPet, this);
        },
        createPetIcons: function () {//display info for player currently playing in middle if mode!==2
            var xPlacement = game.width/2-100;
            var xx=1; if (shared.mode===2) xx=2;
            if (shared.mode===2 && !shared.file1) xx=.5;

            if (shared.file1 || shared.mode===2) {
                game.add.text(xPlacement/xx, 100, shared.name1,
                      {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                for (var i=0; i<shared.pets1.length; i++) {
                    var petText = game.add.text(xPlacement/xx, 200+50*i, shared.pets1[i].name,
                          {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                    if (i===0) petText.fill = "#ffff00";
                    player1Pets.push(petText);
                    game.add.sprite(petText.x-50, petText.y, shared.pets1[i].type+"_icon");
                }
                submit1 = game.add.button(xPlacement/xx, 300+50*shared.pets1.length, 'submitButton', this.evalSubmit1, null, 'over', 'out', 'down');
								submit1.scale.set(.55);
                submit1.data = true;
            }
            if (!shared.file1 || shared.mode===2) {
                game.add.text(xPlacement*xx, 100, shared.name2,
                      {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                for (var i=0; i<shared.pets2.length; i++) {
                    var petText = game.add.text(xPlacement*xx, 200+50*i, shared.pets2[i].name,
                          {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
                    if (i===0) petText.fill = "#ffff00";
                    player2Pets.push(petText);
                    game.add.sprite(petText.x-50, petText.y, shared.pets2[i].type+"_icon");
                }
                submit2 = game.add.button(xPlacement*xx, 300+50*shared.pets2.length, 'submitButton', this.evalSubmit2, null, 'over', 'out', 'down');
								submit2.scale.set(.55);
                submit2.data = true;
            }
        },
        evalSubmit1: function () {
            for (var i=0; i<player1Pets.length; i++)
                if (player1Pets[i].fill === "#ffff00") {
                    var temp = shared.pets1[0];
                    shared.pets1[0] = shared.pets1[i];
                    shared.pets1[i] = temp;
                } else player1Pets[i].fill = "#808080";
            submit1.data = false;
            if (shared.mode<2 || submit2 && !submit2.data) startGame();
        },
        evalSubmit2: function () {
            for (var i=0; i<player2Pets.length; i++)
                if (player2Pets[i].fill === "#ffff00") {
                    var temp = shared.pets2[0];
                    shared.pets2[0] = shared.pets2[i];
                    shared.pets2[i] = temp;
                } else player2Pets[i].fill = "#808080";
            submit2.data = false;
            if (shared.mode<2 || submit1 && !submit1.data) startGame();
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
