window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/v2.6.2/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    //"use strict";
    
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update });


function preload() {
    game.load.image('earth', 'assets/earth.png');
    game.load.image('asteroid', 'assets/asteroid.png');
    game.load.image('ship', 'assets/ship.png');

}

var sprite;
var earth;
var weapon;
var cursors;
var fireButton;
var shotsLeft = 15;
var score = 0;
var scoreString = '';
var scoreText;
var shotText;
var stateText;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    weapon = game.add.weapon(1, 'asteroid');

    //  The bullet will be automatically killed when it leaves the world bounds
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

    //  Because our asteroid is drawn facing up, we need to offset its rotation:
    weapon.bulletAngleOffset = 90;

    //  The speed at which the asteroid is fired
    weapon.bulletSpeed = 400;

    sprite = this.add.sprite(320, 500, 'ship');
    sprite.anchor.setTo(0.25, 0.25);

    game.physics.arcade.enable(sprite);

    //  Tell the Weapon to track the 'player' Sprite, offset by 12px horizontally, 0 vertically
    weapon.trackSprite(sprite, 12, 0);

    cursors = this.input.keyboard.createCursorKeys();

    fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    earth = this.add.sprite(375, 100, 'earth');
    earth.anchor.setTo(0.5, 0.5);

    game.physics.arcade.enable([earth, weapon]);

    earth.body.maxAngular = 500;

//  Apply a drag otherwise the sprite will just spin and never slow down
    earth.body.angularDrag = 50;

    //face1.body.velocity.setTo(200, 200);
    //earth.body.bounce.set(1);
    
    //face2.body.velocity.setTo(-200, 200);
    //weapon.body.bounce.set(1);

    earth.body.collideWorldBounds = true;
    //weapon.body.collideWorldBounds = true;

    earth.body.onCollide = new Phaser.Signal();
    earth.body.onCollide.add(hitSprite, this);

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  Shots left
    shotStr = 'Shots Left : ';
    shotText = game.add.text(game.world.width - 250, 10, shotStr+shotsLeft, { font: '34px Arial', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;
}


function update() {

    sprite.body.velocity.x = 0;

    //  Reset the acceleration
    earth.body.angularAcceleration = 0;

    if (cursors.left.isDown) {
        sprite.body.velocity.x = -150;
	earth.body.angularAcceleration -= 150;
    }
    else if (cursors.right.isDown) {
        sprite.body.velocity.x = 150;
	earth.body.angularAcceleration += 150;
    }
    else {
	earth.body.angularVelocity = 150;
    }

    if (fireButton.isDown) {
        weapon.fire();
	shotsLeft--;
	shotText.text = shotStr + shotsLeft;
    }
    game.physics.arcade.collide(earth, weapon);
}

function hitSprite (sprite1, sprite2) {

    sprite2.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    if (shotsLeft == 0) {

        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}

function render() {

    game.debug.spriteInfo(earth, 32, 32);
    game.debug.text('angularVelocity: ' + earth.body.angularVelocity, 32, 200);
    game.debug.text('angularAcceleration: ' + earth.body.angularAcceleration, 32, 232);
    game.debug.text('angularDrag: ' + earth.body.angularDrag, 32, 264);
    game.debug.text('deltaZ: ' + earth.body.deltaZ(), 32, 296);
}

};
