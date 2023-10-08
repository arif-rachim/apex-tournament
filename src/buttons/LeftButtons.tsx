import {motion} from "framer-motion";
import {IoArrowBackCircle, IoArrowDownCircle, IoArrowForwardCircle} from "react-icons/io5";

export function LeftButtons() {
    return <div style={{
        display: "flex",
        position: "absolute",
        top: "0",
        left: "0.5rem",
        height: '100%',
        alignItems:'flex-end',
        paddingBottom:'3rem',
        gap: "0.5rem"
    }}>
        <div style={{
            display: "flex",
            flexDirection: "row",
            position: "relative",
            width: '8rem',
            flexWrap: 'wrap'
        }}>

            <motion.div id="left" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                width: '50%'
            }} whileTap={{scale:0.95}}>
                <IoArrowBackCircle/>
            </motion.div>
            <motion.div id="right" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                width: '50%'
            }}  whileTap={{scale:0.95}}><IoArrowForwardCircle/></motion.div>
            <motion.div id="down" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                width: '100%'
            }}  whileTap={{scale:0.95}}><IoArrowDownCircle/></motion.div>
        </div>
    </div>;
}
