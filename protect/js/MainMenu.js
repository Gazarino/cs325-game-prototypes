"use strict";

GameStates.makeMainMenu = function( game, shared ) {

		var music = null;
		var background = null;
		var playButton = null;

		function start(pointer) {
				music.stop();
        game.state.start('Game');
    }

    return {

        create: function () {
						music = game.add.audio('titleMusic');
						music.loopFull(.5);
            background = game.add.sprite(0, 0, 'titlePage');

						playButton = game.add.button( game.width/2,game.height*.6, 'button_play', start, null, 'over', 'out', 'down');
						playButton.anchor.x = .5;
						playButton.anchor.y = .5;
						playButton.height *= .7;
            playButton.width *= .7;
				},

        update: function () {

        }

    };
};
