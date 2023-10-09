import '../style.css'
import * as Phaser from "phaser";
import {createKnight, staticPreLoad} from "../knight/createKnight";
import {DataConnection} from "peerjs";
import {Message} from "../communication-message/Message";
import {createLogger} from "../utils/createLogger";

const log = createLogger('GameScene.ts');
export class GameScene extends Phaser.Scene {
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
        const isHost = GameScene.isHost;
        const location = {
            playerOne:{
                x:150,
                y:250,
                isFlip : false
            },
            playerTwo:{
                x:850,
                y:250,
                isFlip:true
            }
        }
        const knight = createKnight(GameScene.names.playerName,this, isHost? location.playerOne:location.playerTwo,{
            right: Phaser.Input.Keyboard.KeyCodes.D,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            lightAttack: Phaser.Input.Keyboard.KeyCodes.O,
            heavyAttack: Phaser.Input.Keyboard.KeyCodes.P
        },GameScene.buttons,(event:Message) => {
            GameScene.connection.send(event);
        });

        const enemy = createKnight(GameScene.names.opponentName, this, isHost? location.playerTwo:location.playerOne,{
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            lightAttack: Phaser.Input.Keyboard.KeyCodes.PERIOD,
            heavyAttack: Phaser.Input.Keyboard.KeyCodes.COMMA
        });
        //@ts-ignore
        GameScene.connection.on('data',(data:Message) => {
            if(data.type === 'right-is-down'){
                enemy.right.isDown = data.value!
            }else if(data.type === 'left-is-down'){
                enemy.left.isDown = data.value!
            }else if(data.type === 'up-is-down'){
                enemy.up.isDown = data.value!
            }else if(data.type === 'down-is-down'){
                enemy.down.isDown = data.value!
            }else if(data.type === 'did-press-light-attack'){
                enemy.state.didPressLightAttack = data.value!
            }else if(data.type === 'did-press-heavy-attack'){
                enemy.state.didPressHeavyAttack = data.value!
            }else if(data.type === 'did-press-jump'){
                enemy.state.didPressJump = data.value!
            }else if(data.type === 'character-position'){
                enemy.sprite.setX(data.x!);
                enemy.sprite.setY(data.y!);
            }

        })

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
