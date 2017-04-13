"use strict";

var GameStates = {};

GameStates.makeBoot = function( game ) {
    return {
        init: function () {
            game.input.maxPointers = 1;
            game.stage.disableVisibilityChange = true;

            if (!game.device.desktop) {
                //  In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
                game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                game.scale.setMinMax(480, 260, 1024, 768);
                game.scale.forceLandscape = true;
            }
            this.game.renderer.renderSession.roundPixels = true;
            game.physics.startSystem(Phaser.Physics.ARCADE);
        },

        preload: function () {
            game.load.image('background', 'assets/background.jpg');
            game.load.image('preloaderBar', 'assets/preloader_bar.png');
        },

        create: function () {
            game.state.start('Preloader');
        }
    };
};
