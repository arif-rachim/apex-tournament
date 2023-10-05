import './style.css'
import Phaser from "phaser";
import {createKnight, staticPreLoad} from "./knight/createKnight";
import {createPlatform} from "./createPlatform";
import STATIC_BODY = Phaser.Physics.Arcade.STATIC_BODY;


const sizes = {
    width: 960,
    height: 640
}

// window.addEventListener('orientationchange',() => {
//     switch (screen.orientation.type) {
//         case "landscape-primary":
//             alert('landscape-primary')
//             break;
//         case "landscape-secondary":
//             alert('landscape-secondary')
//             break;
//         case "portrait-secondary":
//             alert('portrait-secondaty')
//             break;
//         case "portrait-primary":
//             alert('portrait-primary')
//             break;
//         default:
//             console.log("The orientation API isn't supported in this browser :(");
//     }
// })
const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
const SPEED_DOWN = 650;

class GameScene extends Phaser.Scene {
    constructor(props) {
        super({key: 'scene-1'});

    }

    preload() {
        staticPreLoad(this);
        this.load.tilemapTiledJSON('level-1','tiles/tile-map/level-1.json');
        this.load.image('dirt-grass-sheet','tiles/grass-dirt/Tileset5.png');
    }

    create() {
        const addMap = () => {
            const map = this.make.tilemap({key:'level-1'})
            const groundTiles = map.addTilesetImage('dirt-grass','dirt-grass-sheet')!;
            const groundLayer = map.createLayer('Ground',groundTiles)!;
            groundLayer.setCollision([1,23,2,24,3,25]);
            return {groundLayer,map};
        }
        const {groundLayer,map} = addMap();

        const knight = createKnight(this, 250, 250, {
            right: Phaser.Input.Keyboard.KeyCodes.D,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            lightAttack: Phaser.Input.Keyboard.KeyCodes.R,
            heavyAttack: Phaser.Input.Keyboard.KeyCodes.T
        });

        const enemy = createKnight(this, 250, 250, {
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            lightAttack: Phaser.Input.Keyboard.KeyCodes.PERIOD,
            heavyAttack: Phaser.Input.Keyboard.KeyCodes.COMMA
        });

        this.physics.add.collider(knight.sprite,groundLayer);
        this.physics.add.collider(enemy.sprite,groundLayer);
        this.physics.world.setBounds(0,0,map.widthInPixels,map.heightInPixels);
        this.physics.world.setBoundsCollision(true,true,true,true);
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
            debug: false,
            debugShowStaticBody: false,
            debugShowBody: false
        }
    },
    scene: [GameScene]
})