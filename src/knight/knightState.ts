

export type KnightState = {
    canDoubleJump: boolean,
    isJumping: boolean,
    didPressJump: boolean,
    flipX: boolean,
    pressedDown: boolean,
    didPressLightAttack: boolean // this is the moment when the player press attack key this is the flag when the player is doing is light attack
    didPressHeavyAttack: boolean
    attackOnProgress: boolean // this is the flag when the heavy attack is going on,
    toGetAttack: boolean,
    healthPoint: number

}
