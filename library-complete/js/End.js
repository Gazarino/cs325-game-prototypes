"use strict";

GameStates.makeEnd = function( game, shared ) {

    var music;
    var spellcaster, bg1, bg2, bgTime;
    var textFinal, count;

    function quitGame() {
        music.stop();
        game.scale.setGameSize(320, 320);
        game.state.start('MainMenu');
    }

    var mainGame = {
        create: function () {
            music = game.add.audio('endMusic');
            music.loopFull(1);

            bg1 = game.add.sprite(0, 0, 'bg');   bg1.scale.set(2);
            bg2 = game.add.sprite(bg1.width, 0, 'bg');   bg2.scale.set(2);
            bgTime = this.time.time;

            spellcaster = game.add.sprite(game.width/2, game.height*.67, 'girl'+shared.char);
            spellcaster.scale.set(.75);   spellcaster.anchor.set(.5);
            spellcaster.animations.add('side', [6,7,8,7]);
            spellcaster.play('side',7,true);

            textFinal = game.add.text(game.width/2, game.height/4, "", {font:"15px Sitka Small", fill:"#ffffff", align:"center" });
            textFinal.anchor.set(.5);   textFinal.alpha=0;
            count = 0;
            game.time.events.add(Phaser.Timer.SECOND*1.5, this.cutscene, this);
            game.camera.onFadeComplete.add(quitGame,this);
        },
        cutscene: function () {
            if (count<8) game.add.tween(textFinal).to({alpha:1}, 1000, "Linear", true);
            var t=7.15;
            switch (count) {
                case 0: textFinal.text = "As the young spellcaster left the\nabandoned library, she thought\nabout what she learned from\nthe Japanese literature there."; t+=.5; break;
                case 1: textFinal.text = "Several of the books seemed\nto propose an answer to\nthe existential question..."; break;
                case 2: textFinal.text = "...whether that be\nto take responsibility\nand support your family\nor to screw the system."; break;
                case 3: textFinal.text = "But through the experience\nshe had just gone through,\nshe came to her own answer."; break;
                case 4: textFinal.text = "She concluded that her reason\nfor being was to learn magic\nand conquer evil."; break;
                case 5: textFinal.text = "She enjoyed nothing more than\nthe satisfaction she felt by\nmaking the world a safer place."; break;
                case 6: textFinal.text = "The young spellcaster was happy\nshe went on this adventure for the\nnew spells and insight it gave her."; break;
                case 7: textFinal.text = "Now, she continued forward,\nspell book in hand, ready to\nmake a difference in the world..."; t+=2;
                        spellcaster.animations.currentAnim.speed = 9;   music.fadeOut(12000); break;
                case 8: game.camera.fade('#000000', 3000);
            } count++;
            game.time.events.add(Phaser.Timer.SECOND*(t-1), this.fadeText, this);
            game.time.events.add(Phaser.Timer.SECOND*t, this.cutscene, this);
        },
        update: function () {
            if (this.time.time>bgTime) {
                if (spellcaster.animations.currentAnim.speed===9) spellcaster.x++;
                bg1.x--; bg2.x--; bgTime=this.time.time+25;
            }
            if (bg1.x<=-bg1.width) bg1.x+=bg1.width*2;
            if (bg2.x<=-bg2.width) bg2.x+=bg2.width*2;
        },
        fadeText: function () {game.add.tween(textFinal).to({alpha:0}, 1000, "Linear", true);},

    }; return mainGame;
};
