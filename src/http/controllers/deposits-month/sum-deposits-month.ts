import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAddDepositMonthUseCase } from "@/use-cases/@factories/deposits-month/make-add-deposit-month-use-case";
import { makeUpdateDepositMonthUseCase } from "@/use-cases/@factories/deposits-month/make-update-deposit-month-use-case";
import { PlayerNotExistsError } from "@/use-cases/@errors/player-not-exists";
import { DepositAlreadyExist } from "@/use-cases/@errors/deposit-already-exist";
import { makeGetDepositMonthByCpfDateUseCase } from "@/use-cases/@factories/deposits-month/make-get-deposit-month-cpf-date-use-case";

export async function sumDepositsMonth(request: FastifyRequest, reply: FastifyReply) {
    const sumDepositsMonthBodySchema = z.object({
        data: z.string(),
        cpf: z.string(),
        credito: z.number()
    });

    const { data, cpf, credito } = sumDepositsMonthBodySchema.parse(request.body);

    try {
        const addDepositsMonthUseCase = makeAddDepositMonthUseCase();
        const sumDepositsMonth = makeUpdateDepositMonthUseCase();
        const getDepositMonthByCpfDate = makeGetDepositMonthByCpfDateUseCase();

        //pesquisar pelo cpf e pelo ano e mês da data e retornar o DepositsMonth
        const [_, month, year] = data.split(' ')[0].split('/');
        const time = data.split(' ')[1];
        const formattedDate = new Date(`${year}-${month}-01T${time}`);
        console.log(formattedDate);

        const getDepositMonth = await getDepositMonthByCpfDate.execute({
            cpf,
            date_deposits: formattedDate
        });
        console.log(getDepositMonth.deposit_month.id)

        //se existir, chame o sumDepositsMonth, some o valor atual mais o credito que está sendo enviado
        //e atualize o DepositsMonth
        if (getDepositMonth.deposit_month.id === '') {
            //se não existir, chame o addDepositsMonthUseCase
            const addDepositMonth = await addDepositsMonthUseCase.execute({
                cpf,
                date_deposits: formattedDate,
                valor_total_deposit: credito
            });

            return reply.status(201).send({
                message: "Depósito criado com sucesso",
                deposit_month: addDepositMonth.deposit_month
            });
        } else {
            const updateDepositMonth = await sumDepositsMonth.execute({
                cpf,
                id: getDepositMonth.deposit_month.id,
                valor_total_deposit: getDepositMonth.deposit_month.valor_total_deposit + credito
            });
    
            return reply.status(200).send({
                message: "Depósito atualizado com sucesso",
                deposit_month: updateDepositMonth.deposit_month
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
