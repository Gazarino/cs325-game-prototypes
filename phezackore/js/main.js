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

    "use strict";

    var game = new Phaser.Game(800, 352, Phaser.AUTO, 'game', {preload: preload, create: create, update: update});

    function preload() {
        game.load.image('phezackore', 'assets/phezackore.png');
        game.load.image('highlight', 'assets/highlight.png');
        game.load.image('options', 'assets/options.jpg');
        game.load.tilemap('map', 'assets/tile_properties.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/gridtiles.png');
        game.load.image('slider', 'assets/slidePart.png');
        game.load.audio('hunter', 'assets/Crystal_Hunter.mp3');
        game.load.audio('danger', 'assets/Videogame1.mp3');
        game.load.image('HPf', 'assets/healthFull.png');
        game.load.image('HPe', 'assets/healthEmpty.png');
        game.load.image('RPf', 'assets/resourcesFull.png');
        game.load.image('RPe', 'assets/resourcesEmpty.png');
    }

    var map;
    var layer;
    var marker;
    var clicked = {x:0, y:0};
    var range = 4;
    var slider;
    var highlight;
    var huntMusic;
    var huntedMusic;
    var playing = "hunt";
    var lockSearch = false;
    //var attackTimer;

    var cursors;
    var health = 100;
    var resources = 150;
    var score = 0;
    var hpFull;
    var hpEmpty;
    var rpFull;
    var rpEmpty;
    var penalty = 0;

    var phezackore;
    var phezackoreLocs = [{x:0, y:0}];
    var phezackoreLeft = 1;
    var phezackores = [];
    var attackStatus = "";

    var textHP;
    var textRP;
    var textPhezLeft;
    var textScore;
    var textFound;
    var textResult;
    var textFinal;

    function create() {
        game.add.sprite(640, 0, 'options');
        highlight = game.add.sprite(640, 224, 'highlight');
        //game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true);

        huntMusic = game.add.audio('hunter');
        huntMusic.loopFull(.5);
        huntedMusic = game.add.audio('danger');

        hpEmpty = game.add.sprite(199, 320, 'HPe');
        hpFull = game.add.sprite(200, 320, 'HPf');
        rpEmpty = game.add.sprite(24, 320, 'RPe');
        rpFull = game.add.sprite(25, 320, 'RPf');

        game.physics.p2.enable(hpFull);
        hpFull.body.static = true;
        hpFull.anchor.setTo(0, 0);

        //phezackores = game.add.group();
        //phezackores.enableBody = true;
        //phezackores.physicsBodyType = Phaser.Physics.ARCADE;
        //phezackores.createMultiple(20, 'phezackore', 0, false);
        //phezackores.setAll('checkWorldBounds', true);

        phezackoreLocs[0].x = game.rnd.integerInRange(0, 19);
        phezackoreLocs[0].y = game.rnd.integerInRange(0, 9);
        //console.log("x:"+phezackoreLocs[0].x+", y:"+phezackoreLocs[0].y);
        for(var i = 1; i < 20; i++) {
            var xCoord = game.rnd.integerInRange(0, 19);
            var yCoord = game.rnd.integerInRange(0, 9);
            for (var j = 0; j < i; j++) {
                if (xCoord === phezackoreLocs[j].x && yCoord === phezackoreLocs[j].y) {
                    xCoord = game.rnd.integerInRange(0, 19);
                    yCoord = game.rnd.integerInRange(0, 9);
                    j = -1;
                }
            }
            phezackoreLocs.push({x:xCoord, y:yCoord});
            //console.log("x:"+xCoord+", y:"+yCoord);
            phezackoreLeft++;
        }

        map = game.add.tilemap('map');
        map.addTilesetImage('tiles');
        layer = map.createLayer('Tile Layer 1');
        layer.resizeWorld();
        map.shuffle(0, 0, 20, 10);
        //  Our painting marker
        marker = game.add.graphics();
        marker.lineStyle(2, 0xffffff, 1);

        game.input.addMoveCallback(updateMarker, this);

        game.input.onDown.add(clickEvent, this);

        cursors = game.input.keyboard.createCursorKeys();

        slider = game.add.sprite(709, 38, 'slider');
        //  Enable Input detection. Sprites have this disabled by default,
        //  so you have to start it if you want to interact with them.
        slider.inputEnabled = true;
        //  This allows you to drag the sprite. The parameter controls if you drag from the position you touched it (false)
        //  or if it will snap to the center (true)
        slider.input.enableDrag();
        //  This will lock the sprite so it can only be dragged horizontally, not vertically
        slider.input.allowVerticalDrag = false;

        textRP = game.add.text(45, 326, "Resources: " + resources, {font:"16px Arial", fill:"#ffffff", align:"center" });
        textHP = game.add.text(213, 326, "Health: " + health, {font:"16px Arial", fill:"#ffffff", align:"center" });
        textPhezLeft = game.add.text(325, 326, "Phezackore Remaining: " + phezackoreLeft, {font:"16px Arial", fill:"#ffffff", align:"center" });
        textScore = game.add.text(550, 326, "Score: " + score, {font:"16px Arial", fill:"#ffffff", align:"center" });

        textFound = game.add.text(0, 0, "", {font:"22px Arial", fill:"#ffffff", align:"center" });
        textFound.alpha = 0;
        textResult = game.add.text(240, 150, "", {font:"30px Arial", fill:"#ffffff", align:"center" });
        textFinal = game.add.text(240, 185, "", {font:"22px Arial", fill:"#ffffff", align:"center" });
    }

    function clickEvent() {
        var x = layer.getTileX(game.input.activePointer.worldX);
        var y = layer.getTileY(game.input.activePointer.worldY);

        var tile = map.getTile(x, y, layer);
        clicked.x = x;
        clicked.y = y;
        if (clicked.x > 19) {
            if (clicked.y === 5)
                highlight.y = 160;
            else if (clicked.y === 6)
                highlight.y = 192;
            else if (clicked.y === 7)
                highlight.y = 224;
            else if (clicked.y === 8)
                highlight.y = 256;
            else if ((clicked.y === 9 || clicked.y === 10) && !lockSearch && attackStatus !== "attacking")
                search();
            else if ((clicked.y === 9 || clicked.y === 10) && attackStatus === "attacking") {
                textFound.text = "AAH!!! THE PHEZACKORES ARE ATTACKING!!"
                textFound.x = 100;
                textFound.y = 150;
                game.add.tween(textFound).to({alpha:1}, 500, "Linear", true);
                game.time.events.add(Phaser.Timer.SECOND*2, fadeText, this);
                //game.time.events.add(Phaser.Timer.SECOND*2, stopAttack, this);
            }
        }
    }

    function search() {
        var topLeftX = marker.x/32;
        var topLeftY = marker.y/32;
        var botRightX = marker.x/32;
        var botRightY = marker.y/32;
        switch (range) {
            case 1: botRightX++; botRightY++; break;
            case 2: topLeftX--; topLeftY--; botRightX++; botRightY++; break;
            case 3: topLeftX--; topLeftY--; botRightX+=2; botRightY+=2; break;
            case 4: topLeftX-=2; topLeftY-=2; botRightX+=2; botRightY+=2; break;
        }
        var prev = phezackoreLeft;
        resources -= 2;
        attackStatus = "";
        clearPhezackores();
        for (var i=topLeftX; i<=botRightX; i++)
            for (var j=topLeftY; j<=botRightY; j++) {
                if (i>=0 && j>=0 && i<20 && j<10)
                    resources--;
                for (var k = 0; k < phezackoreLeft; k++)
                    if (i === phezackoreLocs[k].x && j === phezackoreLocs[k].y) {
                        phezackoreLocs.splice(k,1);
                        phezackoreLeft--;
                        phezackores.push({});
                        phezackores[phezackores.length-1] = game.add.sprite(0, 0, 'phezackore');
                        phezackores[phezackores.length-1].alpha = 0;
                        phezackores[phezackores.length-1].anchor.setTo(0.5, 0.5);
                        phezackores[phezackores.length-1].angle = game.rnd.integerInRange(0, 360);
                        phezackores[phezackores.length-1].centerX = i*32+16;
                        phezackores[phezackores.length-1].centerY = j*32+16;
                        game.add.tween(phezackores[phezackores.length-1]).to({alpha:1}, 500, "Linear", true);
                        game.time.events.add(Phaser.Timer.SECOND*2, fadeOutObj, this);
                    }
            }
        if (prev === phezackoreLeft) {
            if (highlight.y === 160) {
                penalty = 8*(range+1);
            } else if (highlight.y === 192) {
                penalty = 4*(range+1);
            } else if (highlight.y === 224) {
                penalty = 2*(range+1);
            } else {
                penalty = 0;
            }
            textFound.text = "Found none...";
            if (penalty > 0) {
                if (playing === "hunt") {
                    huntMusic.fadeOut(1250);
                    huntedMusic.loopFull(.5);
                    playing = "hunted";
                }
                phezackoreAttack();
            }
        } else {
            var numFound = prev-phezackoreLeft;
            if (highlight.y === 160) {
                score += 20*numFound;
                resources += 8;
            } else if (highlight.y === 192) {
                score += 10*numFound;
                resources += 4;
            } else if (highlight.y === 224) {
                score += 5*numFound;
                resources += 2;
            }
            textFound.text = "Found "+numFound+"!";
            if (playing === "hunted") {
                huntedMusic.fadeOut(1250);
                huntMusic.loopFull(.5);
                playing = "hunt";
            }
        }
        textFound.x = marker.x;
        textFound.y = marker.y;
        game.add.tween(textFound).to({alpha:1}, 500, "Linear", true);
        game.time.events.add(Phaser.Timer.SECOND*2, fadeText, this);
        phezackoreMove();

        textPhezLeft.text = "Phezackore Remaining: " + phezackoreLeft;
        textScore.text = "Score: " + score;
    }

    function fadeText() {
        game.add.tween(textFound).to({alpha:0}, 1000, "Linear", true);
    }
    function fadeOutObj() {
        for (var i=0; i < phezackores.length; i++)
            game.add.tween(phezackores[i]).to({alpha:0}, 1000, "Linear", true);
    }
    function fadeInObj() {
        for (var i=0; i < phezackores.length; i++)
            game.add.tween(phezackores[i]).to({alpha:1}, 1500, "Linear", true);
    }

    function clearPhezackores() {
        for (var i=0; i<phezackores.length; i++)
            phezackores[i].kill();
        phezackores = [];
    }

    function updateMarker() {
        marker.clear();
        marker.lineStyle(2, 0xffff00, 1);
        switch (range) {
            case 0: marker.drawRect(0, 0, 32, 32); break;
            case 1: marker.drawRect(0, 0, 64, 64); break;
            case 2: marker.drawRect(-32, -32, 96, 96); break;
            case 3: marker.drawRect(-32, -32, 128, 128); break;
            case 4: marker.drawRect(-64, -64, 160, 160); break;
        }
        if (clicked.x < 20 && clicked.y < 10) {
            marker.x = clicked.x * 32;
            marker.y = clicked.y * 32;
        }
        if ((range > 0 && marker.x/32 === 19) || (range > 2) && marker.x/32 > 17) {
            if (range > 2 && marker.x/32 === 19)
                marker.x -= 32;
            marker.x -= 32;
        }
        if ((range > 0 && marker.y/32 === 9) || (range > 2) && marker.y/32 > 7) {
            if (range > 2 && marker.y/32 === 9)
                marker.y -= 32;
            marker.y -= 32;
        }
    }

    function phezackoreMove() {
        if (range < 2)
            return;
        var move = 1;
        if (range > 3)
            move++;

        for (var i=0; i<phezackoreLeft; i++) {
            var xCoord = game.rnd.integerInRange(phezackoreLocs[i].x-move, phezackoreLocs[i].x+move);
            var yCoord = game.rnd.integerInRange(phezackoreLocs[i].y-move, phezackoreLocs[i].y+move);
            while (xCoord < 0 || xCoord > 19)
                xCoord = game.rnd.integerInRange(phezackoreLocs[i].x-move, phezackoreLocs[i].x+move);
            while (yCoord < 0 || yCoord > 9)
                yCoord = game.rnd.integerInRange(phezackoreLocs[i].y-move, phezackoreLocs[i].y+move);
            for (var j = 0; j < phezackoreLeft; j++) {
                if (xCoord===phezackoreLocs[j].x && yCoord===phezackoreLocs[j].y && i!==j) {
                    xCoord = game.rnd.integerInRange(phezackoreLocs[i].x-move, phezackoreLocs[i].x+move);
                    yCoord = game.rnd.integerInRange(phezackoreLocs[i].y-move, phezackoreLocs[i].y+move);
                    j = -1;
                }
            }
            phezackoreLocs[i].x = xCoord;
            phezackoreLocs[i].y = yCoord;
        }
    }

    function phezackoreAttack() {
        var numAttacking = 1;
        if (range > 0)
            numAttacking++;
        if (range > 2)
            numAttacking++;
        while (numAttacking > phezackoreLeft)
            numAttacking = phezackoreLeft;

        for (var i=0; i<numAttacking; i++) {
            phezackores.push({});
            phezackores[i] = game.add.sprite(0, 0, 'phezackore');
            game.physics.p2.enable(phezackores[i]);
            //phezackores[i].body.kinematic = true;
            hpFull.body.createBodyCallback(phezackores[i], takeDamage, this);
            phezackores[i].body.setCircle(12);
            phezackores[i].alpha = 0;
            phezackores[i].anchor.setTo(0.5, 0.5);
            var r = game.rnd.integerInRange(0, phezackoreLeft-1);
            for (var k=0; k<i; k++) {
                if (phezackoreLocs[r].x===Math.round(phezackores[k].body.x/32) && phezackoreLocs[r].y===Math.round(phezackores[k].body.y/32)) {
                    r = game.rnd.integerInRange(0, phezackoreLeft-1);
                    k = -1;
                }
            }
            phezackores[i].body.x = phezackoreLocs[r].x*32;
            phezackores[i].body.y = phezackoreLocs[r].y*32;
            phezackores[i].data = {prevX:phezackoreLocs[r].x*32, prevY:phezackoreLocs[r].y*32, in:true, target:0};
            if (phezackores[i].body.x < 225)
                r = game.rnd.integerInRange(hpFull.x, hpFull.x+(hpFull.width/2));
            else
                r = game.rnd.integerInRange(hpFull.x+(hpFull.width/2), hpFull.x+(hpFull.width/4));
            phezackores[i].data.target = r;
            game.time.events.add(Phaser.Timer.SECOND, fadeInObj, this);
        }
        attackStatus = "attacking";
        //attackTimer = game.time.events.add(Phaser.Timer.SECOND*8, stopAttack, this);
    }
    //obj1 going to obj2
    function goToLocation(num) {
        var speed = 75;
        var angle;
        var distanceX;
        var distanceY;

        if (attackStatus === "attacking") {
            distanceX = phezackores[num].data.target - phezackores[num].body.x;
            distanceY = hpFull.centerY - phezackores[num].body.y;
            angle = Math.atan2(distanceY, distanceX);
        } else {
            distanceX = phezackores[num].data.prevX - phezackores[num].body.x;//problem?
            distanceY = phezackores[num].data.prevY - phezackores[num].body.y;
            angle = Math.atan2(distanceY, distanceX);
        }
        phezackores[num].body.rotation = angle + game.math.degToRad(90);
        //var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
        phezackores[num].body.velocity.x = Math.cos(angle) * speed;
        phezackores[num].body.velocity.y = Math.sin(angle) * speed;
        if (phezackores[num].data.in) {
            phezackores[num].body.kinematic = true;
            if (phezackores[num].body.y > 305){
                phezackores[num].data.in = false;
                phezackores[num].body.kinematic = false;
                phezackores[num].body.dynamic = true;
            }
        } else {
            phezackores[num].body.velocity.y = -Math.sin(angle) * speed;
            if (phezackores[num].body.y < 295)
                phezackores[num].data.in = true;
        }
        if (phezackores[num].body.y > 305) {
            phezackores[num].body.y--;
        }
    }

    function takeDamage(body1, body2) {
        if (penalty > 0) {
            health--;
            penalty--;
        } else {
            attackStatus = "doneAttacking";
            fadeOutObj();
        }
    }

    function stopAttack() {
        if (attackStatus === "attacking") {
            health -= penalty;
            penalty = 0;
            attackStatus = "doneAttacking";
            fadeOutObj();
        }
    }

    function update() {
        if (attackStatus !== "") {
            for (var i=0; i<phezackores.length; i++)
                if (phezackores[i].body)
                    goToLocation(i);
        }

        textHP.text = "Health: " + health;
        textRP.text = "Resources: " + resources;

        hpFull.width = 101 - (100 - health);
        rpFull.width = 101 - (100 - resources);

        if (health < 1) {
            health = 0;
            hpFull.kill();
            attackStatus = "doneAttacking";
            fadeOutObj();
        }
        if (resources < 1) {
            resources = 0;
            rpFull.kill();
        }
        if ((resources===0 || health===0) && textResult.text === "") {
            lockSearch = true;
            textResult.text = "YOU LOSE!";
        }

        if (phezackoreLeft === 0 && textResult.text === "") {
            lockSearch = true;
            score += 100;
            textResult.text = "YOU WIN!";
        }
        if (textResult.text !== "") {
            if (resources > 0) {
                resources--;
                score++;
            } else if (health > 0) {
                health--;
                score++;
            }
            textScore.text = "Score: " + score;
            textFinal.text = "Final Score: "+score;
        }

        updateSlider();
    }

    function updateSlider() {
        if (slider.x < 645)
            slider.x = 645;
        if (slider.x > 775)
            slider.x = 775;
        if (slider.x < 645+26)
            range = 0;
        else if (slider.x < 645+26*2)
            range = 1;
        else if (slider.x < 645+26*3)
            range = 2;
        else if (slider.x < 645+26*4)
            range = 3;
        else
            range = 4;
    }

};
