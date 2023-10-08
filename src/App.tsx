import {useEffect} from "react";
import Phaser from "phaser";
import {GameScene} from "./GameScene";
import {IoArrowBackCircle, IoArrowDownCircle, IoArrowForwardCircle, IoArrowUpCircle} from "react-icons/io5";
import {GiSwordSlice, GiSwordSpin} from "react-icons/gi";

const sizes = {
    width: 960,
    height: 640
}
const SPEED_DOWN = 650;
export default function App() {
    useEffect(() => {

        new Phaser.Game({
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
        setTimeout(adjustDivToViewport, 300);
    })
    return <div style={{height: '100%', backgroundColor: 'black', overflow: 'hidden'}} onTouchStart={event => {
        event.stopPropagation();
        event.preventDefault();
    }}>
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding:'1rem'
        }}>
            <div id="game"></div>
        </div>
        <div style={{
            display: "flex",
            position: "fixed",
            bottom: "5rem",
            right: "0",
            gap: "0.5rem"
        }}>
            <div style={{
                display: "flex",
                flexDirection: "row",
                position: "relative",
                gap: "0.5rem"
            }}>
                <div id="heavyAttack" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                }}><GiSwordSpin/></div>
                <div id="lightAttack" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                }}><GiSwordSlice/></div>
                <div id="up" style={{
                    position: "absolute",
                    top: "-4rem",
                    left: "2.25rem",
                    fontSize: "4rem"
                }}><IoArrowUpCircle/></div>
            </div>
        </div>
        <div style={{
            display: "flex",
            position: "fixed",
            bottom: "4rem",
            left: "0",
            gap: "0.5rem"
        }}>
            <div style={{
                display: "flex",
                flexDirection: "row",
                position: "relative",
                gap: "0.5rem"
            }}>

                <div id="left" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem'
                }}>
                    <IoArrowBackCircle/>
                </div>
                <div id="right" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem'
                }}><IoArrowForwardCircle/></div>
                <div id="down" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    position: "absolute",
                    bottom: "-4rem",
                    left: "2.25rem"
                }}><IoArrowDownCircle/></div>
            </div>
        </div>
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
