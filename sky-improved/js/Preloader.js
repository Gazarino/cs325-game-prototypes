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
						game.load.image('shop', 'assets/shop.jpg');
            game.load.atlas('playButton', 'assets/play_button.png', 'assets/play_button.json');
						game.load.atlas('practiceButton', 'assets/practice_button.png', 'assets/play_button.json');
						game.load.atlas('backButton', 'assets/back_button.png', 'assets/play_button.json');
						game.load.atlas('shopButton', 'assets/shop_button.png', 'assets/play_button.json');
						game.load.atlas('selectButton', 'assets/select_button.png', 'assets/play_button.json');
						game.load.atlas('competeButton', 'assets/compete_button.png', 'assets/play_button.json');
						game.load.atlas('battleButton', 'assets/battle_button.png', 'assets/play_button.json');
						game.load.atlas('fileButton', 'assets/file_button.png', 'assets/play_button.json');
						game.load.atlas('submitButton', 'assets/submit_button.png', 'assets/play_button.json');
						game.load.image('speechBubble', 'assets/speech_bubble.png');
            game.load.image('cloud', 'assets/cloud.png');
						game.load.image('cloud2', 'assets/cloud2.png');
						game.load.image('cloud3', 'assets/cloud3.png');
						game.load.image('cloud4', 'assets/cloud4.png');
						game.load.image('cloud5', 'assets/cloud5.png');
						game.load.image('cloud6', 'assets/cloud6.png');
						game.load.image('island', 'assets/island.png');

            game.load.image('note', 'assets/note.jpg');
            game.load.image('notebox', 'assets/notebox.jpg');
						game.load.image('device', 'assets/device.jpg');

						//game.load.spritesheet('title_griffin', 'assets/unused_royal_griffin.png', 220, 175, 21);

						game.load.image('bronze_gryphon_icon', 'assets/bronze_gryphon_icon.png');
						game.load.image('royal_gryphon_icon', 'assets/royal_gryphon_icon.png');
						game.load.image('ebon_gryphon_icon', 'assets/ebon_gryphon_icon.png');
						game.load.image('mystic_gryphon_icon', 'assets/mystic_gryphon_icon.png');
						game.load.image('pheonix_icon', 'assets/pheonix_icon.png');

						game.load.spritesheet('bronze_gryphon', 'assets/bronze_gryphon.png', 220, 175, 21);
						game.load.spritesheet('royal_gryphon', 'assets/royal_gryphon.png', 220, 175, 21);
						game.load.spritesheet('ebon_gryphon', 'assets/ebon_gryphon.png', 220, 175, 21);
						game.load.spritesheet('mystic_gryphon', 'assets/mystic_gryphon.png', 220, 175, 21);
						game.load.spritesheet('pheonix', 'assets/pheonix.png', 284, 175, 21);
						game.load.spritesheet('rose_body', 'assets/rose_body.png', 300, 407, 32);
						game.load.spritesheet('rose_eyes', 'assets/rose_eyes.png', 100, 60, 30);

						game.load.audio('titleMusic', 'assets/title screen.mp3');
						game.load.audio('practiceMusic', 'assets/practice.mp3');
						game.load.audio('shopMusic', 'assets/pet shop.mp3');
						game.load.audio('song1', 'assets/song1.mp3');
						game.load.audio('wow', 'assets/wow.mp3');
						game.load.audio('boo', 'assets/Homer Boo.mp3');
						game.load.audio('wrath_gryphon', 'assets/gryphon_cry.mp3');
						game.load.audio('wrath_pheonix', 'assets/pheonix_sped.mp3');
						game.load.audio('prepareMusic', 'assets/starting competition.mp3');
						game.load.audio('winMusic', 'assets/win theme.mp3');
						game.load.audio('coin', 'assets/coin.mp3');
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
