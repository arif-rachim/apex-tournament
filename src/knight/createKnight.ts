// @ts-ignore-next-line
import {onPreUpdate} from "../onPreUpdate";
import {getAnimationStateMachine} from "./getAnimationStateMachine";
import {getMovementStateMachine} from "./getMovementStateMachine";
import {getRunState} from "./getRunState";
import {movement} from "./movement";
import {KnightState} from "./knightState";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Sprite = Phaser.GameObjects.Sprite;
import Collider = Phaser.Physics.Arcade.Collider;


export type MovementKey = keyof typeof movement;

export function createKnight(scene: Phaser.Scene, x: number, y: number, keys: { right: number, left: number, up: number, down: number, lightAttack: number, heavyAttack: number }) {
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
    for (const movementKey of Object.keys(movement)) {
        scene.anims.create({
            key: `knight-${movementKey}`,
            frames: scene.anims.generateFrameNumbers(`knight-${movementKey}`),
            frameRate: 10,
            repeat: -1
        });
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
        isLightAttackOnProgress: false,
        isHeavyAttackOnProgress: false,
        toGetAttack:false
    }
    const movementStateMachine = getMovementStateMachine(sprite, state)
    const animationStateMachine = getAnimationStateMachine(play, sprite, state, movementStateMachine)
    const runState = getRunState(sprite, right, state, left, down)

    animationStateMachine.addListener('beforeStateChange', (from, to) => {
        console.log('movement change ', from, to)
    })

    onPreUpdate(sprite, () => {


        state.didPressJump = Phaser.Input.Keyboard.JustDown(up);
        state.pressedDown = down.isDown;
        state.didPressLightAttack = Phaser.Input.Keyboard.JustDown(lightAttack);
        state.didPressHeavyAttack = Phaser.Input.Keyboard.JustDown(heavyAttack);

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
    })

    function play(key: keyof typeof movement) {
        sprite.anims.play(`knight-${key}`);
    }

    play('Run');

    function addEnemies(enemies: { sprite: Sprite }[]) {
        enemies.forEach(enemy => {
            let collider: Collider;

            enemy.sprite.on('attack', ({rectangle, type}: { rectangle: any, type: 'light' | 'heavy' }) => {
                collider = sprite.scene.physics.add.collider(sprite, rectangle, () => {
                    state.toGetAttack = true;
                })
            })
            enemy.sprite.on('attackDone', ({rectangle, type}: { rectangle: any, type: 'light' | 'heavy' }) => {
                state.toGetAttack = false;
                collider.destroy();
            })
        })
    }

    return {
        sprite,
        addEnemies
    };
}

export function staticPreLoad(scene: Phaser.Scene) {
    for (const movementKey of Object.keys(movement)) {
        scene.load.spritesheet(`knight-${movementKey}`, movement[movementKey], {
            frameWidth: 120,
            frameHeight: 80
        });
    }
}
