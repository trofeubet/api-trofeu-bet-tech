import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAddTransactionsMonthUseCase } from "@/use-cases/@factories/transactions-month/make-add-transaction-month-use-case";
import { PlayerNotExistsError } from "@/use-cases/@errors/player-not-exists";
import { DepositAlreadyExist } from "@/use-cases/@errors/deposit-already-exist";
import { makeUpdateWalletUseCase } from "@/use-cases/@factories/wallet/make-update-wallet-use-case";
import { makeGetWalletByCpfUseCase } from "@/use-cases/@factories/wallet/make-get-wallet-by-cpf-use-case";
import { makeDeleteByCpfTransactionMonthUseCaseUseCase } from "@/use-cases/@factories/transactions-month/make-delete-transaction-month-cpf-use-case copy";
import { makeGetPlayerByCpfUseCase } from "@/use-cases/@factories/player/make-get-unique-player-by-cpf-use-case";

export async function createTransactionsMonth(request: FastifyRequest, reply: FastifyReply) {
    const addTransactionsMonthBodySchema = z.object({
        type_transactions: z.enum(['DEPOSIT', 'WITHDRAWALS']),
        rows: z.array(z.object({
            data: z.string(),
            cpf: z.string(),
            credito: z.number()
        }))
    });

    const { type_transactions, rows } = addTransactionsMonthBodySchema.parse(request.body);

    try {
        

        const addTransactionsMonthUseCase = makeAddTransactionsMonthUseCase();
        const updateWallet = makeUpdateWalletUseCase();
        const getWallet = makeGetWalletByCpfUseCase();
        const deleteTransactionsMonth = makeDeleteByCpfTransactionMonthUseCaseUseCase();
        const getPlayerByCpf = makeGetPlayerByCpfUseCase();

        // Objeto para armazenar os totais de cada mês por CPF
        const monthlyCredits: { [key: string]: { [cpf: string]: number } } = {};

        // Função para converter o formato de data "DD/MM/YYYY HH:MM:SS" para "YYYY-MM-DD"
        function convertToDateString(dateStr: string): string {
            const [datePart, timePart] = dateStr.split(' ');
            const [day, month, year] = datePart.split('/').map(Number);
            return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }

        // Itera sobre os objetos e agrupa por mês e ano
        for (const row of rows) {
            const { cpf, data, credito } = row;

            // Converte a string data para o formato "YYYY-MM-DD"
            const dateStr = convertToDateString(data);

            // Verifica se a data foi convertida corretamente
            if (!dateStr) {
                continue;
            }

            const [year, month, day] = dateStr.split('-');
            const monthYearKey = `${year}-${month}`;

            if (!monthlyCredits[monthYearKey]) {
                monthlyCredits[monthYearKey] = {};
            }

            if (!monthlyCredits[monthYearKey][cpf]) {
                monthlyCredits[monthYearKey][cpf] = 0;
            }
            monthlyCredits[monthYearKey][cpf] += credito;
        }

        const cpf = rows[0].cpf;
        const transactionsExistPlayer = await getPlayerByCpf.execute({cpf: cpf});
        if(transactionsExistPlayer.player.Transactions_month.length > 0) {
            await deleteTransactionsMonth.execute({
                cpf,
                type_transactions
            })
        }

        for (const [monthYear, cpfCredits] of Object.entries(monthlyCredits)) {
            const [year, month] = monthYear.split('-');
            const date_transactions = new Date(Number(year), Number(month) - 1, 1);

            for (const [cpf, totalCredit] of Object.entries(cpfCredits)) {

                await addTransactionsMonthUseCase.execute({
                    cpf,
                    date_transactions,
                    valor_total_transactions: totalCredit,
                    type_transactions
                });
            }
        }
        
        const totalTransactions = rows.length;
        const totalCredito = rows.reduce((sum, row) => sum + row.credito, 0);
        //update wallet (adicionar quantidade de transações e o valor total de deposito ou saque)
        if(type_transactions === 'DEPOSIT') {
            const wallet = await getWallet.execute({
                cpf: rows[0].cpf
            })

            await updateWallet.execute({
                id: wallet.player.Wallet?.id ?? '',
                qtd_deposits: totalTransactions,
                total_deposit_amount: totalCredito
            })
        }

        if(type_transactions === 'WITHDRAWALS') {
            const wallet = await getWallet.execute({
                cpf: rows[0].cpf
            })

            await updateWallet.execute({
                id: wallet.player.Wallet?.id ?? '',
                qtd_withdrawals: totalTransactions,
                total_withdrawals: totalCredito
            })
        }



        return reply.status(201).send({
            message: "Transações mensais registradas com sucesso.",
            totalTransactions: totalTransactions,
            totalCredito: totalCredito,
            monthlyCredits
        });

    } catch (error) {
        if (error instanceof PlayerNotExistsError || error instanceof DepositAlreadyExist) {
            return reply.status(409).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Ocorreu um erro ao processar transações" });
    }
}
