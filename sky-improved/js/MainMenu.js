"use strict";

GameStates.makeMainMenu = function( game, shared ) {

	var music = null;
	var playButton = null;
	var practiceButton = null;
	var shopButton = null;
	var competeButton = null;
	var fileButton = null;
	var textBest = null;
	var clouds = null;
	var inSky = null;
	var background;
	var island;
	var titleText;
	var textPlayer = null;

		function startCompetition(pointer) {
				shared.mode = 2;
				music.stop();
				game.state.start('Prepare');
		}

    function startGame(pointer) {
				shared.mode = 1;
				music.stop();
        game.state.start('Prepare');
    }

		function startPractice(pointer) {
				shared.mode = 0;
				music.stop();
        game.state.start('Prepare');
    }

		function startShop(pointer) {
				music.stop();
        game.state.start('Shop');
    }

    return {

        create: function () {
            music = game.add.audio('titleMusic');
            music.loopFull(.9);
            background = game.add.sprite(0, 0, 'background');
						background.tint = 0x6DB4FF;
						island = game.add.sprite(game.width/2, game.height/2, 'island');
						island.anchor.set(.5);
						island.scale.set(.6);
						titleText = game.add.text(game.width/2, game.height/5, "Matches of the Sky", {font:"55px Gabriola", fill:"#ffffff", align:"center" });
						titleText.anchor.set(.5);
						titleText.fontStyle = "bold";

						fileButton = game.add.button(15, 15, 'fileButton', this.changeFile, null, 'over', 'out', 'down');
						fileButton.scale.set(.48);
						textPlayer = game.add.text(18, fileButton.height+18, "", {font:"18px Segoe UI Black", fill:"#000000", align:"left" });

						shopButton = game.add.button( game.width/2-5, 320, 'shopButton', startShop, null, 'over', 'out', 'down');
						shopButton.anchor.set(.5);
						shopButton.scale.set(.75);
						practiceButton = game.add.button(120, 300, 'practiceButton', startPractice, null, 'over', 'out', 'down');
						practiceButton.anchor.set(.5);
						practiceButton.scale.set(.75);
						playButton = game.add.button(game.width-150, 300, 'playButton', startGame, null, 'over', 'out', 'down');
						playButton.anchor.set(.5);
						playButton.scale.set(.75);
						competeButton = game.add.button(game.width/2-5, 475, 'competeButton', startCompetition, null, 'over', 'out', 'down');
						competeButton.anchor.set(.5);
						competeButton.scale.set(.75);
						this.changeFile();
						this.changeFile();

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
								r = game.rnd.integerInRange(3, 7);
								cloud.alpha = 1-r/10;
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
				changeFile: function () {
						if (shared.file1) {
								shared.file1 = false;
								textPlayer.text = shared.name2;
								if (textPlayer.text==="")
										textPlayer.text = "Player 2";
								if (shared.pets2.length === 0 && practiceButton.alive) {
										practiceButton.kill();  playButton.kill();
								} else if (shared.pets2.length > 0 && !practiceButton.alive) {
										practiceButton.revive();  playButton.revive();
								}
						} else {
								shared.file1 = true;
								textPlayer.text = shared.name1;
								if (textPlayer.text==="")
										textPlayer.text = "Player 1";
								if (shared.pets1.length === 0 && practiceButton.alive) {
										practiceButton.kill();  playButton.kill();
								} else if (shared.pets1.length > 0 && !practiceButton.alive) {
										practiceButton.revive();  playButton.revive();
								}
						}
						if ((shared.pets1.length === 0 || shared.pets2.length === 0) && competeButton.alive) {
								competeButton.kill();
						}
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
                    r = game.rnd.integerInRange(3, 7);
                    cloud.alpha = 1-r/10;
                    r = game.rnd.integerInRange(0, clouds.length-1);
                    if (r!==i && !clouds[r].inCamera)
                        inSky.swap(cloud, clouds[r]);
                }
            }
        },

    };
};
