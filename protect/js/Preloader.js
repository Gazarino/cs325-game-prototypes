"use strict";

GameStates.makePreloader = function( game ) {

	var background = null;
	var preloadBar = null;

	var ready = false;

    return {

        preload: function () {
            background = game.add.sprite(0, 0, 'preloaderBackground');
            preloadBar = game.add.sprite(game.width/2, game.height*.67, 'preloaderBar');
						preloadBar.anchor.x = .5;
						preloadBar.anchor.y = .5;
            game.load.setPreloadSprite(preloadBar);

            game.load.image('titlePage', 'assets/title.jpg');
            game.load.atlas('button_play', 'assets/button_play.png', 'assets/play_button.json');
						game.load.atlas('backButton', 'assets/button_back.png', 'assets/play_button.json');
						game.load.image('background', 'assets/background.jpg');
						game.load.image('background_clearing', 'assets/background_clearing.jpg');
            game.load.image('laser_gun', 'assets/laser_gun.png');
						game.load.image('laser_shot', 'assets/laser_shot.png');
						game.load.image('rocket_launcher', 'assets/rocket_launcher.png');
						game.load.image('rocket_shot', 'assets/rocket_shot.png');
						game.load.image('sword', 'assets/sword.png');
						game.load.image('sword_beam', 'assets/sword_beam.png');
						game.load.image('spiny_shield', 'assets/spiny_shield.png');
						game.load.image('slot', 'assets/slot.png');

            game.load.audio('music', 'assets/Ancient_Breath.mp3');
						game.load.audio('titleMusic', 'assets/Arena Selection.mp3');
						game.load.audio('success', 'assets/Quest Clear.mp3');
						game.load.audio('failure', 'assets/Quest Failed.mp3');
						game.load.spritesheet('dog', 'assets/dog.png', 20, 20, 18);
						game.load.spritesheet('alien', 'assets/alien.png', 80, 90, 12);
						game.load.spritesheet('blood', 'assets/blood.png', 44, 42, 6);
						game.load.audio('alien_growl', 'assets/alien_growl.mp3');
						game.load.audio('alien_cry', 'assets/alien_cry.mp3');
						game.load.audio('squish', 'assets/squish.mp3');
						game.load.audio('slash', 'assets/slash.mp3');
						game.load.spritesheet('shatter', 'assets/shatter.png', 100, 100, 5);
						game.load.audio('shatterSFX', 'assets/shatter.mp3');
        },

        create: function () {
            preloadBar.cropEnabled = false;
        },

        update: function () {

						if (game.cache.isSoundDecoded('titleMusic') && ready == false)
            {
                ready = true;
                game.state.start('MainMenu');
            }
        }
    };
};
