"use strict";

window.onload = function() {
		var game = new Phaser.Game( 320, 320, Phaser.AUTO, 'game' );

		var shared = {char:1, friend:0};

		game.state.add( 'Boot', GameStates.makeBoot( game ) );
		game.state.add( 'Preloader', GameStates.makePreloader( game ) );
		game.state.add( 'MainMenu', GameStates.makeMainMenu( game, shared ) );
		game.state.add( 'Study', GameStates.makeStudy( game, shared ) );
		game.state.add( 'Game', GameStates.makeGame( game, shared ) );
		game.state.add( 'Boss', GameStates.makeBoss( game, shared ) );
		game.state.add( 'End', GameStates.makeEnd( game, shared ) );

		game.state.start('Boot');
};
