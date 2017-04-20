"use strict";

GameStates.makeGame = function( game, shared, customControls ) {
    // Create your own variables.
    var player;
    var music;

    var cursors;
    var backButton;

    var textCount;
    var textBooWow;
    var training;

    var toggle;
    var movement;
    var loop;
    var background;
    var clouds;
    var notes;
    var notebox;
    var prevTime;
    var textSection;
    var sectionNumber;
    var inSky;
    var boo;
    var wow;
    var judgeGrade;
    var judgeText;
    var judgeCooldown;
    var playMusic;

    var angle;
    var gradePlacements;
    var totalSections;
    var sectionGrades1;
    var sectionGrades2;
    var pointBin;
    var totalGrade1;
    var totalGrade2;
    var trickTime;
    var recentGrades;
    var noteCount;
    var lastSection;
    var currentSection;

    var readyText;
    var textFinal;
    var trainingMusic;
    var trainingText;
    var backButton;

    var winMusic;
    var numpad;
    var extraKeys;
    var moneyText;
    var device;
    var performer1;
    var initialStamina, staminaTime, staminaBar;

    function quitGame() {
        if (trainingMusic) trainingMusic.stop();
        if (music) music.stop();
        if (winMusic) winMusic.stop();
        if (device) device.destroy();

        player.destroy();
        music = null;

        cursors = null;
        backButton.destroy();

        textCount.destroy();
        textBooWow.destroy();
        training = null;

        toggle = null;
        movement = null;
        loop = null;
        background.kill();
        clouds = null;
        notes.destroy();
        notebox.destroy();
        prevTime = null;
        textSection.destroy();
        sectionNumber = null;
        inSky.destroy();
        boo = null;
        wow = null;
        judgeGrade = null;
        judgeText.destroy();
        judgeCooldown = null;
        playMusic = null;

        angle = null;
        gradePlacements = null;
        totalSections = null;
        sectionGrades1 = null;
        sectionGrades2 = null;
        pointBin = null;
        totalGrade1 = null;
        totalGrade2 = null;
        trickTime = null;
        recentGrades = null;
        noteCount = null;
        lastSection = null;
        currentSection = null;
        readyText.destroy();
        textFinal.destroy();
        trainingMusic = null;
        if (trainingText) trainingText.destroy();
        if (moneyText) moneyText.destroy();
        backButton.destroy();

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }


    var mainGame = {
        create: function () {
            cursors = game.input.keyboard.createCursorKeys();
            numpad = game.input.keyboard.addKeys({'boo':Phaser.Keyboard.NUMPAD_0,
                                                  'one':Phaser.Keyboard.NUMPAD_1,
                                                  'two':Phaser.Keyboard.NUMPAD_2,
                                                  'three':Phaser.Keyboard.NUMPAD_3,
                                                  'four':Phaser.Keyboard.NUMPAD_4,
                                                  'wow':Phaser.Keyboard.NUMPAD_5});
            movement = game.input.keyboard.addKeys( { 'loop': Phaser.KeyCode.Q, 'angle': Phaser.KeyCode.A,
                                                    'wrath': Phaser.KeyCode.W, 'speed': Phaser.KeyCode.S,
                                                    'keep': Phaser.KeyCode.E, 'depth': Phaser.KeyCode.D,
                                                    'flight': Phaser.KeyCode.F } );
            extraKeys = game.input.keyboard.addKeys({'angle':Phaser.KeyCode.Z, 'speed':Phaser.KeyCode.X,
                                                      'depth':Phaser.KeyCode.C, 'reverse':Phaser.KeyCode.R});
            training = game.input.keyboard.addKeys({ 'pause':Phaser.Keyboard.SPACEBAR, 'reset': Phaser.KeyCode.G,
                                                      'mode':Phaser.KeyCode.T, 'hide':Phaser.KeyCode.H});
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);
            playMusic = true;
            background = game.add.sprite(0, 0, 'background');
            background.tint = 0x6DB4FF;
            clouds = [];
            totalSections = 13;
            performer1 = true;
            trickTime = 0;
            currentSection = {points:0, notes:0};
            lastSection = -1;
            totalGrade1 = {perform:0, judge:0};
            totalGrade2 = {perform:0, judge:0};
            pointBin = 0;
            noteCount = 0;
            staminaTime = 150;
            sectionGrades1 = [];
            sectionGrades2 = [];
            recentGrades = [];
            inSky = game.add.group();
            createCloud('cloud3');
            createCloud('cloud4');
            createCloud('cloud6');
            function createCloud (c) {
                var cloud = game.add.sprite(game.rnd.integerInRange(-game.width,game.width*2),
                                            game.rnd.integerInRange(-game.height,game.height*2), c);
                game.physics.arcade.enable(cloud);
                cloud.body.velocity.x = game.rnd.integerInRange(3,9);
                var r = game.rnd.integerInRange(0, 1);
                cloud.scale.x = game.rnd.integerInRange(75,125)/100;
                cloud.scale.y = game.rnd.integerInRange(75,125)/100;
                if (r > 0) cloud.scale.x *= -1;
                clouds.push(cloud);
                inSky.add(cloud);
            }
            angle = 0;
            if (shared.file1) player = this.createPet(shared.pets1[0].type,shared.pets1[0].maxSpeed,shared.pets1[0].stamina);
            else player = this.createPet(shared.pets2[0].type,shared.pets2[0].maxSpeed,shared.pets2[0].stamina);
            player.data.performing = true;
            player.play('fly', 16, true, true);
            inSky.add(player);

            createCloud('cloud');
            createCloud('cloud2');
            createCloud('cloud5');

            if ((shared.file1 && shared.visits1===1 || !shared.file1 && shared.visits2===1) && shared.mode===0) {
                if (shared.file1) shared.visits1++;
                else shared.visits2++;
            }

            notebox = game.add.sprite(game.width-302, 5, 'notebox');
            notes = game.add.group();

            this.makeDevice();
            staminaBar = game.add.sprite(game.width/2, game.height-50, 'staminaBar');
            staminaBar.anchor.set(.5);

            music = game.add.audio('song1');
            trainingMusic = game.add.audio('practiceMusic');
            winMusic = game.add.audio('winMusic');

            prevTime = -1;
            gradePlacements = "";

            toggle = {angle:false, speed:false, depth:false, keep:false};
            loop = {done:0, current:0, next:0, count:0, lastAngle:0};
            sectionNumber = 0;
            textSection = game.add.text(game.width-100, 112, "Section 0/"+totalSections, {font:"14px Arial Black", fill:"#000000", align:"center" });
            textSection.anchor.x = 1;

            judgeText = game.add.text(game.width-40, game.height-40, "", {font:"16px Arial Black", fill:"#ffffff", align:"center" });
            textCount = game.add.text(game.width/2, game.height*.85, "Switching roles in ", {font:"24px Arial Black", fill:"#000000", align:"center" });
            textCount.alpha = 0;
            textCount.anchor.set(.5);
            readyText = game.add.text(game.width/2, game.height/5, "Press G to start.", {font:"20px Arial Black", fill:"#000000", align:"center" });
            readyText.anchor.set(.5);
            textFinal = game.add.text(game.width/2, game.height/2, "", {font:"22px Arial Black", fill:"#000000", align:"center" });
            textFinal.anchor.set(.5);
            if (shared.mode===0) {
                trainingMusic.loopFull(1);
                notebox.x = game.width;
                textSection.x = game.width+150;
                readyText.alpha = 0;
                backButton = game.add.button(10, game.height-40, 'backButton', quitGame, null, 'over', 'out', 'down');
                backButton.height *= .45;
                backButton.width *= .45;
                trainingText = game.add.text(10, 10, "", {font:"13px Segoe UI Black", fill:"#000000", align:"left" });
                trainingText.text = "S: Change Speed (*cannot do the 4 actions below without moving)\nA: Change Angle\nD: Change Depth\nF: Change Flight Mode\nQ: Loop/U-Turn (based on flight mode)\n"+
                                    "W: Show Wrath\nE: Keep direction of next action (A/S/D/F)\n\nT: Switch Training Mode\n"+
                                    "SPACEBAR: Pause Music\nG: Restart Music\nUP & DOWN Arrow Keys: Judge music section\n"+
                                    "LEFT Arrow Key: Boo at performer\nRIGHT Arrow Key: Complement performer\n"+
                                    "H: Toggle hide information";
                if (shared.file1 && shared.device1 || !shared.file1 && shared.device2) trainingText.alpha = 0;
            }
            boo = game.add.audio('boo');
            wow = game.add.audio('wow');
            textBooWow = game.add.text(game.width-302, 56, "Wow", {font:"60px Segoe UI Black", fill:"#000000", align:"center" });
            textBooWow.anchor.y = .5;
            textBooWow.fontStyle = "italic";
            textBooWow.alpha = 0;
            moneyText = game.add.text(game.width/2, game.height-100, "", {font:"22px Segoe UI Black", fill:"#000000", align:"center" });
            judgeCooldown = 10000;
            judgeGrade = 0;
            this.game.onPause.add(this.pauseMusic, this);
            this.game.onResume.add(this.resumeMusic, this);
            this.stage.disableVisibilityChange = false;
        },
        makeDevice: function () {
            this.destroyDevice();
            if ((shared.file1 && shared.device1 && performer1) || (!shared.file1 && shared.device2 && performer1) ||
                   (!performer1 && shared.file1 && shared.device2) || (!performer1 && !shared.file1 && shared.device1)) {
                device = game.add.sprite(302, 10, 'device');
                device.data = {angle:null, speed:null, depth:null, flight:null};
                device.data.angle = game.add.text(device.x+68, device.y+6, 0, {font:"18px Segoe UI Black", fill:"#000000"});
                device.data.speed = game.add.text(device.x+68, device.y+25, 0, {font:"18px Segoe UI Black", fill:"#000000"});
                device.data.depth = game.add.text(device.x+68, device.y+44, 0, {font:"18px Segoe UI Black", fill:"#000000"});
                device.data.flight = game.add.text(device.x+68, device.y+63, 0, {font:"18px Segoe UI Black", fill:"#000000"});
            }
        },
        destroyDevice: function () {
            if (device && device.data && device.data.angle) {
                device.data.angle.destroy();
                device.data.speed.destroy();
                device.data.depth.destroy();
                device.data.flight.destroy();
                device.destroy();
            }
        },
        updateDevice: function () {
            var speed = Math.round(player.body.acceleration.x/100);
            var flight = 0;
            if (player.animations.currentAnim.name==="glide") flight = 1;
            if (loop.current!==0) flight = 2;
            device.data.angle.text = angle;
            device.data.speed.text = speed;
            device.data.depth.text = player.z;
            device.data.flight.text = flight;
            device.data.angle.fill = "#000000";
            device.data.speed.fill = "#000000";
            device.data.depth.fill = "#000000";
            device.data.flight.fill = "#000000";
        },
        deviceDisplay: function (bool) {
            if (bool) {
                device.data.angle.alpha = 1;
                device.data.speed.alpha = 1;
                device.data.depth.alpha = 1;
                device.data.flight.alpha = 1;
                device.alpha = 1;
            } else {
                device.data.angle.alpha = 0;
                device.data.speed.alpha = 0;
                device.data.depth.alpha = 0;
                device.data.flight.alpha = 0;
                device.alpha = 0;
            }

        },
        createPet: function (type,mxsp,stm) {
            var pet = game.add.sprite(300, 300, type);
            pet.data = {maxSpeed:mxsp, stamina:stm, wrath:null, wrath_sound:null, performing:false, dir:1};
            initialStamina = stm;
            game.physics.arcade.enable(pet);
            pet.body.allowRotation = true;
            if (type==="pheonix") {
                pet.anchor.setTo(.35,.6);
                pet.animations.add('fly', [0,0,1,1,2,2,3,3,4,4,5,5], 10, true);
                pet.animations.add('glide', [1,6,6,7,7,6,6,1], 10, true);
                pet.data.wrath = pet.animations.add('wrath', [8,9,10,11,10,11,10,12,13], 10, true);
                pet.data.wrath_sound = game.add.audio('wrath_pheonix');
                pet.data.wrath_sound.addMarker("cry1", 0, 1.89);
                pet.data.wrath_sound.addMarker("cry2", 2.03, 1.88);
            } else if (type.includes("gryphon")) {
                pet.anchor.setTo(.5,.6);
                pet.animations.add('fly', [0,1,2,3,4,4,3,2,1,0], 10, true);
                pet.animations.add('glide', [2,5,5,6,6,5,5,2], 10, true);
                pet.data.wrath = pet.animations.add('wrath', [7,8,9,10,11,12,2,1], 10, true);
                pet.data.wrath_sound = game.add.audio('wrath_gryphon');
                pet.data.wrath_sound.addMarker("cry1", 0, .85);
                pet.data.wrath_sound.addMarker("cry2", .87, .68);
                pet.data.wrath_sound.addMarker("cry3", 1.59, .95);
            }
            pet.data.wrath.onComplete.add(this.animationStopped, this);
            return pet;
        },
        animationStopped: function (sprite, animation) { sprite.play('fly', 16, true, true); },
        count: function (countdown) {
            if (textCount.text.includes("Switch"))
                textCount.text = "Switching roles in "+countdown+"...";
            else
                textCount.text = "Finalizing scores in "+countdown+"...";
            if (countdown===5) { player.data.performing=false; player.body.acceleration.x=300; }
            if (countdown===3) {
                if (textCount.text.includes("Switch")) {
                    player.destroy();
                    performer1 = false;
                    this.makeDevice();
                    if (!shared.file1) player = this.createPet(shared.pets1[0].type,shared.pets1[0].maxSpeed,shared.pets1[0].stamina);
                    else player = this.createPet(shared.pets2[0].type,shared.pets2[0].maxSpeed,shared.pets2[0].stamina);
                    player.x = -player.width;
                    player.body.acceleration.x=200;
                    player.play('fly', 16, true, true);
                    inSky.add(player);
                    while (player.z!==3)
                        inSky.moveDown(player);
                }
            }
            if (countdown > 0) {  textCount.alpha = 1;
                game.time.events.add(1000, mainGame.count, this, countdown-1);
            } else {
                textCount.alpha = 0;
                this.gradeSection();
                if (textCount.text.includes("Switch")) {
                    readyText.alpha = 1;
                    textCount.text = "";
                    player.body.acceleration.x=0;
                    player.data.performing = true;
                } else {
                    staminaBar.kill();
                    winMusic.play();
                    this.destroyDevice();
                    var p1 = shared.name1; var p2 = shared.name2;
                    if (!shared.file1) {p1 = shared.name2; p2 = shared.name1;}
                    textFinal.text = p1+": "+totalGrade1.perform+" performance points,\n"+
                                    totalGrade1.judge+" judgement points.\n"+
                                   p2+": "+totalGrade2.perform+" performance points,\n"+
                                   totalGrade2.judge+" judgement points.\n\n";
                    if (totalGrade1.perform+totalGrade1.judge > totalGrade2.perform+totalGrade2.judge) {
                        textFinal.text+=""+p1+" wins with a total of "+(totalGrade1.perform+totalGrade1.judge)+" points!";
                        moneyText.text = p1+" has been awarded 500 gold!";
                        if (shared.file1) shared.gold1+=500;
                        else shared.gold2+=500;
                    } else if (totalGrade1.perform+totalGrade1.judge < totalGrade2.perform+totalGrade2.judge) {
                        textFinal.text+=""+p2+" wins with a total of "+(totalGrade2.perform+totalGrade2.judge)+" points!";
                        moneyText.text = p2+" has been awarded 500 gold!";
                        if (shared.file1) shared.gold2+=500;
                        else shared.gold1+=500;
                    } else
                        textFinal.text+="It's a draw!";
                    backButton = game.add.button(10, game.height-40, 'backButton', quitGame, null, 'over', 'out', 'down');
                    backButton.height *= .45;
                    backButton.width *= .45;
                }
            }
        },
        resumeMusic: function () { music.resume(); },
        pauseMusic: function () { music.pause(); },
        musicReset: function () {
            readyText.alpha = 0;
            textSection.text = "Section 0/"+totalSections;
            sectionNumber = 0;
            pointBin = 0; noteCount = 0;
            notes.destroy(true,true);
            music.play();
            prevTime = -1; trickTime = 0;
            judgeCooldown = 10000;
            lastSection = -1;
            gradePlacements = "";
        },
        killObj: function (obj) {obj.kill();},
        endSinglePlayer: function () {
            staminaBar.kill();
            textFinal.text = "You got "+totalGrade1.perform+" points!\n";
            var n1 = game.rnd.integerInRange(800, 1000);
            var n2 = game.rnd.integerInRange(1000, 1200);
            var n3 = game.rnd.integerInRange(800, 1200);
            textFinal.text+="Your competitors scored: "+n1+", "+n2+", & "+n3+".\n";
            var place = 4;
            if (totalGrade1.perform>=n1) place--;
            if (totalGrade1.perform>=n2) place--;
            if (totalGrade1.perform>=n3) place--;
            if (place===1) {
                textFinal.text+="You won 1st place! You got 1000 gold!";
                if (shared.file1) shared.gold1 += 1000;
                else shared.gold2 += 1000;
            } else if (place===2) {
                textFinal.text+="You won 2nd place! You got 500 gold!";
                if (shared.file1) shared.gold1 += 500;
                else shared.gold2 += 500;
            } else if (place===3) {
                textFinal.text+="You won 3rd place! You got 250 gold!";
                if (shared.file1) shared.gold1 += 250;
                else shared.gold2 += 250;
            } else textFinal.text+="Better luck next time...";
            winMusic.play();
            backButton = game.add.button(10, game.height-40, 'backButton', quitGame, null, 'over', 'out', 'down');
            backButton.height *= .45;
            backButton.width *= .45;
        },

        update: function () {
            if (training.reset.downDuration(1) && readyText.alpha === 1)
                this.musicReset();

            if (movement.wrath.downDuration(1) && loop.current===0 && player.animations.currentAnim.name!=="wrath") {
                player.data.wrath.play(10,false);
                function countProperties(obj) {
                    var count = 0;
                    for(var prop in obj)
                        if(obj.hasOwnProperty(prop))
                            ++count;
                    return count;
                }
                var r = game.rnd.integerInRange(1, countProperties(player.data.wrath_sound.markers));
                player.data.wrath_sound.play("cry"+r);
                if (judgeCooldown < music.currentTime+7000)
                    judgeCooldown = music.currentTime+7000;
            }
            if (shared.mode===0)
                this.readTrainingCommands();
            if (shared.mode!==1)
                this.readJudgements();
            if (movement.keep.downDuration(1))
                toggle.keep = true;

            if (device && device.data && device.data.angle) this.updateDevice();
            if (training.hide.downDuration(1) && device && device.data && device.data.angle) {
                if (device.alpha===0) this.deviceDisplay(true);
                else this.deviceDisplay(false);
            }

            this.updateFlight(player);
            this.updateAngle(player);
            this.updateSpeed(player);
            this.updateDepth(player);

            if (player && player.data)
                this.updateStamina(player);

            var xx = 0; var yy = 0;
            while (player.centerX > 550 && player.data.performing) { player.x--;  xx--; }
            while (player.centerX < 250 && player.data.performing) { player.x++;  xx++; }
            while (player.centerY > 400 && player.data.performing) { player.y--;  yy--; }
            while (player.centerY < 200 && player.data.performing) { player.y++;  yy++; }
            this.transformClouds(xx,yy);
            if (music.isPlaying) this.readMusic();
        },
        readTrainingCommands: function () {
            if (training.mode.downDuration(1)) {
                if (trainingMusic.isPlaying) {
                    trainingMusic.stop();
                    notebox.x = game.width-302;
                    textSection.x = game.width-100;
                    this.musicReset();
                } else {
                    music.stop();
                    notes.destroy(true,true);
                    trainingMusic.loopFull(1);
                    notebox.x = game.width;
                    textSection.x = game.width+150;
                }
            }
            if (training.hide.downDuration(1)) {
                if (trainingText.alpha===0) trainingText.alpha=1;
                else trainingText.alpha=0;
            }
            if (training.pause.downDuration(1)) {
                if (music.isPlaying) this.pauseMusic();
                else { playMusic=false; this.resumeMusic(); playMusic=true; }
            }
            if (training.reset.downDuration(1) && !trainingMusic.isPlaying)
                this.musicReset();
        },
        fadeObj: function (obj) { if (obj.alpha >= .3)game.add.tween(obj).to({alpha:0}, 500, "Linear", true); },

        evaluatePerformer: function (note) {
            //player.animations.currentAnim.name==="fly", player.animations.currentAnim.name==="glide"
            //loop.current!==0
            //player.body.acceleration.x (if note.height > 10)
            //player.z (1-6), blue->1||2; ice->2||3; yellow->3||4; orange->4||5; red->5||6
            //angle (-5 to 4), +5
            var prev = note.data.grade;
            if (note.alpha < 1) {
                var speed = Math.round(player.body.acceleration.x/100);
                if (speed===note.alpha*10) {
                    note.data.grade+=2;
                    if (device && device.data && device.data.speed) device.data.speed.fill="#0000cc";
                } else if (Math.abs(speed-note.alpha*10) <= 1) {
                    note.data.grade++;
                    if (device && device.data && device.data.speed) device.data.speed.fill="#00cc00";
                }
            } else {
                if (loop.current!==0) {
                    note.data.grade++;
                    if (player.animations.currentAnim.name==="glide") {
                        note.data.grade+=2;
                        if (device && device.data && device.data.flight) device.data.flight.fill="#0000cc";
                    } else if (device && device.data && device.data.flight) device.data.flight.fill="#00cc00";
                } else if ((note.data.len > 36 && player.animations.currentAnim.name==="glide") ||
                    (note.data.len <=36 && player.animations.currentAnim.name==="fly")) {
                    note.data.grade++;
                    if (device && device.data && device.data.flight) device.data.flight.fill="#00cc00";
                }
                if (note.data.pro===player.z || (note.data.pro===5 && player.z===6)) {
                    note.data.grade+=2;
                    if (device && device.data && device.data.depth) device.data.depth.fill="#0000cc";
                } else if (note.data.pro===player.z || note.data.pro===player.z-1) {
                    note.data.grade++;
                    if (device && device.data && device.data.depth) device.data.depth.fill="#00cc00";
                }
                if (note.data.pit===(angle+5)) {
                    note.data.grade+=2;
                    if (device && device.data && device.data.angle) device.data.angle.fill="#0000cc";
                } else if (Math.abs(note.data.pit-(angle+5)) <= 1) {
                    note.data.grade++;
                    if (device && device.data && device.data.angle) device.data.angle.fill="#00cc00";
                }
            }
            pointBin += (note.data.grade-prev);
            note.data.counter++;
        },
        finishEvaluation: function (note) {
            if (note.height > 10) {
                var grade = Math.round((note.data.grade/note.data.counter)*((note.data.len+100)/50));
                this.gradeSection();
                pointBin = 0;
                if (shared.mode===2 && music.currentTime > 110000) this.count(7);
                if (shared.mode===1 && music.currentTime > 110000) this.endSinglePlayer();
                if (shared.mode!==0) return;
                var gradeText = game.add.text(note.x, note.y+105, "+"+grade, {font:"14px Arial Black", fill:"#000000", align:"center" });
                game.time.events.add(1200, this.fadeObj, this, gradeText);
                game.time.events.add(1800, this.destroyNoteText, this, gradeText, -1);
                if (music.currentTime > 110000 && totalGrade1.perform >= 500 && moneyText.alpha===1) {
                    var amount = game.rnd.integerInRange(50, 300);
                    moneyText.text = "You've attracted an audience!\nYou have received "+amount+" gold!";
                    if (shared.file1) shared.gold1+=amount;
                    else shared.gold2+=amount;
                    game.time.events.add(8000, this.fadeObj, this, moneyText);
                }
            } else {
                var grade = Math.round((note.data.grade/note.data.counter)*((note.data.len+100)/100)*((note.data.pro+7)/8));
                if (textCount.text.includes("Switch")) {
                    totalGrade1.perform+=grade;
                } else {
                    totalGrade2.perform+=grade;
                }
                recentGrades.push({points:grade, time:music.currentTime});
                currentSection.points+=grade;
                currentSection.notes++;
                for (var i = 0; i < recentGrades.length; i++)
                    if (music.currentTime > recentGrades[i].time+7000)
                        recentGrades.splice(i,1);
                if (shared.mode!==0) return;
                var gradeText = game.add.text(note.x-22, note.y, "+"+grade, {font:"10px Arial Black", fill:"#000000", align:"center" });
                if (gradePlacements.includes(note.data.pit)) gradeText.x-=20;
                else gradePlacements += ""+note.data.pit;
                game.time.events.add(900, this.fadeObj, this, gradeText);
                game.time.events.add(1500, this.destroyNoteText, this, gradeText, note.data.pit);
            }
        },
        destroyNoteText: function (txt, num) {
            if (num>=0) gradePlacements = gradePlacements.replace(num,'');
            txt.destroy();
        },
        gradeSection: function () {
            if (textCount.text.includes("Switch")) {
                if (judgeGrade===0) totalGrade2.judge-=50;
                else totalGrade1.judge+=10*judgeGrade;
                if (lastSection>=0) {
                    if (judgeGrade===1 && lastSection > 3) totalGrade2.judge-=20;
                    if (judgeGrade===4 && lastSection < 2) totalGrade2.judge-=10;
                    if (judgeGrade===1 && lastSection <= 1) totalGrade2.judge+=10;
                    if (judgeGrade===4 && lastSection >= 4) totalGrade2.judge+=20;
                }
            } else {
                if (judgeGrade===0) totalGrade1.judge-=50;
                else totalGrade2.judge+=10*judgeGrade;
                if (lastSection>=0) {
                    if (judgeGrade===1 && lastSection > 3) totalGrade1.judge-=20;
                    if (judgeGrade===4 && lastSection < 2) totalGrade1.judge-=10;
                    if (judgeGrade===1 && lastSection <= 1) totalGrade1.judge+=10;
                    if (judgeGrade===4 && lastSection >= 4) totalGrade1.judge+=20;
                }
            }
            lastSection = (currentSection.points/currentSection.notes);
            currentSection.points = 0; currentSection.notes = 0;
            judgeGrade = 0;
        },
        readJudgements: function () {
            var booing = false; var wowing = false;
            if (cursors.left.downDuration(1) || numpad.boo.downDuration(1)) booing = true;
            if (cursors.right.downDuration(1) || numpad.wow.downDuration(1)) wowing = true;
            if ((booing || wowing) && music.currentTime > judgeCooldown) {
                if (booing) {
                    boo.play(); textBooWow.text = "     BOOOOOOOOOOOOOOOOO!!!";
                    game.time.events.add(2000, this.fadeObj, this, textBooWow);
                }
                else {
                    wow.play(); textBooWow.text = "    Wow!";
                    game.time.events.add(1250, this.fadeObj, this, textBooWow);
                    textBooWow.x = game.width-302;
                    var total = 0;
                    for (var i = 0; i < recentGrades.length; i++)
                        total += recentGrades[i].points;
                    total = Math.round(total/recentGrades.length);
                    if (music.currentTime <= trickTime)
                        total++;

                    if (textCount.text.includes("Switch")) {
                        totalGrade1.judge+=50;
                        if (total === 3) totalGrade2.judge+=10;
                        if (total === 4) totalGrade2.judge+=25;
                        if (total >= 5) totalGrade2.judge+=40;
                    } else {
                        totalGrade2.judge+=50;
                        if (total === 3) totalGrade1.judge+=10;
                        if (total === 4) totalGrade1.judge+=25;
                        if (total >= 5) totalGrade1.judge+=40;
                    }
                }
                textBooWow.alpha = 1;
                judgeCooldown = music.currentTime+10000;
            }
            if (textBooWow.alpha === 1 && !textBooWow.text.includes("Wow")) {
                var t = Math.floor((10000-(judgeCooldown-music.currentTime))/2);
                textBooWow.x = game.width-t;
            }
            if (numpad.one.downDuration(1)) judgeGrade = 1;
            else if (numpad.two.downDuration(1)) judgeGrade = 2;
            else if (numpad.three.downDuration(1)) judgeGrade = 3;
            else if (numpad.four.downDuration(1)) judgeGrade = 4;
            if (cursors.up.downDuration(1)) {
                if (judgeGrade < 4)
                    judgeGrade++;
                judgeText.text = judgeGrade;
                judgeText.alpha = .3;
                game.time.events.add(1000, this.fadeObj, this, judgeText);
            }
            if (cursors.down.downDuration(1)) {
                if (judgeGrade!==1)
                    judgeGrade--;
                if (judgeGrade < 0)
                    judgeGrade = 4;
                judgeText.text = judgeGrade;
                judgeText.alpha = .3;
                game.time.events.add(1000, this.fadeObj, this, judgeText);
            }
        },
        playerUsingCustom: function (command) {
            var currentPlayer=1;
            if (!textCount.text.includes("Switch") && shared.file1 || textCount.text.includes("Switch") && !shared.file1)
                currentPlayer=2;
            if (command==="angle" && currentPlayer===1) return customControls.angle1;
            else if (command==="angle" && currentPlayer===2) return customControls.angle2;
            else if (command==="speed" && currentPlayer===1) return customControls.speed1;
            else if (command==="speed" && currentPlayer===2) return customControls.speed2;
            else if (command==="depth" && currentPlayer===1) return customControls.depth1;
            else if (command==="depth" && currentPlayer===2) return customControls.depth2;
            else if (command==="loop" && currentPlayer===1) return customControls.loop1;
            else if (command==="loop" && currentPlayer===2) return customControls.loop2;
            else if (command==="keep" && currentPlayer===1) return customControls.keep1;
            else if (command==="keep" && currentPlayer===2) return customControls.keep2;
        },
        updateFlight: function (pet) {
            if (movement.flight.downDuration(1)) {
                if (pet.animations.currentAnim.name==="fly" && loop.current === 0 && pet.body.acceleration.x >= 250 && !toggle.keep)
                    pet.play('glide', 8, true, true);
                else if (pet.animations.currentAnim.name==="glide" && loop.current === 0 && !toggle.keep)
                    pet.play('fly', 16, true, true);
                toggle.keep = false
            }
            if (pet.animations.currentAnim.name==="glide" && pet.body.acceleration.x < 250)
                pet.play('fly', 16, true, true);
            if (pet.animations.currentAnim.name==="fly") {
                if (pet.body.acceleration.x < 100) pet.animations.currentAnim.speed = 14;
                else if (pet.body.acceleration.x < 200) pet.animations.currentAnim.speed = 15;
                else if (pet.body.acceleration.x < 300) pet.animations.currentAnim.speed = 16;
                else if (pet.body.acceleration.x < 400) pet.animations.currentAnim.speed = 17;
                else pet.animations.currentAnim.speed = 18;
            }
            var custom = this.playerUsingCustom("loop");
            if (custom && extraKeys.reverse.downDuration(1))
                pet.play('fly', 16, true, true);
            else if (custom && movement.loop.downDuration(1) && pet.body.acceleration.x >= 300)
                pet.play('glide', 8, true, true);
            if ((movement.loop.downDuration(1) && !custom || custom && extraKeys.reverse.downDuration(1)) &&
                    loop.current===0 && pet.body.acceleration.x >= 200 && pet.animations.currentAnim.name==="fly") {
                trickTime = music.currentTime+7000;
                loop.current = 1; loop.next = 0; loop.done = 0;
                if (!movement.flight.isDown ^ (pet.data.dir < 0)) loop.current = -1;
                loop.lastAngle = Math.abs(pet.body.rotation);
            }
            if (movement.loop.downDuration(1) && loop.current===0 && pet.data.stamina>=40 &&
                      pet.animations.currentAnim.name==="glide" && pet.body.acceleration.x >= 300) {
                trickTime = music.currentTime+7000;
                loop.current = 1; loop.next = 0; loop.done = 0;
                if (!movement.flight.isDown ^ (pet.data.dir < 0)) loop.current = -1;
                loop.lastAngle = Math.abs(pet.body.rotation);
            } else if (movement.loop.downDuration(1) && loop.current!==0) {
                loop.next = 1;
                if (!movement.flight.isDown ^ (pet.data.dir < 0)) loop.next = -1;
            }
        },
        updateAngle: function (pet) {
            var custom = this.playerUsingCustom("angle");
            pet.body.angularVelocity = 0;
            if (movement.angle.downDuration(1)) {
                if (toggle.keep) toggle.keep = false;
                else toggle.angle = !toggle.angle;
            }
            if (loop.current!==0) {
                pet.body.angularVelocity = loop.current*10*(pet.body.acceleration.x/15);
                loop.count += Math.abs(loop.lastAngle-Math.abs(pet.body.rotation));
                loop.lastAngle = Math.abs(pet.body.rotation);
                if (pet.animations.currentAnim.name==="fly" && loop.count >= 88) {
                    if (loop.done===0) {pet.scale.y *= -1; pet.data.dir *= -1;}
                    endLoop(pet);
                }
                if (loop.count >= 358) {pet.data.stamina-=40; endLoop(pet);}
            } else if (movement.angle.isDown || custom && extraKeys.angle.isDown) {
                if (custom && extraKeys.angle.isDown) toggle.angle = false;
                else if (custom) toggle.angle = true;
                var adjust = 0;
                if (pet.data.dir < 0 && pet.rotation < 0) adjust = Math.PI;
                else if (pet.data.dir < 0 && pet.rotation > 0) adjust = -Math.PI;
                angle = Math.round((pet.rotation+adjust)*pet.data.dir*-3.5);
                if (toggle.angle && pet.data.dir < 0 && (pet.rotation > 1.87 || pet.rotation < 0))
                    pet.body.angularVelocity = -10*(pet.body.acceleration.x/20);
                else if (!toggle.angle && pet.data.dir < 0 && (pet.rotation > 1 || pet.rotation < -2.15))
                    pet.body.angularVelocity = 10*(pet.body.acceleration.x/20);
                else if (toggle.angle && pet.data.dir > 0 && pet.rotation > -1)
                    pet.body.angularVelocity = -10*(pet.body.acceleration.x/20);
                else if (!toggle.angle && pet.data.dir > 0 && pet.rotation < 1.3)
                    pet.body.angularVelocity = 10*(pet.body.acceleration.x/20);
            }

            function endLoop (pet) {
                if (pet.animations.currentAnim.name!=="fly") loop.current = loop.next;
                loop.next = 0; loop.done++; loop.count = 0;
                if (pet.animations.currentAnim.name==="fly" && loop.done>=2 || loop.done>=3)
                    {loop.done=0; loop.current=0}
            }
        },
        updateSpeed: function (pet) {
            var custom = this.playerUsingCustom("speed");
            if (movement.speed.downDuration(1)) {
                if (toggle.keep) toggle.keep = false;
                else toggle.speed = !toggle.speed;
            }
            if (custom && extraKeys.speed.isDown) toggle.speed = false;
            else if (custom) toggle.speed = true;
            if ((movement.speed.isDown || custom && extraKeys.speed.isDown) && loop.current===0 && !toggle.speed && pet.body.acceleration.x > 0 ||
                    (textCount.alpha>0 || textFinal.text!=="") && pet.body.acceleration.x > 0 && pet.data.performing )
                pet.body.acceleration.x -= 5;
            else if (movement.speed.isDown && loop.current===0 && toggle.speed && pet.body.acceleration.x < pet.data.maxSpeed)
                pet.body.acceleration.x += 5;
            pet.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(pet.angle, pet.body.acceleration.x*Math.abs(pet.scale.y)));
            // When stopping, pet should end with an angle of zero.
            if (pet.body.acceleration.x < 250 && Math.abs(pet.rotation)>pet.body.acceleration.x/100) {
                var adjust = 0;
                if (pet.data.dir < 0 && pet.rotation < 0) adjust = Math.PI;
                else if (pet.data.dir < 0 && pet.rotation > 0) adjust = -Math.PI;
                if (pet.rotation+adjust > .01575) pet.rotation -= .002*(pet.body.acceleration.x+250)/20;
                else if (pet.rotation+adjust < -.01575) pet.rotation += .002*(pet.body.acceleration.x+250)/20;
                else pet.rotation = adjust;
                angle = Math.round((pet.rotation+adjust)*pet.data.dir*-3.5);
            }
        },
        updateDepth: function (pet) {
            var custom = this.playerUsingCustom("depth");
            if (movement.depth.downDuration(1)) {
                if (toggle.keep) toggle.keep = false;
                else toggle.depth = !toggle.depth;
            } var scl = Math.abs(pet.scale.y);
            if (custom && extraKeys.depth.isDown) toggle.depth = false;
            else if (custom) toggle.depth = true;
            if (((movement.depth.isDown || custom && extraKeys.depth.isDown) && !toggle.depth && scl > .67) ||
                (movement.depth.isDown && toggle.depth && scl < 1.5)) {
                var depthSpeed = pet.body.acceleration.x/25000;
                if (toggle.depth) depthSpeed = -depthSpeed;
                pet.width *= 1-depthSpeed;
                pet.height *= 1-depthSpeed;
                if (scl < .67 && Math.abs(pet.scale.y) >= .67) inSky.moveUp(pet);
                else if (scl >= .67 && Math.abs(pet.scale.y) < .67) inSky.moveDown(pet);
                else if (scl < .8 && Math.abs(pet.scale.y) >= .8) inSky.moveUp(pet);
                else if (scl >= .8 && Math.abs(pet.scale.y) < .8) inSky.moveDown(pet);
                else if (scl < 1.2 && Math.abs(pet.scale.y) >= 1.2) inSky.moveUp(pet);
                else if (scl >= 1.2 && Math.abs(pet.scale.y) < 1.2) inSky.moveDown(pet);
                else if (scl < 1.35 && Math.abs(pet.scale.y) >= 1.35) inSky.moveUp(pet);
                else if (scl >= 1.35 && Math.abs(pet.scale.y) < 1.35) inSky.moveDown(pet);
                else if (scl < 1.5 && Math.abs(pet.scale.y) >= 1.5) inSky.moveUp(pet);
                else if (scl >= 1.5 && Math.abs(pet.scale.y) < 1.5) inSky.moveDown(pet);
            }
        },
        updateStamina: function (pet) {
            if (pet.body.acceleration.x < 300 && this.time.time > staminaTime) {
                pet.data.stamina++;
                staminaTime = this.time.time+250;
            } else if (pet.body.acceleration.x > 400 && this.time.time > staminaTime) {
                pet.data.stamina--;
                staminaTime = this.time.time+250;
            }
            if (pet.data.stamina > initialStamina) pet.data.stamina = initialStamina;
            else if (pet.data.stamina < 0) pet.data.stamina=0;
            while (pet.body.acceleration.x > pet.data.stamina+initialStamina/2)
                pet.body.acceleration.x-=5;
            staminaBar.width = pet.data.stamina/2;
        },
        transformClouds: function (xx,yy) {
            for (var i = 0; i < clouds.length; i++) {
                var cloud = clouds[i];
                cloud.x+=xx; cloud.y+=yy;
                if (cloud.centerX+Math.abs(cloud.width) < 0 || cloud.centerX-Math.abs(cloud.width) > game.width ||
                    cloud.centerY+Math.abs(cloud.height) < 0 || cloud.centerY-Math.abs(cloud.height) > game.height) {
                    cloud.body.velocity.x = game.rnd.integerInRange(3,9);
                    cloud.scale.x = game.rnd.integerInRange(75,125)/100;
                    cloud.scale.y = game.rnd.integerInRange(75,125)/100;
                    var r = game.rnd.integerInRange(0, 1);
                    if (r > 0) cloud.scale.x *= -1;
                    r = game.rnd.integerInRange(0, 3);
                    switch (r) {
                        case 0: cloud.centerX = game.rnd.integerInRange(0, game.width);
                                cloud.centerY = -Math.abs(cloud.height);   break;
                        case 1: cloud.centerX = -Math.abs(cloud.width);
                                cloud.centerY = game.rnd.integerInRange(0, game.height);  break;
                        case 2: cloud.centerX = game.rnd.integerInRange(0, game.width);
                                cloud.centerY = game.height+Math.abs(cloud.height);  break;
                        default: cloud.centerX = game.width+Math.abs(cloud.width);
                                cloud.centerY = game.rnd.integerInRange(0, game.height);
                    }
                    r = game.rnd.integerInRange(0, 5);
                    cloud.alpha = 1-r/10;
                    r = game.rnd.integerInRange(0, clouds.length-1);
                    if (r!==i && !clouds[r].inCamera)
                        inSky.swap(cloud, clouds[r]);
                }
            }
        },
        createNote: function (pitch, prominence, length) { // pitch:0-9 || .2-.5; prominence:1-5
            var note = game.add.sprite(game.width, 6, 'note');
            note.width = length;
            note.data = {time:music.currentTime/10, bright:0x000000,
                          pit:pitch, pro:prominence, len:length, counter:1, grade:0};
            switch (prominence) {
                case 1: note.tint=0x3333ff; note.data.bright=0x4d4d00; break;
                case 2: note.tint=0x99c0ff; note.data.bright=0x331e00; break;
                case 3: note.tint=0xffff00; note.data.bright=0x0000b3; break;
                case 4: note.tint=0xff8533; note.data.bright=0x002e4d; break;
                case 5: note.tint=0xff1a1a; note.data.bright=0x004c4c; break;
                default:note.tint=0x000000;
            }
            if (pitch > 0 && pitch < 1) { note.height=99;  note.alpha = pitch; }
            else note.y+=(9-pitch)*10;
            notes.add(note); noteCount++;
        },
        moveNote: function (note) {
            if (note.x > game.width-301)
                note.x = game.width-(Math.floor(music.currentTime/10)-note.data.time);
            else if (note.width > 0) {
                this.evaluatePerformer(note);
                note.width = note.data.len-(Math.floor(music.currentTime/10)-note.data.time-300);
            }if (note.height > 10 && note.width===note.data.len && note.x<=game.width-301)
                this.incrementSection();
            if (note.alpha===1 && note.x <= game.width-301 && note.data.bright!==0x000000) {
                note.tint += note.data.bright; note.data.bright = 0x000000;
            }
            if (note.x < game.width-301)
                note.x = game.width-301;
            if (note.width < 1) {
                this.finishEvaluation(note);
                note.destroy();
            }
        },
        incrementSection: function () { sectionNumber++; textSection.text = "Section "+sectionNumber+"/"+totalSections; },
        readMusic: function () {
            if (music.currentTime === 0 && prevTime < 0) {
                this.createNote(.3,0,825);
            } // 1
            else if (music.currentTime >= 8250 && music.currentTime < 8250+prevTime) {
                this.createNote(.3,0,815); this.createNote(1,1,200);
            } // 2
            else if (music.currentTime >= 10300 && music.currentTime < 10300+prevTime) { this.createNote(0,1,115); }
            else if (music.currentTime >= 11450 && music.currentTime < 11450+prevTime) { this.createNote(2,2,37); }
            else if (music.currentTime >= 11820 && music.currentTime < 11820+prevTime) { this.createNote(3,2,53); }
            else if (music.currentTime >= 12350 && music.currentTime < 12350+prevTime) { this.createNote(4,2,204); }
            else if (music.currentTime >= 14390 && music.currentTime < 14390+prevTime) { this.createNote(5,2,204); }
            else if (music.currentTime >= 16450 && music.currentTime < 16450+prevTime) {
                this.createNote(.3,0,830); this.createNote(6,3,96);
            } // 3
            else if (music.currentTime >= 17400 && music.currentTime < 17400+prevTime) { this.createNote(4,2,159); }
            else if (music.currentTime >= 18920 && music.currentTime < 18920+prevTime) { this.createNote(3,1,59); }
            else if (music.currentTime >= 19520 && music.currentTime < 19520+prevTime) { this.createNote(4,2,23); }
            else if (music.currentTime >= 19760 && music.currentTime < 19760+prevTime) { this.createNote(3,2,31); }
            else if (music.currentTime >= 20000 && music.currentTime < 20000+prevTime) { this.createNote(4,3,24); }
            else if (music.currentTime >= 20280 && music.currentTime < 20280+prevTime) { this.createNote(3,3,12); }
            else if (music.currentTime >= 20400 && music.currentTime < 20400+prevTime) { this.createNote(4,3,15); }
            else if (music.currentTime >= 20550 && music.currentTime < 20550+prevTime) { this.createNote(5,3,215); }
            else if (music.currentTime >= 26550 && music.currentTime < 26550+prevTime) {
                this.createNote(.4,0,830);
            } // 4
            else if (music.currentTime >= 27200 && music.currentTime < 27200+prevTime) { this.createNote(5,4,15); }
            else if (music.currentTime >= 27350 && music.currentTime < 27350+prevTime) { this.createNote(4,4,14); }
            else if (music.currentTime >= 27490 && music.currentTime < 27490+prevTime) { this.createNote(5,4,12); }
            else if (music.currentTime >= 27620 && music.currentTime < 27620+prevTime) { this.createNote(6,4,64); }
            else if (music.currentTime >= 28260 && music.currentTime < 28260+prevTime) { this.createNote(5,4,51); }
            else if (music.currentTime >= 28770 && music.currentTime < 28770+prevTime) { this.createNote(7,4,71); }
            else if (music.currentTime >= 29480 && music.currentTime < 29480+prevTime) { this.createNote(6,3,10); }
            else if (music.currentTime >= 29580 && music.currentTime < 29580+prevTime) { this.createNote(5,3,15); }
            else if (music.currentTime >= 29730 && music.currentTime < 29730+prevTime) { this.createNote(5,4,50); }
            else if (music.currentTime >= 30320 && music.currentTime < 30320+prevTime) { this.createNote(4,4,42); }
            else if (music.currentTime >= 30740 && music.currentTime < 30740+prevTime) { this.createNote(5,4,72); }
            else if (music.currentTime >= 31460 && music.currentTime < 31460+prevTime) { this.createNote(6,3,14); }
            else if (music.currentTime >= 31600 && music.currentTime < 31600+prevTime) { this.createNote(5,3,14); }
            else if (music.currentTime >= 31730 && music.currentTime < 31730+prevTime) { this.createNote(5,4,62); }
            else if (music.currentTime >= 32320 && music.currentTime < 32320+prevTime) { this.createNote(4,4,54); }
            else if (music.currentTime >= 32860 && music.currentTime < 32860+prevTime) { this.createNote(5,4,73); }
            else if (music.currentTime >= 33620 && music.currentTime < 33620+prevTime) { this.createNote(4,3,9); }
            else if (music.currentTime >= 33700 && music.currentTime < 33700+prevTime) { this.createNote(3,3,12); }
            else if (music.currentTime >= 33820 && music.currentTime < 33820+prevTime) { this.createNote(5,4,105); }
            else if (music.currentTime >= 34900 && music.currentTime < 34900+prevTime) {
                this.createNote(.4,0,841);
            } // 5
            else if (music.currentTime >= 35330 && music.currentTime < 35330+prevTime) { this.createNote(5,4,35); }
            else if (music.currentTime >= 35680 && music.currentTime < 35680+prevTime) { this.createNote(4,3,9); }
            else if (music.currentTime >= 35770 && music.currentTime < 35770+prevTime) { this.createNote(5,3,13); }
            else if (music.currentTime >= 35910 && music.currentTime < 35910+prevTime) { this.createNote(6,4,57); }
            else if (music.currentTime >= 36470 && music.currentTime < 36470+prevTime) { this.createNote(5,4,53); }
            else if (music.currentTime >= 37000 && music.currentTime < 37000+prevTime) { this.createNote(7,4,47); }
            else if (music.currentTime >= 37470 && music.currentTime < 37470+prevTime) { this.createNote(6,4,43); }
            else if (music.currentTime >= 37900 && music.currentTime < 37900+prevTime) { this.createNote(5,3,9); }
            else if (music.currentTime >= 37990 && music.currentTime < 37990+prevTime) { this.createNote(5,4,48); }
            else if (music.currentTime >= 38480 && music.currentTime < 38480+prevTime) { this.createNote(4,4,55); }
            else if (music.currentTime >= 39030 && music.currentTime < 39030+prevTime) { this.createNote(5,4,73); }
            else if (music.currentTime >= 39760 && music.currentTime < 39760+prevTime) { this.createNote(7,3,13); }
            else if (music.currentTime >= 39890 && music.currentTime < 39890+prevTime) { this.createNote(5,3,11); }
            else if (music.currentTime >= 40000 && music.currentTime < 40000+prevTime) { this.createNote(5,4,56); }
            else if (music.currentTime >= 40560 && music.currentTime < 40560+prevTime) { this.createNote(4,4,25); }
            else if (music.currentTime >= 40840 && music.currentTime < 40840+prevTime) { this.createNote(5,4,25); }
            else if (music.currentTime >= 41090 && music.currentTime < 41090+prevTime) { this.createNote(6,4,76); }
            else if (music.currentTime >= 41850 && music.currentTime < 41850+prevTime) { this.createNote(5,3,14); }
            else if (music.currentTime >= 41980 && music.currentTime < 41980+prevTime) { this.createNote(5,4,117); }
            else if (music.currentTime >= 43930 && music.currentTime < 43930+prevTime) {
                this.createNote(.4,0,840); this.createNote(5,3,18);
            } // 6
            else if (music.currentTime >= 44100 && music.currentTime < 44100+prevTime) { this.createNote(7,3,29); }
            else if (music.currentTime >= 44390 && music.currentTime < 44390+prevTime) { this.createNote(6,3,16); }
            else if (music.currentTime >= 44550 && music.currentTime < 44550+prevTime) { this.createNote(5,3,16); }
            else if (music.currentTime >= 44710 && music.currentTime < 44710+prevTime) { this.createNote(4,3,15); }
            else if (music.currentTime >= 44860 && music.currentTime < 44860+prevTime) { this.createNote(3,3,14); }
            else if (music.currentTime >= 45000 && music.currentTime < 45000+prevTime) { this.createNote(5,3,17); }
            else if (music.currentTime >= 45170 && music.currentTime < 45170+prevTime) { this.createNote(4,4,100); }
            else if (music.currentTime >= 46170 && music.currentTime < 46170+prevTime) { this.createNote(8,4,45); }
            else if (music.currentTime >= 46620 && music.currentTime < 46620+prevTime) { this.createNote(9,4,37); }
            else if (music.currentTime >= 46990 && music.currentTime < 46990+prevTime) { this.createNote(8,4,101); }
            else if (music.currentTime >= 48000 && music.currentTime < 48000+prevTime) { this.createNote(4,3,24); }
            else if (music.currentTime >= 48240 && music.currentTime < 48240+prevTime) { this.createNote(6,3,18); }
            else if (music.currentTime >= 48420 && music.currentTime < 48420+prevTime) { this.createNote(5,3,17); }
            else if (music.currentTime >= 48590 && music.currentTime < 48590+prevTime) { this.createNote(4,3,16); }
            else if (music.currentTime >= 48750 && music.currentTime < 48750+prevTime) { this.createNote(3,3,15); }
            else if (music.currentTime >= 48900 && music.currentTime < 48900+prevTime) { this.createNote(2,3,15); }
            else if (music.currentTime >= 49050 && music.currentTime < 49050+prevTime) { this.createNote(4,3,23); }
            else if (music.currentTime >= 49280 && music.currentTime < 49280+prevTime) { this.createNote(3,3,103); }
            else if (music.currentTime >= 50310 && music.currentTime < 50310+prevTime) { this.createNote(5,3,51); this.createNote(4,2,51); }
            else if (music.currentTime >= 50820 && music.currentTime < 50820+prevTime) { this.createNote(2,3,51); this.createNote(3,2,51); }
            else if (music.currentTime >= 51330 && music.currentTime < 51330+prevTime) { this.createNote(4,2,80); this.createNote(5,3,38); }
            else if (music.currentTime >= 51710 && music.currentTime < 51710+prevTime) { this.createNote(6,4,62); }

            else if (music.currentTime >= 49680 && music.currentTime < 49680+prevTime) { this.createNote(2,2,60); }
            else if (music.currentTime >= 52130 && music.currentTime < 52130+prevTime) { this.createNote(5,2,21); }
            else if (music.currentTime >= 52330 && music.currentTime < 52330+prevTime) {
                 this.createNote(.4,0,922); this.createNote(7,4,71); this.createNote(7,2,18);
            } // 7
            else if (music.currentTime >= 52510 && music.currentTime < 52510+prevTime) { this.createNote(6,2,17); }
            else if (music.currentTime >= 52680 && music.currentTime < 52680+prevTime) { this.createNote(5,2,17); }
            else if (music.currentTime >= 52850 && music.currentTime < 52850+prevTime) { this.createNote(4,2,17); }
            else if (music.currentTime >= 53020 && music.currentTime < 53020+prevTime) { this.createNote(3,2,16); }
            else if (music.currentTime >= 53180 && music.currentTime < 53180+prevTime) { this.createNote(5,2,18); }
            else if (music.currentTime >= 53360 && music.currentTime < 53360+prevTime) { this.createNote(4,3,39); }
            else if (music.currentTime >= 53750 && music.currentTime < 53750+prevTime) { this.createNote(6,3,45); }
            else if (music.currentTime >= 54200 && music.currentTime < 54200+prevTime) { this.createNote(9,3,18); }
            else if (music.currentTime >= 54380 && music.currentTime < 54380+prevTime) { this.createNote(9,4,54); }
            else if (music.currentTime >= 54920 && music.currentTime < 54920+prevTime) { this.createNote(5,2,15); }
            else if (music.currentTime >= 55070 && music.currentTime < 55070+prevTime) { this.createNote(5,3,68); }
            else if (music.currentTime >= 55750 && music.currentTime < 55750+prevTime) { this.createNote(4,3,47); }

            else if (music.currentTime >= 56060 && music.currentTime < 56060+prevTime) { this.createNote(8,4,40); this.createNote(5,1,16); }
            else if (music.currentTime >= 56950 && music.currentTime < 56950+prevTime) { this.createNote(8,4,50); }

            else if (music.currentTime >= 56220 && music.currentTime < 56220+prevTime) { this.createNote(7,1,21); }
            else if (music.currentTime >= 56430 && music.currentTime < 56430+prevTime) { this.createNote(6,1,21); }
            else if (music.currentTime >= 56640 && music.currentTime < 56640+prevTime) { this.createNote(5,1,21); }
            else if (music.currentTime >= 56850 && music.currentTime < 56850+prevTime) { this.createNote(4,1,21); }
            else if (music.currentTime >= 57060 && music.currentTime < 57060+prevTime) { this.createNote(3,1,21); }
            else if (music.currentTime >= 57270 && music.currentTime < 57270+prevTime) { this.createNote(5,1,21); }
            else if (music.currentTime >= 57480 && music.currentTime < 57480+prevTime) { this.createNote(4,3,100); }
            else if (music.currentTime >= 58010 && music.currentTime < 58010+prevTime) { this.createNote(7,4,38); }
            else if (music.currentTime >= 58390 && music.currentTime < 58390+prevTime) { this.createNote(9,3,9); }
            else if (music.currentTime >= 58480 && music.currentTime < 58480+prevTime) { this.createNote(9,4,34); this.createNote(3,1,58); }
            else if (music.currentTime >= 59050 && music.currentTime < 59050+prevTime) { this.createNote(2,1,26); }
            else if (music.currentTime >= 59310 && music.currentTime < 59310+prevTime) { this.createNote(4,2,230); }
            else if (music.currentTime >= 59980 && music.currentTime < 59980+prevTime) { this.createNote(9,4,61); }
            else if (music.currentTime >= 61000 && music.currentTime < 61000+prevTime) { this.createNote(9,4,55); }
            else if (music.currentTime >= 61580 && music.currentTime < 61580+prevTime) {
                this.createNote(.2,0,818);
            } // 8
            else if (music.currentTime >= 61970 && music.currentTime < 61970+prevTime) { this.createNote(3,1,27); }
            else if (music.currentTime >= 62240 && music.currentTime < 62240+prevTime) { this.createNote(4,1,25); }
            else if (music.currentTime >= 62490 && music.currentTime < 62490+prevTime) { this.createNote(4,1,25); }
            else if (music.currentTime >= 63640 && music.currentTime < 63640+prevTime) { this.createNote(5,1,22); }
            else if (music.currentTime >= 63860 && music.currentTime < 63860+prevTime) { this.createNote(7,1,27); }
            else if (music.currentTime >= 64320 && music.currentTime < 64320+prevTime) { this.createNote(4,1,33); }
            else if (music.currentTime >= 65680 && music.currentTime < 65680+prevTime) { this.createNote(5,1,26); }
            else if (music.currentTime >= 65950 && music.currentTime < 65950+prevTime) { this.createNote(7,1,26); }
            else if (music.currentTime >= 66330 && music.currentTime < 66330+prevTime) { this.createNote(4,1,56); }
            else if (music.currentTime >= 67710 && music.currentTime < 67710+prevTime) { this.createNote(6,1,24); }
            else if (music.currentTime >= 67950 && music.currentTime < 67950+prevTime) { this.createNote(7,1,25); }
            else if (music.currentTime >= 68200 && music.currentTime < 68200+prevTime) { this.createNote(3,1,30); }
            else if (music.currentTime >= 68520 && music.currentTime < 68520+prevTime) { this.createNote(4,1,33); }

            else if (music.currentTime >= 69780 && music.currentTime < 69780+prevTime) {
                this.createNote(.2,0,912);
            } // 9
            else if (music.currentTime >= 70180 && music.currentTime < 70180+prevTime) { this.createNote(3,1,30); }
            else if (music.currentTime >= 70480 && music.currentTime < 70480+prevTime) { this.createNote(4,1,29); }
            else if (music.currentTime >= 70780 && music.currentTime < 70780+prevTime) { this.createNote(4,1,41); }
            else if (music.currentTime >= 71820 && music.currentTime < 71820+prevTime) { this.createNote(6,1,27); }
            else if (music.currentTime >= 72090 && music.currentTime < 72090+prevTime) { this.createNote(4,1,33); }
            else if (music.currentTime >= 72530 && music.currentTime < 72530+prevTime) { this.createNote(5,1,50); }
            else if (music.currentTime >= 73880 && music.currentTime < 73880+prevTime) { this.createNote(6,1,33); }
            else if (music.currentTime >= 74860 && music.currentTime < 74860+prevTime) { this.createNote(4,1,40); }
            else if (music.currentTime >= 75640 && music.currentTime < 75640+prevTime) { this.createNote(5,1,40); }
            else if (music.currentTime >= 78900 && music.currentTime < 78900+prevTime) {
                this.createNote(.5,0,901);
            } // 10
            else if (music.currentTime >= 79500 && music.currentTime < 79500+prevTime) { this.createNote(5,5,24); }
            else if (music.currentTime >= 79740 && music.currentTime < 79740+prevTime) { this.createNote(4,5,18); }
            else if (music.currentTime >= 79920 && music.currentTime < 79920+prevTime) { this.createNote(5,5,18); }
            else if (music.currentTime >= 80100 && music.currentTime < 80100+prevTime) { this.createNote(6,5,60); }
            else if (music.currentTime >= 80700 && music.currentTime < 80700+prevTime) { this.createNote(5,5,55); }
            else if (music.currentTime >= 81250 && music.currentTime < 81250+prevTime) { this.createNote(7,5,74); }
            else if (music.currentTime >= 81990 && music.currentTime < 81990+prevTime) { this.createNote(6,4,10); }
            else if (music.currentTime >= 82090 && music.currentTime < 82090+prevTime) { this.createNote(5,4,10); }
            else if (music.currentTime >= 82190 && music.currentTime < 82190+prevTime) { this.createNote(5,5,76); }
            else if (music.currentTime >= 82950 && music.currentTime < 82950+prevTime) { this.createNote(4,5,57); }
            else if (music.currentTime >= 83520 && music.currentTime < 83520+prevTime) { this.createNote(5,5,75); }
            else if (music.currentTime >= 84270 && music.currentTime < 84270+prevTime) { this.createNote(6,5,14); }
            else if (music.currentTime >= 84410 && music.currentTime < 84410+prevTime) { this.createNote(5,4,13); }
            else if (music.currentTime >= 84540 && music.currentTime < 84540+prevTime) { this.createNote(5,5,66); }
            else if (music.currentTime >= 85200 && music.currentTime < 85200+prevTime) { this.createNote(4,5,57); }
            else if (music.currentTime >= 85770 && music.currentTime < 85770+prevTime) { this.createNote(5,5,80); }
            else if (music.currentTime >= 86570 && music.currentTime < 86570+prevTime) { this.createNote(4,4,19); }
            else if (music.currentTime >= 86760 && music.currentTime < 86760+prevTime) { this.createNote(3,3,9); }
            else if (music.currentTime >= 86850 && music.currentTime < 86850+prevTime) { this.createNote(5,5,115); }
            else if (music.currentTime >= 88000 && music.currentTime < 88000+prevTime) {
                this.createNote(.5,0,924);
            } // 11
            else if (music.currentTime >= 88540 && music.currentTime < 88540+prevTime) { this.createNote(5,5,27); }
            else if (music.currentTime >= 88810 && music.currentTime < 88810+prevTime) { this.createNote(4,4,16); }
            else if (music.currentTime >= 88970 && music.currentTime < 88970+prevTime) { this.createNote(5,5,13); }
            else if (music.currentTime >= 89100 && music.currentTime < 89100+prevTime) { this.createNote(6,5,59); }
            else if (music.currentTime >= 89690 && music.currentTime < 89690+prevTime) { this.createNote(5,5,50); }
            else if (music.currentTime >= 90200 && music.currentTime < 90200+prevTime) { this.createNote(7,5,57); }
            else if (music.currentTime >= 90770 && music.currentTime < 90770+prevTime) { this.createNote(6,5,34); }
            else if (music.currentTime >= 91110 && music.currentTime < 91110+prevTime) { this.createNote(5,4,9); }
            else if (music.currentTime >= 91200 && music.currentTime < 91200+prevTime) { this.createNote(5,5,78); }
            else if (music.currentTime >= 91980 && music.currentTime < 91980+prevTime) { this.createNote(4,5,58); }
            else if (music.currentTime >= 92560 && music.currentTime < 92560+prevTime) { this.createNote(5,5,81); }
            else if (music.currentTime >= 93370 && music.currentTime < 93370+prevTime) { this.createNote(7,5,17); }
            else if (music.currentTime >= 93550 && music.currentTime < 93550+prevTime) { this.createNote(5,4,17); }
            else if (music.currentTime >= 93720 && music.currentTime < 93720+prevTime) { this.createNote(5,5,56); }
            else if (music.currentTime >= 94280 && music.currentTime < 94280+prevTime) { this.createNote(4,5,23); }
            else if (music.currentTime >= 94510 && music.currentTime < 94510+prevTime) { this.createNote(5,5,31); }
            else if (music.currentTime >= 94820 && music.currentTime < 94820+prevTime) { this.createNote(6,5,86); }
            else if (music.currentTime >= 95680 && music.currentTime < 95680+prevTime) { this.createNote(5,4,30); }
            else if (music.currentTime >= 95980 && music.currentTime < 95980+prevTime) { this.createNote(5,5,122); }

            else if (music.currentTime >= 97910 && music.currentTime < 97910+prevTime) {
                this.createNote(.5,0,906); this.createNote(5,4,28);
            } // 12
            else if (music.currentTime >= 98190 && music.currentTime < 98190+prevTime) { this.createNote(7,4,19); }
            else if (music.currentTime >= 98380 && music.currentTime < 98380+prevTime) { this.createNote(6,4,19); }
            else if (music.currentTime >= 98570 && music.currentTime < 98570+prevTime) { this.createNote(5,4,19); }
            else if (music.currentTime >= 98760 && music.currentTime < 98760+prevTime) { this.createNote(4,4,19); }
            else if (music.currentTime >= 98950 && music.currentTime < 98950+prevTime) { this.createNote(3,4,19); }
            else if (music.currentTime >= 99140 && music.currentTime < 99140+prevTime) { this.createNote(5,4,21); }
            else if (music.currentTime >= 99350 && music.currentTime < 99350+prevTime) { this.createNote(4,5,108); }
            else if (music.currentTime >= 100430 && music.currentTime < 100430+prevTime) { this.createNote(8,5,50); }
            else if (music.currentTime >= 100930 && music.currentTime < 100930+prevTime) { this.createNote(9,5,35); }
            else if (music.currentTime >= 101280 && music.currentTime < 101280+prevTime) { this.createNote(8,5,103); }
            else if (music.currentTime >= 102580 && music.currentTime < 102580+prevTime) { this.createNote(4,4,19); }
            else if (music.currentTime >= 102770 && music.currentTime < 102770+prevTime) { this.createNote(6,4,18); }
            else if (music.currentTime >= 102950 && music.currentTime < 102950+prevTime) { this.createNote(5,4,18); }
            else if (music.currentTime >= 103130 && music.currentTime < 103130+prevTime) { this.createNote(4,4,18); }
            else if (music.currentTime >= 103310 && music.currentTime < 103310+prevTime) { this.createNote(3,4,18); }
            else if (music.currentTime >= 103490 && music.currentTime < 103490+prevTime) { this.createNote(2,4,18); }
            else if (music.currentTime >= 103670 && music.currentTime < 103670+prevTime) { this.createNote(4,4,19); }
            else if (music.currentTime >= 103860 && music.currentTime < 103860+prevTime) { this.createNote(3,5,109); }
            else if (music.currentTime >= 104950 && music.currentTime < 104950+prevTime) { this.createNote(6,5,52); }
            else if (music.currentTime >= 105470 && music.currentTime < 105470+prevTime) { this.createNote(2,5,30); }
            else if (music.currentTime >= 105770 && music.currentTime < 105770+prevTime) { this.createNote(4,5,114); }

            else if (music.currentTime >= 106980 && music.currentTime < 106980+prevTime) {
                this.createNote(.5,0,1240);
            } // 13
            else if (music.currentTime >= 107110 && music.currentTime < 107110+prevTime) { this.createNote(4,4,13); }
            else if (music.currentTime >= 107240 && music.currentTime < 107240+prevTime) { this.createNote(6,4,19); }
            else if (music.currentTime >= 107430 && music.currentTime < 107430+prevTime) { this.createNote(5,4,19); }
            else if (music.currentTime >= 107620 && music.currentTime < 107620+prevTime) { this.createNote(4,4,19); }
            else if (music.currentTime >= 107810 && music.currentTime < 107810+prevTime) { this.createNote(3,4,19); }
            else if (music.currentTime >= 108000 && music.currentTime < 108000+prevTime) { this.createNote(2,4,19); }
            else if (music.currentTime >= 108190 && music.currentTime < 108190+prevTime) { this.createNote(4,4,19); }
            else if (music.currentTime >= 108380 && music.currentTime < 108380+prevTime) { this.createNote(3,5,86); }
            else if (music.currentTime >= 109240 && music.currentTime < 109240+prevTime) { this.createNote(2,5,16); }
            else if (music.currentTime >= 109400 && music.currentTime < 109400+prevTime) { this.createNote(6,5,66); }
            else if (music.currentTime >= 110060 && music.currentTime < 110060+prevTime) { this.createNote(5,5,18); }
            else if (music.currentTime >= 110240 && music.currentTime < 110240+prevTime) { this.createNote(5,5,66); }
            else if (music.currentTime >= 110900 && music.currentTime < 110900+prevTime) { this.createNote(4,5,44); }
            else if (music.currentTime >= 111500 && music.currentTime < 111500+prevTime) { this.createNote(4,4,28); }
            else if (music.currentTime >= 111780 && music.currentTime < 111780+prevTime) { this.createNote(6,4,25); }
            else if (music.currentTime >= 112030 && music.currentTime < 112030+prevTime) { this.createNote(5,4,13); }
            else if (music.currentTime >= 112160 && music.currentTime < 112160+prevTime) { this.createNote(4,4,26); }
            else if (music.currentTime >= 112420 && music.currentTime < 112420+prevTime) { this.createNote(3,4,13); }
            else if (music.currentTime >= 112550 && music.currentTime < 112550+prevTime) { this.createNote(2,4,12); }
            else if (music.currentTime >= 112670 && music.currentTime < 112670+prevTime) { this.createNote(4,4,28); }

            else if (music.currentTime >= 112950 && music.currentTime < 112950+prevTime) { this.createNote(3,5,97); }
            else if (music.currentTime >= 113920 && music.currentTime < 113920+prevTime) { this.createNote(2,5,67); }
            else if (music.currentTime >= 114590 && music.currentTime < 114590+prevTime) { this.createNote(1,5,32); }
            else if (music.currentTime >= 114910 && music.currentTime < 114910+prevTime) { this.createNote(3,5,250); }

            else if (music.currentTime >= 111200 && music.currentTime < 111200+prevTime) { this.createNote(8,3,50); }
            else if (music.currentTime >= 112300 && music.currentTime < 112300+prevTime) { this.createNote(7,3,13); }
            else if (music.currentTime >= 113470 && music.currentTime < 113470+prevTime) { this.createNote(8,3,38); }
            else if (music.currentTime >= 113850 && music.currentTime < 113850+prevTime) { this.createNote(9,2,20); }
            else if (music.currentTime >= 114050 && music.currentTime < 114050+prevTime) { this.createNote(9,3,59); }
            else if (music.currentTime >= 115550 && music.currentTime < 115550+prevTime) { this.createNote(9,4,68); }
            else if (music.currentTime >= 116730 && music.currentTime < 116730+prevTime) { this.createNote(9,4,68); }

            notes.forEachExists(this.moveNote, this);
            prevTime = this.time.elapsedMS;
        },
    }; return mainGame;
};
