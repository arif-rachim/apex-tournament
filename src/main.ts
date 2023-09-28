import './style.css'
import Phaser from "phaser";
import createKnight from "./createKnight";
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
        createKnight.staticPreLoad(this)
    }

    create() {
        const knight = createKnight(this, 250, 250);
        const platform = createPlatform(this,520,500,260,10,0x4BCB7C);
        platform.addCollider(knight.sprite);
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