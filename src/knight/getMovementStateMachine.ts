import {createStateMachine} from "../utils/createStateMachine";
import {State} from "./State";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export function getMovementStateMachine(sprite: SpriteWithDynamicBody, state: State) {
    return createStateMachine('standing', {
        jump: {
            from: 'standing',
            to: 'jumping'
        },
        flip: {
            from: 'jumping',
            to: 'flipping'
        },
        fall: {
            from: ['flipping', 'jumping', 'standing'],
            to: 'falling'
        },
        touchDown: {
            from: ['jumping', 'flipping', 'falling'],
            to: 'standing'
        }
    } as const, {
        whenFall: () => {
        },
        whenFlip: () => {
            sprite.setVelocityY(-350);
            state.didPressJump = false;
        },
        whenJump: () => {
            sprite.setVelocityY(-750);
            state.didPressJump = false;
        },
        whenTouchDown: () => {
        }
    }, {
        isOnJumpState: () => {
            return state.didPressJump;
        },
        isOnFlipState: () => {
            return state.didPressJump;
        },
        isOnFallState: () => {
            return sprite.body.velocity.y > 100
        },
        isOnTouchDownState: () => {
            return sprite.body.onFloor()
        },
    });
}