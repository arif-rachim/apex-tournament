type Transitions = Record<string, { from: string | string[] | '*', to: string }>
type Method<T> = {
    [k in `when${Capitalize<keyof T>}`] : () => void
}
type Predicate<T> = {
    [k in `isOn${Capitalize<keyof T>}State`] : () => boolean
}
type Value<V> = V extends {to:infer C} ? C : never;
type State<T> = T extends Record<string, infer V> ? Value<V> : never;
export function createStateMachine<T extends Transitions,M extends Method<T>,P extends Predicate<T>>(initial:State<T>,transitions: T, methods:M,predicates:P) {

    let currentState = initial;
    function toCapitalize(text:string){
        return text.charAt(0).toUpperCase()+text.substring(1,text.length);
    }
    function isOn(key:keyof T){
        return predicates[`isOn${toCapitalize(key)}State`]()
    }

    function is(key:State<T>){
        return currentState === key
    }
    function getTransitions():Array<keyof T>{
        return Object.keys(transitions).filter(transitionKey => {
            const transition = transitions[transitionKey];
            let from:Array<any> = [];
            if(Array.isArray(transition.from)){
                from = transition.from
            }else{
                from.push(transition.from);
            }

            return (from.indexOf(currentState) >= 0 || transition.from ==='*') && (transition.to !== currentState);
        })
    }
    function move(key:keyof T){
        if(getTransitions().indexOf(key) >= 0){
            const transition = transitions[key];
            const nextState = transition.to as State<T>;
            listeners.filter(i => i.event === 'beforeStateChange').forEach(i => i.callback(currentState,nextState));
            const method = `when${toCapitalize(key)}`;
            methods[method]();
            listeners.filter(i => i.event === 'afterStateChange').forEach(i => i.callback(currentState,nextState));
            currentState = nextState;
        }
    }
    const listeners:Array<{event:'beforeStateChange'|'afterStateChange',callback:(from:State<T>,to:State<T>)=>void}> = [];
    function addListener(event:'beforeStateChange'|'afterStateChange',callback:(from:State<T>,to:State<T>) => void){
        const type = {event,callback}
        listeners.push(type);
        return function removeListener(){
            listeners.splice(listeners.indexOf(type),1);
        }
    }
    return {
        addListener,
        getTransitions,
        isOn,
        is,
        move
    };
}

//
const transitions = {
    jump : {
        from : 'standing',
        to : 'jumping'
    },
    flip : {
        from : 'jumping',
        to : 'flipping'
    },
    fall : {
        from : ['flipping','jumping','standing'],
        to :'falling'
    },
    recover : {
        from : 'falling',
        to : 'standing'
    }
} as const

type D = State<typeof transitions>