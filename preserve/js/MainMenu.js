"use strict";

GameStates.makeMainMenu = function( game, shared ) {

	var music = null;
	var playButton = null;
	var practiceButton = null;
	var bonusButton = null;
	var textKilled = null;

    function startGame(pointer) {
        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing
				shared.practice = false;
				shared.bonus = false;
				music.stop();
        game.state.start('Game');
    }

		function startPractice(pointer) {
        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
				shared.practice = true;
				shared.bonus = false;
				music.stop();
        game.state.start('Game');
    }

		function startBonus(pointer) {
        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
				shared.practice = false;
				shared.bonus = true;
				music.stop();
        game.state.start('Game');
    }

		function autoTutorial () {
				shared.practice = true;
				shared.bonus = false;
				music.stop();
				game.state.start('Game');
		}

    return {

        create: function () {

            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)

            music = game.add.audio('titleMusic');
            music.play();

            game.add.sprite(0, 0, 'titlePage');

						practiceButton = game.add.button( game.width/2, 270, 'practiceButton', startPractice, null, 'over', 'out', 'down');
            playButton = game.add.button( game.width/2, 355, 'playButton', startGame, null, 'over', 'out', 'down');
						practiceButton.anchor.x = .5;
						practiceButton.anchor.y = .5;
						playButton.anchor.x = .5;
						playButton.anchor.y = .5;
						practiceButton.height *= .84;
						practiceButton.width *= .84;
						playButton.height *= .84;
						playButton.width *= .84;

						if (shared.won) {
								bonusButton = game.add.button( game.width*.63, 270, 'bonusButton', startBonus, null, 'over', 'out', 'down');
								bonusButton.anchor.x = .5;
								bonusButton.anchor.y = .5;
								bonusButton.height *= .84;
								bonusButton.width *= .84;
								practiceButton.x = game.width*.37;
						}

						textKilled = game.add.text(game.width/2, game.height-20, "Most Enemies Killed: "+shared.highScore, {font:"18px Arial", fill:"#ffffff", align:"center" });
						textKilled.anchor.x = .5;
						textKilled.anchor.y = .5;
						game.time.events.add(Phaser.Timer.MINUTE*1.8, autoTutorial, this);
				},

        update: function () {

            //	Do some nice funky main menu effect here

        }

    };
};
