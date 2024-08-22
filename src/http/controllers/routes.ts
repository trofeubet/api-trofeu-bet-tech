import { FastifyInstance } from "fastify";
import { registerUser } from "./user/register";
import { authenticateUser } from "./user/authenticate";
import { addPlayer } from "./player/add-player";
import { verifyJwt } from "../middlewares/verify-jwt";
import { createTransactionsMonth } from "./transactions-month/create-transactions-month."
import { sumTransactionsMonth } from "./transactions-month/sum-transactions-month";

export async function appRoutes(app: FastifyInstance) {
    app.post('/users', registerUser)
    app.post('/sessions', authenticateUser)

    //precisa estar autenticado para acessar
    app.post('/add_player', { onRequest: [verifyJwt]}, addPlayer)
    app.post('/add_transactions_month', { onRequest: [verifyJwt]}, createTransactionsMonth)
    app.post('/sum_transactions_month', { onRequest: [verifyJwt]}, sumTransactionsMonth)

}