import Game from "./Game";
import {useEffect, useRef, useState} from "react";
import {IoArrowBack, IoLogIn} from "react-icons/io5";
import {IoIosCreate} from "react-icons/io";
import {motion} from "framer-motion";
import Peer, {DataConnection} from "peerjs";
import {createLogger} from "./utils/createLogger";
import {Scene} from "./scenes/Scene";

const appUUID = "ecd5660b-032e-4e54-95a1-c5ba7250ea17-apex-tournament";
const log = createLogger('App.tsx');

export function App() {
    const [appState, setAppState] = useState<'start' | 'create-a-game' | 'waiting-for-opponent' | 'login-to-a-game' | 'waiting-server-to-accept' | 'game-is-ready' | 'unable-to-login'>('start');
    const [roomName, setRoomName] = useState('');
    const [isHost,setIsHost] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [opponentName, setPlayerOpponent] = useState('');

    const roomKey = appUUID + '-' + roomName.split(' ').filter(i => i).join('-').toUpperCase();
    const peerRef = useRef<Peer | undefined>(undefined);
    const connectionRef = useRef<DataConnection|undefined>(undefined);
    useEffect(() => {
        if(opponentName){
            Scene.connection = connectionRef.current!;
            setAppState('game-is-ready');
        }
        return () => {
            if(opponentName){
                if(isHost){
                    setAppState('waiting-for-opponent');
                }else{
                    setAppState('start');
                }
            }
        }
    },[opponentName]);
    function createRoom() {
        const peer = new Peer(roomKey);
        peerRef.current = peer;

        //@ts-ignore
        peer.on('open', () => {
            setAppState('waiting-for-opponent');
            setIsHost(true);
        });
        //@ts-ignore
        peer.on('candidate', (...args) => {
            log('peer event candidate', args);
        });
        //@ts-ignore
        peer.on('connection', (connection) => {
            //log('peer => connection', connection);
            connectionRef.current = connection;
            connection.on('data', (data:any) => {
                if('myName' in data){
                    setPlayerOpponent(data.myName as string)
                }
            })
            connection.on('open', () => {
                connection.send({myName:playerName});
                log('connection => open');
            })
            connection.on('close', () => {
                log('connection => closed');
                connectionRef.current = undefined;
                setPlayerOpponent('');
            })
        })

    }

    function loginToRoom() {
        const peer = new Peer();
        peerRef.current = peer;
        setAppState('waiting-server-to-accept');
        //@ts-ignore
        peer.on('open', (...args) => {
            log('peer => open', args);
            const connection = peer.connect(roomKey);
            connectionRef.current = connection;
            //@ts-ignore
            connection.on('open', () => {
                log('connection => open', args);
                connection.send({myName:playerName});
            });
            //@ts-ignore
            connection.on('close', () => {
                log('connection => closed');
                connectionRef.current = undefined;
                setPlayerOpponent('');
            });
            //@ts-ignore
            connection.on('data', function (data:any) {
                if('myName' in data){
                    setPlayerOpponent(data.myName as string);
                }
            });
        });

    }

    useEffect(() => {
        if (appState === 'start') {
            setIsHost(false);
            peerRef.current?.destroy();
        }
        if (appState === 'create-a-game') {
            setIsHost(false);
            peerRef.current?.destroy();
        }
        if (appState === 'login-to-a-game') {
            setIsHost(false);
            peerRef.current?.destroy();
        }
    }, [appState]);

    return <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    }}>
        {appState === 'start' &&
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                paddingTop: '2rem',
                paddingBottom: '2rem',
                height: '100%',
                justifyContent: 'center'
            }}>
                <div style={{fontSize: '3rem', textAlign: 'center'}}>Apex Tournament</div>
                <div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', gap: '1rem'}}>
                    <motion.div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                                whileTap={{scale: 0.95}} onTap={() => {
                        setAppState('create-a-game');
                    }}>
                        <IoIosCreate fontSize={'3rem'}/>
                        <div>Create Game</div>
                    </motion.div>
                    <motion.div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                                whileTap={{scale: 0.95}} onTap={() => {
                        setAppState('login-to-a-game')
                    }}>
                        <IoLogIn fontSize={'3rem'}/>
                        <div>Join Game</div>
                    </motion.div>
                </div>
                <div style={{textAlign: 'center', fontSize: '0.8rem'}}>Designed by Raoul Ardy Rachim (DIA230235)</div>
            </div>
        }
        {(appState === 'create-a-game' || appState === 'login-to-a-game') &&
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '1rem',
            }}>
                {appState === 'create-a-game' && <div style={{maxWidth: 600}}>
                    <div style={{fontSize: '1.5rem'}}>
                        Let's whip up a spot to host this game, fam!
                    </div>
                    <div style={{fontSize: '0.9rem', fontStyle: 'italic', marginTop: '1rem'}}>Yo, gotta set up a spot to
                        throw down a game. Once you've got that room up and running, hit your homie up and tell 'em to
                        slide into the room you just cooked up. That way, when they hop in, they'll be linked straight
                        to your game. It's that peer-to-peer flow, so watch out for any janky connections in the mix.
                        Anyway, may the illest player take the crown!
                    </div>
                </div>}
                {appState === 'login-to-a-game' && <div style={{maxWidth: 600}}>
                    <div style={{fontSize: '1.5rem'}}>
                        Slide into the room you wanna be in, fam!
                    </div>
                    <div style={{fontSize: '0.9rem', fontStyle: 'italic', marginTop: '1rem'}}>Yo, drop your name and hit
                        that room tag. Check with your buddy for the room they've got going on their end. Keep in mind,
                        it's a peer-to-peer game, so expect some iffy connections. Anyhow, let the best player take the
                        dub!
                    </div>
                </div>}
                <input style={{textAlign: 'center',marginTop:'2rem'}} autoFocus={true} onChange={(event) => {
                    setPlayerName(event.target.value.toUpperCase());
                }} placeholder={'Drop your name, fam!'}/>
                <input style={{textAlign: 'center', marginTop: '1rem'}} onChange={(event) => {
                    setRoomName(event.target.value.toUpperCase());
                }} placeholder={'Room tag, fam!'}/>
                <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                    <motion.div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '1px solid white',
                        padding: '0.5rem 1rem',
                        borderRadius: '1rem'
                    }} onTap={() => setAppState('start')}>
                        <div>Cancel</div>
                        <IoArrowBack fontSize={'2rem'}/>
                    </motion.div>
                    <motion.div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '1px solid white',
                        padding: '0.5rem 1rem',
                        borderRadius: '1rem'
                    }} initial={{opacity: 0.1}} animate={{opacity: roomName.length > 0 ? 1 : 0.1}} onTap={() => {
                        if (roomName.length <= 0) {
                            return;
                        }
                        if (appState === 'create-a-game') {
                            createRoom();
                        }
                        if (appState === 'login-to-a-game') {
                            loginToRoom();
                        }

                    }}>
                        <div>{appState === 'create-a-game' ? "Create" : "Login"}</div>
                        <IoIosCreate fontSize={'2rem'}/>
                    </motion.div>

                </div>
            </div>}
        {(appState === 'waiting-for-opponent' || appState === 'waiting-server-to-accept') && <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                maxWidth: 600,
                justifyContent: 'center',
                padding: '2rem 2rem',
            }}>
                <motion.div style={{fontSize: '2rem'}} initial={{opacity: 0}} animate={{opacity: 1}}
                            transition={{
                                duration: 0.5, // Duration of each blink cycle
                            repeat: Infinity, // Repeat the animation indefinitely
                            repeatType: "reverse", // Reverse the animation after each cycle
                        }}>{appState === 'waiting-for-opponent' ? `Waiting for your opponent` : `Waiting for connection`}
            </motion.div>
            <div style={{fontSize: '1.2rem',fontStyle:'italic'}}>{appState === 'waiting-for-opponent' ? `Chillin', waitin' on your opponent to slide in. Tell 'em to hit up your spot with the code "${roomName}"!`: `Hold tight while we link up with the host, fam. If your buddy's already got the game rollin' "${roomName}", you'll be zapped right into it!`}</div>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                <motion.div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    border: '1px solid white',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem'
                }} onTap={() => {
                    if(appState === 'waiting-for-opponent'){
                        setAppState('create-a-game')
                    }
                    if (appState === 'waiting-server-to-accept') {
                        setAppState('login-to-a-game')
                    }
                }}>
                    <div>Cancel</div>
                    <IoArrowBack fontSize={'2rem'}/>
                </motion.div>
            </div>
            </div>
        </div>}
        {appState === 'game-is-ready' &&
            <div style={{display:'flex',flexDirection:'column',position:'relative',height:'100%'}}>
                <Game playerName={playerName} opponentName={opponentName} isHost={isHost} />
            </div>
        }

    </div>
}