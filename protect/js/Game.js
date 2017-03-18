"use strict";

GameStates.makeGame = function( game, shared ) {
    var music;
    var spaceKey;
    var rKey;
    var aKey;
    var dKey;
    var gameOver;

    var dog;
    var background;
    var moving;
    var fast;
    var rocket_launcher;
    var rocket_shots;
    var rocketTime;
    var laser_gun;
    var laser_shots;
    var laserTime;
    var sword;
    var sword_beams;
    var spiny_shield;
    var weaponInHand;
    var slot1;
    var slot2;
    var slot3;
    var slot4;

    var aliens;
    var alienTime;
    var alien_growl;
    var alien_cry;
    var catcher;
    var squish;
    var splatters;
    var slash;
    var shatter;
    var shatterSFX;

    var timeRemaining;
    var textTime;
    var textHelp;
    var textHelp2;
    var backButton;
    var counter;

    function quitGame() {
        if (music)
            music.stop();
        music = null;
        spaceKey = null;
        rKey = null;
        aKey = null;
        dKey = null;
        gameOver = null;
        if (background) {
            background.first.kill();
            background.first = null;
            background.second.kill();
            background.second = null;
            background.clearing.kill();
            background.clearing = null;
        }
        background = null;
        moving = null;
        fast = null;
        rocketTime = null;
        laserTime = null;
        cleanGroups(rocket_shots, sword_beams, laser_shots);
        cleanObjects(laser_gun, rocket_launcher, dog);
        cleanObjects(sword, spiny_shield, slot1);
        cleanObjects(slot2, slot3, slot4);
        weaponInHand = null;
        if (aliens)
            aliens.destroy();
        aliens = null;
        alienTime = null;
        alien_growl = null;
        alien_cry = null;
        catcher = null;
        squish = null;
        splatters = null;
        slash = null;
        shatter = null;
        shatterSFX = null;
        timeRemaining = null;
        cleanObjects(textHelp, textTime, backButton);
        cleanObjects(textHelp2, null, null);
        counter = null;

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');
        function cleanObjects (o1, o2, o3) {
            if (o1) o1.kill(); o1 = null;
            if (o2) o2.kill(); o2 = null;
            if (o3) o3.kill(); o3 = null;
        }
        function cleanGroups (g1, g2, g3) {
            if (g1) g1.destroy(); g1 = null;
            if (g2) g2.destroy(); g2 = null;
            if (g3) g3.destroy(); g3 = null;
        }
    }

    var mainGame = {
        create: function () {
            gameOver = false;
            timeRemaining = 180;
            moving = true;
            fast = false;
            counter = 0;
            background = {first:null, second:null, clearing:null};
            background.first = game.add.sprite(0, 0, 'background');
            background.second = game.add.sprite(768, 0, 'background');
            background.clearing = game.add.sprite(1000, 0, 'background_clearing');
            game.physics.startSystem(Phaser.Physics.ARCADE);

            dog = game.add.sprite(450, 120, 'dog');
            dog.animations.add('run', [0,1,2,3,4,5,6], 20, true);
            dog.animations.add('fall', [7], 20, true);
            dog.animations.add('wag_tail', [8,9], 20, true);
            dog.animations.add('yawn', [10,11,12,13], 20, true);
            dog.animations.add('turn', [14,15,16], 20, true);
            dog.animations.add('bow', [17,16], 20, true);
            game.physics.enable(dog, Phaser.Physics.ARCADE);
            dog.animations.play('run', 15, true);
            dog.data = {caught:false};

            laserTime = 0;
            laser_shots = game.add.physicsGroup();
            laser_shots.enableBody = true;
            laser_shots.physicsBodyType = Phaser.Physics.ARCADE;
            laser_shots.createMultiple(10, 'laser_shot');
            laser_shots.setAll('anchor.x', 0.5);
            laser_shots.setAll('anchor.y', 0.5);

            rocketTime = 0;
            rocket_shots = game.add.physicsGroup();
            rocket_shots.enableBody = true;
            rocket_shots.physicsBodyType = Phaser.Physics.ARCADE;
            rocket_shots.createMultiple(10, 'rocket_shot');
            rocket_shots.setAll('anchor.x', 0.5);
            rocket_shots.setAll('anchor.y', 0.5);

            sword_beams = game.add.physicsGroup();
            sword_beams.enableBody = true;
            sword_beams.physicsBodyType = Phaser.Physics.ARCADE;
            sword_beams.createMultiple(10, 'sword_beam');
            sword_beams.setAll('anchor.x', 0.5);
            sword_beams.setAll('anchor.y', 0.5);

            slot1 = game.add.sprite(315, 256, 'slot');
            slot1.data = false;
            slot2 = game.add.sprite(360, 256, 'slot');
            slot2.data = false;
            slot3 = game.add.sprite(405, 256, 'slot');
            slot3.data = false;
            slot4 = game.add.sprite(450, 256, 'slot');
            slot4.data = false;
            laser_gun = this.makeSprite("laser_gun");
            rocket_launcher = this.makeSprite("rocket_launcher");
            sword = this.makeSprite("sword");
            game.physics.arcade.enable(sword);
            spiny_shield = this.makeSprite("spiny_shield");
            game.physics.arcade.enable(spiny_shield);
            spiny_shield.data.durability += 100;
            spiny_shield.alpha = .67;
            shatterSFX = game.add.audio('shatterSFX');
            shatter = game.add.sprite(0,0, 'shatter');
            shatter.alpha = 0;

            alienTime = 500;
            aliens = game.add.physicsGroup();
            aliens.enableBody = true;
            aliens.physicsBodyType = Phaser.Physics.ARCADE;
            aliens.createMultiple(10, 'alien');
            aliens.setAll('anchor.x', 0.5);
            aliens.setAll('anchor.y', 0.5);
            alien_growl = game.add.audio('alien_growl');
            alien_growl.volume -= .5;
            alien_cry = game.add.audio('alien_cry');
            alien_cry.volume -= .5;
            squish = game.add.audio('squish');
            squish.volume -= .5;
            splatters = game.add.group();
            splatters.createMultiple(10, 'blood');
            slash = game.add.audio('slash');
            slash.volume -= .5;

            music = game.add.audio('music');
            music.play();
            music.volume -= .5;
            spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            rKey = game.input.keyboard.addKey(Phaser.KeyCode.R);
            aKey = game.input.keyboard.addKey(Phaser.KeyCode.A);
            dKey = game.input.keyboard.addKey(Phaser.KeyCode.D);
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

            backButton = game.add.button(game.width+200, game.height-38, 'backButton', quitGame, null, 'over', 'out', 'down');
            backButton.height *= .45;
            backButton.width *= .45;

            textTime = game.add.text(22, 267, "Time Left: "+timeRemaining, {font: "18px Arial Black", fill: "#ffffff", align: "center" });
            textHelp = game.add.text(185, 257, "SPACE: toggle fast run\nR: return dropped", {font: "10px Arial", fill: "#ffffff", align: "center" });
            textHelp2 = game.add.text(185, 266, "A/D: rotate held weapon\nweapons to inventory", {font: "10px Arial", fill: "#ffffff", align: "center" });
            game.time.events.add(Phaser.Timer.SECOND, this.countDown, this);
        },
        countDown: function () {
            timeRemaining--;
            textTime.text = "Time Left: "+timeRemaining;
            if (timeRemaining > 0 && !gameOver)
                game.time.events.add(Phaser.Timer.SECOND, this.countDown, this);
            else {
                gameOver = true;
                if (!dog.data.caught) {
                    aliens.setAll('data.health', 0);
                    aliens.forEachExists(this.checkUp, this);
                    this.changeMusic();
                }
            }
        },

        fireLaser: function () {
            if (this.time.time > laserTime) {
                var laser = laser_shots.getFirstExists(false);
                if (laser) {
                    var pX = laser_gun.centerX+15*Math.cos(laser_gun.rotation-Math.PI*.825);
                    var pY = laser_gun.centerY+15*Math.sin(laser_gun.rotation-Math.PI*.825);
                    laser.reset(pX, pY);
                    laser.rotation = laser_gun.rotation-Math.PI*.825;
                    game.physics.arcade.velocityFromRotation(laser.rotation, 250, laser.body.velocity);
                    laserTime = this.time.time + 100;
                }
            }
        },

        fireRocket: function () {
            if (this.time.time > rocketTime) {
                var rocket = rocket_shots.getFirstExists(false);
                if (rocket) {
                    var pX = rocket_launcher.centerX+15*Math.cos(rocket_launcher.rotation-Math.PI*1.2);
                    var pY = rocket_launcher.centerY+15*Math.sin(rocket_launcher.rotation-Math.PI*1.2);
                    rocket.reset(pX, pY);
                    rocket.rotation = rocket_launcher.rotation-Math.PI*1.2;
                    rocket.lifespan = 2500;
                    game.physics.arcade.velocityFromRotation(rocket.rotation, 75, rocket.body.velocity);
                    rocketTime = this.time.time + 300;
                }
            }
        },
        lockOn: function (sprite) {
            var shortestDist = 3000;
            var closest;
            for (var i = 0; i < aliens.children.length; i++) {
                if (aliens.children[i].alive) {
                    var yDist = aliens.children[i].centerY - sprite.body.y;
                    var xDist = aliens.children[i].centerX - sprite.body.x;
                    var distance = Math.sqrt(xDist*xDist + yDist*yDist);
                    if (distance < shortestDist) {
                        shortestDist = distance;
                        closest = aliens.children[i];
                    }
                }
            }
            if (closest) {
                sprite.rotation = Math.atan2((closest.centerY-10) - sprite.body.y, closest.centerX - sprite.body.x);
                game.physics.arcade.velocityFromRotation(sprite.rotation, 75, sprite.body.velocity);
            }
        },
        fireBeam: function () {
            if (gameOver) return;
            var beam = sword_beams.getFirstExists(false);
            if (beam) {
                var pX = sword.centerX+15*Math.cos(sword.rotation-Math.PI*.8);
                var pY = sword.centerY+15*Math.sin(sword.rotation-Math.PI*.8);
                beam.reset(pX, pY);
                beam.rotation = sword.rotation;
                beam.lifespan = 500;
                game.physics.arcade.velocityFromRotation(beam.rotation-Math.PI*.8, 300, beam.body.velocity);
            }
        },
        spawnAlien: function () {
            if (gameOver) return;
            var alien = aliens.getFirstExists(false);
            if (alien) {
                alien.reset(-80, game.rnd.integerInRange(50, game.height-125));
                alien.animations.add('alien', [0,1,2,3,4,5], 20, true);
                alien.animations.add('alien_face', [6,7,8,9,10,11], 20, true);
                alien.animations.play('alien', 8, true);
                alien.data = {health:100, facing:false, resist:"", counter:0};
                alien.width = 80;
                alien.height = 90;

                var r = game.rnd.integerInRange(0, 3);
                if (r===2) alien_growl.play();
                else if (r==3) alien_cry.play();
                alien.width *= .375+.125*r;
                alien.height *= .375+.125*r;
                alien.data.health += 50*r;
                alien.body.setSize(alien.width*.8, alien.height, 10, 10);
            }
        },
        makeSprite: function(type) {
            var sprite = game.add.sprite(0, 0, type);
            sprite.inputEnabled = true;
            sprite.input.enableDrag(true);
            sprite.events.onDragStop.add(this.weaponDrop);
            sprite.events.onDragStart.add(this.weaponPickup);
            sprite.anchor.x = .5;
            sprite.anchor.y = .5;

            var slot = this.nearestEmptySlot(sprite);
            sprite.data = {slot:this.getSlotNum(slot), durability:100};
            slot.data = true;
            sprite.x = slot.centerX;
            sprite.y = slot.centerY;
            return sprite;
        },

        getSlotNum: function(slot) {
            if (slot===slot1) return 1;
            if (slot===slot2) return 2;
            if (slot===slot3) return 3;
            if (slot===slot4) return 4;
            return 0;
        },

        weaponDrop: function(weapon) {
            if (weapon.y+weapon.height > 256)
                mainGame.returnWeapon(weapon, mainGame.nearestEmptySlot(weapon));
            if (weapon===sword) {
                sword.body.angularAcceleration = 0;
                sword.body.angularVelocity = 0;
            }
            weaponInHand = null;
        },
        returnWeapon: function(weapon, slot) {
            if (weapon===sword) {
                sword.anchor.x = .5;
                sword.anchor.y = .5;
            }
            weapon.x = slot.centerX;
            weapon.y = slot.centerY;
            slot.data = true;
            weapon.data.slot = this.getSlotNum(slot);
        },

        weaponPickup: function(weapon) {
            if (weapon.data.slot === 1)
                slot1.data = false;
            else if (weapon.data.slot === 2)
                slot2.data = false;
            else if (weapon.data.slot === 3)
                slot3.data = false;
            else if (weapon.data.slot === 4)
                slot4.data = false;
            weapon.data.slot = 0;
            weaponInHand = weapon;
            if (weapon===sword) {
                sword.anchor.x = .8;
                sword.anchor.y = .8;
            }
        },

        nearestEmptySlot: function(weapon) {
            var slot = firstEmpty();
            if (Math.abs(weapon.centerX-slot1.centerX) > Math.abs(weapon.centerX-slot2.centerX) && slot2.data===false)
                slot = slot2;
            if (Math.abs(weapon.centerX-slot2.centerX) > Math.abs(weapon.centerX-slot3.centerX) && slot3.data===false)
                slot = slot3;
            if (Math.abs(weapon.centerX-slot3.centerX) > Math.abs(weapon.centerX-slot4.centerX) && slot4.data===false)
                slot = slot4;
            return slot;
            function firstEmpty () {
                if (slot1.data===false) return slot1;
                if (slot2.data===false) return slot2;
                if (slot3.data===false) return slot3;
                if (slot4.data===false) return slot4;
            }
        },

        killOutOfBounds: function (sprite) {
            var offscreenVastness = 30;
            if (sprite.x < -offscreenVastness)
                sprite.kill();
            else if (sprite.x > game.width+offscreenVastness)
                sprite.kill();

            if (sprite.y < -offscreenVastness)
                sprite.kill();
            else if (sprite.y > 256)
                sprite.kill();
        },
        moveSprite: function (sprite) {
            if (!moving) return;
            sprite.x--;
            if (fast)
                sprite.x--;
        },
        setSpeed: function (sprite) {
            if (sprite.data.health < 1) return;
            var speed = 40;
            if (fast && moving)
                speed /= 2;
            var target = 0;
            if (sprite.x > 350)
                target = Math.atan2(dog.centerY - sprite.centerY, dog.centerX - sprite.centerX);
            if (dog.data.caught)
                target = Math.PI;
            game.physics.arcade.velocityFromRotation(target, speed, sprite.body.velocity);
        },
        stopSword: function () {
            sword.body.angularAcceleration = 0;
            sword.body.angularVelocity = 0;
        },

        update: function () {
            alienTime--;
            if (alienTime <= 0) {
                alienTime = 275+game.rnd.integerInRange(0, 275);
                this.spawnAlien();
            } aliens.forEachExists(this.setSpeed, this);
            sword_beams.forEachExists(this.killOutOfBounds, this);
            laser_shots.forEachExists(this.killOutOfBounds, this);
            rocket_shots.forEachExists(this.killOutOfBounds, this);
            if (spaceKey.downDuration(1)) {
                if (fast) fast = false;
                else fast = true;
            }
            if (aKey.downDuration(1) && weaponInHand===sword && Math.abs(sword.body.angularVelocity)<100) {
                sword.body.angularVelocity = -400;
                slash.play();
                game.time.events.add(Phaser.Timer.SECOND*.1, this.fireBeam, this);
                game.time.events.add(Phaser.Timer.SECOND*.25, this.stopSword, this);
            }
            if (dKey.downDuration(1) && weaponInHand===sword && Math.abs(sword.body.angularVelocity)<100) {
                sword.body.angularVelocity = 400;
                slash.play();
                game.time.events.add(Phaser.Timer.SECOND*.1, this.fireBeam, this);
                game.time.events.add(Phaser.Timer.SECOND*.25, this.stopSword, this);
            }
            if (aKey.isDown && weaponInHand) {
                weaponInHand.rotation -= .05;
            }
            if (dKey.isDown && weaponInHand) {
                weaponInHand.rotation += .05;
            }
            if (rKey.downDuration(1)) {
                if (laser_gun && laser_gun !==weaponInHand && laser_gun.y+laser_gun.height <= 256)
                    this.returnWeapon(laser_gun, this.nearestEmptySlot(laser_gun));
                if (rocket_launcher && rocket_launcher !==weaponInHand && rocket_launcher.y+rocket_launcher.height <= 256)
                    this.returnWeapon(rocket_launcher, this.nearestEmptySlot(rocket_launcher));
                if (sword && sword !==weaponInHand && sword.y+sword.height <= 256)
                    this.returnWeapon(sword, this.nearestEmptySlot(sword));
                if (spiny_shield && spiny_shield !==weaponInHand && spiny_shield.y+spiny_shield.height <= 256)
                    this.returnWeapon(spiny_shield, this.nearestEmptySlot(spiny_shield));
            }
            if (spiny_shield) weaponUpdate(spiny_shield, null);
            if (sword) weaponUpdate(sword, sword_beams);
            if (laser_gun) weaponUpdate(laser_gun, laser_shots);
            if (rocket_launcher) weaponUpdate(rocket_launcher, rocket_shots);
            if (laser_gun.y+laser_gun.height <= 256 && !gameOver)
                this.fireLaser();
            if (rocket_launcher.y+rocket_launcher.height <= 256 && !gameOver)
                this.fireRocket();
            if (aliens.total > 0)
                rocket_shots.forEachExists(this.lockOn, this);

            if (!gameOver)
                standardMovement();
            else if (!dog.data.caught && moving)
                winningMovement();
            else if (dog.data.caught)
                dog.x = catcher.centerX;

            if (!gameOver) {
                game.physics.arcade.overlap(laser_shots, aliens, this.laserHitAlien, null, this);
                game.physics.arcade.overlap(rocket_shots, aliens, this.rocketHitAlien, null, this);
                game.physics.arcade.overlap(sword_beams, aliens, this.beamHitAlien, null, this);
                game.physics.arcade.overlap(spiny_shield, aliens, this.shieldHitAlien, null, this);
                game.physics.arcade.overlap(dog, aliens, this.aliensCaughtDog, null, this);
            }
            aliens.forEachExists(this.checkUp, this);

            function weaponUpdate(weapon, ammo) {
                if (weapon.y+weapon.height <= 256) {
                    if (weaponInHand!==weapon)
                    mainGame.moveSprite(weapon);
                    if (weapon!==spiny_shield)
                        ammo.forEachExists(mainGame.moveSprite, this);
                }
                if (weapon.x+weapon.width < 0 || weapon.data.durability < 1) {
                    if (weapon===spiny_shield && spiny_shield.alive && weapon.data.durability < 1) {
                        shatter.reset(weapon.centerX, weapon.centerY);
                        shatter.anchor.x = .5;
                        shatter.anchor.y = .5;
                        shatter.alpha = weapon.alpha;
                        shatter.animations.add('shatter', [0,1,2,3,4], 10, true);
                        shatter.play('shatter', 10, false, true);
                        shatterSFX.play();
                    }
                    if (weapon.data.slot === 1)
                        slot1.data = false;
                    else if (weapon.data.slot === 2)
                        slot2.data = false;
                    else if (weapon.data.slot === 3)
                        slot3.data = false;
                    else if (weapon.data.slot === 4)
                        slot4.data = false;
                    weapon.kill();
                }
            }
            function standardMovement() {
                background.first.x--;
                background.second.x--;
                if (background.clearing.x < 800)
                    background.clearing.x--;
                if (fast) {
                    background.first.x--;
                    background.second.x--;
                    if (background.clearing.x < 800)
                        background.clearing.x--;
                    dog.animations.currentAnim.speed = 20;
                } else if (dog.animations.currentAnim.speed === 20) {
                    dog.animations.currentAnim.speed = 15;
                }
                if (background.first.x<=-768 && !gameOver)
                    background.first.x += 768*2;
                if (background.second.x<=-768 && !gameOver)
                    background.second.x += 768*2;
            }
            function winningMovement() {
                if (dog.x > background.clearing.x+500) {
                    dog.animations.stop();
                    moving = false;
                    dog.animations.play('fall', 10, true);
                    game.time.events.add(Phaser.Timer.SECOND*8, mainGame.cutScene, this);
                } else if (dog.x > background.clearing.x) {
                    if (!fast) fast = true;
                    if (dog.x > game.width/2)
                        dog.x--;
                    standardMovement();
                } else standardMovement();
                if (background.first.x<=-768 && background.clearing.x > 800)
                    background.clearing.x = background.first.x + 768*2;
                if (background.second.x<=-768 && background.clearing.x > 800)
                    background.clearing.x = background.second.x + 768*2;
            }
        },
        laserHitAlien: function (laser, alien) {
            mainGame.evalResist(alien, "laser", 4);
            laser.kill();
        },
        rocketHitAlien: function (rocket, alien) {
            mainGame.evalResist(alien, "rocket", 8);
            rocket.kill();
        },
        beamHitAlien: function (beam, alien) {
            mainGame.evalResist(alien, "beam", 24);
            beam.kill();
        },
        shieldHitAlien: function (shield, alien) {
            mainGame.evalResist(alien, "shield", 2);
            alien.x--;
            if (weaponInHand!==shield){
                alien.x--;
                if (fast) alien.x--;
            }
            if (alien.data.health > 0)
                shield.data.durability--;
        },
        evalResist: function (alien, weapon, damage) {
            if (alien.data.resist !== weapon) {
                alien.data.counter = 0;
                alien.data.resist = weapon;
            }
            if (alien.data.counter >= 50)
                alien.data.health -= damage/2;
            else
                alien.data.health -= damage;
            alien.data.counter+=damage;
        },
        aliensCaughtDog: function (dog, alien) {
            catcher = alien;
            dog.data.caught = true;
            gameOver = true;
            dog.animations.stop();
            moving = false;
            dog.animations.play('fall', 10, true);
            music.fadeOut(1500);
            aliens.forEachExists(this.flip, this);
            game.time.events.add(Phaser.Timer.SECOND*1.5, this.changeMusic, this);
        },
        flip: function (alien) {alien.scale.x *= -1;},
        changeMusic: function () {
            music.stop();
            if (dog.data.caught)
                music = game.add.audio('failure');
            else
                music = game.add.audio('success');
            music.play();
            music.volume -= .5;
            backButton.x -= game.width;
            textHelp.text = "";
            textHelp2.text = "";
        },
        checkUp: function (alien) {
            if (alien.data.health < 1) {
                alien.width*=.98;
                alien.height*=.98;
                mainGame.moveSprite(alien);
                if (!alien.data.facing) {
                    alien.animations.stop();
                    alien.animations.play('alien_face', 10, true);
                    alien.data.facing = true;
                }
                if (alien.width < 10) {
                    var blood = splatters.getFirstExists(false);
                    blood.reset(alien.centerX-22, alien.centerY-22);
                    blood.animations.add('blood', [0,1,2,3,4,5], 10, true);
                    blood.play('blood', 10, false, true);
                    alien.kill();
                    squish.play();
                }
            }
        },
        cutScene: function () {
            dog.animations.stop();
            switch (counter) {
                case 0: dog.animations.play('wag_tail', 4, true); dog.x--;
                        game.time.events.add(Phaser.Timer.SECOND*6, mainGame.cutScene, this); break;
                case 1: dog.animations.play('yawn', 3, false);
                        game.time.events.add(Phaser.Timer.SECOND*1.5, mainGame.cutScene, this); break;
                case 2: dog.animations.play('turn', 4, false);
                        game.time.events.add(Phaser.Timer.SECOND*1.25, mainGame.cutScene, this); break;
                case 3: dog.animations.play('bow', 1, false);
                        game.time.events.add(Phaser.Timer.SECOND*2, mainGame.cutScene, this); break;
                case 4: dog.animations.play('run', 15, true);
                        game.physics.arcade.velocityFromRotation(0, 60, dog.body.velocity);
            } counter++;
        }
    }
    return mainGame;
};
