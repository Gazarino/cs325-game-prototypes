"use strict";

GameStates.makeMainMenu = function( game, shared ) {

		var music = null;
		var playButton = null, submitButton = null, studyButton = null, goingToGame = null;
		var titleText = null, infoText = null;
		var raindrops = null, rain = null;
		var lightning = null, lightningTime = null, thunder = null;
		var girl1=null, girl2=null, girl3=null, girl4=null, selected = null;

		function startGame(pointer) {
				music.stop();
				rain.stop();
				shared.char = selected;
				if (goingToGame)
        		game.state.start('Game');
				else
						game.state.start('Study');
    }

    var mainGame = {

        create: function () {
            music = game.add.audio('titleMusic');
            music.loopFull(1);
						rain = game.add.audio('rain');
            rain.loopFull(1);
						thunder = game.add.audio('thunder');
						thunder.addMarker("thunder1", 0.2, 10.6);
						thunder.addMarker("thunder2", 14.4, 6.5);
						thunder.addMarker("thunder3", 21.7, 9.2);
						thunder.addMarker("thunder4", 31.1, 9.7);
						thunder.volume = .55;

						goingToGame = true;
            game.add.sprite(0, 0, 'titlePage');
						titleText = game.add.text(game.width/2, game.height/6, "Spellcaster's Quest", {font:"40px Gabriola", fill:"#ffffff", align:"center" });
						titleText.anchor.set(.5);
						titleText.fontStyle = "bold";
						studyButton = game.add.button(game.width/2, game.height*.65, 'studyButton', studyReady, null, 'over', 'out', 'down');
						studyButton.anchor.set(.5);
						studyButton.scale.set(.45);
						function studyReady () {goingToGame=false;	mainGame.createPlayOptions();}
						playButton = game.add.button(game.width/2, game.height*.8, 'playButton', this.createPlayOptions, null, 'over', 'out', 'down');
						playButton.anchor.set(.5);
						playButton.scale.set(.45);
						submitButton = game.add.button(game.width/2, game.height*.83, 'submitButton', startGame, null, 'over', 'out', 'down');
						submitButton.anchor.set(.5);
						submitButton.scale.set(.45);
						submitButton.alpha = 0;		submitButton.inputEnabled = false;

						girl1 = prepGirl(1,.26);
						girl2 = prepGirl(2,.42);
						girl3 = prepGirl(3,.58);
						girl4 = prepGirl(4,.74);
						function prepGirl (n, x) {
								var g = game.add.sprite(game.width*x, game.height/2+10, 'girl'+n);
								g.anchor.set(.5);													g.width = -g.width;
								g.animations.add('walk', [9,10,11,10]);		g.animations.add('still', [10]);
								g.play('still');		g.alpha=0;		return g;
						}
						raindrops = game.add.physicsGroup();
            raindrops.enableBody = true;
            raindrops.physicsBodyType = Phaser.Physics.ARCADE;
						var raindropNum = 200;
						raindrops.createMultiple(raindropNum, 'raindrop');
						for (var i=0; i<raindropNum; i++)
								this.spawnRaindrop();

						lightning = game.add.sprite(0, 0, 'lightning');
						lightning.alpha = 0;
						lightningTime = this.time.time+game.rnd.integerInRange(12000, 25000);
						game.input.onDown.add(this.selectChar, this);
				},
				createPlayOptions: function () {
						titleText.text = "Character Select";		titleText.y+=20;
						titleText.style.font = "25px Sitka Small";
						infoText = game.add.text(game.width/2, game.height*.68, "", {font:"10px Sitka Small", fill:"#ffffff", align:"center" });
						infoText.anchor.set(.5);
						girl1.alpha=1;		girl2.alpha=2;		girl3.alpha=3;		girl4.alpha=4;
						selected = shared.char;
						submitButton.alpha = 1;		submitButton.inputEnabled = true;
						playButton.destroy();			studyButton.destroy();
				},
				selectChar: function () {
            if (girl1.alpha===0 || game.input.mousePointer.y > 200) return;
            var dist1 = getDist(girl1);
						var dist2 = getDist(girl2);
						var dist3 = getDist(girl3);
						var dist4 = getDist(girl4);
						function getDist (g) {
								var distX = game.input.mousePointer.x - g.centerX;
								var distY = game.input.mousePointer.y - g.centerY;
								return Math.sqrt(distX*distX + distY*distY);
						}
            if (dist1<=dist2 && dist1<=dist3 && dist1<=dist4) selected = 1;
            else if (dist2<=dist1 && dist2<=dist3 && dist2<=dist4) selected = 2;
            else if (dist3<=dist1 && dist3<= dist2 && dist3<=dist4) selected = 3;
            else selected = 4;
        },
        update: function () {
						raindrops.forEachExists(this.resetRaindrop, this);
						if (this.time.time > lightningTime)
								this.lightningStart();
						if (girl1) {girl1.tint=0x808080;		girl2.tint=0x808080;		girl3.tint=0x808080;		girl4.tint=0x808080;}
						if (selected===1) { selectedAction(girl1);
								infoText.text = "Special: Turn every enemy that sees you into a frog.";
						} else if (selected===2) { selectedAction(girl2);
								infoText.text = "Special: Take control of the nearest enemy in sight.";
						}	else if (selected===3) { selectedAction(girl3);
								infoText.text = "Special: Double movement speed.";
						} else if (selected===4) { selectedAction(girl4);
								infoText.text = "Special: Create a controllable doppelganger.";
						}
						function selectedAction (g) {
								if (!g.animations.currentAnim.isPlaying)
										g.play('walk', 6);
								g.tint=0xffffff;
						}
        },
				spawnRaindrop: function () {
            var raindrop = raindrops.getFirstExists(false);
            if (raindrop) {
                raindrop.reset(game.rnd.integerInRange(5, game.width+100), game.rnd.integerInRange(0, game.height));
                game.physics.arcade.velocityFromRotation(Math.PI*.6, 330, raindrop.body.velocity);
            }
        },
				resetRaindrop: function (raindrop) {
            if (raindrop.y > game.height+10 || raindrop.x < -5) {
								raindrop.x = game.rnd.integerInRange(5, game.width+100);
								raindrop.y = -10;
						}
        },
				lightningStart: function () {
						lightningTime = this.time.time+game.rnd.integerInRange(12000, 25000);
						var r = game.rnd.integerInRange(1, 4);
						var opacity;
						switch (r) {
								case 1: opacity = .75; break;
								case 2: opacity = .86; break;
								case 3: opacity = .97; break;
								case 4: opacity = .64;
						}
						game.add.tween(lightning).to({alpha:opacity}, 25, "Linear", true);
						game.time.events.add(125, this.lightningEnd, this);
						game.time.events.add(500, this.playThunder, this, r);
				},
				lightningEnd: function () { game.add.tween(lightning).to({alpha:0}, 25, "Linear", true);	},
				playThunder: function (num) {	thunder.play("thunder"+num); },
    }; return mainGame;
};
