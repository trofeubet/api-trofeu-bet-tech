import { PrismaWalletRepository } from "@/repositories/prisma/prisma-wallet-repository";
import { UpdateWalletUseCase } from "@/use-cases/wallet/update-wallet";

export function makeUpdateWalletUseCase(){
    const walletRepository = new PrismaWalletRepository()
    const updateWalletUseCase = new UpdateWalletUseCase(walletRepository)

    return updateWalletUseCase
}