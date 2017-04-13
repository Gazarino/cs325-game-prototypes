"use strict";

window.onload = function() {
		var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game' );

		var shared = {mode:0, file1:true, pets1:[], pets2:[], visits1:0, visits2:0, gold1:1000, gold2:1000,
									measure1:false, measure2:false, name1:"", name2:""};

		game.state.add( 'Boot', GameStates.makeBoot( game ) );
		game.state.add( 'Preloader', GameStates.makePreloader( game ) );
		game.state.add( 'MainMenu', GameStates.makeMainMenu( game, shared ) );
		game.state.add( 'Shop', GameStates.makeShop( game, shared ) );
		game.state.add( 'Prepare', GameStates.makePrepare( game, shared ) );
		game.state.add( 'Game', GameStates.makeGame( game, shared ) );

		game.state.start('Boot');
};
