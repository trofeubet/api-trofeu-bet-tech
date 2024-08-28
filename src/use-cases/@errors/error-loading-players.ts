export class ErrorLoadingPlayers extends Error {
    constructor(){
        super('Error ao carregar a base de jogadores.')
    }
}