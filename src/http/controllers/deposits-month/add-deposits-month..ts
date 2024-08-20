import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAddDepositMonthUseCase } from "@/use-cases/factories/deposits-month/make-add-deposit-month-use-case";
import { PlayerNotExistsError } from "@/use-cases/errors/player-not-exists";
import { DepositAlreadyExist } from "@/use-cases/errors/deposit-already-exist";

export async function addDepositsMonth(request: FastifyRequest, reply: FastifyReply) {
    const addDepositsMonthBodySchema = z.object({
        rows: z.array(z.object({
            data: z.string(),
            cpf: z.string(),
            credito: z.number()
        }))
    });

    const { rows } = addDepositsMonthBodySchema.parse(request.body);

    try {
        const addDepositsMonthUseCase = makeAddDepositMonthUseCase();

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
                // console.error(`Data inválida: ${data}`);
                continue;
            }

            // Formata para "YYYY-MM" para agrupar por mês e ano
            const [year, month, day] = dateStr.split('-');
            const monthYearKey = `${year}-${month}`;

            // Inicializa o objeto para o CPF se ainda não existir
            if (!monthlyCredits[monthYearKey]) {
                monthlyCredits[monthYearKey] = {};
            }

            // Soma os créditos para o CPF e mês correspondente
            if (!monthlyCredits[monthYearKey][cpf]) {
                monthlyCredits[monthYearKey][cpf] = 0;
            }
            monthlyCredits[monthYearKey][cpf] += credito;

            // Logs para verificação do estado atual
            // console.log(`Row: ${JSON.stringify(row)}`);
            // console.log(`MonthYearKey: ${monthYearKey}, CPF: ${cpf}, Total Credit: ${monthlyCredits[monthYearKey][cpf]}`);
        }

        // Log para depuração final
        //console.log("Monthly Credits Final:", JSON.stringify(monthlyCredits, null, 2));

        // Agora, insere cada total mensal no banco de dados
        for (const [monthYear, cpfCredits] of Object.entries(monthlyCredits)) {
            const [year, month] = monthYear.split('-');
            const date_deposits = new Date(Number(year), Number(month) - 1, 1); // Ajuste para a data correta do mês

            for (const [cpf, totalCredit] of Object.entries(cpfCredits)) {
                //console.log(`Inserting for CPF ${cpf}, Date: ${date_deposits.toISOString()}, Total Credit: ${totalCredit}`);
                await addDepositsMonthUseCase.execute({
                    cpf,
                    date_deposits,
                    valor_total_deposit: totalCredit
                });
            }
        }

        return reply.status(201).send({
            message: "Depósitos mensais registrados com sucesso",
            monthlyCredits
        });

    } catch (error) {
        if (error instanceof PlayerNotExistsError || error instanceof DepositAlreadyExist) {
            return reply.status(409).send({ message: error.message });
        }

        // Para erros não previstos, retorna um erro genérico
        console.error("Error:", error);
        return reply.status(500).send({ message: "Ocorreu um erro ao processar os depósitos" });
    }
}
