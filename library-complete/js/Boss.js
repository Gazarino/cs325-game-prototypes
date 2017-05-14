"use strict";

GameStates.makeBoss = function( game, shared ) {

    var music, cursors, spellKeys;
    var lightning = null, lightningTime = null, thunder = null, rain = null;
    var map, floorLayer, wallLayer, decorLayer;
    var spellcaster, circle, spellbook, textBook, enemies, sprites, tag, decoy, reticle, aimArea, electricity, shockMarks;
    var gameOver, textFinal, mana, manaEmpty, manaTop, manaBottom, textInfo, cropRect, cost, shotSpeed;
    var specialEvent, bookShelf, textExamine, textSearch, searchEvent, emptySearchEvent, textFindings;
    var infoSpell, moveTime, demonXDist, demonYDist, shotTime, light;

    function quitGame() {
        music.stop();  rain.stop();
        game.scale.setGameSize(320, 320);
        game.state.start('End');
    }

    var mainGame = {
        create: function () {
            gameOver = false;
            cursors = game.input.keyboard.createCursorKeys();
            spellKeys = game.input.keyboard.addKeys( {'a': Phaser.KeyCode.A, 'w': Phaser.KeyCode.W,
                                                      'h': Phaser.KeyCode.H, 'e': Phaser.KeyCode.E,
                                                      's': Phaser.KeyCode.S, 'd': Phaser.KeyCode.D, 'x': Phaser.KeyCode.X } );
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);

            music = game.add.audio('bossMusic');
            music.loopFull(1);

            map = game.add.tilemap('bossMap');
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
            game.physics.arcade.enable(decoy);    decoy.data = {controllable:false, speed:70, time:0};
            decoy.animations.add('up', [0,1,2,1]);          decoy.animations.add('upStill', [1]);
            decoy.animations.add('upSide', [3,4,5,4]);      decoy.animations.add('upSideStill', [4]);
            decoy.animations.add('side', [6,7,8,7]);        decoy.animations.add('sideStill', [7]);
            decoy.animations.add('downSide', [9,10,11,10]); decoy.animations.add('downSideStill', [10]);
            decoy.animations.add('down', [12,13,14,13]);    decoy.animations.add('downStill', [13]);
            sprites.add(decoy);
            spellcaster = game.add.sprite(560, 525, 'girl'+shared.char);
            spellcaster.scale.set(.75);   spellcaster.anchor.set(.5);
            spellcaster.data = {speed:70, spellInUse:false, spellType:"", stun:0, shock:null, specialInUse:false,
                                shrinkTime:0, revealTime:0, vanishTime:0, fadeTime:0, regenTime:0, regenRate:425};
            game.physics.arcade.enable(spellcaster);
            spellcaster.animations.add('up', [0,1,2,1]);
            spellcaster.animations.add('upSide', [3,4,5,4]);
            spellcaster.animations.add('side', [6,7,8,7]);
            spellcaster.animations.add('downSide', [9,10,11,10]);
            spellcaster.animations.add('down', [12,13,14,13]);
            sprites.add(spellcaster);

            enemies = [];
            enemies.push(this.createEnemy("demon", 560, 415));
            enemies[0].animations.add('float', [2,3,4,5,6,7,8,9,7,6,5,4,3]);
            enemies[0].animations.add('move', [11,12,13,14,15,16,17,18]);
            enemies[0].animations.add('shoot1', [19,20,21,22,23,24,25,26,27,28,29,24,23,22,21,20,19]);
            enemies[0].animations.add('shoot2', [19,20,21,22,23,24,25,26,27,28,29,25,26,27,28,29,24,23,22,21,20,19]);
            enemies[0].animations.add('shootDown1', [30,31,32,33,34,35,36,37]);
            enemies[0].animations.add('shootDown2', [30,31,32,33,34,35,36,34,35,36,37]);
            enemies[0].body.setSize(enemies[0].width*.75, enemies[0].height, 5, 0);
            enemies[0].anchor.x = .4;
            moveTime = this.time.time+2500;   shotTime=this.time.time+4000;
            demonXDist=0;   demonYDist=0;
            spellcaster.play("up", 50);
            game.camera.follow(spellcaster);
            decorLayer = map.createLayer('Bookshelves');
            light = game.add.sprite(560, 525, 'light');   light.alpha = 0;
            game.physics.arcade.enable(light);
            light.animations.add('light', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]);
            reticle = game.add.sprite(0,0,'reticle');   reticle.alpha = 0;    game.physics.arcade.enable(reticle);
            aimArea = game.add.sprite(0, 0, 'dot');     aimArea.alpha=0;      aimArea.tint=0xffff00;
            electricity = game.add.sprite(0, 0, 'electricity'); electricity.alpha=0;  game.physics.arcade.enable(electricity);
            shockMarks = game.add.group();

            textBook = game.add.text(5, 5, "Press H to close spellbook.", {font:"8px Sitka Small", fill:"#ffffff", align:"center" });
            textFindings = game.add.text(5, 5, "", {font:"8px Sitka Small", fill:"#ffffff", align:"left" });
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
            textFinal = game.add.text(240, 185, "", {font:"16px Sitka Small", fill:"#ffffff", align:"center" });
            textFinal.anchor.set(.5);

            var cheat = false;
            if (cheat) textFindings.text+="Sealing Light: A~wdss\n";
            infoSpell = {found:cheat, loc:game.rnd.integerInRange(1,4)};

            //game.camera.onFadeComplete.add(quitGame,this);
            game.camera.onFadeComplete.add(this.softReset,this);
        },
        createEnemy: function (name, x, y) {
            var enemy = game.add.sprite(x, y, name);
            enemy.data = {lineOfSight:game.add.physicsGroup(), seeSC:false, controlled:false, counter:0,
                          dying:false, distractCount:0, stun:0, shock:null, prevDir:null};
            enemy.data.lineOfSight.enableBody = true;
            enemy.data.lineOfSight.physicsBodyType = Phaser.Physics.ARCADE;
            enemy.data.lineOfSight.createMultiple(20, 'dot');
            for (var i=0; i<20; i++) makeDot();
            function makeDot () {
                var dot = enemy.data.lineOfSight.getFirstExists(false);
                if (dot) {dot.reset(enemy.centerX, enemy.centerY); dot.alpha=0;}
            }
            game.physics.arcade.enable(enemy);
            enemy.animations.add('down', [0,1,2,1]);
            enemy.animations.add('left', [3,4,5,4]);
            enemy.animations.add('right', [6,7,8,7]);
            enemy.animations.add('up', [9,10,11,10]);
            sprites.add(enemy);
            return enemy;
        },

        update: function () {
            this.alignWithCamera();   this.evalBookshelves();
            sprites.sort('y', Phaser.Group.SORT_ASCENDING);
            game.physics.arcade.overlap(spellcaster, enemies, this.touchingEnemy, null, this);
            if (!gameOver) this.moveSpellcaster();
            if (!gameOver) this.moveDemon();
            if (!gameOver) this.moveShots();
            if (!gameOver) this.analyzeSpellInput();
            if (spellcaster.scale.y===.5 && this.time.time>spellcaster.data.shrinkTime) this.endShrink();
            if (decorLayer.alpha===.5 && this.time.time>spellcaster.data.fadeTime) game.add.tween(decorLayer).to({alpha:1}, 1000, "Linear", true);
            if (decoy.alpha===.75 && this.time.time>decoy.data.time) game.add.tween(decoy).to({alpha:0}, 1000, "Linear", true);
            if (spellcaster.alpha===0 && this.time.time>spellcaster.data.vanishTime) game.add.tween(spellcaster).to({alpha:1}, 1000, "Linear", true);
            if (this.lineExists(enemies[0]) && enemies[0].data.lineOfSight.children[0].alpha===1 && this.time.time>spellcaster.data.revealTime)
                for (var i = 0; i < enemies.length; i++)
                    enemies[i].data.lineOfSight.forEachExists(this.fadeObj, this);
            if (cropRect.width<100 && this.time.time>spellcaster.data.regenTime && !spellcaster.data.spellInUse) {
                cropRect.width++;   mana.updateCrop();   spellcaster.data.regenTime=this.time.time+spellcaster.data.regenRate;
            }
            if (this.time.time > lightningTime)	this.lightningStart();
        },
        alignWithCamera: function () {
            manaBottom.x = game.camera.x;                 manaBottom.y = game.camera.y+game.height-manaBottom.height;
            manaTop.x = game.camera.x;                    manaTop.y = game.camera.y+game.height-manaTop.height;
            manaEmpty.x = game.camera.x+13;               manaEmpty.y = game.camera.y+game.height-25;
            mana.x = game.camera.x+13;                    mana.y = game.camera.y+game.height-25;
            textInfo.x = game.camera.x+game.width/2;      textInfo.y = game.camera.y+game.height/2;
            textExamine.x = game.camera.x+game.width/2;   textExamine.y = game.camera.y+50;
            textSearch.x = game.camera.x+game.width/2;    textSearch.y = game.camera.y+game.height/2-50;
            textFinal.x = game.camera.x+game.width/2;     textFinal.y = game.camera.y+game.height/2;
            textBook.x = game.camera.x+5;                 textBook.y = game.camera.y+2;
            textFindings.x = game.camera.x+5;             textFindings.y = game.camera.y+150;
            spellbook.x = game.camera.x-105;              spellbook.y = game.camera.y;
            lightning.x = game.camera.x-5;                lightning.y = game.camera.y-5;
        },
        analyzeSpellInput: function () {
            if (spellKeys.h.downDuration(1)) {
                if (spellbook.alpha==0) {textBook.text="Press H to close spellbook.";  spellbook.alpha=1;   textFindings.alpha=1;}
                else {textBook.text="Press H to open spellbook.";  spellbook.alpha=0;   textFindings.alpha=0;}
            }
            if (spellKeys.e.downDuration(1) && textExamine!=="") {
                textSearch.text = "Searching...";
                searchEvent = game.time.events.add(3000, this.finishSearch, this);
                if (emptySearchEvent) {game.time.events.remove(emptySearchEvent); emptySearchEvent=null;}
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
            if (circle.tint===0xffa33a && spellKeys.a.isDown) reticle.alpha=1; else reticle.alpha=0;
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
            } else if (circle.data==="sawa" && spellcaster.data.spellType==="d") { cost = 20;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                game.add.tween(decorLayer).to({alpha:.5}, 1000, "Linear", true);
                spellcaster.data.fadeTime = this.time.time+16000;
            } else if (circle.data==="asas" && spellcaster.data.spellType==="d") { cost = 25;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                for (var i = 0; i < enemies.length; i++)
                    enemies[i].data.lineOfSight.forEachExists(fadeDot, this);
                function fadeDot (dot) {game.add.tween(dot).to({alpha:1}, 1000, "Linear", true);}
                spellcaster.data.revealTime = this.time.time+13000;
            } else if (circle.data==="ssws" && spellcaster.data.spellType==="d") { cost = 40;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                game.add.tween(spellcaster).to({alpha:0}, 1000, "Linear", true);
                spellcaster.data.vanishTime = this.time.time+10000;
            } else if (circle.data==="sasd" && spellcaster.data.spellType==="w") { cost = 30;
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
            } else if (circle.data==="ssaa" && spellcaster.data.spellType==="w") { cost = 25;
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
            } else if (circle.data==="swsd" && spellcaster.data.spellType==="a") { cost = 40;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (this.collidingWithWall(decoy)) { end("Cannot place decoy\ninside a wall."); return; }
                decoy.data.controllable = false;   game.add.tween(decoy).to({alpha:.75}, 1000, "Linear", true);
                decoy.data.time = this.time.time+12000;
            } else if (circle.data==="ssdd" && spellcaster.data.spellType==="a") { cost = 45;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (aimArea.tint===0xff0000) { end("Area of effect too large."); return; }
                electricity.alpha = 1;    aimArea.alpha = 0;
                electricity.x = aimArea.x;  electricity.y = aimArea.y;
                electricity.width = aimArea.width;    electricity.height = aimArea.height;
                game.time.events.add(500, this.fadeObj, this, electricity);
            } else if (circle.data==="wdss" && spellcaster.data.spellType==="a" && infoSpell.found) { cost = 50;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (enemies[0] && enemies[0].data && enemies[0].data.seeSC) {
                    light.centerX = reticle.centerX;  light.centerY = reticle.centerY;
                    light.alpha = 1;  light.play('light', 15);
                    game.time.events.add(1000, missCheck, this);
                    function missCheck () {
                        if (enemies[0] && enemies[0].data && !enemies[0].data.dying) {
                            textInfo.text = "You missed.";  textInfo.alpha = 1;
                            game.time.events.add(2000, mainGame.fadeObj, this, textInfo);
                        }
                    }
                } else {end("The demon does\nnot see you."); return;}
            } else if (circle.data==="awda" && spellcaster.data.spellType==="s") { cost = 55;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (shared.char===1) {
                    if (enemies[0] && enemies[0].data && enemies[0].data.seeSC) { end("The demon is immune."); return; }
                    else { end("Nothing in clear view."); return; }
                } else if (shared.char===2) {
                    if (enemies[0] && enemies[0].data && enemies[0].data.seeSC) { end("The demon is immune."); return; }
                    else { end("Nothing in clear view."); return; }
                } else if (shared.char===3) {
                    spellcaster.data.speed = 140;
                } else {  decoy.centerX = spellcaster.centerX;  decoy.centerY = spellcaster.centerY;
                    decoy.data.controllable = true;   game.add.tween(decoy).to({alpha:.75}, 1000, "Linear", true);
                    decoy.data.time = this.time.time+15000;
                }  spellcaster.data.specialInUse = true;
                specialEvent = game.time.events.add(15000, this.cancelSpecial, this);
            } else { end("Spell not recognized."); return; }
            this.endSpell();
            function getClosest () {
                var closest = null, shortestDist = 333;
                for (var i = 0; i < enemies.length; i++) {  var e = enemies[i];
                    if (e && e.data && e.data.seeSC) {
                        var distanceX = spellcaster.centerX-e.centerX;
                        var distanceY = spellcaster.centerY-e.centerY;
                        var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                        if (distance<shortestDist) {shortestDist=distance;  closest=e;}
                    }
                } return closest;
            }
            function end(s) {
                textInfo.text = s;  textInfo.alpha = 1;  spellcaster.data.spellType="NaN";  circle.tint = 0xff0000;
                game.time.events.add(2000, mainGame.fadeObj, this, textInfo);   cost=0;  mainGame.endSpell();
            }
        },
        cancelSpecial: function () {
            if (shared.char===1) {

            } else if (shared.char===2) {
                for (var i = 0; i < enemies.length; i++)
                    if (enemies[i]) enemies[i].data.controlled = false;
            } else if (shared.char===3) {
                spellcaster.data.speed = 70;
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
            if (spellcaster.centerY<412) {
                spellcaster.data.shrinkTime = this.time.time+1000;
            } else {
                var sign=1;   if (spellcaster.scale.x<0) sign=-1;
                game.add.tween(spellcaster.scale).to({x:.75*sign}, 1000, "Linear", true);
                game.add.tween(spellcaster.scale).to({y:.75}, 1000, "Linear", true);
            }
        },
        endSpell: function () {
            this.windowResize(320);  shotSpeed=80;   spellcaster.data.regenRate=425;
            if (spellcaster.data.spellType!=="NaN") {
                if (manaTop.tint===0xcc33ff && spellcaster.data.spellType!=="w")  shotSpeed-=6;
                if (manaBottom.tint===0xcc33ff && spellcaster.data.spellType!=="w")  shotSpeed-=6;
                if (manaTop.tint===0xffa33a && spellcaster.data.spellType!=="a")  this.windowResize(game.width+=64);
                if (manaBottom.tint===0xffa33a && spellcaster.data.spellType!=="a")  this.windowResize(game.width+=64);
                if (manaTop.tint===0x3385ff && spellcaster.data.spellType!=="s")  spellcaster.data.regenRate-=60;
                if (manaBottom.tint===0x3385ff && spellcaster.data.spellType!=="s")  spellcaster.data.regenRate-=60;
                //if (manaTop.tint===0x33ff33 && spellcaster.data.spellType!=="d")  enemySight-=50;
                //if (manaBottom.tint===0x33ff33 && spellcaster.data.spellType!=="d")  enemySight-=50;

                cropRect.width -= cost;    mana.updateCrop();
                manaBottom.tint = manaTop.tint;
                if (spellcaster.data.spellType==="w") manaTop.tint = 0xcc33ff;
                else if (spellcaster.data.spellType==="a") manaTop.tint = 0xffa33a;
                else if (spellcaster.data.spellType==="s") manaTop.tint = 0x3385ff;
                else if (spellcaster.data.spellType==="d") manaTop.tint = 0x33ff33;
            }
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

            if (Math.abs(sc.centerY-enemy.centerY)<15 && Math.abs(sc.centerX-enemy.centerX)<15 && enemy.alpha===1 && enemy!==enemies[0]) {
                for (var i = 0; i < enemies.length; i++)
                    enemies[i].body.velocity.set(0);
                spellcaster.body.velocity.set(0);   decoy.body.velocity.set(0);   reticle.body.velocity.set(0);
                gameOver = true; textFinal.text = "You got hit...";   lightning.alpha = 0;
                if (searchEvent) { game.time.events.remove(searchEvent);   searchEvent=null;   textSearch.text=""; }
                music.fadeOut(3500);  rain.fadeOut(1000);
                game.camera.fade('#000000', 4000);
            }
        },
        softReset: function () { game.state.start(game.state.current); },
        killEnemyParts: function (enemy) {
            if (enemy.data.shock) enemy.data.shock.destroy();
            enemy.data.lineOfSight.destroy();
            game.time.events.add(10, this.killEnemy, this, enemy);
        },
        killEnemy: function (enemy) {
            enemy.destroy();
            for (var i = 0; i < enemies.length; i++)
                if (enemy === enemies[i]) enemies.splice(i,1);
            if (enemies.length===0) {
                textFinal.text = "You sealed away\nthe evil demon!\nNow you can\nget out of here...";
                game.time.events.add(4000, this.escape, this);
            }
        },
        escape: function () {
            game.camera.onFadeComplete.add(quitGame,this);
            game.camera.fade('#000000', 4000);
        },
        moveDemon: function () {
            var d = enemies[0]; if (!d || !d.data) return;
            game.physics.arcade.overlap(d, electricity, this.stunCheck, null, this);
            if (d.data.stun>0) {d.data.stun--;  d.data.counter=0;   d.body.velocity.set(0);}
            else if (d.data.shock) d.data.shock.destroy();
            var a = d.animations.currentAnim;
            var distanceX = spellcaster.centerX - d.centerX;
            var distanceY = spellcaster.centerY - d.centerY;
            var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
            var angle = game.math.radToDeg(Math.atan2(distanceY, distanceX));
            d.data.lineOfSight.setAll('tint', 0x00ff00);
            d.data.lineOfSight.forEachExists(resetDot, this);
            function resetDot (dot) {
                dot.reset(d.centerX+distanceX*dot.z/20, d.centerY+distanceY*dot.z/20);
                game.physics.arcade.overlap(dot, wallLayer, sightCheck, null, this);
            } function sightCheck (dot, wall) { if (wall.index>=0) d.data.lineOfSight.setAll('tint', 0xffffff); }
            if (spellcaster.alpha===0) d.data.lineOfSight.setAll('tint', 0x99c2ff);
            if (this.lineExists(d) && d.data.lineOfSight.children[0].tint===0x00ff00)  d.data.seeSC = true;
            else if (this.lineExists(d) && d.data.lineOfSight.children[0].tint!==0x00ff00)  d.data.seeSC = false;

            game.physics.arcade.collide(d, wallLayer, hitWall, null, this);
            function hitWall (e, w) {}

            if (d.data.controlled) {
                d.body.velocity.set(0);
                if (spellKeys.d.isDown) d.body.velocity.x = 60;
                else if (spellKeys.a.isDown) d.body.velocity.x = -60;
                if (spellKeys.w.isDown) d.body.velocity.y = -60;
                else if (spellKeys.s.isDown) d.body.velocity.y = 60;
                console.log(d.centerX+", "+d.centerY);
            } else if (this.time.time > shotTime && d.data.seeSC && a.name==="float" && d.data.stun<=0) {
                shotTime = this.time.time+4000;
                var n = game.rnd.integerInRange(1,2);
                if (angle<150 && angle>30) d.play('shootDown'+n, 7);
                else d.play('shoot'+n, 12);
                a=d.animations.currentAnim;
                game.time.events.add(700, createShot, this);
                if (n>1) game.time.events.add(1100, createShot, this);
                function createShot () {
                    var s = mainGame.createEnemy("demonShot", d.centerX, d.centerY);
                    if (d.scale.x>0 && !a.name.includes("Down")) {s.x+=27; s.y-=12;}
                    else if (!a.name.includes("Down")) {s.x-=27; s.y-=12;}
                    else if (d.scale.x>0) {s.x+=20; s.y+=20;}
                    else {s.x-=20; s.y+=20;}
                    s.data.prevDir=Math.atan2(spellcaster.centerY-s.centerY, spellcaster.centerX-s.centerX);
                    s.anchor.set(.5);
                    enemies.push(s);
                }
            } else if (this.time.time > moveTime && demonXDist===0 && demonYDist===0 && a.name==="float" && d.data.stun<=0) {
                moveTime = this.time.time+game.rnd.integerInRange(2500, 5000);
                if (game.rnd.integerInRange(1, 4)>2) {
                    demonXDist = game.rnd.integerInRange(-75, 75);
                    demonYDist = game.rnd.integerInRange(-70, 70);
                    if (demonXDist<0 && d.centerX<520 || demonXDist>0 && d.centerX>600) demonXDist*=-1;
                    if (demonYDist<0 && d.centerY<435 || demonYDist>0 && d.centerY>535) demonYDist*=-1;
                }
            } else {
                if (d.data.stun>0) {demonXDist=0; demonYDist=0;}
                if (demonXDist<0) { d.body.velocity.x=-60;  demonXDist++; }
                else if (demonXDist>0) { d.body.velocity.x=60;  demonXDist--; }
                else d.body.velocity.x=0;
                if (demonYDist<0) { d.body.velocity.y=-60; demonYDist++; }
                else if (demonYDist>0) { d.body.velocity.y=60; demonYDist--; }
                else d.body.velocity.y=0;
            }

            if (d.body.velocity.x===0 && d.body.velocity.y===0 && (a.name==="move" || !a.isPlaying))  d.play('float', 10);
            else if ((d.body.velocity.x!==0 || d.body.velocity.y!==0) && (a.name==="float" || !a.isPlaying))  d.play('move', 10);
            if (d.body.velocity.x<0 && d.scale.x>0 || d.body.velocity.x>0 && d.scale.x<0) d.scale.x = -d.scale.x;
            if (d.body.velocity.x===0 && d.body.velocity.y===0 && d.data.seeSC &&
                  ((d.scale.x<0 && spellcaster.centerX>d.x) || (d.scale.x>0 && spellcaster.centerX<d.x)))
                d.scale.x = -d.scale.x;

            if (Math.abs(d.centerY-light.centerY)<40 && Math.abs(d.x-light.centerX)<40 && light.animations.currentAnim.frame===12) {
                d.data.dying=true;    game.add.tween(d).to({alpha:0}, 4000, "Linear", true);  music.fadeOut(5000);
            }

            if (d.data.dying) {
                d.body.velocity.set(0);
                d.data.stun = 100;
                if (d.alpha<0.1)
                    this.killEnemyParts(d);
            }
        },
        moveShots: function () {
            for (var i = 1; i < enemies.length; i++) {
                var enemy = enemies[i];
                var distanceX = spellcaster.centerX - enemy.centerX;
                var distanceY = spellcaster.centerY - enemy.centerY;
                var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                var angle = game.math.radToDeg(Math.atan2(distanceY, distanceX));
                enemy.data.lineOfSight.setAll('tint', 0x00ff00);
                enemy.data.lineOfSight.forEachExists(resetDot, this);
                function resetDot (dot) {
                    dot.reset(enemy.centerX+distanceX*dot.z/20, enemy.centerY+distanceY*dot.z/20);
                    game.physics.arcade.overlap(dot, wallLayer, sightCheck, null, this);
                } function sightCheck (dot, wall) { if (wall.index>=0) enemy.data.lineOfSight.setAll('tint', 0xffffff); }
                if (spellcaster.alpha===0)
                    enemy.data.lineOfSight.setAll('tint', 0x99c2ff);
                if (this.lineExists(enemy) && enemy.data.lineOfSight.children[0].tint===0x00ff00 && !enemy.data.seeSC)
                    enemy.data.seeSC = true;
                else if (this.lineExists(enemy) && enemy.data.lineOfSight.children[0].tint!==0x00ff00)
                    enemy.data.seeSC = false;
                if (enemy.data.seeSC)
                    enemy.data.prevDir = Math.atan2(distanceY, distanceX);
                game.physics.arcade.velocityFromRotation(enemy.data.prevDir, shotSpeed, enemy.body.velocity);

                game.physics.arcade.collide(enemy, wallLayer, hitWall, null, this);
                function hitWall (e, w) { if (w.index>=0) this.killEnemyParts(e); }
            }
        },
        lineExists: function (e) {return (e && e.data && e.data.lineOfSight && e.data.lineOfSight.children[0])},
        idAt: function (x,y) {
            var tile = map.getTile(wallLayer.getTileX(x), wallLayer.getTileY(y), wallLayer);
            if (tile) return tile.index;
            else return -1;
        },
        evalBookshelves: function () {    bookShelf = 0;    textExamine.text = "";
            var x = floorLayer.getTileX(spellcaster.centerX);
            var y = floorLayer.getTileY(spellcaster.centerY);   //console.log("("+x+", "+y+")");
            function facingUp() {return (spellcaster.animations.currentAnim.name==="up");}
            function facingDown() {return (spellcaster.animations.currentAnim.name==="down");}
            function facingRight() {return (spellcaster.animations.currentAnim.name==="side" && spellcaster.scale.x>0);}
            function facingLeft() {return (spellcaster.animations.currentAnim.name==="side" && spellcaster.scale.x<0);}
            if (x>=29 && x<=40 && y===25 && facingUp()) bookShelf = 1;
            else if (x===27 && y>=28 && y<=33 && facingRight()) bookShelf = 5;
            else if (x===30 && y>=28 && y<=33 && facingLeft()) bookShelf = 2;
            else if (x>=32 && x<=37 && y===35 && facingDown()) bookShelf = 3;
            else if (x>=32 && x<=37 && y===38 && facingUp()) bookShelf = 6;
            else if (x===39 && y>=28 && y<=33 && facingRight()) bookShelf = 4;
            else if (x===42 && y>=28 && y<=33 && facingLeft()) bookShelf = 7;
            if (bookShelf>0 && textSearch.text==="") textExamine.text = "Press E to examine\nbookshelf "+bookShelf+".";
            else if (searchEvent && bookShelf===0) {
                game.time.events.remove(searchEvent);   searchEvent=null;
                textSearch.text="Your search has\nbeen interrupted.";
                emptySearchEvent = game.time.events.add(3000, emptySearch, this);
            } else if (bookShelf<1 && textSearch.text!=="Your search has\nbeen interrupted.") textSearch.text = "";
            function emptySearch () {textSearch.text=""; emptySearchEvent=null;}
        },
        finishSearch: function () {
            searchEvent=null;
            if (bookShelf===infoSpell.loc) {
                if (!infoSpell.found) textFindings.text+="Sealing Light: A~wdss\n";  infoSpell.found=true;
                textSearch.text="You found the spell\n\"Sealing Light.\"\nHow to cast: A~wdss\nSeal away targeted\ndark spirit if it\nsees you.";
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
