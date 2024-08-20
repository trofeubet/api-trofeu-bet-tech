export class DepositAlreadyExist extends Error {
    constructor(month: string, year: string) {
        super(`Já existe um depósito para o mês ${month} e ano ${year}`);
    }
}
