"use strict";

GameStates.makePreloader = function( game ) {

	var background = null;
	var preloadBar = null;

	var ready = false;

    return {

        preload: function () {

            background = game.add.sprite(0, 0, 'background');
            preloadBar = game.add.sprite(300, 400, 'preloaderBar');

            game.load.setPreloadSprite(preloadBar);

            game.load.image('titlePage', 'assets/background.jpg');
            game.load.atlas('playButton', 'assets/play_button.png', 'assets/play_button.json');
						game.load.atlas('practiceButton', 'assets/practice_button.png', 'assets/play_button.json');
						game.load.atlas('backButton', 'assets/back_button.png', 'assets/play_button.json');
            game.load.image('cloud', 'assets/cloud.png');
						game.load.image('cloud2', 'assets/cloud2.png');
						game.load.image('cloud3', 'assets/cloud3.png');
						game.load.image('cloud4', 'assets/cloud4.png');
						game.load.image('cloud5', 'assets/cloud5.png');
						game.load.image('cloud6', 'assets/cloud6.png');

            game.load.image('note', 'assets/note.jpg');
            game.load.image('notebox', 'assets/notebox.jpg');

						game.load.spritesheet('griffin', 'assets/royal_griffin.png', 220, 175, 21);
						game.load.audio('titleMusic', 'assets/title screen.mp3');
						game.load.audio('practiceMusic', 'assets/practice.mp3');
						game.load.audio('song1', 'assets/song1.mp3');
						game.load.audio('wow', 'assets/wow.mp3');
						game.load.audio('boo', 'assets/Homer Boo.mp3');
						game.load.audio('wrath_gryphon', 'assets/gryphon_cry.mp3');
        },

        create: function () {
            preloadBar.cropEnabled = false;
        },

        update: function () {
						if (game.cache.isSoundDecoded('titleMusic') && ready == false) {
                ready = true;
                game.state.start('MainMenu');
            }
        }
    };
};
