import {useEffect} from "react";
import Phaser from "phaser";
import {GameScene} from "./game-scene/GameScene";
import {RightButtons} from "./buttons/RightButtons";
import {LeftButtons} from "./buttons/LeftButtons";

const sizes = {
    width: 960,
    height: 640
}
const SPEED_DOWN = 650;

export default function App() {
    useEffect(() => {
        GameScene.buttons = {
            right: document.getElementById('right')! as HTMLButtonElement,
            left: document.getElementById('left')! as HTMLButtonElement,
            down: document.getElementById('down')! as HTMLButtonElement,
            up: document.getElementById('up')! as HTMLButtonElement,
            heavyAttack: document.getElementById('heavyAttack')! as HTMLButtonElement,
            lightAttack: document.getElementById('lightAttack')! as HTMLButtonElement
        }
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
            const container = document.getElementById('container');
            container.style.opacity = '1';
            container.style.width = 'unset';
            container.style.height = 'unset';
        })
    })
    return <div style={{height: '100%', backgroundColor: 'black', overflow: 'hidden'}} onTouchStart={event => {
        event.stopPropagation();
        event.preventDefault();
    }}>
        <div id={'container'} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: '1rem',
            opacity: 0,
            width: 0,
            height: 0,
            overflow: "hidden"
        }}>
            <div id="game"></div>
        </div>
        <RightButtons/>
        <LeftButtons/>
    </div>
}

function adjustDivToViewport() {
    const div = document.getElementById('game');
    const viewportWidth = window.innerWidth - 24;
    const viewportHeight = window.innerHeight - 24;
    // Calculate the new width and height while maintaining aspect ratio
    const aspectRatio = sizes.width / sizes.height; // You can adjust this ratio as needed
    let newWidth, newHeight;

    if (viewportWidth / aspectRatio <= viewportHeight) {
        // Fit based on width
        newWidth = viewportWidth;
        newHeight = viewportWidth / aspectRatio;
    } else {
        // Fit based on height
        newHeight = viewportHeight;
        newWidth = viewportHeight * aspectRatio;
    }

    // Set the div's width and height
    div.style.width = newWidth + 'px';
    div.style.height = newHeight + 'px';
}

window.addEventListener('orientationchange', adjustDivToViewport)
window.addEventListener('resize', adjustDivToViewport)
