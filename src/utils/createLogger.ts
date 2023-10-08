export function createLogger(name:string) {
    return function log(...args:any[]){
        console.log(`[${name}]`,`[${hhmmss(new Date)}]`,...args)
    }
}
function hhmmss(date:Date){
    return pad(date.getHours())+':'+pad(date.getMinutes())+':'+pad(date.getSeconds())
}
function pad(number:number){
    if(Math.abs(number) <=9){
        return `0${Math.abs(number)}`;
    }
    return Math.abs(number).toString()
}