"use strict";

GameStates.makeShop = function( game, shared ) {
    var music;
    var background;
    var creature1;
    var creature2;
    var creature3;
    var creatureGroup;

    var rose_body;
    var rose_eyes;
    var textRose;
    var speechBubble;
    var inputBox;

    var option1Text;
    var option1Button;
    var option2Text;
    var option2Button;
    var option3Text;
    var option3Button;
    var option4Text;
    var option4Button;
    var submitButton;
    var enter;
    var choosingAllowed;
    var selectedCreature;
    var cursors;
    var enteredName;
    var goldText;
    var goldAmount;
    var petType;

    function quitGame() {
        if (music) music.stop(); music = null;
        if (background) background.kill(); background = null;
        if (creature1) creature1.kill();
        if (creature2) creature2.kill();
        if (creature3) creature3.kill();
        //if (inputBox) inputBox.destroy();
        if (goldText) goldText.destroy();
        game.state.start('MainMenu');
    }

    var mainGame = {
        create: function () {
            //training = game.input.keyboard.addKeys({ 'pause':Phaser.Keyboard.SPACEBAR, 'reset': Phaser.KeyCode.R,
            //                                          'mode':Phaser.KeyCode.T, 'hide':Phaser.KeyCode.H});
            enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            background = game.add.sprite(0, 0, 'shop');
            game.add.plugin(PhaserInput.Plugin);
            choosingAllowed = false;
            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);

            music = game.add.audio('shopMusic');
            music.loopFull(1);
            if (shared.file1) goldAmount = shared.gold1;
            else goldAmount = shared.gold2;

            var creatureNum = 5;
            creatureGroup = game.add.group();
            var r = game.rnd.integerInRange(1, creatureNum);
            creature1 = this.createPet(r);
            creatureGroup.add(creature1);
            var r2 = game.rnd.integerInRange(1, creatureNum);
            while (r2===r) r2 = game.rnd.integerInRange(1, creatureNum);
            creature2 = this.createPet(r2);
            creatureGroup.add(creature2);
            var r3 = game.rnd.integerInRange(1, creatureNum);
            while (r3===r || r3===r2) r3 = game.rnd.integerInRange(1, creatureNum);
            creature3 = this.createPet(r3);
            creatureGroup.add(creature3);

            rose_body = game.add.sprite(game.width-300, game.height-407, 'rose_body');
            rose_body.data = {speech:"", speechSpeed:50, speechTime:0};
            rose_body.animations.add('happy', [0]); rose_body.animations.add('happy_talk', [1,2,1,2,1,0]);
            rose_body.animations.add('tease', [3]); rose_body.animations.add('back', [4]);
            rose_body.animations.add('normal', [5]); rose_body.animations.add('normal_talk', [6,7,6,7,6,5]);
            rose_body.animations.add('embarrassed', [8]); rose_body.animations.add('embarrassed_talk', [9,10,9,10,9,8]);
            rose_body.animations.add('joyful', [11]); rose_body.animations.add('joyful_talk', [12,13,12,13,12,11]);
            rose_body.animations.add('down', [14]); rose_body.animations.add('glare', [15]);
            rose_body.animations.add('serious', [16]); rose_body.animations.add('serious_talk', [17,18,17,18,17,16]);
            rose_body.animations.add('sad', [19]); rose_body.animations.add('sad_talk', [20,21,20,21,20,19]);
            rose_body.animations.add('up', [22]); rose_body.animations.add('pout', [23]);
            rose_body.animations.add('side', [24]); rose_body.animations.add('side_talk', [25,26,25,26,25,24]);
            rose_body.animations.add('laugh', [27]); rose_body.animations.add('laugh_talk', [28,29,28,29,28,27]);
            rose_body.animations.add('pout_talk', [30,31,30,31,30,23]);

            rose_eyes = game.add.sprite(game.width, game.height, 'rose_eyes');
            rose_eyes.data = {blinkTime:this.time.time+game.rnd.integerInRange(5, 10)*1000};
            rose_eyes.animations.add('happy_blink', [0,1,2,1,0]); // x:102, y:72
            rose_eyes.animations.add('tease_blink', [3,4,5,4,3]); // x:142, y:80
            rose_eyes.animations.add('normal_blink', [6,7,8,7,6]); // x:118, y:71
            rose_eyes.animations.add('embarrassed_blink', [9,10,11,10,9]); // x:197, y:136
            rose_eyes.animations.add('down_blink', [12,13,14,13,12]); // x:102, y:80
            rose_eyes.animations.add('serious_blink', [15,16,17,16,15]); // x:105, y:152
            rose_eyes.animations.add('sad_blink', [18,19,20,19,18]); // x:94, y:80
            rose_eyes.animations.add('up_blink', [21,22,23,22,21]); // x:107, y:64
            rose_eyes.animations.add('side_blink', [24,25,26,25,24]); // x:105, y:80
            rose_eyes.animations.add('pout_blink', [27,28,29,28,27]); // x:103, y:112

            speechBubble = game.add.sprite(game.width-297, game.height-520, 'speechBubble');
            textRose = game.add.text(speechBubble.x+10, speechBubble.y+10, "",
                    {font:"20px Yu Gothic UI Semibold", fill:"#000000", align:"left" });
            goldText = game.add.text(15, 15, "Gold: "+goldAmount,
                    {font:"20px Yu Gothic UI Semibold", fill:"#ffffff", align:"left" });
            if (shared.file1 && shared.visits1===0 || !shared.file1 && shared.visits2===0) {
                this.setRoseAction("back", "");
                if (shared.file1) shared.visits1++;
                else shared.visits2++;
            } else if (shared.file1 && shared.visits1===1 || !shared.file1 && shared.visits2===1) {
                if (shared.file1) {shared.visits1++; this.setRoseAction("serious", shared.name1+"!\nI have something important\nfor you!");}
                else {shared.visits2++; this.setRoseAction("serious", shared.name2+"!\nI have something important\nfor you!");}
            }
            else this.setRoseAction("happy", "Welcome back! What can I do for you?");
            this.stage.disableVisibilityChange = true;
            game.input.onDown.add(this.selectPet, this);
            cursors = game.input.keyboard.createCursorKeys();

        },
        createPet: function (num) {
            var type; var real; var price;
            switch (num) {
                case 1: type = 'royal_gryphon'; real="Royal Gryphon"; price=650; break;
                case 2: type = 'bronze_gryphon'; real="Bronze Gryphon"; price=700; break;
                case 3: type = 'ebon_gryphon'; real="Ebon Gryphon"; price=750; break;
                case 4: type = 'mystic_gryphon'; real="Mystic Gryphon"; price=1200; break;
                case 5: type = 'pheonix'; real="Pheonix"; price=2000;
            }
            var y = game.rnd.integerInRange(0, 1);
            if (y===0) y = game.rnd.integerInRange(330, 430); // 50% chance of spawning on the ground
            else y = game.rnd.integerInRange(75, 225);
            var pet = game.add.sprite(game.rnd.integerInRange(75, 430), y, type);
            var t = this.time.time+game.rnd.integerInRange(2500, 5000);
            pet.data = {species:type, moveTime:t, xDist:0, yDist:0, zDist:0, land:null, liftOff:null, realType:real, cost:price};
            game.physics.arcade.enable(pet);
            pet.body.allowRotation = true;
            if (type==="pheonix") {
                pet.anchor.setTo(.35,.6);
                pet.animations.add('fly', [0,0,1,1,2,2,3,3,4,4,5,5], 10, true);
                pet.animations.add('stand', [14,15,16,17,16,15], 10, true);
                pet.data.liftOff = pet.animations.add('liftOff', [18,19,8], 10, true);
                pet.data.land = pet.animations.add('land', [8,19,18], 10, true);
            } else if (type.includes("gryphon")) {
                pet.anchor.setTo(.5,.6);
                pet.animations.add('fly', [0,1,2,3,4,4,3,2,1,0], 10, true);
                pet.animations.add('stand', [14,15,16,15], 10, true);
                pet.data.liftOff = pet.animations.add('liftOff', [17,18,19], 10, true);
                pet.data.land = pet.animations.add('land', [19,18,17], 10, true);
            }
            if (y > 300) {
                pet.play('stand', 7, true, true);
                pet.scale.set((pet.y-250)/100);
                pet.data.landed = true;
            } else {
                pet.play('fly', 14, true, true);
                pet.scale.set(game.rnd.integerInRange(80, 180)/100);
            }
            pet.data.land.onComplete.add(this.landed, this);
            pet.data.liftOff.onComplete.add(this.liftedOff, this);
            var dir = game.rnd.integerInRange(0, 2);
            if (dir===1) pet.scale.x *= -1;
            return pet;
        },
        landed: function (creature, animation) { creature.play('stand', 7, true, true); },
        liftedOff: function (creature, animation) { creature.play('fly', 14, true, true); },
        selectPet: function () {
            if (!choosingAllowed) {
                this.advanceRose();
                return;
            } else if (game.input.mousePointer.y > 540) {
                if (creature1.tint!==0xffffff) selectedCreature = creature1;
                if (creature2.tint!==0xffffff) selectedCreature = creature2;
                if (creature3.tint!==0xffffff) selectedCreature = creature3;
                return;
            }
            var distX = game.input.mousePointer.x - creature1.centerX;
            var distY = game.input.mousePointer.y - creature1.centerY;
            var dist1 = Math.sqrt(distX*distX + distY*distY);
            distX = game.input.mousePointer.x - creature2.centerX;
            distY = game.input.mousePointer.y - creature2.centerY;
            var dist2 = Math.sqrt(distX*distX + distY*distY);
            distX = game.input.mousePointer.x - creature3.centerX;
            distY = game.input.mousePointer.y - creature3.centerY;
            var dist3 = Math.sqrt(distX*distX + distY*distY);
            this.clearTints();
            if (dist1 > 100 && dist2 > 100 && dist3 > 100) selectedCreature = null;
            else if (dist1 <= dist2 && dist1 <= dist3) {selectedCreature = creature1; creature1.tint = 0xff0000;}
            else if (dist2 <= dist1 && dist2 <= dist3) {selectedCreature = creature2; creature2.tint = 0xff0000;}
            else {selectedCreature = creature3; creature3.tint = 0xff0000;}


        },
        clearTints: function () {creature1.tint = 0xffffff; creature2.tint = 0xffffff; creature3.tint = 0xffffff;},
        update: function () {

            creatureGroup.forEachExists(this.moveCreature, this);
            this.updateGroupOrder();
            this.updateRose();
        },
        moveCreature: function (creature) {
            var dir = 1;
            if (this.time.time > creature.data.moveTime &&
                  creature.data.xDist===0 && creature.data.yDist===0 && creature.data.zDist===0) { // Decide on a new movement.
                creature.data.moveTime = this.time.time+game.rnd.integerInRange(2000, 5000);
                dir = game.rnd.integerInRange(1, 8);
                if (dir>3 && creature.animations.currentAnim.name==="fly") {
                    creature.data.xDist = game.rnd.integerInRange(-100, 100);
                    creature.data.yDist = game.rnd.integerInRange(-75, 75);
                    creature.data.zDist = game.rnd.integerInRange(-50, 50);
                } else if (dir===3) {
                    if (creature.animations.currentAnim.name==="fly") creature.data.yDist = game.height; // Land
                    else {
                        creature.data.yDist = game.rnd.integerInRange(-150, -75);
                        creature.data.liftOff.play(10,false);
                    }
                }
            } else {
                if (creature.scale.x < 0) dir = -1;

                if (creature.data.xDist < 0) {
                    if (dir > 0) creature.scale.x *= -1;
                    creature.x--;  creature.data.xDist++;
                } else if (creature.data.xDist > 0) {
                    if (dir < 0) creature.scale.x *= -1;
                    creature.x++;  creature.data.xDist--;
                }
                if (creature.data.yDist < 0) { creature.y--; creature.data.yDist++; }
                else if (creature.data.yDist > 0) { creature.y++; creature.data.yDist--; }
                if (creature.data.zDist < 0) { creature.scale.y*=.99;  creature.scale.x*=.99;  creature.data.zDist++; }
                else if (creature.data.zDist > 0) { creature.scale.y*=1.01;  creature.scale.x*=1.01; creature.data.zDist--; }

                if (creature.scale.y < .8) { creature.scale.y = .8;  creature.scale.x = .8*dir;  creature.data.zDist = 0; }
                else if (creature.scale.y > 1.8) { creature.scale.y = 1.8;  creature.scale.x = 1.8*dir;  creature.data.zDist = 0; }
                if (creature.x < 75) { creature.x = 75; creature.data.xDist = 0; }
                else if (creature.x > 430) { creature.x = 430; creature.data.xDist = 0; }
                if (creature.y < 75) { creature.y = 75; creature.data.yDist = 0; }
                else if (creature.y > creature.scale.y*100+250) {
                    creature.y = creature.scale.y*100+250; creature.data.yDist = 0;
                    creature.data.land.play(10,false);
                    creature.data.moveTime = this.time.time+game.rnd.integerInRange(2500, 5000);
                }
            }
        },
        updateGroupOrder: function () {
            if (creature1.z < 2 && creature1.scale.y > creature2.scale.y && creature1.scale.y > creature3.scale.y)
                creatureGroup.moveUp(creature1);
            else if (creature1.z > 0 && creature1.scale.y < creature2.scale.y && creature1.scale.y < creature3.scale.y)
                creatureGroup.moveDown(creature1);
            if (creature2.z < 2 && creature2.scale.y > creature1.scale.y && creature2.scale.y > creature3.scale.y)
                creatureGroup.moveUp(creature2);
            else if (creature2.z > 0 && creature2.scale.y < creature1.scale.y && creature2.scale.y < creature3.scale.y)
                creatureGroup.moveDown(creature2);
            if (creature3.z < 2 && creature3.scale.y > creature1.scale.y && creature3.scale.y > creature2.scale.y)
                creatureGroup.moveUp(creature3);
            else if (creature3.z > 0 && creature3.scale.y < creature1.scale.y && creature3.scale.y < creature2.scale.y)
                creatureGroup.moveDown(creature3);
        },
        updateRose: function () {
            if (!rose_body.animations.currentAnim.isPlaying && rose_body.data.speech!=="" &&
                    rose_body.animations.currentAnim.name.includes("talk"))
                rose_body.animations.currentAnim.play();
            if (this.time.time > rose_eyes.data.blinkTime) {
                rose_eyes.data.blinkTime = this.time.time+game.rnd.integerInRange(5, 10)*1000;
                rose_eyes.animations.currentAnim.play();
            }
            if (rose_body.data.speech!=="" && this.time.time > rose_body.data.speechTime) {
                rose_body.data.speechTime = this.time.time+rose_body.data.speechSpeed;
                textRose.text += rose_body.data.speech.substring(0,1);
                rose_body.data.speech = rose_body.data.speech.substring(1);
            }
        },
        setRoseAction: function (emotion, speech) {
            if (emotion==="tease" || emotion==="back" || emotion==="down" || emotion==="up" || emotion==="glare")
                speech = "";
            rose_body.data.speech = speech;
            textRose.text = "";
            if (speech==="") {
                rose_body.play(emotion, 7);  speechBubble.alpha = 0;
            } else {
                rose_body.play(emotion+"_talk", 7);  speechBubble.alpha = .9;
            }
            if (emotion==="laugh" || emotion==="joyful" || emotion==="glare" || emotion==="back")
                rose_eyes.reset(game.width, game.height);
            else
                rose_eyes.play(emotion+"_blink", 7);

            if (emotion==="happy") rose_eyes.reset(rose_body.x+102, rose_body.y+72);
            else if (emotion==="tease") rose_eyes.reset(rose_body.x+142, rose_body.y+80);
            else if (emotion==="normal") rose_eyes.reset(rose_body.x+118, rose_body.y+71);
            else if (emotion==="embarrassed") rose_eyes.reset(rose_body.x+197, rose_body.y+136);
            else if (emotion==="down") rose_eyes.reset(rose_body.x+102, rose_body.y+80);
            else if (emotion==="serious") rose_eyes.reset(rose_body.x+105, rose_body.y+152);
            else if (emotion==="sad") rose_eyes.reset(rose_body.x+94, rose_body.y+80);
            else if (emotion==="up") rose_eyes.reset(rose_body.x+107, rose_body.y+64);
            else if (emotion==="side") rose_eyes.reset(rose_body.x+105, rose_body.y+80);
            else if (emotion==="pout") rose_eyes.reset(rose_body.x+103, rose_body.y+112);
            rose_eyes.animations.stop();

            if (emotion==="joyful") speechBubble.y = game.height-520;
            else if (emotion==="laugh") speechBubble.y = game.height-450;
            else speechBubble.y = rose_eyes.y-180;
            textRose.y = speechBubble.y+10;
        },
        advanceRose: function () {
            var anim = rose_body.animations.currentAnim.name;
            if (anim==="back") this.setRoseAction("up", "");
            else if (anim==="up") this.setRoseAction("joyful", "Oh! Hi there! I'm Rose, and I'm\n"+
                          "in charge of this area. Various\ncreatures hang around here.");
            else if (textRose.text.includes("I'm Rose")) this.setRoseAction("happy", "We take care of them, and in\n"+
                          "exchange they listen to us.");
            else if (textRose.text.includes("We take care of them")) {
                this.setRoseAction("happy", "So what's your name?");
                this.createInputBox();
                submitButton = game.add.button(game.width/3, game.height-50, 'submitButton', this.checkName, null, 'over', 'out', 'down');
                submitButton.scale.set(.5);
            } else if (anim==="glare") this.setRoseAction("pout", "What are you trying to pull?\nYou don't have enough money.");
            else if (anim==="pout") {
                mainGame.setRoseAction("normal", "Would you like to choose\na different one?");
                mainGame.createOptions(2,"Yeah.", "I don't think so.");
            }
            else if (textRose.text.includes("Alright! Thanks!")) {
                mainGame.setRoseAction("happy", "Would you like to name it?");
                mainGame.createOptions(2,"Of course!", "Nah.");
            }
        },
        createOptions: function (num, txt1, txt2, txt3, txt4) {
            option1Button = game.add.button(game.width/3, game.height-(50+50*num), 'selectButton', this.option1, null, 'over', 'out', 'down');
            option2Button = game.add.button(game.width/3, game.height-(50+50*(num-1)), 'selectButton', this.option2, null, 'over', 'out', 'down');
            option1Button.anchor.set(.5);  option2Button.anchor.set(.5);
            if (num>2) {
                option3Button = game.add.button(game.width/3, game.height-(50+50*(num-2)), 'selectButton', this.option3, null, 'over', 'out', 'down');
                option3Button.anchor.set(.5);
            } if (num>3) {
                option4Button = game.add.button(game.width/3, game.height-(50+50*(num-3)), 'selectButton', this.option4, null, 'over', 'out', 'down');
                option4Button.anchor.set(.5);
            }
            option1Text = game.add.text(option1Button.centerX, option1Button.centerY, txt1, {font:"20px Yu Gothic UI Semibold", fill:"#000000"});
            option1Text.anchor.set(.5);
            option2Text = game.add.text(option2Button.centerX, option2Button.centerY, txt2, {font:"20px Yu Gothic UI Semibold", fill:"#000000"});
            option2Text.anchor.set(.5);
            if (num > 2) {
                option3Text = game.add.text(option3Button.centerX, option3Button.centerY, txt3,
                      {font:"20px Yu Gothic UI Semibold", fill:"#000000"});
                option3Text.anchor.set(.5);
            } if (num > 3) {
                option4Text = game.add.text(option4Button.centerX, option4Button.centerY, txt4,
                      {font:"20px Yu Gothic UI Semibold", fill:"#000000"});
                option4Text.anchor.set(.5);
            }
            var maxWidth = Math.max(option1Text.width, option2Text.width);
            if (option3Text) maxWidth = Math.max(maxWidth, option3Text.width);
            if (option4Text) maxWidth = Math.max(maxWidth, option4Text.width);
            option1Button.width = maxWidth+15;
            option1Button.height = 30;
            option2Button.width = maxWidth+15;
            option2Button.height = 30;
            if (num>2) {
                option3Button.width = maxWidth+15;
                option3Button.height = 30;
            } if (num>3) {
                option4Button.width = maxWidth+15;
                option4Button.height = 30;
            }
        },
        checkName: function () {
            enteredName = inputBox.value;
            var n = inputBox.value.replace(/ /g,'');
            if (n!=="") {
                inputBox.endFocus();
                inputBox.destroy();
                submitButton.destroy();
                mainGame.setRoseAction("normal", enteredName+"...\nIs that right?");
                mainGame.createOptions(2,"Yep!", "Not quite...");
            }
        },
        checkCreatureSelect: function () {
            if (selectedCreature) {
                mainGame.setRoseAction("side", "That's a "+selectedCreature.data.realType+".\nIt costs "+
                                selectedCreature.data.cost+" gold.\nDo you want to buy it?");
                submitButton.destroy();
                choosingAllowed = false;
                mainGame.createOptions(2,"Yes.", "Maybe not...");
            }
        },
        option1: function () { mainGame.destroyOptions();
            if (textRose.text.includes("...\nIs that right?") && option1Text.text==="Yep!") {
                if (selectedCreature) {
                    if (shared.file1) shared.pets1.push({type:selectedCreature.data.species, name:inputBox.value, maxSpeed:500, stamina:500, strength:500});
                    else shared.pets2.push({type:selectedCreature.data.species, name:inputBox.value, maxSpeed:500, stamina:500, strength:500});
                    selectedCreature = null;
                    mainGame.setRoseAction("joyful", "Perfect. Need anything else?");
                    mainGame.createOptions(3,"Buy a Creature", "Change Controls", "Leave");
                } else {
                    if (shared.file1) shared.name1 = inputBox.value;
                    else shared.name2 = inputBox.value;
                    mainGame.setRoseAction("joyful", "Great! How can I help you,\n"+enteredName+"?");
                    mainGame.createOptions(3,"Buy a Creature", "Change Controls", "Leave");
                }
            } else if (option1Text.text==="Buy a Creature") {
                choosingAllowed = true;
                mainGame.setRoseAction("happy", "Alright. Show me which one\nyou want.");
                submitButton = game.add.button(game.width/3, game.height-40, 'submitButton', mainGame.checkCreatureSelect, null, 'over', 'out', 'down');
                submitButton.scale.set(.5);
            } else if (option1Text.text==="Yes.") {
                if (goldAmount < selectedCreature.data.cost) {
                    mainGame.setRoseAction("glare", "");
                    selectedCreature.tint = 0xffffff;
                    selectedCreature = null;
                } else {
                    mainGame.setRoseAction("joyful", "Alright! Thanks!");
                    goldAmount -= selectedCreature.data.cost;
                    goldText.text = "Gold: "+goldAmount;
                    enteredName = selectedCreature.data.realType;
                    selectedCreature.tint = 0xffffff;
                }
            } else if (option1Text.text==="Yeah.") {
                choosingAllowed = true;
                mainGame.setRoseAction("normal", "Which one?");
                submitButton = game.add.button(game.width/3, game.height-40, 'submitButton', mainGame.checkCreatureSelect, null, 'over', 'out', 'down');
                submitButton.scale.set(.5);
            } else if (option1Text.text==="Of course!"){
                mainGame.setRoseAction("happy", "");
                mainGame.createInputBox();
                submitButton = game.add.button(game.width/3, game.height-40, 'submitButton', mainGame.checkName, null, 'over', 'out', 'down');
                submitButton.scale.set(.5);
            }
        },
        option2: function () { mainGame.destroyOptions();
            if (textRose.text.includes("... Is that right?") && option2Text.text==="Not quite...") {
                mainGame.createInputBox();
                mainGame.setRoseAction("normal", "");
                submitButton = game.add.button(game.width/3, game.height-40, 'submitButton', mainGame.checkName, null, 'over', 'out', 'down');
                submitButton.scale.set(.5);
            } else if (option2Text.text==="Change Controls") {

            } else if (option2Text.text==="Maybe not...") {
                mainGame.setRoseAction("normal", "Would you like to choose\na different one?");
                mainGame.createOptions(2,"Yeah.", "I don't think so.");
            } else if (option2Text.text==="I don't think so.") {
                mainGame.setRoseAction("normal", "Is there anything else I can\nhelp you with?");
                mainGame.createOptions(3,"Buy a Creature", "Change Controls", "Leave");
                selectedCreature.tint = 0xffffff;
                selectedCreature = null;
            } else if (option2Text.text==="Nah.") {
                if (shared.file1)
                    shared.pets1.push({type:selectedCreature.data.species, name:enteredName, maxSpeed:500, stamina:500, strength:500});
                else
                    shared.pets2.push({type:selectedCreature.data.species, name:enteredName, maxSpeed:500, stamina:500, strength:500});

                //console.log(selectedCreature.data.type);
                selectedCreature = null;
                mainGame.setRoseAction("normal", "Is there anything else I can\nhelp you with?");
                mainGame.createOptions(3,"Buy a Creature", "Change Controls", "Leave");
            }
        },
        option3: function () { mainGame.destroyOptions();
            if (option3Text.text==="Leave") {
                mainGame.setRoseAction("happy", "Come back soon!");
                game.time.events.add(Phaser.Timer.SECOND*3, quitGame, this);
            }
        },
        option4: function () { mainGame.destroyOptions();

        },
        destroyOptions: function () {
            if (option1Text) option1Text.destroy();
            if (option1Button) option1Button.destroy();
            if (option2Text) option2Text.destroy();
            if (option2Button) option2Button.destroy();
            if (option3Text) option3Text.destroy();
            if (option3Button) option3Button.destroy();
            if (option4Text) option4Text.destroy();
            if (option4Button) option4Button.destroy();
        },
        fadeObj: function (obj) { if (obj.alpha >= .3)game.add.tween(obj).to({alpha:0}, 500, "Linear", true); },
        createInputBox: function () {
            inputBox = game.add.inputField(game.width/3-25, game.height-100, {font:"25px Yu Gothic UI Semibold", fill:"#000000", width:135, height:30, padding:5});
            inputBox.startFocus();
            inputBox.focusOutOnEnter = false;
        },
    }; return mainGame;
};
