import './style.css'
import * as Phaser from "phaser";
import {createKnight, staticPreLoad} from "./knight/createKnight";

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
//const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;


export class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'scene-1'});

    }

    preload() {
        staticPreLoad(this);
        this.load.tilemapTiledJSON('level-1',import.meta.env.BASE_URL+'/tiles/tile-map/level-1.json');
        this.load.image('dirt-grass-sheet',import.meta.env.BASE_URL+'/tiles/grass-dirt/Tileset5.png');
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
            lightAttack: Phaser.Input.Keyboard.KeyCodes.O,
            heavyAttack: Phaser.Input.Keyboard.KeyCodes.P
        },{
            right:document.getElementById('right')! as HTMLButtonElement,
            left:document.getElementById('left')! as HTMLButtonElement,
            down:document.getElementById('down')! as HTMLButtonElement,
            up:document.getElementById('up')! as HTMLButtonElement,
            heavyAttack:document.getElementById('heavyAttack')! as HTMLButtonElement,
            lightAttack:document.getElementById('lightAttack')! as HTMLButtonElement
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
