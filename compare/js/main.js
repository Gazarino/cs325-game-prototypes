window.onload = function() {

    //"use strict";

    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update });


function preload() {
    game.load.image('point', 'assets/point.png');
    game.load.image('dot', 'assets/dot.jpg');
    game.load.image('grid', 'assets/grid.jpg');
}

var xAxis, yAxis, cursors, speed;
var size = new Phaser.Rectangle();
var opKeys, pointTxt, nameTxt;
var inputBox, name, xVal, yVal;
var points = [];

function create() {
    game.add.plugin(PhaserInput.Plugin);
    game.add.sprite(-1000, -1000, 'grid');
    game.world.setBounds(-1000, -1000, 2000, 2000);
    size.setTo(-1000, -1000, 2000, 2000);

    xAxis = game.add.sprite(0, -1000, 'dot');
    xAxis.height = 2000;
    yAxis = game.add.sprite(-1000, 0, 'dot');
    yAxis.width = 2000;

    game.camera.focusOnXY(0, 0);
    speed = 10;
    game.camera.scale.set(.4);
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);
    opKeys = game.input.keyboard.addKeys( {'a': Phaser.KeyCode.A, 'z': Phaser.KeyCode.Z, 'enter': Phaser.KeyCode.ENTER,
                                              'h': Phaser.KeyCode.H, 'e': Phaser.KeyCode.E,
                                              's': Phaser.KeyCode.S, 'd': Phaser.KeyCode.D, 'x': Phaser.KeyCode.X } );

    pointTxt = game.add.text(0, 0, "", {font:"40px Times New Roman", fill:"#000000", align:"center", fontWeight:"bold"});
    pointTxt.anchor.setTo(0.5, 0.5);
    nameTxt = game.add.text(0, 0, "", {font:"40px Times New Roman", fill:"#000000", align:"center", fontWeight:"bold"});
    nameTxt.anchor.setTo(0.5, 0.5);
    game.input.onTap.add(selection, this);
}
function selection() {
    //console.log("Click");
}

function update() {
    if (inputBox) {
        if (opKeys.enter.downDuration(1))
            checkInput();
        return;
    }
    if (opKeys.z.isDown || opKeys.x.isDown) {
        var zoomAmount = .025;
        if (!opKeys.z.isDown) zoomAmount = -zoomAmount;
        zoomAmount*=game.camera.scale.x;
        game.camera.scale.set(game.camera.scale.x+=zoomAmount);
        if (game.camera.scale.x < .4)
            game.camera.scale.set(.4);
    }
    if (opKeys.enter.downDuration(1)) {
        createInputBox();
        pointTxt.text = "Enter name for point.";
        pointTxt.x = inputBox.x+60/game.camera.scale.x;
        pointTxt.y = inputBox.y-40/game.camera.scale.x;
        return;
    }
    cameraAlign();
    var realX = Math.round(game.input.activePointer.worldX/game.camera.scale.x) / 100;
    var realY = -Math.round(game.input.activePointer.worldY/game.camera.scale.x) / 100;
    pointTxt.text = "("+realX+", "+realY+")";
    if (cursors.left.isDown) game.camera.x -= speed;
    else if (cursors.right.isDown) game.camera.x += speed;
    if (cursors.up.isDown) game.camera.y -= speed;
    else if (cursors.down.isDown) game.camera.y += speed;
    /*var closest = null;
    var bestDist =
    for (var i=0; i<points.length; i++) {
        points[i]
    }//*/
}

function cameraAlign () {
    pointTxt.x = game.camera.x/game.camera.scale.x+game.width/game.camera.scale.x/2;
    pointTxt.y = game.camera.y/game.camera.scale.x+game.height/game.camera.scale.x-25/game.camera.scale.x;
    pointTxt.scale.x = .65/game.camera.scale.x;
    pointTxt.scale.y = .65/game.camera.scale.x;

    nameTxt.x = game.input.activePointer.worldX/game.camera.scale.x;
    nameTxt.y = game.input.activePointer.worldY/game.camera.scale.x-25/game.camera.scale.x;
    nameTxt.scale.x = .65/game.camera.scale.x;
    nameTxt.scale.y = .65/game.camera.scale.x;
}

function checkInput() {
    var n = inputBox.value.replace(/ /g,'');
    //console.log(name+", "+n);
    if (!name && n!=="") {
        name = inputBox.value;
        destroyInputBox();
        pointTxt.text = "Enter x value (-10 to 10).";
        createInputBox();
    } else if (!xVal && !isNaN(inputBox.value) && Math.abs(inputBox.value)<=10) {
        xVal = inputBox.value;
        destroyInputBox();
        pointTxt.text = "Enter y value (-10 to 10).";
        createInputBox();
    } else if (!yVal && !isNaN(inputBox.value) && Math.abs(inputBox.value)<=10) {
        yVal = inputBox.value;
        destroyInputBox();
        var point = game.add.sprite(xVal*100, -yVal*100, 'point');
        point.anchor.setTo(0.5, 0.5);
        point.data = name
        point.inputEnabled = true;
        point.events.onInputOver.add(displayName);
        point.events.onInputOut.add(hideName);
        points.push(point);
        //console.log(name+", "+xVal+", "+yVal);
        //console.log(point.data+", "+point.x+", "+point.y);
        name = null; xVal = null; yVal = null;
    }
}

function displayName (p) {
    nameTxt.text = ""+p.data;
    //console.log(p.data);
}
function hideName (p) {
    nameTxt.text = "";
    //console.log("hide");
}

function createInputBox () {
    var xx = game.camera.x/game.camera.scale.x+game.width/game.camera.scale.x/2-50/game.camera.scale.x;
    var yy = game.camera.y/game.camera.scale.x+game.height/game.camera.scale.x/2;
    inputBox = game.add.inputField(xx, yy, {font:30/game.camera.scale.x+"px Yu Gothic UI Semibold", fill:"#000000",
              width:120/game.camera.scale.x, height:30/game.camera.scale.x, padding:7/game.camera.scale.x});
    inputBox.focusOutOnEnter = true;
}

function destroyInputBox () {
    inputBox.endFocus();
    inputBox.destroy();
    inputBox = null;
}

};
