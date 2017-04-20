"use strict";

window.onload = function() {
		var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game' );

		var shared = {mode:0, file1:true, pets1:[], pets2:[], visits1:0, visits2:0, gold1:3000, gold2:3000,
									measure1:false, measure2:false, name1:"", name2:"",device1:false,device2:false};
		var customControls = {angle1:false,angle2:false,speed1:false,speed2:false,depth1:false,depth2:false,
									loop1:false,loop2:false,keep1:false,keep2:false};

		game.state.add( 'Boot', GameStates.makeBoot( game ) );
		game.state.add( 'Preloader', GameStates.makePreloader( game ) );
		game.state.add( 'MainMenu', GameStates.makeMainMenu( game, shared ) );
		game.state.add( 'Shop', GameStates.makeShop( game, shared, customControls ) );
		game.state.add( 'Prepare', GameStates.makePrepare( game, shared ) );
		game.state.add( 'Game', GameStates.makeGame( game, shared, customControls ) );

		game.state.start('Boot');
};
