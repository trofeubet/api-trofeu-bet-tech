import { PrismaWalletRepository } from "@/repositories/prisma/prisma-wallet-repository";
import { GetWalletByCpfUseCase } from "@/use-cases/wallet/get-wallet-by-cpf";

export function makeGetWalletByCpfUseCase(){
    const walletRepository = new PrismaWalletRepository()
    const getWalletByCpfUseCase = new GetWalletByCpfUseCase(walletRepository)

    return getWalletByCpfUseCase
}