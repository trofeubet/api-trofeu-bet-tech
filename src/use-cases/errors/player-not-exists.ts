export class PlayerNotExistsError extends Error {
    constructor() {
        super('Player não existe na base de dados')
    }
}