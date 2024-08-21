export class UserInactive extends Error {
    constructor() {
        super('O usuário está bloqueado, entre em contato com o setor de desenvolvimento para liberar o acesso.')
    }
}