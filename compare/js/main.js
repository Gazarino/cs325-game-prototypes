window.onload = function() {

    //"use strict";

    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });


function preload() {
    game.load.image('point', 'assets/point.png');
    game.load.image('dot', 'assets/dot.jpg');
    game.load.image('grid', 'assets/grid.jpg');
}

var xAxis, yAxis, cursors, speed;
var size = new Phaser.Rectangle();
var opKeys, pointTxt, nameTxt, calcTxt;
var inputBox, name, xVal, yVal, realX, realY;
var points = [], ptNames = [];
var showList = false, listTxt, target, showNames = true, listStart=0, showCircle = false, radius = 2, circle;

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
    opKeys = game.input.keyboard.addKeys( {'c': Phaser.KeyCode.C, 'z': Phaser.KeyCode.Z, 'enter': Phaser.KeyCode.ENTER,
                                              'h': Phaser.KeyCode.H, 'l': Phaser.KeyCode.L, 'y': Phaser.KeyCode.Y, 'n': Phaser.KeyCode.N,
                                              's': Phaser.KeyCode.S, 'w': Phaser.KeyCode.W, 'd': Phaser.KeyCode.D, 'x': Phaser.KeyCode.X } );

    pointTxt = game.add.text(0, 0, "", {font:"40px Times New Roman", fill:"#000000", align:"center", fontWeight:"bold"});
    pointTxt.anchor.setTo(0.5, 0.5);
    nameTxt = game.add.text(0, 0, "", {font:"26px Times New Roman", fill:"#000000", align:"center", fontWeight:"bold"});
    nameTxt.anchor.setTo(0.5, 0.5);
    listTxt = game.add.text(0, 0, "", {font:"22px Segoe UI Black", fill:"#000000", align:"left"});
    calcTxt = game.add.text(0, 0, "", {font:"26px Segoe UI Black", fill:"#000000", align:"left"});
    game.input.onTap.add(selection, this);
    circle = new Phaser.Circle(game.world.centerX, game.world.centerY, 500);
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
        game.camera.x += game.input.activePointer.worldX/game.camera.scale.x*zoomAmount;
        game.camera.y += game.input.activePointer.worldY/game.camera.scale.x*zoomAmount;
    }
    if (opKeys.enter.downDuration(1)) {
        createInputBox();
        if (!showCircle) pointTxt.text = "Enter name for point.";
        else pointTxt.text = "Enter radius for circle.";
        pointTxt.x = inputBox.x+60/game.camera.scale.x;
        pointTxt.y = inputBox.y-40/game.camera.scale.x;
        return;
    }
    if (opKeys.l.downDuration(1))
        showList = !showList;
    if (opKeys.c.downDuration(1))
        showCircle = !showCircle;
    if (showCircle) calcTxt.alpha=1;
    else calcTxt.alpha=0;
    if (opKeys.s.downDuration(1) && showList && listStart<points.length-1)
        listStart++;
    else if (opKeys.w.downDuration(1) && showList && listStart>0)
        listStart--;
    if (opKeys.h.downDuration(1))
        showNames = !showNames;
    if (!showNames) {
        nameTxt.alpha = 1;
        for (var i=0; i<ptNames.length; i++)
            ptNames[i].alpha = 0;
    } else {
        nameTxt.alpha = 0;
        for (var i=0; i<ptNames.length; i++)
            ptNames[i].alpha = 1;
    }
    if (pointTxt.text.includes("Delete")) {
        if (opKeys.y.downDuration(1)) {
            var sprite = points[target];
            var txt = ptNames[target];
            points.splice(target,1);
            ptNames.splice(target,1);
            sprite.destroy();
            txt.destroy();
            pointTxt.text = "";
            nameTxt.text = "";
        } else if (opKeys.n.downDuration(1))
            pointTxt.text = "";
        return;
    }
    realX = Math.round(game.input.activePointer.worldX/game.camera.scale.x) / 100;
    realY = -Math.round(game.input.activePointer.worldY/game.camera.scale.x) / 100;
    if (opKeys.d.downDuration(1) && nameTxt.text!=="") {
        for (var i=0; i<points.length; i++) {
            var pX = points[i].x/100, pY = (-points[i].y/100);
            if (points[i].data===nameTxt.text && Math.abs(pX-realX)<.1 && Math.abs(pY-realY)<.1) {
                pointTxt.text = "Delete point "+points[i].data+" @ ("+pX+", "+pY+")?\n[Y]es    [N]o";
                pointTxt.x = game.camera.x/game.camera.scale.x+game.width/game.camera.scale.x/2;
                pointTxt.y = game.camera.y/game.camera.scale.x+game.height/game.camera.scale.x/2;
                target = i;
                return;
            }
        }
    }
    cameraAlign();
    pointTxt.text = "("+realX+", "+realY+")";
    if (cursors.left.isDown) game.camera.x -= speed;
    else if (cursors.right.isDown) game.camera.x += speed;
    if (cursors.up.isDown) game.camera.y -= speed;
    else if (cursors.down.isDown) game.camera.y += speed;
    if (showCircle) {
        highlight();
        runCalculations();
    }
}

function highlight() {
    for (var i=0; i<points.length; i++) {
        var pX = points[i].x/100, pY = (-points[i].y/100);
        var disX = Math.abs(pX-realX), disY = Math.abs(pY-realY);
        if (Math.sqrt(disX*disX+disY*disY)<=radius)
            points[i].tint=0xff9900;
        else
            points[i].tint=0xffffff;
    }
}

function runCalculations() {
    var xList=[], yList=[];
    for (var i=0; i<points.length; i++) {
        if (points[i].tint===0xff9900) {
            xList.push(points[i].x/100);
            yList.push(-points[i].y/100);
        }
    } calcTxt.text="";
    if (xList.length < 1) return;
    let sumX = xList.reduce((previous, current) => current += previous);
    let avgX = sumX / xList.length;
    let sumY = yList.reduce((previous, current) => current += previous);
    let avgY = sumY / yList.length;
    calcTxt.text = "Average X: "+avgX+"\nMedian X: "+median(xList)+"\nAverage Y: "+avgY+"\nMedian Y: "+median(yList);
}
function median(values) {
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);
    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

function cameraAlign () {
    pointTxt.x = game.camera.x/game.camera.scale.x+game.width/game.camera.scale.x/2;
    pointTxt.y = game.camera.y/game.camera.scale.x+game.height/game.camera.scale.x-25/game.camera.scale.x;
    pointTxt.scale.x = .65/game.camera.scale.x;
    pointTxt.scale.y = .65/game.camera.scale.x;

    if (!showNames) {
        nameTxt.x = game.input.activePointer.worldX/game.camera.scale.x;
        nameTxt.y = game.input.activePointer.worldY/game.camera.scale.x-20;
        if (nameTxt.y<-975)
            nameTxt.y+=40/game.camera.scale.x;
        nameTxt.scale.x = .65/game.camera.scale.x;
        nameTxt.scale.y = .65/game.camera.scale.x;
    } else {
        for (var i=0; i<ptNames.length; i++) {
            ptNames[i].scale.x = .65/game.camera.scale.x;
            ptNames[i].scale.y = .65/game.camera.scale.x;
        }
    }

    listTxt.text = "";
    if (showList) {
        for (var i=listStart; i<points.length; i++)
            listTxt.text+=points[i].data+" @ ("+points[i].x/100+", "+(-points[i].y/100)+")\n";
        listTxt.x = game.camera.x/game.camera.scale.x+20/game.camera.scale.x;
        listTxt.y = game.camera.y/game.camera.scale.x+20/game.camera.scale.x;
        listTxt.scale.x = .65/game.camera.scale.x;
        listTxt.scale.y = .65/game.camera.scale.x;
    }
    if (showCircle) {
        circle.x = game.input.activePointer.worldX;
        circle.y = game.input.activePointer.worldY;
        circle.radius = radius*100*game.camera.scale.x;
        calcTxt.x = game.camera.x/game.camera.scale.x+game.width/2/game.camera.scale.x;
        calcTxt.y = game.camera.y/game.camera.scale.x+20/game.camera.scale.x;
        calcTxt.scale.x = .65/game.camera.scale.x;
        calcTxt.scale.y = .65/game.camera.scale.x;
    }
}

function checkInput() {
    var n = inputBox.value.replace(/ /g,'');
    if (pointTxt.text.includes("radius")) {
        if (!isNaN(inputBox.value) && inputBox.value>0) {
            radius = inputBox.value;
            destroyInputBox();
        } return;
    }
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
        var ptName = game.add.text(xVal*100, -yVal*100-20, name, {font:"26px Times New Roman", fill:"#000000", align:"center", fontWeight:"bold"});
        ptName.anchor.setTo(0.5, 0.5);
        if (ptName.y<-975)
            ptName.y+=40;
        ptNames.push(ptName);
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
}
function hideName (p) {
    nameTxt.text = "";
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

function render() {
    if (showCircle)
        game.debug.geom(circle, 'rgba(200,200,0,0.5)');
}

};
