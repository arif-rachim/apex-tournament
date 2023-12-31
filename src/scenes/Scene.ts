import '../style.css'
import * as Phaser from "phaser";
import {Knight, staticPreLoad} from "../knight/Knight";
import {DataConnection} from "peerjs";
import {Message} from "../communication-message/Message";
import {createLogger} from "../utils/createLogger";

const log = createLogger('Scene.ts');

export class Scene extends Phaser.Scene {
    constructor() {
        super({key: 'scene-1'});
        log('create game scene')
    }

    public static buttons: {
        right: HTMLButtonElement,
        left: HTMLButtonElement,
        down: HTMLButtonElement,
        up: HTMLButtonElement,
        heavyAttack: HTMLButtonElement,
        lightAttack: HTMLButtonElement
    }
    public static connection:DataConnection;
    public static isHost:boolean;
    public static names:{
        playerName:string,
        opponentName:string
    } = {playerName:'',opponentName:''}

    preload() {
        staticPreLoad(this);
        this.load.tilemapTiledJSON('level-1', import.meta.env.BASE_URL + '/tiles/tile-map/level-1.json');
        this.load.image('bg1-sheet', import.meta.env.BASE_URL + '/tiles/landscape/BG1.png');
        this.load.image('bg2-sheet', import.meta.env.BASE_URL + '/tiles/landscape/BG2.png');
        this.load.image('bg3-sheet', import.meta.env.BASE_URL + '/tiles/landscape/BG3.png');
        this.load.image('tiles-sheet', import.meta.env.BASE_URL + '/tiles/landscape/Tileset.png');
    }

    create() {
        const addMap = () => {
            const map = this.make.tilemap({key: 'level-1'})
            const bg1 = map.addTilesetImage('Background-One', 'bg1-sheet')!;
            const bg2 = map.addTilesetImage('Background-Two', 'bg2-sheet')!;
            const bg3 = map.addTilesetImage('Background-Three', 'bg3-sheet')!;
            const tileset = map.addTilesetImage('Tileset', 'tiles-sheet')!;

            map.createLayer('Background',bg1);
            map.createLayer('BackgroundTwo',bg2);
            map.createLayer('BackgroundThree',bg3);
            const groundLayer = map.createLayer('Ground', tileset)!;
            map.createLayer('Foreground', tileset);
            groundLayer.setCollision(Array.from({length: 400}).map((_, index) => index + 1));
            return {groundLayer, map};
        }
        const {groundLayer, map} = addMap();
        const isHost = Scene.isHost;
        const location = {
            playerOne: {
                x: 150,
                y: 250,
                isFlip: false
            },
            playerTwo: {
                x: 850,
                y: 250,
                isFlip: true
            }
        }
        function messageToOpponent(event:Message){
            Scene.connection.send(event);
        }
        const knight = Knight(Scene.names.playerName,true, this, isHost, isHost ? location.playerOne : location.playerTwo, messageToOpponent,{
            right: Phaser.Input.Keyboard.KeyCodes.D,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            lightAttack: Phaser.Input.Keyboard.KeyCodes.O,
            heavyAttack: Phaser.Input.Keyboard.KeyCodes.P
        }, Scene.buttons);

        //@ts-ignore
        const enemy = Knight(Scene.names.opponentName,false, this, !isHost, isHost ? location.playerTwo : location.playerOne,messageToOpponent);

        //@ts-ignore
        Scene.connection.on('data', (data: Message) => {
            if (data.type === 'right-is-down') {
                enemy.right.isDown = data.value!
            } else if (data.type === 'left-is-down') {
                enemy.left.isDown = data.value!
            } else if (data.type === 'up-is-down') {
                enemy.up.isDown = data.value!
            } else if (data.type === 'down-is-down') {
                enemy.down.isDown = data.value!
            } else if (data.type === 'did-press-light-attack') {
                enemy.state.didPressLightAttack = data.value!
            }else if(data.type === 'did-press-heavy-attack'){
                enemy.state.didPressHeavyAttack = data.value!
            }else if(data.type === 'did-press-jump'){
                enemy.state.didPressJump = data.value!
            }else if (data.type === 'character-position') {
                enemy.sprite.setX(data.x!);
                enemy.sprite.setY(data.y!);
            } else if (data.type === 'attacked') {
                knight.state.score.guest = data.score!.guest;
                knight.state.score.host = data.score!.host;
                enemy.state.score.guest = data.score!.guest;
                enemy.state.score.host = data.score!.host;
                window.dispatchEvent(new CustomEvent('score-update', {detail: data.score}))
            }
        });

        this.physics.add.collider(knight.sprite, groundLayer);
        this.physics.add.collider(enemy.sprite, groundLayer);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBoundsCollision(true, true, true, true);
        knight.addEnemies([enemy]);
        enemy.addEnemies([knight]);

    }

    update() {

    }
}
