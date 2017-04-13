"use strict";

GameStates.makeMainMenu = function( game, shared ) {

	var music = null;
	var playButton = null;
	var practiceButton = null;
	var textBest = null;
	var clouds = null;
	var inSky = null;
	var background;
	var titleText;

    function startGame(pointer) {
				shared.practice = false;
				music.stop();
        game.state.start('Game');
    }

		function startPractice(pointer) {
				shared.practice = true;
				music.stop();
        game.state.start('Game');
    }

    return {

        create: function () {
            music = game.add.audio('titleMusic');
            music.loopFull(.9);

            background = game.add.sprite(0, 0, 'background');
						background.tint = 0x6DB4FF;
						titleText = game.add.text(game.width/2, game.height/4, "Matches of the Sky", {font:"50px Segoe UI Black", fill:"#ffffff", align:"center" });
						titleText.anchor.set(.5);

						practiceButton = game.add.button( game.width/2, 300, 'practiceButton', startPractice, null, 'over', 'out', 'down');
            playButton = game.add.button( game.width/2, 375, 'playButton', startGame, null, 'over', 'out', 'down');
						practiceButton.anchor.x = .5;
						practiceButton.anchor.y = .5;
						playButton.anchor.x = .5;
						playButton.anchor.y = .5;
						practiceButton.height *= .84;
						practiceButton.width *= .84;
						playButton.height *= .84;
						playButton.width *= .84;

						clouds = [];
						inSky = game.add.group();
            createCloud('cloud3');
            createCloud('cloud4');
            createCloud('cloud6');
            function createCloud (c) {
                var cloud = game.add.sprite(game.rnd.integerInRange(-game.width/2,game.width*1.5),
                                            game.rnd.integerInRange(-game.height/2,game.height*1.5), c);
                game.physics.arcade.enable(cloud);
                cloud.body.velocity.x = game.rnd.integerInRange(3,9);
                var r = game.rnd.integerInRange(0, 1);
                cloud.scale.x = game.rnd.integerInRange(75,125)/100;
                cloud.scale.y = game.rnd.integerInRange(75,125)/100;
                if (r > 0) cloud.scale.x *= -1;
                clouds.push(cloud);
                inSky.add(cloud);
            }
						createCloud('cloud');
            createCloud('cloud2');
            createCloud('cloud5');
						//textBest = game.add.text(game.width/2, game.height-20, "Highest Scoring Creature: ", {font:"18px Arial", fill:"#ffffff", align:"center" });
						//textBest.anchor.x = .5;
						//textBest.anchor.y = .5;
				},

        update: function () {


						this.transformClouds();
        },

				transformClouds: function () {
            for (var i = 0; i < clouds.length; i++) {
                var cloud = clouds[i];
                if (cloud.centerX+Math.abs(cloud.width) < 0 || cloud.centerX-Math.abs(cloud.width) > game.width ||
                    cloud.centerY+Math.abs(cloud.height) < 0 || cloud.centerY-Math.abs(cloud.height) > game.height) {
                    cloud.body.velocity.x = game.rnd.integerInRange(3,9);
                    cloud.scale.x = game.rnd.integerInRange(75,125)/100;
                    cloud.scale.y = game.rnd.integerInRange(75,125)/100;
                    var r = game.rnd.integerInRange(0, 1);
                    if (r > 0) cloud.scale.x *= -1;
                    r = game.rnd.integerInRange(0, 3);
                    switch (r) {
                        case 0: cloud.centerX = game.rnd.integerInRange(0, game.width);
                                cloud.centerY = -Math.abs(cloud.height);   break;
                        case 1: cloud.centerX = -Math.abs(cloud.width);
                                cloud.centerY = game.rnd.integerInRange(0, game.height);  break;
                        case 2: cloud.centerX = game.rnd.integerInRange(0, game.width);
                                cloud.centerY = game.height+Math.abs(cloud.height);  break;
                        default: cloud.centerX = game.width+Math.abs(cloud.width);
                                cloud.centerY = game.rnd.integerInRange(0, game.height);
                    }
                    r = game.rnd.integerInRange(0, 5);
                    cloud.alpha = 1-r/10;
                    r = game.rnd.integerInRange(0, clouds.length-1);
                    if (r!==i && !clouds[r].inCamera)
                        inSky.swap(cloud, clouds[r]);
                }
            }
        },

    };
};
