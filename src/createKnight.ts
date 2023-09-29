// @ts-ignore-next-line
import {listenPreUpdate} from "./listenPreUpdate";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import {createStateMachine} from "./createStateMachine";

function createKnight(scene: Phaser.Scene, x: number, y: number) {

    const right = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)!;
    const left = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)!;
    const up = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP)!;
    const down = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)!;

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
    const state = {
        canDoubleJump: false,
        isJumping: false,
        didPressJump: false,
        flipX: false,
        pressedDown: false,
    }

    const animationStateMachine = createStateMachine('idle', {
        idle: {
            from: ['falling', 'running', 'pivoting', 'crouching','crouch-walking','flipping'],
            to: 'idle'
        },
        run: {
            from: ['falling', 'idle', 'pivoting', 'crouching','crouch-walking'],
            to: 'running'
        },
        pivot: {
            from: ['falling', 'running'],
            to: 'pivoting'
        },
        jump: {
            from: ['idle', 'running', 'pivoting', 'crouching','crouch-walking'],
            to: 'jumping'
        },
        flip: {
            from: ['jumping', 'falling'],
            to: 'flipping'
        },
        fall: {
            from: '*',
            to: 'falling'
        },
        crouch: {
            from: ['standing', 'falling', 'running', 'idle','crouch-walking'],
            to: 'crouching'
        },
        crouchWalk : {
            from: ['standing', 'falling', 'running', 'idle','crouching'],
            to: 'crouch-walking'
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
        whenCrouchWalk : () => {
            play('CrouchWalk')
        }
    }, {

        isOnIdleState: () => {
            return sprite.body.onFloor() && sprite.body.velocity.x === 0 && sprite.body.velocity.y === 0 && !state.pressedDown;
        },
        isOnRunState: () => {
            return sprite.body.onFloor() && Math.sign(sprite.body.velocity.x) === (state.flipX ? -1 : 1) && !state.pressedDown
        },
        isOnPivotState: () => {
            return sprite.body.onFloor() && Math.sign(sprite.body.velocity.x) === (state.flipX ? 1 : -1)
        },
        isOnJumpState: () => {
            return sprite.body.velocity.y < 0;
        },
        isOnFlipState: () => {
            return movementStateMachine.is('flipping');
        },
        isOnFallState: () => {
            return sprite.body.velocity.y > 200
        },
        isOnCrouchState: () => {
            return sprite.body.onFloor() && sprite.body.velocity.x === 0 && sprite.body.velocity.y === 0 && state.pressedDown;
        },
        isOnCrouchWalkState : () => {
            return sprite.body.onFloor() && sprite.body.velocity.x !== 0 && sprite.body.velocity.y === 0 && state.pressedDown;
        }
    })

    const movementStateMachine = createStateMachine('standing', {
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
        },
        whenJump: () => {
            sprite.setVelocityY(-750);
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
    })
    animationStateMachine.addListener('beforeStateChange', (from, to) => {
        console.log('Animation change ', from, to)
    })

    listenPreUpdate(sprite, () => {
        if (right.isDown) {
            if(down.isDown){
                sprite.setAccelerationX(500)
                sprite.setMaxVelocity(100,400);
            }else{
                sprite.setAccelerationX(1000);
                sprite.setMaxVelocity(250,400);
            }
            sprite.setOffset(53, 45);
            sprite.setFlipX(false);
            state.flipX = false;
        } else if (left.isDown) {
            if(down.isDown){
                sprite.setAccelerationX(-500);
                sprite.setMaxVelocity(100,400);
            }else{
                sprite.setAccelerationX(-1000)
                sprite.setMaxVelocity(250,400);
            }
            sprite.setFlipX(true);
            state.flipX = true;
            sprite.setOffset(58, 45);
        } else {
            sprite.setAccelerationX(0);
        }
        state.didPressJump = Phaser.Input.Keyboard.JustDown(up);
        state.pressedDown = down.isDown;

        if (movementStateMachine.is('jumping') || movementStateMachine.is('flipping')) {
            if (!up.isDown && sprite.body.velocity.y < -150) {
                sprite.setVelocityY(-150);
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
            }
        }
    })

    function play(key: keyof typeof movement) {
        sprite.anims.play(`knight-${key}`);
    }

    play('Run');

    return {
        sprite
    };
}

createKnight.staticPreLoad = (scene: Phaser.Scene) => {
    for (const movementKey of Object.keys(movement)) {
        scene.load.spritesheet(`knight-${movementKey}`, movement[movementKey], {
            frameWidth: 120,
            frameHeight: 80
        });
    }
}


export default createKnight;

const movement = {
    Attack: "assets/characters/knight/_Attack.png",
    Attack2: "assets/characters/knight/_Attack2.png",
    Attack2NoMovement: "assets/characters/knight/_Attack2NoMovement.png",
    AttackCombo: "assets/characters/knight/_AttackCombo.png",
    AttackComboNoMovement: "assets/characters/knight/_AttackComboNoMovement.png",
    AttackNoMovement: "assets/characters/knight/_AttackNoMovement.png",
    Crouch: "assets/characters/knight/_Crouch.png",
    CrouchAttack: "assets/characters/knight/_CrouchAttack.png",
    CrouchFull: "assets/characters/knight/_CrouchFull.png",
    CrouchTransition: "assets/characters/knight/_CrouchTransition.png",
    CrouchWalk: "assets/characters/knight/_CrouchWalk.png",
    Dash: "assets/characters/knight/_Dash.png",
    Death: "assets/characters/knight/_Death.png",
    DeathNoMovement: "assets/characters/knight/_DeathNoMovement.png",
    Fall: "assets/characters/knight/_Fall.png",
    Hit: "assets/characters/knight/_Hit.png",
    Idle: "assets/characters/knight/_Idle.png",
    Jump: "assets/characters/knight/_Jump.png",
    JumpFallInbetween: "assets/characters/knight/_JumpFallInbetween.png",
    Roll: "assets/characters/knight/_Roll.png",
    Run: "assets/characters/knight/_Run.png",
    Slide: "assets/characters/knight/_Slide.png",
    SlideFull: "assets/characters/knight/_SlideFull.png",
    SlideTransitionEnd: "assets/characters/knight/_SlideTransitionEnd.png",
    SlideTransitionStart: "assets/characters/knight/_SlideTransitionStart.png",
    TurnAround: "assets/characters/knight/_TurnAround.png",
    WallClimb: "assets/characters/knight/_WallClimb.png",
    WallClimbNoMovement: "assets/characters/knight/_WallClimbNoMovement.png",
    WallHang: "assets/characters/knight/_WallHang.png",
    WallSlide: "assets/characters/knight/_WallSlide.png"
} as const;