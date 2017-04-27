"use strict";

GameStates.makeMainMenu = function( game, shared ) {

		var music = null;
		var playButton = null;
		var titleText = null;
		var raindrops = null, rain = null;
		var lightning = null, lightningTime = null, thunder = null;

    function startGame(pointer) {
				music.stop();
				rain.stop();
        game.state.start('Game');
    }

    return {

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

            game.add.sprite(0, 0, 'titlePage');
						titleText = game.add.text(game.width/2, game.height/6, "Spellcaster's Quest", {font:"40px Gabriola", fill:"#ffffff", align:"center" });
						titleText.anchor.set(.5);
						titleText.fontStyle = "bold";

						playButton = game.add.button(game.width/2, game.height*.75, 'playButton', startGame, null, 'over', 'out', 'down');
						playButton.anchor.set(.5);
						playButton.scale.set(.45);

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
				},
				spawnRaindrop: function () {
            var raindrop = raindrops.getFirstExists(false);
            if (raindrop) {
                raindrop.reset(game.rnd.integerInRange(5, game.width+100), game.rnd.integerInRange(0, game.height));
                game.physics.arcade.velocityFromRotation(Math.PI*.6, 330, raindrop.body.velocity);
            }
        },

        update: function () {
						raindrops.forEachExists(this.resetRaindrop, this);
						if (this.time.time > lightningTime)
								this.lightningStart();
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
    };
};
