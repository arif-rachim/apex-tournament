import {createStateMachine, StateMachine} from "../createStateMachine";
import {MovementKey} from "./createKnight";
import {KnightState} from "./knightState"
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export function getAnimationStateMachine<T>(play: (key: MovementKey) => void,
                                            sprite: SpriteWithDynamicBody,
                                            state: KnightState,
                                            movementStateMachine: StateMachine<any>) {
    return createStateMachine('idle', {
        idle: {
            from: ['falling', 'running', 'pivoting', 'crouching', 'crouch-walking', 'flipping', 'light-attacking',
                'heavy-attacking','to-get-attack'],
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
            from: ['idle','running','crouching','standing','falling','flipping','crouch-walking'],
            to: 'light-attacking'
        },
        heavyAttack: {
            from: ['idle','running','crouching','standing','falling','flipping','crouch-walking'],
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
            const maxX = sprite.body.maxVelocity.x;

            setTimeout(() => {
                let x = sprite.x + 22;
                let y = sprite.y + 22;
                if (state.flipX) {
                    x = sprite.x - 22;
                }
                const rectangle = sprite.scene.physics.add.staticGroup([sprite.scene.add.rectangle(x, y, 40, 30)]);
                sprite.emit('attack', {rectangle, type: 'heavy'});
                setTimeout(() => {
                    sprite.emit('attackDone', {rectangle, type: 'heavy'});
                    rectangle.destroy(true, true);
                }, 200)
            }, 400);


            play('Attack2');

            if (sprite.body.onFloor()) {
                sprite.setMaxVelocity(maxX / 3);
            }
            state.isHeavyAttackOnProgress = true;

            setTimeout(() => {
                sprite.setMaxVelocity(maxX);
                state.isHeavyAttackOnProgress = false;
            }, 600);
        },
        whenLightAttack: () => {
            const maxX = sprite.body.maxVelocity.x;

            setTimeout(() => {
                let x = sprite.x + 22;
                let y = sprite.y + 22;
                if (state.flipX) {
                    x = sprite.x - 22;
                }

                const rectangle = sprite.scene.physics.add.staticGroup([sprite.scene.add.rectangle(x, y, 40, 30)]);
                sprite.emit('attack', {rectangle, type: 'light'});
                setTimeout(() => {
                    sprite.emit('attackDone', {rectangle, type: 'light'});
                    rectangle.destroy(true, true);
                }, 200)
            }, 300);

            play('Attack')
            if (sprite.body.onFloor()) {
                sprite.setMaxVelocity(maxX / 3);
            }

            state.isLightAttackOnProgress = true;
            setTimeout(() => {
                sprite.setMaxVelocity(maxX);
                state.isLightAttackOnProgress = false;
            }, 400);
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
            if(state.toGetAttack){
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