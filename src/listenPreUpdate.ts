export function listenPreUpdate(sprite: Phaser.GameObjects.Sprite, preUpdate: (time: number, delta: number) => void) {
    const existingPreUpdate = (sprite as any).preUpdate;
    (sprite as any).preUpdate = (time: number, delta: number) => {
        existingPreUpdate.call(sprite, time, delta);
        preUpdate(time, delta);

    };
}