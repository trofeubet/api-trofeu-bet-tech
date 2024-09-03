export class ErrorLoadingUsers extends Error {
    constructor(){
        super('Error ao carregar a base de usuários.')
    }
}