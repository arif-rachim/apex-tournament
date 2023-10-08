import ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;

export function createPlatform(scene:Phaser.Scene, x:number, y:number,width:number,height:number,color:number){
    const rectangle = scene.add.rectangle(x,y,width,height,color);
    scene.physics.add.existing(rectangle,true);
    function addCollider(target:ArcadeColliderType,callback?:Phaser.Types.Physics.Arcade.ArcadePhysicsCallback){
        scene.physics.add.collider(rectangle,target,callback)
    }
    return {
        addCollider
    }
}