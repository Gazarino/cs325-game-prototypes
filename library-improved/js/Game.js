"use strict";

GameStates.makeGame = function( game, shared ) {

    var music, cursors, spellKeys;
    var lightning = null, lightningTime = null, thunder = null, rain = null;
    var map, floorLayer, wallLayer, decorLayer;
    var spellcaster, circle, spellbook, textBook, enemies, sprites, tag, decoy, reticle, aimArea, electricity, shockMarks;
    var gameOver, textFinal, mana, manaEmpty, manaTop, manaBottom, textInfo, cropRect, cost, enemySight, enemySpeed;
    var specialEvent, bookShelf, textExamine, textSearch, searchEvent;
    var infoFrank, infoBird, infoSpell;

    function quitGame() {
        music.stop();  rain.stop();
        game.scale.setGameSize(320, 320);
        game.state.start('MainMenu');
    }

    var mainGame = {
        create: function () {
            gameOver = false;
            cursors = game.input.keyboard.createCursorKeys();
            spellKeys = game.input.keyboard.addKeys( {'a': Phaser.KeyCode.A, 'w': Phaser.KeyCode.W,
                                                      'h': Phaser.KeyCode.H, 'e': Phaser.KeyCode.E,
                                                      's': Phaser.KeyCode.S, 'd': Phaser.KeyCode.D, 'x': Phaser.KeyCode.X } );
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);

            music = game.add.audio('music');
            music.loopFull(1);

            map = game.add.tilemap('map');
            map.addTilesetImage('custom_FF5_spritesheet');
            floorLayer = map.createLayer('Floor');
            circle = game.add.sprite(0,0,'circle');   circle.alpha = 0;
            circle.animations.add('spin', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
            tag = game.add.sprite(0, 0, 'tag');   tag.alpha = 0;
            wallLayer = map.createLayer('Walls');
            wallLayer.resizeWorld();
            map.setCollision([5,6,7,15,16,17,25,26,27,35,36,45,46], true, wallLayer);

            sprites = game.add.group();
            decoy = game.add.sprite(0, 0, 'girl'+shared.char);   decoy.alpha = 0;
            decoy.scale.set(.75);   decoy.anchor.set(.5);
            game.physics.arcade.enable(decoy);    decoy.data = {controllable:false, speed:65, time:0};
            decoy.animations.add('up', [0,1,2,1]);          decoy.animations.add('upStill', [1]);
            decoy.animations.add('upSide', [3,4,5,4]);      decoy.animations.add('upSideStill', [4]);
            decoy.animations.add('side', [6,7,8,7]);        decoy.animations.add('sideStill', [7]);
            decoy.animations.add('downSide', [9,10,11,10]); decoy.animations.add('downSideStill', [10]);
            decoy.animations.add('down', [12,13,14,13]);    decoy.animations.add('downStill', [13]);
            sprites.add(decoy);
            spellcaster = game.add.sprite(400, 455, 'girl'+shared.char);
            spellcaster.scale.set(.75);   spellcaster.anchor.set(.5);
            spellcaster.data = {speed:65, spellInUse:false, spellType:"", stun:0, shock:null, specialInUse:false,
                                shrinkTime:0, revealTime:0, vanishTime:0, fadeTime:0, regenTime:0, regenRate:500};
            game.physics.arcade.enable(spellcaster);
            spellcaster.animations.add('up', [0,1,2,1]);
            spellcaster.animations.add('upSide', [3,4,5,4]);
            spellcaster.animations.add('side', [6,7,8,7]);
            spellcaster.animations.add('downSide', [9,10,11,10]);
            spellcaster.animations.add('down', [12,13,14,13]);
            sprites.add(spellcaster);

            enemies = [];   enemySight = 200;   enemySpeed = 80;
            enemies.push(createEnemy(1, 170, 170));
            enemies.push(createEnemy(2, 670, 170));
            function createEnemy (num, x, y) {
                var enemy = game.add.sprite(x, y, 'man'+num);
                enemy.data = {collisionBoxes:null, lineOfSight:game.add.physicsGroup(), seeSC:false, moveList:[], frogTimer:0, frog:null,
                          controlled:false, counter:0, dying:false, seeMark:null, distractCount:0, stun:0, shock:null, id:num, speech:null};
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
                sprites.add(enemy);
                return enemy;
            }
            reticle = game.add.sprite(0,0,'reticle');   reticle.alpha = 0;    game.physics.arcade.enable(reticle);
            aimArea = game.add.sprite(0, 0, 'dot');     aimArea.alpha=0;      aimArea.tint=0xffff00;
            electricity = game.add.sprite(0, 0, 'electricity'); electricity.alpha=0;  game.physics.arcade.enable(electricity);
            shockMarks = game.add.group();

            game.camera.follow(spellcaster);
            decorLayer = map.createLayer('Bookshelves'); //decorLayer.alpha=0;
            for (var i = 0; i < enemies.length; i++) {
                enemies[i].data.seeMark = game.add.sprite(0,0,'seeMark');  enemies[i].data.seeMark.alpha = 0;
                enemies[i].data.seeMark.animations.add('!', [0]);   enemies[i].data.seeMark.animations.add('?', [1]);
                enemies[i].data.seeMark.animations.add('..', [2]);
                enemies[i].data.speech = game.add.text(5, 5, "", {font:"9px Sitka Small", fill:"#ffffff", align:"center" });
                enemies[i].data.speech.anchor.setTo(.5,1);
            }

            textBook = game.add.text(5, 5, "Press H to close spellbook.", {font:"7px Sitka Small", fill:"#ffffff", align:"center" });
            spellbook = game.add.sprite(-50, 10, 'spellbook');
            manaBottom = game.add.sprite(0, 0, 'manaBottom');   manaTop = game.add.sprite(0, 0, 'manaTop');
            manaEmpty = game.add.sprite(0, 0, 'manaEmpty');     mana = game.add.sprite(0, 0, 'mana');
            cropRect = new Phaser.Rectangle(0, 0, 100, mana.height);   mana.crop(cropRect);

            rain = game.add.audio('rain');
            rain.loopFull(.5);
						thunder = game.add.audio('thunder');
						thunder.addMarker("thunder1", 0.2, 10.6);
						thunder.addMarker("thunder2", 14.4, 6.5);
						thunder.addMarker("thunder3", 21.7, 9.2);
						thunder.addMarker("thunder4", 31.1, 9.7);
						thunder.volume = .3;

            lightning = game.add.sprite(0, 0, 'lightning');
            lightning.scale.setTo(425,425);
						lightning.alpha = 0;
						lightningTime = this.time.time+game.rnd.integerInRange(12000, 25000);
            textInfo = game.add.text(240, 185, "", {font:"15px Sitka Small", fill:"#ffffff", align:"center" });
            textInfo.anchor.set(.5);
            textInfo.alpha = 0;
            textExamine = game.add.text(5, 5, "", {font:"9px Sitka Small", fill:"#ffffff", align:"center" });
            textExamine.anchor.set(.5);
            textSearch = game.add.text(5, 5, "", {font:"9px Sitka Small", fill:"#ffffff", align:"center" });
            textSearch.anchor.set(.5);
            textFinal = game.add.text(240, 185, "", {font:"22px Sitka Small", fill:"#ffffff", align:"center" });
            textFinal.anchor.set(.5);
            textFinal.alpha = 0;

            infoFrank = {found:false, loc:game.rnd.integerInRange(1,18)};
            infoBird = {found:false, loc:game.rnd.integerInRange(1,18)};
            infoSpell = {found:false, loc:game.rnd.integerInRange(1,18)};
            infoFrank.loc=1; infoBird.loc=1; infoSpell.loc=1;
            //console.log(infoFrank.loc+", "+infoBird.loc+", "+infoSpell.loc);
            while (infoFrank.loc===infoBird.loc) infoBird.loc = game.rnd.integerInRange(1,18);
            while (infoSpell.loc===infoBird.loc || infoSpell.loc===infoFrank.loc) infoSpell.loc = game.rnd.integerInRange(1,18);
        },

        update: function () {
            this.alignWithCamera();   this.evalBookshelves();
            sprites.sort('y', Phaser.Group.SORT_ASCENDING);
            game.physics.arcade.overlap(spellcaster, enemies, this.touchingEnemy, null, this);
            if (!gameOver) this.moveSpellcaster();
            if (!gameOver) this.moveEnemies();
            if (!gameOver) this.analyzeSpellInput();
            if (spellcaster.scale.y===.5 && this.time.time>spellcaster.data.shrinkTime) this.endShrink();
            if (decorLayer.alpha===.5 && this.time.time>spellcaster.data.fadeTime) game.add.tween(decorLayer).to({alpha:1}, 1000, "Linear", true);
            if (decoy.alpha===.75 && this.time.time>decoy.data.time) game.add.tween(decoy).to({alpha:0}, 1000, "Linear", true);
            if (spellcaster.alpha===0 && this.time.time>spellcaster.data.vanishTime) game.add.tween(spellcaster).to({alpha:1}, 1000, "Linear", true);
            if (enemies[0] && enemies[0].data.lineOfSight.children[0] && enemies[0].data.lineOfSight.children[0].alpha===1 &&
                    this.time.time>spellcaster.data.revealTime)
                for (var i = 0; i < enemies.length; i++)
                    enemies[i].data.lineOfSight.forEachExists(this.fadeObj, this);
            if (cropRect.width<100 && this.time.time>spellcaster.data.regenTime && !spellcaster.data.spellInUse && !spellcaster.data.specialInUse) {
                cropRect.width++;   mana.updateCrop();   spellcaster.data.regenTime=this.time.time+spellcaster.data.regenRate;
            }
            if (this.time.time > lightningTime)	this.lightningStart();

        },
        alignWithCamera: function () {
            manaBottom.x = game.camera.x;   manaBottom.y = game.camera.y+game.height-manaBottom.height;
            manaTop.x = game.camera.x;      manaTop.y = game.camera.y+game.height-manaTop.height;
            manaEmpty.x = game.camera.x+13; manaEmpty.y = game.camera.y+game.height-25;
            mana.x = game.camera.x+13;      mana.y = game.camera.y+game.height-25;
            textInfo.x = game.camera.x+game.width/2; textInfo.y = game.camera.y+game.height/2;
            textExamine.x = game.camera.x+game.width/2; textExamine.y = game.camera.y+50;
            textSearch.x = game.camera.x+game.width/2; textSearch.y = game.camera.y+game.height/2-50;
            textFinal.x = game.camera.x+game.width/2; textFinal.y = game.camera.y+game.height/2;
            textBook.x = game.camera.x+5;   textBook.y = game.camera.y+4;
            spellbook.x = game.camera.x-105;spellbook.y = game.camera.y;
            lightning.x = game.camera.x-5;  lightning.y = game.camera.y-5;
        },
        analyzeSpellInput: function () {
            if (spellKeys.h.downDuration(1)) {
                if (spellbook.alpha==0) {textBook.text="Press H to close spellbook.";  spellbook.alpha=1;}
                else {textBook.text="Press H to open spellbook.";  spellbook.alpha=0;}
            }
            if (spellKeys.e.downDuration(1) && textExamine!=="") {
                textSearch.text = "Searching...";
                searchEvent = game.time.events.add(3000, this.finishSearch, this);
            }
            if (circle.alpha===0 && !spellcaster.data.spellInUse && spellcaster.data.stun<=0 && !spellcaster.data.specialInUse) {
                if (spellKeys.w.isDown) circle.tint = 0xcc33ff;
                else if (spellKeys.a.isDown) circle.tint = 0xffa33a;
                else if (spellKeys.s.isDown) circle.tint = 0x3385ff;
                else if (spellKeys.d.isDown) circle.tint = 0x33ff33;
                if (circle.tint===0xffa33a) {reticle.centerX = spellcaster.centerX;  reticle.centerY = spellcaster.centerY;}
                if (spellKeys.w.isDown || spellKeys.a.isDown || spellKeys.s.isDown || spellKeys.d.isDown) {
                    spellcaster.data.spellInUse = true;  circle.play('spin', 12, true);  circle.data = "";
                    game.add.tween(circle).to({alpha:1}, 1000, "Linear", true);
                }
            }
            if (circle.tint===0xffa33a && circle.alpha>0) reticle.alpha=1; else reticle.alpha=0;
            if (circle.alpha===1 && (circle.tint===0xcc33ff && !spellKeys.w.isDown || circle.tint===0xffa33a && !spellKeys.a.isDown
                                  || circle.tint===0x3385ff && !spellKeys.s.isDown || circle.tint===0x33ff33 && !spellKeys.d.isDown)) {
                spellcaster.data.spellInUse = false;  game.add.tween(circle).to({alpha:0}, 500, "Linear", true);
            }
            if (circle.tint===0xcc33ff && circle.alpha>0 && circle.data.length < 4 && spellcaster.data.spellInUse) {
                if (spellKeys.a.downDuration(1)) circle.data+="a";
                else if (spellKeys.s.downDuration(1)) circle.data+="s";
                else if (spellKeys.d.downDuration(1)) circle.data+="d";
            } else if (circle.tint===0xffa33a && circle.alpha>0 && circle.data.length < 4 && spellcaster.data.spellInUse) {
                if (spellKeys.w.downDuration(1)) circle.data+="w";
                else if (spellKeys.s.downDuration(1)) circle.data+="s";
                else if (spellKeys.d.downDuration(1)) circle.data+="d";
            } else if (circle.tint===0x3385ff && circle.alpha>0 && circle.data.length < 4 && spellcaster.data.spellInUse) {
                if (spellKeys.w.downDuration(1)) circle.data+="w";
                else if (spellKeys.a.downDuration(1)) circle.data+="a";
                else if (spellKeys.d.downDuration(1)) circle.data+="d";
            } else if (circle.tint===0x33ff33 && circle.alpha>0 && circle.data.length < 4 && spellcaster.data.spellInUse) {
                if (spellKeys.w.downDuration(1)) circle.data+="w";
                else if (spellKeys.a.downDuration(1)) circle.data+="a";
                else if (spellKeys.s.downDuration(1)) circle.data+="s";
            }
            if (circle.data==="swsd" && circle.tint===0xffa33a)
                {decoy.centerX = reticle.centerX;   decoy.centerY = reticle.centerY;}
            if (circle.alpha===0) aimArea.alpha = 0;
            if (aimArea.alpha>0) {
                aimArea.width=reticle.centerX-aimArea.x;  aimArea.height=reticle.centerY-aimArea.y;
                if (Math.abs(aimArea.width*aimArea.height)>30000) aimArea.tint = 0xff0000;
                else aimArea.tint = 0xffff00;
            }
            if (circle.data==="ss" && circle.tint===0xffa33a && aimArea.alpha===0) {
                aimArea.alpha = .5;   aimArea.width=1;    aimArea.height=1;   aimArea.tint = 0xffff00;
                aimArea.centerX = reticle.centerX;   aimArea.centerY = reticle.centerY;
            }

            if (circle.data.length===4 && circle.tint!==0xffffff) {
                if (circle.tint===0xcc33ff) spellcaster.data.spellType="w";
                else if (circle.tint===0xffa33a) spellcaster.data.spellType="a";
                else if (circle.tint===0x3385ff) spellcaster.data.spellType="s";
                else if (circle.tint===0x33ff33) spellcaster.data.spellType="d";
                circle.tint = 0xffffff;  circle.animations.stop();  this.startSpell();
                game.time.events.add(250, this.fadeCircle, this);
            }
            if (spellKeys.x.downDuration(1)) { this.cancelSpecial(); }
        },
        fadeCircle: function () {game.add.tween(circle).to({alpha:0}, 500, "Linear", true);},
        startSpell: function () {   spellcaster.data.specialInUse = false;
            if (circle.data==="wdwa" && spellcaster.data.spellType==="s") { cost = 20;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                var sign=1;   if (spellcaster.scale.x<0) sign=-1;
                game.add.tween(spellcaster.scale).to({x:.5*sign}, 1000, "Linear", true);
                game.add.tween(spellcaster.scale).to({y:.5}, 1000, "Linear", true);
                spellcaster.data.shrinkTime = this.time.time+10000;
            } else if (circle.data==="sawa" && spellcaster.data.spellType==="d") { cost = 25;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                game.add.tween(decorLayer).to({alpha:.5}, 1000, "Linear", true);
                spellcaster.data.fadeTime = this.time.time+15000;
            } else if (circle.data==="asas" && spellcaster.data.spellType==="d") { cost = 25;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                for (var i = 0; i < enemies.length; i++)
                    enemies[i].data.lineOfSight.forEachExists(fadeDot, this);
                function fadeDot (dot) {game.add.tween(dot).to({alpha:1}, 1000, "Linear", true);}
                spellcaster.data.revealTime = this.time.time+12000;
            } else if (circle.data==="ssws" && spellcaster.data.spellType==="d") { cost = 35;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                game.add.tween(spellcaster).to({alpha:0}, 1000, "Linear", true);
                spellcaster.data.vanishTime = this.time.time+6000;
            } else if (circle.data==="sasd" && spellcaster.data.spellType==="w") { cost = 35;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                var offScreen = (tag.x+tag.width<game.camera.x || tag.x>=game.camera.x+game.width ||
                                tag.y+tag.height<game.camera.y || tag.y>=game.camera.y+game.height);
                if (tag.alpha===0 || offScreen) {
                    tag.centerX = spellcaster.centerX;    tag.centerY = spellcaster.centerY+10;   tag.alpha=0;
                    game.add.tween(tag).to({alpha:1}, 1000, "Linear", true);
                } else {
                    game.time.events.add(150, warpToTag, this);
                    function warpToTag () { if (gameOver) return;   this.alignWithCamera();
                        spellcaster.centerX = tag.centerX;  spellcaster.centerY = tag.centerY-10;  tag.alpha = 0;
                    }
                }
            } else if (circle.data==="ssaa" && spellcaster.data.spellType==="w") { cost = 30;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                game.time.events.add(150, warpForward, this, spellcaster.animations.currentAnim.name, (spellcaster.scale.x>0));
                function warpForward (a, facingRight) { if (gameOver) return;  this.alignWithCamera();
                    var dist = 49+spellcaster.height;  if (a.includes("Side")) dist-=16;
                    if (a==="up") {
                        spellcaster.centerY-=dist;
                        while (this.collidingWithWall(spellcaster))
                            spellcaster.centerY++;
                    } else if (a==="upSide" && facingRight) {
                        spellcaster.centerY-=dist; spellcaster.centerX+=dist;
                        while (this.collidingWithWall(spellcaster))
                            {spellcaster.centerY++; spellcaster.centerX--;}
                    } else if (a==="side" && facingRight) {
                        spellcaster.centerX+=dist;
                        while (this.collidingWithWall(spellcaster))
                            spellcaster.centerX--;
                    } else if (a==="downSide" && facingRight) {
                        spellcaster.centerY+=dist; spellcaster.centerX+=dist;
                        while (this.collidingWithWall(spellcaster))
                            {spellcaster.centerY--; spellcaster.centerX--;}
                    } else if (a==="down") {
                        spellcaster.centerY+=dist;
                        while (this.collidingWithWall(spellcaster))
                            spellcaster.centerY--;
                    } else if (a==="downSide") {
                        spellcaster.centerY+=dist; spellcaster.centerX-=dist;
                        while (this.collidingWithWall(spellcaster))
                            {spellcaster.centerY--; spellcaster.centerX++;}
                    } else if (a==="side") {
                        spellcaster.centerX-=dist;
                        while (this.collidingWithWall(spellcaster))
                            spellcaster.centerX++;
                    } else if (a==="upSide") {
                        spellcaster.centerY-=dist; spellcaster.centerX-=dist;
                        while (this.collidingWithWall(spellcaster))
                            {spellcaster.centerY++; spellcaster.centerX++;}
                    }
                }
            } else if (circle.data==="swsd" && spellcaster.data.spellType==="a") { cost = 50;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (this.collidingWithWall(decoy)) { end("Cannot place decoy\ninside a wall."); return; }
                decoy.data.controllable = false;   game.add.tween(decoy).to({alpha:.75}, 1000, "Linear", true);
                decoy.data.time = this.time.time+10000;
            } else if (circle.data==="ssdd" && spellcaster.data.spellType==="a") { cost = 60;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (aimArea.tint===0xff0000) { end("Area of effect too large."); return; }
                electricity.alpha = 1;    aimArea.alpha = 0;
                electricity.x = aimArea.x;  electricity.y = aimArea.y;
                electricity.width = aimArea.width;    electricity.height = aimArea.height;
                game.time.events.add(500, this.fadeObj, this, electricity);
            } else if (circle.data==="aadw" && spellcaster.data.spellType==="s" && infoSpell.found) { cost = 30;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                var closest = null, shortestDist = 333;
                for (var i = 0; i < enemies.length; i++) {  var e = enemies[i];
                    if (e && e.data && e.data.seeSC) {
                        var distanceX = spellcaster.centerX-e.centerX;
                        var distanceY = spellcaster.centerY-e.centerY;
                        var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                        if (distance<shortestDist) {shortestDist=distance;  closest=e;}
                    }
                } if (closest===null) { end("No one sees you."); return; }
                closest.data.stun = 200;
                game.time.events.add(500, startSpeech, this, closest);    game.time.events.add(3500, endSpeech, this, closest);
                function startSpeech(e) {
                    if (e.data.id!==2) e.data.speech.text = "I'm not responsible\nfor anything!";
                    else if (spellcaster.scale.y>.5) e.data.speech.text = "I'm not responsible\nfor anyone your size...";
                    else if (!infoBird.found) e.data.speech.text = "Grr..! I won't be\nsealed away by someone\nwho knows nothing\nabout me!";
                    else {  e.data.dying = true;   game.add.tween(e).to({alpha:0}, 8000, "Linear", true);
                        e.data.speech.text = "No... What are you trying\nto say, looking like that?!\nI want to be free,\nnot tried down to...\n...a baby...";
                    }
                }
                function endSpeech(e) { if (!e.data.dying) e.data.speech.text = ""; }
            } else if (circle.data==="awda" && spellcaster.data.spellType==="s") { cost = 75;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (shared.char===1) {
                    var applied = false;
                    for (var i = 0; i < enemies.length; i++) {
                        var e = enemies[i];
                        if (e && e.data && e.data.seeSC) {
                            e.data.frogTimer = 5000;    e.data.frog = game.add.sprite(e.centerX,e.centerY+7,'frog');
                            sprites.add(e.data.frog);   e.data.frog.alpha=0;   e.data.frog.anchor.set(.5);  e.data.frog.scale.set(.5);
                            e.data.frog.animations.add('down', [0]);  e.data.frog.animations.add('right', [1]);
                            e.data.frog.animations.add('up', [2]);  e.data.frog.animations.add('left', [3]);
                            e.data.frog.play(e.animations.currentAnim.name);
                            game.add.tween(e.data.frog).to({alpha:1}, 1000, "Linear", true);
                            game.add.tween(e).to({alpha:0}, 1000, "Linear", true);  applied = true;
                        }
                    } if (!applied) { end("No one sees you."); return; }
                } else if (shared.char===2) {
                    var closest = null, shortestDist = 333;
                    for (var i = 0; i < enemies.length; i++) {
                        var e = enemies[i], line = null;
                        if (e && e.data)  line = e.data.lineOfSight.children[0];
                        if (line && (line.tint===0x00ff00 || line.tint===0xffff00)) {
                            var distanceX = spellcaster.centerX-e.centerX;
                            var distanceY = spellcaster.centerY-e.centerY;
                            var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                            if (distance<shortestDist) {shortestDist=distance;  closest=e;}
                        }
                    } if (closest===null) { end("Enemy not in clear view."); return; }
                    closest.data.controlled = true;
                } else if (shared.char===3) {
                    spellcaster.data.speed = 130;
                } else {  decoy.centerX = spellcaster.centerX;  decoy.centerY = spellcaster.centerY;
                    decoy.data.controllable = true;   game.add.tween(decoy).to({alpha:.75}, 1000, "Linear", true);
                    decoy.data.time = this.time.time+15000;
                }  spellcaster.data.specialInUse = true;
                specialEvent = game.time.events.add(15000, this.cancelSpecial, this);
            } else { end("Spell not recognized."); return; }
            this.endSpell();
            function end(s) {
                textInfo.text = s;  textInfo.alpha = 1;  spellcaster.data.spellType="NaN";  circle.tint = 0xff0000;
                game.time.events.add(2000, mainGame.fadeObj, this, textInfo);   cost=0;  mainGame.endSpell();
            }
        },
        cancelSpecial: function () {
            if (shared.char===1) {
                for (var i = 0; i < enemies.length; i++)
                    if (enemies[i]) enemies[i].data.frogTimer = 0;
            } else if (shared.char===2) {
                for (var i = 0; i < enemies.length; i++)
                    if (enemies[i]) enemies[i].data.controlled = false;
            } else if (shared.char===3) {
                spellcaster.data.speed = 65;
            } else {
                decoy.data.time = this.time.time-1;
            }
            game.time.events.remove(specialEvent);
            spellcaster.data.specialInUse = false;
        },
        windowResize: function (size) {
            game.scale.setGameSize(size, size);         floorLayer.resize(game.width, game.height);
            wallLayer.resize(game.width, game.height);  decorLayer.resize(game.width, game.height);
        },
        fadeObj: function (obj) {game.add.tween(obj).to({alpha:0}, 1000, "Linear", true);},
        collidingWithWall: function (sc) { var w = Math.abs(sc.width/2)-1, h = sc.height/2-1, scX=sc.centerX, scY=sc.centerY;
            return (this.idAt(scX-w,scY-h)>=0 || this.idAt(scX,scY-h)>=0 || this.idAt(scX+w,scY-h)>=0 ||
                    this.idAt(scX-w,scY+h)>=0 || this.idAt(scX,scY+h)>=0 || this.idAt(scX+w,scY+h)>=0 ||
                    this.idAt(scX-w,scY)>=0 || this.idAt(scX+w,scY)>=0);
        },
        endShrink: function () {
            if (spellcaster.centerY<160) {
                spellcaster.data.shrinkTime = this.time.time+1000;
            } else {
                var sign=1;   if (spellcaster.scale.x<0) sign=-1;
                game.add.tween(spellcaster.scale).to({x:.75*sign}, 1000, "Linear", true);
                game.add.tween(spellcaster.scale).to({y:.75}, 1000, "Linear", true);
            }
        },
        endSpell: function () {
            this.windowResize(320);  enemySpeed=80;   enemySight=200;   spellcaster.data.regenRate=500;
            if (spellcaster.data.spellType!=="NaN") {
                if (manaTop.tint===0xcc33ff && spellcaster.data.spellType!=="w")  enemySpeed-=4;
                if (manaBottom.tint===0xcc33ff && spellcaster.data.spellType!=="w")  enemySpeed-=4;
                if (manaTop.tint===0xffa33a && spellcaster.data.spellType!=="a")  this.windowResize(game.width+=48);
                if (manaBottom.tint===0xffa33a && spellcaster.data.spellType!=="a")  this.windowResize(game.width+=48);
                if (manaTop.tint===0x3385ff && spellcaster.data.spellType!=="s")  spellcaster.data.regenRate-=50;
                if (manaBottom.tint===0x3385ff && spellcaster.data.spellType!=="s")  spellcaster.data.regenRate-=50;
                if (manaTop.tint===0x33ff33 && spellcaster.data.spellType!=="d")  enemySight-=25;
                if (manaBottom.tint===0x33ff33 && spellcaster.data.spellType!=="d")  enemySight-=25;
            }
            cropRect.width -= cost;    mana.updateCrop();
            manaBottom.tint = manaTop.tint;
            if (spellcaster.data.spellType==="w") manaTop.tint = 0xcc33ff;
            else if (spellcaster.data.spellType==="a") manaTop.tint = 0xffa33a;
            else if (spellcaster.data.spellType==="s") manaTop.tint = 0x3385ff;
            else if (spellcaster.data.spellType==="d") manaTop.tint = 0x33ff33;
            else manaTop.tint = 0xff0000;
            spellcaster.data.spellInUse=false;  circle.data="";  spellcaster.data.spellType="";   reticle.alpha=0;
        },
        moveSpellcaster: function () {  var speed = 150;
            game.physics.arcade.collide(spellcaster, wallLayer);
            if (reticle.alpha===0) {
                this.changeAnimation(spellcaster,cursors.up,cursors.down,cursors.left,cursors.right);
                speed = spellcaster.data.speed;
            }
            spellcaster.body.velocity.x = 0;    spellcaster.body.velocity.y = 0;
            decoy.body.velocity.x = 0;          decoy.body.velocity.y = 0;
            reticle.body.velocity.x = 0;        reticle.body.velocity.y = 0;
            if (cursors.up.isDown && reticle.alpha===0) spellcaster.body.velocity.y = -speed;
            else if (cursors.up.isDown) reticle.body.velocity.y = -speed;
            else if (cursors.down.isDown && reticle.alpha===0) spellcaster.body.velocity.y = speed;
            else if (cursors.down.isDown) reticle.body.velocity.y = speed;

            if (cursors.right.isDown && reticle.alpha===0) spellcaster.body.velocity.x = speed;
            else if (cursors.right.isDown) reticle.body.velocity.x = speed;
            else if (cursors.left.isDown && reticle.alpha===0) spellcaster.body.velocity.x = -speed;
            else if (cursors.left.isDown) reticle.body.velocity.x = -speed;

            if (cursors.up.isDown && cursors.left.isDown || cursors.up.isDown && cursors.right.isDown ||
                    cursors.down.isDown && cursors.left.isDown || cursors.down.isDown && cursors.right.isDown) {
                spellcaster.body.velocity.x *= .7;
                spellcaster.body.velocity.y *= .7;
            }
            if (decoy.alpha>0 && !decoy.data.controllable) {
                decoy.play(spellcaster.animations.currentAnim.name+"Still", 1);
                decoy.scale.x = spellcaster.scale.x;  decoy.scale.y = spellcaster.scale.y;
            } else if (decoy.alpha>0) {
                game.physics.arcade.collide(decoy, wallLayer);
                if (spellKeys.w.isDown) decoy.body.velocity.y = -speed;
                else if (spellKeys.s.isDown) decoy.body.velocity.y = speed;
                if (spellKeys.d.isDown) decoy.body.velocity.x = speed;
                else if (spellKeys.a.isDown) decoy.body.velocity.x = -speed;
                if (spellKeys.w.isDown && spellKeys.a.isDown || spellKeys.w.isDown && spellKeys.d.isDown ||
                        spellKeys.s.isDown && spellKeys.a.isDown || spellKeys.s.isDown && spellKeys.d.isDown) {
                    decoy.body.velocity.x *= .7;
                    decoy.body.velocity.y *= .7;
                } this.changeAnimation(decoy,spellKeys.w,spellKeys.s,spellKeys.a,spellKeys.d);
            }
            circle.centerX = spellcaster.centerX;   circle.centerY = spellcaster.centerY+spellcaster.height/2-3;
            if (decoy.alpha>0) {
                game.physics.arcade.overlap(spellcaster, decoy, decoyLayerCheck, null, this);
                game.physics.arcade.overlap(enemies, decoy, decoyLayerCheck, null, this);
            }
            function decoyLayerCheck (e, d) {
                if (d.centerY+d.height/2 < e.centerY+e.height/2 && d.z > e.z) sprites.swap(d, e);
                else if (d.centerY+d.height/2 > e.centerY+e.height/2 && d.z < e.z) sprites.swap(d, e);
            }
            game.physics.arcade.overlap(spellcaster, electricity, this.stunCheck, null, this);
            if (spellcaster.data.stun>0) {spellcaster.data.stun--;  spellcaster.body.velocity.set(0);}
            else if (spellcaster.data.shock) spellcaster.data.shock.destroy();
        },
        changeAnimation: function (sc, u, d, l, r) {  var a = sc.animations.currentAnim;
            if (u.isDown) {
                if ((l.isDown || r.isDown) && (a.name!=="upSide" || !a.isPlaying))
                    sc.play('upSide', sc.data.speed/11);
                else if (!(l.isDown || r.isDown) && (a.name!=="up" || !a.isPlaying))
                    sc.play('up', sc.data.speed/11);
            } else if (d.isDown) {
                if ((l.isDown || r.isDown) && (a.name!=="downSide" || !a.isPlaying))
                    sc.play('downSide', sc.data.speed/11);
                else if (!(l.isDown || r.isDown) && (a.name!=="down" || !a.isPlaying))
                    sc.play('down', sc.data.speed/11);
            } else if ((l.isDown || r.isDown) && (a.name!=="side" || !a.isPlaying))
                sc.play('side', sc.data.speed/11);
            if (l.isDown && sc.scale.x > 0 && !r.isDown || r.isDown && sc.scale.x < 0)
                sc.scale.x = -sc.scale.x;
        },
        stunCheck: function (e, elec) {
            if (elec.alpha===1 && e.data.stun<=0) {
                e.data.stun = (3200-(Math.abs(elec.width*elec.height)/10))/8;
                e.data.shock = game.add.sprite(e.centerX,e.centerY,'shockMarks');
                shockMarks.add(e.data.shock);
                e.data.shock.anchor.set(.5);
                e.data.shock.animations.add('shock', [0,1,2]);
                e.data.shock.play('shock', 3, true);
            }
        },
        touchingEnemy: function (sc, enemy) {
            if (sc.centerY+sc.height/2 < enemy.centerY+enemy.height/2 && sc.z > enemy.z) sprites.swap(sc, enemy);
            else if (sc.centerY+sc.height/2 > enemy.centerY+enemy.height/2 && sc.z < enemy.z) sprites.swap(sc, enemy);
            if (enemy && enemy.data.frog) { var f = enemy.data.frog;
                if (sc.centerY+sc.height/2 < f.centerY+f.height/2 && sc.z > f.z) sprites.swap(sc, f);
                else if (sc.centerY+sc.height/2 > f.centerY+f.height/2 && sc.z < f.z) sprites.swap(sc, f);
            }//*
            if (Math.abs(sc.centerY-enemy.centerY)<15 && Math.abs(sc.centerX-enemy.centerX)<15 && enemy.alpha===1 && !enemy.data.controlled) {
                for (var i = 0; i < enemies.length; i++)
                    enemies[i].body.velocity.set(0);
                spellcaster.body.velocity.set(0);   decoy.body.velocity.set(0);   reticle.body.velocity.set(0);
                gameOver = true; textFinal.text = "You were caught...";
                if (searchEvent) { game.time.events.remove(searchEvent);   searchEvent=null;   textSearch.text=""; }
                textFinal.alpha = 1;
                game.camera.fade('#000000', 4000);    music.fadeOut(3000);
                game.camera.onFadeComplete.add(quitGame,this);
            }//*/
        },
        killEnemyParts: function (enemy) {
            var b = enemy.data.collisionBoxes;
            b.upLeft.destroy();   b.up.destroy();   b.upRight.destroy();
            b.downLeft.destroy(); b.down.destroy(); b.downRight.destroy();
            b.leftUp.destroy();   b.left.destroy(); b.leftDown.destroy();
            b.rightUp.destroy();  b.right.destroy();b.rightDown.destroy();
            if (enemy.data.shock) enemy.data.shock.destroy();
            if (enemy.data.frog) enemy.data.frog.destroy();
            enemy.data.lineOfSight.destroy();  enemy.data.seeMark.destroy();  enemy.data.speech.destroy();
            game.time.events.add(100, this.killEnemy, this, enemy);
        },
        killEnemy: function (enemy) {
            enemy.destroy();
            for (var i = 0; i < enemies.length; i++)
                if (enemy === enemies[i]) enemies.splice(i,1);
            if (enemies.length===0) {
                textFinal.text = "You sealed all\nthe enemies away!\nYou win!";
                textFinal.alpha = 1;
                game.time.events.add(5000, quitGame, this);
            }
        },
        enemyDeathCheck: function (e) {
            if (e.data.id===1 && e.data.stun>0 && e.data.seeSC && e.data.lineOfSight.children[0] && e.data.lineOfSight.children[0].alpha===1) {
                if (infoFrank.found) { e.data.dying = true;   game.add.tween(e).to({alpha:0}, 7000, "Linear", true);
                    e.data.speech.text = "What is this..?!\nI can't do anything...\nEveryone knows where I am...\n...how miserable...";
                } else { e.data.speech.text = "Grr..! I won't be\nsealed away by someone\nwho knows nothing\nabout me!";
                    game.time.events.add(3500, endSpeech, this, e);
                }
            } else if (e.data.id===1 && e.data.stun>0 && e.data.seeSC) { game.time.events.add(5000, endSpeech, this, e);
                e.data.speech.text = "I'll sneak up on you\nwhen you least\nexpect it and get\nyou back for this...!";
            } else if (e.data.id===1 && e.data.stun>0) { game.time.events.add(3500, endSpeech, this, e);
                e.data.speech.text = "(This really hurts...)";
            }
            function endSpeech(e) { if (!e.data.dying && e && e.data && e.data.speech) e.data.speech.text = ""; }
        },
        moveEnemies: function () {
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i]; var b = enemy.data.collisionBoxes;
                if (!enemy.data.dying) this.enemyDeathCheck(enemy);
                if (enemy.data.dying) { enemy.body.velocity.set(0); if (enemy.alpha<0.1) {this.killEnemyParts(enemy);}  return; }
                enemy.data.speech.x = enemy.centerX;  enemy.data.speech.y = enemy.centerY-32;
                game.physics.arcade.overlap(enemy, electricity, this.stunCheck, null, this);
                if (enemy.data.stun>0) {enemy.data.stun--;  enemy.data.counter=0;   enemy.body.velocity.set(0);}
                else if (enemy.data.shock) enemy.data.shock.destroy();
                if (enemy.data.frogTimer>0) {enemy.data.frogTimer--;  enemy.data.counter=0;   enemy.body.velocity.set(0);}
                else if (enemy.data.frog && enemy.data.frog.alpha===1) {
                    game.add.tween(enemy.data.frog).to({alpha:0}, 1000, "Linear", true);
                    game.add.tween(enemy).to({alpha:1}, 1000, "Linear", true);
                } else if (enemy.data.frog && enemy.data.frog.alpha<.1) enemy.data.frog.destroy();
                if (decoy.alpha>.1 && enemy.data.distractCount<200) game.physics.arcade.overlap(enemy, decoy, decoyCheck, null, this);
                else if (decoy.alpha<=.1) {enemy.data.distractCount = 0;  enemy.data.seeMark.alpha = 0;}
                function decoyCheck (e, d) {
                    if (Math.abs(e.centerY-d.centerY)<20 && Math.abs(e.centerX-d.centerX)<20) {
                        e.data.distractCount++;   e.data.counter=0;   e.body.velocity.set(0);
                        enemy.data.seeMark.play('?');   enemy.data.seeMark.alpha = 1;
                    }
                }
                var a = enemy.animations.currentAnim;
                var distanceX = spellcaster.centerX - enemy.centerX;  var distXD = decoy.centerX - enemy.centerX;
                var distanceY = spellcaster.centerY - enemy.centerY;  var distYD = decoy.centerY - enemy.centerY;
                var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                if (decoy.alpha>0 && enemy.data.distractCount<200 && Math.sqrt(distXD*distXD+distYD*distYD)<distance) {
                    distance = Math.sqrt(distXD*distXD+distYD*distYD);  distanceX=distXD;  distanceY=distYD;
                }
                var angle = game.math.radToDeg(Math.atan2(distanceY, distanceX));
                enemy.data.lineOfSight.setAll('tint', 0x00ff00);
                if (a.name==="right" && (angle < -70 || angle > 70)) enemy.data.lineOfSight.setAll('tint', 0xffff00);
                else if (a.name==="left" && (angle<110 && angle>-110)) enemy.data.lineOfSight.setAll('tint', 0xffff00);
                else if (a.name==="up" && !(angle<-20 && angle>-160)) enemy.data.lineOfSight.setAll('tint', 0xffff00);
                else if (a.name==="down" && !(angle<160 && angle>20)) enemy.data.lineOfSight.setAll('tint', 0xffff00);
                enemy.data.lineOfSight.forEachExists(resetDot, this);
                function resetDot (dot) {
                    dot.reset(enemy.centerX+distanceX*dot.z/20, enemy.centerY+distanceY*dot.z/20);
                    game.physics.arcade.overlap(dot, wallLayer, sightCheck, null, this);
                } function sightCheck (dot, wall) { if (wall.index>=0) enemy.data.lineOfSight.setAll('tint', 0xffffff); }
                if (distance > enemySight || spellcaster.alpha===0) enemy.data.lineOfSight.setAll('tint', 0x3385ff);
                if (enemy.data.lineOfSight.children[0].tint===0x00ff00 && !enemy.data.seeSC) {
                    enemy.data.seeSC = true;    enemy.data.seeMark.play('!');   enemy.data.seeMark.alpha = 1;
                } else if (enemy.data.lineOfSight.children[0].tint!==0x00ff00) {
                    enemy.data.seeSC = false;
                    enemy.data.seeMark.alpha = 0;
                }
                if (enemy.data.seeSC) { enemy.data.seeMark.alpha = 1;
                    if (enemy.alpha!==1 || enemy.data.controlled || enemy.data.speech.text!=="") enemy.data.seeMark.alpha = 0;
                    if (enemy.data.distractCount===0) enemy.data.seeMark.play('!');
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
                          pathOpened(b.downLeft.data,b.down.data,b.downRight.data))) {changeDirection();}
                else if (a.name==="left" && (pathOpened(b.upRight.data,b.up.data,b.upLeft.data) ||
                          pathOpened(b.downRight.data,b.down.data,b.downLeft.data))) {changeDirection();}
                else if (a.name==="up" && (pathOpened(b.rightDown.data,b.right.data,b.rightUp.data) ||
                          pathOpened(b.leftDown.data,b.left.data,b.leftUp.data))) {changeDirection();}
                else if (a.name==="down" && (pathOpened(b.rightUp.data,b.right.data,b.rightDown.data) ||
                          pathOpened(b.leftUp.data,b.left.data,b.leftDown.data))) {changeDirection();}
                // Change direction if blocked in front.
                function pathCheck (b1,b2,b) {return (b1===0 || b2===0 || b===0);}
                if (a.name==="right" && pathCheck(b.rightUp.data,b.rightDown.data,b.right.data)) {changeDirection();}
                else if (a.name==="left" && pathCheck(b.leftUp.data,b.leftDown.data,b.left.data)) {changeDirection();}
                else if (a.name==="up" && pathCheck(b.upRight.data,b.upLeft.data,b.up.data)) {changeDirection();}
                else if (a.name==="down" && pathCheck(b.downRight.data,b.downLeft.data,b.down.data)) {changeDirection();}

                function changeDirection () {
                    enemy.body.velocity.set(0);   var r=1, c=0;
                    while (r>0 && !enemy.data.controlled && enemy.alpha===1 && c<33) {
                        r = game.rnd.integerInRange(1, 4);
                        if (enemy.data.moveList.length>0) {r = enemy.data.moveList[0];  enemy.data.moveList.shift();}
                        if (r===1) r = tryDirection(b.rightUp.data, b.right.data, b.rightDown.data, true, 1, 1);
                        else if (r===2) r = tryDirection(b.leftUp.data, b.left.data, b.leftDown.data, true, -1, 2);
                        else if (r===3) r = tryDirection(b.upLeft.data, b.up.data, b.upRight.data, false, -1, 3);
                        else if (r===4) r = tryDirection(b.downLeft.data, b.down.data, b.downRight.data, false, 1, 4);
                        c++;
                    }
                }

                function tryDirection (b1,b,b2,side,sign,dir) {
                    if (b1>0 || b2>0) {   // Consider direction if there is an opening.
                        if (b1>0 && b2>0 && b>0) { // Nothing is blocked, go ahead and move.
                            if (side) enemy.body.velocity.x = enemySpeed*sign;
                            else enemy.body.velocity.y = enemySpeed*sign;
                        } else if (b1>0 && b2>0) { var d; // Blocked in middle; choose a perpendicular direction to move first.
                            if (enemy.data.moveList.length>0) { d = enemy.data.moveList[0];  enemy.data.moveList.shift(); }
                            else if (side) d = game.rnd.integerInRange(3, 4);
                            else d = game.rnd.integerInRange(1, 2);
                            enemy.data.moveList.unshift(dir);
                            if (d===1) enemy.body.velocity.x = enemySpeed;
                            else if (d===2) enemy.body.velocity.x = -enemySpeed;
                            else if (d===3) enemy.body.velocity.y = -enemySpeed;
                            else enemy.body.velocity.y = enemySpeed;
                        } else if (b1>0) { // Must move up (if moving left/right) or left (if moving up/down) to get to desired direction.
                            enemy.data.moveList.unshift(dir);
                            if (side) enemy.body.velocity.y = -enemySpeed;
                            else enemy.body.velocity.x = -enemySpeed;
                        } else { // Must move down (if moving left/right) or right (if moving up/down) to get to desired direction.
                            enemy.data.moveList.unshift(dir);
                            if (side) enemy.body.velocity.y = enemySpeed;
                            else enemy.body.velocity.x = enemySpeed;
                        } return 0;
                    } return 1;
                }

                if (enemy.data.controlled) {
                    enemy.body.velocity.set(0);
                    if (spellKeys.d.isDown) enemy.body.velocity.x = enemySpeed;
                    else if (spellKeys.a.isDown) enemy.body.velocity.x = -enemySpeed;
                    else if (spellKeys.w.isDown) enemy.body.velocity.y = -enemySpeed;
                    else if (spellKeys.s.isDown) enemy.body.velocity.y = enemySpeed;
                } else if (enemy.body.velocity.x===0 && enemy.body.velocity.y===0 && enemy.data.counter>10) {
                    if (a.name==="right") enemy.body.velocity.x = enemySpeed;
                    if (a.name==="left") enemy.body.velocity.x = -enemySpeed;
                    if (a.name==="up") enemy.body.velocity.y = -enemySpeed;
                    if (a.name==="down") enemy.body.velocity.y = enemySpeed;
                    changeDirection();  enemy.data.counter = 0;
                } else if (enemy.body.velocity.x===0 && enemy.body.velocity.y===0) enemy.data.counter++;
                else enemy.data.counter = 0;

                if (enemy.body.velocity.x > 0 && (a.name!=="right" || !a.isPlaying))
                    enemy.play('right', enemySpeed/12);
                else if (enemy.body.velocity.x < 0 && (a.name!=="left" || !a.isPlaying))
                    enemy.play('left', enemySpeed/12);
                else if (enemy.body.velocity.y < 0 && (a.name!=="up" || !a.isPlaying))
                    enemy.play('up', enemySpeed/12);
                else if (enemy.body.velocity.y > 0 && (a.name!=="down" || !a.isPlaying))
                    enemy.play('down', enemySpeed/12);

                enemy.data.seeMark.centerX = enemy.centerX; enemy.data.seeMark.centerY = enemy.centerY-22;
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
        idAt: function (x,y) {
            var tile = map.getTile(wallLayer.getTileX(x), wallLayer.getTileY(y), wallLayer);
            if (tile) return tile.index;
            else return -1;
        },
        evalBookshelves: function () {    bookShelf = 0;    textExamine.text = "";
            var x = floorLayer.getTileX(spellcaster.centerX);
            var y = floorLayer.getTileY(spellcaster.centerY);
            function facingUp() {return (spellcaster.animations.currentAnim.name==="up");}
            function facingDown() {return (spellcaster.animations.currentAnim.name==="down");}
            function facingRight() {return (spellcaster.animations.currentAnim.name==="side" && spellcaster.scale.x>0);}
            function facingLeft() {return (spellcaster.animations.currentAnim.name==="side" && spellcaster.scale.x<0);}
            if (x>=8 && x<=20 && y===10 && facingUp()) bookShelf = 1;
            else if (x>=8 && x<=12 && y===13 && facingDown() || x>=8 && x<=12 && y===15 && facingUp()) bookShelf = 2;
            else if (x===16 && y>=14 && y<=18 && facingRight() || x===18 && y>=14 && y<=19 && facingLeft()) bookShelf = 3;
            else if (x>=12 && x<=16 && y===18 && facingDown() || x>=12 && x<=16 && y===20 && facingUp()) bookShelf = 4;
            else if (x===11 && y>=22 && y<=28 && facingRight() || x===13 && y>=22 && y<=28 && facingLeft()) bookShelf = 5;
            else if (x===15 && y>=22 && y<=28 && facingRight() || x===17 && y>=22 && y<=28 && facingLeft()) bookShelf = 6;
            else if (x>=10 && x<=14 && y===31 && facingDown() || x>=10 && x<=14 && y===33 && facingUp()) bookShelf = 7;
            else if (x>=18 && x<=22 && y===31 && facingDown() || x>=18 && x<=22 && y===33 && facingUp()) bookShelf = 8;
            else if (x>=24 && x<=26 && y===25 && facingUp()) bookShelf = 9;
            else if (x>=28 && x<=32 && y===31 && facingDown() || x>=28 && x<=32 && y===33 && facingUp()) bookShelf = 10;
            else if (x===32 && y>=27 && y<=31 && facingRight() || x===34 && y>=27 && y<=32 && facingLeft()) bookShelf = 11;
            else if (x>=37 && x<=42 && y===31 && facingDown() || x>=37 && x<=42 && y===33 && facingUp()) bookShelf = 12;
            else if (x>=37 && x<=42 && y===26 && facingDown() || x>=37 && x<=42 && y===28 && facingUp()) bookShelf = 13;
            else if (x>=33 && x<=37 && y===21 && facingDown() || x>=33 && x<=37 && y===23 && facingUp()) bookShelf = 14;
            else if (x>=33 && x<=37 && y===17 && facingDown() || x>=33 && x<=37 && y===19 && facingUp()) bookShelf = 15;
            else if (x===40 && y>=18 && y<=22 && facingRight() || x===42 && y>=18 && y<=22 && facingLeft()) bookShelf = 16;
            else if (x>=33 && x<=41 && y===13 && facingDown() || x>=33 && x<=41 && y===15 && facingUp()) bookShelf = 17;
            else if (x>=30 && x<=44 && y===10 && facingUp()) bookShelf = 18;
            if (bookShelf>0 && textSearch.text==="") textExamine.text = "Press E to examine\nbookshelf "+bookShelf+".";
            else if (searchEvent && bookShelf===0) {
                game.time.events.remove(searchEvent);   searchEvent=null;
                textSearch.text="Your search has\nbeen interrupted.";
                game.time.events.add(3000, emptySearch, this);
            } else if (bookShelf<1 && textSearch.text!=="Your search has\nbeen interrupted.") textSearch.text = "";
            function emptySearch () {textSearch.text="";}
        },
        finishSearch: function () {
            searchEvent=null;
            if (bookShelf===infoSpell.loc) {  infoSpell.found=true;
                textSearch.text="You found something\ncalled the\n\"Spell of Responsibility.\"\nHow to cast: S~aadw";
            } else if (bookShelf===infoFrank.loc) {  infoFrank.found = true;
                textSearch.text="One book describes\nan overweight man with\nmetallic-like skin\nwho would like to\nwreak havoc unbeknownst\nto the world.";
            } else if (bookShelf===infoBird.loc) {  infoBird.found = true;
                textSearch.text="One book describes\na scrawny man who\nstrugges to accept\nresponsibility\nfor his baby.";
            } else if (bookShelf>0) textSearch.text="You found nothing\nof interest.";
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
