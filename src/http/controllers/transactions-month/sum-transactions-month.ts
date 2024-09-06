import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAddTransactionsMonthUseCase } from "@/use-cases/@factories/transactions-month/make-add-transaction-month-use-case";
import { makeUpdateTransactionMonthUseCase } from "@/use-cases/@factories/transactions-month/make-update-transaction-month-use-case";
import { PlayerNotExistsError } from "@/use-cases/@errors/player-not-exists";
import { DepositAlreadyExist } from "@/use-cases/@errors/deposit-already-exist";
import { makeGetTransactionsMonthByCpfDateUseCase } from "@/use-cases/@factories/transactions-month/make-get-transaction-month-cpf-date-use-case";
import { Transactions } from "@prisma/client";
import { makeGetWalletByCpfUseCase } from "@/use-cases/@factories/wallet/make-get-wallet-by-cpf-use-case";
import { makeUpdateWalletUseCase } from "@/use-cases/@factories/wallet/make-update-wallet-use-case";

export async function sumTransactionsMonth(request: FastifyRequest, reply: FastifyReply) {
    const sumTransactionsMonthBodySchema = z.object({
        data: z.string(),
        cpf: z.string(),
        credito: z.number(),
        type_transactions: z.enum(['DEPOSIT', 'WITHDRAWALS'])
    });
    const { data, cpf, credito, type_transactions } = sumTransactionsMonthBodySchema.parse(request.body);

    try {
        const addTransactionsMonthUseCase = makeAddTransactionsMonthUseCase();
        const sumTransactionsMonth = makeUpdateTransactionMonthUseCase();
        const getTransactionsMonthByCpfDate = makeGetTransactionsMonthByCpfDateUseCase();
        const getWalletByCpfUseCase = makeGetWalletByCpfUseCase();
        const updateWalletUseCase = makeUpdateWalletUseCase();

        //pesquisar pelo cpf e pelo ano e mês da data e retornar o TransactionsMonth
        const [_, month, year] = data.split(' ')[0].split('/');
        const time = data.split(' ')[1];
        const formattedDate = new Date(`${year}-${month}-01T${time}`);
        //console.log(formattedDate);

        const mappedTransactionType = type_transactions === 'DEPOSIT' 
            ? Transactions.DEPOSIT 
            : Transactions.WITHDRAWALS;

        const getTransactionsMonth = await getTransactionsMonthByCpfDate.execute({
            cpf,
            date_transactions: formattedDate,
            type_transactions: mappedTransactionType
        });
        //console.log(getTransactionsMonth.transaction_month.id)

        if (getTransactionsMonth.transaction_month.id === '') {
            //se não existir, chame o addDepositsMonthUseCase
            const addTransactionMonth = await addTransactionsMonthUseCase.execute({
                cpf,
                date_transactions: formattedDate,
                type_transactions,
                valor_total_transactions: credito
            });

            //atualize a wallet
            const getWalletByCpf = await getWalletByCpfUseCase.execute({ cpf });
            if(type_transactions === "DEPOSIT") {
                await updateWalletUseCase.execute({
                    id: getWalletByCpf.player.Wallet?.id ?? '',
                    qtd_deposits: (getWalletByCpf.player.Wallet?.qtd_deposits ?? 0) + 1,
                    total_deposit_amount: (getWalletByCpf.player.Wallet?.total_deposit_amount ?? 0) + credito
                })
            }

            if(type_transactions === "WITHDRAWALS") {
                await updateWalletUseCase.execute({
                    id: getWalletByCpf.player.Wallet?.id ?? '',
                    qtd_withdrawals: (getWalletByCpf.player.Wallet?.qtd_withdrawals ?? 0) + 1,
                    total_withdrawals: (getWalletByCpf.player.Wallet?.total_withdrawals ?? 0) + credito
                })
            }

            return reply.status(201).send({
                message: "Transação criada com sucesso",
                transaction_month: addTransactionMonth.transactions_month
            });
        } else {
            //se existir, chame o sumDepositsMonth, some o valor atual mais o credito que está sendo enviado
            //e atualize o DepositsMonth
            const updateTransactionsMonth = await sumTransactionsMonth.execute({
                cpf,
                id: getTransactionsMonth.transaction_month.id,
                valor_total_transactions: getTransactionsMonth.transaction_month.valor_total_transactions + credito
            });

            //também atualize a WALLET
            const getWalletByCpf = await getWalletByCpfUseCase.execute({ cpf });
            if(type_transactions === "DEPOSIT") {
                await updateWalletUseCase.execute({
                    id: getWalletByCpf.player.Wallet?.id ?? '',
                    qtd_deposits: (getWalletByCpf.player.Wallet?.qtd_deposits ?? 0) + 1,
                    total_deposit_amount: (getWalletByCpf.player.Wallet?.total_deposit_amount ?? 0) + credito
                })
                const ftdDate = getWalletByCpf.player.Wallet?.ftd_date;
                const referenceDate = new Date("1000-01-01T23:59:59.000Z");

                if (ftdDate?.getTime() === referenceDate.getTime()) {
                    await updateWalletUseCase.execute({
                        id: getWalletByCpf.player.Wallet?.id ?? '',
                        ftd_date: formattedDate
                    });
                }
            }

            if(type_transactions === "WITHDRAWALS") {
                console.log(getWalletByCpf.player.Wallet?.id ?? '')
                await updateWalletUseCase.execute({
                    id: getWalletByCpf.player.Wallet?.id ?? '',
                    qtd_withdrawals: (getWalletByCpf.player.Wallet?.qtd_withdrawals ?? 0) + 1,
                    total_withdrawals: (getWalletByCpf.player.Wallet?.total_withdrawals ?? 0) + credito
                })
            }
    
            return reply.status(200).send({
                message: "Transação atualizada com sucesso",
                transaction_month: updateTransactionsMonth.transaction_month
            })
        }
        

    } catch (error) {
        if (error instanceof PlayerNotExistsError || error instanceof DepositAlreadyExist) {
            return reply.status(409).send({ message: error.message });
        }

        // Para erros não previstos, retorna um erro genérico
        console.error("Error:", error);
        return reply.status(500).send({ message: "Ocorreu um erro ao processar os depósitos" });
    }
}
