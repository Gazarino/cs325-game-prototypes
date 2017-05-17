"use strict";

GameStates.makeStudy = function( game, shared ) {

    var music, cursors, spellKeys;
    var lightning = null, lightningTime = null, thunder = null, rain = null;
    var map, floorLayer, wallLayer, decorLayer;
    var spellcaster, circle, spellbook, textBook, boy, sprites, tag, decoy, reticle, aimArea, electricity, shockMarks;
    var gameOver, textFinal, mana, manaEmpty, manaTop, manaBottom, textInfo, cropRect, cost, boySight, boySpeed;
    var specialEvent, bookShelf, textExamine, textSearch, searchEvent, emptySearchEvent, chasing, tagCount, seeTotal, face;
    var moveTime, moveCountDown, spellList, speechEvent, sawCast, exitButton;
    var textFindings, infoSpell, infoTag, infoUlrick, tagAlt, lastSpell, lastTopic;

    function quitGame() {
        music.stop();
        game.scale.setGameSize(320, 320);
        game.state.start('MainMenu');
    }

    var mainGame = {
        create: function () {
            gameOver = false;
            cursors = game.input.keyboard.createCursorKeys();
            spellKeys = game.input.keyboard.addKeys( {'a': Phaser.KeyCode.A, 'w': Phaser.KeyCode.W, 't': Phaser.KeyCode.T,
                                                      'h': Phaser.KeyCode.H, 'e': Phaser.KeyCode.E, 'r': Phaser.KeyCode.R,
                                                      's': Phaser.KeyCode.S, 'd': Phaser.KeyCode.D, 'x': Phaser.KeyCode.X } );
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);

            music = game.add.audio('studyMusic');
            music.loopFull(1);

            map = game.add.tilemap('studyMap');
            map.addTilesetImage('custom_FF5_spritesheet');
            floorLayer = map.createLayer('Floor');
            circle = game.add.sprite(0,0,'circle');   circle.alpha = 0;
            circle.animations.add('spin', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
            tag = game.add.sprite(0, 0, 'tag');   tag.alpha = 0;
            tagAlt = game.add.sprite(0, 0, 'tagAlt');   game.physics.arcade.enable(tagAlt);   tagAlt.alpha = 0;
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
            spellcaster = game.add.sprite(505, 610, 'girl'+shared.char);
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

            boySight = 200;   boySpeed = 80;  chasing = false;  tagCount=0;   seeTotal=0;   moveCountDown = 0;
            moveTime = this.time.time+game.rnd.integerInRange(2500, 5000);
            boy = createboy(0, 590, 465);
            function createboy (num, x, y) {
                var boy = game.add.sprite(x, y, 'man'+num);
                boy.data = {collisionBoxes:null, lineOfSight:game.add.physicsGroup(), seeSC:false, moveList:[], frogTimer:0, frog:null,
                          controlled:false, counter:0, seeMark:null, distractCount:0, stun:0, shock:null, speech:null, alignTime:0};
                boy.data.collisionBoxes = {upLeft:game.add.sprite(x, y, 'dot'), upRight:game.add.sprite(x, y, 'dot'),
                                            downLeft:game.add.sprite(x, y, 'dot'), downRight:game.add.sprite(x, y, 'dot'),
                                            rightUp:game.add.sprite(x, y, 'dot'), rightDown:game.add.sprite(x, y, 'dot'),
                                            leftUp:game.add.sprite(x, y, 'dot'), leftDown:game.add.sprite(x, y, 'dot'),
                                            left:game.add.sprite(x,y,'dot'),right:game.add.sprite(x,y,'dot'),
                                            up:game.add.sprite(x,y,'dot'),down:game.add.sprite(x,y,'dot')};
                var b = boy.data.collisionBoxes;
                prepareBox(b.upLeft);   prepareBox(b.upRight);    prepareBox(b.up);
                prepareBox(b.downLeft); prepareBox(b.downRight);  prepareBox(b.down);
                prepareBox(b.leftUp);   prepareBox(b.leftDown);   prepareBox(b.left);
                prepareBox(b.rightUp);  prepareBox(b.rightDown);  prepareBox(b.right);
                function prepareBox (box) {
                    box.data=0; box.alpha=0; game.physics.arcade.enable(box);
                }
                boy.data.lineOfSight.enableBody = true;
                boy.data.lineOfSight.physicsBodyType = Phaser.Physics.ARCADE;
                boy.data.lineOfSight.createMultiple(20, 'dot');
                for (var i=0; i<20; i++) makeDot();
                function makeDot () {
                    var dot = boy.data.lineOfSight.getFirstExists(false);
                    if (dot) {dot.reset(boy.centerX, boy.centerY); dot.alpha=0;}
                }
                game.physics.arcade.enable(boy);
                boy.animations.add('down', [0,1,2,1]);
                boy.animations.add('left', [3,4,5,4]);
                boy.animations.add('right', [6,7,8,7]);
                boy.animations.add('up', [9,10,11,10]);
                sprites.add(boy);
                return boy;
            }
            spellcaster.play("down", 50);    boy.play("down",50);
            game.camera.follow(spellcaster);
            decorLayer = map.createLayer('Bookshelves'); //decorLayer.alpha=0;
            reticle = game.add.sprite(0,0,'reticle');   reticle.alpha = 0;    game.physics.arcade.enable(reticle);
            aimArea = game.add.sprite(0, 0, 'dot');     aimArea.alpha=0;      aimArea.tint=0xffff00;
            electricity = game.add.sprite(0, 0, 'electricity'); electricity.alpha=0;  game.physics.arcade.enable(electricity);
            shockMarks = game.add.group();
            boy.data.seeMark = game.add.sprite(0,0,'seeMark');  boy.data.seeMark.alpha = 0;
            boy.data.seeMark.animations.add('!', [0]);   boy.data.seeMark.animations.add('?', [1]);
            boy.data.seeMark.animations.add('..', [2]);  boy.data.seeMark.animations.add('H', [3]);

            textBook = game.add.text(5, 5, "Press H to close spellbook.", {font:"8px Sitka Small", fill:"#ffffff", align:"center" });
            textFindings = game.add.text(5, 5, "", {font:"8px Sitka Small", fill:"#ffffff", align:"left" });
            spellbook = game.add.sprite(-50, 10, 'spellbook');
            manaBottom = game.add.sprite(0, 0, 'manaBottom');   manaTop = game.add.sprite(0, 0, 'manaTop');
            manaEmpty = game.add.sprite(0, 0, 'manaEmpty');     mana = game.add.sprite(0, 0, 'mana');
            cropRect = new Phaser.Rectangle(0, 0, 100, mana.height);   mana.crop(cropRect);
            face = game.add.sprite(-50, 10, 'facePic'); face.alpha = 0;
            boy.data.speech = game.add.text(5, 5, "", {font:"9px Sitka Small", fill:"#ffffff", align:"center" });
            boy.data.speech.anchor.setTo(.5,1);

            textInfo = game.add.text(240, 185, "", {font:"15px Sitka Small", fill:"#ffffff", align:"center" });
            textInfo.anchor.set(.5);
            textInfo.alpha = 0;
            textExamine = game.add.text(5, 5, "", {font:"9px Sitka Small", fill:"#ffffff", align:"center" });
            textExamine.anchor.set(.5);
            textSearch = game.add.text(5, 5, "", {font:"9px Sitka Small", fill:"#ffffff", align:"center" });
            textSearch.anchor.set(.5);
            textFinal = game.add.text(240, 185, "", {font:"16px Sitka Small", fill:"#ffffff", align:"center" });
            textFinal.anchor.set(.5);
            spellList = []; sawCast = false;
            exitButton = game.add.button(0,0, 'exitButton', quitGame, null, 'over', 'out', 'down');
						exitButton.scale.set(.35);

            var cheat = false;
            if (cheat) {
                textFindings.text+="Spell of Responsibility: S~aadw\n";
                textFindings.text+="Tag Alternative: W~dsas\n";
                textFindings.text+="Ulrick info found.\n";
            }
            infoUlrick = {found:cheat, loc:game.rnd.integerInRange(1,8)};
            infoSpell = {found:cheat, loc:game.rnd.integerInRange(1,8)};
            infoTag = {found:cheat, loc:game.rnd.integerInRange(1,8)};

            while (infoSpell.loc===infoUlrick.loc)
                infoSpell.loc = game.rnd.integerInRange(1,8);
            while (infoTag.loc===infoUlrick.loc || infoTag.loc===infoSpell.loc)
                infoTag.loc = game.rnd.integerInRange(1,8);
        },

        update: function () {
            this.alignWithCamera();   this.evalBookshelves();
            sprites.sort('y', Phaser.Group.SORT_ASCENDING);
            game.physics.arcade.overlap(spellcaster, boy, this.touchingBoy, null, this);
            this.moveSpellcaster();
            this.moveBoy();
            this.analyzeSpellInput();
            if (spellcaster.scale.y===.5 && this.time.time>spellcaster.data.shrinkTime) this.endShrink();
            if (decorLayer.alpha===.5 && this.time.time>spellcaster.data.fadeTime) game.add.tween(decorLayer).to({alpha:1}, 1000, "Linear", true);
            if (decoy.alpha===.75 && this.time.time>decoy.data.time) game.add.tween(decoy).to({alpha:0}, 1000, "Linear", true);
            if (spellcaster.alpha===0 && this.time.time>spellcaster.data.vanishTime) game.add.tween(spellcaster).to({alpha:1}, 1000, "Linear", true);
            if (this.lineExists(boy) && boy.data.lineOfSight.children[0].alpha===1 && this.time.time>spellcaster.data.revealTime)
                boy.data.lineOfSight.forEachExists(this.fadeObj, this);
            if (cropRect.width<100 && this.time.time>spellcaster.data.regenTime && !spellcaster.data.spellInUse) {
                cropRect.width++;   mana.updateCrop();   spellcaster.data.regenTime=this.time.time+spellcaster.data.regenRate;
            }

        },
        alignWithCamera: function () {
            manaBottom.x = game.camera.x;                   manaBottom.y = game.camera.y+game.height-manaBottom.height;
            manaTop.x = game.camera.x;                      manaTop.y = game.camera.y+game.height-manaTop.height;
            manaEmpty.x = game.camera.x+13;                 manaEmpty.y = game.camera.y+game.height-25;
            mana.x = game.camera.x+13;                      mana.y = game.camera.y+game.height-25;
            textInfo.x = game.camera.x+game.width/2;        textInfo.y = game.camera.y+game.height/2;
            textExamine.x = game.camera.x+game.width/2;     textExamine.y = game.camera.y+50;
            textSearch.x = game.camera.x+game.width/2;      textSearch.y = game.camera.y+game.height/2-50;
            textFinal.x = game.camera.x+game.width/2;       textFinal.y = game.camera.y+game.height/2;
            textBook.x = game.camera.x+5;                   textBook.y = game.camera.y+2;
            spellbook.x = game.camera.x-105;                spellbook.y = game.camera.y;
            textFindings.x = game.camera.x+5;               textFindings.y = game.camera.y+150;
            face.x = game.camera.x+game.width-face.width;   face.y = game.camera.y;
            exitButton.x = game.camera.x+game.width-exitButton.width-3;
            exitButton.y = game.camera.y+game.height-exitButton.height-3;
        },
        spellComment: function (c) {
          if (c==="wssaa") boy.data.speech.text="Like warping, huh?\nIt looks like fun.\nI wish I could do it.";
          else if (c==="wsasd") boy.data.speech.text="You can go anywhere\nyou mark first...\nThat's neat.";
          else if (c==="aswsd") boy.data.speech.text="The magic image you\nmade of yourself\nwas fascinating.\nIt looked very realistic.";
          else if (c==="assdd") boy.data.speech.text="Your electric magic\nhurt some. No hard\nfeelings though.";
          else if (c==="dssws") boy.data.speech.text="I can tag you even\nif I don't see you.\nBe careful using vanish\nwhen you're seen.";
          else if (c==="dasas") boy.data.speech.text="Your detection spell\nis cool. This would be\neasier if I always\nknew your location.";
          else if (c==="dsawa") boy.data.speech.text="Did you see where\nthat gap in the\nbookshelf leads?\nI could never fit.";
          else if (c==="swdwa") boy.data.speech.text="I hope you don't think\nI'm weird for this,\nbut I think little\nyou is cute.";
          else if (c==="sawda" && shared.char===1) boy.data.speech.text="You turned me into\na frog... Well, it wasn't\nfor long, so\nI forgive you.";
          else if (c==="sawda" && shared.char===2) boy.data.speech.text="I can't believe you\ntook control of my body.\nI'm glad we're not enemies.";
          else if (c==="sawda" && shared.char===3) boy.data.speech.text="Your speed is\nincredible.\nIf only I could run\nthat fast...";
          else if (c==="sawda" && shared.char===4) boy.data.speech.text="You had me chasing\nyour doppelganger.\nYour magic really\nis amazing.";
          else if (c==="saadw") boy.data.speech.text="So you found out\nmy secret...\nHow embarrassing.\nI feel bad about\nhaving done that.";
          else if (c==="wdsas") boy.data.speech.text="Being teleported gave\nme a strange feeling,\nbut I enjoyed it\nnonetheless.";
        },
        analyzeSpellInput: function () {
            if (spellKeys.t.downDuration(1) && textSearch.text==="Press T to talk.") {
                if (speechEvent) game.time.events.remove(speechEvent);  speechEvent = null;
                var n = spellcaster.animations.currentAnim.name, bn = boy.animations.currentAnim.name;
                if (n==="side" && spellcaster.scale.x>0 && bn!=="left") boy.play('left', boySpeed/12);
                else if (n==="side" && spellcaster.scale.x<0 && bn!=="right") boy.play('right', boySpeed/12);
                else if (n==="up" && bn!=="down") boy.play('down', boySpeed/12);
                else if (n==="down" && bn!=="up") boy.play('up', boySpeed/12);
                face.alpha = 1;   game.time.events.add(6000, hideFace, this);
                function hideFace () {face.alpha=0;}
                speechEvent = game.time.events.add(6000, this.endSpeech, this);
                var upper = 3; if (spellList.length>2) upper++;
                var say = game.rnd.integerInRange(1, upper);
                var sNum = -1; if (spellList.length>0) sNum = game.rnd.integerInRange(0, spellList.length-1);
                while (say===lastTopic && !(say>2 && spellList.length>1)) say = game.rnd.integerInRange(1, upper);
                while (say>2 && sNum===lastSpell && spellList.length>1) sNum = game.rnd.integerInRange(0, spellList.length-1);
                if (tagCount===0) boy.data.speech.text = "Want to play tag?\nMake some distance\nbetween us and press\nR when you're ready.";
                else if (say===1 && seeTotal>5000) boy.data.speech.text = "I thought I might\nnever catch you.\nDid you get bored\nand let me?";
                else if (say===1 && seeTotal>2000) boy.data.speech.text = "You're pretty good.\nYou evaded me for\na while there.";
                else if (say===1 && seeTotal<750) boy.data.speech.text="That was quick\nonce I saw you.\nAlways be ready to\nescape with a spell.";
                else if (say===1) boy.data.speech.text="You did a decent job.\nTag can be a hard game.";
                else if (say===2 && tagCount>=5 && infoUlrick.found && game.rnd.integerInRange(0,1)) { shared.friend = shared.char;
                    boy.data.speech.text="I truly thank you\nfor the company.\nI was lonely\nbefore you came.";
                } else if (say===2 && tagCount>=2 && game.rnd.integerInRange(0,1)) boy.data.speech.text="Are you having fun?\nI like playing with you.";
                else if (say===2) boy.data.speech.text="Just press R if you'd\nlike to play again.\nI'll play however\nmuch you want.";
                else if (say>2 && spellList.length===0) boy.data.speech.text="I didn't see you cast\nany spells that time.\nI'd like to see more\nof your magic.";
                else if (say>2) this.spellComment(spellList[sNum]);
                //console.log(spellList);
                lastTopic = say;  lastSpell = sNum;
            }
            if (spellKeys.r.downDuration(1) && !chasing && lastTopic && boy.data.speech.text==="")
                {chasing = true;  seeTotal=0;  spellList = []; face.alpha=0;}
            if (spellKeys.h.downDuration(1)) {
                if (spellbook.alpha==0) {textBook.text="Press H to close spellbook.";  spellbook.alpha=1;  textFindings.alpha=1;}
                else {textBook.text="Press H to open spellbook.";  spellbook.alpha=0;  textFindings.alpha=0;}
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
        startSpell: function () {   spellcaster.data.specialInUse = false;  sawCast = false;
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
                if (boy.data.seeSC) sawCast = true;
            } else if (circle.data==="asas" && spellcaster.data.spellType==="d") { cost = 25;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                boy.data.lineOfSight.forEachExists(fadeDot, this);
                function fadeDot (dot) {game.add.tween(dot).to({alpha:1}, 1000, "Linear", true);}
                spellcaster.data.revealTime = this.time.time+13000;
                if (boy.data.seeSC) sawCast = true;
            } else if (circle.data==="ssws" && spellcaster.data.spellType==="d") { cost = 40;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (boy.data.seeSC) sawCast = true;
                game.add.tween(spellcaster).to({alpha:0}, 1000, "Linear", true);
                spellcaster.data.vanishTime = this.time.time+10000;
            } else if (circle.data==="sasd" && spellcaster.data.spellType==="w") { cost = 30;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (boy.data.seeSC) sawCast = true;
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
            } else if (circle.data==="dsas" && spellcaster.data.spellType==="w" && infoTag.found) { cost = 30;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                var offScreen = (tagAlt.x+tag.width<game.camera.x || tagAlt.x>=game.camera.x+game.width ||
                                tagAlt.y+tag.height<game.camera.y || tagAlt.y>=game.camera.y+game.height);
                if (tagAlt.alpha===0 || offScreen) {
                    var xx = tagAlt.x, yy = tagAlt.y;
                    tagAlt.centerX = spellcaster.centerX;    tagAlt.centerY = spellcaster.centerY;
                    if (this.collidingWithWall(tagAlt)) { tagAlt.x=xx;  tagAlt.y=yy;  end("Too close to a wall.");  return; }
                    tagAlt.alpha=0;   game.add.tween(tagAlt).to({alpha:1}, 1000, "Linear", true);
                } else {
                    if (this.lineExists(boy) && boy.data.lineOfSight.children[0].tint!==0x00ff00) { end("No one sees you."); return; }
                    if (!infoUlrick.found) { end("Insufficient\nknowledge of target."); return; }
                    game.time.events.add(150, warpBoyToTag, this);
                    function warpBoyToTag () {
                        boy.centerX = tagAlt.centerX;  boy.centerY = tagAlt.centerY;  tagAlt.alpha = 0;
                        if (!mainGame.listHas("wdsas")) spellList.push("wdsas");
                    }
                }
            } else if (circle.data==="ssaa" && spellcaster.data.spellType==="w") { cost = 25;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (boy.data.seeSC) sawCast = true;
                game.time.events.add(150, warpForward, this, spellcaster.animations.currentAnim.name, (spellcaster.scale.x>0));
                function warpForward (a, facingRight) { this.alignWithCamera();
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
            } else if (circle.data==="aadw" && spellcaster.data.spellType==="s" && infoSpell.found) { cost = 25;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (this.lineExists(boy) && boy.data.lineOfSight.children[0].tint!==0x00ff00) { end("No one sees you."); return; }
                boy.data.stun = 200;
                game.time.events.add(500, startSpeech, this);    game.time.events.add(3500, endSpeech, this);
                function startSpeech() {
                    if (!infoUlrick.found) boy.data.speech.text = "...";
                    else {  boy.data.speech.text = "I'm responsible for..\n..teasing other animals\nin the past.";
                        if (!mainGame.listHas("saadw")) spellList.push("saadw");
                    }
                }
                function endSpeech() { boy.data.speech.text = ""; }
            } else if (circle.data==="awda" && spellcaster.data.spellType==="s") { cost = 55;
                if (cropRect.width-cost < 0) { end("Not enough mana."); return; }
                if (shared.char===1) {
                    var applied = false;
                    if (this.lineExists(boy) && boy.data.lineOfSight.children[0].tint===0x00ff00 && !chasing) { end("Don't be mean."); return; }
                    if (boy.data.seeSC) {  sawCast = true;
                        boy.data.frogTimer = 5000;    boy.data.frog = game.add.sprite(boy.centerX,boy.centerY+7,'frog');
                        sprites.add(boy.data.frog);   boy.data.frog.alpha=0;   boy.data.frog.anchor.set(.5);  boy.data.frog.scale.set(.5);
                        boy.data.frog.animations.add('down', [0]);  boy.data.frog.animations.add('right', [1]);
                        boy.data.frog.animations.add('up', [2]);  boy.data.frog.animations.add('left', [3]);
                        boy.data.frog.play(boy.animations.currentAnim.name);
                        game.add.tween(boy.data.frog).to({alpha:1}, 1000, "Linear", true);
                        game.add.tween(boy).to({alpha:0}, 1000, "Linear", true);  applied = true;
                    }
                    if (!applied) { end("No one sees you."); return; }
                } else if (shared.char===2) { var l = null;
                    if (this.lineExists(boy)) l = boy.data.lineOfSight.children[0].tint;
                    if (this.lineExists(boy) && (l===0x00ff00 || l===0xffff00) && chasing) {
                        boy.data.controlled = true;   sawCast = true;
                    } else if (this.lineExists(boy) && (l===0x00ff00 || l===0xffff00)) { end("Don't be mean."); return; }
                    else { end("No one is in clear view."); return; }
                } else if (shared.char===3) {
                    spellcaster.data.speed = 140;
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
                boy.data.frogTimer = 0;
            } else if (shared.char===2) {
                boy.data.controlled = false;
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
            if (spellcaster.centerY<460) {
                spellcaster.data.shrinkTime = this.time.time+1000;
            } else {
                var sign=1;   if (spellcaster.scale.x<0) sign=-1;
                game.add.tween(spellcaster.scale).to({x:.75*sign}, 1000, "Linear", true);
                game.add.tween(spellcaster.scale).to({y:.75}, 1000, "Linear", true);
            }
        },
        listHas: function (s) {
            var i = spellList.length;
            while (i--)
               if (spellList[i] === s)
                   return true;
            return false;
        },
        endSpell: function () {
            this.windowResize(320);  boySpeed=80;   boySight=200;   spellcaster.data.regenRate=425;
            if (spellcaster.data.spellType!=="NaN") {
                var str = spellcaster.data.spellType+circle.data;
                if (sawCast && !this.listHas(str) && chasing)
                    spellList.push(str);

                if (manaTop.tint===0xcc33ff && spellcaster.data.spellType!=="w")  boySpeed-=6;
                if (manaBottom.tint===0xcc33ff && spellcaster.data.spellType!=="w")  boySpeed-=6;
                if (manaTop.tint===0xffa33a && spellcaster.data.spellType!=="a")  this.windowResize(game.width+=64);
                if (manaBottom.tint===0xffa33a && spellcaster.data.spellType!=="a")  this.windowResize(game.width+=64);
                if (manaTop.tint===0x3385ff && spellcaster.data.spellType!=="s")  spellcaster.data.regenRate-=60;
                if (manaBottom.tint===0x3385ff && spellcaster.data.spellType!=="s")  spellcaster.data.regenRate-=60;
                if (manaTop.tint===0x33ff33 && spellcaster.data.spellType!=="d")  boySight-=50;
                if (manaBottom.tint===0x33ff33 && spellcaster.data.spellType!=="d")  boySight-=50;

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
                game.physics.arcade.overlap(boy, decoy, decoyLayerCheck, null, this);
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
            if (elec.alpha===1 && e.data.stun<=0 && (chasing || e!==boy)) {
                e.data.stun = (3200-(Math.abs(elec.width*elec.height)/10))/8;
                e.data.shock = game.add.sprite(e.centerX,e.centerY,'shockMarks');
                shockMarks.add(e.data.shock);
                e.data.shock.anchor.set(.5);
                e.data.shock.animations.add('shock', [0,1,2]);
                e.data.shock.play('shock', 3, true);
                if (e===boy && !this.listHas("assdd"))
                    spellList.push("assdd");
            }
        },
        touchingBoy: function (sc, b) {
            if (sc.centerY+sc.height/2 < boy.centerY+boy.height/2 && sc.z > boy.z) sprites.swap(sc, boy);
            else if (sc.centerY+sc.height/2 > boy.centerY+boy.height/2 && sc.z < boy.z) sprites.swap(sc, boy);
            if (boy && boy.data.frog) { var f = boy.data.frog;
                if (sc.centerY+sc.height/2 < f.centerY+f.height/2 && sc.z > f.z) sprites.swap(sc, f);
                else if (sc.centerY+sc.height/2 > f.centerY+f.height/2 && sc.z < f.z) sprites.swap(sc, f);
            }
            if (Math.abs(sc.centerY-boy.centerY)<15 && Math.abs(sc.centerX-boy.centerX)<15 && boy.alpha===1 && !boy.data.controlled && chasing) {
                chasing = false;
                if (speechEvent) game.time.events.remove(speechEvent);  speechEvent = null;
                speechEvent = game.time.events.add(3000, this.endSpeech, this);
                var say = game.rnd.integerInRange(1, 2);
                if (say===1) boy.data.speech.text = "Gotcha!";
                else if (say===2) boy.data.speech.text = "Tag!";

                tagCount++; //console.log(seeTotal);
                moveTime = this.time.time+game.rnd.integerInRange(2500, 5000);
            }
        },
        endSpeech: function () { boy.data.speech.text = ""; speechEvent=null; },
        moveBoy: function () {
            var b = boy.data.collisionBoxes;
            boy.data.speech.x = boy.centerX;  boy.data.speech.y = boy.centerY-15;
            game.physics.arcade.overlap(boy, electricity, this.stunCheck, null, this);
            if (boy.data.stun>0) {boy.data.stun--;  boy.data.counter=0;   boy.body.velocity.set(0);}
            else if (boy.data.shock) {sprites.remove(boy.data.shock); boy.data.shock.kill(); boy.data.shock = null;}
            if (boy.data.frogTimer>0) {boy.data.frogTimer--;  boy.data.counter=0;   boy.body.velocity.set(0);}
            else if (boy.data.frog && boy.data.frog.alpha===1) {
                game.add.tween(boy.data.frog).to({alpha:0}, 1000, "Linear", true);
                game.add.tween(boy).to({alpha:1}, 1000, "Linear", true);
            } else if (boy.data.frog && boy.data.frog.alpha<.1) {sprites.remove(boy.data.frog);  boy.data.frog.kill(); boy.data.frog=null;}
            if (decoy.alpha>.1 && boy.data.distractCount<200) game.physics.arcade.overlap(boy, decoy, decoyCheck, null, this);
            else if (decoy.alpha<=.1) {boy.data.distractCount = 0;  boy.data.seeMark.alpha = 0;}
            function decoyCheck (e, d) {
                if (Math.abs(e.centerY-d.centerY)<20 && Math.abs(e.centerX-d.centerX)<20 && chasing) {
                    e.data.distractCount++;
                    e.data.counter=0;   e.body.velocity.set(0);
                    boy.data.seeMark.play('?');   boy.data.seeMark.alpha = 1;
                    if (d.data.controllable && !this.listHas("sawda"))
                        spellList.push("sawda");
                    else if (!d.data.controllable && !this.listHas("aswsd"))
                        spellList.push("aswsd");
                }
            }
            var a = boy.animations.currentAnim;
            var distanceX = spellcaster.centerX - boy.centerX;  var distXD = decoy.centerX - boy.centerX;
            var distanceY = spellcaster.centerY - boy.centerY;  var distYD = decoy.centerY - boy.centerY;
            var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
            if (decoy.alpha>0 && boy.data.distractCount<200 && Math.sqrt(distXD*distXD+distYD*distYD)<distance) {
                distance = Math.sqrt(distXD*distXD+distYD*distYD);  distanceX=distXD;  distanceY=distYD;
            }
            var angle = game.math.radToDeg(Math.atan2(distanceY, distanceX));
            boy.data.lineOfSight.setAll('tint', 0x00ff00);
            if (a.name==="right" && (angle < -70 || angle > 70)) boy.data.lineOfSight.setAll('tint', 0xffff00);
            else if (a.name==="left" && (angle<110 && angle>-110)) boy.data.lineOfSight.setAll('tint', 0xffff00);
            else if (a.name==="up" && !(angle<-20 && angle>-160)) boy.data.lineOfSight.setAll('tint', 0xffff00);
            else if (a.name==="down" && !(angle<160 && angle>20)) boy.data.lineOfSight.setAll('tint', 0xffff00);
            boy.data.lineOfSight.forEachExists(resetDot, this);
            function resetDot (dot) {
                dot.reset(boy.centerX+distanceX*dot.z/20, boy.centerY+distanceY*dot.z/20);
                game.physics.arcade.overlap(dot, wallLayer, sightCheck, null, this);
            } function sightCheck (dot, wall) { if (wall.index>=0) boy.data.lineOfSight.setAll('tint', 0xffffff); }
            if (distance > boySight || spellcaster.alpha===0) boy.data.lineOfSight.setAll('tint', 0x99c2ff);
            if (this.lineExists(boy) && boy.data.lineOfSight.children[0].tint===0x00ff00 && !boy.data.seeSC && chasing) {
                boy.data.seeSC = true;    boy.data.seeMark.play('!');   boy.data.seeMark.alpha = 1;
            } else if (this.lineExists(boy) && boy.data.lineOfSight.children[0].tint!==0x00ff00) {
                boy.data.seeSC = false;
                boy.data.seeMark.alpha = 0;
            }
            if (boy.data.seeSC && chasing) { boy.data.seeMark.alpha = 1;
                if (boy.alpha!==1 || boy.data.controlled || boy.data.speech.text!=="") boy.data.seeMark.alpha = 0;
                if (boy.data.distractCount===0) boy.data.seeMark.play('!');
                boy.data.moveList = []; var ss="";
                if (angle >= -45 && angle <= 45) {boy.data.moveList.push(1); ss="going right "}
                else if (angle<-45 && angle>-135) {boy.data.moveList.push(3); ss="going up "}
                else if (angle<135 && angle>45) {boy.data.moveList.push(4); ss="going down "}
                else {boy.data.moveList.push(2); ss="going left "}
                switch (boy.data.moveList[0]) {
                    case 1: if (angle < 0) {boy.data.moveList.push(3); ss+="then up";}
                            else {boy.data.moveList.push(4); ss+="then down";} break;
                    case 2: if (angle < 0) {boy.data.moveList.push(3); ss+="then up";}
                            else {boy.data.moveList.push(4); ss+="then down";} break;
                    case 3: if (angle > -90) {boy.data.moveList.push(1); ss+="then right";}
                            else {boy.data.moveList.push(2); ss+="then left";} break;
                    case 4: if (angle < 90) {boy.data.moveList.push(1); ss+="then right";}
                            else {boy.data.moveList.push(2); ss+="then left";} break;
                } //console.log(ss);
                if (spellcaster.data.speed>100 && !this.listHas("sawda"))
                    spellList.push("sawda");
                if (spellcaster.scale.y===.5 && !this.listHas("swdwa"))
                    spellList.push("swdwa");
            } else if (this.lineExists(boy) && boy.data.moveList.length!==0 && boy.data.lineOfSight.children[0].tint===0xffff00) {
                changeDirection();
            }
            if (boy.data.seeMark.animations.currentAnim.name==="!" && boy.data.seeMark.alpha===1) seeTotal++;
            updateHitBoxes();
            game.physics.arcade.collide(boy, wallLayer);
            // Potentially change direction if a new path opens to boy's side.
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
                boy.body.velocity.set(0);   var r=1, c=0, item=0;
                while (r>0 && !boy.data.controlled && boy.alpha===1 && c<33 && chasing) {
                    r = game.rnd.integerInRange(1, 4);
                    if (boy.data.moveList.length>0 && item===0) {
                        r = boy.data.moveList[0];  item = boy.data.moveList[0];  boy.data.moveList.shift();;
                    }
                    if (r===1) {r = tryDirection(b.rightUp.data, b.right.data, b.rightDown.data, true, 1, 1);}
                    else if (r===2) {r = tryDirection(b.leftUp.data, b.left.data, b.leftDown.data, true, -1, 2);}
                    else if (r===3) {r = tryDirection(b.upLeft.data, b.up.data, b.upRight.data, false, -1, 3);}
                    else if (r===4) {r = tryDirection(b.downLeft.data, b.down.data, b.downRight.data, false, 1, 4);}
                    c++;
                    if (r>0 && item>0) {boy.data.moveList.unshift(item); item=-1;}
                    else item=0;
                }
            }
            function tryDirection (b1,b,b2,side,sign,dir) {
                if (b1>0 || b2>0) {   // Consider direction if there is an opening.
                    if (b1>0 && b2>0 && b>0) { // Nothing is blocked, go ahead and move.
                        if (side) boy.body.velocity.x = boySpeed*sign;
                        else boy.body.velocity.y = boySpeed*sign;
                    } else if (b1>0 && b2>0) { var d; // Blocked in middle; choose a perpendicular direction to move first.
                        if (boy.data.moveList.length>0) { d = boy.data.moveList[0];  boy.data.moveList.shift(); }
                        else if (side) d = game.rnd.integerInRange(3, 4);
                        else d = game.rnd.integerInRange(1, 2);
                        if (d===1 && isClear(1)) {boy.data.moveList.unshift(dir);   boy.body.velocity.x = boySpeed;}
                        else if (d===2 && isClear(2)) {boy.data.moveList.unshift(dir);    boy.body.velocity.x = -boySpeed;}
                        else if (d===3 && isClear(3)) {boy.data.moveList.unshift(dir);    boy.body.velocity.y = -boySpeed;}
                        else if (d===4 && isClear(4)) {boy.data.moveList.unshift(dir);    boy.body.velocity.y = boySpeed;}
                        else return 1;
                    } else if (b1>0) { // Must move up (if trying left/right) or left (if trying up/down) to get to desired direction.
                        if (side && isClear(3)) {boy.data.moveList.unshift(dir);   boy.body.velocity.y = -boySpeed;}
                        else if (!side && isClear(2)) {boy.data.moveList.unshift(dir);   boy.body.velocity.x = -boySpeed;}
                        else return 1;
                    } else { // Must move down (if trying left/right) or right (if trying up/down) to get to desired direction.
                        if (side && isClear(4)) {boy.data.moveList.unshift(dir);    boy.body.velocity.y = boySpeed;}
                        else if (!side && isClear(1)) {boy.data.moveList.unshift(dir);   boy.body.velocity.x = boySpeed;}
                        else return 1;
                    } return 0;
                } return 1;
            }
            function isClear (d) {
                if (d===1 && b.rightUp.data>0 && b.right.data>0 && b.rightDown.data>0) return true;
                else if (d===2 && b.leftUp.data>0 && b.left.data>0 && b.leftDown.data>0) return true;
                else if (d===3 && b.upLeft.data>0 && b.up.data>0 && b.upRight.data>0) return true;
                else if (d===4 && b.downLeft.data>0 && b.down.data>0 && b.downRight.data>0) return true;
                else return false;
            }

            if (boy.data.controlled) {
                boy.body.velocity.set(0);
                if (spellKeys.d.isDown) boy.body.velocity.x = boySpeed;
                else if (spellKeys.a.isDown) boy.body.velocity.x = -boySpeed;
                else if (spellKeys.w.isDown) boy.body.velocity.y = -boySpeed;
                else if (spellKeys.s.isDown) boy.body.velocity.y = boySpeed;
            } else if (!chasing && this.time.time>moveTime) {
                moveTime = this.time.time+game.rnd.integerInRange(2500, 5000);
                var r = game.rnd.integerInRange(1, 6);
                if (r===1 && isClear(r)) {boy.body.velocity.x = boySpeed/2; moveCountDown=50;}
                else if (r===2 && isClear(r)) {boy.body.velocity.x = -boySpeed/2; moveCountDown=50;}
                else if (r===3 && isClear(r)) {boy.body.velocity.y = -boySpeed/2; moveCountDown=50;}
                else if (r===4 && isClear(r)) {boy.body.velocity.y = boySpeed/2; moveCountDown=50;}
            } else if (boy.body.velocity.x===0 && boy.body.velocity.y===0 && boy.data.counter>10) {
                if (a.name==="right") boy.body.velocity.x = boySpeed;
                if (a.name==="left") boy.body.velocity.x = -boySpeed;
                if (a.name==="up") boy.body.velocity.y = -boySpeed;
                if (a.name==="down") boy.body.velocity.y = boySpeed;
                changeDirection();  boy.data.counter = 0;
            } else if (boy.body.velocity.x===0 && boy.body.velocity.y===0) boy.data.counter++;
            else boy.data.counter = 0;
            if (!chasing && moveCountDown<=0 && !boy.data.controlled || boy.data.speech.text!=="") boy.body.velocity.set(0);
            if (!chasing && moveCountDown>0) moveCountDown--;

            if (boy.body.velocity.x > 0 && (a.name!=="right" || !a.isPlaying))
                boy.play('right', boySpeed/12);
            else if (boy.body.velocity.x < 0 && (a.name!=="left" || !a.isPlaying))
                boy.play('left', boySpeed/12);
            else if (boy.body.velocity.y < 0 && (a.name!=="up" || !a.isPlaying))
                boy.play('up', boySpeed/12);
            else if (boy.body.velocity.y > 0 && (a.name!=="down" || !a.isPlaying))
                boy.play('down', boySpeed/12);

            boy.data.seeMark.centerX = boy.centerX; boy.data.seeMark.centerY = boy.centerY-20;
            if (this.time.time>boy.data.alignTime) {   boy.data.alignTime=this.time.time+250;
                if (boy.centerX%1!==0) boy.centerX = Math.round(boy.centerX);
                if (boy.centerY%1!==0) boy.centerY = Math.round(boy.centerY);
            }
            function updateHitBoxes () {
                b.upLeft.centerX = boy.centerX-15-1;    b.upLeft.centerY = boy.centerY-16-1;
                b.upRight.centerX = boy.centerX+16-1;   b.upRight.centerY = boy.centerY-16-1;
                b.downLeft.centerX = boy.centerX-15-1;  b.downLeft.centerY = boy.centerY+17-1;
                b.downRight.centerX = boy.centerX+16-1; b.downRight.centerY = boy.centerY+17-1;
                b.rightUp.centerX = boy.centerX+17-1;   b.rightUp.centerY = boy.centerY-15-1;
                b.rightDown.centerX = boy.centerX+17-1; b.rightDown.centerY = boy.centerY+16-1;
                b.leftUp.centerX = boy.centerX-16-1;    b.leftUp.centerY = boy.centerY-15-1;
                b.leftDown.centerX = boy.centerX-16-1;  b.leftDown.centerY = boy.centerY+16-1;
                b.up.centerX = boy.centerX;             b.up.centerY = boy.centerY-17;
                b.down.centerX = boy.centerX;           b.down.centerY = boy.centerY+16;
                b.left.centerX = boy.centerX-17;        b.left.centerY = boy.centerY;
                b.right.centerX = boy.centerX+16;       b.right.centerY = boy.centerY;
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
        },
        lineExists: function (e) {return (e && e.data && e.data.lineOfSight && e.data.lineOfSight.children[0])},
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
            function facingBoy() {return (facingUp() && boy.centerY<spellcaster.centerY || facingDown() && boy.centerY>spellcaster.centerY
                                  || facingLeft() && boy.centerX<spellcaster.centerX || facingRight() && boy.centerX>spellcaster.centerX);}
            if (Math.abs(spellcaster.centerY-boy.centerY)<25 && Math.abs(spellcaster.centerX-boy.centerX)<25
                    && !chasing && facingBoy() && boy.data.speech.text==="") bookShelf=-3315;

            if (x>=20 && x<=29 && y===28 && facingUp()) bookShelf = 1;
            else if (x===21 && y>=31 && y<=35 && facingRight() || x===23 && y>=31 && y<=35 && facingLeft()) bookShelf = 2;
            else if (x===25 && y>=31 && y<=35 && facingRight() || x===27 && y>=31 && y<=35 && facingLeft()) bookShelf = 3;
            else if (x>=23 && x<=28 && y===40 && facingDown() || x>=23 && x<=28 && y===42 && facingUp()) bookShelf = 4;
            else if (x>=30 && x<=32 && y===35 && facingUp()) bookShelf = 5;
            else if (x>=34 && x<=39 && y===40 && facingDown() || x>=34 && x<=39 && y===42 && facingUp()) bookShelf = 6;
            else if (x>=36 && x<=40 && y===34 && facingDown() || x>=36 && x<=40 && y===36 && facingUp()) bookShelf = 7;
            else if (x>=33 && x<=42 && y===28 && facingUp()) bookShelf = 8;
            if (bookShelf>0 && textSearch.text==="") textExamine.text = "Press E to examine\nbookshelf "+bookShelf+".";
            else if (searchEvent && bookShelf===0) {
                game.time.events.remove(searchEvent);   searchEvent=null;
                textSearch.text="Your search has\nbeen interrupted.";
                emptySearchEvent = game.time.events.add(3000, emptySearch, this);
            } else if (bookShelf===-3315) textSearch.text = "Press T to talk.";
            else if (bookShelf<1 && textSearch.text!=="Your search has\nbeen interrupted.") textSearch.text = "";
            function emptySearch () {textSearch.text=""; emptySearchEvent=null;}
        },
        finishSearch: function () {
            searchEvent=null;
            if (bookShelf===infoSpell.loc) {
                if (!infoSpell.found) textFindings.text+="Spell of Responsibility: S~aadw\n";  infoSpell.found=true;
                textSearch.text="You found the\n\"Spell of Responsibility.\"\nHow to cast: S~aadw\nPrompt someone to\nreveal what they're\nresponsible for.";
            } else if (bookShelf===infoTag.loc) {
                if (!infoTag.found) textFindings.text+="Tag Alternative: W~dsas\n";   infoTag.found = true;
                textSearch.text="You found the spell\n\"Tag Alternative.\"\nHow to cast: W~dsas\nWarp nearest person\nwho sees you to\ntag on screen.";
            } else if (bookShelf===infoUlrick.loc) {
                if (!infoUlrick.found) textFindings.text+="Ulrick info found.\n";   infoUlrick.found = true;
                textSearch.text="One book describes an\nattentive wolf boy who\nseeks nothing more\nthan adventure and\ncompanionship.";
            } else if (bookShelf>0) textSearch.text="You found nothing\nof interest.";
        },
    }; return mainGame;
};
