"use strict";

GameStates.makeMainMenu = function( game, shared ) {

		var music = null;
		var background = null;
		var p1Button = null;
		var p2Button = null;
		var playButton = null;
		var blueButton = null;
		var redButton = null;
		var selectText = null;

		function startBlue(pointer) {
				shared.red = false;
				music.stop();
        game.state.start('Game');
    }

		function startRed(pointer) {
				shared.red = true;
				music.stop();
        game.state.start('Game');
    }

		function start2P(pointer) {
				shared.solo = false;
				music.stop();
        game.state.start('Game');
    }

    return {

        create: function () {
						music = game.add.audio('titleMusic');
						music.loopFull(.5);
            background = game.add.sprite(0, 0, 'titlePage');
						/*
						p1Button = game.add.button( game.width/2, 270, 'button_1P', this.start1P, null, null, null, null);
            p2Button = game.add.button( game.width/2, 355, 'button_2P', start2P, null, null, null, null);
						p1Button.anchor.x = .5;
						p1Button.anchor.y = .5;
						p2Button.anchor.x = .5;
						p2Button.anchor.y = .5;//*/

						playButton = game.add.button( game.width/2-7,300, 'button_play', start2P, null, null, null, null);
						playButton.anchor.x = .5;
						playButton.anchor.y = .5;
				},

				start1P: function () {
						shared.solo = true;
						background.kill();
						background = game.add.sprite(0, 0, 'background');
						p1Button.kill();
						p2Button.kill();
						blueButton = game.add.button( game.width*.375-10, 250, 'player1', startBlue, null, null, null, null);
            redButton = game.add.button( game.width*.625-10, 250, 'player1RED', startRed, null, null, null, null);
						blueButton.anchor.x = .5;
						blueButton.anchor.y = .5;
						blueButton.height *= 3;
						blueButton.width *= 3;
						redButton.anchor.x = .5;
						redButton.anchor.y = .5;
						redButton.height *= 3;
						redButton.width *= 3;

						selectText = game.add.text(game.width/2-10, 100, "Character Select", { font: "35px Arial Black", fill: "#ffffff", align: "center" });
            selectText.anchor.x = .5;
            selectText.anchor.y = .5;
				},

        update: function () {

        }

    };
};
