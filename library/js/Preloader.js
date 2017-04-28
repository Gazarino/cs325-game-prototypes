"use strict";

GameStates.makePreloader = function( game ) {

	var background = null;
	var preloadBar = null;

	var ready = false;

    return {

        preload: function () {
            background = game.add.sprite(0, 0, 'background');
            preloadBar = game.add.sprite(game.width/2-50, game.height-50, 'preloaderBar');

            game.load.setPreloadSprite(preloadBar);

            game.load.image('titlePage', 'assets/title_screen.png');
						game.load.image('raindrop', 'assets/raindrop.jpg');
						game.load.image('lightning', 'assets/lightning.jpg');
						game.load.image('dot', 'assets/dot.jpg');
						game.load.image('mana', 'assets/mana.jpg');
						game.load.image('spellbook', 'assets/spellbook.png');
						game.load.image('seeMark', 'assets/seeMark.png');
						game.load.image('custom_FF5_spritesheet', 'assets/custom_FF5_spritesheet.png');

            game.load.atlas('playButton', 'assets/play_button.png', 'assets/play_button.json');

						game.load.spritesheet('circle', 'assets/circle.png', 64, 64, 16);
						game.load.spritesheet('girl1', 'assets/girl1 (Marisa Kirisame).png', 32, 32, 15);

						game.load.spritesheet('man1', 'assets/man1 (Frank).png', 32, 32, 12);

						game.load.audio('titleMusic', 'assets/Elegant Gypsy.mp3');
						game.load.audio('music', 'assets/Underworld.mp3');
						game.load.audio('otherMusic', 'assets/The Plot.mp3');
						game.load.audio('bossMusic', 'assets/Black Metallic Dragon.mp3');
						game.load.audio('thunder', 'assets/thunder.mp3');
						game.load.audio('rain', 'assets/Rain_Heavy_Loud.mp3');

						game.load.tilemap('map', 'assets/library.json', null, Phaser.Tilemap.TILED_JSON);
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
