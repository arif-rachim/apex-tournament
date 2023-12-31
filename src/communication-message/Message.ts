export interface Message{
    type: 'right-is-down' | 'left-is-down' | 'up-is-down' | 'down-is-down' | 'did-press-jump' | 'did-press-heavy-attack' | 'did-press-light-attack' | 'character-position' | 'attacked',
    value?: boolean,
    x?: number,
    y?: number,
    score?: {
        host: number,
        guest: number
    }
}