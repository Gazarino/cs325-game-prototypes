"use strict";

window.onload = function() {
	var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game' );

	var shared = {practice:false};

	game.state.add( 'Boot', GameStates.makeBoot( game ) );
	game.state.add( 'Preloader', GameStates.makePreloader( game ) );
	game.state.add( 'MainMenu', GameStates.makeMainMenu( game, shared ) );
	game.state.add( 'Game', GameStates.makeGame( game, shared ) );

	game.state.start('Boot');
};
