import {createStateMachine} from "../createStateMachine";
import {KnightState} from "./knightState";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export function getRunState(sprite: SpriteWithDynamicBody, right: Phaser.Input.Keyboard.Key, state: KnightState, left: Phaser.Input.Keyboard.Key, down: Phaser.Input.Keyboard.Key) {
    return createStateMachine('idle', {
        idle: {
            from: ['running', 'crouching', 'crouch-walking'],
            to: 'idle'
        },
        crouch: {
            from: ['idle', 'running', 'crouch-walking'],
            to: 'crouching'
        },
        run: {
            from: ['idle', 'crouching', 'crouch-walking'],
            to: 'running'
        },
        
        crouchWalk: {
            from: ['idle', 'crouching', 'running'],
            to: 'crouch-walking'
        },
    }, {
        whenIdle: () => {
            sprite.setAccelerationX(0);
        },
        whenCrouch: () => {
            sprite.setAccelerationX(0);
        },
        whenCrouchWalk: () => {
            sprite.setMaxVelocity(100, 400);
            if (right.isDown) {
                sprite.setAccelerationX(500);
                sprite.setOffset(53, 45);
                sprite.setFlipX(false);
                state.flipX = false;
            }else if (left.isDown) {
                sprite.setAccelerationX(-500);
                sprite.setOffset(53, 45);
                sprite.setFlipX(true);
                state.flipX = true;
            }
        },
        whenRun: () => {
            sprite.setMaxVelocity(250, 400);
            if (right.isDown) {
                sprite.setAccelerationX(1000);
                sprite.setOffset(53, 45);
                sprite.setFlipX(false);
                state.flipX = false;
            }else if (left.isDown) {
                sprite.setAccelerationX(-1000);
                sprite.setOffset(58, 45);
                sprite.setFlipX(true);
                state.flipX = true;
            }
        }
    }, {
        isOnIdleState: () => {
            return !down.isDown && !(right.isDown || left.isDown);
        },
        isOnCrouchState: () => {
            return down.isDown && !(right.isDown || left.isDown);
        },
        isOnRunState: () => {
            return !down.isDown && (right.isDown || left.isDown);
        },
        isOnCrouchWalkState: () => {
            return down.isDown && (right.isDown || left.isDown);
        }
    });
}