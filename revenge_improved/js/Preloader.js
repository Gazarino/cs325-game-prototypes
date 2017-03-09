"use strict";

GameStates.makePreloader = function( game ) {

	var background = null;
	var preloadBar = null;

	var ready = false;

    return {

        preload: function () {

            //	These are the assets we loaded in Boot.js
            //	A nice sparkly background and a loading progress bar
            background = game.add.sprite(0, 0, 'preloaderBackground');
            preloadBar = game.add.sprite(game.width/2.85, game.height/2, 'preloaderBar');

            //	This sets the preloadBar sprite as a loader sprite.
            //	What that does is automatically crop the sprite from 0 to full-width
            //	as the files below are loaded in.
            game.load.setPreloadSprite(preloadBar);

            //	Here we load the rest of the assets our game needs.
            //	As this is just a Project Template I've not provided these assets, swap them for your own.
            game.load.image('titlePage', 'assets/title.jpg');
            //game.load.atlas('playButton', 'assets/play_button.png', 'assets/play_button.json');
						game.load.image('button_1P', 'assets/button_1P.png');
						game.load.image('button_2P', 'assets/button_2P.png');
						game.load.image('button_play', 'assets/button_play.png');
						game.load.image('button_up', 'assets/button_up.png');
						game.load.image('button_down', 'assets/button_down.png');
						game.load.image('button_special', 'assets/button_special.png');
						game.load.image('button_submit_blue', 'assets/button_submit_blue.png');
						game.load.image('button_submit_red', 'assets/button_submit_red.png');

						game.load.image('player1', 'assets/player1.png');
						game.load.image('player2', 'assets/player2.png');
						game.load.image('player1RED', 'assets/player1RED.png');
            game.load.image('background', 'assets/background.jpg');
            game.load.image('health', 'assets/health.jpg');
						game.load.image('healthbar', 'assets/healthbar.jpg');

            game.load.image('power_bank', 'assets/power_bank.jpg');
            game.load.image('action_list', 'assets/action_list.jpg');

						game.load.image('action_attack', 'assets/action_attack.jpg');
						game.load.image('action_charge', 'assets/action_charge.jpg');
						game.load.image('action_counter', 'assets/action_counter.jpg');
						game.load.image('action_heal', 'assets/action_heal.jpg');
						game.load.image('action_special', 'assets/action_special.jpg');

						game.load.image('blast', 'assets/blast.png');

						//game.load.audio('explodeSFX', 'assets/explosion.wav');
						//game.load.spritesheet('explosion', 'assets/explode.png', 100, 100, 34);
						//game.load.spritesheet('barrier', 'assets/barrier.png', 50, 50, 10);
            game.load.audio('music', 'assets/Savage_Steel_Fun_Club.mp3');
						game.load.audio('titleMusic', 'assets/La_la_triroriro.mp3');
						game.load.audio('boss', 'assets/Improvisation_at_lovers_cavern.mp3');
						game.load.audio('victory', 'assets/Neoishiki.mp3');
						game.load.spritesheet('earthGod', 'assets/Earth God.png', 64, 64, 12);
						game.load.spritesheet('waterGod', 'assets/Water God.png', 64, 64, 12);
        },

        create: function () {

            //	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
            preloadBar.cropEnabled = false;

        },

        update: function () {

            //	You don't actually need to do this, but I find it gives a much smoother game experience.
            //	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
            //	You can jump right into the menu if you want and still play the music, but you'll have a few
            //	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
            //	it's best to wait for it to decode here first, then carry on.

            //	If you don't have any music in your game then put the game.state.start line into the create function and delete
            //	the update function completely.

						if (game.cache.isSoundDecoded('titleMusic') && ready == false)
            {
                ready = true;
                game.state.start('MainMenu');
            }
        }
    };
};
