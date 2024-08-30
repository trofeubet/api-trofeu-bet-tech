import { PlayersRepository } from "@/repositories/players-repository";
import { Transactions } from "@prisma/client";

interface ChartWithdrawlDepositMonthByPlayerUseCaseRequest {
  ano?: string;
  Transactions_month: {
    id: string;
    id_player: string;
    cpf: string;
    date_transactions: Date | null;
    type_transactions: Transactions;
    valor_total_transactions: number;
    date_created: Date;
  }[];
}

interface ChartWithdrawlDepositMonthByPlayerUseCaseResponse {
  result: {
    month: string;
    deposit: number;
    withdrawals: number;
    depositTotal: number;
    withdrawalsTotal: number;
    netDeposit: number;
    depositTotalFormatted: string;
    withdrawalsTotalFormatted: string;
  }[];
}

export class ChartWithdrawlDepositMonthByPlayerUseCase {
  constructor(private playersRepository: PlayersRepository) {}

  async execute({
    ano = new Date().getFullYear().toString(),
    Transactions_month
  }: ChartWithdrawlDepositMonthByPlayerUseCaseRequest): Promise<ChartWithdrawlDepositMonthByPlayerUseCaseResponse> {

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Inicializa o resultado
    const result = Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      deposit: 0,
      withdrawals: 0,
      netDeposit: 0,
      depositTotal: 0,
      withdrawalsTotal: 0,
      depositTotalFormatted: '',
      withdrawalsTotalFormatted: ''
    }));

    // Filtra as transações para o ano fornecido
    const transactionsForYear = Transactions_month.filter(transaction =>
      transaction.date_transactions && transaction.date_transactions.getFullYear().toString() === ano
    );

    // Variáveis para os totais
    let depositTotal = 0;
    let withdrawalsTotal = 0;

    if (transactionsForYear.length === 0) {
      return { result };
    }

    transactionsForYear.forEach(transaction => {
      const month = transaction.date_transactions!.getMonth(); // Pega o mês (0 = janeiro, 11 = dezembro)
      const valor = transaction.valor_total_transactions;

      if (transaction.type_transactions === "DEPOSIT") {
        result[month].deposit += valor;
        depositTotal += valor;
      } else if (transaction.type_transactions === "WITHDRAWALS") {
        result[month].withdrawals += valor;
        withdrawalsTotal += valor;
      }

      result[month].netDeposit = result[month].deposit - result[month].withdrawals;
    });

    // Atualiza os totais e formata os valores para BRL
    result.forEach(monthData => {
      monthData.depositTotal = depositTotal;
      monthData.withdrawalsTotal = withdrawalsTotal;
      monthData.depositTotalFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(depositTotal);
      monthData.withdrawalsTotalFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(withdrawalsTotal);
    });

    return { result };
  }
}
