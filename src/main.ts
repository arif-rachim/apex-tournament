import './style.css'
import Phaser from "phaser";
import {createKnight, staticPreLoad} from "./knight/createKnight";
import {createPlatform} from "./createPlatform";


const sizes = {
    width: 800,
    height: 600
}


const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
const SPEED_DOWN = 650;

class GameScene extends Phaser.Scene {
    constructor(props) {
        super({key: 'scene-1'});

    }

    preload() {
        staticPreLoad(this)
    }

    create() {
        const knight = createKnight(this, 250, 250, {
            right: Phaser.Input.Keyboard.KeyCodes.D,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            lightAttack: Phaser.Input.Keyboard.KeyCodes.SHIFT,
            heavyAttack: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        const enemy = createKnight(this, 250, 250, {
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            lightAttack: Phaser.Input.Keyboard.KeyCodes.O,
            heavyAttack: Phaser.Input.Keyboard.KeyCodes.P
        });

        const platform = createPlatform(this, 520, 500, 260, 10, 0x4BCB7C);
        platform.addCollider(knight.sprite);
        platform.addCollider(enemy.sprite);
        knight.addEnemies([enemy]);
        enemy.addEnemies([knight]);

    }

    update() {

    }
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#33A5E7',
    scale: {
        width : sizes.width,
        height : sizes.height,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: SPEED_DOWN},
            debug: true,
            debugShowStaticBody: true,
            debugShowBody: true
        }
    },
    scene: [GameScene]
})