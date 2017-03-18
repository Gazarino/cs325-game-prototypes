"use strict";

window.onload = function() {
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".

    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render } );

    function preload() {
        game.load.image( 'point', 'assets/point.png' );
        game.load.image( 'line', 'assets/line.jpg' );
    }

    var handle1;
    var handle2;
    var handle3;
    var handle4;

    var line1;
    var line2;

    function create() {
        game.stage.backgroundColor = '#124184';
        game.physics.startSystem(Phaser.Physics.ARCADE);

        handle1 = game.add.sprite(100, 200, 'point');
        handle1.tint = 0xff1900;
        handle1.anchor.set(0.5);
        handle1.inputEnabled = true;
        handle1.input.enableDrag(true);
        game.physics.enable(handle1, Phaser.Physics.ARCADE);
        handle1.body.collideWorldBounds = true;

        handle2 = game.add.sprite(100, 300, 'point');
        handle2.anchor.set(0.5);
        handle2.inputEnabled = true;
        handle2.input.enableDrag(true);
        game.physics.enable(handle2, Phaser.Physics.ARCADE);
        handle2.body.collideWorldBounds = true;
        //handle2.body.gravity.set(0, 180);

        handle3 = game.add.sprite(200, 400, 'point');
        handle3.tint = 0x12e000;
        handle3.anchor.set(0.5);
        handle3.inputEnabled = true;
        handle3.input.enableDrag(true);
        game.physics.enable(handle3, Phaser.Physics.ARCADE);
        handle3.body.collideWorldBounds = true;

        handle4 = game.add.sprite(300, 500, 'point');
        handle4.tint = 0x000000;
        handle4.anchor.set(0.5);
        handle4.inputEnabled = true;
        handle4.input.enableDrag(true);
        game.physics.enable(handle4, Phaser.Physics.ARCADE);
        handle4.body.collideWorldBounds = true;
        handle4.body.gravity.set(0, 180);

        //line1 = new Phaser.Line(handle1.x, handle1.y, handle2.x, handle2.y);
        //line2 = new Phaser.Line(handle3.x, handle3.y, handle4.x, handle4.y);
        line1 = game.add.sprite(300, 500, 'line');
        line2 = game.add.sprite(300, 500, 'line');
        handle1.pivot.x = handle2.x-handle1.x;
        handle1.pivot.y = handle2.y-handle1.y;
        handle3.pivot.x = handle4.x-handle3.x;
        handle3.pivot.y = handle4.y-handle3.y;
        //handle3.pivot.x = 50;
        //handle3.pivot.y = 50;
    }

    var c = 'rgb(255,255,255)';
    var p = new Phaser.Point();

    function update() {
        var point1X = handle1.centerX+handle1.pivot.x*1.4*Math.cos(handle1.rotation+Math.PI*1.25);
        var point1Y = handle1.centerY+handle1.pivot.y*1.4*Math.sin(handle1.rotation+Math.PI*1.25);
        var distance1 = Math.sqrt(Math.pow(point1X-handle2.x, 2)+Math.pow(point1Y-handle2.y, 2));

        var point3X = handle3.centerX+handle3.pivot.x*1.4*Math.cos(handle3.rotation+Math.PI*1.25);
        var point3Y = handle3.centerY+handle3.pivot.y*1.4*Math.sin(handle3.rotation+Math.PI*1.25);
        var distance3 = Math.sqrt(Math.pow(point3X-handle4.x, 2)+Math.pow(point3Y-handle4.y, 2));

        handle1.x = handle2.x;
        handle1.y = handle2.y;

        handle3.x = handle4.x;
        handle3.y = handle4.y;
        if (point3X < game.width && point3X > 0 && point3Y < game.height && point3Y > 0) {
            handle3.rotation += 0.03;
        } else {
            if (point3X >= game.width)
                handle4.x -= point3X - game.width;
            if (point3X <= 0)
                handle4.x -= point3X;
            if (point3Y >= game.height)
                handle4.y -= point3Y - game.height;
            if (point3Y <= 0)
                handle4.y -= point3Y;
        }

        if (point1X < game.width && point1X > 0 && point1Y < game.height && point1Y > 0) {
            handle1.rotation -= 0.03;
        } else {
            if (point1X >= game.width)
                handle2.x -= point1X - game.width;
            if (point1X <= 0)
                handle2.x -= point1X;
            if (point1Y >= game.height)
                handle2.y -= point1Y - game.height;
            if (point1Y <= 0)
                handle2.y -= point1Y;
        }
        //line1.fromSprite(handle1, handle2, false);
        //line2.fromSprite(handle3, handle4, false);
        //line2.start.x = point3X;
        //line2.start.y = point3Y;

        line1.x = handle2.x;
        line1.y = handle2.y;
        line1.width = distance1;
        line1.rotation = handle1.rotation+Math.PI*1.00;

        line2.x = handle4.x;
        line2.y = handle4.y;
        line2.width = distance3;
        line2.rotation = handle3.rotation+Math.PI*1.25;

        //console.log(Math.cos(handle3.rotation%(2*Math.PI
        /*
        p = line1.intersects(line2, true);

        if (p) {
            c = 'rgb(0,255,0)';
        } else {
            c = 'rgb(255,255,255)';
        }//*/
    }

    function render() {
        /*
        game.debug.geom(line1, c);
        game.debug.geom(line2, c);

        game.debug.lineInfo(line1, 32, 32);
        game.debug.lineInfo(line2, 32, 100);

        if (p) {
            game.context.fillStyle = 'rgb(255,0,255)';
            game.context.fillRect(p.x - 2, p.y - 2, 5, 5);
        }
        game.debug.text("Drag the handles", 32, 550);//*/
    }
};
