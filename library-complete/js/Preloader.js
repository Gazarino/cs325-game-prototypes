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
						game.load.image('spellbook', 'assets/spellbook.png');
						game.load.image('tag', 'assets/tag.png');
						game.load.image('tagAlt', 'assets/tagAlt.png');
						game.load.image('reticle', 'assets/reticle.png');
						game.load.image('electricity', 'assets/electricity.png');
						game.load.image('demonShot', 'assets/demonShot.png');
						game.load.image('custom_FF5_spritesheet', 'assets/custom_FF5_spritesheet.png');
						game.load.image('mana', 'assets/mana.png');
						game.load.image('manaEmpty', 'assets/manaEmpty.png');
						game.load.image('manaTop', 'assets/manaTop.png');
						game.load.image('manaBottom', 'assets/manaBottom.png');
						game.load.image('bg', 'assets/cutsceneBG.jpg');
						game.load.image('facePic', 'assets/portrait.jpg');

            game.load.atlas('playButton', 'assets/play_button.png', 'assets/play_button.json');
						game.load.atlas('studyButton', 'assets/study_button.png', 'assets/play_button.json');
						game.load.atlas('exitButton', 'assets/exit_button.png', 'assets/play_button.json');
						game.load.atlas('submitButton', 'assets/submit_button.png', 'assets/play_button.json');

						game.load.spritesheet('circle', 'assets/circle.png', 64, 64, 16);
						game.load.spritesheet('shockMarks', 'assets/shockMarks.png', 32, 32, 3);
						game.load.spritesheet('seeMark', 'assets/seeMark.png', 16, 16, 4);
						game.load.spritesheet('frog', 'assets/frog.png', 32, 32, 4);
						game.load.spritesheet('girl1', 'assets/girl1 (Marisa Kirisame).png', 32, 32, 15);
						game.load.spritesheet('girl2', 'assets/girl2 (Kaguya Houraisan).png', 32, 32, 15);
						game.load.spritesheet('girl3', 'assets/girl3 (Reisen Udongein Inaba).png', 32, 32, 15);
						game.load.spritesheet('girl4', 'assets/girl4 (Ran Yakumo).png', 32, 32, 15);
						game.load.spritesheet('ulrick', 'assets/man0.png', 32, 32, 12);
						game.load.spritesheet('man0', 'assets/man0_smaller.png', 32, 32, 12);
						game.load.spritesheet('man1', 'assets/man1 (Frank).png', 32, 32, 12);
						game.load.spritesheet('man2', 'assets/man2 (Bird).png', 32, 32, 12);
						game.load.spritesheet('man3', 'assets/man3 (Hiroshi).png', 32, 32, 12);
						game.load.spritesheet('man4', 'assets/man4 (Worm).png', 32, 32, 12);
						game.load.spritesheet('demon', 'assets/demon.png', 65, 65, 38);
						game.load.spritesheet('light', 'assets/light.png', 100, 100, 19);

						game.load.audio('titleMusic', 'assets/Elegant Gypsy.mp3');
						game.load.audio('studyMusic', 'assets/The Plot.mp3');
						game.load.audio('music', 'assets/Underworld.mp3');
						game.load.audio('endMusic', 'assets/Slicing the Wind.mp3');
						game.load.audio('bossMusic', 'assets/Black Metallic Dragon.mp3');
						game.load.audio('thunder', 'assets/thunder.mp3');
						game.load.audio('rain', 'assets/Rain_Heavy_Loud.mp3');

						game.load.tilemap('map', 'assets/library2.json', null, Phaser.Tilemap.TILED_JSON);
						game.load.tilemap('studyMap', 'assets/library.json', null, Phaser.Tilemap.TILED_JSON);
						game.load.tilemap('bossMap', 'assets/library3.json', null, Phaser.Tilemap.TILED_JSON);
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
