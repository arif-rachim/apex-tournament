import {createStateMachine, StateMachine} from "../utils/createStateMachine";
import {MovementKey} from "./Knight";
import {State} from "./State"
import {createLogger} from "../utils/createLogger";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;

const log = createLogger('getAnimationStateMachine.tsx');

function performAttack(isHeavyAttack: boolean, sprite: Phaser.Physics.Arcade.Sprite & { body: Phaser.Physics.Arcade.Body }, state: State, playOnce: (key: MovementKey, update: (animation: any, frame: any, currentFrame: any, totalFrame: any) => void) => Promise<void>) {
    const maxX = sprite.body.maxVelocity.x;
    const attackWidth = 50;

    let group: StaticGroup | undefined = undefined;
    let timeoutId: any;

    function cancel() {
        clearTimeout(timeoutId);
        sprite.setMaxVelocity(maxX);
        state.attackOnProgress = false;
        if (group) {
            group.destroy(true, true);
            group = undefined;
        }
    }
    //@ts-ignore
    playOnce(isHeavyAttack ? 'Attack2' : 'Attack', (animation, frame, currentFrame, totalFrame) => {
        const withinAttack = (0.3 * (totalFrame - 1)) < currentFrame && currentFrame < (0.9 * (totalFrame - 1))
        if (withinAttack) {
            let x = sprite.x + 20;
            let y = sprite.y + 22;
            if (state.flipX) {
                x = sprite.x + 20 - attackWidth;
            }
            if (group) {
                group.destroy(true);
                group = undefined;
            }
            group = sprite.scene.physics.add.staticGroup([sprite.scene.add.rectangle(x, y, attackWidth, 30)]);
            sprite.emit('attack', {rectangle: group, type: isHeavyAttack ? 'heavy' : 'light'});
        }
    }).then(() => {
        cancel();
    });
    timeoutId = setTimeout(() => {
        cancel()
    },1000); // incase still running we cancel this
    if (sprite.body.onFloor()) {
        sprite.setMaxVelocity(maxX / 3);
    }
    state.attackOnProgress = true;
}

export function getAnimationStateMachine(name: string,
                                         play: (key: MovementKey) => void,
                                         playOnce: (key: MovementKey, update?: (animation: any, frame: any, currentFrame: any, totalFrame: any) => void) => Promise<void>,
                                         sprite: SpriteWithDynamicBody,
                                         state: State,
                                         movementStateMachine: StateMachine<any>,onGetAttack:() => void) {
    log('starting animation state machine', name);
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
            performAttack(true, sprite, state, playOnce);
            state.didPressHeavyAttack = false;
        },
        whenLightAttack: () => {
            performAttack(false, sprite, state, playOnce);
            state.didPressLightAttack = false;
        },
        whenGetAttack : () => {
            state.attackOnProgress = false;
            playOnce('Hit').then(() => {
                state.toGetAttack = false;
            });

            onGetAttack();
        }
    }, {

        isOnIdleState: () => {
            if (state.attackOnProgress || state.toGetAttack) {
                return false;
            }
            return sprite.body.onFloor() && sprite.body.velocity.x === 0 && sprite.body.velocity.y === 0 && !state.pressedDown;
        },
        isOnRunState: () => {
            if (state.attackOnProgress || state.toGetAttack) {
                return false;
            }
            return sprite.body.onFloor() && Math.sign(sprite.body.velocity.x) === (state.flipX ? -1 : 1) && !state.pressedDown
        },
        isOnPivotState: () => {
            if (state.attackOnProgress || state.toGetAttack) {
                return false;
            }
            return sprite.body.onFloor() && Math.sign(sprite.body.velocity.x) === (state.flipX ? 1 : -1)
        },
        isOnJumpState: () => {
            if (state.attackOnProgress || state.toGetAttack) {
                return false;
            }
            return sprite.body.velocity.y < 0;
        },
        isOnFlipState: () => {
            if (state.attackOnProgress || state.toGetAttack) {
                return false;
            }
            return movementStateMachine.is('flipping');
        },
        isOnFallState: () => {
            if (state.attackOnProgress || state.toGetAttack) {
                return false;
            }
            return sprite.body.velocity.y > 200
        },
        isOnCrouchState: () => {
            if (state.attackOnProgress || state.toGetAttack) {
                return false;
            }
            return sprite.body.onFloor() && sprite.body.velocity.x === 0 && sprite.body.velocity.y === 0 && state.pressedDown;
        },
        isOnCrouchWalkState: () => {
            if (state.attackOnProgress || state.toGetAttack) {
                return false;
            }
            return sprite.body.onFloor() && sprite.body.velocity.x !== 0 && sprite.body.velocity.y === 0 && state.pressedDown;
        },
        isOnHeavyAttackState: () => {
            return state.didPressHeavyAttack || state.attackOnProgress
        },
        isOnLightAttackState: () => {
            return state.didPressLightAttack || state.attackOnProgress
        },
        isOnGetAttackState : () => {
            return state.toGetAttack
        }
    });
}