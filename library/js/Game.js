"use strict";

GameStates.makeGame = function( game, shared ) {

    var music, cursors, spellKeys;
    var lightning = null, lightningTime = null, thunder = null, rain = null;
    var map, floorLayer, wallLayer, decorLayer;
    var spellcaster, circle, enemy1, enemies, sprites;
    var gameOver, deathMark, textFinal;

    function quitGame() {
        music.stop();
        rain.stop();
        game.state.start('MainMenu');
    }

    var mainGame = {
        create: function () {
            gameOver = false;
            cursors = game.input.keyboard.createCursorKeys();
            spellKeys = game.input.keyboard.addKeys( {'a': Phaser.KeyCode.A, 'w': Phaser.KeyCode.W,
                                                      's': Phaser.KeyCode.S, 'd': Phaser.KeyCode.D, 'x': Phaser.KeyCode.X } );
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);

            music = game.add.audio('music');
            music.loopFull(1);

            map = game.add.tilemap('map');
            map.addTilesetImage('custom_FF5_spritesheet');
            floorLayer = map.createLayer('Floor');
            circle = game.add.sprite(0,0,'circle');   circle.alpha = 0;
            circle.animations.add('spin', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
            deathMark = game.add.sprite(400,433, 'circle'); deathMark.tint = 0xff0000;
            wallLayer = map.createLayer('Walls');
            wallLayer.resizeWorld();
            map.setCollision([5,6,7,15,16,17,25,26,27,35,36,45,46], true, wallLayer);

            sprites = game.add.group();
            spellcaster = game.add.sprite(400, 455, 'girl1');
            spellcaster.scale.set(.75);
            spellcaster.data = {speed:6, spellInUse:false, spellType:""};
            game.physics.arcade.enable(spellcaster);
            spellcaster.anchor.set(.5);
            spellcaster.animations.add('up', [0,1,2,1]);
            spellcaster.animations.add('upSide', [3,4,5,4]);
            spellcaster.animations.add('side', [6,7,8,7]);
            spellcaster.animations.add('downSide', [9,10,11,10]);
            spellcaster.animations.add('down', [12,13,14,13]);
            sprites.add(spellcaster);

            enemies = [];
            enemy1 = createEnemy(1, 250, 180);
            function createEnemy (num, x, y) {
                var enemy = game.add.sprite(x, y, 'man'+num);
                enemy.data = {speed:6, collisionBoxes:null, lineOfSight:game.add.physicsGroup(), seeSC:false, moveList:[],
                              controlled:false, counter:0, dying:false};
                enemy.data.collisionBoxes = {upLeft:game.add.sprite(x, y, 'dot'), upRight:game.add.sprite(x, y, 'dot'),
                                            downLeft:game.add.sprite(x, y, 'dot'), downRight:game.add.sprite(x, y, 'dot'),
                                            rightUp:game.add.sprite(x, y, 'dot'), rightDown:game.add.sprite(x, y, 'dot'),
                                            leftUp:game.add.sprite(x, y, 'dot'), leftDown:game.add.sprite(x, y, 'dot'),
                                            left:game.add.sprite(x,y,'dot'),right:game.add.sprite(x,y,'dot'),
                                            up:game.add.sprite(x,y,'dot'),down:game.add.sprite(x,y,'dot')};
                var b = enemy.data.collisionBoxes;
                prepareBox(b.upLeft);   prepareBox(b.upRight);    prepareBox(b.up);
                prepareBox(b.downLeft); prepareBox(b.downRight);  prepareBox(b.down);
                prepareBox(b.leftUp);   prepareBox(b.leftDown);   prepareBox(b.left);
                prepareBox(b.rightUp);  prepareBox(b.rightDown);  prepareBox(b.right);
                function prepareBox (box) {
                    box.data=0; box.alpha=0; game.physics.arcade.enable(box);
                }
                enemy.data.lineOfSight.enableBody = true;
                enemy.data.lineOfSight.physicsBodyType = Phaser.Physics.ARCADE;
                enemy.data.lineOfSight.createMultiple(20, 'dot');
                for (var i=0; i<20; i++) makeDot();
                function makeDot () {
                    var dot = enemy.data.lineOfSight.getFirstExists(false);
                    if (dot) {dot.reset(enemy.centerX, enemy.centerY); dot.alpha=0;}
                }
                game.physics.arcade.enable(enemy); enemy.body.velocity.y = 10;
                enemy.animations.add('down', [0,1,2,1]);
                enemy.animations.add('left', [3,4,5,4]);
                enemy.animations.add('right', [6,7,8,7]);
                enemy.animations.add('up', [9,10,11,10]);
                enemies.push(enemy);
                sprites.add(enemy);
                return enemy;
            }

            game.camera.follow(spellcaster);
            decorLayer = map.createLayer('Bookshelves');

            rain = game.add.audio('rain');
            rain.loopFull(.5);
						thunder = game.add.audio('thunder');
						thunder.addMarker("thunder1", 0.2, 10.6);
						thunder.addMarker("thunder2", 14.4, 6.5);
						thunder.addMarker("thunder3", 21.7, 9.2);
						thunder.addMarker("thunder4", 31.1, 9.7);
						thunder.volume = .3;

            lightning = game.add.sprite(0, 0, 'lightning');
            lightning.scale.set(1.25);
						lightning.alpha = 0;
						lightningTime = this.time.time+game.rnd.integerInRange(12000, 25000);
            textFinal = game.add.text(240, 185, "You Win!", {font:"22px Arial", fill:"#ffffff", align:"center" });
            textFinal.alpha = 0;
        },

        update: function () {
            if (gameOver) {}
            //if (spellKeys.aim.downDuration(1))
            //sprites.sort('y', Phaser.Group.SORT_ASCENDING);
            this.moveSpellcaster();
            this.moveEnemies();
            this.analyzeSpellInput();
            //sprites.forEachExists(this.moveEnemy, this);

            lightning.x = game.camera.x-5;
            lightning.y = game.camera.y-5;
            if (this.time.time > lightningTime)
								this.lightningStart();
        },
        analyzeSpellInput: function () {
            if (circle.alpha===0 && !spellcaster.data.spellInUse) {
                if (spellKeys.w.isDown) circle.tint = 0xcc33ff;
                else if (spellKeys.a.isDown) circle.tint = 0xffa31a;
                else if (spellKeys.s.isDown) circle.tint = 0x33ff33;
                else if (spellKeys.d.isDown) circle.tint = 0x3385ff;
                if (spellKeys.w.isDown || spellKeys.a.isDown || spellKeys.s.isDown || spellKeys.d.isDown) {
                    spellcaster.data.spellInUse = true;  circle.play('spin', 12, true);  circle.data = "";
                    game.add.tween(circle).to({alpha:1}, 1000, "Linear", true);
                }
            }
            if (circle.alpha===1 && (circle.tint===0xcc33ff && !spellKeys.w.isDown || circle.tint===0xffa31a && !spellKeys.a.isDown
                                  || circle.tint===0x33ff33 && !spellKeys.s.isDown || circle.tint===0x3385ff && !spellKeys.d.isDown)) {
                spellcaster.data.spellInUse = false; game.add.tween(circle).to({alpha:0}, 500, "Linear", true);
            }
            if (circle.tint===0xcc33ff && circle.alpha>0 && circle.data.length < 4 && spellcaster.data.spellInUse) {
                if (spellKeys.a.downDuration(1)) circle.data+="a";
                else if (spellKeys.s.downDuration(1)) circle.data+="s";
                else if (spellKeys.d.downDuration(1)) circle.data+="d";
            } else if (circle.tint===0xffa31a && circle.alpha>0 && circle.data.length < 4 && spellcaster.data.spellInUse) {
                if (spellKeys.w.downDuration(1)) circle.data+="w";
                else if (spellKeys.s.downDuration(1)) circle.data+="s";
                else if (spellKeys.d.downDuration(1)) circle.data+="d";
            } else if (circle.tint===0x33ff33 && circle.alpha>0 && circle.data.length < 4 && spellcaster.data.spellInUse) {
                if (spellKeys.w.downDuration(1)) circle.data+="w";
                else if (spellKeys.a.downDuration(1)) circle.data+="a";
                else if (spellKeys.d.downDuration(1)) circle.data+="d";
            } else if (circle.tint===0x3385ff && circle.alpha>0 && circle.data.length < 4 && spellcaster.data.spellInUse) {
                if (spellKeys.w.downDuration(1)) circle.data+="w";
                else if (spellKeys.a.downDuration(1)) circle.data+="a";
                else if (spellKeys.s.downDuration(1)) circle.data+="s";
            }
            if (circle.data.length===4 && circle.tint!==0xffffff) {
                if (circle.tint===0xcc33ff) spellcaster.data.spellType="w";
                else if (circle.tint===0xffa31a) spellcaster.data.spellType="a";
                else if (circle.tint===0x33ff33) spellcaster.data.spellType="s";
                else if (circle.tint===0x3385ff) spellcaster.data.spellType="d";
                circle.tint = 0xffffff;  circle.animations.stop();  this.startSpell();
                game.time.events.add(250, this.fadeCircle, this);
            }
            if (spellKeys.x.downDuration(1)) {this.fadeCircle(); this.endSpell();}

        },
        fadeCircle: function () {game.add.tween(circle).to({alpha:0}, 500, "Linear", true);},
        startSpell: function () {
            if (circle.data==="awdd" && spellcaster.data.spellType==="s") {
                var sign=1;   if (spellcaster.scale.x<0) sign=-1;
                game.add.tween(spellcaster.scale).to({x:.5*sign}, 1000, "Linear", true);
                game.add.tween(spellcaster.scale).to({y:.5}, 1000, "Linear", true);
                game.time.events.add(10000, this.endSpell, this);
            } else if (circle.data==="adad" && spellcaster.data.spellType==="s") {
                game.add.tween(decorLayer).to({alpha:.5}, 1000, "Linear", true);
                game.time.events.add(10000, this.endSpell, this);
            } else if (circle.data==="sasa" && spellcaster.data.spellType==="d") {
                for (var i = 0; i < enemies.length; i++)
                    enemies[i].data.lineOfSight.forEachExists(fadeDot, this);
                function fadeDot (dot) {game.add.tween(dot).to({alpha:1}, 1000, "Linear", true);}
                game.time.events.add(10000, this.endSpell, this);
            } else if (circle.data==="ssaa" && spellcaster.data.spellType==="w") {
                game.time.events.add(150, warpForward, this, spellcaster.animations.currentAnim.name, (spellcaster.scale.x>0));
                var touching = false;
                function warpForward (a, facingRight) {
                    if (a==="up") {
                        spellcaster.centerY-=48;/*
                        game.physics.arcade.overlap(spellcaster, wallLayer, touchingWall, null, this);
                        while (touching) {
                            spellcaster.centerY++; touching=false;
                            game.physics.arcade.overlap(spellcaster, wallLayer, touchingWall, null, this);
                        }//*/
                    }
                    else if (a==="upSide" && facingRight) {spellcaster.centerY-=32; spellcaster.centerX+=32;}
                    else if (a==="side" && facingRight) {spellcaster.centerX+=48;}
                    else if (a==="downSide" && facingRight) {spellcaster.centerY+=32; spellcaster.centerX+=32;}
                    else if (a==="down") {spellcaster.centerY+=48;}
                    else if (a==="downSide") {spellcaster.centerY+=32; spellcaster.centerX-=32;}
                    else if (a==="side") {spellcaster.centerX-=48;}
                    else if (a==="upSide") {spellcaster.centerY-=32; spellcaster.centerX-=32;}
                }
                function touchingWall (sc, wall) { if (wall.index>=0) touching = true; }
                game.time.events.add(150, this.endSpell, this);
            }
        },
        endSpell: function () {
            if (circle.data==="awdd" && spellcaster.data.spellType==="s") {
                var sign=1;   if (spellcaster.scale.x<0) sign=-1;
                game.add.tween(spellcaster.scale).to({x:.75*sign}, 1000, "Linear", true);
                game.add.tween(spellcaster.scale).to({y:.75}, 1000, "Linear", true);
            } else if (circle.data==="adad" && spellcaster.data.spellType==="s") {
                game.add.tween(decorLayer).to({alpha:1}, 1000, "Linear", true);
            } else if (circle.data==="sasa" && spellcaster.data.spellType==="d") {
                for (var i = 0; i < enemies.length; i++)
                    enemies[i].data.lineOfSight.forEachExists(fadeDot, this);
                function fadeDot (dot) {game.add.tween(dot).to({alpha:0}, 1000, "Linear", true);}
            }
            spellcaster.data.spellInUse=false;  circle.data="";  spellcaster.data.spellType="";
        },
        moveSpellcaster: function () {
            textFinal.x = spellcaster.x; textFinal.y = spellcaster.y;
            game.physics.arcade.collide(spellcaster, wallLayer);
            game.physics.arcade.overlap(spellcaster, enemies, this.touchingEnemy, null, this);
            var a = spellcaster.animations.currentAnim;
            if (cursors.up.isDown) {
                if ((cursors.left.isDown || cursors.right.isDown) && (a.name!=="upSide" || !a.isPlaying))
                    spellcaster.play('upSide', spellcaster.data.speed);
                else if (!(cursors.left.isDown || cursors.right.isDown) && (a.name!=="up" || !a.isPlaying))
                    spellcaster.play('up', spellcaster.data.speed);
            } else if (cursors.down.isDown) {
                if ((cursors.left.isDown || cursors.right.isDown) && (a.name!=="downSide" || !a.isPlaying))
                    spellcaster.play('downSide', spellcaster.data.speed);
                else if (!(cursors.left.isDown || cursors.right.isDown) && (a.name!=="down" || !a.isPlaying))
                    spellcaster.play('down', spellcaster.data.speed);
            } else if ((cursors.left.isDown || cursors.right.isDown) && (a.name!=="side" || !a.isPlaying))
                spellcaster.play('side', spellcaster.data.speed);
            if (cursors.left.isDown && spellcaster.scale.x > 0 && !cursors.right.isDown || cursors.right.isDown && spellcaster.scale.x < 0)
                spellcaster.scale.x = -spellcaster.scale.x;

            var speed = spellcaster.data.speed*11;
            if (cursors.up.isDown) spellcaster.body.velocity.y = -speed;
            else if (cursors.down.isDown) spellcaster.body.velocity.y = speed;
            else spellcaster.body.velocity.y = 0;
            if (cursors.right.isDown) spellcaster.body.velocity.x = speed;
            else if (cursors.left.isDown) spellcaster.body.velocity.x = -speed;
            else spellcaster.body.velocity.x = 0;
            if (cursors.up.isDown && cursors.left.isDown || cursors.up.isDown && cursors.right.isDown ||
                    cursors.down.isDown && cursors.left.isDown || cursors.down.isDown && cursors.right.isDown) {
                spellcaster.body.velocity.x *= .75;
                spellcaster.body.velocity.y *= .75;
            }
            circle.centerX = spellcaster.centerX;   circle.centerY = spellcaster.centerY+spellcaster.height/2-3;
        },
        touchingEnemy: function (sc, enemy) {
            if (sc.centerY+sc.height/2 < enemy.centerY+enemy.height/2 && sc.z > enemy.z) sprites.swap(sc, enemy);
            else if (sc.centerY+sc.height/2 > enemy.centerY+enemy.height/2 && sc.z < enemy.z) sprites.swap(sc, enemy);
            if (Math.abs(sc.centerY-enemy.centerY)<15 && Math.abs(sc.centerX-enemy.centerX)<15) {
                for (var i = 0; i < enemies.length; i++)
                    enemies[i].body.velocity.set(0);
                gameOver = true; lightning.alpha = 0; lightning.tint = 0x000000;
                game.add.tween(lightning).to({alpha:1}, 5000, "Linear", true);
                game.time.events.add(5000, quitGame, this);
            }
        },
        killEnemy: function (enemy) {
            enemy.data.collisionBoxes.destroy();
            enemy.destroy();
            for (var i = 0; i < enemies.length; i++)
                if (enemy === enemies[i]) enemies.splice(i,1);
            if (enemies.length===0) textFinal.alpha = 1;
        },
        moveEnemies: function () {
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i]; var b = enemy.data.collisionBoxes; var m=13;
                if (enemy.data.dying) return;
                game.physics.arcade.overlap(enemy, deathMark, deathCheck, null, this);
                function deathCheck (e, mark) {
                    if (Math.abs(e.centerY-mark.centerY)<15 && Math.abs(e.centerX-mark.centerX)<15) {
                        e.body.velocity.set(0);
                        game.add.tween(e).to({alpha:0}, 3000, "Linear", true);
                        game.time.events.add(3000, this.killEnemy, this, e);
                    }
                }
                var a = enemy.animations.currentAnim;
                var distanceX = spellcaster.centerX - enemy.centerX;
                var distanceY = spellcaster.centerY - enemy.centerY;
                var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                var angle = game.math.radToDeg(Math.atan2(distanceY, distanceX));
                if (distance > 200) enemy.data.lineOfSight.setAll('tint', 0x0066ff);
                else enemy.data.lineOfSight.setAll('tint', 0x00ff00);
                if (a.name==="right" && (angle < -70 || angle > 70)) enemy.data.lineOfSight.setAll('tint', 0xffff00);
                else if (a.name==="left" && (angle<110 && angle>-110)) enemy.data.lineOfSight.setAll('tint', 0xffff00);
                else if (a.name==="up" && !(angle<-20 && angle>-160)) enemy.data.lineOfSight.setAll('tint', 0xffff00);
                else if (a.name==="down" && !(angle<160 && angle>20)) enemy.data.lineOfSight.setAll('tint', 0xffff00);
                enemy.data.lineOfSight.forEachExists(resetDot, this);
                function resetDot (dot) {
                    dot.reset(enemy.centerX+distanceX*dot.z/20, enemy.centerY+distanceY*dot.z/20);
                    game.physics.arcade.overlap(dot, wallLayer, sightCheck, null, this);
                } function sightCheck (dot, wall) { if (wall.index>=0) enemy.data.lineOfSight.setAll('tint', 0x0066ff); }
                if (enemy.data.lineOfSight.children[0].tint===0x00ff00 && !enemy.data.seeSC) {
                    enemy.data.seeSC = true;
                    //console.log("!");
                } else if (enemy.data.lineOfSight.children[0].tint!==0x00ff00) {
                    enemy.data.seeSC = false;
                }
                if (enemy.data.seeSC) {
                    enemy.data.moveList = [];
                    if (angle >= -45 && angle <= 45) enemy.data.moveList.push(1);
                    else if (angle<-45 && angle>-135) enemy.data.moveList.push(3);
                    else if (angle<135 && angle>45) enemy.data.moveList.push(4);
                    else enemy.data.moveList.push(2);
                    switch (enemy.data.moveList[0]) {
                        case 1: if (angle < 0) enemy.data.moveList.push(3); else enemy.data.moveList.push(4); break;
                        case 2: if (angle < 0) enemy.data.moveList.push(3); else enemy.data.moveList.push(4); break;
                        case 3: if (angle > -90) enemy.data.moveList.push(1); else enemy.data.moveList.push(2); break;
                        case 4: if (angle < 90) enemy.data.moveList.push(1); else enemy.data.moveList.push(2); break;
                    }
                } else if (enemy.data.moveList.length!==0 && enemy.data.lineOfSight.children[0].tint===0xffff00) {
                    changeDirection();
                }
                updateHitBoxes();
                game.physics.arcade.collide(enemy, wallLayer);
                // Potentially change direction if a new path opens to enemy's side.
                function pathOpened (b1,b2,b3) { if (b1>0 && b1<=20 && b1<b2 && b2<b3) {b1+=20; return true;} return false;}
                if (a.name==="right" && (pathOpened(b.upLeft.data,b.up.data,b.upRight.data) ||
                          pathOpened(b.downLeft.data,b.down.data,b.downRight.data))) changeDirection();
                else if (a.name==="left" && (pathOpened(b.upRight.data,b.up.data,b.upLeft.data) ||
                          pathOpened(b.downRight.data,b.down.data,b.downLeft.data))) changeDirection();
                else if (a.name==="up" && (pathOpened(b.rightDown.data,b.right.data,b.rightUp.data) ||
                          pathOpened(b.leftDown.data,b.left.data,b.leftUp.data))) changeDirection();
                else if (a.name==="down" && (pathOpened(b.rightUp.data,b.right.data,b.rightDown.data) ||
                          pathOpened(b.leftUp.data,b.left.data,b.leftDown.data))) changeDirection();
                // Change direction if blocked in front.
                function pathCheck (b1,b2,b) {return (b1===0 || b2===0 || b===0);}
                if (a.name==="right" && pathCheck(b.rightUp.data,b.rightDown.data,b.right.data)) changeDirection();
                else if (a.name==="left" && pathCheck(b.leftUp.data,b.leftDown.data,b.left.data)) changeDirection();
                else if (a.name==="up" && pathCheck(b.upRight.data,b.upLeft.data,b.up.data)) changeDirection();
                else if (a.name==="down" && pathCheck(b.downRight.data,b.downLeft.data,b.down.data)) changeDirection();

                function changeDirection () {
                    enemy.body.velocity.set(0);   var r=1;
                    while (r>0 && !enemy.data.controlled) {
                        r = game.rnd.integerInRange(1, 4);
                        if (enemy.data.moveList.length>0) {r = enemy.data.moveList[0];  enemy.data.moveList.shift();}
                        if (r===1) r = tryDirection(b.rightUp.data, b.right.data, b.rightDown.data, true, 1, 1);
                        else if (r===2) r = tryDirection(b.leftUp.data, b.left.data, b.leftDown.data, true, -1, 2);
                        else if (r===3) r = tryDirection(b.upLeft.data, b.up.data, b.upRight.data, false, -1, 3);
                        else if (r===4) r = tryDirection(b.downLeft.data, b.down.data, b.downRight.data, false, 1, 4);
                    }
                }

                function tryDirection (b1,b,b2,side,sign,dir) {
                    if (b1>0 || b2>0) {   // Consider direction if there is an opening.
                        if (b1>0 && b2>0 && b>0) { // Nothing is blocked, go ahead and move.
                            if (side) enemy.body.velocity.x = enemy.data.speed*m*sign;
                            else enemy.body.velocity.y = enemy.data.speed*m*sign;
                        } else if (b1>0 && b2>0) { var d; // Blocked in middle; choose a perpendicular direction to move first.
                            if (enemy.data.moveList.length>0) { d = enemy.data.moveList[0];  enemy.data.moveList.shift(); }
                            else if (side) d = game.rnd.integerInRange(3, 4);
                            else d = game.rnd.integerInRange(1, 2);
                            enemy.data.moveList.unshift(dir);
                            if (d===1) enemy.body.velocity.x = enemy.data.speed*m;
                            else if (d===2) enemy.body.velocity.x = -enemy.data.speed*m;
                            else if (d===3) enemy.body.velocity.y = -enemy.data.speed*m;
                            else enemy.body.velocity.y = enemy.data.speed*m;
                        } else if (b1>0) { // Must move up (if moving left/right) or left (if moving up/down) to get to desired direction.
                            enemy.data.moveList.unshift(dir);
                            if (side) enemy.body.velocity.y = -enemy.data.speed*m;
                            else enemy.body.velocity.x = -enemy.data.speed*m;
                        } else { // Must move down (if moving left/right) or right (if moving up/down) to get to desired direction.
                            enemy.data.moveList.unshift(dir);
                            if (side) enemy.body.velocity.y = enemy.data.speed*m;
                            else enemy.body.velocity.x = enemy.data.speed*m;
                        } return 0;
                    } return 1;
                }

                if (enemy.data.controlled) {
                    enemy.body.velocity.set(0);
                    if (spellKeys.d.isDown) enemy.body.velocity.x = enemy.data.speed*m;
                    else if (spellKeys.a.isDown) enemy.body.velocity.x = -enemy.data.speed*m;
                    else if (spellKeys.w.isDown) enemy.body.velocity.y = -enemy.data.speed*m;
                    else if (spellKeys.s.isDown) enemy.body.velocity.y = enemy.data.speed*m;
                } else if (enemy.body.velocity.x===0 && enemy.body.velocity.y===0) {
                    if (a.name==="right") enemy.body.velocity.x = enemy.data.speed*m;
                    if (a.name==="left") enemy.body.velocity.x = -enemy.data.speed*m;
                    if (a.name==="up") enemy.body.velocity.y = -enemy.data.speed*m;
                    if (a.name==="down") enemy.body.velocity.y = enemy.data.speed*m;
                    changeDirection();
                }

                if (enemy.body.velocity.x > 0 && (a.name!=="right" || !a.isPlaying))
                    enemy.play('right', enemy.data.speed);
                else if (enemy.body.velocity.x < 0 && (a.name!=="left" || !a.isPlaying))
                    enemy.play('left', enemy.data.speed);
                else if (enemy.body.velocity.y < 0 && (a.name!=="up" || !a.isPlaying))
                    enemy.play('up', enemy.data.speed);
                else if (enemy.body.velocity.y > 0 && (a.name!=="down" || !a.isPlaying))
                    enemy.play('down', enemy.data.speed);
                function updateHitBoxes () {
                    b.upLeft.centerX = enemy.centerX-15-1;    b.upLeft.centerY = enemy.centerY-16-1;
                    b.upRight.centerX = enemy.centerX+16-1;   b.upRight.centerY = enemy.centerY-16-1;
                    b.downLeft.centerX = enemy.centerX-15-1;  b.downLeft.centerY = enemy.centerY+17-1;
                    b.downRight.centerX = enemy.centerX+16-1; b.downRight.centerY = enemy.centerY+17-1;
                    b.rightUp.centerX = enemy.centerX+17-1;   b.rightUp.centerY = enemy.centerY-15-1;
                    b.rightDown.centerX = enemy.centerX+17-1; b.rightDown.centerY = enemy.centerY+16-1;
                    b.leftUp.centerX = enemy.centerX-16-1;    b.leftUp.centerY = enemy.centerY-15-1;
                    b.leftDown.centerX = enemy.centerX-16-1;  b.leftDown.centerY = enemy.centerY+16-1;
                    b.up.centerX = enemy.centerX;             b.up.centerY = enemy.centerY-17;
                    b.down.centerX = enemy.centerX;           b.down.centerY = enemy.centerY+16;
                    b.left.centerX = enemy.centerX-17;        b.left.centerY = enemy.centerY;
                    b.right.centerX = enemy.centerX+16;       b.right.centerY = enemy.centerY;
                    game.physics.arcade.overlap(b.upLeft, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.upRight, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.downLeft, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.downRight, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.leftUp, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.leftDown, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.rightUp, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.rightDown, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.up, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.down, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.left, wallLayer, boxOverlap, null, this);
                    game.physics.arcade.overlap(b.right, wallLayer, boxOverlap, null, this);
                }
                function boxOverlap (box, wall) {
                    if (wall.index>=0) {box.tint=0xff0000;  box.data=0;}
                    else {box.tint=0xffffff;  box.data++;}
                }
            }
        },
        lightningStart: function () {
            if (gameOver) return;
						lightningTime = this.time.time+game.rnd.integerInRange(12000, 25000);
						var r = game.rnd.integerInRange(1, 4);
						var opacity;
						switch (r) {
								case 1: opacity = .75; break;
								case 2: opacity = .86; break;
								case 3: opacity = .97; break;
								case 4: opacity = .64;
						}
						game.add.tween(lightning).to({alpha:opacity}, 25, "Linear", true);
						game.time.events.add(125, this.lightningEnd, this);
						game.time.events.add(500, this.playThunder, this, r);
				},
				lightningEnd: function () { if (gameOver) return;  game.add.tween(lightning).to({alpha:0}, 25, "Linear", true);	},
				playThunder: function (num) {	thunder.play("thunder"+num); },
    }; return mainGame;
};
