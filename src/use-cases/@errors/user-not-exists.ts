export class UserNotExistsError extends Error {
    constructor() {
        super('Usuário não existe na base de dados')
    }
}