import '../style.css'
import * as Phaser from "phaser";
import {createKnight, staticPreLoad} from "../knight/createKnight";

export class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'scene-1'});
    }

    public static buttons: {
        right: HTMLButtonElement,
        left: HTMLButtonElement,
        down: HTMLButtonElement,
        up: HTMLButtonElement,
        heavyAttack: HTMLButtonElement,
        lightAttack: HTMLButtonElement
    }

    preload() {
        staticPreLoad(this);
        this.load.tilemapTiledJSON('level-1', import.meta.env.BASE_URL + '/tiles/tile-map/level-1.json');
        this.load.image('dirt-grass-sheet', import.meta.env.BASE_URL + '/tiles/grass-dirt/Tileset5.png');
    }

    create() {
        const addMap = () => {
            const map = this.make.tilemap({key: 'level-1'})
            const groundTiles = map.addTilesetImage('dirt-grass', 'dirt-grass-sheet')!;
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
        },GameScene.buttons);

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
