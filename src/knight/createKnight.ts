// @ts-ignore-next-line
import {onPreUpdate} from "../utils/onPreUpdate";
import {getAnimationStateMachine} from "./getAnimationStateMachine";
import {getMovementStateMachine} from "./getMovementStateMachine";
import {getRunState} from "./getRunState";
import {movement} from "./movement";
import {KnightState} from "./knightState";
import {Message} from "../communication-message/Message";
import {createLogger} from "../utils/createLogger";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Sprite = Phaser.GameObjects.Sprite;


export type MovementKey = keyof typeof movement;
const log = createLogger('createKnight.ts');

function invoke(callback: () => void) {
    return function preventEvent(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        event.stopImmediatePropagation()
        callback()
    }
}
export function createKnight(name: string, scene: Phaser.Scene, x: number, y: number,
                             keys: { right: number, left: number, up: number, down: number, lightAttack: number, heavyAttack: number },
                             buttons?: { right: HTMLButtonElement, left: HTMLButtonElement, up: HTMLButtonElement, down: HTMLButtonElement, lightAttack: HTMLButtonElement, heavyAttack: HTMLButtonElement },
                             messageToOpponent?: (event: Message) => void
) {
    const {
        right: rightKey,
        heavyAttack: heavyAttackKey,
        lightAttack: lightAttackKey,
        up: upKey,
        left: leftKey,
        down: downKey
    } = keys;

    const right = scene.input.keyboard?.addKey(rightKey)!;
    const left = scene.input.keyboard?.addKey(leftKey)!;
    const up = scene.input.keyboard?.addKey(upKey)!;
    const down = scene.input.keyboard?.addKey(downKey)!;
    const heavyAttack = scene.input.keyboard?.addKey(heavyAttackKey)!;
    const lightAttack = scene.input.keyboard?.addKey(lightAttackKey)!;

    if(messageToOpponent){
        right.on('down',() => {
            messageToOpponent({type: 'right-is-down', value: true});
        })
        right.on('up',() => {
            messageToOpponent({type: 'right-is-down', value: false});
        })
        left.on('down',() => {
            messageToOpponent({type: 'left-is-down', value: true});
        })
        left.on('up',() => {
            messageToOpponent({type: 'left-is-down', value: false});
        })
        up.on('down',() => {
            messageToOpponent({type: 'did-press-jump', value: true})
            messageToOpponent({type: 'up-is-down', value: true});
        })
        up.on('up',() => {
            messageToOpponent({type: 'up-is-down', value: false});
        })
        down.on('down',() => {
            messageToOpponent({type: 'down-is-down', value: true});
        })
        down.on('up',() => {
            messageToOpponent({type: 'down-is-down', value: false});
        })
        heavyAttack.on('down',() => {
            messageToOpponent({type: 'did-press-heavy-attack', value: true})
        })
        lightAttack.on('down',() => {
            messageToOpponent({type: 'did-press-light-attack', value: true})
        })
    }

    if (buttons && messageToOpponent) {
        buttons.right.addEventListener('touchstart', invoke(() => {
            messageToOpponent({type: 'right-is-down', value: true});
            right.isDown = true
        }));
        buttons.right.addEventListener('touchend', invoke(() => {
            messageToOpponent({type: 'right-is-down', value: false});
            right.isDown = false
        }));
        buttons.left.addEventListener('touchstart', invoke(() => {
            messageToOpponent({type: 'left-is-down', value: true});
            left.isDown = true
        }));
        buttons.left.addEventListener('touchend', invoke(() => {
            messageToOpponent({type: 'left-is-down', value: false})
            left.isDown = false
        }));
        buttons.up.addEventListener('touchstart', invoke(() => {
            messageToOpponent({type: 'did-press-jump', value: true})
            state.didPressJump = true;
            messageToOpponent({type: 'up-is-down', value: true})
            up.isDown = true;
        }));
        buttons.up.addEventListener('touchend', invoke(() => {
            messageToOpponent({type: 'up-is-down', value: false})
            up.isDown = false
        }));
        buttons.down.addEventListener('touchstart', invoke(() => {
            messageToOpponent({type: 'down-is-down', value: true})
            down.isDown = true
        }))
        buttons.down.addEventListener('touchend', invoke(() => {
            messageToOpponent({type: 'down-is-down', value: false})
            down.isDown = false
        }))
        buttons.heavyAttack.addEventListener('touchstart', invoke(() => {
            messageToOpponent({type: 'did-press-heavy-attack', value: true})
            state.didPressHeavyAttack = true
        }))
        buttons.lightAttack.addEventListener('touchstart', invoke(() => {
            messageToOpponent({type: 'did-press-light-attack', value: true})
            state.didPressLightAttack = true
        }))

    }

    for (const movementKey of Object.keys(movement)) {
        let key = `knight-${movementKey}`;
        if (!scene.anims.exists(key)) {
            scene.anims.create({
                key: key,
                frames: scene.anims.generateFrameNumbers(`knight-${movementKey}`),
                frameRate: 10,
                repeat: -1
            });
        }
        key = `knight-${movementKey}-1`;
        if (!scene.anims.exists(key)) {
            scene.anims.create({
                key: `knight-${movementKey}-1`,
                frames: scene.anims.generateFrameNumbers(`knight-${movementKey}`),
                frameRate: 10,
                repeat: 0
            });
        }

    }

    const sprite: SpriteWithDynamicBody = scene.physics.add.sprite(x, y, 'knight-Idle');
    sprite.setCollideWorldBounds(true);
    sprite.setSize(10, 35);
    sprite.setOffset(53, 45);
    sprite.setMaxVelocity(250, 400);
    sprite.setDragX(700);
    const state: KnightState = {
        canDoubleJump: false,
        flipX: false,
        didPressJump: false,
        pressedDown: false,
        isJumping: false,
        didPressLightAttack: false,
        didPressHeavyAttack: false,
        toGetAttack: false,
        healthPoint: 1000,
        attackOnProgress: false
    }
    const movementStateMachine = getMovementStateMachine(sprite, state)
    const animationStateMachine = getAnimationStateMachine(name, play, playOnce, sprite, state, movementStateMachine)
    const runState = getRunState(sprite, right, state, left, down)

    animationStateMachine.addListener('beforeStateChange', (from, to) => {
        log(name, 'movement change ', from, to)
    })
    onPreUpdate(sprite, () => {
        state.didPressJump = !state.didPressJump ? Phaser.Input.Keyboard.JustDown(up) : state.didPressJump;
        state.didPressLightAttack = !state.didPressLightAttack ? Phaser.Input.Keyboard.JustDown(lightAttack) : state.didPressLightAttack;
        state.didPressHeavyAttack = !state.didPressHeavyAttack ? Phaser.Input.Keyboard.JustDown(heavyAttack) : state.didPressHeavyAttack;
        state.pressedDown = down.isDown;

        if (movementStateMachine.is('jumping') || movementStateMachine.is('flipping')) {
            if (!up.isDown && sprite.body.velocity.y < -150) {
                sprite.setVelocityY(-150);
            }
        }

        for (const t of runState.getTransitions()) {
            if (runState.isOn(t)) {
                runState.move(t);
                break;
            }
        }

        for (const t of movementStateMachine.getTransitions()) {
            if (movementStateMachine.isOn(t)) {
                movementStateMachine.move(t);
                break;
            }
        }
        for (const t of animationStateMachine.getTransitions()) {
            if (animationStateMachine.isOn(t)) {
                animationStateMachine.move(t);
                break;
            }
        }
        if (messageToOpponent) {
            messageToOpponent({type: 'character-position', x: sprite.body.x, y: sprite.body.y})
        }
    })

    function play(key: keyof typeof movement) {
        sprite.anims.play(`knight-${key}`);
    }
    //@ts-ignore
    function playOnce(key:keyof typeof movement,update?:(animation,frame,currentFrame,totalFrame) => void):Promise<void>{
        return new Promise((resolve) => {
            const animationKey = `knight-${key}-1`;

            const totalFrames = sprite.anims.animationManager.get(animationKey).frames.length;
            function onComplete(animation:any){
                if(animation.key === animationKey){
                    sprite.removeListener('animationcomplete',onComplete);
                    sprite.removeListener('animationupdate',onUpdate);
                    resolve();
                }
            }
            //@ts-ignore
            function onUpdate(animation,frame){
                if(animation.key === animationKey && update){
                    update(animation,frame,frame.textureFrame,totalFrames);
                }
            }
            sprite.addListener('animationcomplete',onComplete);
            sprite.addListener('animationupdate',onUpdate);
            sprite.anims.play(animationKey);
        })
    }

    play('Run');

    function addEnemies(enemies: { sprite: Sprite }[]) {
        enemies.forEach(enemy => {
            //@ts-ignore
            enemy.sprite.on('attack', ({rectangle, type}: { rectangle: any, type: 'light' | 'heavy' }) => {
                state.toGetAttack = sprite.scene.physics.collide(sprite, rectangle);
            })
        })
    }

    return {
        sprite,
        addEnemies,
        right,
        left,
        up,
        down,
        heavyAttack,
        lightAttack,
        state
    };
}

export function staticPreLoad(scene: Phaser.Scene) {
    for (const movementKey of Object.keys(movement)) {
        //@ts-ignore
        scene.load.spritesheet(`knight-${movementKey}`, movement[movementKey], {
            frameWidth: 120,
            frameHeight: 80
        });
    }
}

