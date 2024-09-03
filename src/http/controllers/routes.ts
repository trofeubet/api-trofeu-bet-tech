import { FastifyInstance } from "fastify";
import { registerUser } from "./user/register";
import { authenticateUser } from "./user/authenticate";
import { addPlayer } from "./player/add-player";
import { verifyJwt } from "../middlewares/verify-jwt";
import { createTransactionsMonth } from "./transactions-month/create-transactions-month."
import { sumTransactionsMonth } from "./transactions-month/sum-transactions-month";
import { updateUser } from "./user/update";
import { getPlayers } from "./player/get-players";
import { getUniquePlayer } from "./player/get-player-unique";
import { chartWithdrawalDepositMonthByPlayer } from "./player/chart-withdrawal-deposit-month-by-player";
import { getUsers } from "./user/get-users";
import { getProfile } from "./user/profile";

export async function appRoutes(app: FastifyInstance) {
    app.post('/users', registerUser)
    app.post('/sessions', authenticateUser)

    //precisa estar autenticado para acessar
    app.post('/add_player', { onRequest: [verifyJwt]}, addPlayer)
    app.post('/add_transactions_month', { onRequest: [verifyJwt]}, createTransactionsMonth)
    app.post('/sum_transactions_month', { onRequest: [verifyJwt]}, sumTransactionsMonth)

    //user
    app.get('/me', { onRequest: [verifyJwt] }, getProfile);
    app.put('/updateUser', { onRequest: [verifyJwt] }, updateUser);

    //players
    app.post('/get_players', { onRequest: [verifyJwt] }, getPlayers);
    app.get('/players/:id', { onRequest: [verifyJwt] }, getUniquePlayer);
    app.post('/relatorio_mensal_transacoes_by_player', { onRequest: [verifyJwt] }, chartWithdrawalDepositMonthByPlayer);

    //users
    app.post('/get_users', { onRequest: [verifyJwt] }, getUsers);
}