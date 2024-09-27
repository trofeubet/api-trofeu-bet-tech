import { PlayersRepository } from "@/repositories/players-repository";
import { Player } from "@prisma/client";

interface RetornandoTodosAmountLtvUseCaseRequest {
    startDate: string;
    endDate: string;
}

interface MonthlyDepositData {
    totalAmount: number;
    depositAmountPerMonth: { [key: string]: { amount: number; percentage: number } };
}

interface RetornandoTodosAmountLtvUseCaseResponse {
    [key: string]: MonthlyDepositData;
}

export class RetornandoTodosAmountLtvUseCase {
    constructor(private playersRepository: PlayersRepository) {}

    async execute({
        startDate, endDate
    }: RetornandoTodosAmountLtvUseCaseRequest): Promise<RetornandoTodosAmountLtvUseCaseResponse> {

        const data_inicio = new Date(startDate);
        const data_fim = new Date(endDate);
        
        // Initialize response object
        const response: RetornandoTodosAmountLtvUseCaseResponse = {};

        // Iterate over each month in the date range
        const startMonth = data_inicio.getMonth();
        const startYear = data_inicio.getFullYear();
        const endMonth = data_fim.getMonth();
        const endYear = data_fim.getFullYear();

        let totalOverallAmount = 0;

        // Loop through each month in the range
        for (let year = startYear; year <= endYear; year++) {
            const monthStart = (year === startYear) ? startMonth : 0;
            const monthEnd = (year === endYear) ? endMonth : 11;

            for (let month = monthStart; month <= monthEnd; month++) {
                const startOfMonth = new Date(year, month, 1);
                const endOfMonth = new Date(year, month + 1, 0); // Last day of the month

                // Fetch players for the current month
                const { players, totalAmount, depositAmountPerMonth } = await this.playersRepository.getFullAmountByFtdDate(startOfMonth, endOfMonth);

                // Update overall total amount
                totalOverallAmount += totalAmount;

                // Store results in response
                response[new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(startOfMonth)] = {
                    totalAmount,
                    depositAmountPerMonth
                };
            }
        }

        // Calculate percentages
        for (const month in response) {
            const amount = response[month].totalAmount;
            response[month].depositAmountPerMonth = {
                ...response[month].depositAmountPerMonth,
                percentage: {
                    amount,
                    percentage: totalOverallAmount > 0 ? (amount / totalOverallAmount) * 100 : 0,
                },
            };
        }

        return response;
    }
}
