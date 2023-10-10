import {useEffect, useState} from "react";
import Phaser from "phaser";
import {GameScene} from "./game-scene/GameScene";
import {RightButtons} from "./buttons/RightButtons";
import {LeftButtons} from "./buttons/LeftButtons";
import {motion} from "framer-motion";
import {adjustDivToViewport} from "./utils/adjustWidthToViewport";

export const sizes = {
    width: 960,
    height: 640
}
const SPEED_DOWN = 750;

export default function PlayGame(props: { playerName: string, opponentName: string,isHost:boolean }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        GameScene.buttons = {
            right: document.getElementById('right')! as HTMLButtonElement,
            left: document.getElementById('left')! as HTMLButtonElement,
            down: document.getElementById('down')! as HTMLButtonElement,
            up: document.getElementById('up')! as HTMLButtonElement,
            heavyAttack: document.getElementById('heavyAttack')! as HTMLButtonElement,
            lightAttack: document.getElementById('lightAttack')! as HTMLButtonElement
        }

        GameScene.names.playerName = props.playerName;
        GameScene.names.opponentName = props.opponentName;
        GameScene.isHost = props.isHost;
        const game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'game',
            backgroundColor: '#33A5E7',
            scale: {
                width: sizes.width,
                height: sizes.height,
                mode: Phaser.Scale.FIT
            },
            render: {
                pixelArt: true
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: {y: SPEED_DOWN},
                    debug: false,
                    debugShowStaticBody: false,
                    debugShowBody: false
                }
            },
            scene: [GameScene]
        });
        game.events.on('ready', () => {
            adjustDivToViewport();
            setReady(true);
        })
        return () => {
            game.destroy(true);
        }
    }, []);
    return <div style={{height: '100%', backgroundColor: 'black', overflow: 'hidden'}} onTouchStart={event => {
        event.stopPropagation();
        event.preventDefault();
    }}>
        <motion.div id={'container'} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: '1rem',
            overflow: "hidden"
        }} initial={{
            opacity: 0,
            width: 0,
            height: 0
        }}
                    animate={{opacity: ready ? 1 : 0, width: ready ? 'unset' : 0, height: ready ? 'unset' : 0}}>
            <div id="game"></div>
        </motion.div>
        <RightButtons/>
        <LeftButtons/>
    </div>
}

