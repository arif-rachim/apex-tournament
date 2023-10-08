import {createStateMachine, StateMachine} from "../utils/createStateMachine";
import {MovementKey} from "./createKnight";
import {KnightState} from "./knightState"
import {onPreUpdate} from "../utils/onPreUpdate";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Rectangle = Phaser.GameObjects.Rectangle;

function performHeavyAttack(isHeavyAttack: boolean, sprite: Phaser.Physics.Arcade.Sprite & { body: Phaser.Physics.Arcade.Body }, state: KnightState, playOnce: (key: MovementKey, update: (animation: any, frame: any, currentFrame: any, totalFrame: any) => void) => Promise<void>) {
    const maxX = sprite.body.maxVelocity.x;
    const attackWidth = 50;

    let group: StaticGroup | undefined = undefined;
    let rectangle: Rectangle | undefined = undefined;
    let attackStart = false;
    const unRegister = onPreUpdate(sprite, () => {
        if (rectangle) {
            let x = sprite.x;
            let y = sprite.y + 7;
            if (state.flipX) {
                x = sprite.x - attackWidth;
            }
            //@ts-ignore
            rectangle.body.x = x;
            //@ts-ignore
            rectangle.body.y = y;
        }
    })
    //@ts-ignore
    playOnce(isHeavyAttack ? 'Attack2' : 'Attack', (animation, frame, currentFrame, totalFrame) => {

        const startAttack = (0.3 * (totalFrame - 1)) < currentFrame;
        const endAttack = (0.9 * (totalFrame - 1)) < currentFrame;
        if (startAttack && !endAttack && !attackStart) {
            let x = sprite.x + 20;
            let y = sprite.y + 22;
            if (state.flipX) {
                x = sprite.x - 20 - attackWidth;
            }
            rectangle = sprite.scene.add.rectangle(x, y, attackWidth, 30);
            group = sprite.scene.physics.add.staticGroup([rectangle]);
            attackStart = true;
            sprite.emit('attack', {rectangle: group, type: isHeavyAttack ? 'heavy' : 'light'});
        }
        if (endAttack && attackStart) {
            attackStart = false
            sprite.emit('attackDone', {rectangle: group, type: isHeavyAttack ? 'heavy' : 'light'});
        }
    }).then(() => {
        sprite.setMaxVelocity(maxX);
        if (isHeavyAttack) {
            state.isHeavyAttackOnProgress = false;
        } else {
            state.isLightAttackOnProgress = false;
        }

        if (group) {
            group.destroy(true, true);
        }
        unRegister();
    })
    if (sprite.body.onFloor()) {
        sprite.setMaxVelocity(maxX / 3);
    }
    if (isHeavyAttack) {
        state.isHeavyAttackOnProgress = true;
    } else {
        state.isLightAttackOnProgress = true;
    }

}

export function getAnimationStateMachine(play: (key: MovementKey) => void,
                                            playOnce: (key: MovementKey, update: (animation: any, frame: any, currentFrame: any, totalFrame: any) => void) => Promise<void>,
                                            sprite: SpriteWithDynamicBody,
                                            state: KnightState,
                                            movementStateMachine: StateMachine<any>) {
    return createStateMachine('idle', {
        idle: {
            from: ['falling', 'running', 'pivoting', 'crouching', 'crouch-walking', 'flipping', 'light-attacking',
                'heavy-attacking', 'to-get-attack', 'jumping'],
            to: 'idle'
        },
        run: {
            from: ['falling', 'idle', 'pivoting', 'crouching', 'crouch-walking', 'light-attacking', 'heavy-attacking','to-get-attack'],
            to: 'running'
        },
        pivot: {
            from: ['falling', 'running', 'light-attacking', 'heavy-attacking','to-get-attack'],
            to: 'pivoting'
        },
        jump: {
            from: ['idle', 'running', 'pivoting', 'crouching', 'crouch-walking', 'light-attacking', 'heavy-attacking','to-get-attack'],
            to: 'jumping'
        },
        flip: {
            from: ['jumping', 'falling', 'light-attacking', 'heavy-attacking','to-get-attack'],
            to: 'flipping'
        },
        fall: {
            from: '*',
            to: 'falling'
        },
        crouch: {
            from: ['standing', 'falling', 'running', 'idle', 'crouch-walking', 'light-attacking', 'heavy-attacking','to-get-attack'],
            to: 'crouching'
        },
        crouchWalk: {
            from: ['standing', 'falling', 'running', 'idle', 'crouching', 'light-attacking', 'heavy-attacking','to-get-attack'],
            to: 'crouch-walking'
        },
        lightAttack: {
            from: ['idle', 'running', 'crouching', 'standing', 'falling', 'flipping', 'crouch-walking', 'jumping', 'pivoting'],
            to: 'light-attacking'
        },
        heavyAttack: {
            from: ['idle', 'running', 'crouching', 'standing', 'falling', 'flipping', 'crouch-walking', 'jumping', 'pivoting'],
            to: 'heavy-attacking'
        },
        getAttack : {
            from : '*',
            to : 'to-get-attack'
        }
    }, {
        whenJump: () => {
            play('Jump')
        },
        whenFlip: () => {
            play('Roll')
        },
        whenFall: () => {
            play('Fall')
        },
        whenIdle: () => {
            play('Idle')
        },
        whenPivot: () => {
            play('TurnAround')
        },
        whenRun: () => {
            play('Run')
        },
        whenCrouch: () => {
            play('Crouch')
        },
        whenCrouchWalk: () => {
            play('CrouchWalk')
        },
        whenHeavyAttack: () => {
            performHeavyAttack(true, sprite, state, playOnce);
            state.didPressHeavyAttack = false;
        },
        whenLightAttack: () => {
            performHeavyAttack(false, sprite, state, playOnce);
            state.didPressLightAttack = false;
        },
        whenGetAttack : () => {
            play('Hit');
        }
    }, {

        isOnIdleState: () => {
            if (state.isHeavyAttackOnProgress || state.isLightAttackOnProgress) {
                return false;
            }
            if(state.toGetAttack){
                return false;
            }
            return sprite.body.onFloor() && sprite.body.velocity.x === 0 && sprite.body.velocity.y === 0 && !state.pressedDown;
        },
        isOnRunState: () => {
            if (state.isHeavyAttackOnProgress || state.isLightAttackOnProgress) {
                return false;
            }
            if(state.toGetAttack){
                return false;
            }
            return sprite.body.onFloor() && Math.sign(sprite.body.velocity.x) === (state.flipX ? -1 : 1) && !state.pressedDown
        },
        isOnPivotState: () => {
            if (state.isHeavyAttackOnProgress || state.isLightAttackOnProgress) {
                return false;
            }
            if (state.toGetAttack) {
                return false;
            }
            return sprite.body.onFloor() && Math.sign(sprite.body.velocity.x) === (state.flipX ? 1 : -1)
        },
        isOnJumpState: () => {
            if (state.isHeavyAttackOnProgress || state.isLightAttackOnProgress) {
                return false;
            }
            if(state.toGetAttack){
                return false;
            }
            return sprite.body.velocity.y < 0;
        },
        isOnFlipState: () => {
            if (state.isHeavyAttackOnProgress || state.isLightAttackOnProgress) {
                return false;
            }
            if(state.toGetAttack){
                return false;
            }
            return movementStateMachine.is('flipping');
        },
        isOnFallState: () => {
            if (state.isHeavyAttackOnProgress || state.isLightAttackOnProgress) {
                return false;
            }
            if(state.toGetAttack){
                return false;
            }
            return sprite.body.velocity.y > 200
        },
        isOnCrouchState: () => {
            if (state.isHeavyAttackOnProgress || state.isLightAttackOnProgress) {
                return false;
            }
            if(state.toGetAttack){
                return false;
            }
            return sprite.body.onFloor() && sprite.body.velocity.x === 0 && sprite.body.velocity.y === 0 && state.pressedDown;
        },
        isOnCrouchWalkState: () => {
            if (state.isHeavyAttackOnProgress || state.isLightAttackOnProgress) {
                return false;
            }
            if(state.toGetAttack){
                return false;
            }
            return sprite.body.onFloor() && sprite.body.velocity.x !== 0 && sprite.body.velocity.y === 0 && state.pressedDown;
        },
        isOnHeavyAttackState: () => {
            if(state.toGetAttack){
                return false;
            }
            return state.didPressHeavyAttack || state.isHeavyAttackOnProgress
        },
        isOnLightAttackState: () => {
            if(state.toGetAttack){
                return false;
            }
            return state.didPressLightAttack || state.isLightAttackOnProgress
        },
        isOnGetAttackState : () => {
            return state.toGetAttack
        }
    });
}