import {createStateMachine} from "../utils/createStateMachine";
import {KnightState} from "./knightState";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export function getRunState(sprite: SpriteWithDynamicBody, right: {isDown:boolean}, state: KnightState, left: {isDown:boolean}, down: {isDown:boolean}) {
    return createStateMachine('idle', {
        idle: {
            from: ['running-right', 'running-left', 'crouching', 'crouch-walking-right', 'crouch-walking-left'],
            to: 'idle'
        },
        crouch: {
            from: ['idle', 'running-right', 'running-left', 'crouch-walking-right', 'crouch-walking-left'],
            to: 'crouching'
        },
        runRight: {
            from: ['idle', 'crouching', 'crouch-walking-right', 'crouch-walking-left', 'running-left'],
            to: 'running-right'
        },
        runLeft: {
            from: ['idle', 'crouching', 'crouch-walking-right', 'crouch-walking-left', 'running-right'],
            to: 'running-left'
        },
        crouchWalkRight: {
            from: ['idle', 'crouching', 'running-right', 'running-left', 'crouch-walking-left'],
            to: 'crouch-walking-right'
        },
        crouchWalkLeft: {
            from: ['idle', 'crouching', 'running-right', 'running-left', 'crouch-walking-right'],
            to: 'crouch-walking-left'
        },
    }, {
        whenIdle: () => {
            sprite.setAccelerationX(0);
        },
        whenCrouch: () => {
            sprite.setAccelerationX(0);
        },
        whenCrouchWalkRight: () => {
            sprite.setMaxVelocity(100, 400);
            sprite.setAccelerationX(500);
            sprite.setOffset(53, 45);
            sprite.setFlipX(false);
            state.flipX = false;
        },
        whenCrouchWalkLeft: () => {
            sprite.setMaxVelocity(100, 400);
            sprite.setAccelerationX(-500);
            sprite.setOffset(53, 45);
            sprite.setFlipX(true);
            state.flipX = true;
        },
        whenRunRight: () => {
            sprite.setMaxVelocity(250, 400);
            sprite.setAccelerationX(1000);
            sprite.setOffset(53, 45);
            sprite.setFlipX(false);
            state.flipX = false;
        },
        whenRunLeft: () => {
            sprite.setMaxVelocity(250, 400);
            sprite.setAccelerationX(-1000);
            sprite.setOffset(58, 45);
            sprite.setFlipX(true);
            state.flipX = true;
        }
    }, {
        isOnIdleState: () => {
            return !down.isDown && !(right.isDown || left.isDown);
        },
        isOnCrouchState: () => {
            return down.isDown && !(right.isDown || left.isDown);
        },
        isOnRunLeftState: () => {
            return !down.isDown && left.isDown;
        },
        isOnRunRightState: () => {
            return !down.isDown && right.isDown;
        },
        isOnCrouchWalkRightState: () => {
            return down.isDown && right.isDown;
        },
        isOnCrouchWalkLeftState: () => {
            return down.isDown && left.isDown;
        }
    });
}