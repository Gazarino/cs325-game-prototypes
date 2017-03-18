"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var player;
    var bullets;
    var bulletTime;
    var fireTime;
    var fireCount;
    var enemiesKilled;
    var enemies;
    var enemyBullets;
    var countdown;
    var barrierReady;

    var music;
    var explodeSFX;
    var explosions;
    var barrier;

    var cursors;
    var spaceKey;
    var warpDir;
    var warpPow;
    var extra;
    var backButton;
    var alreadyWon;

    var textWarpDir;
    var textWarpPow;
    var textKilled;
    var textResult;
    var textPractice;

    function quitGame() {
        if (enemiesKilled > shared.highScore && !shared.practice)
            shared.highScore = enemiesKilled;
        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
        player = null;
        bullets = null;
        bulletTime = null;
        fireTime = null;
        fireCount = null;
        enemiesKilled = null;
        enemies = null;
        enemyBullets = null;
        countdown = null;
        barrierReady = null;

        music.stop();
        music = null;
        explodeSFX = null;
        explosions = null;
        barrier = null;

        cursors = null;
        spaceKey = null;
        warpDir = null;
        warpPow = null;
        extra = null;
        backButton = null;
        alreadyWon = null;

        textWarpDir = null;
        textWarpPow = null;
        textKilled = null;
        textResult = null;
        textPractice = null;

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }


    return {
        create: function () {
            bulletTime = 0;
            fireTime = false;
            fireCount = 0;
            enemiesKilled = 0;
            countdown = 5;

            cursors = game.input.keyboard.createCursorKeys();
            warpDir = game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S,
                                                  'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );
            warpPow = game.input.keyboard.addKeys( { 'one': Phaser.KeyCode.ONE, 'two': Phaser.KeyCode.TWO,
                                                  'three': Phaser.KeyCode.THREE } );
            extra = game.input.keyboard.addKeys({'Q':Phaser.KeyCode.Q,'E':Phaser.KeyCode.E,
                                                  'F':Phaser.KeyCode.F,'R':Phaser.KeyCode.R});
            spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);

            game.add.sprite(0, 0, 'warapsha');

            bullets = game.add.physicsGroup();
            bullets.enableBody = true;
            bullets.physicsBodyType = Phaser.Physics.ARCADE;
            bullets.createMultiple(220, 'bullet');
            bullets.setAll('anchor.x', 0.5);
            bullets.setAll('anchor.y', 0.5);

            player = game.add.sprite(300, 300, 'player');
            player.anchor.set(0.5);
            game.physics.arcade.enable(player);
            player.body.allowRotation = true;
            if (shared.won)
                player.body.collideWorldBounds = false;
            else
                player.body.collideWorldBounds = true;
            player.data = {hp:game.add.sprite(0, 0, 'hpBar')};
            barrierReady = true;
            alreadyWon = shared.won;

            enemyBullets = game.add.physicsGroup();
            enemyBullets.enableBody = true;
            enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
            enemyBullets.createMultiple(40, 'bulletEnemy');
            enemyBullets.setAll('anchor.x', 0.5);
            enemyBullets.setAll('anchor.y', 0.5);

            enemies = game.add.physicsGroup();
            enemies.enableBody = true;
            enemies.physicsBodyType = Phaser.Physics.ARCADE;
            enemies.createMultiple(3, 'enemy');
            enemies.setAll('anchor.x', 0.5);
            enemies.setAll('anchor.y', 0.5);

            if (shared.practice)
                music = game.add.audio('practiceMusic');
            else if (shared.bonus)
                music = game.add.audio('bonus');
            else
                music = game.add.audio('music');
            music.play();
            //music.volume -= .2;
            explodeSFX = game.add.audio('explodeSFX');
            explosions = game.add.group();
            explosions.createMultiple(30, 'explosion');

            barrier = game.add.sprite(300, 300, 'barrier');
            barrier.alpha = 0;
            barrier.animations.add('barrier', [0,1,2,3,4,5,6,7,8,9,8,7,6,5,4,3,2,1], 10, true);

            textWarpPow = game.add.text(game.width/4, 10, "Warp Power: 2", {font:"18px Arial", fill:"#ffffff", align:"center" });
            textKilled = game.add.text(game.width/1.75, 10, "Enemies Killed: "+enemiesKilled, {font:"18px Arial", fill:"#ffffff", align:"center" });
            textResult = game.add.text(game.width/2, game.height/2, "", {font:"30px Arial", fill:"#ffffff", align:"center" });
            textPractice = game.add.text(game.width/2, game.height*.85, "", {font:"25px Arial", fill:"#ffffff", align:"center" });
            textResult.anchor.set(0.5);
            textPractice.anchor.set(0.5);
            if (shared.practice) {
                textPractice.text = "Move with the arrow keys.";
                countdown = 0;
                backButton = game.add.button(10, 10, 'backButton', quitGame, null, 'over', 'out', 'down');
                backButton.height *= .45;
                backButton.width *= .45;
                game.time.events.add(Phaser.Timer.SECOND*6, this.practiceEvent, this);
            } else if (shared.bonus) {
                game.time.events.add(Phaser.Timer.SECOND*3, this.spawnEnemy, this);
                game.time.events.add(Phaser.Timer.SECOND*84.05, this.destroyTrigger, this);
                game.time.events.add(Phaser.Timer.SECOND*86.5, quitGame, this);
            } else {
                game.time.events.add(Phaser.Timer.SECOND*1.25, this.startFire, this);
                game.time.events.add(Phaser.Timer.SECOND*12, this.spawnEnemy, this);
                game.time.events.add(Phaser.Timer.SECOND*92.5, this.results, this);
            }
        },

        update: function () {
            bullets.forEachExists(this.screenWrap, this);
            enemies.forEachExists(this.enemyAct, this);
            enemies.forEachExists(this.fireEnemyBullet, this);
            this.screenWrap(player);

            game.physics.arcade.collide(enemies, enemies);
            game.physics.arcade.collide(player, enemies);

            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.body.angularVelocity = 0;
            if (fireTime)
                this.fireBullet();
            var speed = 200;

            if (shared.won) {
                if (extra.F.isDown)
                    this.fireBullet();
                if (extra.Q.isDown)
                    speed = 400;
                if (extra.R.downDuration(1))
                    bullets.forEachExists(this.kill, this);
            }

            if (extra.E.downDuration(1)) {
                if (barrierReady) {
                    if (shared.won) {
                        game.time.events.add(Phaser.Timer.SECOND*8, this.barrierOff, this);
                        game.time.events.add(Phaser.Timer.SECOND*18, this.cooldownOver, this);
                    } else {
                        game.time.events.add(Phaser.Timer.SECOND*5, this.barrierOff, this);
                        game.time.events.add(Phaser.Timer.SECOND*22, this.cooldownOver, this);
                    }
                    game.add.tween(barrier).to({alpha:.5}, 1000, "Linear", true);
                    barrier.play('barrier', 30, true, true);
                    barrierReady = false;
                }
            }

            if (cursors.left.isDown)
                player.body.angularVelocity = -speed;
            else if (cursors.right.isDown)
                player.body.angularVelocity = speed;
            if (cursors.up.isDown && (textResult.text === "" ||
                        textResult.text === "Congratulations!\nYou've successfully driven\naway the enemy!"))
                player.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(player.angle, speed));
            else if (cursors.down.isDown && (textResult.text === "" ||
                        textResult.text === "Congratulations!\nYou've successfully driven\naway the enemy!"))
                player.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(player.angle, -.75*speed));

            if (warpDir.up.isDown)
                textWarpDir = "Warp Direction: up";
            else if (warpDir.down.isDown)
                textWarpDir = "Warp Direction: down";
            else if (warpDir.left.isDown)
                textWarpDir = "Warp Direction: left";
            else if (warpDir.right.isDown)
                textWarpDir = "Warp Direction: right";

            if (warpPow.one.isDown)
                textWarpPow.text = "Warp Power: 1";
            else if (warpPow.two.isDown)
                textWarpPow.text = "Warp Power: 2";
            else if (warpPow.three.isDown)
                textWarpPow.text = "Warp Power: 3";

            if (warpDir.up.downDuration(1) || warpDir.down.downDuration(1)
                        || warpDir.left.downDuration(1) || warpDir.right.downDuration(1))
                bullets.forEachExists(this.warp, this);
            if (spaceKey.downDuration(1)) {
                player.body.x = game.width - player.body.x - 30;
                player.body.y = game.height - player.body.y - 30;
            }
            if (barrier.alpha > 0) {
                barrier.x = player.body.x-10;
                barrier.y = player.body.y-10;
                bullets.forEachExists(this.warpAround, this);
                enemyBullets.forEachExists(this.warpAround, this);
            }

            game.physics.arcade.overlap(bullets, player, this.playerHitSelf, null, this);
            game.physics.arcade.overlap(enemyBullets, player, this.playerHit, null, this);
            game.physics.arcade.overlap(bullets, enemies, this.enemyHit, null, this);
            game.physics.arcade.overlap(bullets, enemyBullets, this.bulletCollide, null, this);

            player.data.hp.x = player.body.x - 5;
            player.data.hp.y = player.body.y - 5;
            if (player.data.hp.width === 0 && shared.practice)
                player.data.hp.width = 40;
            if (player.data.hp.width === 0 && (textResult.text === "" || textResult.text ===
                   "You survived!\nBut...you didn't kill enough enemies.\nThey're going to overwhelm you now...")) {
                var explosion = explosions.getFirstExists(false);
                explosion.reset(player.body.x-35, player.body.y-35);
                explosion.animations.add('explosion', [0,1,2,3,4,5,6,7,8,9,10,11,
                    12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34], 10, true);
                explosion.play('explosion', 30, false, true);
                player.kill();
                barrier.kill();
                explodeSFX.play();
                textResult.text = "You died...\nBack to main menu in "+countdown;
                game.time.events.add(Phaser.Timer.SECOND, this.count, this);
                music.fadeOut(1500);
            }
            enemies.forEachExists(this.updateHP, this);

        },

        fireBullet: function () {
            if (this.time.time > bulletTime && (player.data.hp.width > 0 ||
                    textResult.text === "Congratulations!\nYou've successfully driven\naway the enemy!")) {
                var bullet = bullets.getFirstExists(false);
                if (bullet) {
                    bullet.reset(player.body.x + 14, player.body.y + 14);
                    bullet.lifespan = 100000;
                    bullet.rotation = player.rotation;
                    game.physics.arcade.velocityFromRotation(player.rotation, 330, bullet.body.velocity);
                    bulletTime = this.time.time + 50;
                }
            }
        },

        barrierOff: function () {
            game.add.tween(barrier).to({alpha:0}, 1000, "Linear", true);
        },

        cooldownOver: function () {
            barrierReady = true;
            game.add.tween(player).to({tint:0x000000}, 500, "Linear", true);
            game.time.events.add(Phaser.Timer.SECOND*.5, this.cooldownOver2, this);
        },

        cooldownOver2: function () {
            game.add.tween(player).to({tint:0xffffff}, 500, "Linear", true);
        },

        enemyAct: function (sprite) {
            if (textResult.text === "Congratulations!\nYou've successfully driven\naway the enemy!") {
                sprite.body.collideWorldBounds = false;
                sprite.rotation = Math.atan2(-(player.body.y - sprite.body.y), -(player.body.x - sprite.body.x));
                game.physics.arcade.velocityFromRotation(sprite.rotation, 100, sprite.body.velocity);
                return;
            }
            if (!sprite.body.collideWorldBounds) {
                sprite.rotation = Math.atan2(player.body.y - sprite.body.y, player.body.x - sprite.body.x);
                game.physics.arcade.velocityFromRotation(sprite.rotation, 100, sprite.body.velocity);
                if (sprite.body.x > 15 && sprite.body.x+50 < game.width &&
                          sprite.body.y > 15 && sprite.body.y+50 < game.height)
                    sprite.body.collideWorldBounds = true;
                return;
            }
            var shortestDist = 3000;
            var closest;
            for (var i = 0; i < bullets.children.length; i++) {
                if (bullets.children[i].alive) {
                    var yDist = bullets.children[i].body.y - sprite.body.y;
                    var xDist = bullets.children[i].body.x - sprite.body.x;
                    var distance = Math.sqrt(xDist*xDist + yDist*yDist);
                    if (distance < shortestDist) {
                        shortestDist = distance;
                        closest = bullets.children[i];
                    }
                }
            }
            if (closest)
                sprite.rotation = Math.atan2(closest.body.y - sprite.body.y, closest.body.x - sprite.body.x);
            if (sprite.body.x < 15)
                sprite.body.x = 15;
            if (sprite.body.x > game.width-50)
                sprite.body.x = game.width-50;
            if (sprite.body.y < 15)
                sprite.body.y = 15;
            if (sprite.body.y > game.height-50)
                sprite.body.y = game.height-50;
            //if (Math.abs(Math.abs(sprite.rotation - closest.rotation)-Math.PI) < Math.PI/3)
            //    sprite.rotation += Math.PI/3;

            if (textResult.text === "")
                game.physics.arcade.velocityFromRotation(sprite.rotation, -175, sprite.body.velocity);
            else {
                sprite.body.velocity.x = 0;
                sprite.body.velocity.y = 0;
            }
            if (player.data.hp.width > 0)
                sprite.rotation = Math.atan2(player.body.y - sprite.body.y, player.body.x - sprite.body.x);
        },

        fireEnemyBullet: function (sprite) {
            if (this.time.time > sprite.data.bulletTime && sprite.body.collideWorldBounds && player.data.hp.width > 0) {
                var bullet = enemyBullets.getFirstExists(false);
                if (bullet) {
                    bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
                    bullet.lifespan = 3000;
                    bullet.rotation = sprite.rotation;
                    game.physics.arcade.velocityFromRotation(sprite.rotation, 400, bullet.body.velocity);
                    sprite.data.bulletTime = this.time.time + 1500;
                }
            }
        },

        playerHitSelf: function (player, bullet) {
            if (bullet.lifespan < 98000) {
                if (player.data.hp.width > 0 &&
                        textResult.text !== "Congratulations!\nYou've successfully driven\naway the enemy!")
                    player.data.hp.width --;
                if (player.data.hp.width < 0)
                    player.data.hp.width = 0;
                bullet.kill();
            }
        },

        playerHit: function (player, bullet) {
            if (player.data.hp.width > 0)
                player.data.hp.width -= 4;
            if (player.data.hp.width < 0)
                player.data.hp.width = 0;
            bullet.kill();
        },

        enemyHit: function (bullet, enemy) {
            if (enemy.data.hp.width > 0 && enemy.body.collideWorldBounds)
                enemy.data.hp.width -= 4;
            if (enemy.data.hp.width < 0)
                enemy.data.hp.width = 0;
            bullet.kill();
        },

        kill: function (bullet) {
            bullet.kill();
        },

        bulletCollide: function (bullet1, bullet2) {
            bullet1.kill();
            bullet2.kill();
        },

        updateHP: function (sprite) {
            sprite.data.hp.x = sprite.body.x - 5;
            sprite.data.hp.y = sprite.body.y - 5;
            if (sprite.data.hp.width === 0 && textResult.text === "") {
                enemiesKilled++;
                var explosion = explosions.getFirstExists(false);
                explosion.reset(sprite.body.x-35, sprite.body.y-35);
                explosion.animations.add('explosion', [0,1,2,3,4,5,6,7,8,9,10,11,
                    12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34], 10, true);
                explosion.play('explosion', 30, false, true);
                explodeSFX.play();
                sprite.kill();
                textKilled.text = "Enemies Killed: "+enemiesKilled;
            }
        },

        spawnEnemy: function () {
            if (textResult.text === "Congratulations!\nYou've successfully driven\naway the enemy!" || countdown > 10)
                return;
            var enemy = enemies.getFirstExists(false);
            if (enemy) {
                var r = game.rnd.integerInRange(0, 3);
                switch (r) {
                    case 0: enemy.reset(game.rnd.integerInRange(0, game.width), -50);   break;
                    case 1: enemy.reset(-50, game.rnd.integerInRange(0, game.height));  break;
                    case 2: enemy.reset(game.rnd.integerInRange(0, game.width), game.height+50);  break;
                    default: enemy.reset(game.width+50, game.rnd.integerInRange(0, game.height));
                }
                enemy.data = {bulletTime:0, hp:game.add.sprite(0, 0, 'hpBar')};
                enemy.body.collideWorldBounds = false;
                enemy.body.allowRotation = true;
            }
            if (shared.bonus)
                game.time.events.add(Phaser.Timer.SECOND*4, this.spawnEnemy, this);
            else
                game.time.events.add(Phaser.Timer.SECOND*12, this.spawnEnemy, this);
        },

        startFire: function () {
            fireTime = true;
            fireCount++;
            game.time.events.add(Phaser.Timer.SECOND*.8, this.stopFire, this);
        },

        stopFire: function () {
            fireTime = false;
            if (fireCount < 16)
                game.time.events.add(Phaser.Timer.SECOND*.77, this.startFire, this);
        },

        screenWrap: function (sprite) {
            var offscreenVastness = 375;
            if (sprite.x < -offscreenVastness)
                sprite.x = game.width+offscreenVastness;
            else if (sprite.x > game.width+offscreenVastness)
                sprite.x = -offscreenVastness;

            if (sprite.y < -offscreenVastness)
                sprite.y = game.height+offscreenVastness;
            else if (sprite.y > game.height+offscreenVastness)
                sprite.y = -offscreenVastness;//*/
        },

        warp: function (sprite) {
            if (textWarpDir === "Warp Direction: up") {
                switch(textWarpPow.text) {
                    case "Warp Power: 3": sprite.y = sprite.y-50;
                    case "Warp Power: 2": sprite.y = sprite.y-30;
                    case "Warp Power: 1": sprite.y = sprite.y-20;
                }
            } else if (textWarpDir === "Warp Direction: down") {
                switch(textWarpPow.text) {
                    case "Warp Power: 3": sprite.y = sprite.y+50;
                    case "Warp Power: 2": sprite.y = sprite.y+30;
                    case "Warp Power: 1": sprite.y = sprite.y+20;
                }
            } else if (textWarpDir === "Warp Direction: left") {
                switch(textWarpPow.text) {
                    case "Warp Power: 3": sprite.x = sprite.x-50;
                    case "Warp Power: 2": sprite.x = sprite.x-30;
                    case "Warp Power: 1": sprite.x = sprite.x-20;
                }
            } else {
                switch(textWarpPow.text) {
                    case "Warp Power: 3": sprite.x = sprite.x+50;
                    case "Warp Power: 2": sprite.x = sprite.x+30;
                    case "Warp Power: 1": sprite.x = sprite.x+20;
                }
            }//*/
        },

        warpAround: function (sprite) {
            var yDist = sprite.centerY - player.centerY;
            var xDist = sprite.centerX - player.centerX;
            var distance = Math.sqrt(xDist*xDist + yDist*yDist);
            if (distance < 32 && sprite.lifespan < 98000) {
                sprite.body.x += Math.cos(sprite.rotation) * 60;
                sprite.body.y += Math.sin(sprite.rotation) * 60;
            }
        },

        count: function () {
            countdown--;
            textResult.text = "You died...\nBack to main menu in "+countdown;
            if (countdown > 0)
                game.time.events.add(Phaser.Timer.SECOND, this.count, this);
            else
                quitGame();
        },

        results: function () {
            if (textResult.text === "") {
                if (enemiesKilled < 5)
                    textResult.text = "You survived!\nBut...you didn't kill enough enemies.\nThey're going to overwhelm you now...";
                else {
                    textResult.text = "Congratulations!\nYou've successfully driven\naway the enemy!";
                    music = game.add.audio('win');
                    music.play();
                    music.volume -= .3;
                    game.time.events.add(Phaser.Timer.SECOND*4.6, this.fadeText, this);
                    shared.won = true;
                    countdown = 0;
                    game.time.events.add(Phaser.Timer.SECOND*5.6, this.winEvent, this);
                }
            }
        },

        practiceEvent: function () {
            switch (countdown) {
                case 0: textPractice.text = "Hm? How do you shoot...?";
                      game.time.events.add(Phaser.Timer.SECOND*5, this.startFire, this); break;
                case 1: textPractice.text = "GAH!! Something's wrong with your mech!\nAnd the bullets are orbiting Warapsha!"; break;
                case 2: textPractice.text = "Don't worry; even if you run out of ammo,\nyou can still control your bullets."; break;
                case 3: textPractice.text = "Use WASD to warp them in the direction of your choice."; break;
                case 4: textPractice.text = "You can change the distance they go by first pressing 1, 2, or 3."; break;
                case 5: textPractice.text = "Maybe you realized this already, but you can also\nuse the spacebar to warp your mech."; break;
                case 6: textPractice.text = "Getting hit? Try pressing E.\nIt activates a field which warps all bullets past you!"; break;
                case 7: textPractice.text = "Unfortunately, it's too strenuous to maintain for long.\nYour mech will flash when it can be used again."; break;
                case 8: textPractice.text = "Hey, look, an enemy! See if you can beat them!"; this.spawnEnemy(); break;
                case 9: textPractice.text = "Trap them at the area bounds for an easier kill!"; break;
                case 10: textPractice.text = "Just make sure to avoid their bullets.\nYou can use your bullets as shields!"; break;
                case 11: textPractice.text = "To preserve Warapsha, you'll want to take out\nat least 5 of these guys in addition to surviving."; break;
                case 12: enemies.forEachExists(this.destroyEnemies, this); textPractice.text = "Good luck!";
                      game.time.events.add(Phaser.Timer.SECOND*3.5, quitGame, this);
            }
            countdown++;
            game.time.events.add(Phaser.Timer.SECOND*6.66, this.practiceEvent, this);
        },

        winEvent: function () {
            game.add.tween(textPractice).to({alpha:1}, 1000, "Linear", true);
            if (countdown < 6)
                game.time.events.add(Phaser.Timer.SECOND*4.6, this.fadeText, this);
            else if (countdown === 6)
                game.time.events.add(Phaser.Timer.SECOND*5.2, this.fadeText, this);
            switch (countdown) {
                case 0: textPractice.text = "You did it! Warapsha is going to stay the way it is."; break;
                case 1: textPractice.text = "You got the \"Preservationist\" achievement!"; break;
                case 2: textPractice.text = "You are no longer restricted by the area bounds!";
                      player.body.collideWorldBounds = false; break;
                case 3: textPractice.text = "Your warp field now lasts longer and has a shorter cooldown!"; break;
                case 4: textPractice.text = "Your mech can now fly more quickly (hold Q)!"; break;
                case 5: textPractice.text = "Your guns have been fixed! Fire with the F key!"; break;
                case 6: textPractice.text = "You can now reset/reload all of your bullets\nat once by pressing the R key!"; break;
                case 7: textPractice.text = "You unlocked a new bonus mode in which\nenemies spawn more frequently! Enjoy!";
                        game.time.events.add(Phaser.Timer.SECOND*9, quitGame, this);
            }
            countdown++;
            if (countdown < 7)
                game.time.events.add(Phaser.Timer.SECOND*5.6, this.winEvent, this);
            else if (countdown === 7)
                game.time.events.add(Phaser.Timer.SECOND*6.2, this.winEvent, this);
        },

        fadeText: function () {
            if (textResult.alpha === 1)
                game.add.tween(textResult).to({alpha:0}, 1000, "Linear", true);
            else
                game.add.tween(textPractice).to({alpha:0}, 1000, "Linear", true);
        },
        destroyTrigger: function () { countdown = 12; enemies.forEachExists(this.destroyEnemies, this); },
        destroyEnemies: function (sprite) { sprite.data.hp.width = 0; }
    };
};
