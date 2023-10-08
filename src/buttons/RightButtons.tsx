import {IoArrowUpCircle} from "react-icons/io5";
import {GiSwordSlice, GiSwordSpin} from "react-icons/gi";

export function RightButtons() {
    return <div style={{
        display: "flex",
        position: "absolute",
        top: "0",
        right: "0.5rem",
        height:'100%',
        width:'8rem',
        alignItems:'flex-end',
        paddingBottom:'3rem',
    }}>
        <div style={{
            display: "flex",
            flexWrap:'wrap'
        }}>
            <div id="up" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width:'100%',
                fontSize: "4rem"
            }}><IoArrowUpCircle/></div>
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

        </div>
    </div>;
}
