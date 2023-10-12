import {useEffect, useState} from "react";
import Phaser from "phaser";
import {Scene} from "./scenes/Scene";
import {RightButtons} from "./buttons/RightButtons";
import {LeftButtons} from "./buttons/LeftButtons";
import {motion} from "framer-motion";
import {adjustDivToViewport} from "./utils/adjustWidthToViewport";

export const sizes = {
    width: 960,
    height: 640
}
const SPEED_DOWN = 1000;

export default function Game(props: { playerName: string, opponentName: string,isHost:boolean}) {
    const [ready, setReady] = useState(false);
    const [winner,setWinner] = useState('');
    useEffect(() => {
        Scene.buttons = {
            right: document.getElementById('right')! as HTMLButtonElement,
            left: document.getElementById('left')! as HTMLButtonElement,
            down: document.getElementById('down')! as HTMLButtonElement,
            up: document.getElementById('up')! as HTMLButtonElement,
            heavyAttack: document.getElementById('heavyAttack')! as HTMLButtonElement,
            lightAttack: document.getElementById('lightAttack')! as HTMLButtonElement
        }

        Scene.names.playerName = props.playerName;
        Scene.names.opponentName = props.opponentName;
        Scene.isHost = props.isHost;
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
            scene: [Scene],

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
        <Scores host={props.isHost ? props.playerName : props.opponentName} guest={props.isHost ? props.opponentName:props.playerName} onWinner={(winner:string) => {
            setWinner(winner);
        }}/>
        {winner &&
            <motion.div style={{position:'absolute',top:'10vh',textAlign:'center',width:'100%',fontSize:'3rem',color:'white'}} initial={{scale:0}} animate={{scale:1}}>{winner} Win !</motion.div>
        }
    </div>
}

function Scores(props:{host:string,guest:string,onWinner:(name:string) => void}){
    const [{guest,host},setState] = useState<{host:number,guest:number}>({host:0,guest:0})
    useEffect(() => {
        //window.dispatchEvent(new CustomEvent('score-update',{detail:data.score}))
        function onScoreUpdate(event:CustomEvent){
            setState(event.detail as any)
        }
        //@ts-ignore
        window.addEventListener('score-update',onScoreUpdate);
        return () => {
            //@ts-ignore
            window.removeEventListener('score-update',onScoreUpdate);
        }
    },[])
    useEffect(() => {
        if(guest === 10000){
            props.onWinner(props.guest);
        }
        if(host === 10000){
            props.onWinner(props.host);
        }
        //@ts-ignore
    },[guest,host])
    return <div style={{top:0,left:0,textAlign:'center',position:'absolute',width:'100%',display:'flex',flexDirection:'row',padding:'2rem'}}>
        <div>{props.host} : {host}</div>
        <div style={{flexGrow:1}}></div>
        <div>{props.guest} : {guest}</div>
    </div>
}
