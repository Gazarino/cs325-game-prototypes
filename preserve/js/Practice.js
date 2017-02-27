"use strict";

BasicGame.Practice = function( game ) {
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

    var music;
    var explodeSFX;
    var explosions;

    var cursors;
    var spaceKey;
    var warpDir;
    var warpPow;

    var textWarpDir;
    var textWarpPow;
    var textKilled;
    var textResult;
};
BasicGame.Practice.prototype = {
    quitGame: function () {

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

        music.stop();
        music = null;
        explodeSFX = null;
        explosions = null;

        cursors = null;
        spaceKey = null;
        warpDir = null;
        warpPow = null;

        textWarpDir = null;
        textWarpPow = null;
        textKilled = null;
        textResult = null;
        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    },

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
            spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

            game.add.sprite(0, 0, 'calmbrio');

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
            player.body.collideWorldBounds = true;
            player.data = {hp:game.add.sprite(0, 0, 'hpBar')};

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
            console.log("Practice!!");
            music = game.add.audio('practiceMusic');
            music.play();
            music.volume -= .4;
            explodeSFX = game.add.audio('explodeSFX');

            explosions = game.add.group();
            explosions.createMultiple(30, 'explosion');
            player.animations.add('explosion');

            textKilled = game.add.text(game.width/1.75, 10, "Enemies Killed: "+enemiesKilled, {font:"18px Arial", fill:"#ffffff", align:"center" });
            textWarpPow = game.add.text(game.width/4, 10, "Warp Power: 2", {font:"18px Arial", fill:"#ffffff", align:"center" });
            textResult = game.add.text(game.width/2, game.height/2, "", {font:"30px Arial", fill:"#ffffff", align:"center" });
            textResult.anchor.set(0.5);

            game.time.events.add(Phaser.Timer.SECOND*1.25, this.startFire, this);
            game.time.events.add(Phaser.Timer.SECOND*12, this.spawnEnemy, this);
            game.time.events.add(Phaser.Timer.SECOND*92.5, this.results, this);
        },

        update: function () {
            bullets.forEachExists(this.screenWrap, this);
            enemies.forEachExists(this.enemyAct, this);
            enemies.forEachExists(this.fireEnemyBullet, this);

            game.physics.arcade.collide(enemies, enemies);
            game.physics.arcade.collide(player, enemies);

            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.body.angularVelocity = 0;
            if (fireTime)
                this.fireBullet();

            if (cursors.left.isDown)
                player.body.angularVelocity = -200;
            else if (cursors.right.isDown)
                player.body.angularVelocity = 200;
            if (cursors.up.isDown && (textResult.text === "" ||
                        textResult.text === "Congratulations!\nYou've successfully driven\naway the enemy!"))
                player.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(player.angle, 200));
            else if (cursors.down.isDown && (textResult.text === "" ||
                        textResult.text === "Congratulations!\nYou've successfully driven\naway the enemy!"))
                player.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(player.angle, -150));

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
            game.physics.arcade.overlap(bullets, player, this.playerHitSelf, null, this);
            game.physics.arcade.overlap(enemyBullets, player, this.playerHit, null, this);
            game.physics.arcade.overlap(bullets, enemies, this.enemyHit, null, this);
            game.physics.arcade.overlap(bullets, enemyBullets, this.bulletCollide, null, this);

            player.data.hp.x = player.body.x - 5;
            player.data.hp.y = player.body.y - 5;
            if (player.data.hp.width === 0 && (textResult.text === "" || textResult.text ===
                   "You survived!\nBut...you didn't kill enough enemies.\nThey're going to overwhelm you now...")) {
                var explosion = explosions.getFirstExists(false);
                explosion.reset(player.body.x-28, player.body.y-28);
                explosion.animations.add('explosion', [0,1,2,3,4,5,6,7,8,9,10,11,
                    12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34], 10, true);
                explosion.play('explosion', 30, false, true);
                player.kill();
                explodeSFX.play();
                textResult.text = "You died...\nBack to Main Menu in "+countdown;
                game.time.events.add(Phaser.Timer.SECOND, this.count, this);
                music.fadeOut(1500);
            }
            enemies.forEachExists(this.updateHP, this);
        },

        fireBullet: function () {
            if (this.time.time > bulletTime && player.data.hp.width > 0) {
                var bullet = bullets.getFirstExists(false);
                if (bullet) {
                    bullet.reset(player.body.x + 16, player.body.y + 16);
                    bullet.lifespan = 100000;
                    bullet.rotation = player.rotation;
                    game.physics.arcade.velocityFromRotation(player.rotation, 330, bullet.body.velocity);
                    bulletTime = this.time.time + 50;
                }
            }
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
                if (bullets.children[i].body) {
                    var yDist = bullets.children[i].body.y - sprite.body.y;
                    var xDist = bullets.children[i].body.x - sprite.body.x;
                    var distance = Math.sqrt(xDist*xDist + yDist*yDist);
                    if (distance < shortestDist) {
                        shortestDist = distance;
                        closest = bullets.children[i];
                    }
                }
            }
            sprite.rotation = Math.atan2(closest.body.y - sprite.body.y, closest.body.x - sprite.body.x);
            if (sprite.body.x < 15)
                sprite.body.x = 15;
            if (sprite.body.x > game.width-50)
                sprite.body.x = game.width-50;
            if (sprite.body.y < 15)
                sprite.body.y = 15;
            if (sprite.body.y > game.height-50)
                sprite.body.y = game.height-50;

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
                if (player.data.hp.width > 0)
                    player.data.hp.width--;
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
                explosion.reset(sprite.body.x-28, sprite.body.y-28);
                explosion.animations.add('explosion', [0,1,2,3,4,5,6,7,8,9,10,11,
                    12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34], 10, true);
                explosion.play('explosion', 30, false, true);
                explodeSFX.play();
                sprite.kill();
                textKilled.text = "Enemies Killed: "+enemiesKilled;
            }
        },

        spawnEnemy: function () {
            if (textResult.text === "Congratulations!\nYou've successfully driven\naway the enemy!")
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
                //enemy.animations.add('explosion');
            }
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
            var offscreenVastness = 750;
            if (sprite.x < -offscreenVastness)
                sprite.x = game.width;
            else if (sprite.x > game.width+offscreenVastness)
                sprite.x = 0;

            if (sprite.y < -offscreenVastness)
                sprite.y = game.height;
            else if (sprite.y > game.height+offscreenVastness)
                sprite.y = 0;
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
            }
        },

        count: function () {
            countdown--;
            textResult.text = "You died...\nBack to Main Menu in "+countdown;
            if (countdown > 0)
                game.time.events.add(Phaser.Timer.SECOND, this.count, this);
            else
                this.quitGame();
        },

        results: function () {
            if (textResult.text === "") {
                if (enemiesKilled < 5)
                    textResult.text = "You survived!\nBut...you didn't kill enough enemies.\nThey're going to overwhelm you now...";
                else
                    textResult.text = "Congratulations!\nYou've successfully driven\naway the enemy!";
            }
        }
    };
};
