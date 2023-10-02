import Sprite = Phaser.GameObjects.Sprite;

export function onPreUpdate(sprite: Phaser.GameObjects.Sprite, preUpdate: (time: number, delta: number) => void) {
    const me: Sprite & { updateListeners?: Array<(time: number, delta: number) => void>, preUpdateOriginal?: (time: number, delta: number) => void } = sprite as any;

    me.updateListeners = me.updateListeners || [];
    me.preUpdateOriginal = me.preUpdateOriginal || me.preUpdate;
    me.updateListeners.push(preUpdate);
    me.preUpdate = (time: number, delta: number) => {
        if (me.preUpdateOriginal) {
            me.preUpdateOriginal(time, delta);
        }
        me.updateListeners?.forEach(c => c(time, delta));
    };
    return function unregisterListener() {
        const index = me.updateListeners?.indexOf(preUpdate);
        return (me.updateListeners || []).splice(index, 1);
    }
}