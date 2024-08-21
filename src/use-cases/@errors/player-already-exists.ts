export class PlayerAlreadyExistsError extends Error {
    constructor() {
        super('Player already exists')
    }
}